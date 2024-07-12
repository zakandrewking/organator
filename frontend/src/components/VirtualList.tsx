import "./VirtualList.css";
import { ReactNode, RefObject, useRef } from "react";

import useContainerDimensions from "@/hooks/useContainerDimensions";
import useScrollLeft from "@/hooks/useScrollLeft";

export default function VirtualSvgList({
  count,
  itemWidth,
  Item,
  ItemLoader,
}: {
  count: number;
  itemWidth: number;
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

  return (
    <div className="w-full overflow-auto always-scrollbar" ref={ref}>
      <ItemLoader index={indexDisplacement} count={renderCount}>
        {(items) => (
          <svg width={count * itemWidth} height="85px">
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
