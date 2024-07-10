"use client";

// use d3 for this if we need nice transitions at it ends up beeing a lot of
// boilerplate https://www.react-graph-gallery.com/build-axis-with-react

// zoom
// https://observablehq.com/@d3/programmatic-zoom

import { scaleLinear } from 'd3-scale';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import * as R from 'remeda';

import { Button } from '@/components/ui/button';
import Container from '@/components/ui/container';
import { Stack } from '@/components/ui/stack';
import { H2, H3 } from '@/components/ui/typography';
import VirtualList from '@/components/VirtualList';
import useQueryCached from '@/hooks/useQueryCached';

const tickLength = 6;
const pixelsPerTick = 100;
const itemLength = 771;
const seqLength = 80;

function Item(sequence: string | undefined) {
  return (
    <>
      <text fill="hsl(var(--foreground))" className="font-mono">
        {sequence}
      </text>
      <g transform="translate(0, 20)">
        <path
          d={["M", 0, 0, "L", itemLength, 0].join(" ")}
          stroke="hsl(var(--foreground))"
        />
      </g>
    </>
  );
}

export default function Browse() {
  const seqIdsResult = useQueryCached(
    "/features?unique=seqid",
    "select distinct seqid from features"
  ) as { seqid: string }[] | undefined;

  const [seqId, setSeqId] = useState<string | undefined>();

  const sequenceCountResult = useQueryCached(
    seqId ? `/sequenceCount?seqId=${seqId}` : null,
    `select count(*) as count from sequences where seqid = '${seqId}'`
  ) as { count: number }[] | undefined;
  const sequenceCount = R.pathOr(sequenceCountResult, [0, "count"], 0);

  // select the first chromosome
  useEffect(() => {
    const firstSeqId = R.pathOr(seqIdsResult, [0, "seqid"], "");
    console.log({ firstSeqId, seqId, seqIdsResult });
    if (firstSeqId !== "" && seqId === undefined) {
      setSeqId(firstSeqId);
    }
  }, [seqId, seqIdsResult]);

  // const xScale = scaleLinear().domain([0, seq.length]).range([0, 1000]);

  // const range = xScale.range();

  // const ticks = useMemo(() => {
  //   const width = range[1] - range[0];
  //   const numberOfTicksTarget = Math.floor(width / pixelsPerTick);

  //   return xScale.ticks(numberOfTicksTarget).map((value) => ({
  //     value,
  //     xOffset: xScale(value),
  //   }));
  // }, [range, xScale]);

  const handleZoomIn = () => {
    // handle zoom in logic here
  };

  const handleZoomOut = () => {
    // handle zoom out logic here
  };

  const handleRandom = () => {
    // handle random logic here
  };

  const handleReset = () => {
    // handle reset logic here
  };

  const getQuery = (index: number, count: number): [string, string] => [
    `/q?i=${index}&s=${count}`,
    `select * from sequences limit ${count} offset ${index}`,
  ];

  return (
    <Container>
      <Button asChild>
        <Link href="/">{"<"} Genes</Link>
      </Button>
      <H2>Browse</H2>

      <div>Chromosome Number: TODO</div>
      <div>
        Chromosome RefSeq ID:{" "}
        <Button variant="link" asChild className="p-1">
          {/* TODO ExternalLink component */}
          <Link
            href={`https://www.ncbi.nlm.nih.gov/nuccore/${seqId}/`}
            target="_blank"
          >
            {seqId}
          </Link>
        </Button>
      </div>
      <div className="mb-6">Length: {(sequenceCount * seqLength) / 1e6} Mb</div>

      <Stack gap={2} direction="row" className="mb-6">
        <Button size="sm" onClick={handleZoomIn}>
          Zoom In
        </Button>
        <Button size="sm" onClick={handleZoomOut}>
          Zoom Out
        </Button>
        <Button size="sm" onClick={handleRandom}>
          Random
        </Button>
        <Button size="sm" onClick={handleReset}>
          Reset
        </Button>
      </Stack>
      <VirtualList
        count={sequenceCount}
        itemWidth={itemLength}
        itemComponent={Item}
        getQuery={getQuery}
        rowKey="seq"
      />
      <svg className="w-full">
        <g transform={`translate(0, 20)`} width="100%"></g>
        <g transform={`translate(5, 40)`}>
          <text
            y="15"
            fill="hsl(var(--foreground))"
            fontSize={12}
            textLength="100%"
          >
            {/* {seq} */}
          </text>
          {/* <g transform={`translate(0, 20)`}>
            <path
              d={["M", range[0], 0, "L", range[1], 0].join(" ")}
              stroke="hsl(var(--foreground))"
            />
            {ticks.map(({ value, xOffset }) => (
              <g key={value} transform={`translate(${xOffset}, 0)`}>
                <line y2={tickLength} stroke="currentColor" />
                <text
                  key={value}
                  style={{
                    fontSize: "10px",
                    textAnchor: "middle",
                    transform: "translateY(20px)",
                  }}
                  fill={"hsl(var(--foreground))"}
                >
                  {value}
                </text>
              </g>
            ))}
          </g> */}
        </g>
      </svg>
    </Container>
  );
}
