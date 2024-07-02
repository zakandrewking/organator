import { useState } from "react";

// use a singleton for simplicity
let dbGlobal: any = null;

export default function useDb() {
  const [db, setDb] = useState<any>(dbGlobal);
  return {
    db,
    setDb: (db: any) => {
      if (dbGlobal) {
        throw new Error("db already set");
      }
      dbGlobal = db;
      setDb(db);
    },
  };
}
