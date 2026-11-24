"use client";

import { useMemo, useRef } from "react";
import { useScrambledCopy, type FlipCell } from "@/hooks/use-scrambled-copy";
import type { HeroContent } from "./types";

function FlipLine({ cells }: { cells: readonly FlipCell[] }) {
  return cells.map((cell, index) => (
    <span
      key={`${index}-${cell.key}`}
      className={cell.animate ? "hero-cell hero-cell-flip" : "hero-cell"}
    >
      {cell.char}
    </span>
  ));
}

export function AnimatedHeroCopy({ content }: { content: HeroContent }) {
  const container = useRef<HTMLDivElement>(null);
  const messages = useMemo(
    () => [{
      headline: content.headline,
      emphasis: content.emphasis,
      description: content.description,
    }, ...content.alternateHeadlines],
    [content],
  );
  const copy = useScrambledCopy(container, messages);

  return (
    <div ref={container}>
      <h1
        id="hero-title"
        className="hero-title hero-typewriter max-w-5xl overflow-x-clip"
        aria-label={`${content.headline} ${content.emphasis}`}
      >
        <span className="block" aria-hidden="true">
          <FlipLine cells={copy.headline} />
        </span>
        {" "}
        <span className="block text-brand" aria-hidden="true">
          <FlipLine cells={copy.emphasis} />
        </span>
      </h1>
      {/* Every paragraph sits in the same grid cell, so the tallest one sets
          the height and nothing moves. The active one dissolves in. */}
      <p
        className="hero-description mt-10 max-w-lg text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8"
        aria-label={content.description}
      >
        {messages.map((message, index) => (
          <span
            key={message.description}
            aria-hidden="true"
            data-active={index === copy.index}
          >
            {message.description}
          </span>
        ))}
      </p>
    </div>
  );
}
