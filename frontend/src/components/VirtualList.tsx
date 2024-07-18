import './VirtualList.css';
import * as R from 'remeda';
import {
    forwardRef, ReactNode, useCallback, useEffect, useImperativeHandle, useRef, useState
} from 'react';

import useContainerDimensions from '@/hooks/useContainerDimensions';
import useDebounce from '@/hooks/useDebounce';
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
  onUserScroll?: (index: number) => void; // can be float
}

export interface VirtualListRef {
  scrollToItem: (index: number) => void; // can be float
}

const VirtualList = forwardRef<VirtualListRef, VirtualListProps>(
  ({ count, itemWidth, height, Item, ItemLoader, onUserScroll }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const scrollLeft = useScrollLeft(containerRef);
    const { width } = useContainerDimensions(containerRef);
    const [locationOnToggle, setLocationOnToggle] = useState(true);

    // when the user stops scrolling, then set the location
    useEffect(() => {
      onUserScroll?.((scrollLeft ?? 0) / itemWidth);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [locationOnToggle]);

    const debouncedOnUserScroll = useDebounce(() =>
      setLocationOnToggle((prev) => !prev)
    );

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
      <div
        className="w-full overflow-auto always-scrollbar"
        ref={containerRef}
        onScroll={() => debouncedOnUserScroll.call()}
      >
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
