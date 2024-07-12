"use client";

// TODO use indexedDb to store the data
// TODO github pages version is not keeping state between pages

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useContext } from 'react';

import { Button } from '@/components/ui/button';
import Container from '@/components/ui/container';
import { List, ListItem, ListItemContent } from '@/components/ui/list';
import { Stack } from '@/components/ui/stack';
import { H3, H4 } from '@/components/ui/typography';
import useQueryCached from '@/hooks/useQueryCached';
import { DbStoreContext } from '@/stores/DbStore';

export default function Main() {
  const searchParams = useSearchParams();
  const { state } = useContext(DbStoreContext);

  const page = Number(searchParams.get("page")) || 1;

  const first10Genes = useQueryCached(
    `/first10Genes?page=${page}`,
    `select * from features limit 10 offset ${(page - 1) * 10}`,
    (row) => {
      row["attributes"] = JSON.parse(row["attributes"]);
      return row;
    }
  );

  const geneCount = useQueryCached(
    "/geneCount",
    "select count(*) as count from features"
  );

  return (
    <Container gap={4}>
      <H3 gutterBottom={false}>Plasmodium falciparum (Malaria) Genes</H3>
      <Stack direction="row" gap={2}>
        <Button asChild>
          <Link href="/browse">Genome Browser</Link>
        </Button>
        <Button asChild>
          <Link href="/downloads">Downloads</Link>
        </Button>
      </Stack>
      <H4>Total Genes: {geneCount && geneCount[0].count}</H4>
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
        <Stack
          direction="row"
          gap={2}
          justifyContent="between"
          className="w-full mt-4"
        >
          <Button asChild>
            <Link href={page > 1 ? `/?page=${page - 1}` : ""}>
              Previous Page
            </Link>
          </Button>
          <div>Page: {page}</div>
          <Button asChild>
            <Link href={`/?page=${page + 1}`}>Next Page</Link>
          </Button>
        </Stack>
      </List>
    </Container>
  );
}
