import { mutate } from "swr";
import useSWRImmutable from "swr/immutable";

import useDb from "./useDb";

export default function useQuery(
  name: string | null,
  sql: string,
  transform?: (row: any) => any
): any {
  const { db } = useDb();

  const { data } = useSWRImmutable(name, () => {
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
