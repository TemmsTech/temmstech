import { WINDOW_ICONS } from "@/lib/window-controls";

/** What the Brave window is doing, as far as the desktop is concerned. */
export type BraveState = "open" | "minimised" | "closed";
type WindowState = "full" | "windowed" | "minimised" | "closed";
type TabId = "temmstech" | "claude" | "chatgpt";

const icon = (body: string, size = 17) =>
  `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${body}</svg>`;

const ICONS = {
  back: icon('<path d="M19 12H5M11 6l-6 6 6 6"/>'),
  forward: icon('<path d="M5 12h14M13 6l6 6-6 6"/>'),
  reload: icon('<path d="M19.5 12a7.5 7.5 0 1 1-2.4-5.5M19.5 4.5v4.6h-4.6"/>'),
  bookmark: icon('<path d="M7 4.5h10v15l-5-3.6-5 3.6z"/>'),
  info: icon('<circle cx="12" cy="12" r="8.5"/><path d="M12 11v5.2M12 8h.01"/>', 15),
  download: icon('<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5v7M8.8 11.8l3.2 3.2 3.2-3.2"/>'),
  sidebar: icon('<rect x="3.5" y="5" width="17" height="14" rx="2"/><path d="M14 5v14"/>'),
  wallet: icon('<path d="M4 8.5A2.5 2.5 0 0 1 6.5 6H18v12H6.5A2.5 2.5 0 0 1 4 15.5z"/><path d="M18 10.5h2.5v3H18a1.5 1.5 0 0 1 0-3z"/>'),
  sparkle: icon('<path d="M12 4l1.8 5.2L19 11l-5.2 1.8L12 18l-1.8-5.2L5 11l5.2-1.8zM18.5 3.5v3M17 5h3"/>'),
  vpn: icon('<path d="M12 3.5l7 2.6v5.4c0 4.3-3 7.3-7 9-4-1.7-7-4.7-7-9V6.1z"/><path d="M9 12l2.2 2.2L15.2 10"/>'),
  menu: icon('<path d="M4.5 7h15M4.5 12h15M4.5 17h15"/>'),
  chevron: icon('<path d="m7 10 5 5 5-5"/>', 15),
  plus: icon('<path d="M12 5v14M5 12h14"/>', 16),
  shields:
    '<svg viewBox="0 0 24 24" width="17" height="17" aria-hidden="true"><path d="M12 2.8l7.2 2.2-1 4.6 1.3 2.3-3 5.6-2.6 1.7h-3.8l-2.6-1.7-3-5.6 1.3-2.3-1-4.6z" fill="#fb542b"/><path d="M12 8.6l3.2 1.4-.8 3.7-2.4 1.6-2.4-1.6-.8-3.7z" fill="#fff"/></svg>',
  rewards:
    '<svg viewBox="0 0 24 24" width="17" height="17" aria-hidden="true"><path d="M12 3.2 21.2 19H2.8z" fill="#ff5000"/><path d="M12 9.4 16.4 17H7.6z" fill="#fff"/></svg>',
} as const;

const FAVICONS = {
  temmstech: '<img src="/images/brand/logo-mark.png" alt="" draggable="false" />',
  claude:
    '<svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><path d="M12 3v18M3 12h18M5.6 5.6l12.8 12.8M18.4 5.6 5.6 18.4" stroke="#d97757" stroke-width="2.6" stroke-linecap="round"/></svg>',
  chatgpt:
    '<svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><path d="M12 2.8l7.2 4.1v8.2L12 19.2l-7.2-4.1V6.9z" fill="none" stroke="#fff" stroke-width="1.8" stroke-linejoin="round"/><path d="M12 7.5l4 2.3v4.4L12 16.5l-4-2.3V9.8z" fill="none" stroke="#fff" stroke-width="1.8" stroke-linejoin="round"/></svg>',
} as const;

type Tab = { id: TabId; title: string; url: string };

/** The addresses of the Claude and ChatGPT tabs are made up. */
const TABS: readonly Tab[] = [
  { id: "temmstech", title: "TemmsTech — Built by us. Used by millions.", url: "localhost:3000" },
  {
    id: "claude",
    title: "Building a multi-app desktop prototype",
    url: "claude.ai/chat/7f3a1c52-0d4e-4b9a-8e21-5c6d9b2a41f0",
  },
  {
    id: "chatgpt",
    title: "Add Leading Zeros Excel",
    url: "chatgpt.com/c/5b2e9d41-7a3c-4f08-b6d2-1e8c0a947f35",
  },
];

/** The recent chats and the account shown in the ChatGPT sidebar. Made up. */
const GPT_RECENTS = [
  "Add Leading Zeros Excel",
  "Summarise meeting notes",
  "Draft a polite email",
  "Explain CSS grid layouts",
  "Plan a weekend itinerary",
] as const;
const GPT_NAME = "ALEX JOHNSON";

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

const shot = (name: string) =>
  `<img class="br-shot" src="/images/brave/page-${name}.webp" alt="" draggable="false" />`;

