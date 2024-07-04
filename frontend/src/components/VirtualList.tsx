import { ReactNode } from 'react';

export default function VirtualSvgList({
  count,
  itemWidth,
  width,
  getItem,
}: {
  count: number;
  itemWidth: number;
  width: number;
  getItem: (i: number) => ReactNode;
}) {
  // display an extra on each side to avoid flickering
  const renderCount = width / itemWidth + 2;

  return (
    <g width={width}>
      <g width={count * itemWidth}>
        {Array.from({ length: renderCount }).map((_, i) => (
          <g transform={`translate(${i * itemWidth}, 0)`} key={i}>
            {getItem(i)}
          </g>
        ))}
      </g>
    </g>
  );
}
