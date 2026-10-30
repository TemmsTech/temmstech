"use client";

import { useEffect, useState, type RefObject } from "react";
import type { SectionNavItem } from "@/types/section-navigation";

export function useScrollSpy(
  items: readonly SectionNavItem[],
  nav: RefObject<HTMLElement | null>,
) {
  const [activeId, setActiveId] = useState(items[0]?.id ?? "");
  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const threshold =
        Math.max(nav.current?.getBoundingClientRect().bottom ?? 0, 80) + 24;
      let active = items[0]?.id ?? "";
      for (const item of items) {
        const section = document.getElementById(item.id);
        if (section) {
          const anchorOffset =
            parseFloat(
              getComputedStyle(document.documentElement).scrollPaddingTop,
            ) + parseFloat(getComputedStyle(section).scrollMarginTop);
          if (
            section.getBoundingClientRect().top <=
            Math.max(threshold, anchorOffset) + 2
          )
            active = item.id;
        }
      }
      setActiveId(active);
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    const observer = new ResizeObserver(schedule);
    observer.observe(document.body);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    window.addEventListener("hashchange", schedule);
    schedule();
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      window.removeEventListener("hashchange", schedule);
    };
  }, [items, nav]);
  return activeId;
}
