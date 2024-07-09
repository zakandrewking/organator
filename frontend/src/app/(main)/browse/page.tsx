"use client";
import { scaleLinear } from 'd3-scale';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import * as R from 'remeda';

import { Button } from '@/components/ui/button';
import Container from '@/components/ui/container';
import { Stack } from '@/components/ui/stack';
import { H2, H3 } from '@/components/ui/typography';
import VirtualList from '@/components/VirtualList';
import useQuery from '@/hooks/useQuery';
import useQueryCached from '@/hooks/useQueryCached';

const TICK_LENGTH = 6;
const pixelsPerTick = 100;

function Item(i: number) {
  // const itemResult = useQuery(`select * from sequences limit 1 offset ${i}`);
  // console.log(itemResult);
  const seq = "abc";
  return (
    <>
      <text fill="hsl(var(--foreground))">{seq}</text>
      <g transform="translate(0, 20)">
        <path
          d={["M", 0, 0, "L", 200, 0].join(" ")}
          stroke="hsl(var(--foreground))"
        />
      </g>
    </>
  );
}

export default function Browse() {
  const i = 1;
  const itemResult = useQuery(`select * from sequences limit 1 offset ${i}`);
  const seqx = R.pathOr(itemResult, ["seq"], "");
  console.log(itemResult, seqx);

  // const chromosomesResult = useQueryCached(
  //   "/chromosomes",
  //   "select * from chromosomes"
  // );

  const [seqId, setSeqId] = useState<string | null>(null);
  const sequenceCountResult = useQueryCached(
    seqId ? `/sequenceCount?seqId=${seqId}` : null,
    "select count(*) as count from sequences"
  );
  const sequenceCount = sequenceCountResult
    ? (sequenceCountResult[0].count as number)
    : null;

  const sequences = useQueryCached(
    "/browse",
    "select * from sequences limit 1"
  );

  // // select the first chromosome
  // useEffect(() => {
  //   const firstSeqId = chromosomesResult && chromosomesResult[0].seqId;
  //   if (firstSeqId && seqId === null) {
  //     setSeqId(firstSeqId);
  //   }
  // }, [chromosomesResult, seqId]);

  const seq = !sequences ? "" : sequences.map((seq: any) => seq.seq).join("");

  const xScale = scaleLinear().domain([0, seq.length]).range([0, 1000]);

  const range = xScale.range();

  const ticks = useMemo(() => {
    const width = range[1] - range[0];
    const numberOfTicksTarget = Math.floor(width / pixelsPerTick);

    return xScale.ticks(numberOfTicksTarget).map((value) => ({
      value,
      xOffset: xScale(value),
    }));
  }, [range, xScale]);

  // use d3 for this if we need nice transitions at it ends up beeing a lot of
  // boilerplate https://www.react-graph-gallery.com/build-axis-with-react

  // zoom
  // https://observablehq.com/@d3/programmatic-zoom

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

  const loadItem = (page: number, size: number) => {
    // has to be async because sqlite does not haver a sync api
    console.log("load more items", page, size);
  };

  return (
    <Container>
      <Button asChild>
        <Link href="/">{"<"} Genes</Link>
      </Button>
      <H2>Browse</H2>
      <H3>Genes</H3>
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
      <VirtualList count={100} itemWidth={200} itemComponent={Item} />
      <svg className="w-full">
        <g transform={`translate(0, 20)`} width="100%"></g>
        <g transform={`translate(5, 40)`}>
          <text
            y="15"
            fill="hsl(var(--foreground))"
            fontSize={12}
            textLength="100%"
          >
            {seq}
          </text>
          <g transform={`translate(0, 20)`}>
            <path
              d={["M", range[0], 0, "L", range[1], 0].join(" ")}
              stroke="hsl(var(--foreground))"
            />
            {ticks.map(({ value, xOffset }) => (
              <g key={value} transform={`translate(${xOffset}, 0)`}>
                <line y2={TICK_LENGTH} stroke="currentColor" />
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
          </g>
        </g>
      </svg>
    </Container>
  );
}
