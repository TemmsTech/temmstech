"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { useMediaQuery } from "@/hooks";

const HOLD_MS = 4200;
const JITTER_MS = 1800;
const EASE = "cubic-bezier(0.77, 0, 0.175, 1)";
const STRIPS = 7;
const STRIP_STAGGER_MS = 70;

type Kind = "left" | "right" | "up" | "down" | "shred" | "cube";
const KINDS: readonly Kind[] = ["left", "right", "up", "down", "shred", "cube"];
const DURATION: Record<Kind, number> = {
  left: 700,
  right: 700,
  up: 700,
  down: 700,
  shred: 650,
  cube: 850,
};
// Where the incoming photo starts, as a % of the tile. "left" means the scene
// travels left, so the new photo arrives from the right.
const FROM: Record<"left" | "right" | "up" | "down", [number, number]> = {
  left: [100, 0],
  right: [-100, 0],
  up: [0, 100],
  down: [0, -100],
};

type Change = {
  index: number;
  kind: Kind;
  /** Cube only: which axis it turns on, which way, and half the tile's depth. */
  axis: "X" | "Y";
  sign: 1 | -1;
  depth: number;
};

const totalMs = (kind: Kind) =>
  DURATION[kind] + (kind === "shred" ? (STRIPS - 1) * STRIP_STAGGER_MS : 0);

function shuffled(count: number, notFirst: number) {
  const order = Array.from({ length: count }, (_, i) => i);
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  // Never open a new round with the photo that is already showing.
  if (order[0] === notFirst) [order[0], order[1]] = [order[1], order[0]];
  return order;
}

/**
 * Decorative slideshow in random order, with a different obvious transition
 * each time: the scene slides up, down, left or right, shreds into strips, or
 * rolls like a cube. Every photo shows once before any repeats. The next photo
 * is mounted hidden and only moves in after it has loaded, so a slow image
 * never leaves a blank tile. Pauses while offscreen or the tab is hidden, and
 * stays on the first photo for people who prefer reduced motion.
 */
