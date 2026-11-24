import type { ReactElement } from "react";

// SCRATCH ONLY. One small mark per technology, drawn inline (no image files,
// no network). All share a 24x24 box.

type Name =
  | "React"
  | "Next.js"
  | "Node.js"
  | "Python"
  | "TypeScript"
  | "HTML"
  | "CSS"
  | "JavaScript"
  | "Tailwind";

const letters = {
  fontFamily: '"Geist Scratch", system-ui, sans-serif',
  fontWeight: 800,
  fontSize: 11.5,
  letterSpacing: "-0.5px",
} as const;

const pythonHalf =
  "M11.9 2C7.4 2 7.7 4 7.7 4v2.1H12v.7H5.9S3 6.4 3 11s2.5 4.4 2.5 4.4H7v-2.1s-.1-2.5 2.5-2.5h4.2s2.4 0 2.4-2.3V4.4S16.5 2 11.9 2Zm-2.4 1.4a.8.8 0 1 1 0 1.6.8.8 0 0 1 0-1.6Z";

const logos: Record<Name, ReactElement> = {
  React: (
    <g stroke="#61dafb" strokeWidth="1.05" fill="none">
      <circle cx="12" cy="12" r="2" fill="#61dafb" stroke="none" />
      <ellipse cx="12" cy="12" rx="10" ry="4.1" />
      <ellipse cx="12" cy="12" rx="10" ry="4.1" transform="rotate(60 12 12)" />
      <ellipse cx="12" cy="12" rx="10" ry="4.1" transform="rotate(120 12 12)" />
    </g>
  ),
  "Next.js": (
    <g>
      <circle cx="12" cy="12" r="11" fill="#ffffff" />
      <path
        d="M9.2 17V7.2l6.9 9.7"
        fill="none"
        stroke="#0a0f1a"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path d="M15.5 7.2v5" stroke="#0a0f1a" strokeWidth="1.6" />
    </g>
  ),
  "Node.js": (
    <g>
      <polygon
        points="12,1.4 21.2,6.7 21.2,17.3 12,22.6 2.8,17.3 2.8,6.7"
        fill="#5fa04e"
      />
      <text
        x="12"
        y="15.4"
        textAnchor="middle"
        fill="#ffffff"
        style={{ ...letters, fontSize: 8.5 }}
      >
        JS
      </text>
    </g>
  ),
  Python: (
    <g>
      <path d={pythonHalf} fill="#4b8bbe" />
      <path d={pythonHalf} fill="#ffd43b" transform="rotate(180 12 12)" />
    </g>
  ),
  TypeScript: (
    <g>
      <rect x="1.5" y="1.5" width="21" height="21" rx="2.5" fill="#3178c6" />
      <text x="12" y="17.4" textAnchor="middle" fill="#ffffff" style={letters}>
        TS
      </text>
    </g>
  ),
  HTML: (
    <path
      fill="#e44d26"
      d="M1.5 0h21l-1.91 21.563L11.977 24l-8.564-2.438L1.5 0Zm7.031 9.75-.232-2.718 10.059.003.23-2.622L5.412 4.41l.698 8.01h9.126l-.326 3.426-2.91.804-2.955-.81-.188-2.11H6.248l.33 4.171L12 19.351l5.379-1.443.744-8.157H8.531Z"
    />
  ),
  CSS: (
    <path
      fill="#2d8fdd"
      d="M1.5 0h21l-1.91 21.563L11.977 24l-8.565-2.438L1.5 0Zm17.09 4.413L5.41 4.41l.213 2.622 10.125.002-.255 2.716h-6.64l.24 2.573h6.182l-.366 3.523-2.91.804-2.956-.81-.188-2.11h-2.61l.29 3.855L12 19.288l5.373-1.53L18.59 4.414Z"
    />
  ),
  JavaScript: (
    <g>
      <rect x="1.5" y="1.5" width="21" height="21" rx="2.5" fill="#f7df1e" />
      <text x="12" y="17.4" textAnchor="middle" fill="#1a1a1a" style={letters}>
        JS
      </text>
    </g>
  ),
  Tailwind: (
    <path
      fill="#38bdf8"
      d="M12.001 4.8c-3.2 0-5.2 1.6-6 4.8 1.2-1.6 2.6-2.2 4.2-1.8.913.228 1.565.89 2.288 1.624 1.178 1.194 2.54 2.576 5.512 2.576 3.2 0 5.2-1.6 6-4.8-1.2 1.6-2.6 2.2-4.2 1.8-.913-.228-1.565-.89-2.288-1.624C16.337 6.182 14.976 4.8 12.001 4.8Zm-6 7.2c-3.2 0-5.2 1.6-6 4.8 1.2-1.6 2.6-2.2 4.2-1.8.913.228 1.565.89 2.288 1.624 1.177 1.194 2.538 2.576 5.512 2.576 3.2 0 5.2-1.6 6-4.8-1.2 1.6-2.6 2.2-4.2 1.8-.913-.228-1.565-.89-2.288-1.624C10.337 13.382 8.976 12 6.001 12Z"
    />
  ),
};

export type TechName = Name;

export function TechLogo({ name }: { name: Name }) {
  return (
    <svg
      className="rd-tag-logo"
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
    >
      {logos[name]}
    </svg>
  );
}
