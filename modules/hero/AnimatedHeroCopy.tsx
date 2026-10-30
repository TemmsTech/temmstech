"use client";

import { useMemo, useRef } from "react";
import { useScrambledCopy } from "@/hooks/use-scrambled-copy";
import type { HeroContent } from "./types";

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
        className="hero-title hero-typewriter max-w-5xl"
        aria-label={`${content.headline} ${content.emphasis}`}
      >
        <span className="block" aria-hidden="true">{copy.headline}</span>
        {" "}
        <span className="block text-brand" aria-hidden="true">{copy.emphasis}</span>
      </h1>
      <p
        className="hero-description mt-10 max-w-lg text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8"
        aria-label={content.description}
      >
        <span aria-hidden="true">{copy.description}</span>
        {messages.map((message) => (
          <span key={message.description} aria-hidden="true" className="invisible">
            {message.description}
          </span>
        ))}
      </p>
    </div>
  );
}
