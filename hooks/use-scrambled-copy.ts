"use client";

import { useEffect, useState, type RefObject } from "react";
import { useMediaQuery } from "@/hooks/use-media-query";

export type HeroMessage = {
  headline: string;
  emphasis: string;
  description: string;
};

/** One character of a headline line. `animate` plays a single flap flip. */
export type FlipCell = { char: string; key: number; animate: boolean };

// Timing. Tweak these to taste.
const FRAME_MS = 55; // one flap flip
const STAGGER = 0.7; // frames between neighbouring characters (left to right)
const REST_MS = 3600; // pause on a finished message before the next one
const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const lower = "abcdefghijklmnopqrstuvwxyz";

const isLetter = (char: string) => /[A-Za-z]/.test(char);

// Deterministic hash so neighbouring characters never fall into a pattern.
function hash(index: number, step: number) {
  return (Math.imul(index + 1, 2654435761) ^ Math.imul(step + 1, 40503)) >>> 7;
}

function noise(letter: string, index: number, step: number) {
  const pool = letter === letter.toUpperCase() ? upper : lower;
  return pool[hash(index, step) % pool.length]!;
}

// Each changed character starts a little after its left neighbour and flips
// through 3 to 5 letters before landing on the new one.
function timing(index: number) {
  return {
    delay: Math.round(index * STAGGER) + (hash(index, 0) % 2),
    flips: 3 + (index % 3),
  };
}

function pad(from: string, to: string) {
  const length = Math.max(from.length, to.length);
  return [from.padEnd(length, " "), to.padEnd(length, " ")] as const;
}

/** How many frames a line needs to finish flipping from one text to another. */
function flipLength(from: string, to: string) {
  const [a, b] = pad(from, to);
  let end = 0;
  for (let index = 0; index < a.length; index += 1) {
    if (a[index] === b[index]) continue;
    const { delay, flips } = timing(index);
    end = Math.max(end, delay + flips + 1);
  }
  return end;
}

/** A line at rest: every character settled, nothing animating. */
function restCells(text: string): FlipCell[] {
  return Array.from(text, (char) => ({ char, key: 0, animate: false }));
}

/** A line part-way through a flip, at the given frame. */
function flipCells(from: string, to: string, step: number): FlipCell[] {
  const [a, b] = pad(from, to);
  const cells: FlipCell[] = [];
  for (let index = 0; index < a.length; index += 1) {
    if (a[index] === b[index]) {
      cells.push({ char: b[index]!, key: 0, animate: false });
      continue;
    }
    const { delay, flips } = timing(index);
    const local = step - delay;
    if (local < 1) cells.push({ char: a[index]!, key: 0, animate: false });
    else {
      const flip = Math.min(local, flips);
      const char =
        flip === flips || !isLetter(b[index]!) ? b[index]! : noise(b[index]!, index, flip);
      // A new key restarts the flip animation; the extra frame lets the
      // landing flip finish before the animation class is removed.
      cells.push({ char, key: flip, animate: local <= flips + 1 });
    }
  }
  return cells;
}

/*
 * Hybrid hero motion. The headline is a split-flap board: each changed
 * character flips through a few letters, left to right, then lands. The
 * paragraph does not flip at all; the caller cross-fades it by `index`.
 */
export function useScrambledCopy(
  element: RefObject<HTMLElement | null>,
  messages: readonly HeroMessage[],
) {
  const reduced = useMediaQuery("(prefers-reduced-motion: reduce)", true);
  const [state, setState] = useState({ current: 0, previous: 0, step: 0, total: 0 });

  useEffect(() => {
    if (reduced || messages.length < 2 || !element.current) return;
    let visible = false;
    let current = 0;
    let previous = 0;
    let step = 0;
    let total = 0; // step >= total means the message is at rest
    let timer: ReturnType<typeof setTimeout> | undefined;
    const advance = () => {
      if (!visible || document.hidden) return;
      if (step >= total) {
        previous = current;
        current = (current + 1) % messages.length;
        const from = messages[previous]!;
        const to = messages[current]!;
        total = Math.max(
          flipLength(from.headline, to.headline),
          flipLength(from.emphasis, to.emphasis),
        );
        step = 0;
      } else step += 1;
      setState({ current, previous, step, total });
      timer = setTimeout(advance, step >= total ? REST_MS : FRAME_MS);
    };
    const sync = () => {
      clearTimeout(timer);
      if (visible && !document.hidden)
        timer = setTimeout(advance, step >= total ? REST_MS : FRAME_MS);
    };
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      sync();
    }, { threshold: 0.2 });
    observer.observe(element.current);
    document.addEventListener("visibilitychange", sync);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", sync);
      clearTimeout(timer);
    };
  }, [element, messages, reduced]);

  const index = reduced ? 0 : state.current;
  const current = messages[index] ?? messages[0]!;
  if (reduced || state.step >= state.total) {
    return {
      index,
      headline: restCells(current.headline),
      emphasis: restCells(current.emphasis),
    };
  }
  const previous = messages[state.previous]!;
  return {
    index,
    headline: flipCells(previous.headline, current.headline, state.step),
    emphasis: flipCells(previous.emphasis, current.emphasis, state.step),
  };
}
