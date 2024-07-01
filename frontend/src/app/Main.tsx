import { useState } from 'react';
import useSWRImmutable from 'swr/immutable';

import { H1, H3 } from '@/components/ui/typography';

export default function Main({ db }: { db: any }) {
  const [first10Genes, setFirst10Genes] = useState<any[]>([]);

  useSWRImmutable("/first-10-genes", async () => {
    return await new Promise((resolve) => {
      db.exec({
        sql: "SELECT * from features limit 10",
        rowMode: "object",
        callback: function (row: any) {
          setFirst10Genes((prev: any) => [...prev, row]);
        },
      });
    });
    return null;
  });

  return (
    <div>
      <H3>Plasmodium falciparum (Malaria) Genes - first 10</H3>
      {first10Genes.map((gene: any) => (
        <div key={gene.id}>{gene.id}</div>
      ))}
    </div>
  );
}
