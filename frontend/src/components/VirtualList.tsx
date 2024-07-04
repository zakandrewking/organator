import { ReactNode, useRef } from 'react';

import useContainerDimensions from '@/hooks/useContainerDimensions';
import useScrollLeft from '@/hooks/useScrollLeft';

export default function VirtualSvgList({
  count,
  itemWidth,
  getItem,
}: {
  count: number;
  itemWidth: number;
  getItem: (i: number) => ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const scrollLeft = useScrollLeft(ref);
  const { width } = useContainerDimensions(ref);

  // display an extra on each side to avoid flickering
  const renderCount = width / itemWidth + 3;
  const indexDisplacement = Math.max(
    Math.floor((scrollLeft ?? 0) / itemWidth) - 1,
    0
  );
  const firstItemDisplacement = indexDisplacement * itemWidth;

  return (
    <div className="w-full overflow-auto" ref={ref}>
      <svg width={count * itemWidth} height="40px">
        {Array.from({ length: renderCount }).map((_, i) => (
          <g
            transform={`translate(${
              i * itemWidth + firstItemDisplacement
            }, 20)`}
            key={i}
          >
            {getItem(i + indexDisplacement)}
          </g>
        ))}
      </svg>
    </div>
  );
}
