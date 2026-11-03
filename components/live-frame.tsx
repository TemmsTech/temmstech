"use client";

import { useEffect, useRef, useState } from "react";

// The size the site is laid out at inside the frame (a normal laptop window).
// The frame is then shrunk to fit the card, so visitors see the real desktop
// layout, not a squeezed-down mobile one.
const SITE_WIDTH = 1280;
const SITE_HEIGHT = 747; // keeps the card's 12:7 shape

type LiveFrameProps = {
  url: string;
  title: string;
  /** Show the Replay / Try it bar under the frame. Off for small decorative frames. */
  controls?: boolean;
  className?: string;
};

export function LiveFrame({
  url,
  title,
  controls = true,
  className,
}: LiveFrameProps) {
  const box = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.3);
  const [active, setActive] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [run, setRun] = useState(0);
  const [interactive, setInteractive] = useState(false);

  // Shrink the 1280px-wide site to whatever width the card currently has.
  useEffect(() => {
    const element = box.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) => {
      setScale(entry.contentRect.width / SITE_WIDTH);
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  // Start the site once, the first time most of the card is on screen, so its
  // intro plays while the visitor can see it. After that it stays loaded for the
  // rest of the visit: scrolling away and back never reloads or restarts it.
  useEffect(() => {
    const element = box.current;
    if (!element) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.intersectionRatio >= 0.4) {
          setActive(true);
          observer.disconnect();
        }
      },
      { threshold: [0.4] },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <div className={className}>
      <div ref={box} className="relative aspect-[12/7] overflow-hidden bg-ink">
        <div
          className="live-frame-loading"
          data-loaded={loaded ? "" : undefined}
          aria-hidden="true"
        >
          <span className="live-frame-sheen" />
          {controls && (
            <p className="relative text-sm text-white/70">
              {active ? "Opening live site…" : title}
            </p>
          )}
        </div>
        {active && (
          <iframe
            key={run}
            src={url}
            title={`${title} live website preview`}
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
            referrerPolicy="strict-origin-when-cross-origin"
            tabIndex={interactive ? 0 : -1}
            onLoad={() => setLoaded(true)}
            className="absolute top-0 left-0 origin-top-left border-0 bg-white"
            style={{
              width: SITE_WIDTH,
              height: SITE_HEIGHT,
              transform: `scale(${scale})`,
              // Off by default so scrolling over a card scrolls the page
              // instead of getting caught inside the site.
              pointerEvents: interactive ? "auto" : "none",
              opacity: loaded ? 1 : 0,
              transition: "opacity 500ms cubic-bezier(0.23, 1, 0.32, 1)",
            }}
          />
        )}
      </div>
      {controls && (
        <div className="flex items-center justify-between bg-ink px-2 text-white">
          <button
            type="button"
            onClick={() => {
              setLoaded(false);
              setActive(true);
              setRun((value) => value + 1);
            }}
            className="inline-flex min-h-11 items-center px-3 text-xs font-semibold underline decoration-current underline-offset-4"
          >
            Replay intro
          </button>
          <button
            type="button"
            aria-pressed={interactive}
            onClick={() => setInteractive((value) => !value)}
            className="inline-flex min-h-11 items-center px-3 text-xs font-semibold underline decoration-current underline-offset-4"
          >
            {interactive ? "Done" : "Try it"}
          </button>
        </div>
      )}
    </div>
  );
}
