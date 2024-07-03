import { useContext } from "react";

import { basePath } from "@/config";
import { DbStoreContext } from "@/stores/DbStore";

import useSqlite3 from "./useSqlite3";

export default function useDb() {
  const { state, dispatch } = useContext(DbStoreContext);
  const sqlite3 = useSqlite3();

  const createDb = async (dbData: any) => {
    if (!dbData) {
      throw Error("dbData is null or undefined");
    }
    if (!sqlite3) {
      throw Error("sqlite3 is not ready");
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
        console.log("Stream complete");
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

  return {
    ...state,
    handleStart,
    canStart: sqlite3 && !state.db && state.status === "idle",
  };
}
