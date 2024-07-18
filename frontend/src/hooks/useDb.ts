/**
 * Consider using OPFS instead of IndexedDB if we ever need writes
 * https://www.notion.so/blog/how-we-sped-up-notion-in-the-browser-with-wasm-sqlite
 */

import { useContext, useEffect } from "react";
import useSWRImmutable from "swr/immutable";

import { basePath } from "@/config";
import { DbStoreContext } from "@/stores/DbStore";

import useIndexedDb from "./useIndexedDb";
import useSqlite3 from "./useSqlite3";

export default function useDb() {
  const { state, dispatch } = useContext(DbStoreContext);
  const sqlite3 = useSqlite3();
  const { readFile, createFile, idb } = useIndexedDb("db");

  const { data: dbNotSaved } = useSWRImmutable(
    idb && sqlite3 ? "/saved-db" : null,
    async () => {
      dispatch({ status: "checking idb" });
      const data = await readFile();
      if (!data) {
        console.log("no data in idb");
        dispatch({ status: "idle" });
        return true;
      }
      dispatch({ status: "loading_idb" });
      console.log("Loading SQLite DB from IndexedDB");
      await createDb(data);
      return false;
    }
  );

  const createDb = async (dbData: any) => {
    if (!dbData) {
      console.log("dbData is null or undefined");
      return;
    }
    if (!sqlite3) {
      console.log("sqlite3 is not ready");
      return;
    }

    dispatch({ status: "creating db" });

    const p = sqlite3.wasm.allocFromTypedArray(dbData);
    const db = new sqlite3.oo1.DB();
    const rc = sqlite3.capi.sqlite3_deserialize(
      db.pointer,
      "main",
      p,
      dbData.byteLength,
      dbData.byteLength,
      sqlite3.capi.SQLITE_DESERIALIZE_FREEONCLOSE
    );
    db.checkRc(rc);
    dispatch({ db, status: "ready" });
  };

  const handleStart = async () => {
    if (state.db) {
      throw new Error("db already set");
    }

    if (!sqlite3) {
      throw new Error("sqlite3 is not ready");
    }

    dispatch({ status: "downloading" });

    const downloadUrl = `${basePath}/GCF_000002765.6.db`;

    let bytes = 0;

    const response = await fetch(downloadUrl);
    const body = response.body;
    const length = response.headers.get("Content-Length");
    if (!length) {
      throw Error("Content-Length header is missing.");
    }
    if (!body) {
      throw Error("Response body is null.");
    }
    let data = new Uint8Array(Number(length));

    const reader = body.getReader();
    reader.read().then(function processText({ done, value }) {
      if (done) {
        createFile(data);
        dispatch({ status: "done downloading", progress: 100 });
        createDb(data);
        return;
      }
      if (!length) {
        throw Error("Content-Length header is missing.");
      }
      dispatch({ status: "downloading" });
      if (value) {
        data.set(value, bytes);
        bytes += value.length;
        // TODO https://stackoverflow.com/a/72903731/1118565 is length the right
        // denominator?
        dispatch({ progress: (bytes / Number(length)) * 100 });
      }
      reader.read().then(processText);
    });
  };

  const canStart =
    sqlite3 && !state.db && state.status === "idle" && dbNotSaved;

  return {
    ...state,
    handleStart,
    canStart,
  };
}
