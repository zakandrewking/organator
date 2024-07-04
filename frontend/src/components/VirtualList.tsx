import { ReactNode, useRef, useState } from 'react';

import useScrollLeft from '@/hooks/useScrollLeft';

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
  const ref = useRef<HTMLDivElement>(null);
  const scrollLeft = useScrollLeft(ref);

  // display an extra on each side to avoid flickering
  const renderCount = width / itemWidth + 2;

  return (
    <div className="w-full overflow-auto" ref={ref}>
      <svg width={count * itemWidth} height="40px">
        {Array.from({ length: renderCount }).map((_, i) => (
          <g transform={`translate(${i * itemWidth}, 20)`} key={i}>
            {getItem(i)}
          </g>
        ))}
      </svg>
    </div>
  );
}
