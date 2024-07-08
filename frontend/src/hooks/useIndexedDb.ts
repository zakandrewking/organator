import { useEffect, useState } from 'react';
import useSWRImmutable from 'swr/immutable';

/***
 * This file is used to create a custom hook to interact with IndexedDB.
 */
export default function useIndexedDb(fileName: string) {
  const { data: idb } = useSWRImmutable(
    "/idb",
    () =>
      new Promise<IDBDatabase>((resolve, reject) => {
        console.log("Opening indexedDB", fileName);
        const request = indexedDB.open(fileName, 1);

        request.onerror = () => {
          console.error("Error opening IndexedDB");
          reject();
        };

        request.onsuccess = () => {
          const idb = request.result;
          resolve(idb);
        };

        request.onupgradeneeded = (event) => {
          const db = (event.target as any).result as IDBDatabase;
          db.createObjectStore(fileName, { autoIncrement: true });
        };
      })
  );

  const readFile = () => {
    console.log("Reading file from indexedDB");
    return new Promise((resolve, reject) => {
      if (!idb) {
        throw Error("no database");
      }
      const transaction = idb.transaction([fileName], "readonly");
      const store = transaction.objectStore(fileName);
      const req = store.get(1);
      req.onerror = (e) => {
        console.error("Error getting file", e);
        reject();
      };
      req.onsuccess = () => {
        const f = req.result;
        console.log("File loaded from indexedDB");
        resolve(f);
      };
    });
  };

  const deleteFile = async () =>
    new Promise<void>((resolve, reject) => {
      if (!idb) {
        throw Error("no database");
      }
      const transaction = idb.transaction([fileName], "readwrite");
      const store = transaction.objectStore(fileName);
      store.delete(1);

      transaction.oncomplete = () => {
        console.log("Done deleting from indexedDB");
        resolve();
      };

      transaction.onerror = (event) => {
        console.error("Error deleting file", event);
        reject(event);
      };
    });

  const createFile = (data: any) => {
    if (!idb) {
      throw Error("no database");
    }
    if (!data) {
      throw Error("no data");
    }

    const transaction = idb.transaction([fileName], "readwrite");
    const store = transaction.objectStore(fileName);

    store.put(data, 1);

    transaction.oncomplete = () => {
      console.log("Done saving to indexedDB");
    };

    transaction.onerror = (event) => {
      console.error("Error saving file", event);
    };
  };

  const hasFile = async () => {
    return true;
  };

  return { readFile, createFile, deleteFile, hasFile, idb };
}
