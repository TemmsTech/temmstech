import { claudeLogo } from "@/lib/screen-app-icons";
import { createScreenTabs, type ScreenTabs, type TabSpec } from "@/lib/screen-tabs";
import { WINDOW_ICONS } from "@/lib/window-controls";

/** What the Chrome window is doing, as far as the desktop is concerned. */
export type ChromeState = "open" | "minimised" | "closed";
type WindowState = "full" | "windowed" | "minimised" | "closed";

const icon = (body: string, size = 17) =>
  `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${body}</svg>`;
const solid = (body: string, size = 17) =>
  `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="currentColor" aria-hidden="true">${body}</svg>`;

const ICONS = {
  back: icon('<path d="M19 12H5M11 6l-6 6 6 6"/>'),
  forward: icon('<path d="M5 12h14M13 6l6 6-6 6"/>'),
  reload: icon('<path d="M19.5 12a7.5 7.5 0 1 1-2.4-5.5M19.5 4.5v4.6h-4.6"/>'),
  star: icon('<path d="m12 4 2.4 5 5.4.7-4 3.8 1 5.4-4.8-2.7-4.8 2.7 1-5.4-4-3.8 5.4-.7z"/>', 16),
  puzzle: icon(
    '<path d="M10 4.8a1.9 1.9 0 0 1 3.8 0V6.4H18v4.2h-1.6a1.9 1.9 0 0 0 0 3.8H18v4.2h-4.2v-1.6a1.9 1.9 0 0 0-3.8 0v1.6H5.8v-4.2h1.6a1.9 1.9 0 0 0 0-3.8H5.8V6.4H10z"/>',
    16,
  ),
  kebab: solid(
    '<circle cx="12" cy="5.5" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="12" cy="18.5" r="1.6"/>',
    16,
  ),
  chevron: icon('<path d="m7 10 5 5 5-5"/>', 15),
  plus: icon('<path d="M12 5v14M5 12h14"/>', 16),
  info: icon('<circle cx="12" cy="12" r="8.5"/><path d="M12 11v5.2M12 8h.01"/>', 14),
  tune: icon('<path d="M4 8h10M18 8h2M4 16h2M10 16h10"/><circle cx="16" cy="8" r="2"/><circle cx="8" cy="16" r="2"/>', 15),
  apps: solid(
    '<path d="M5 5h3v3H5zM10.5 5h3v3h-3zM16 5h3v3h-3zM5 10.5h3v3H5zM10.5 10.5h3v3h-3zM16 10.5h3v3h-3zM5 16h3v3H5zM10.5 16h3v3h-3zM16 16h3v3h-3z"/>',
    15,
  ),
  folder: icon('<path d="M3.5 7a1.5 1.5 0 0 1 1.5-1.5h4l2 2h8A1.5 1.5 0 0 1 20.5 9v8a1.5 1.5 0 0 1-1.5 1.5H5A1.5 1.5 0 0 1 3.5 17z"/>', 15),
  gemini:
    '<svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true"><path d="M12 2.5c.6 5 4.5 8.9 9.5 9.5-5 .6-8.9 4.5-9.5 9.5-.6-5-4.5-8.9-9.5-9.5 5-.6 8.9-4.5 9.5-9.5z" fill="#8ab4f8"/></svg>',
} as const;

const FAVICONS = {
  slipdesk:
    '<svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><path d="M6 2.5h8l4.5 4.5v14a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-17.5a1 1 0 0 1 1-1z" fill="#0f9d58"/><path d="M14 2.5V7h4.5z" fill="#87ceac"/><path d="M8 11.5h8M8 14.5h8M8 17.5h5" stroke="#fff" stroke-width="1.4"/></svg>',
  claude: claudeLogo(14),
} as const;

/** The SlipDesk path and the Claude address are made up (a placeholder user, like the Recycle Bin). Both pages are pictures; anything else a visitor opens is live. */
const TABS: readonly TabSpec[] = [
  {
    id: "slipdesk",
    title: "Oyo State 2026 Compulsory Exam",
    url: "C:/Users/dev/Documents/WEB DEVS/SlipDesk/slip-desk.html#log",
    chip: "File",
    favicon: FAVICONS.slipdesk,
    shot: "/images/chrome/page-slipdesk.webp",
    fit: "cover",
  },
  {
    id: "claude",
    title: "Building a multi-app desktop prototype",
    url: "claude.ai/chat/7f3a1c52-0d4e-4b9a-8e21-5c6d9b2a41f0",
    favicon: FAVICONS.claude,
    shot: "/images/brave/page-claude.webp",
    fit: "width",
  },
];

const esc = (text: string) =>
  text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function create<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  className: string,
  html?: string,
) {
  const node = document.createElement(tag);
  node.className = className;
  if (html !== undefined) node.innerHTML = html;
  return node;
}

export type ScreenChrome = {
  element: HTMLElement;
  /** Open (or bring back) the window. */
  open: () => void;
  /** Like a real taskbar button: hide a visible window, bring back a hidden one. */
  toggle: () => void;
  /** Whether the window is currently out of sight. */
  hidden: () => boolean;
  dispose: () => void;
};

type ChromeOptions = {
  /** Centre of the taskbar button, in the screen's own pixels. */
  target: () => { x: number; y: number } | undefined;
  /** Called with "open" while on show, "minimised" while shrunk into the taskbar, "closed" after close. */
  onChange: (state: ChromeState) => void;
};

