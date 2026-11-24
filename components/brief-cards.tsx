"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ImageCard } from "@/components/image-card";
import {
  CARD_KINDS,
  TileSlides,
  type SlideKind,
  type SlideTurn,
} from "@/components/tile-slides";
import { useMediaQuery } from "@/hooks";

// No pause at all: the moment one card finishes, the next one begins.
// Only used to look again when the one card in view is the one that just moved.
const RETRY_MS = 400;
// If a card never reports back, carry on rather than freezing the whole row.
const WATCHDOG_MS = 9000;
const SIZES = "(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw";

type BriefPrompt = {
  title: string;
  description: string;
  image: string;
  /** The photos the card cycles through; the first is the one shown at rest. */
  images: readonly string[];
};

type Turn = SlideTurn & { card: number };

const pick = <T,>(items: readonly T[]) =>
  items[Math.floor(Math.random() * items.length)];

/**
 * The row of "things to bring" cards. Each card is a slideshow, but they take
 * turns: exactly one card changes at a time, never the same card twice in a
 * row, and each change picks a random arrival (slide up, down, sideways or
 * diagonally, or shredded into strips) that differs from the one before. The
 * next card starts the instant the previous one lands, so the row is always
 * in motion.
 * Only cards currently on screen are chosen, and everything pauses while the
 * row is offscreen or the tab is hidden. With reduced motion the photos stay
 * still.
 */
export function BriefCards({ prompts }: { prompts: readonly BriefPrompt[] }) {
  const reduced = useMediaQuery("(prefers-reduced-motion: reduce)", true);
  const root = useRef<HTMLDivElement>(null);
  const onScreen = useRef(new Set<number>());
  const [active, setActive] = useState(false);
  const [busy, setBusy] = useState(false);
  const [retry, setRetry] = useState(0);
  const [turn, setTurn] = useState<Turn | null>(null);
  const lastCard = useRef<number | null>(null);
  const lastKind = useRef<SlideKind | null>(null);
  const counter = useRef(0);

  // Track which cards can be seen, and whether the tab is showing.
  useEffect(() => {
    const node = root.current;
    if (!node) return;
    const cards = Array.from(node.children);
    const sync = () => setActive(onScreen.current.size > 0 && !document.hidden);
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const index = cards.indexOf(entry.target);
          if (index < 0) continue;
          if (entry.isIntersecting) onScreen.current.add(index);
          else onScreen.current.delete(index);
        }
        sync();
      },
      { threshold: 0.35 },
    );
    cards.forEach((card) => observer.observe(card));
    document.addEventListener("visibilitychange", sync);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", sync);
    };
  }, []);

  // As soon as nothing is moving, give the next card its turn.
  useEffect(() => {
    if (reduced || !active || busy || prompts.length < 2) return;
    let retryTimer: number | undefined;
    const timer = window.setTimeout(() => {
      const cards = [...onScreen.current].filter((i) => i !== lastCard.current);
      if (cards.length === 0) {
        // Only the card that just moved is in view: look again shortly.
        retryTimer = window.setTimeout(() => setRetry((n) => n + 1), RETRY_MS);
        return;
      }
      const kinds = CARD_KINDS.filter((k) => k !== lastKind.current);
      const card = pick(cards);
      const kind = pick(kinds);
      lastCard.current = card;
      lastKind.current = kind;
      counter.current += 1;
      setTurn({ card, kind, nonce: counter.current });
      setBusy(true);
    }, 0);
    return () => {
      window.clearTimeout(timer);
      window.clearTimeout(retryTimer);
    };
  }, [reduced, active, busy, retry, prompts.length]);

  // The moving card tells us when it is done.
  const settle = useCallback(() => setBusy(false), []);

  useEffect(() => {
    if (!busy) return;
    const timer = window.setTimeout(settle, WATCHDOG_MS);
    return () => window.clearTimeout(timer);
  }, [busy, turn, settle]);

  return (
    <div ref={root} className="grid gap-6 md:grid-cols-3">
      {prompts.map(({ images, ...prompt }, index) => (
        <ImageCard
          key={prompt.title}
          {...prompt}
          media={
            <TileSlides
              images={images}
              sizes={SIZES}
              turn={turn?.card === index ? turn : null}
              onSettled={settle}
            />
          }
        />
      ))}
    </div>
  );
}
