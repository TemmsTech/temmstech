"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Arrow } from "@/components/arrow";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { BriefForm } from "./ProjectBrief";

const EASE = "cubic-bezier(0.77, 0, 0.175, 1)";

export type BriefPoint = { title: string; description: string };

/**
 * Contact call to action. Closed: centred text with a button. Open: the section
 * becomes two columns, the message and optional supporting points on the left
 * and the form on the right. Clicking outside the section, the close button or
 * pressing Escape closes it again.
 */
export function BriefReveal({
  id = "contact",
  eyebrow = "YOUR NEXT STEP",
  title = "Put the idea into words.",
  description = "Start with what you know. We can work through the rest.",
  points,
  tone = "light",
  fill = true,
}: {
  id?: string;
  eyebrow?: string;
  title?: string;
  description?: string;
  points?: readonly BriefPoint[];
  tone?: "light" | "brand";
  /** Make the section at least a screen tall (below the page's section nav). */
  fill?: boolean;
}) {
  const brand = tone === "brand";
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

  function close() {
    change(false);
    requestAnimationFrame(() => buttonRef.current?.focus());
  }

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
      id={id}
      className={cn(
        brand ? "bg-brand text-ink" : "bg-secondary",
        fill && "flex min-h-[calc(100dvh-4.125rem)] items-center",
      )}
      aria-labelledby={`${id}-title`}
    >
      <div className="page-container section-space w-full">
        <div
          className={cn(
            "grid gap-10",
            open &&
              "lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:items-center lg:gap-16",
          )}
        >
          <div
            ref={textRef}
            className={cn(
              open ? "max-w-2xl text-left" : "mx-auto max-w-3xl text-center",
            )}
          >
            <p
              className={cn(
                "eyebrow mb-5",
                !brand && "text-accent-foreground",
              )}
            >
              {eyebrow}
            </p>
            <h2 id={`${id}-title`} className="section-title">
              {title}
            </h2>
            <p
              className={cn(
                "mt-5 text-lg leading-8",
                brand
                  ? "text-xl text-ink sm:text-2xl sm:leading-9"
                  : "text-muted-foreground",
              )}
            >
              {description}
            </p>
            {open && points && points.length > 0 && (
              <ol className="brief-points mt-10 grid gap-5">
                {points.map((point, index) => (
                  <li
                    key={point.title}
                    className={cn(
                      "border-t pt-4",
                      brand ? "border-ink/25" : "border-border",
                    )}
                  >
                    <span className="eyebrow block text-[0.65rem] opacity-70">
                      0{index + 1}
                    </span>
                    <p className="mt-1 text-base font-semibold">
                      {point.title}
                    </p>
                    <p
                      className={cn(
                        "mt-1 text-sm leading-6",
                        brand ? "text-ink" : "text-muted-foreground",
                      )}
                    >
                      {point.description}
                    </p>
                  </li>
                ))}
              </ol>
            )}
            {!open && (
              <button
                ref={buttonRef}
                type="button"
                aria-expanded={false}
                aria-controls={`${id}-panel`}
                onClick={() => change(true)}
                className={cn(
                  buttonVariants({ variant: "ink", size: "lg" }),
                  "mx-auto mt-10 flex gap-8 px-6",
                )}
              >
                Start a conversation <Arrow />
              </button>
            )}
          </div>
          <div
            id={`${id}-panel`}
            className="brief-panel"
            hidden={!open}
            inert={!open}
          >
            <BriefForm onClose={close} />
          </div>
        </div>
      </div>
    </section>
  );
}
