import type { CSSProperties } from "react";
import { DeviceShowcase } from "@/components/device-showcase";
import type { ShowcaseProject, ShowcaseVideo } from "@/types/showcase";
import { Arrow } from "@/components/arrow";
import type { HeroContent } from "./types";
import { AnimatedHeroCopy } from "./AnimatedHeroCopy";
import { TechLogo } from "./tech-logos";
import "./hero.css";

const features = [
  {
    title: "Clean Code",
    caption: "Reliable solutions",
    // code brackets
    path: "m8 8-4 4 4 4M16 8l4 4-4 4M13.5 5l-3 14",
  },
  {
    title: "Innovative Tech",
    caption: "Future-ready ideas",
    // lightbulb
    path: "M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0 0 12 3Z",
  },
  {
    title: "Client Focused",
    caption: "Your success, our goal",
    // target
    path: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm0-4a5 5 0 1 0 0-10 5 5 0 0 0 0 10Zm0-4a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z",
  },
] as const;

// Tags that swim around the laptop. Outer ring turns one way, inner ring the
// other. "start" is where on its ring each tag begins (degrees). Each tag
// draws its own logo from ./tech-logos.
const techTags = [
  { label: "React", ring: "a", start: 0 },
  { label: "Next.js", ring: "a", start: 72 },
  { label: "Node.js", ring: "a", start: 144 },
  { label: "Python", ring: "a", start: 216 },
  { label: "TypeScript", ring: "a", start: 288 },
  { label: "HTML", ring: "b", start: 40 },
  { label: "CSS", ring: "b", start: 130 },
  { label: "JavaScript", ring: "b", start: 220 },
  { label: "Tailwind", ring: "b", start: 310 },
] as const;

export function Hero({
  content,
  projects,
  video,
  nextSectionId,
}: {
  content: HeroContent;
  nextSectionId: string;
  projects: readonly ShowcaseProject[];
  video?: ShowcaseVideo;
}) {
  return (
    <section
      // hero-stage / dark-surface are the hooks the laptop's zoom and scroll
      // code look for, so they stay. .rd-hero gives them the new look.
      className="rd-hero hero-stage dark-surface relative isolate overflow-hidden"
      aria-labelledby="hero-title"
    >
      <div className="page-container rd-main relative">
        <div className="rd-copy">
          <p className="eyebrow rd-eyebrow flex items-center gap-3 text-muted-foreground">
            <span className="h-px w-8 shrink-0 bg-brand" />
            {content.eyebrow}
          </p>

          <AnimatedHeroCopy content={content} />

          <div className="rd-actions">
            <a href={content.primaryAction.href} className="rd-primary">
              {content.primaryAction.label}
              <Arrow className="size-4" />
            </a>
            <a href={content.secondaryAction.href} className="rd-secondary">
              {content.secondaryAction.label}
              <Arrow className="size-4" />
            </a>
          </div>

          <ul className="rd-features">
            {features.map((feature) => (
              <li key={feature.title} className="rd-feature">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d={feature.path} />
                </svg>
                <div>
                  <strong>{feature.title}</strong>
                  <span>{feature.caption}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="rd-visual">
          <DeviceShowcase
            projects={projects}
            video={video}
            nextSectionId={nextSectionId}
            className="device-showcase-wide"
          />
          {/* Sits after the laptop and ignores the pointer, so the laptop stays
              clickable. No z-index on purpose: the zoom backdrop must still
              cover it. */}
          <div className="rd-orbit" aria-hidden="true">
            {techTags.map((tag) => (
              <span
                key={tag.label}
                className={`rd-tag rd-ring-${tag.ring}`}
                style={{ "--start": `${tag.start}deg` } as CSSProperties}
              >
                <TechLogo name={tag.label} />
                {tag.label}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="page-container rd-lower">
        <div className="rd-bottom">
          <p className="rd-tagline">BUILT TO SOLVE REAL PROBLEMS. TOGETHER.</p>
          <ul className="rd-services">
            {content.disciplines.map((discipline) => (
              <li key={discipline}>{discipline}</li>
            ))}
          </ul>
        </div>
      </div>
      {/* Two big, low-contrast curves. Last child so .hero-stage's
          "first child fills the screen" rule still hits the content. */}
      <svg
        className="rd-curves"
        viewBox="0 0 1600 900"
        preserveAspectRatio="xMidYMid slice"
        fill="none"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="rd-curve-a" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#008cff" stopOpacity="0.22" />
            <stop offset="1" stopColor="#008cff" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="rd-curve-b" x1="1" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#00bdf2" stopOpacity="0.16" />
            <stop offset="1" stopColor="#008cff" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path
          d="M1600 60C1400 110 1290 320 1330 520C1360 670 1470 770 1600 800Z"
          fill="url(#rd-curve-b)"
        />
        <path
          d="M1600 60C1400 110 1290 320 1330 520C1360 670 1470 770 1600 800"
          stroke="rgba(0,140,255,0.12)"
          strokeWidth="1.2"
        />
        <path
          d="M0 620C130 690 230 790 270 900H0Z"
          fill="url(#rd-curve-a)"
        />
      </svg>
    </section>
  );
}
