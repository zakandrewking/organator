import useSWRImmutable from 'swr/immutable';

import { basePath } from '@/config';

import { useScript } from './useScript';

export default function useSqlite3() {
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

  return sqlite3;
}
