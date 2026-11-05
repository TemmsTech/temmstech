import { isScreenFile } from "@/lib/screen-files";
import { WINDOW_ICONS } from "@/lib/window-controls";

/** What the File Explorer window is doing, as far as the desktop is concerned. */
export type ExplorerState = "open" | "minimised" | "closed";
type WindowState = "full" | "windowed" | "minimised" | "closed";

const LOGO = "/images/brand/logo-mark.png";
const FADE_MS = 150;
/** A second click on the same item within this long opens it (also works on touch). */
const DOUBLE_CLICK_MS = 450;
/** After a listing hits its end, wheel inertia is still swallowed for this long. */
const WHEEL_LATCH_MS = 350;

const esc = (text: string) =>
  text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/* ---- Content: the project folder, as a generic Windows listing -------------- */
type Kind = "folder" | "css" | "tsx" | "image" | "json" | "md" | "ts" | "js" | "ignore" | "file";
type Entry = {
  id: string;
  name: string;
  kind: Kind;
  date: string;
  type: string;
  size?: string;
  /** Path from the project root; VS Code can show it if it is in SCREEN_FILES. */
  file?: string;
};

const dir = (name: string, date: string): Entry => ({
  id: name,
  name,
  kind: "folder",
  date,
  type: "File folder",
});
const file = (
  name: string,
  kind: Kind,
  type: string,
  size: string,
  path?: string,
): Entry => ({
  id: name,
  name,
  kind,
  date: "11/1/2026 4:59 AM",
  type,
  size,
  file: path,
});

const PROJECT: Entry[] = [
  dir(".agents", "10/13/2026 12:56 PM"),
  dir(".next", "11/4/2026 12:09 PM"),
  dir(".vercel", "9/30/2026 2:28 PM"),
  dir("app", "11/4/2026 11:41 PM"),
  dir("components", "11/4/2026 11:36 PM"),
  dir("data", "11/4/2026 1:19 PM"),
  dir("hooks", "11/3/2026 12:44 PM"),
  dir("lib", "11/4/2026 11:16 PM"),
  dir("modules", "11/1/2026 3:44 AM"),
  dir("node_modules", "9/21/2026 7:40 PM"),
  dir("playwright-report", "11/2/2026 5:35 PM"),
  dir("public", "11/3/2026 12:35 PM"),
  dir("skills", "9/21/2026 4:02 PM"),
  dir("test-results", "11/2/2026 5:35 PM"),
  dir("tests", "9/21/2026 4:01 PM"),
  dir("types", "11/4/2026 12:05 PM"),
  file(".gitignore", "ignore", "Git Ignore Source File", "1 KB"),
  file(".vercelignore", "ignore", "VERCELIGNORE File", "1 KB"),
  file("AGENTS", "md", "Markdown Source File", "3 KB"),
  file("CLAUDE", "md", "Markdown Source File", "1 KB"),
  file("components", "json", "JSON Source File", "1 KB"),
  file("eslint.config", "js", "MJS File", "1 KB"),
  file("next-env.d", "ts", "TS File", "1 KB"),
  file("next.config", "ts", "TS File", "1 KB"),
  file("package", "json", "JSON Source File", "2 KB"),
  file("package-lock", "json", "JSON Source File", "3 KB"),
  file("playwright.config", "ts", "TS File", "1 KB"),
  file("postcss.config", "js", "MJS File", "1 KB"),
  file("README", "md", "Markdown Source File", "2 KB"),
  file("tsconfig", "json", "JSON Source File", "1 KB"),
  file("vercel", "json", "JSON Source File", "1 KB"),
];

const APP_DIRS = ["approach", "capabilities", "contact", "privacy", "terms", "work"];
const APP: Entry[] = [
  ...APP_DIRS.map((name) => dir(name, "11/4/2026 11:41 PM")),
  file("apple-icon", "image", "PNG File", "6 KB"),
  file("favicon", "image", "ICO File", "4 KB"),
  file("globals", "css", "CSS Source File", "49.8 KB", "app/globals.css"),
  file("icon", "image", "PNG File", "6 KB"),
  file("layout", "tsx", "TSX File", "3 KB", "app/layout.tsx"),
  file("page", "tsx", "TSX File", "4 KB", "app/page.tsx"),
];

