"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Arrow } from "@/components/arrow";
import { cn } from "@/lib/utils";
import { BriefForm } from "./ProjectBrief";

const EASE = "cubic-bezier(0.77, 0, 0.175, 1)";

/**
 * Contact call to action. Closed: centred text with a button. Open: the section
 * becomes two columns with the form on the right. Clicking outside the section
 * or pressing Escape closes it again.
 */
export function BriefReveal({ email }: { email: string | null }) {
  const [open, setOpen] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const before = useRef<DOMRect | null>(null);
  const mounted = useRef(false);

  function change(next: boolean) {
    before.current = textRef.current?.getBoundingClientRect() ?? null;
    setOpen(next);
  }

  // Slide the text block from where it was to where it now sits.
  useLayoutEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    const text = textRef.current;
    const first = before.current;
    before.current = null;
    if (
      !text ||
      !first ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    )
      return;
    const last = text.getBoundingClientRect();
    const dx = first.left - last.left;
    const dy = first.top - last.top;
    if (!dx && !dy) return;
    text.animate(
      [{ transform: `translate(${dx}px, ${dy}px)` }, { transform: "none" }],
      { duration: 420, easing: EASE },
    );
  }, [open]);

  useEffect(() => {
    if (!open) return;
    document.getElementById("project-brief")?.focus({ preventScroll: true });
    const onPointerDown = (event: PointerEvent) => {
      if (!sectionRef.current?.contains(event.target as Node)) change(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      change(false);
      requestAnimationFrame(() => buttonRef.current?.focus());
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <section
      ref={sectionRef}
      id="contact"
      className="bg-secondary"
      aria-labelledby="brief-title"
    >
      <div className="page-container section-space">
        <div
          className={cn(
            "grid gap-10",
            open && "lg:grid-cols-2 lg:items-center lg:gap-16",
          )}
        >
          <div
            ref={textRef}
            className={cn(
              "max-w-2xl",
              open ? "text-left" : "mx-auto text-center",
            )}
          >
            <p className="eyebrow mb-5 text-accent-foreground">
              YOUR NEXT STEP
            </p>
            <h2 id="brief-title" className="section-title">
              Put the idea into words.
            </h2>
            <p className="mt-5 text-muted-foreground">
              Start with what you know. We can work through the rest.
            </p>
            {!open && (
              <button
                ref={buttonRef}
                type="button"
                aria-expanded={false}
                aria-controls="brief-panel"
                onClick={() => change(true)}
                className="mx-auto mt-8 flex min-h-12 cursor-pointer items-center gap-8 rounded-md bg-ink px-6 py-3 text-sm font-medium text-brand hover:bg-ink/90"
              >
                Start a conversation <Arrow />
              </button>
            )}
          </div>
          <div
            id="brief-panel"
            className="brief-panel"
            hidden={!open}
            inert={!open}
          >
            <BriefForm email={email} />
          </div>
        </div>
      </div>
    </section>
  );
}
