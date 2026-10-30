"use client";
import { useRef } from "react";
import { useTabletTransition } from "@/hooks";

export function TabletTransition({
  fromId,
  toId,
}: {
  fromId: string;
  toId: string;
}) {
  const runway = useRef<HTMLDivElement>(null);
  const host = useRef<HTMLDivElement>(null);
  const status = useTabletTransition(runway, host, fromId, toId);
  return (
    <div
      ref={runway}
      className="tablet-transition"
      data-renderer={status}
      aria-hidden="true"
    >
      <noscript>
        <style>{".tablet-transition { display: none; }"}</style>
      </noscript>
      <div ref={host} className="tablet-transition-stage" hidden />
    </div>
  );
}
