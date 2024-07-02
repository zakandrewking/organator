"use client";

import { useState } from "react";
import useSWRImmutable from "swr/immutable";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { H3 } from "@/components/ui/typography";
import { basePath } from "@/config";
import useDb from "@/hooks/useDb";

import { useScript } from "../hooks/useScript";
import Main from "./Main";

function useSqlite3() {
  const sqliteStatus = useScript(`${basePath}/jswasm/sqlite3.js`);

  const { data: sqlite3 } = useSWRImmutable(
    sqliteStatus === "ready" ? "/sqlite3" : null,
    async (): Promise<any> => {
      return await new Promise((resolve) => {
        (window as any).sqlite3InitModule().then(function (sqlite3: any) {
          resolve(sqlite3);
        });
      });
    }
  );

  return { sqlite3 };
}

export default function Home() {
  const { sqlite3 } = useSqlite3();
  const [dbData, setDbData] = useState<Uint8Array | null>(null);
  const { db, setDb } = useDb();

  const [didStart, setDidStart] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("idle");

  async function handleStart() {
    setDidStart(true);

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
        setDbData(data);
        setProgress(100);
        setStatus("ready");
        return;
      }
      if (!length) {
        throw Error("Content-Length header is missing.");
      }
      setStatus("downloading");
      if (value) {
        data.set(value, bytes);
        bytes += value.length;
        // TODO https://stackoverflow.com/a/72903731/1118565 is length the right
        // denominator?
        setProgress((bytes / Number(length)) * 100);
      }
      reader.read().then(processText);
    });
  }

  useSWRImmutable(dbData && sqlite3 && !db ? "/db" : null, async () => {
    if (!dbData || !sqlite3) {
      throw Error("dbData or sqlite3 is null.");
    }
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
    setDb(db);
    return db;
  });

  return (
    <main className="p-4 flex flex-col gap-2">
      {db ? (
        <Main />
      ) : (
        <>
          <H3>
            This will load a 70MB sqlite database into memory -- use with
            caution!
          </H3>
          <div>
            <Button onClick={handleStart} disabled={didStart}>
              Start
            </Button>
          </div>
          <Progress value={progress} className="max-w-64" />
          {status}
        </>
      )}
    </main>
  );
}
