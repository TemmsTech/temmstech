import { SCREEN_FILES } from "@/lib/screen-files";
import { WINDOW_ICONS } from "@/lib/window-controls";

/** What the VS Code window is doing, as far as the desktop is concerned. */
export type VsCodeState = "open" | "minimised" | "closed";
type WindowState = "full" | "windowed" | "minimised" | "closed";

const esc = (text: string) =>
  text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const tok = (cls: string, text: string) =>
  `<span class="${cls}">${esc(text)}</span>`;

/** The file that types itself out. */
const CODE = [
  'import { useEffect, useState } from "react";',
  'import { supabase } from "../lib/supabaseClient";',
  "",
  '// Public "media" bucket — same one Footer.jsx pulls the logo from.',
  'const mediaUrl = (name) => (name ? supabase.storage.from("media").getPublicUrl(name).data.publicUrl : null);',
  "",
  "// Photographic hero for the About page — pulls in the same courtyard shot",
  "// used on the homepage hero, so the two pages open on a consistent note.",
  '// Replaces the old plain-white "About Us" hero section in AboutPage.jsx.',
  "//",
  "// Takes `palette` from the parent so it stays in sync with the",
  "// light/dark theme toggle, same as every other AboutPage section.",
  "//",
  "// Text (eyebrow + heading) and the background photo are fetched from",
  '// `site_content` — page="about", section_key="hero" — where',
  '// eyebrow="Est. 1999 · Wofun, Ibadan", heading="About Graceland',
  '// Heights", image_name="hero-photo4.webp" resolved via the "media"',
  "// storage bucket.",
  "",
  "const HERO_STYLE = `",
  "  .ap-hero-img {",
  "    animation: ap-hero-zoom 18s ease-out forwards;",
  "  }",
  "  @keyframes ap-hero-zoom {",
  "    from { transform: scale(1.08); }",
  "    to { transform: scale(1); }",
  "  }",
  "  @media (prefers-reduced-motion: reduce) {",
  "    .ap-hero-img { animation: none; }",
  "  }",
  "`;",
  "",
  "function AboutHero({ palette }) {",
  '  const [content, setContent] = useState({ eyebrow: "", heading: "", imageSrc: null });',
  "  const [isLoading, setIsLoading] = useState(true);",
  "  const [loadError, setLoadError] = useState(null);",
  "",
  "  useEffect(() => {",
  "    let cancelled = false;",
  "",
  "    async function loadHero() {",
  "      const { data, error } = await supabase",
  '        .from("site_content")',
  '        .select("eyebrow, heading, image_name")',
  '        .eq("page", "about")',
  '        .eq("section_key", "hero")',
  "        .maybeSingle();",
  "",
  "      if (cancelled) return;",
  "      if (error) {",
  "        setLoadError(error.message);",
  "      } else if (data) {",
  "        setContent({",
  '          eyebrow: data.eyebrow ?? "",',
  '          heading: data.heading ?? "",',
  "          imageSrc: mediaUrl(data.image_name),",
  "        });",
  "      }",
  "      setIsLoading(false);",
  "    }",
  "",
  "    loadHero();",
  "    return () => {",
  "      cancelled = true;",
  "    };",
  "  }, []);",
  "",
  "  if (loadError) return null;",
  "",
  "  return (",
  "    <section",
  "      style={{",
  '        position: "relative",',
  '        minHeight: "70vh",',
  '        display: "flex",',
  '        alignItems: "flex-end",',
  '        overflow: "hidden",',
  "        background: palette.heroBg,",
  "      }}",
  "    >",
  "      <style>{HERO_STYLE}</style>",
  "      {content.imageSrc && (",
  "        <img",
  '          className="ap-hero-img"',
  "          src={content.imageSrc}",
  '          alt=""',
  "          style={{",
  '            position: "absolute",',
  "            inset: 0,",
  '            width: "100%",',
  '            height: "100%",',
  '            objectFit: "cover",',
  "          }}",
  "        />",
  "      )}",
  "      <div",
  "        style={{",
  '          position: "absolute",',
  "          inset: 0,",
  '          background: "linear-gradient(to top, rgba(0,0,0,0.65), rgba(0,0,0,0.1))",',
  "        }}",
  "      />",
  '      <div style={{ position: "relative", padding: "0 6vw 64px", color: "#fff" }}>',
  "        <p",
  "          style={{",
  '            letterSpacing: "0.18em",',
  '            textTransform: "uppercase",',
  "            opacity: isLoading ? 0 : 1,",
  "          }}",
  "        >",
  "          {content.eyebrow}",
  "        </p>",
  '        <h1 style={{ fontSize: "clamp(2.4rem, 6vw, 4.5rem)", margin: "12px 0 0" }}>',
  "          {content.heading}",
  "        </h1>",
  "      </div>",
  "    </section>",
  "  );",
  "}",
  "",
  "export default AboutHero;",
];
const FULL_TEXT = CODE.join("\n");

