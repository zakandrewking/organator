import './VirtualList.css';
import { ReactNode, useRef } from 'react';

import useContainerDimensions from '@/hooks/useContainerDimensions';
import useScrollLeft from '@/hooks/useScrollLeft';

export default function VirtualSvgList({
  count,
  itemWidth,
  itemComponent,
  useDataHook,
}: {
  count: number;
  itemWidth: number;
  itemComponent: (data: any | undefined) => ReactNode;
  useDataHook: (index: number, count: number) => any[];
}) {
  const ref = useRef<HTMLDivElement>(null);
  const scrollLeft = useScrollLeft(ref);
  const { width } = useContainerDimensions(ref);

  // display an extra component on each side to avoid flickering
  const renderCount = Math.ceil(width / itemWidth + 3);
  const indexDisplacement = Math.max(
    Math.floor((scrollLeft ?? 0) / itemWidth) - 1,
    0
  );
  const firstItemDisplacement = indexDisplacement * itemWidth;

  const items = useDataHook(indexDisplacement, renderCount);

  return (
    <div className="w-full overflow-auto always-scrollbar" ref={ref}>
      <svg width={count * itemWidth} height="85px">
        {Array.from({ length: renderCount }).map((_, i) => (
          <g
            transform={`translate(${
              i * itemWidth + firstItemDisplacement
            }, 20)`}
            key={i}
          >
            {itemComponent(items[i])}
          </g>
        ))}
      </svg>
    </div>
  );
}
