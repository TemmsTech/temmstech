"use client";

import { useEffect, useRef, useState } from "react";
import type { ProcessStep } from "@/types/content";

type SpineStep = Pick<ProcessStep, "title" | "description">;

const clamp = (value: number) => Math.max(0, Math.min(1, value));

/**
 * A line of steps that light up in order as it scrolls into view.
 * Progress is written straight to the DOM; React state only changes when a new
 * step lights up.
 */
export function ProcessSpine({ steps }: { steps: readonly SpineStep[] }) {
  const listRef = useRef<HTMLOListElement>(null);
  const [lit, setLit] = useState(0);

  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const total = steps.length;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setLit(total);
      return;
    }
    let frame = 0;
    const update = () => {
      frame = 0;
      const rect = list.getBoundingClientRect();
      const range = Math.max(rect.height, window.innerHeight * 0.5);
      const progress = clamp((window.innerHeight * 0.8 - rect.top) / range);
      const count =
        progress <= 0
          ? 0
          : Math.min(total, Math.floor(progress * (total - 1) + 0.001) + 1);
      setLit((current) => (current === count ? current : count));
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [steps.length]);

  return (
    <ol ref={listRef} className="spine">
      {steps.map((step, index) => (
        <li
          key={step.title}
          className="spine-step"
          data-lit={index < lit ? "" : undefined}
          data-next-lit={index + 1 < lit ? "" : undefined}
        >
          {index < steps.length - 1 && (
            <span className="spine-seg" aria-hidden="true">
              <span className="spine-seg-fill" />
            </span>
          )}
          <span className="spine-dot" aria-hidden="true" />
          <span className="eyebrow block text-[0.65rem]">
            0{index + 1}
          </span>
          <h2 className="mt-1 text-xl font-semibold tracking-tight">
            {step.title}
          </h2>
          <p className="spine-copy mt-2 text-base leading-7 text-muted-foreground">
            {step.description}
          </p>
        </li>
      ))}
    </ol>
  );
}
