import './VirtualList.css';
import { ReactNode, useRef } from 'react';

import useContainerDimensions from '@/hooks/useContainerDimensions';
import useQueryCached from '@/hooks/useQueryCached';
import useScrollLeft from '@/hooks/useScrollLeft';

export default function VirtualSvgList({
  count,
  itemWidth,
  itemComponent,
  getQuery,
  rowKey,
}: {
  count: number;
  itemWidth: number;
  itemComponent: (data: string | undefined) => ReactNode;
  getQuery: (index: number, count: number) => [string | null, string];
  rowKey: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const scrollLeft = useScrollLeft(ref);
  const { width } = useContainerDimensions(ref);

  // display an extra on each side to avoid flickering
  const renderCount = Math.ceil(width / itemWidth + 3);
  const indexDisplacement = Math.max(
    Math.floor((scrollLeft ?? 0) / itemWidth) - 1,
    0
  );
  const firstItemDisplacement = indexDisplacement * itemWidth;

  const [key, query] = getQuery(indexDisplacement, renderCount);
  const data = useQueryCached(key, query);
  const items = data ? data.map((d: any) => d[rowKey]) : [];

  return (
    <div className="w-full overflow-auto always-scrollbar" ref={ref}>
      <svg width={count * itemWidth} height="45px">
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
