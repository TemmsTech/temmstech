"use client";

import { useEffect, useRef } from "react";
import { useScrollSpy } from "@/hooks";
import type { SectionNavItem } from "@/types/section-navigation";

export function SectionNav({ items }: { items: readonly SectionNavItem[] }) {
  const nav = useRef<HTMLElement>(null);
  const activeId = useScrollSpy(items, nav);
  useEffect(() => {
    const link = nav.current?.querySelector<HTMLElement>(
      '[aria-current="location"]',
    );
    const container = link?.parentElement;
    if (!link || !container) return;
    const bounds = link.getBoundingClientRect();
    const viewport = container.getBoundingClientRect();
    if (bounds.left < viewport.left)
      container.scrollLeft += bounds.left - viewport.left;
    else if (bounds.right > viewport.right)
      container.scrollLeft += bounds.right - viewport.right;
  }, [activeId]);
  return (
    <nav
      ref={nav}
      aria-label="On this page"
      className="section-nav border-y border-border bg-background text-foreground"
    >
      <div className="page-container flex min-h-16 items-center gap-6 overflow-x-auto">
        <span className="eyebrow hidden shrink-0 text-muted-foreground lg:block">
          EXPLORE THIS PAGE
        </span>
        {items.map((item, index) => (
          <a
            key={item.id}
            href={`#${item.id}`}
            aria-current={activeId === item.id ? "location" : undefined}
            className="section-nav-link inline-flex min-h-12 shrink-0 items-center gap-2 border-b-2 border-transparent px-1 text-sm"
          >
            <span className="font-mono text-xs opacity-60">0{index + 1}</span>
            {item.label}
          </a>
        ))}
      </div>
    </nav>
  );
}
