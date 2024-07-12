"use client";

import Link from "next/link";
import React, { ReactNode, RefObject, useEffect, useState } from "react";
import * as R from "remeda";

import { Button } from "@/components/ui/button";
import Container from "@/components/ui/container";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Stack } from "@/components/ui/stack";
import { H2 } from "@/components/ui/typography";
import VirtualList from "@/components/VirtualList";
import useQueryCached from "@/hooks/useQueryCached";

const tickLength = 6;
const seqLength = 80;
const pxPerBp = 9.65; // at zoom 1
const itemLength = seqLength * pxPerBp;

interface Chromosome {
  refSeqId: string;
  chromosomeNumber: number;
  seqid: string;
}

const useDataHook = (index: number, count: number, chromosome?: Chromosome) => {
  const data = useQueryCached(
    chromosome ? `/q?i=${index}&s=${count}&seqid=${chromosome?.seqid}` : null,
    `select * from sequences where seqid='${chromosome?.seqid}' limit ${count} offset ${index}`
  );
  const features = useQueryCached(
    chromosome
      ? `/features?i=${index}&s=${count}&seqid=${chromosome.seqid}`
      : null,
    `select * from features where seqid='${chromosome?.seqid}' and start < ${
      index * seqLength + count
    } and end > ${index * seqLength}`
  );
  const items = data
    ? data.map((d: any) => ({
        sequence: d.seq,
        features: features?.filter(
          (f: any) => f.start < d.start + seqLength && f.end > d.start
        ),
      }))
    : [];
  return items;
};

export default function Browse() {
  const [scale, setScale] = useState(1);
  const [bpOffset, setBpOffset] = useState(0);
  const [bpPerTick, setBpPerTick] = useState(100);

  const chromosomeResult = useQueryCached(
    "/features?unique=seqid",
    "select seqid, attributes from features group by seqid having min(rowid) order by rowid",
    (row: any) => {
      row["refSeqId"] = row["seqid"];
      row["chromosomeNumber"] = Number(
        JSON.parse(row["attributes"])["chromosome"]
      );
      delete row["attributes"];
      return row;
    }
  ) as Chromosome[] | undefined;

  const [chromosome, setChromosome] = useState<Chromosome | undefined>();

  const sequenceCountResult = useQueryCached(
    chromosome ? `/sequenceCount?seqId=${chromosome.seqid}` : null,
    `select count(*) as count from sequences where seqid = '${chromosome?.seqid}'`
  ) as { count: number }[] | undefined;
  const sequenceCount = R.pathOr(sequenceCountResult, [0, "count"], 0);

  // select the first chromosome
  useEffect(() => {
    const firstChromosome = chromosomeResult?.[0];
    if (firstChromosome && !chromosome) {
      setChromosome(firstChromosome);
    }
  }, [chromosome, chromosomeResult]);

  const handleZoomIn = () => {
    setScale((prev) => scale / 2);
  };

  const handleZoomOut = () => {
    setScale((prev) => scale * 2);
  };

  const handleReset = () => {
    setScale(1);
  };

  const ItemLoader = ({
    index,
    count,
    children,
  }: {
    index: number;
    count: number;
    children: (items: any) => ReactNode;
  }) => {
    const items = useDataHook(index, count, chromosome);
    return <>{children(items)}</>;
  };

  const Item = ({
    data,
  }: {
    data?: {
      sequence: string | undefined;
      features: any;
    };
  }) => (
    <>
      <text
        fill="hsl(var(--foreground))"
        className="font-mono select-none"
        textLength={itemLength * scale}
      >
        {data?.sequence}
      </text>
      <g transform="translate(0, 20)">
        <path
          d={["M", 0, 0, "L", itemLength * scale, 0].join(" ")}
          stroke="hsl(var(--foreground))"
        />
      </g>
      <g transform="translate(0, 40)" fill="hsl(var(--foreground))">
        <text>{data?.features?.length}</text>
      </g>
    </>
  );

  return (
    <Container>
      <Button asChild>
        <Link href="/">{"<"} Genes</Link>
      </Button>
      <H2>Browse</H2>

      <Select
        value={chromosome?.seqid}
        onValueChange={(value) => {
          const selected = chromosomeResult?.find((c) => c.seqid === value);
          if (selected) setChromosome(selected);
        }}
      >
        <SelectTrigger className="w-[200px] mb-4">
          <SelectValue placeholder="Select Chromosome" />
        </SelectTrigger>
        <SelectContent>
          {chromosomeResult?.map((c) => (
            <SelectItem key={c.seqid} value={c.seqid}>
              Chromosome {c.chromosomeNumber}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div>Chromosome Number: {chromosome?.chromosomeNumber}</div>
      <div>
        Chromosome RefSeq ID:{" "}
        <Button variant="link" asChild className="p-1">
          <Link
            href={`https://www.ncbi.nlm.nih.gov/nuccore/${chromosome?.refSeqId}/`}
            target="_blank"
          >
            {chromosome?.refSeqId}
          </Link>
        </Button>
      </div>
      <div className="mb-6">
        Length: {((sequenceCount * seqLength) / 1e6).toFixed(3)} Mb
      </div>

      <Stack gap={2} direction="row" className="mb-6">
        <Button size="sm" onClick={handleZoomIn}>
          Zoom In
        </Button>
        <Button size="sm" onClick={handleZoomOut}>
          Zoom Out
        </Button>
        <Button size="sm" onClick={handleReset}>
          Reset
        </Button>
      </Stack>
      <VirtualList
        count={sequenceCount}
        itemWidth={itemLength * scale}
        Item={Item}
        ItemLoader={ItemLoader}
      />
    </Container>
  );
}