/* ---- Typing pace. Everything here is in milliseconds; tune to taste. ------ */
const TYPING_PACE = {
  /** Gap between ordinary keystrokes. */
  key: [28, 72],
  /** Occasional quick burst of keys. */
  burst: [14, 26],
  /** After Enter, before the next line starts. */
  line: [130, 380],
  /** Now and then the "developer" stops to think. */
  think: [500, 1300],
  /** Chance of a thinking pause after any key, of a burst key, of a typo. */
  thinkChance: 0.009,
  burstChance: 0.14,
  typoChance: 0.014,
  /** After a typo: how long until it is noticed, and the backspace. */
  notice: [220, 420],
  backspace: 95,
  /** The finished file stays on show this long before it starts over. */
  hold: 9000,
} as const;

const rand = ([low, high]: readonly [number, number]) =>
  low + Math.random() * (high - low);

const TOKEN =
  /(\/\/.*$)|("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')|(`(?:[^`\\]|\\.)*`?)|(<\/?[A-Za-z][\w.]*|(?<!=)\/?>)|((?<![.$\w])(?:import|from|export|default|const|let|function|return|null|true|false|if|else|await|async|new)(?![\w$]))|([A-Za-z_$][\w$]*)(?=\()|(\b\d+(?:\.\d+)?\b)|([A-Za-z-]+)(?==)|([A-Za-z_$][\w$]*)(?=:)/g;
const TOKEN_CLASS = ["", "c", "s", "s", "t", "k", "f", "n", "a", "n"];

function highlightLine(line: string) {
  let out = "";
  let last = 0;
  for (const match of line.matchAll(TOKEN)) {
    const at = match.index ?? 0;
    out += esc(line.slice(last, at));
    last = at + match[0].length;
    const group = match.findIndex((value, i) => i > 0 && value !== undefined);
    out += tok(TOKEN_CLASS[group], match[0]);
  }
  return out + esc(line.slice(last));
}

/** A tiny highlighter, in the colours of VS Code's GitHub Dark theme. */
function highlight(lines: string[]) {
  let css = false;
  return lines.map((line) => {
    if (!css && line.startsWith("const HERO_STYLE") && line.endsWith("`")) {
      css = true;
      return highlightLine(line);
    }
    if (css) {
      if (line === "`;") {
        css = false;
        return `${tok("s", "`")}${tok("p", ";")}`;
      }
      return esc(line)
        .replace(/^(\s*)([@.][^{:]*?)(\s*\{)/, '$1<span class="s">$2</span>$3')
        .replace(/([\w-]+)(:)(?= )/g, '<span class="s">$1</span>$2')
        .replace(/\b(from|to)\b(?= \{)/g, '<span class="s">$1</span>');
    }
    return highlightLine(line);
  });
}

const svg = (body: string, size = 22) =>
  `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${body}</svg>`;

const ACTIVITY = [
  svg('<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/>'),
  svg('<circle cx="11" cy="11" r="6.5"/><path d="m20 20-4.2-4.2"/>'),
  svg('<circle cx="7" cy="6" r="2"/><circle cx="7" cy="18" r="2"/><circle cx="17" cy="9" r="2"/><path d="M7 8v8M17 11c0 4-6 3-10 5"/>'),
  svg('<path d="M8 5v14l11-7z"/><path d="M4 9l2-2M4 15l2 2"/>'),
  svg('<rect x="4" y="4" width="7" height="7" rx="1"/><rect x="13" y="4" width="7" height="7" rx="1"/><rect x="4" y="13" width="7" height="7" rx="1"/><path d="M16.5 13v7M13 16.5h7"/>'),
  svg('<circle cx="12" cy="12" r="8" stroke="#3b9de8"/><path d="M5 14c3-1 8-5 14-3" stroke="#3b9de8"/>'),
  svg('<path d="M4 7l8-4 8 4v10l-8 4-8-4z"/><path d="M4 7l8 4 8-4M12 11v10"/>'),
];

const REACT =
  '<svg viewBox="-12 -12 24 24" width="14" height="14" aria-hidden="true"><g fill="none" stroke="#519aba" stroke-width="1.4"><ellipse rx="10" ry="4"/><ellipse rx="10" ry="4" transform="rotate(60)"/><ellipse rx="10" ry="4" transform="rotate(120)"/></g><circle r="1.8" fill="#519aba"/></svg>';
const FILE_ICONS: Record<string, string> = {
  tsx: REACT,
  ico: '<span class="vs-glyph" style="color:#f5c542">★</span>',
  css: '<span class="vs-glyph" style="color:#519aba">#</span>',
  svg: '<span class="vs-glyph" style="color:#b18eff">◩</span>',
  png: '<span class="vs-glyph" style="color:#b18eff">◩</span>',
};

const COMPONENTS = [
  "ArticleShare.tsx", "BlogArticleDemo.tsx", "BlogArticleLink.tsx", "BlogArticleReturn.tsx",
  "BlogJournalCarousel.tsx", "BlogRelatedCarousel.t…", "BlogScrollRestore.tsx", "Button.tsx",
  "Card.tsx", "CarouselArrow.tsx", "ContentPageVisual.tsx", "ContentSectionVisual…",
  "CTASection.tsx", "DeviceDownloadLabe…", "FeaturesSection.tsx", "Footer.tsx",
  "Frame.tsx", "HashScrollManager.tsx",
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

const row = (depth: number, label: string, ext = "", extra = "", attr = "") => {
  const chev = ext ? "" : '<span class="vs-chev">›</span>';
  const icon = ext ? `<span class="vs-file-icon">${FILE_ICONS[ext] ?? ""}</span>` : "";
  return `<div class="vs-row ${extra}" style="--depth:${depth}" ${attr}>${chev}${icon}<span>${esc(label)}</span></div>`;
};

const TREE_TYPING = [
  row(0, "Untitled (Workspace)", "", "vs-strong"),
  row(1, "mog"),
  row(2, "src"),
  row(3, "app"),
  row(4, "blog"),
  row(4, "pricing"),
  row(4, "favicon.ico", "ico"),
  row(4, "globals.css", "css"),
  row(4, "icon.svg", "svg"),
  row(4, "layout.tsx", "tsx"),
  row(4, "page.tsx", "tsx", "vs-selected"),
  row(3, "components"),
  ...COMPONENTS.map((name) => row(4, name, "tsx")),
].join("");

/* ---- Files opened from File Explorer (their text lives in lib/screen-files.ts) ---- */
const CSS_TOKEN =
  /(@import)|("[^"]*")|(#[0-9a-fA-F]{3,8})\b|(--[\w-]+)(?=:)|([a-z-]+)(?=:)|([a-z-]+)(?=\()|(\b\d+(?:\.\d+)?(?:deg|ms|px|rem|%)?)|(:root)/g;
const CSS_CLASS = ["", "k", "s", "n", "v", "v", "f", "n", "v"];

function highlightCssLine(line: string) {
  let out = "";
  let last = 0;
  for (const match of line.matchAll(CSS_TOKEN)) {
    const at = match.index ?? 0;
    out += esc(line.slice(last, at));
    last = at + match[0].length;
    const group = match.findIndex((value, i) => i > 0 && value !== undefined);
    if (group === 3)
      out += `<span class="vs-swatch" style="background:${match[0]}"></span>`;
    out += tok(CSS_CLASS[group], match[0]);
  }
  return out + esc(line.slice(last));
}

const APP_DIRS = ["approach", "capabilities", "contact", "privacy", "terms", "work"];

/** The project tree around a file in app/. Rows with data-file open that file; app's folders open and close. */
function appTree(current: string, expanded: ReadonlySet<string>) {
  const file = (depth: number, label: string, ext: string, path?: string) => {
    const shown = path && SCREEN_FILES[path];
    const extra = [path === current ? "vs-selected" : "", shown ? "vs-link" : ""]
      .filter(Boolean)
      .join(" ");
    return row(depth, label, ext, extra, shown ? `data-file="${path}"` : "");
  };
  return [
    row(0, "Temms Tech", "", "vs-strong vs-open"),
    ...[".agents", ".next", ".vercel"].map((name) => row(1, name)),
    row(1, "app", "", "vs-open"),
    ...APP_DIRS.flatMap((name) => [
      row(2, name, "", `vs-link${expanded.has(name) ? " vs-open" : ""}`, `data-folder="${name}"`),
      ...(expanded.has(name) ? [file(3, "page.tsx", "tsx", `app/${name}/page.tsx`)] : []),
    ]),
    file(2, "apple-icon.png", "png"),
    file(2, "favicon.ico", "ico"),
    file(2, "globals.css", "css", "app/globals.css"),
    file(2, "icon.png", "png"),
    file(2, "layout.tsx", "tsx", "app/layout.tsx"),
    file(2, "page.tsx", "tsx", "app/page.tsx"),
    ...[
      "components", "data", "hooks", "lib", "modules", "node_modules",
      "playwright-report", "public", "skills", "test-results", "tests", "types",
    ].map((name) => row(1, name)),
  ].join("");
}

type View = {
  tree: string;
  icon: string;
  name: string;
  crumbs: string;
  language: string;
  chatBody: string;
  chatField: string;
  chatRow: string;
};

/** The view the editor opens with: AboutHero.jsx, typing itself out. */
const TYPING = "typing";
const VIEWS: { typing: View } = {
  typing: {
    tree: TREE_TYPING,
    icon: REACT,
    name: "AboutHero.jsx",
    crumbs: `C: › Users › dell › Documents › WEB DEVS › GRACELAND HEIGHTS › src › components › ${REACT} AboutHero.jsx`,
    language: "JavaScript JSX",
    chatBody: "",
    chatField: "",
    chatRow: "<span>＋</span><span>Agent</span><span>Auto</span><span>balanced</span>",
  },
};

/** A file opened from File Explorer: its own tree, tab and chat panel. */
function fileView(path: string, expanded: ReadonlySet<string>): View {
  const { language } = SCREEN_FILES[path];
  const name = path.slice(path.lastIndexOf("/") + 1);
  const icon = FILE_ICONS[language];
  return {
    tree: appTree(path, expanded),
    icon,
    name,
    crumbs: [...path.split("/").slice(0, -1), `${icon} ${name}`].join(" › "),
    language: language === "css" ? "CSS" : "TypeScript JSX",
    chatBody: `<div class="vs-sessions"><b>Sessions</b>
       <div class="vs-session"><span>Build navbar component</span><em>4 mos ago</em></div>
       <div class="vs-session"><span>Analyze prompt functionality</span><em>Failed · 5 mos ago</em></div></div>
       <div class="vs-tip"><b>Tip:</b> Work across multiple projects at once in the Agents window.</div>`,
    chatField: `<span class="vs-chip">${esc(name)}</span><span class="vs-hint">Chat with Copilot</span>`,
    chatRow: "<span>＋</span><span>Ask</span><span>Auto</span><span>Balance</span>",
  };
}

export type ScreenVsCode = {
  element: HTMLElement;
  /** Open (or bring back) the window. */
  open: () => void;
  /** Open (or bring back) the window showing a SCREEN_FILES file, as if opened from File Explorer. */
  openFile: (path: string) => void;
  /** Like a real taskbar button: hide a visible window, bring back a hidden one. */
  toggle: () => void;
  /** Whether the window is currently out of sight. */
  hidden: () => boolean;
  /** The code only types while its screen is on show and the window is open. */
  setLive: (enabled: boolean) => void;
  dispose: () => void;
};

type VsCodeOptions = {
  /** Centre of the taskbar button, in the screen's own pixels. */
  target: () => { x: number; y: number } | undefined;
  /** Called with "open" while on show, "minimised" while shrunk into the taskbar, "closed" after close. */
  onChange: (state: VsCodeState) => void;
};

/**
 * A static VS Code window for the simulated Windows desktop. It opens from the
 * desktop icon or the taskbar and shrinks back into the taskbar button, the
 * same way the browser window does. Whatever file it shows writes itself out
 * as if typed; the visitor can click files in its tree, or scroll the code by
 * hand. Nothing in it is live.
 */
export function createScreenVsCode(
  parent: HTMLElement,
  { target, onChange }: VsCodeOptions,
): ScreenVsCode {
  const root = create("div", "screen-vscode");
  root.dataset.window = "closed";
  root.inert = true;
  root.addEventListener("pointerdown", (event) => event.stopPropagation());

  const controls = create("div", "vs-controls");
  const buttons: Record<"minimise" | "maximise" | "close", HTMLButtonElement> = {
    minimise: create("button", "vs-control"),
    maximise: create("button", "vs-control"),
    close: create("button", "vs-control"),
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

  const title = create(
    "div",
    "vs-titlebar",
    `<svg class="vs-logo" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path fill="#2f9ae8" d="M17.6 2.2 9.8 9.4 5 5.8 3.3 6.7v10.6l1.7.9 4.8-3.6 7.8 7.2 3.1-1.5V3.7zM5.4 14.6V9.4l2.9 2.6zM17.6 16.4 12 12l5.6-4.4z"/></svg>
     <nav class="vs-menu">${["File", "Edit", "Selection", "View", "Go", "Run", "Terminal", "Help"].map((m) => `<span>${m}</span>`).join("")}</nav>
     <div class="vs-nav"><span>←</span><span>→</span></div>
     <div class="vs-search">Untitled (Workspace)</div>
     <div class="vs-layout"><i></i><i></i><i></i><i></i></div>`,
  );
  title.appendChild(controls);

  const activity = create(
    "div",
    "vs-activity",
    ACTIVITY.map((icon, i) => `<span data-on="${i === 0}">${icon}</span>`).join(""),
  );

  const sidebar = create(
    "div",
    "vs-sidebar",
    `<div class="vs-side-head">Explorer<span>···</span></div>
     <div class="vs-tree">${TREE_TYPING}     </div>
     <div class="vs-side-foot"><span>› Outline</span><span>› Timeline</span></div>`,
  );

  const editor = create(
    "div",
    "vs-editor",
    `<div class="vs-tabs"><div class="vs-tab"><span class="vs-tab-icon">${REACT}</span><span class="vs-tab-name">AboutHero.jsx</span><em class="vs-dirty">×</em></div></div>
     <div class="vs-crumbs">${VIEWS.typing.crumbs}</div>
     <div class="vs-code"></div>`,
  );
  const codeBox = editor.querySelector<HTMLElement>(".vs-code")!;
  const tabIcon = editor.querySelector<HTMLElement>(".vs-tab-icon")!;
  const tabName = editor.querySelector<HTMLElement>(".vs-tab-name")!;
  const crumbsBox = editor.querySelector<HTMLElement>(".vs-crumbs")!;
  const dirty = editor.querySelector<HTMLElement>(".vs-dirty")!;

  const chat = create(
    "div",
    "vs-chat",
    `<div class="vs-chat-tabs"><span data-on="true">Chat</span><span>Claude Code</span><i>⚙ ···</i></div>
     <div class="vs-chat-body"></div>
     <div class="vs-chat-input"><div class="vs-chat-field"></div>
       <div class="vs-chat-row"><span>＋</span><span>Agent</span><span>Auto</span><span>balanced</span></div></div>
     <div class="vs-chat-foot"><span>Copilot</span><span>Default permissions</span></div>`,
  );

  const chatBody = chat.querySelector<HTMLElement>(".vs-chat-body")!;
  const chatField = chat.querySelector<HTMLElement>(".vs-chat-field")!;
  const chatRow = chat.querySelector<HTMLElement>(".vs-chat-row")!;
  const treeBox = sidebar.querySelector<HTMLElement>(".vs-tree")!;

  const main = create("div", "vs-main");
  main.append(activity, sidebar, editor, chat);
  const status = create(
    "div",
    "vs-status",
    `<span class="vs-remote">⌗</span><span class="vs-right"><span class="vs-pos">Ln 1, Col 1</span> &nbsp; Spaces: 2 &nbsp; UTF-8 &nbsp; LF &nbsp; <span class="vs-lang">JavaScript JSX</span></span>`,
  );
  const position = status.querySelector<HTMLElement>(".vs-pos")!;
  const language = status.querySelector<HTMLElement>(".vs-lang")!;
  root.append(title, main, status);
  parent.appendChild(root);

  let state: WindowState = "closed";
  let restoreTo: "full" | "windowed" = "full";

  const hidden = () => state === "minimised" || state === "closed";
  function aim() {
    const point = target();
    if (!point) return;
    // Offsets from the window's own centre, in layout pixels.
    root.style.setProperty("--min-x", `${point.x - root.offsetLeft - root.offsetWidth / 2}px`);
    root.style.setProperty("--min-y", `${point.y - root.offsetTop - root.offsetHeight / 2}px`);
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
    // A closed editor starts over the next time it is opened, as the typing view.
    if (next === "closed") {
      expanded.clear();
      setView(TYPING);
      if (!reduceMotion) {
        buffer = "";
        index = 0;
        typo = "none";
        finished = false;
        follow = true;
        render();
      }
    }
    sync();
    onChange(next === "closed" ? "closed" : next === "minimised" ? "minimised" : "open");
  }

  // ---- The file writes itself, keystroke by keystroke ----------------------
  const reduceMotion =
    typeof matchMedia === "function" &&
    matchMedia("(prefers-reduced-motion: reduce)").matches;
  const rows: { row: HTMLElement; num: HTMLElement; text: HTMLElement; html: string }[] = [];
  let buffer = "";
  let index = 0;
  let typo: "none" | "noticing" = "none";
  let typoStart = 0;
  let timer: ReturnType<typeof setTimeout> | undefined;
  let live = false;
  let finished = false;
  let view = TYPING;
  let text = FULL_TEXT;
  let highlighter = highlight;
  // The editor follows the typing down the page until the visitor scrolls up.
  let follow = true;
  const expanded = new Set<string>();

  function render() {
    const lines = buffer.split("\n");
    const html = highlighter(lines);
    const last = lines.length - 1;
    while (rows.length < lines.length) {
      const row = create("div", "vs-line");
      const num = create("b", "");
      const text = create("span", "");
      num.textContent = String(rows.length + 1);
      row.append(num, text);
      codeBox.appendChild(row);
      rows.push({ row, num, text, html: "" });
    }
    while (rows.length > lines.length) rows.pop()?.row.remove();
    rows.forEach((entry, i) => {
      const next = (html[i] || "") + (i === last && !finished ? '<span class="vs-caret"></span>' : "") || "&nbsp;";
      if (entry.html !== next) {
        entry.html = next;
        entry.text.innerHTML = next;
      }
      entry.row.dataset.current = String(i === last);
    });
    position.textContent = `Ln ${lines.length}, Col ${lines[last].length + 1}`;
    dirty.textContent = finished || !buffer ? "×" : "●";
    if (follow) codeBox.scrollTop = codeBox.scrollHeight;
  }

  function setView(next: string) {
    if (next === view || (next !== TYPING && !SCREEN_FILES[next])) return;
    view = next;
    clearTimeout(timer);
    timer = undefined;
    const parts = next === TYPING ? VIEWS.typing : fileView(next, expanded);
    if (next === TYPING) {
      text = FULL_TEXT;
      highlighter = highlight;
    } else {
      const { language: kind, lines } = SCREEN_FILES[next];
      text = lines.join("\n");
      highlighter = kind === "css" ? (all) => all.map(highlightCssLine) : highlight;
    }
    treeBox.innerHTML = parts.tree;
    tabIcon.innerHTML = parts.icon;
    tabName.textContent = parts.name;
    crumbsBox.innerHTML = parts.crumbs;
    language.textContent = parts.language;
    chatBody.innerHTML = parts.chatBody;
    chatField.innerHTML = parts.chatField;
    chatRow.innerHTML = parts.chatRow;
    rows.length = 0;
    codeBox.replaceChildren();
    buffer = reduceMotion ? text : "";
    index = 0;
    typo = "none";
    finished = reduceMotion;
    follow = true;
    codeBox.scrollTop = 0;
    render();
    sync();
  }

  // A file in the tree opens; one of app's folders opens or closes.
  treeBox.addEventListener("click", (event) => {
    const clicked = (event.target as Element).closest<HTMLElement>(".vs-row");
    if (!clicked) return;
    if (clicked.dataset.file) setView(clicked.dataset.file);
    else if (clicked.dataset.folder && view !== TYPING) {
      const name = clicked.dataset.folder;
      if (!expanded.delete(name)) expanded.add(name);
      treeBox.innerHTML = fileView(view, expanded).tree;
    }
  });

  // Scrolling by hand stops the editor following the typing; reaching the
  // bottom again makes it follow once more. Only the visitor's own scrolling
  // counts, not the editor's smooth scroll after each key.
  let touched = 0;
  const touch = () => {
    touched = performance.now();
  };
  codeBox.addEventListener("wheel", touch, { passive: true });
  codeBox.addEventListener("pointerdown", touch);
  codeBox.addEventListener("pointermove", (event) => {
    if (event.buttons) touch();
  });
  codeBox.addEventListener("scroll", () => {
    if (performance.now() - touched > 600) return;
    follow = codeBox.scrollTop + codeBox.clientHeight >= codeBox.scrollHeight - 24;
  });

  // One keystroke. Returns how long until the next one.
  function keystroke(): number {
    if (index >= text.length) {
      finished = true;
      render();
      buffer = "";
      index = 0;
      follow = true;
      return TYPING_PACE.hold;
    }
    finished = false;
    if (typo === "noticing") {
      buffer = buffer.slice(0, typoStart);
      typo = "none";
      render();
      return TYPING_PACE.backspace;
    }
    const char = text[index];
    if (char === "\n") {
      buffer += "\n";
      index += 1;
      // The editor indents the new line by itself.
      const indent = /^ */.exec(text.slice(index))![0];
      buffer += indent;
      index += indent.length;
      render();
      return rand(TYPING_PACE.line);
    }
    if (/[a-z]/.test(char) && Math.random() < TYPING_PACE.typoChance) {
      typoStart = buffer.length;
      buffer += "qwertyuiopasdfghjklzxcvbnm"[Math.floor(Math.random() * 26)];
      typo = "noticing";
      render();
      return rand(TYPING_PACE.notice);
    }
    buffer += char;
    index += 1;
    render();
    let delay =
      Math.random() < TYPING_PACE.burstChance ? rand(TYPING_PACE.burst) : rand(TYPING_PACE.key);
    if (",.;:(){}[]=<>".includes(char)) delay += rand([20, 90]);
    if (char === " ") delay += rand([0, 45]);
    if (Math.random() < TYPING_PACE.thinkChance) delay += rand(TYPING_PACE.think);
    return delay;
  }

  function tick() {
    timer = setTimeout(tick, keystroke());
  }
  function sync() {
    const run = live && !hidden() && !reduceMotion;
    clearTimeout(timer);
    timer = undefined;
    if (run) timer = setTimeout(tick, 350);
  }
  if (reduceMotion) {
    buffer = text;
    finished = true;
  }
  render();

  const open = () => {
    if (hidden()) set(state === "closed" ? "full" : restoreTo);
    else onChange("open");
  };

  buttons.minimise.addEventListener("click", () => set("minimised"));
  buttons.close.addEventListener("click", () => set("closed"));
  buttons.maximise.addEventListener("click", () => {
    if (state === "full") set("windowed");
    else if (state === "windowed") set("full");
  });

  return {
    element: root,
    open,
    openFile(path) {
      if (!SCREEN_FILES[path]) return;
      const parts = path.split("/");
      if (parts.length === 3) expanded.add(parts[1]);
      setView(path);
      open();
    },
    hidden,
    setLive(enabled) {
      live = enabled;
      sync();
    },
    toggle() {
      if (hidden()) open();
      else set("minimised");
    },
    dispose() {
      clearTimeout(timer);
      live = false;
      root.remove();
    },
  };
}