/** Real file names from these folders, as [name, size in KB]. */
const PLAIN: [Kind, string] = ["file", "File"];
const KINDS: Record<string, [Kind, string]> = {
  tsx: ["tsx", "TSX File"],
  ts: ["ts", "TS File"],
  css: ["css", "CSS Source File"],
  json: ["json", "JSON Source File"],
  md: ["md", "Markdown Source File"],
};
function listed(folder: string, files: [string, number][]): Entry[] {
  return files.map(([name, size]) => {
    const dot = name.lastIndexOf(".");
    const [kind, type] = (dot > 0 && KINDS[name.slice(dot + 1)]) || PLAIN;
    const entry = file(
      dot > 0 ? name.slice(0, dot) : name,
      kind,
      type,
      `${size} KB`,
      `${folder}/${name}`,
    );
    // The extension is hidden, so two files can share a name: the id keeps it.
    return { ...entry, id: name };
  });
}
const COMPONENTS: [string, number][] = [
  ["arrow.tsx", 1], ["brand.tsx", 2], ["brief-cards.tsx", 5],
  ["capability-cube.css", 5], ["capability-cube.tsx", 16], ["concept-card.tsx", 2],
  ["contact-link.tsx", 1], ["device-showcase.tsx", 8], ["image-card.tsx", 2],
  ["image-tile.tsx", 2], ["live-frame.tsx", 5], ["page-intro.tsx", 2],
  ["process-spine.tsx", 3], ["project-card.tsx", 1], ["project-grid.tsx", 2],
  ["screen-desktop.css", 17], ["screen-explorer.css", 10],
  ["screen-vscode.css", 9], ["section-heading.tsx", 1], ["section-nav.tsx", 2],
  ["section-reveal.tsx", 1], ["section.tsx", 2], ["service-card.tsx", 1],
  ["side-toc.tsx", 2], ["tablet-transition.tsx", 2], ["tile-slides.tsx", 12],
];

const DATA: [string, number][] = [
  ["approach.ts", 2], ["brief.ts", 2], ["device-showcase.ts", 2],
  ["hero-slides.ts", 2], ["legal.ts", 11], ["navigation.ts", 1], ["page.ts", 4],
  ["pages.ts", 7], ["projects.ts", 2], ["services.ts", 3], ["site.ts", 1],
];

const HOOKS: [string, number][] = [
  [".gitkeep", 1], ["index.ts", 1], ["use-device-kind.ts", 1],
  ["use-device-motion.ts", 4], ["use-hero-visibility.ts", 1],
  ["use-media-query.ts", 1], ["use-navbar-visibility.ts", 2],
  ["use-page-start-navigation.ts", 1], ["use-scrambled-copy.ts", 3],
  ["use-scroll-spy.ts", 2], ["use-section-reveal.ts", 5],
  ["use-showcase-playback.ts", 2], ["use-tablet-transition.ts", 5],
  ["use-typing-placeholder.ts", 4],
];

const LIB: [string, number][] = [
  ["contact.ts", 1], ["device-kind.ts", 1], ["device-scene.ts", 26],
  ["dispose-object.ts", 1], ["pace-scroll.ts", 5], ["rubik-cube.ts", 9],
  ["screen-browser.ts", 22], ["screen-desktop.ts", 15], ["screen-explorer.ts", 26],
  ["screen-portal.ts", 7], ["screen-video-player.ts", 16],
  ["screen-vscode.ts", 26], ["section-navigation.ts", 1],
  ["section-preview.ts", 1], ["section-screen.ts", 2], ["showcase-events.ts", 2],
  ["showcase-timing.ts", 1], ["tablet-hero-scene.ts", 14], ["tablet-scene.ts", 8],
  ["utils.ts", 1], ["window-controls.ts", 2],
];

/** Every folder a visitor can open, keyed by its path ("root" is the project itself). */
type Place = { title: string; path: string[]; items: Entry[]; view: "details" | "icons" };
const ROOT = "root";
const placeId = (path: string[]) => (path.length ? path.join("/") : ROOT);

