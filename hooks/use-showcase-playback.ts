"use client";

import { useEffect, useState, type RefObject } from "react";

export function useShowcasePlayback(
  ref: RefObject<HTMLElement | null>,
  enabled: boolean,
  count: number,
  /** Milliseconds per item, or a function of the open item's index. Keep a function's identity stable. */
  delay: number | ((index: number) => number),
) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const element = ref.current;
    if (!element || !enabled || count < 2) return;
    let visible = false;
    let timer: ReturnType<typeof setInterval> | undefined;
    const wait = typeof delay === "function" ? delay(index) : delay;
    function sync() {
      clearInterval(timer);
      if (visible && !document.hidden)
        timer = setInterval(
          () => setIndex((value) => (value + 1) % count),
          wait,
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
