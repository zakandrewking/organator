import './VirtualList.css';
import { forwardRef, ReactNode, useImperativeHandle, useRef } from 'react';

import useContainerDimensions from '@/hooks/useContainerDimensions';
import useScrollLeft from '@/hooks/useScrollLeft';

interface VirtualListProps {
  count: number;
  itemWidth: number;
  height: number;
  Item: (data: any | undefined) => ReactNode;
  ItemLoader: ({
    index,
    count,
    children,
  }: {
    index: number;
    count: number;
    children: (items: any) => ReactNode;
  }) => ReactNode;
}

export interface VirtualListRef {
  scrollToItem: (index: number) => void;
}

const VirtualList = forwardRef<VirtualListRef, VirtualListProps>(
  ({ count, itemWidth, height, Item, ItemLoader }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const scrollLeft = useScrollLeft(containerRef);
    const { width } = useContainerDimensions(containerRef);

    useImperativeHandle(ref, () => ({
      scrollToItem: (index: number) => {
        if (containerRef.current) {
          containerRef.current.scrollLeft = index * itemWidth;
        }
      },
    }));

    // display an extra component on each side to avoid flickering
    const renderCount = Math.ceil(width / itemWidth + 3);
    const indexDisplacement = Math.max(
      Math.floor((scrollLeft ?? 0) / itemWidth) - 1,
      0
    );
    const firstItemDisplacement = indexDisplacement * itemWidth;

    return (
      <div className="w-full overflow-auto always-scrollbar" ref={containerRef}>
        <ItemLoader index={indexDisplacement} count={renderCount}>
          {(items) => (
            <svg width={count * itemWidth} height={`${height}px`}>
              {Array.from({ length: renderCount }).map((_, i) => (
                <g
                  transform={`translate(${
                    i * itemWidth + firstItemDisplacement
                  }, 20)`}
                  key={i}
                >
                  {Item({ data: items[i] })}
                </g>
              ))}
            </svg>
          )}
        </ItemLoader>
      </div>
    );
  }
);

VirtualList.displayName = "VirtualList";

export default VirtualList;