const PLACES: Record<string, Place> = {
  [ROOT]: { title: "Temms Tech", path: [], items: PROJECT, view: "details" },
  app: { title: "app", path: ["app"], items: APP, view: "icons" },
  components: {
    title: "components",
    path: ["components"],
    items: listed("components", COMPONENTS),
    view: "details",
  },
  data: { title: "data", path: ["data"], items: listed("data", DATA), view: "details" },
  hooks: { title: "hooks", path: ["hooks"], items: listed("hooks", HOOKS), view: "details" },
  lib: { title: "lib", path: ["lib"], items: listed("lib", LIB), view: "details" },
};
for (const name of APP_DIRS) {
  PLACES[`app/${name}`] = {
    title: name,
    path: ["app", name],
    items: [file("page", "tsx", "TSX File", "1 KB", `app/${name}/page.tsx`)],
    view: "icons",
  };
}
/** Any other folder opens as an empty one. */
function placeOf(id: string): Place {
  if (PLACES[id]) return PLACES[id];
  const path = id.split("/");
  return { title: path[path.length - 1], path, items: [], view: "icons" };
}

/* ---- Icons --------------------------------------------------------------- */
const line = (body: string, size = 16) =>
  `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${body}</svg>`;
const flat = (body: string, size = 15) =>
  `<svg viewBox="0 0 20 20" width="${size}" height="${size}" aria-hidden="true">${body}</svg>`;

const FOLDER_SM =
  '<svg viewBox="0 0 20 16" width="17" height="14" aria-hidden="true"><path d="M1 3a1.5 1.5 0 0 1 1.5-1.5H7l1.8 1.8h8.7A1.5 1.5 0 0 1 19 4.8V13a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 1 13z" fill="#f2b630"/><path d="M1 6.2h18V13a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 1 13z" fill="#ffd45e"/></svg>';
const FOLDER_BIG =
  '<svg viewBox="0 0 72 56" width="72" height="56" aria-hidden="true"><path d="M3 8a5 5 0 0 1 5-5h16l6 6h34a5 5 0 0 1 5 5v35a5 5 0 0 1-5 5H8a5 5 0 0 1-5-5z" fill="#f2b630"/><rect x="9" y="14" width="54" height="26" rx="2" fill="#f4f6f8"/><path d="M3 22a5 5 0 0 1 5-5h56a5 5 0 0 1 5 5v28a5 5 0 0 1-5 5H8a5 5 0 0 1-5-5z" fill="#ffd45e"/></svg>';

const MARKS: Partial<Record<Kind, [string, string]>> = {
  json: ["{}", "#e0b43c"],
  md: ["M", "#4aa3e0"],
  ts: ["TS", "#3d8fd1"],
  js: ["JS", "#d9bd3a"],
  ignore: ["◆", "#e8734a"],
  css: ["#", "#3d8fd1"],
  tsx: ["⚛", "#3d8fd1"],
};
const fileSmall = (kind: Kind) => {
  const [mark, colour] = MARKS[kind] ?? ["", "#8a919b"];
  return `<svg viewBox="0 0 16 20" width="13" height="16" aria-hidden="true"><path d="M2 1h8l4 4v13a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1z" fill="#e9ebee"/><path d="M10 1v4h4z" fill="#b7bcc3"/><text x="8" y="15" text-anchor="middle" font-size="7.5" font-weight="700" fill="${colour}" font-family="Segoe UI, Arial, sans-serif">${mark}</text></svg>`;
};
const fileBig = (kind: Kind) => {
  const badge =
    '<circle cx="38" cy="50" r="8" fill="#2b8cf0"/><path d="m36 47-3 3 3 3m4-6 3 3-3 3" stroke="#fff" fill="none" stroke-width="1.6" stroke-linecap="round"/>';
  const mark =
    kind === "tsx"
      ? '<g transform="translate(24 28)" fill="none" stroke="#3d8fd1" stroke-width="1.7"><ellipse rx="13" ry="5"/><ellipse rx="13" ry="5" transform="rotate(60)"/><ellipse rx="13" ry="5" transform="rotate(120)"/><circle r="2.2" fill="#3d8fd1" stroke="none"/></g>'
      : '<text x="24" y="40" text-anchor="middle" font-size="26" font-weight="700" fill="#3d8fd1" font-family="Segoe UI, Arial, sans-serif">#</text>';
  return `<svg viewBox="0 0 48 60" width="48" height="60" aria-hidden="true"><path d="M4 3a3 3 0 0 1 3-3h24l13 13v44a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3z" fill="#f4f5f7"/><path d="M31 0v10a3 3 0 0 0 3 3h10z" fill="#c9ced6"/>${mark}${badge}</svg>`;
};
const imageBig = `<span class="ex-img"><img src="${LOGO}" alt="" draggable="false"></span>`;

