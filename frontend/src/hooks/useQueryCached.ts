import { mutate } from 'swr';
import useSWRImmutable from 'swr/immutable';

import useDb from './useDb';

/**
 * Query SQLite database and cache the result. Useful for queries that are
 * need synchronous data the second time, e.g. for scroll restoration.
 */
export default function useQueryCached(
  name: string | null,
  sql: string,
  transform?: (row: any) => any
): any {
  const { db } = useDb();

  const { data } = useSWRImmutable<any>(name, () => {
    // timeout for SWR hack
    setTimeout(() => {
      db.exec({
        sql,
        rowMode: "object",
        callback: function (row: any) {
          if (transform) {
            row = transform(row);
          }
          mutate(name, (prev: any) => (prev ? [...prev, row] : [row]), {
            revalidate: false,
          });
        },
      });
    });
  });
  return data;
}
