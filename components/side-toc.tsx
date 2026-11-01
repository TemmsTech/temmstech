"use client";

import { useRef } from "react";
import { useScrollSpy } from "@/hooks";
import type { SectionNavItem } from "@/types/section-navigation";

/**
 * "On this page" contents for long text pages. From lg up it is a sticky list
 * beside the text with the active section marked by an accent rule; below lg
 * it is a native disclosure above the text that names the current section.
 */
export function SideToc({ items }: { items: readonly SectionNavItem[] }) {
  // Zero-height marker at the top of the sticky list: the scroll spy measures
  // from it, not from the whole (tall) list.
  const marker = useRef<HTMLDivElement>(null);
  const activeId = useScrollSpy(items, marker);
  const active = items.find((item) => item.id === activeId) ?? items[0];

  const links = items.map((item, index) => (
    <li key={item.id}>
      <a
        href={`#${item.id}`}
        aria-current={activeId === item.id ? "location" : undefined}
        className="side-toc-link block py-2 pl-4 text-sm leading-6"
      >
        {index + 1}. {item.label}
      </a>
    </li>
  ));

  return (
    <>
      <details className="side-toc-mobile mb-10 border-y border-border lg:hidden">
        <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-4 text-sm font-medium">
          <span>On this page</span>
          <span className="text-muted-foreground">{active?.label}</span>
        </summary>
        <nav aria-label="On this page" className="pb-3">
          <ul>{links}</ul>
        </nav>
      </details>
      <aside className="hidden lg:col-start-2 lg:row-start-1 lg:block">
        <div className="side-toc sticky top-28">
          <div ref={marker} aria-hidden="true" className="h-0" />
          <nav aria-label="On this page">
            <p className="mb-3 text-sm font-semibold">On this page</p>
            <ul>{links}</ul>
          </nav>
        </div>
      </aside>
    </>
  );
}
