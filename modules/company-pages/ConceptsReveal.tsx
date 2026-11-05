"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type UIEvent,
} from "react";
import Image from "next/image";
import { Arrow } from "@/components/arrow";
import { ImageCard } from "@/components/image-card";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const EASE = "cubic-bezier(0.77, 0, 0.175, 1)";

export type Concept = {
  id: string;
  title: string;
  category: string;
  description: string;
  brief: string;
  tags: readonly string[];
  image: string;
  /** Slides for the large image: the card photo first, then the screens. */
  gallery: readonly string[];
};

const SIZES = "(min-width: 1024px) 55vw, 100vw";

const SLIDE_MS = 4000;

/**
 * A swipeable row of images that loops: it moves on by itself, wraps from the
 * last image back to the first, and pauses while hovered or focused. An extra
 * copy of the first image sits after the last one so the wrap is seamless.
 */
function Slides({
  images,
  title,
  playing,
}: {
  images: readonly string[];
  title: string;
  playing: boolean;
}) {
  const count = images.length;
  const track = useRef<HTMLDivElement>(null);
  const position = useRef(0);
  const settle = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const [slide, setSlide] = useState(0);
  const [paused, setPaused] = useState(false);
  const reduced = () =>
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Slide to a position; 0..count-1 are the images, count is the copy of the
  // first one. Going before the start jumps to that copy first, then slides.
  const go = useCallback((to: number) => {
    const el = track.current;
    if (!el) return;
    const behavior = reduced() ? "auto" : "smooth";
    if (to < 0) {
      el.scrollTo({ left: count * el.clientWidth, behavior: "auto" });
      to = count - 1;
      requestAnimationFrame(() =>
        el.scrollTo({ left: to * el.clientWidth, behavior }),
      );
      return;
    }
    el.scrollTo({ left: Math.min(to, count) * el.clientWidth, behavior });
  }, [count]);

  function onScroll(event: UIEvent<HTMLDivElement>) {
    const el = event.currentTarget;
    const at = Math.round(el.scrollLeft / el.clientWidth);
    position.current = at;
    setSlide(at % count);
    // Once it rests on the copy of the first image, jump to the real one.
    clearTimeout(settle.current);
    settle.current = setTimeout(() => {
      if (position.current >= count) {
        el.scrollTo({ left: 0, behavior: "auto" });
      }
    }, 140);
  }

  useEffect(() => () => clearTimeout(settle.current), []);

  useEffect(() => {
    if (!playing || paused || reduced()) return;
    const timer = setInterval(() => go(position.current + 1), SLIDE_MS);
    return () => clearInterval(timer);
  }, [playing, paused, go]);

  const pause = () => setPaused(true);
  const resume = () => setPaused(false);

  return (
    <div
      className="absolute inset-0"
      onPointerEnter={pause}
      onPointerLeave={resume}
      onFocus={pause}
      onBlur={resume}
    >
      <div
        ref={track}
        role="group"
        aria-roledescription="carousel"
        aria-label={`${title} images`}
        tabIndex={0}
        onScroll={onScroll}
        onKeyDown={(event) => {
          if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
          event.preventDefault();
          go(position.current + (event.key === "ArrowRight" ? 1 : -1));
        }}
        className="absolute inset-0 flex snap-x snap-mandatory overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {[...images, images[0]].map((src, i) => {
          const copy = i === count;
          const phone = src.includes("mobile");
          return (
            <div
              key={copy ? `${src}-loop` : src}
              role="group"
              aria-roledescription="slide"
              aria-label={`${(i % count) + 1} of ${count}`}
              aria-hidden={copy || undefined}
              className="relative h-full w-full shrink-0 snap-center"
            >
              <Image
                src={src}
                alt=""
                fill
                sizes={SIZES}
                unoptimized={src.endsWith(".svg")}
                className={cn(
                  phone ? "bg-secondary object-contain p-3" : "object-cover",
                )}
              />
            </div>
          );
        })}
      </div>
      <div className="absolute inset-x-0 bottom-3 flex justify-center">
        <div className="flex rounded-full bg-ink/60 px-1.5 backdrop-blur-sm">
          {images.map((src, i) => (
            <button
              key={src}
              type="button"
              aria-label={`Show image ${i + 1} of ${count}`}
              aria-current={i === slide}
              onClick={() => go(i)}
              className="grid size-6 place-items-center"
            >
              <span
                className={cn(
                  "h-1.5 rounded-full bg-white transition-all motion-reduce:transition-none",
                  i === slide ? "w-5" : "w-1.5 opacity-60",
                )}
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Sample concepts. Closed: the section intro and a row of cards. Open: the
 * whole section becomes one concept (text on the left, a large image on the
 * right) with a close button, the same way the contact form takes over its
 * section. The card's image grows into the large one. "Next concept" moves on
 * and mirrors the columns each time. The close button, Escape or a click
 * outside the section brings the cards back.
 */
export function ConceptsReveal({
  eyebrow,
  title,
  description,
  concepts,
}: {
  eyebrow: string;
  title: string;
  description: string;
  concepts: readonly Concept[];
}) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const index = concepts.findIndex((concept) => concept.id === activeId);
  const active = concepts[index];
  const sectionRef = useRef<HTMLElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const from = useRef<{ id: string; rect: DOMRect } | null>(null);
  const mounted = useRef(false);
  const previous = useRef<string | null>(null);

  const cardButton = (id: string) =>
    sectionRef.current?.querySelector<HTMLButtonElement>(
      `[data-concept="${id}"] button`,
    );
  const cardImage = (id: string) =>
    sectionRef.current?.querySelector<HTMLElement>(
      `[data-concept="${id}"] article > div`,
    );

  function next() {
    setActiveId(concepts[(index + 1) % concepts.length].id);
  }

  function goBack() {
    setActiveId(concepts[(index - 1 + concepts.length) % concepts.length].id);
  }

  function open(id: string, trigger: HTMLElement) {
    const image = trigger.closest("article")?.firstElementChild;
    from.current = image ? { id, rect: image.getBoundingClientRect() } : null;
    setActiveId(id);
  }

  // "return": the visitor closed it here, so animate back and refocus the card.
  // "away": they clicked elsewhere on the page, so just close quietly.
  const close = useCallback(
    (mode: "return" | "away") => {
      if (!activeId) return;
      const image = imageRef.current;
      from.current =
        mode === "return" && image
          ? { id: activeId, rect: image.getBoundingClientRect() }
          : null;
      const id = activeId;
      setActiveId(null);
      if (mode === "return") {
        requestAnimationFrame(() => cardButton(id)?.focus());
      }
    },
    [activeId],
  );

  // Grow the card's image into the large one (and shrink it back on close).
  useLayoutEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    const start = from.current;
    from.current = null;
    const before = previous.current;
    previous.current = activeId;
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const switching = Boolean(before && activeId);
    if (!switching && (activeId || start)) {
      sectionRef.current?.scrollIntoView({
        block: "start",
        behavior: "instant",
      });
    }
    // Moving on to the next concept: the new image slides in from its own side.
    if (before && activeId) {
      if (!reduced) {
        const side =
          concepts.findIndex((c) => c.id === activeId) % 2 === 1 ? -16 : 16;
        imageRef.current?.animate(
          [
            { opacity: 0, transform: `translateX(${side}px)` },
            { opacity: 1, transform: "none" },
          ],
          { duration: 420, easing: EASE },
        );
      }
      return;
    }
    const target = activeId
      ? imageRef.current
      : start
        ? cardImage(start.id)
        : null;
    if (!start || !target || reduced) return;
    const end = target.getBoundingClientRect();
    if (!end.width || !end.height) return;
    const origin = "0 0";
    target.animate(
      [
        {
          transformOrigin: origin,
          transform: `translate(${start.rect.left - end.left}px, ${start.rect.top - end.top}px) scale(${start.rect.width / end.width}, ${start.rect.height / end.height})`,
        },
        { transformOrigin: origin, transform: "none" },
      ],
      { duration: 520, easing: EASE },
    );
  }, [activeId, concepts]);

  useEffect(() => {
    if (!activeId) return;
    closeRef.current?.focus({ preventScroll: true });
    const onPointerDown = (event: PointerEvent) => {
      if (!sectionRef.current?.contains(event.target as Node)) close("away");
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close("return");
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [activeId, close]);

  return (
    <section
      ref={sectionRef}
      id="concepts"
      className={cn(
        "overflow-x-clip bg-secondary",
        active && "fill-below-nav flex",
      )}
      aria-labelledby="lab-title"
    >
      <div
        className={cn(
          "page-container section-space w-full",
          active && "flex flex-col",
        )}
      >
        {active ? (
          <>
            <div className="relative mb-6 h-11">
              <button
                ref={closeRef}
                type="button"
                onClick={() => close("return")}
                aria-label="Close concept"
                className="glass-close"
                style={{ top: 0, right: 0 }}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  className="size-4"
                  aria-hidden="true"
                >
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </div>
            <div className="flex flex-1 items-center">
              {/* Every concept sits in the same grid cell, so this area is as tall
                  as the tallest one and nothing moves when you step through. */}
              <div className="grid w-full">
                {concepts.map((concept, i) => {
                  const current = concept.id === active.id;
                  const mirrored = i % 2 === 1;
                  return (
                    <div
                      key={concept.id}
                      aria-hidden={!current}
                      inert={!current}
                      className={cn(
                        "col-start-1 row-start-1 grid gap-10 lg:items-center lg:gap-16",
                        mirrored
                          ? "lg:grid-cols-[minmax(0,6fr)_minmax(0,5fr)]"
                          : "lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]",
                        !current && "invisible",
                      )}
                    >
                      <div
                        className={cn(
                          "max-w-2xl text-left",
                          current && "brief-points",
                          mirrored && "lg:order-2",
                        )}
                      >
                        <p className="eyebrow mb-5 text-accent-foreground">
                          SAMPLE CONCEPT · {concept.category}
                        </p>
                        <h2
                          id={current ? "lab-title" : undefined}
                          className="section-title"
                        >
                          {concept.title}
                        </h2>
                        <p className="mt-5 text-lg leading-8 text-muted-foreground">
                          {concept.description}
                        </p>
                        <p className="mt-5 text-base leading-7 text-muted-foreground">
                          {concept.brief}
                        </p>
                        <ul className="mt-8 flex flex-wrap gap-2">
                          {concept.tags.map((tag) => (
                            <li
                              key={tag}
                              className="rounded-full border border-border px-3 py-1 text-xs"
                            >
                              {tag}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div
                        ref={current ? imageRef : undefined}
                        className="relative aspect-video overflow-hidden rounded-xl border border-border bg-ink"
                      >
                        <Slides
                          images={concept.gallery}
                          title={concept.title}
                          playing={current}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="mt-10 grid grid-cols-[1fr_auto_1fr] items-center gap-4 border-t border-border pt-5">
              <button
                type="button"
                onClick={goBack}
                className={cn(
                  buttonVariants({ variant: "ink", size: "lg" }),
                  "min-w-36 justify-between justify-self-start gap-8 px-6",
                )}
              >
                <Arrow className="size-5 rotate-180" /> Previous
              </button>
              <p className="eyebrow text-xs" aria-live="polite">
                {String(index + 1).padStart(2, "0")} /{" "}
                {String(concepts.length).padStart(2, "0")}
                <span className="sr-only">: {active.title}</span>
              </p>
              <button
                type="button"
                onClick={next}
                className={cn(
                  buttonVariants({ variant: "ink", size: "lg" }),
                  "min-w-36 justify-between justify-self-end gap-8 px-6",
                )}
              >
                Next <Arrow />
              </button>
            </div>
          </>
        ) : (
          <>
            <p className="eyebrow mb-5">{eyebrow}</p>
            <h2 id="lab-title" className="section-title">
              {title}
            </h2>
            <p className="mt-5 mb-10 max-w-2xl text-muted-foreground">
              {description}
            </p>
            <div className="grid gap-6 lg:grid-cols-3">
              {concepts.map((concept) => (
                <div
                  key={concept.id}
                  data-concept={concept.id}
                  className="contents"
                >
                  <ImageCard
                    image={concept.image}
                    label="Sample concept"
                    title={concept.title}
                    description={concept.description}
                  >
                    <div className="mt-5 border-t border-border pt-4">
                      <button
                        type="button"
                        onClick={(event) =>
                          open(concept.id, event.currentTarget)
                        }
                        className="group flex min-h-11 w-full cursor-pointer items-center justify-between py-2 text-sm font-semibold"
                      >
                        <span>
                          Explore the idea
                          <span className="sr-only">: {concept.title}</span>
                        </span>
                        <Arrow className="size-4 transition-transform group-hover:translate-x-1 motion-reduce:transition-none" />
                      </button>
                    </div>
                  </ImageCard>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
