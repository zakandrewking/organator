"use client";

import { useMemo, useState } from "react";
import useSWRImmutable from "swr/immutable";

import { useScript } from "../hooks/useScript";

function useSqlite() {
  const sqliteStatus = useScript("/jswasm/sqlite3.js");

  const { data: sqlite } = useSWRImmutable(
    sqliteStatus === "ready" ? "/sqlite" : null,
    async () => {
      return await new Promise((resolve) => {
        (window as any).sqlite3InitModule().then(function (sqlite: any) {
          resolve(sqlite);
        });
      });
    }
  );

  return { sqlite };
}

export default function Home() {
  const { sqlite } = useSqlite();
  const [db, setDb] = useState<Uint8Array | null>(null);

  console.log(sqlite);

  async function handleStart() {
    const downloadUrl = "/GCF_000002765.3.db";

    let bytes = 0;

    const response = await fetch(downloadUrl);
    const body = response.body;
    if (!body) {
      throw Error("Response body is null.");
    }
    const reader = body.getReader();
    reader.read().then(function processText({ done, value }) {
      if (done) {
        console.log("Stream complete");
        return;
      }
      if (value) {
        bytes += value.length;
        console.log("Received " + bytes + " bytes");
      }
      reader.read().then(processText);
    });
  }

  return (
    <main>
      <button onClick={handleStart}>Start</button>
    </main>
  );
}
