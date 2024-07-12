"use client";

import Link from 'next/link';
import React, { ReactNode, useEffect, useRef, useState } from 'react';
import * as R from 'remeda';

import { Button } from '@/components/ui/button';
import Container from '@/components/ui/container';
import { Input } from '@/components/ui/input';
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import { Stack } from '@/components/ui/stack';
import { H2 } from '@/components/ui/typography';
import VirtualList, { VirtualListRef } from '@/components/VirtualList';
import useQueryCached from '@/hooks/useQueryCached';

const tickLength = 6;
const seqLength = 80;
const pxPerBp = 9.65; // at zoom 1
const itemLength = seqLength * pxPerBp; // at zoom 1

interface Chromosome {
  refSeqId: string;
  chromosomeNumber: number;
  seqid: string;
}

interface Sequence {
  seq: string;
  seqid: string;
  start: number;
}

interface Feature {
  attributes: string;
  bin: number;
  end: number;
  extra: string;
  featuretype: string;
  frame: string;
  id: string;
  score: string;
  seqid: string;
  source: string;
  start: number;
  strand: string;
}

interface FeatureWithIndex extends Feature {
  index: number;
}

/**
 * Get sequence and feature data in chunks from the database
 */
const useDataHook = (index: number, count: number, chromosome?: Chromosome) => {
  // get sequences in this chunk
  const data = useQueryCached(
    chromosome ? `/q?i=${index}&s=${count}&seqid=${chromosome?.seqid}` : null,
    `select * from sequences where seqid='${chromosome?.seqid}' limit ${count} offset ${index}`
  ) as Sequence[] | undefined;

  // get all features in this chunk
  const features = useQueryCached(
    chromosome
      ? `/features?i=${index}&s=${count}&seqid=${chromosome.seqid}`
      : null,
    `select * from features where seqid='${chromosome?.seqid}' and start <= ${
      (index + count) * seqLength
    } and end >= ${index * seqLength}`
  ) as Feature[] | undefined;

  // the vertical index of the features should be consistent, so we need to set
  // it up here
  const featuresWithIndex = features?.map((f, i) => ({
    ...f,
    index: i,
  }));

  const items = data
    ? data.map((s) => ({
        sequence: s,
        features:
          featuresWithIndex?.filter(
            (f: any) => f.start < s.start + seqLength && f.end > s.start
          ) ?? [],
      }))
    : [];
  return items;
};

export default function Browse() {
  const [scale, setScale] = useState(1);
  const [bpOffset, setBpOffset] = useState(0);
  const [bpPerTick, setBpPerTick] = useState(100);

  // location
  const [location, setLocation] = useState("");
  const virtualListRef = useRef<VirtualListRef>(null);

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

  // --------
  // Handlers
  // --------

  const handleZoomIn = () => {
    setScale((prev) => scale * 2);
  };

  const handleZoomOut = () => {
    setScale((prev) => scale / 2);
  };

  const handleReset = () => {
    setScale(1);
  };

  // ---------------
  // Computed values
  // ---------------

  const itemWidthScaled = itemLength * scale;

  const handleScrollToLocation = () => {
    const locationNumber = parseInt(location, 10);
    if (
      isNaN(locationNumber) ||
      locationNumber < 0 ||
      locationNumber >= sequenceCount * seqLength
    ) {
      // TODO switch to a toast
      alert("Please enter a valid location within the chromosome range.");
      return;
    }
    const index = locationNumber / seqLength;
    if (virtualListRef.current) {
      virtualListRef.current.scrollToItem(index);
    }
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

  /**
   * Draw the sequence and features
   */
  const Item = ({
    data,
  }: {
    data?: {
      sequence: Sequence;
      features: FeatureWithIndex[];
    };
  }) => (
    <>
      <text
        fill="hsl(var(--foreground))"
        className="font-mono select-none"
        textLength={itemWidthScaled}
      >
        {data?.sequence.seq}
      </text>
      <g transform="translate(0, 20)">
        <path
          d={["M", 0, 0, "L", itemWidthScaled, 0].join(" ")}
          stroke="hsl(var(--foreground))"
        />
      </g>
      <g transform="translate(0, 30)">
        {data?.features.map((f) => {
          const startPx =
            f.start < data.sequence.start
              ? 0
              : (f.start - data.sequence.start - 1) * pxPerBp * scale;
          const endPx =
            f.end > data.sequence.start + seqLength
              ? itemWidthScaled
              : (f.end - data.sequence.start) * pxPerBp * scale;
          const widthPx = endPx - startPx;
          return (
            <g key={f.id} transform={`translate(${startPx}, ${20 * f.index})`}>
              <rect
                width={widthPx}
                height="15"
                fill="hsl(var(--foreground))"
                opacity="0.5"
              />
              <text
                x={0}
                y={10}
                fill="hsl(var(--background))"
                className="font-mono select-none text-xs"
              >
                {f.id}
              </text>
            </g>
          );
        })}
      </g>
    </>
  );

  return (
    <Container>
      <Button asChild>
        <Link href="/">{"<"} Genes</Link>
      </Button>
      <H2>Plasmodium falciparum (Malaria) Genome</H2>

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

      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleScrollToLocation();
        }}
      >
        <Stack gap={2} direction="row" className="mb-6">
          <Input
            type="number"
            placeholder="Enter location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-40"
          />
          <Button size="sm" type="submit">
            Go to Location
          </Button>
        </Stack>
      </form>

      <VirtualList
        ref={virtualListRef}
        count={sequenceCount}
        height={200}
        itemWidth={itemWidthScaled}
        Item={Item}
        ItemLoader={ItemLoader}
      />
    </Container>
  );
}
