"use client";

import { useEffect, useState, type RefObject } from "react";
import { useMediaQuery } from "@/hooks/use-media-query";

export type HeroMessage = {
  headline: string;
  emphasis: string;
  description: string;
};

const steps = 12;
const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

function scramble(from: string, to: string, step: number, mode: "sweep" | "center") {
  if (step >= steps) return to;
  const midpoint = (to.length - 1) / 2;
  return [...to].map((letter, index) => {
    if (letter === from[index] || !/[A-Za-z]/.test(letter)) return letter;
    const order = mode === "sweep"
      ? index / Math.max(1, to.length)
      : Math.abs(index - midpoint) / Math.max(1, midpoint);
    if (step / steps > order) return letter;
    return alphabet[(index * 13 + step * 17) % alphabet.length];
  }).join("");
}

export function useScrambledCopy(
  element: RefObject<HTMLElement | null>,
  messages: readonly HeroMessage[],
) {
  const reduced = useMediaQuery("(prefers-reduced-motion: reduce)", true);
  const [state, setState] = useState({ current: 0, previous: 0, step: steps });

  useEffect(() => {
    if (reduced || messages.length < 2 || !element.current) return;
    let visible = false;
    let current = 0;
    let previous = 0;
    let step = steps;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const advance = () => {
      if (!visible || document.hidden) return;
      if (step === steps) {
        previous = current;
        current = (current + 1) % messages.length;
        step = 0;
      } else step += 1;
      setState({ current, previous, step });
      timer = setTimeout(advance, step === steps ? 3200 : 80);
    };
    const sync = () => {
      clearTimeout(timer);
      if (visible && !document.hidden)
        timer = setTimeout(advance, step === steps ? 2600 : 80);
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

  const current = messages[reduced ? 0 : state.current] ?? messages[0]!;
  if (reduced || state.step === steps) return current;
  const previous = messages[state.previous]!;
  const mode = state.current % 2 === 1 ? "sweep" : "center";
  return {
    headline: scramble(previous.headline, current.headline, state.step, mode),
    emphasis: scramble(previous.emphasis, current.emphasis, state.step, mode),
    description: scramble(previous.description, current.description, state.step, mode),
  };
}