export function TileSlides({
  images,
  sizes,
  priority = false,
  delay = 0,
}: {
  images: readonly string[];
  sizes: string;
  priority?: boolean;
  /** Offsets this tile's first change so neighbouring tiles never swap together. */
  delay?: number;
}) {
  const reduced = useMediaQuery("(prefers-reduced-motion: reduce)", true);
  const root = useRef<HTMLDivElement>(null);
  const [current, setCurrent] = useState(0);
  const [change, setChange] = useState<Change | null>(null);
  const [playing, setPlaying] = useState(false);
  const [active, setActive] = useState(false);
  const queue = useRef<number[]>([]);
  const failed = useRef(new Set<number>());
  const lastKind = useRef<Kind | null>(null);

  // Run only while on screen and the tab is visible.
  useEffect(() => {
    const node = root.current;
    if (!node) return;
    let onScreen = false;
    const sync = () => setActive(onScreen && !document.hidden);
    const observer = new IntersectionObserver(([entry]) => {
      onScreen = entry.isIntersecting;
      sync();
    });
    observer.observe(node);
    document.addEventListener("visibilitychange", sync);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", sync);
    };
  }, []);

  // After a hold, choose the next photo from the shuffled bag and how it arrives.
  useEffect(() => {
    if (reduced || !active || change !== null || images.length < 2) return;
    const first = current === 0 && queue.current.length === 0;
    const wait = HOLD_MS + Math.random() * JITTER_MS + (first ? delay : 0);
    const timer = window.setTimeout(() => {
      if (queue.current.length === 0) {
        queue.current = shuffled(images.length, current);
      }
      let next = queue.current.shift();
      while (next !== undefined && failed.current.has(next)) {
        next = queue.current.shift();
      }
      if (next === undefined || next === current) return;
      const options = KINDS.filter((k) => k !== lastKind.current);
      const kind = options[Math.floor(Math.random() * options.length)];
      lastKind.current = kind;
      const box = root.current?.getBoundingClientRect();
      const axis = Math.random() < 0.5 ? "X" : "Y";
      setChange({
        index: next,
        kind,
        axis,
        sign: Math.random() < 0.5 ? 1 : -1,
        depth: box ? (axis === "Y" ? box.width : box.height) / 2 : 0,
      });
    }, wait);
    return () => window.clearTimeout(timer);
  }, [reduced, active, change, current, images.length, delay]);

  // When the move has played out, the incoming photo becomes the resting one.
  useEffect(() => {
    if (!playing || !change) return;
    const timer = window.setTimeout(() => {
      setCurrent(change.index);
      setChange(null);
      setPlaying(false);
    }, totalMs(change.kind) + 40);
    return () => window.clearTimeout(timer);
  }, [playing, change]);

  const kind = change?.kind;
  const slide = kind && kind !== "shred" && kind !== "cube" ? kind : null;
  const faces = change ? [current, change.index] : [current];

  const faceStyle = (index: number): CSSProperties => {
    if (!change) return {};
    const entering = index === change.index;
    const base: CSSProperties = { willChange: "transform" };
    if (slide) {
      const [x, y] = FROM[slide];
      const k = entering ? (playing ? 0 : 1) : playing ? -1 : 0;
      return {
        ...base,
        transform: `translate(${x * k}%, ${y * k}%)`,
        transition: `transform ${DURATION[slide]}ms ${EASE}`,
      };
    }
    if (change.kind === "cube") {
      const turn = entering ? change.sign * 90 : 0;
      return {
        ...base,
        transform: `rotate${change.axis}(${turn}deg) translateZ(${change.depth}px)`,
        backfaceVisibility: "hidden",
      };
    }
    // Shred: the incoming photo waits, unseen, underneath its strips.
    return entering ? { opacity: 0 } : {};
  };

  const wrapStyle: CSSProperties =
    change?.kind === "cube"
      ? {
          transformStyle: "preserve-3d",
          transform: `translateZ(${-change.depth}px) rotate${change.axis}(${
            playing ? -change.sign * 90 : 0
          }deg)`,
          transition: `transform ${DURATION.cube}ms ${EASE}`,
          willChange: "transform",
        }
      : {};

  const begin = () =>
    // Two frames, so the starting state is painted before it moves.
    requestAnimationFrame(() => requestAnimationFrame(() => setPlaying(true)));

  return (
    <div
      ref={root}
      className="absolute inset-0"
      style={{ perspective: "1400px" }}
      data-kind={playing ? kind : undefined}
    >
      <div className="absolute inset-0" style={wrapStyle}>
        {faces.map((index) => {
          const entering = change !== null && index === change.index;
          return (
            <div
              key={index}
              className="absolute inset-0"
              style={faceStyle(index)}
            >
              <Image
                src={images[index]}
                alt=""
                fill
                sizes={sizes}
                className="object-cover"
                priority={priority && index === 0}
                onLoad={entering ? begin : undefined}
                onError={
                  entering
                    ? () => {
                        failed.current.add(index);
                        setChange(null);
                      }
                    : undefined
                }
              />
            </div>
          );
        })}
      </div>
      {change?.kind === "shred" &&
        Array.from({ length: STRIPS }, (_, i) => (
          <div
            key={i}
            aria-hidden="true"
            className="absolute top-0 h-full overflow-hidden"
            style={{
              left: `${(i * 100) / STRIPS}%`,
              width: `${100 / STRIPS}%`,
              // Alternate strips drop in from above and rise from below.
              transform: `translateY(${playing ? 0 : i % 2 ? 100 : -100}%)`,
              transition: `transform ${DURATION.shred}ms ${EASE} ${
                i * STRIP_STAGGER_MS
              }ms`,
              willChange: "transform",
            }}
          >
            <div
              className="absolute top-0 h-full"
              style={{ width: `${STRIPS * 100}%`, left: `${-i * 100}%` }}
            >
              <Image
                src={images[change.index]}
                alt=""
                fill
                sizes={sizes}
                className="object-cover"
              />
            </div>
          </div>
        ))}
    </div>
  );
}
