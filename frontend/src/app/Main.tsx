import Link from 'next/link';
import { useEffect, useState } from 'react';
import useSWR from 'swr';
import useSWRImmutable from 'swr/immutable';

import { Button } from '@/components/ui/button';
import { Stack } from '@/components/ui/stack';
import { H3 } from '@/components/ui/typography';
import useDb from '@/hooks/useDb';

export default function Main() {
  const { db } = useDb();

  // TODO wrap in a hook
  const [first10GenesState, setFirst10GenesState] = useState<any[] | null>(
    null
  );
  const { data: first10Genes, mutate: first10GenesMutate } = useSWRImmutable(
    "/first10Genes",
    () => {
      db.exec({
        sql: "select * from features limit 10",
        rowMode: "object",
        callback: function (row: any) {
          setFirst10GenesState((prev) => (prev ? [...prev, row] : [row]));
        },
      });
      return first10GenesState;
    }
  );
  useEffect(() => {
    if (!first10Genes && first10GenesState) {
      first10GenesMutate(first10GenesState, { revalidate: false });
    }
  }, [first10GenesState, first10GenesMutate, first10Genes]);

  return (
    <div>
      <H3>Plasmodium falciparum (Malaria) Genes - first 10</H3>
      <Stack direction="col" gap={2} alignItems="start">
        <div></div>
        {first10Genes &&
          first10Genes.map((gene: any) => (
            <Button variant="link" asChild key={gene.id}>
              <Link href={`/gene?id=${encodeURI(gene.id)}`}>{gene.id}</Link>
            </Button>
          ))}
      </Stack>
    </div>
  );
}
