import { FeatureWithIndex, Sequence } from "@/stores/BrowserStore";

import { itemLength, pxPerBp, seqLength } from "./config";

/**
 * Draw the sequence and features
 */
export default function Item({
  data,
  itemConfig,
}: {
  data?:
    | {
        sequence: Sequence;
        features: FeatureWithIndex[];
      }
    | undefined;
  itemConfig:
    | {
        scale: number;
      }
    | undefined;
}) {
  const scale = itemConfig?.scale ?? 1;
  const itemWidthScaled = itemLength * scale;
  return (
    <>
      {scale >= 1 && (
        <text
          fill="hsl(var(--foreground))"
          className="font-mono select-none"
          textLength={itemWidthScaled}
        >
          {data?.sequence.seq}
        </text>
      )}
      <g transform="translate(0, 20)">
        <path
          d={["M", 0, 0, "L", itemWidthScaled, 0].join(" ")}
          stroke="hsl(var(--foreground))"
        />
      </g>
      <g transform="translate(0, 30)">
        {data?.features.map((f) => (
          <Feature
            key={f.id}
            feature={f}
            start={data.sequence.start}
            scale={scale}
          />
        ))}
      </g>
    </>
  );
}

function Feature({
  feature,
  start,
  scale,
}: {
  feature: FeatureWithIndex;
  start: number;
  scale: number;
}) {
  const itemWidthScaled = itemLength * scale;
  const startPx =
    feature.start < start ? 0 : (feature.start - start - 1) * pxPerBp * scale;
  const endPx =
    feature.end > start + seqLength
      ? itemWidthScaled
      : (feature.end - start) * pxPerBp * scale;
  const widthPx = endPx - startPx;

  const color =
    feature.featuretype === "gene"
      ? "hsl(var(--color-gene))"
      : "hsl(var(--foreground))";

  return (
    <g
      key={feature.id}
      transform={`translate(${startPx}, ${20 * feature.index})`}
    >
      <rect width={widthPx} height="15" fill={color} opacity="0.5" />
      {scale >= 0.2 && (
        <text
          x={0}
          y={10}
          fill="hsl(var(--background))"
          className="font-mono select-none text-xs"
        >
          {feature.id}
        </text>
      )}
    </g>
  );
}
