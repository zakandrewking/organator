import Link from 'next/link';
import { useEffect, useState } from 'react';
import useSWR, { mutate } from 'swr';
import useSWRImmutable from 'swr/immutable';

import { Button } from '@/components/ui/button';
import { List, ListItem, ListItemContent } from '@/components/ui/list';
import { Stack } from '@/components/ui/stack';
import { H3 } from '@/components/ui/typography';
import useDb from '@/hooks/useDb';

export default function Main() {
  const { db } = useDb();

  // TODO wrap in a hook
  const { data: first10Genes, mutate: first10GenesMutate } = useSWRImmutable(
    "/first10Genes",
    () => {
      // push to the end of the event loop
      setTimeout(() => {
        db.exec({
          sql: "select * from features limit 10",
          rowMode: "object",
          callback: function (row: any) {
            // pull out attributes
            row["attributes"] = JSON.parse(row["attributes"]);
            mutate(
              "/first10Genes",
              (prev: any) => (prev ? [...prev, row] : [row]),
              // must not revalidate or we get an infinite loop
              { revalidate: false }
            );
          },
        });
      });
      // this needs to get set in the cache before the above code runs
      return [];
    }
  );

  return (
    <>
      <H3>Plasmodium falciparum (Malaria) Genes - first 10</H3>
      <List>
        <div></div>
        {first10Genes &&
          first10Genes.map((gene: any) => (
            <ListItem key={gene.id}>
              <ListItemContent href={`/gene?id=${encodeURI(gene.id)}`}>
                <Stack direction="col" alignItems="start" gap={0}>
                  <div>ID: {gene.id}</div>
                  <div>
                    Loc: {gene.start} - {gene.end}
                  </div>
                  <div>Strand: {gene.strand}</div>
                  <div>Product: {gene.attributes.product}</div>
                </Stack>
              </ListItemContent>
            </ListItem>
          ))}
      </List>
    </>
  );
}
