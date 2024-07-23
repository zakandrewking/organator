import { ReactNode } from "react";

import useDataHook from "@/hooks/useDataHook";
import { Chromosome } from "@/stores/BrowserStore";

export default function ItemLoader({
  index,
  count,
  children,
  itemConfig,
}: {
  index: number;
  count: number;
  children: (items: any) => ReactNode;
  itemConfig?: {
    scale: number;
    chromosome: Chromosome;
  };
}) {
  const items = useDataHook(
    index,
    count,
    itemConfig?.scale,
    itemConfig?.chromosome
  );
  return <>{children(items)}</>;
}