const smallIcon = (entry: Entry) =>
  entry.kind === "folder" ? FOLDER_SM : fileSmall(entry.kind);
const bigIcon = (entry: Entry) =>
  entry.kind === "folder"
    ? FOLDER_BIG
    : entry.kind === "image"
      ? imageBig
      : fileBig(entry.kind);

const PIN = line('<path d="M9 4h6l-1 5 3 3v1.5H7V12l3-3zM12 13.5V20"/>', 11);
const PANE: { icon: string; label: string; pin?: boolean; place?: string; gap?: boolean }[] = [
  { icon: flat('<path d="M3 10 10 3l7 7v7H3z" fill="#f08a3c"/><path d="M8 17v-5h4v5" fill="#ffd2a8"/>'), label: "Home" },
  { icon: flat('<rect x="2.5" y="3.5" width="15" height="13" rx="2" fill="#2b8cf0"/><circle cx="7" cy="8" r="1.6" fill="#fff"/><path d="m4 15 4-4 3 3 2-2 3 3z" fill="#fff"/>'), label: "Gallery" },
  { icon: flat('<rect x="2" y="3" width="16" height="11" rx="1.5" fill="#3ba7ee"/><path d="M6 17h8" stroke="#8fa3b8" stroke-width="1.6" stroke-linecap="round"/>'), label: "Desktop", pin: true, gap: true },
  { icon: flat('<path d="M10 3v10M6 9l4 4 4-4M4 17h12" stroke="#2fb36d" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>'), label: "Downloads", pin: true },
  { icon: flat('<path d="M5 2h7l4 4v12H5z" fill="#cfd8e3"/><path d="M8 9h6M8 12h6M8 15h4" stroke="#6b7a8c"/>'), label: "Documents", pin: true },
  { icon: flat('<rect x="2.5" y="3.5" width="15" height="13" rx="2" fill="#2b8cf0"/><path d="m4 15 4-4 3 3 2-2 3 3z" fill="#fff"/>'), label: "Pictures", pin: true },
  { icon: flat('<circle cx="10" cy="10" r="8" fill="#f0626b"/><path d="M8 14V6.5l5-1V12" stroke="#fff" fill="none" stroke-width="1.4"/>'), label: "Music", pin: true },
  { icon: flat('<rect x="3" y="3" width="14" height="14" rx="2" fill="#7b5cf0"/><path d="M8.5 7v6l5-3z" fill="#fff"/>'), label: "Videos", pin: true },
  { icon: FOLDER_SM, label: "lib", pin: true, place: "lib" },
  { icon: FOLDER_SM, label: "app", pin: true, place: "app" },
  { icon: FOLDER_SM, label: "Screenshots" },
  { icon: FOLDER_SM, label: "Temms Tech", place: ROOT },
  { icon: flat('<rect x="2" y="3" width="16" height="11" rx="1.5" fill="#3ba7ee"/><path d="M6 17h8" stroke="#8fa3b8" stroke-width="1.6" stroke-linecap="round"/>'), label: "This PC", gap: true },
  { icon: flat('<circle cx="10" cy="10" r="7.5" fill="none" stroke="#5aa9e6" stroke-width="1.6"/><path d="M2.5 10h15M10 2.5c3 3 3 12 0 15M10 2.5c-3 3-3 12 0 15" stroke="#5aa9e6" fill="none"/>'), label: "Network" },
];

const TOOLBAR: { icon: string; label?: string; off?: boolean; sep?: boolean }[] = [
  { icon: line('<circle cx="12" cy="12" r="8.5"/><path d="M12 8v8M8 12h8"/>'), label: "New ⌄" },
  { icon: "", sep: true },
  { icon: line('<circle cx="7" cy="17" r="2.5"/><circle cx="17" cy="17" r="2.5"/><path d="M8.5 15 17 4M15.5 15 7 4"/>') },
  { icon: line('<rect x="8" y="8" width="11" height="12" rx="2"/><path d="M5 15V6a2 2 0 0 1 2-2h8"/>') },
  { icon: line('<rect x="5" y="5" width="14" height="16" rx="2"/><path d="M9 5V3.5h6V5"/>'), off: true },
  { icon: line('<rect x="3.5" y="7" width="17" height="10" rx="2"/><path d="M12 4v16"/>') },
  { icon: line('<path d="M12 15V4M8 8l4-4 4 4"/><path d="M6 12v6a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-6"/>') },
  { icon: line('<path d="M5 7h14M10 7V4.5h4V7M7 7l1 13h8l1-13"/>') },
  { icon: "", sep: true },
  { icon: line('<path d="M8 20V5M5 8l3-3 3 3M16 4v15M13 16l3 3 3-3"/>'), label: "Sort ⌄" },
  { icon: line('<path d="M4 7h16M4 12h16M4 17h16"/>'), label: "View ⌄" },
  { icon: "", sep: true },
  { icon: "···" },
];

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

