"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import Container from "@/components/ui/container";
import { Stack } from "@/components/ui/stack";
import { H3, H4 } from "@/components/ui/typography";
import useQueryCached from "@/hooks/useQueryCached";

const maxRows = 1000;
const rowLen = 80;

export default function Gene() {
  const searchParams = useSearchParams();

  const geneRows = useQueryCached(
    `/gene?id=${searchParams.get("id")}`,
    `select * from features where id = '${searchParams.get("id")}'`,
    (row: any) => {
      row["attributes"] = JSON.parse(row["attributes"]);
      return row;
    }
  );
  const gene = geneRows && geneRows[0];

  const sequenceRaw = useQueryCached(
    gene && `/sequence?id=${searchParams.get("id")}`,
    `select * from sequences
     where seqid = '${gene && gene.seqid}' and
     start >= ${gene && gene.start - rowLen} and
     start <= ${gene && gene.end}
     limit ${maxRows}`
  );

  const maxedOut = sequenceRaw && sequenceRaw.length === maxRows;

  const sequenceFirstTrim =
    sequenceRaw &&
    sequenceRaw.map((seq: any, i: number) => {
      return {
        ...seq,
        seq: i === 0 ? seq.seq.slice(gene.start - seq.start) : seq.seq,
      };
    });
  const sequence =
    sequenceFirstTrim &&
    sequenceFirstTrim.map((seq: any, i: number) => {
      return {
        ...seq,
        seq:
          i === sequenceFirstTrim.length - 1
            ? seq.seq.slice(0, gene.end - seq.start + 1)
            : seq.seq,
      };
    });

  return (
    <Container>
      <Button asChild className="mb-6">
        <Link href="/">{"<"} Genes</Link>
      </Button>
      <H3>Gene: {searchParams.get("id")}</H3>
      <H4>
        Loc: {gene && gene.start} - {gene && gene.end}
      </H4>
      <H4>
        Sequence {maxedOut && `(Maxed out at ${rowLen * maxRows} basepairs)`}
      </H4>
      <Stack direction="col" gap={2} alignItems="start" className="font-mono">
        {sequence &&
          sequence.map((seq: any, i: number) => <div key={i}>{seq.seq}</div>)}
        {maxedOut && (
          <div>... Maxed out at {rowLen * maxRows} basepairs ...</div>
        )}
      </Stack>
    </Container>
  );
}
