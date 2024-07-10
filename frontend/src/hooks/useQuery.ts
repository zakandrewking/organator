// import { useState } from 'react';

// import { useAsyncEffect } from './useAsyncEffect';
// import useDb from './useDb';

// /**
//  * Query SQLite database and do not cache the result. Avoids unnecessary
//  * memory usage for cases when async results are OK.
//  */
// export default function useQuery(
//   sql: string,
//   transform?: (row: any) => any
// ): any {
//   const { db } = useDb();
//   const [result, setResult] = useState<any>(null);

//   useAsyncEffect(
//     async () => {
//       db.exec({
//         sql,
//         rowMode: "object",
//         callback: function (row: any) {
//           if (transform) {
//             row = transform(row);
//           }
//           // TODO not sure this is really possible without SWR b/c we need to append to the array
//           // ... when does useState get re-initialized?
//           // what if we used useMemo with the length of the result array as the
//           // dependency?
//           setResult(row);
//         },
//       });
//     },
//     async () => {},
//     [setResult, db]
//   );

//   return result;
// }