/**
 * A Chrome window for the simulated Windows desktop, dressed like the dark
 * Chrome in the reference screenshot. It starts with two tabs (the SlipDesk
 * page and a Claude chat), each a picture. Browsing is real (lib/screen-tabs.ts):
 * tabs open, close and switch, and any web link typed in the address bar loads
 * as a live page. Closing the window puts the two starting tabs back.
 */
export function createScreenChrome(
  parent: HTMLElement,
  { target, onChange }: ChromeOptions,
): ScreenChrome {
  const root = create("div", "screen-chrome");
  root.dataset.window = "closed";
  root.inert = true;
  root.addEventListener("pointerdown", (event) => event.stopPropagation());
  const win = create("div", "ch-window");
  root.appendChild(win);

  const controls = (["minimise", "maximise", "close"] as const)
    .map(
      (name) =>
        `<button type="button" tabindex="-1" class="ch-control" data-control="${name}" aria-label="${name[0].toUpperCase()}${name.slice(1)}">${WINDOW_ICONS[name === "maximise" ? "restore" : name]}</button>`,
    )
    .join("");

  win.innerHTML = `
    <div class="ch-tabs">
      <span class="ch-tablist">${ICONS.chevron}</span>
      <span class="ch-tab-add">${ICONS.plus}</span>
      <span class="ch-gemini">${ICONS.gemini}<b>Ask Gemini</b></span>
      <span class="ch-controls">${controls}</span>
    </div>
    <div class="ch-bar">
      <span class="ch-nav"><span class="ch-tool" data-nav="back" data-dim>${ICONS.back}</span><span class="ch-tool" data-nav="forward" data-dim>${ICONS.forward}</span><span class="ch-tool" data-nav="reload">${ICONS.reload}</span></span>
      <div class="ch-url"><span class="ch-lead"></span><span class="ch-url-text"></span><span class="ch-star">${ICONS.star}</span></div>
      <span class="ch-tool">${ICONS.puzzle}</span>
      <i class="ch-divider"></i>
      <span class="ch-profile"><span class="ch-avatar">D</span><b>Dev</b></span>
      <span class="ch-tool">${ICONS.kebab}</span>
    </div>
    <div class="ch-marks"><span class="ch-tool">${ICONS.apps}</span><i class="ch-divider"></i><span class="ch-marks-all">${ICONS.folder}<b>All Bookmarks</b></span></div>
    <div class="ch-page"></div>`;
  parent.appendChild(root);

  const lead = win.querySelector<HTMLElement>(".ch-lead")!;
  const maximise = win.querySelector<HTMLElement>('[data-control="maximise"]')!;

  // Tabs, the address bar, back, forward and reload live in the shared engine.
  const tabs: ScreenTabs = createScreenTabs(win, {
    prefix: "ch",
    specs: TABS,
    shotMarkup: (spec) =>
      `<img class="ch-shot" src="${spec.shot}" alt="" draggable="false" />`,
    onPage: ({ chip }) => {
      lead.innerHTML = chip
        ? `<span class="ch-chip">${ICONS.info}<b>${esc(chip)}</b></span>`
        : `<span class="ch-tune">${ICONS.tune}</span>`;
    },
    // Closing the last tab closes the window, like a real browser.
    onEmpty: () => set("closed"),
  });

  // ---- Window state ---------------------------------------------------------
  let state: WindowState = "closed";
  let restoreTo: "full" | "windowed" = "full";
  let closeTimer: ReturnType<typeof setTimeout> | undefined;
  const hidden = () => state === "minimised" || state === "closed";

  function aim() {
    const point = target();
    if (!point) return;
    // Offsets from the window's own centre, in layout pixels.
    win.style.setProperty(
      "--min-x",
      `${point.x - root.offsetLeft - win.offsetLeft - win.offsetWidth / 2}px`,
    );
    win.style.setProperty(
      "--min-y",
      `${point.y - root.offsetTop - win.offsetTop - win.offsetHeight / 2}px`,
    );
  }
  function set(next: WindowState) {
    if (next === state) return;
    if (next === "minimised" && state !== "closed")
      restoreTo = state === "windowed" ? "windowed" : "full";
    if (next === "closed") restoreTo = "full";
    if (next === "minimised" || next === "closed") aim();
    state = next;
    root.dataset.window = next;
    root.inert = hidden();
    maximise.innerHTML = next === "full" ? WINDOW_ICONS.restore : WINDOW_ICONS.maximise;
    // Sites only load while the window is on show.
    tabs.setVisible(!hidden());
    // A closed window starts over once it has shrunk away.
    if (next === "closed")
      closeTimer = setTimeout(() => {
        if (state === "closed") tabs.reset();
      }, 600);
    onChange(next === "closed" ? "closed" : next === "minimised" ? "minimised" : "open");
  }

  const open = () => {
    if (hidden()) set(state === "closed" ? "full" : restoreTo);
    else onChange("open");
  };

  root.addEventListener("click", (event) => {
    const hit = (event.target as HTMLElement).closest<HTMLElement>("[data-control]");
    if (!hit) return;
    if (hit.dataset.control === "minimise") set("minimised");
    else if (hit.dataset.control === "close") set("closed");
    else if (hit.dataset.control === "maximise") {
      if (state === "full") set("windowed");
      else if (state === "windowed") set("full");
    }
  });

  return {
    element: root,
    open,
    hidden,
    toggle() {
      if (hidden()) open();
      else set("minimised");
    },
    dispose() {
      clearTimeout(closeTimer);
      tabs.dispose();
      root.remove();
    },
  };
}
