import { bpPerItemUnscaled, itemWidthPx, seqSize } from "@/lib/browserConfig";
import { Chromosome, FeatureWithIndex, Sequence } from "@/stores/BrowserStore";

/**
 * Draw the sequence and features
 */
export default function Item({
  data,
  itemConfig,
}: {
  data?: {
    sequence: Sequence;
    features: FeatureWithIndex[];
  };
  itemConfig?: {
    scale: number;
    chromosome: Chromosome;
  };
}) {
  const scale = itemConfig?.scale ?? 1;
  return (
    <>
      {scale >= 1 && (
        <text
          fill="hsl(var(--foreground))"
          className="font-mono select-none"
          textLength={`${itemWidthPx}px`}
        >
          {data?.sequence.seq}
        </text>
      )}
      <g transform="translate(0, 20)">
        <path
          d={["M", 0, 0, "L", itemWidthPx, 0].join(" ")}
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
  const bpPerItem = bpPerItemUnscaled / scale;
  const pxPerBp = itemWidthPx / bpPerItem;
  const startPx = feature.start < start ? 0 : (feature.start - start) * pxPerBp;
  const endPx =
    feature.end >= start + bpPerItem
      ? itemWidthPx
      : (feature.end - start) * pxPerBp;
  const widthPx = endPx - startPx;

  const color =
    feature.featuretype === "gene"
      ? "hsl(var(--color-gene))"
      : "hsl(var(--foreground))";

  return (
    <g
      key={feature.id}
      transform={`translate(${startPx}, ${20 * feature.vertical})`}
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
