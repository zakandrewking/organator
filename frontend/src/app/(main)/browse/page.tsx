"use client";

import { scaleLinear } from "d3-scale";
import { useMemo } from "react";

import { Button } from "@/components/ui/button";
import Container from "@/components/ui/container";
import { Stack } from "@/components/ui/stack";
import { H2, H3 } from "@/components/ui/typography";
import useQuery from "@/hooks/useQuery";

const TICK_LENGTH = 6;
const pixelsPerTick = 100;

export default function Browse() {
  const sequences = useQuery("/browse", "select * from sequences limit 1");

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

  // LEFT OFF zoom
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

  return (
    <Container>
      <H2>Browse</H2>
      <H3>Genes</H3>
      <Stack gap={2} direction="row" className="mb-6">
        <Button onClick={handleZoomIn}>Zoom In</Button>
        <Button onClick={handleZoomOut}>Zoom Out</Button>
        <Button onClick={handleRandom}>Random</Button>
        <Button onClick={handleReset}>Reset</Button>
      </Stack>
      <svg className="w-full">
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
          ))}{" "}
        </g>
      </svg>
    </Container>
  );
}
