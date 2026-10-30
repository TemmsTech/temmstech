"use client";

import { useEffect, useState, type RefObject } from "react";

export function useShowcasePlayback(
  ref: RefObject<HTMLElement | null>,
  enabled: boolean,
  count: number,
  delay: number,
) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const element = ref.current;
    if (!element || !enabled || count < 2) return;
    let visible = false;
    let timer: ReturnType<typeof setInterval> | undefined;
    function sync() {
      clearInterval(timer);
      if (visible && !document.hidden)
        timer = setInterval(
          () => setIndex((value) => (value + 1) % count),
          delay,
        );
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        sync();
      },
      { threshold: 0.25 },
    );
    observer.observe(element);
    document.addEventListener("visibilitychange", sync);
    return () => {
      observer.disconnect();
      clearInterval(timer);
      document.removeEventListener("visibilitychange", sync);
    };
  }, [ref, enabled, count, delay, index]);

  return [index, setIndex] as const;
}
