import { RefObject, useEffect, useState } from "react";

export default function useScrollLeft(ref: RefObject<HTMLDivElement>) {
  const [scrollLeft, setScrollLeft] = useState<number | null>(null);

  useEffect(() => {
    const getScrollLeft = () => {
      return ref.current?.scrollLeft ?? null;
    };

    setScrollLeft(getScrollLeft());

    const handleScroll = () => {
      setScrollLeft(getScrollLeft());
    };

    const thisRef = ref.current;
    thisRef?.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      thisRef?.removeEventListener("scroll", handleScroll);
    };
  }, [ref]);

  return scrollLeft;
}
