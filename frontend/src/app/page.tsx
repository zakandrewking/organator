"use client";

import useSWRImmutable from "swr/immutable";

import { useScript } from "./useScript";

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

  console.log(sqlite);

  return <main>hello world</main>;
}