export type ScreenExplorer = {
  element: HTMLElement;
  /** Open (or bring back) the window. */
  open: () => void;
  /** Like a real taskbar button: hide a visible window, bring back a hidden one. */
  toggle: () => void;
  /** Whether the window is currently out of sight. */
  hidden: () => boolean;
  dispose: () => void;
};

type ExplorerOptions = {
  /** Centre of the taskbar button, in the screen's own pixels. */
  target: () => { x: number; y: number } | undefined;
  /** Called with "open" while on show, "minimised" while shrunk into the taskbar, "closed" after close. */
  onChange: (state: ExplorerState) => void;
  /** The visitor double-clicked a file VS Code can show (a SCREEN_FILES path): the host opens it there. */
  onOpenFile: (path: string) => void;
};

/**
 * A static File Explorer window for the simulated Windows desktop. Opened from
 * its taskbar button, it is driven by the visitor's own mouse: click to select,
 * double-click a folder to open it, use the back, forward and up buttons, the
 * left pane and the address bar, scroll a long listing with the wheel or by
 * dragging its scrollbar. Double-clicking a file VS Code can show shrinks the
 * window into the taskbar and opens the file there. Windowed means snapped to
 * the right half. Nothing in it is live.
 */
export function createScreenExplorer(
  parent: HTMLElement,
  { target, onChange, onOpenFile }: ExplorerOptions,
): ScreenExplorer {
  const root = create("div", "screen-explorer");
  root.dataset.window = "closed";
  root.inert = true;
  root.addEventListener("pointerdown", (event) => event.stopPropagation());
  const win = create("div", "ex-window");
  root.appendChild(win);

  const controls = create("div", "ex-controls");
  const buttons: Record<"minimise" | "maximise" | "close", HTMLButtonElement> = {
    minimise: create("button", "ex-control"),
    maximise: create("button", "ex-control"),
    close: create("button", "ex-control"),
  };
  (Object.keys(buttons) as (keyof typeof buttons)[]).forEach((name) => {
    const button = buttons[name];
    button.type = "button";
    button.tabIndex = -1;
    button.dataset.control = name;
    button.setAttribute("aria-label", name[0].toUpperCase() + name.slice(1));
    button.innerHTML = WINDOW_ICONS[name === "maximise" ? "restore" : name];
    controls.appendChild(button);
  });

  const tab = (label: string, active = false) =>
    `<div class="ex-tab" data-active="${active}">${FOLDER_SM}<span class="ex-tab-title">${esc(label)}</span><i>×</i></div>`;
  const tabs = create(
    "div",
    "ex-tabs",
    `${tab("Temms Tech")}${tab("Temms Tech", true)}${tab("Screenshots")}<span class="ex-tab-add">+</span>`,
  );
  tabs.appendChild(controls);
  const tabTitle = tabs.querySelector<HTMLElement>('[data-active="true"] .ex-tab-title')!;

  const nav = create(
    "div",
    "ex-nav",
    `<span class="ex-navbtn" data-nav="back">←</span>
     <span class="ex-navbtn" data-nav="forward">→</span>
     <span class="ex-navbtn" data-nav="up">↑</span>
     <span class="ex-navbtn">↻</span>
     <div class="ex-address">${line('<rect x="4" y="5" width="16" height="11" rx="1.5"/><path d="M9 20h6"/>', 15)}<span class="ex-crumbs"></span></div>
     <div class="ex-search"><span class="ex-search-text"></span>${line('<circle cx="11" cy="11" r="6"/><path d="m20 20-4.2-4.2"/>', 14)}</div>`,
  );
  const crumbs = nav.querySelector<HTMLElement>(".ex-crumbs")!;
  const searchText = nav.querySelector<HTMLElement>(".ex-search-text")!;
  const navBack = nav.querySelector<HTMLElement>('[data-nav="back"]')!;
  const navForward = nav.querySelector<HTMLElement>('[data-nav="forward"]')!;
  const navUp = nav.querySelector<HTMLElement>('[data-nav="up"]')!;

  const toolbar = create(
    "div",
    "ex-toolbar",
    `${TOOLBAR.map((item) =>
      item.sep
        ? '<i class="ex-sep"></i>'
        : `<span class="ex-tool" data-off="${item.off ?? false}">${item.icon}${item.label ? `<em>${item.label}</em>` : ""}</span>`,
    ).join("")}
     <span class="ex-tool ex-details">${line('<rect x="3.5" y="5" width="17" height="14" rx="2"/><path d="M14 5v14"/>', 15)}<em>Details</em></span>`,
  );

  const pane = create(
    "div",
    "ex-pane",
    PANE.map(
      (item) =>
        `${item.gap ? '<i class="ex-pane-gap"></i>' : ""}<div class="ex-pane-item"${item.place ? ` data-place="${item.place}"` : ""}><span class="ex-pane-icon">${item.icon}</span><span>${item.label}</span>${item.pin ? `<span class="ex-pin">${PIN}</span>` : ""}</div>`,
    ).join(""),
  );
  const panePlaces = new Set(PANE.flatMap((item) => (item.place ? [item.place] : [])));
  const content = create("div", "ex-content");
  const scrollbar = create("div", "ex-scrollbar", "<i></i>");
  const thumb = scrollbar.firstElementChild as HTMLElement;
  const main = create("div", "ex-main");
  main.append(content, scrollbar);
  const body = create("div", "ex-body");
  body.append(pane, main);

  const status = create(
    "div",
    "ex-status",
    `<span class="ex-count"></span><span class="ex-sel"></span>
     <span class="ex-views"><i data-on="true">${line('<path d="M4 7h16M4 12h16M4 17h16"/>', 13)}</i><i>${line('<rect x="5" y="5" width="14" height="14" rx="2"/>', 13)}</i></span>`,
  );
  const count = status.querySelector<HTMLElement>(".ex-count")!;
  const selected = status.querySelector<HTMLElement>(".ex-sel")!;

  win.append(tabs, nav, toolbar, body, status);
  parent.appendChild(root);

  // ---- Window state ---------------------------------------------------------
  let state: WindowState = "closed";
  let restoreTo: "full" | "windowed" = "full";
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
    buttons.maximise.innerHTML = next === "full" ? WINDOW_ICONS.restore : WINDOW_ICONS.maximise;
    // A closed window starts over (back at the project folder) once it has shrunk away.
    if (next === "closed")
      later(600, () => {
        if (state === "closed") reset();
      });
    onChange(next === "closed" ? "closed" : next === "minimised" ? "minimised" : "open");
  }

  // ---- What is on show ------------------------------------------------------
  let place = ROOT;
  let history: string[] = [];
  let forward: string[] = [];
  let chosen: string | undefined;
  let lastClick: { id?: string; at: number } = { at: 0 };
  let scrollY = 0;
  let lastScrollAt = 0;
  let clip: HTMLElement | undefined;
  let rows: HTMLElement | undefined;

  const maxScroll = () =>
    rows && clip ? Math.max(0, rows.offsetHeight - clip.clientHeight) : 0;
  function paintScroll() {
    if (!rows || !clip) return;
    const max = maxScroll();
    scrollbar.dataset.show = String(max > 0);
    rows.style.transform = `translateY(${-scrollY}px)`;
    if (max <= 0) return;
    const track = scrollbar.clientHeight;
    const size = Math.max(24, (clip.clientHeight / rows.offsetHeight) * track);
    thumb.style.height = `${size}px`;
    thumb.style.transform = `translateY(${(scrollY / max) * (track - size)}px)`;
  }
  const scrollTo = (fraction: number) => {
    scrollY = Math.min(1, Math.max(0, fraction)) * maxScroll();
    lastScrollAt = performance.now();
    paintScroll();
  };

  function select(id?: string) {
    chosen = id;
    for (const node of win.querySelectorAll<HTMLElement>("[data-id]"))
      node.dataset.selected = String(node.dataset.id === id);
    const entry = placeOf(place).items.find((item) => item.id === id);
    selected.textContent = entry
      ? `1 item selected${entry.size ? `  ${entry.size}` : ""}`
      : "";
  }

  function render() {
    const { title, path, items, view } = placeOf(place);
    tabTitle.textContent = title;
    searchText.textContent = `Search ${title}`;
    crumbs.innerHTML =
      ["Documents", "Temms Tech", ...path]
        .map((name, index) =>
          index === 0
            ? `<span class="ex-crumb" data-lead>${name}</span><span class="ex-crumb ex-crumb-more">…</span>`
            : `<span class="ex-crumb" data-place="${placeId(path.slice(0, index - 1))}">${esc(name)}</span>`,
        )
        .map((crumb) => `<i>›</i>${crumb}`)
        .join("") + "<i>›</i>";
    navBack.dataset.off = String(history.length === 0);
    navForward.dataset.off = String(forward.length === 0);
    navUp.dataset.off = String(place === ROOT);
    const lead = path.length && panePlaces.has(path[0]) ? path[0] : ROOT;
    for (const node of pane.querySelectorAll<HTMLElement>("[data-place]"))
      node.dataset.selected = String(node.dataset.place === lead);
    count.textContent = `${items.length} items`;

    clip = rows = undefined;
    if (!items.length) {
      content.innerHTML = '<div class="ex-empty">This folder is empty.</div>';
    } else if (view === "details") {
      content.innerHTML = `<div class="ex-list">
        <div class="ex-head"><span class="ex-c-name"><i class="ex-check"></i>Name</span><span class="ex-c-date">Date modified</span><span class="ex-c-type">Type</span><span class="ex-c-size">Size</span></div>
        <div class="ex-clip"><div class="ex-rows">${items
          .map(
            (item) =>
              `<div class="ex-row" data-id="${esc(item.id)}"><span class="ex-c-name">${smallIcon(item)}<span class="ex-label">${esc(item.name)}</span></span><span class="ex-c-date">${item.date}</span><span class="ex-c-type">${item.type}</span><span class="ex-c-size">${item.size ?? ""}</span></div>`,
          )
          .join("")}</div></div></div>`;
      clip = content.querySelector<HTMLElement>(".ex-clip")!;
      rows = content.querySelector<HTMLElement>(".ex-rows")!;
    } else {
      content.innerHTML = `<div class="ex-grid">${items
        .map(
          (item) =>
            `<div class="ex-item" data-id="${esc(item.id)}"><span class="ex-big">${bigIcon(item)}</span><span class="ex-label">${esc(item.name)}</span></div>`,
        )
        .join("")}</div>`;
    }
    content.dataset.view = items.length ? view : "empty";
    scrollY = 0;
    scrollbar.dataset.show = "false";
    paintScroll();
    lastClick = { at: 0 };
    select(chosen && items.some((item) => item.id === chosen) ? chosen : undefined);
  }

  // ---- Timers ---------------------------------------------------------------
  let timers: ReturnType<typeof setTimeout>[] = [];
  const later = (ms: number, run: () => void) => {
    timers.push(setTimeout(run, ms));
  };
  const clearTimers = () => {
    timers.forEach(clearTimeout);
    timers = [];
  };

  // ---- Moving around --------------------------------------------------------
  // Folder changes fade the page out and back in; presses during a fade wait.
  let fading = false;
  function go(next: string, how: "open" | "back" | "forward" = "open") {
    if (fading || next === place) return;
    fading = true;
    content.dataset.fade = "";
    later(FADE_MS, () => {
      if (how === "back") forward.push(place);
      else {
        history.push(place);
        if (how === "open") forward = [];
      }
      place = next;
      chosen = undefined;
      render();
      delete content.dataset.fade;
      fading = false;
    });
  }
  const goBack = () => {
    const previous = history.pop();
    if (previous) go(previous, "back");
  };
  const goForward = () => {
    const next = forward.pop();
    if (next) go(next, "forward");
  };
  const goUp = () => {
    const { path } = placeOf(place);
    if (path.length) go(placeId(path.slice(0, -1)));
  };

  function reset() {
    clearTimers();
    fading = false;
    delete content.dataset.fade;
    place = ROOT;
    history = [];
    forward = [];
    chosen = undefined;
    render();
  }

  // Double-click: a second click on the same item soon after the first.
  // Counting clicks ourselves also works on touch, where dblclick is unreliable.
  function openEntry(id: string) {
    const { path, items } = placeOf(place);
    const entry = items.find((item) => item.id === id);
    if (!entry) return;
    if (entry.kind === "folder") go(placeId([...path, entry.id]));
    else if (entry.file && isScreenFile(entry.file)) {
      // VS Code opens the file as the window shrinks into the taskbar.
      onOpenFile(entry.file);
      set("minimised");
    }
  }
  content.addEventListener("click", (event) => {
    const node = (event.target as Element).closest<HTMLElement>("[data-id]");
    if (!node) {
      select();
      lastClick = { at: 0 };
      return;
    }
    const id = node.dataset.id!;
    const now = performance.now();
    const again = lastClick.id === id && now - lastClick.at < DOUBLE_CLICK_MS;
    lastClick = again ? { at: 0 } : { id, at: now };
    select(id);
    if (again) openEntry(id);
  });
  pane.addEventListener("click", (event) => {
    const node = (event.target as Element).closest<HTMLElement>("[data-place]");
    if (node?.dataset.place) go(node.dataset.place);
  });
  crumbs.addEventListener("click", (event) => {
    const node = (event.target as Element).closest<HTMLElement>("[data-place]");
    if (node?.dataset.place) go(node.dataset.place);
  });
  nav.addEventListener("click", (event) => {
    const node = (event.target as Element).closest<HTMLElement>("[data-nav]");
    if (!node || node.dataset.off === "true") return;
    if (node.dataset.nav === "back") goBack();
    else if (node.dataset.nav === "forward") goForward();
    else goUp();
  });

  // ---- Scrolling a long listing ---------------------------------------------
  // The wheel moves the list while it can move; at either end the page takes
  // the wheel back (after a moment, so a spinning wheel does not leak through).
  content.addEventListener(
    "wheel",
    (event) => {
      const max = maxScroll();
      if (max <= 0) return;
      const delta = event.deltaMode === 1 ? event.deltaY * 16 : event.deltaY;
      const next = Math.min(max, Math.max(0, scrollY + delta));
      if (next === scrollY) {
        if (performance.now() - lastScrollAt < WHEEL_LATCH_MS) {
          event.preventDefault();
          event.stopPropagation();
        }
        return;
      }
      event.preventDefault();
      event.stopPropagation();
      scrollY = next;
      lastScrollAt = performance.now();
      paintScroll();
    },
    { passive: false },
  );
  // Dragging the scrollbar: grab the thumb, or press the track to jump there.
  // Positions come from on-screen rectangles, so this stays right while the
  // screen is projected onto the laptop.
  let grab: number | undefined;
  function dragTo(clientY: number) {
    if (grab === undefined) return;
    const track = scrollbar.getBoundingClientRect();
    const room = track.height - thumb.getBoundingClientRect().height;
    if (room > 0) scrollTo((clientY - grab - track.top) / room);
  }
  scrollbar.addEventListener("pointerdown", (event) => {
    if (maxScroll() <= 0) return;
    event.preventDefault();
    const box = thumb.getBoundingClientRect();
    const onThumb = event.clientY >= box.top && event.clientY <= box.bottom;
    grab = onThumb ? event.clientY - box.top : box.height / 2;
    scrollbar.setPointerCapture(event.pointerId);
    scrollbar.dataset.drag = "";
    dragTo(event.clientY);
  });
  scrollbar.addEventListener("pointermove", (event) => dragTo(event.clientY));
  const letGo = () => {
    grab = undefined;
    delete scrollbar.dataset.drag;
  };
  scrollbar.addEventListener("pointerup", letGo);
  scrollbar.addEventListener("pointercancel", letGo);

  render();

  const open = () => {
    if (hidden()) set(state === "closed" ? "full" : restoreTo);
    else onChange("open");
  };

  buttons.minimise.addEventListener("click", () => set("minimised"));
  buttons.close.addEventListener("click", () => set("closed"));
  buttons.maximise.addEventListener("click", () => {
    const next = state === "full" ? "windowed" : state === "windowed" ? "full" : undefined;
    if (!next) return;
    root.dataset.snap = next;
    set(next);
  });
  win.addEventListener("animationend", () => delete root.dataset.snap);

  return {
    element: root,
    open,
    hidden,
    toggle() {
      if (hidden()) open();
      else set("minimised");
    },
    dispose() {
      clearTimers();
      root.remove();
    },
  };
}