const paneMarkup = (id: TabId) => {
  const extra =
    id === "chatgpt"
      ? `<ol class="br-gpt-recents">${GPT_RECENTS.map(
          (title, index) => `<li${index === 0 ? " data-on" : ""}>${esc(title)}</li>`,
        ).join("")}</ol>
        <div class="br-gpt-me"><span class="br-gpt-av">${esc(
          GPT_NAME.split(" ").map((part) => part[0]).join(""),
        )}</span><b>${esc(GPT_NAME)}</b><span>Free</span></div>`
      : "";
  return `<div class="br-pane" data-pane="${id}"><div class="br-stage">${shot(id)}${extra}</div></div>`;
};

export type ScreenBrave = {
  element: HTMLElement;
  /** Open (or bring back) the window. */
  open: () => void;
  /** Like a real taskbar button: hide a visible window, bring back a hidden one. */
  toggle: () => void;
  /** Whether the window is currently out of sight. */
  hidden: () => boolean;
  dispose: () => void;
};

type BraveOptions = {
  /** Centre of the taskbar button, in the screen's own pixels. */
  target: () => { x: number; y: number } | undefined;
  /** Called with "open" while on show, "minimised" while shrunk into the taskbar, "closed" after close. */
  onChange: (state: BraveState) => void;
};

/**
 * A static Brave window for the simulated Windows desktop. Three tabs (this
 * site, Claude, ChatGPT) switch when pressed; each page is a picture, so
 * nothing in it is live. The Claude and ChatGPT addresses, and the ChatGPT
 * account and chat list, are made up. Closing resets it to the first tab.
 */
export function createScreenBrave(
  parent: HTMLElement,
  { target, onChange }: BraveOptions,
): ScreenBrave {
  const root = create("div", "screen-brave");
  root.dataset.window = "closed";
  root.dataset.current = TABS[0].id;
  root.inert = true;
  root.addEventListener("pointerdown", (event) => event.stopPropagation());
  const win = create("div", "br-window");
  root.appendChild(win);

  const controls = (["minimise", "maximise", "close"] as const)
    .map(
      (name) =>
        `<button type="button" tabindex="-1" class="br-control" data-control="${name}" aria-label="${name[0].toUpperCase()}${name.slice(1)}">${WINDOW_ICONS[name === "maximise" ? "restore" : name]}</button>`,
    )
    .join("");

  win.innerHTML = `
    <div class="br-tabs">
      ${TABS.map(
        (tab) =>
          `<button type="button" tabindex="-1" class="br-tab" data-tab="${tab.id}"><span class="br-fav">${FAVICONS[tab.id]}</span><span class="br-tab-title">${esc(tab.title)}</span><i aria-hidden="true">×</i></button>`,
      ).join("")}
      <span class="br-tab-add">${ICONS.plus}</span>
      <span class="br-tab-more">${ICONS.chevron}</span>
      <span class="br-controls">${controls}</span>
    </div>
    <div class="br-bar">
      <span class="br-nav"><span class="br-tool">${ICONS.back}</span><span class="br-tool" data-dim>${ICONS.forward}</span><span class="br-tool">${ICONS.reload}</span></span>
      <span class="br-tool br-bookmark">${ICONS.bookmark}</span>
      <div class="br-url"><span class="br-info">${ICONS.info}</span><span class="br-url-text"></span><span class="br-url-end">${ICONS.shields}${ICONS.rewards}</span></div>
      <span class="br-tools">${[ICONS.download, ICONS.sidebar, ICONS.wallet, ICONS.sparkle, ICONS.vpn, ICONS.menu]
        .map((glyph) => `<span class="br-tool">${glyph}</span>`)
        .join("")}</span>
    </div>
    <div class="br-page">${TABS.map((tab) => paneMarkup(tab.id)).join("")}</div>`;
  parent.appendChild(root);

  const urlText = win.querySelector<HTMLElement>(".br-url-text")!;
  const maximise = win.querySelector<HTMLElement>('[data-control="maximise"]')!;

  function setTab(id: TabId) {
    root.dataset.current = id;
    win.querySelectorAll<HTMLElement>("[data-tab]").forEach((tab) => {
      if (tab.dataset.tab === id) tab.dataset.active = "";
      else delete tab.dataset.active;
    });
    win.querySelectorAll<HTMLElement>("[data-pane]").forEach((pane) => {
      if (pane.dataset.pane === id) pane.dataset.on = "";
      else delete pane.dataset.on;
    });
    urlText.textContent = TABS.find((tab) => tab.id === id)?.url ?? "";
  }
  setTab(TABS[0].id);

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
    // A closed window starts over once it has shrunk away.
    if (next === "closed")
      closeTimer = setTimeout(() => {
        if (state === "closed") setTab(TABS[0].id);
      }, 600);
    onChange(next === "closed" ? "closed" : next === "minimised" ? "minimised" : "open");
  }

  const open = () => {
    if (hidden()) set(state === "closed" ? "full" : restoreTo);
    else onChange("open");
  };

  root.addEventListener("click", (event) => {
    const hit = (event.target as HTMLElement).closest<HTMLElement>("[data-tab],[data-control]");
    if (!hit) return;
    if (hit.dataset.tab) setTab(hit.dataset.tab as TabId);
    else if (hit.dataset.control === "minimise") set("minimised");
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
      root.remove();
    },
  };
}
