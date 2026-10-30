"use client";

import { useRef } from "react";
import { useSectionReveal } from "@/hooks/use-section-reveal";

export function SectionReveal({
  fromId,
  toId,
}: {
  fromId: string;
  toId: string;
}) {
  const track = useRef<HTMLDivElement>(null);
  const surface = useRef<HTMLDivElement>(null);
  useSectionReveal(track, surface, fromId, toId);
  return (
    <div
      ref={track}
      className="section-reveal"
      data-target={toId}
      aria-hidden="true"
    >
      <noscript>
        <style>{".section-reveal { display: none; }"}</style>
      </noscript>
      <div ref={surface} className="section-reveal-surface" hidden inert />
    </div>
  );
}
