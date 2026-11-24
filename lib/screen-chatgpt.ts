import { CHATGPT_ICON } from "@/lib/screen-app-icons";
import {
  THREADS,
  type Block,
  type Command,
  type Message,
  type Source,
  type Thread,
} from "@/lib/screen-chatgpt-threads";
import { WINDOW_ICONS } from "@/lib/window-controls";

/** What the ChatGPT window is doing, as far as the desktop is concerned. */
export type ChatgptState = "open" | "minimised" | "closed";
type WindowState = "full" | "windowed" | "minimised" | "closed";

/** After a scroll box hits its end, wheel inertia is still swallowed for this long. */
const WHEEL_LATCH_MS = 350;
/** The chat shows its "jump to latest" button once it is this far from the bottom. */
const JUMP_DISTANCE = 60;
/** How many sources show before "View all". */
const SOURCES_SHOWN = 3;
const FIRST_THREAD = THREADS[0].id;
const NEW_CHAT = "new";
const PROJECTS = ["TemmsTech", "Mog", "Don Elclasico"];

const icon = (body: string, size = 16) =>
  `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${body}</svg>`;

const ICONS = {
  back: icon('<path d="M19 12H5M11 6l-6 6 6 6"/>', 14),
  forward: icon('<path d="M5 12h14M13 6l6 6-6 6"/>', 14),
  sidebar: icon('<rect x="3.5" y="4.5" width="17" height="15" rx="2.5"/><path d="M9.5 4.5v15"/>', 14),
  home: icon('<path d="M4 11 12 4l8 7v8.5a.5.5 0 0 1-.5.5H15v-5.5H9V20H4.5a.5.5 0 0 1-.5-.5z"/>', 15),
  chats: icon('<rect x="4" y="6" width="12" height="9" rx="2"/><path d="M9 18.5h6l3 2v-8"/>', 15),
  clock: icon('<circle cx="12" cy="12" r="8"/><path d="M12 8v4.5l3 1.5"/>', 15),
  library: icon('<path d="M5 5v14M9.5 5v14M14 6l4.5 13"/>', 15),
  target: icon('<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3.2"/>', 15),
  dots: icon('<path d="M6 12h.01M12 12h.01M18 12h.01"/>', 15),
  branch: icon('<circle cx="7" cy="6" r="2"/><circle cx="7" cy="18" r="2"/><circle cx="17" cy="8" r="2"/><path d="M7 8v8M17 10c0 4-10 2-10 6"/>', 15),
  chevron: icon('<path d="m7 10 5 5 5-5"/>', 11),
  chevronRight: icon('<path d="m10 7 5 5-5 5"/>', 11),
  bell: icon('<path d="M6.5 16.5v-5a5.5 5.5 0 0 1 11 0v5l1.5 1.5h-14zM10 20.5h4"/>', 14),
  search: icon('<circle cx="11" cy="11" r="6"/><path d="m20 20-4.2-4.2"/>', 14),
  compose: icon('<path d="M5 19h4L19.5 8.5a2.1 2.1 0 0 0-3-3L6 16zM14.5 7.5l3 3"/>', 14),
  share: icon('<path d="M12 15V4.5M8 8l4-4 4 4M6 12.5v5a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-5"/>', 14),
  list: icon('<path d="M5 7h.01M5 12h.01M5 17h.01M9.5 7H19M9.5 12H19M9.5 17H19"/>', 14),
  panel: icon('<rect x="3.5" y="4.5" width="17" height="15" rx="2.5"/><path d="M14.5 4.5v15"/>', 14),
  plus: icon('<path d="M12 5v14M5 12h14"/>', 15),
  mic: icon('<rect x="9" y="3.5" width="6" height="11" rx="3"/><path d="M5.5 11.5a6.5 6.5 0 0 0 13 0M12 18v2.5"/>', 14),
  up: icon('<path d="M12 19V6M6.5 11.5 12 6l5.5 5.5"/>', 15),
  down: icon('<path d="M12 5v14M6 13l6 6 6-6"/>', 15),
  alert: icon('<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5v5.5M12 16.5h.01"/>', 14),
  term: icon('<rect x="4" y="5" width="16" height="14" rx="2.5"/><path d="m8 10 3 2-3 2M13 15h3.5"/>', 13),
  globe: icon('<circle cx="12" cy="12" r="8.5"/><path d="M3.5 12h17M12 3.5c2.5 2.4 3.5 5.2 3.5 8.5s-1 6.1-3.5 8.5c-2.5-2.4-3.5-5.2-3.5-8.5s1-6.1 3.5-8.5z"/>', 14),
  image: icon('<rect x="4" y="5" width="16" height="14" rx="2.5"/><circle cx="9" cy="10" r="1.5"/><path d="m5 17 5-4.5 3.5 3L16 13l3.5 4"/>', 14),
  file: icon('<path d="M6 3.5h8l4 4v13a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-16a1 1 0 0 1 1-1zM8.5 12h7M8.5 15.5h7"/>', 14),
  folder: icon('<path d="M4 7.5a1.5 1.5 0 0 1 1.5-1.5H10l2 2.5h6.5A1.5 1.5 0 0 1 20 10v7.5a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 17.5z"/>', 14),
  link: icon('<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>', 14),
  download: icon('<path d="M12 4v11M7 11l5 5 5-5M5 19.5h14"/>', 14),
};

const SOURCE_ICON = { image: ICONS.image, file: ICONS.file, app: CHATGPT_ICON };

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

const ranHtml = (commands: Command[]) =>
  `<div class="gp-ran" data-open="false"><button type="button" tabindex="-1" class="gp-ran-head" data-ran>${ICONS.term}<span>Ran commands</span></button><div class="gp-ran-body">${commands
    .map(
      (entry) =>
        `<pre><b>$ ${esc(entry.cmd)}</b>${entry.out ? `\n${esc(entry.out)}` : ""}</pre>`,
    )
    .join("")}</div></div>`;

const blockHtml = (block: Block) => {
  if ("p" in block) return `<p>${block.p}</p>`;
  if ("ran" in block) return ranHtml(block.ran);
  return `<div class="gp-divider"><span>${ICONS.alert}${esc(block.divider)}</span></div>`;
};

const messageHtml = (message: Message) => {
  if (message.who === "user")
    return `<div class="gp-user"><div class="gp-bubble"${message.long ? ' data-long data-clamped' : ""}><p>${esc(message.text)}</p>${message.long ? `<button type="button" tabindex="-1" class="gp-more" data-more><span>Show more</span>${ICONS.chevron}</button>` : ""}</div></div>`;
  if (message.who === "notice")
    return `<div class="gp-notice">${ICONS.alert}<span>${esc(message.text)}</span></div>`;
  return `<div class="gp-reply">${message.blocks.map(blockHtml).join("")}</div>`;
};

const sourceRow = (entry: Source) =>
  `<button type="button" tabindex="-1" class="gp-row" data-source="${entry.id}"><span class="gp-row-icon">${SOURCE_ICON[entry.kind]}</span><span class="gp-row-text">${esc(entry.name)}</span></button>`;

const EMPTY_CHAT = `<div class="gp-empty"><span class="gp-empty-logo">${CHATGPT_ICON}</span><h2>What should we work on?</h2></div>`;

export type ScreenChatgpt = {
  element: HTMLElement;
  /** Open (or bring back) the window. */
  open: () => void;
  /** Like a real taskbar button: hide a visible window, bring back a hidden one. */
  toggle: () => void;
  /** Whether the window is currently out of sight. */
  hidden: () => boolean;
  dispose: () => void;
};

type ChatgptOptions = {
  /** Centre of the taskbar button, in the screen's own pixels. */
  target: () => { x: number; y: number } | undefined;
  /** Called with "open" while on show, "minimised" while shrunk into the taskbar, "closed" after close. */
  onChange: (state: ChatgptState) => void;
};

/** What a chat remembers while another one is on show. */
type ChatMemory = { scroll: number | "bottom" };

/**
 * A ChatGPT (Codex) desktop window for the simulated Windows desktop: an icon
 * rail, a sidebar of chats, a conversation that scrolls ("Ran commands" rows
 * open to show what ran, long messages open with Show more), the Outputs and
 * Sources card on the right (rows are selectable) and the reply box. Nothing
 * is live. Closing resets it to how it first opened.
 */
export function createScreenChatgpt(
  parent: HTMLElement,
  { target, onChange }: ChatgptOptions,
): ScreenChatgpt {
  const root = create("div", "screen-chatgpt");
  root.dataset.window = "closed";
  root.inert = true;
  root.addEventListener("pointerdown", (event) => event.stopPropagation());
  const win = create("div", "gp-window");
  root.appendChild(win);

  const controls = (["minimise", "maximise", "close"] as const)
    .map(
      (name) =>
        `<button type="button" tabindex="-1" class="gp-control" data-control="${name}" aria-label="${name[0].toUpperCase()}${name.slice(1)}">${WINDOW_ICONS[name === "maximise" ? "restore" : name]}</button>`,
    )
    .join("");

  win.innerHTML = `
    <div class="gp-bar">
      <span class="gp-tool">${ICONS.back}</span>
      <span class="gp-tool" data-dim>${ICONS.forward}</span>
      <button type="button" tabindex="-1" class="gp-tool gp-tool-btn" data-action="side" aria-label="Toggle sidebar">${ICONS.sidebar}</button>
      <span class="gp-menu"><span>File</span><span>Edit</span><span>View</span><span>Help</span></span>
      <span class="gp-controls">${controls}</span>
    </div>
    <div class="gp-shell" data-side="open">
      <nav class="gp-rail">
        <span class="gp-rail-btn" data-on>${ICONS.home}</span>
        <span class="gp-rail-btn">${ICONS.chats}</span>
        <span class="gp-rail-btn">${ICONS.clock}</span>
        <span class="gp-rail-btn">${ICONS.library}</span>
        <span class="gp-rail-btn">${ICONS.target}</span>
        <span class="gp-rail-btn">${ICONS.dots}</span>
        <span class="gp-rail-btn gp-rail-git">${ICONS.branch}</span>
      </nav>
      <aside class="gp-side">
        <div class="gp-side-top"><span class="gp-side-name"><b>Codex</b>${ICONS.chevron}</span><span class="gp-side-tools"><span>${ICONS.bell}</span><span>${ICONS.search}</span></span></div>
        <button type="button" tabindex="-1" class="gp-new" data-new>${ICONS.compose}<b>New chat</b></button>
        <button type="button" tabindex="-1" class="gp-projects" data-projects data-open="false"><b>Projects</b>${ICONS.chevronRight}</button>
        <div class="gp-project-list">${PROJECTS.map((name) => `<span>${ICONS.folder}${name}</span>`).join("")}</div>
        <small class="gp-side-label">Recents</small>
        <div class="gp-side-list gp-scroll"></div>
        <div class="gp-side-foot"><span class="gp-dl">${ICONS.download}</span><span class="gp-av">OJ</span></div>
      </aside>
      <div class="gp-main" data-info="open">
        <header class="gp-head">
          <span class="gp-title"><b></b>${ICONS.chevron}</span>
          <span class="gp-head-tools">
            <span class="gp-head-btn">${ICONS.share}</span>
            <button type="button" tabindex="-1" class="gp-head-btn gp-head-toggle" data-action="info" aria-label="Outputs and sources" data-on>${ICONS.list}</button>
            <span class="gp-head-btn">${ICONS.panel}</span>
          </span>
        </header>
        <section class="gp-chat">
          <div class="gp-thread gp-scroll"><div class="gp-thread-in"></div></div>
          <div class="gp-dock">
            <button type="button" tabindex="-1" class="gp-jump" aria-label="Scroll to latest" data-show="false">${ICONS.down}</button>
            <div class="gp-limit"><span><b>You’re out of Codex and Work usage</b><small>Upgrade for more now, or wait for usage to reset on Nov 28, 1:55 PM</small></span><u>Upgrade</u></div>
            <div class="gp-composer">
              <span class="gp-prompt">Work with Codex</span>
              <div class="gp-composer-row">
                <span class="gp-plus">${ICONS.plus}</span>
                <span class="gp-access">${ICONS.alert}<b>Full access</b></span>
                <span class="gp-model"><b>5.6 Luna</b><span>Light</span>${ICONS.chevron}</span>
                <span class="gp-mic">${ICONS.mic}</span>
                <span class="gp-send">${ICONS.up}</span>
              </div>
            </div>
          </div>
        </section>
        <aside class="gp-info">
          <div class="gp-card gp-outputs"><div class="gp-card-head"><b>Outputs</b><span>${ICONS.plus}</span></div><div class="gp-outputs-list"></div></div>
          <div class="gp-card gp-sources"><div class="gp-card-head"><b>Sources</b><span>${ICONS.plus}</span></div><div class="gp-sources-list"></div></div>
        </aside>
      </div>
    </div>`;
  parent.appendChild(root);

  const shell = win.querySelector<HTMLElement>(".gp-shell")!;
  const main = win.querySelector<HTMLElement>(".gp-main")!;
  const sideList = win.querySelector<HTMLElement>(".gp-side-list")!;
  const projects = win.querySelector<HTMLElement>(".gp-projects")!;
  const title = win.querySelector<HTMLElement>(".gp-title b")!;
  const thread = win.querySelector<HTMLElement>(".gp-thread")!;
  const threadIn = win.querySelector<HTMLElement>(".gp-thread-in")!;
  const jump = win.querySelector<HTMLElement>(".gp-jump")!;
  const dock = win.querySelector<HTMLElement>(".gp-dock")!;
  const outputsCard = win.querySelector<HTMLElement>(".gp-outputs")!;
  const outputsList = win.querySelector<HTMLElement>(".gp-outputs-list")!;
  const sourcesCard = win.querySelector<HTMLElement>(".gp-sources")!;
  const sourcesList = win.querySelector<HTMLElement>(".gp-sources-list")!;
  const maximise = win.querySelector<HTMLElement>('[data-control="maximise"]')!;
  const infoToggle = win.querySelector<HTMLElement>('[data-action="info"]')!;

  // ---- The chats ---------------------------------------------------------------
  let threads: Thread[] = [...THREADS];
  let activeId = FIRST_THREAD;
  let allSources = false;
  let infoOpen = true;
  const memory = new Map<string, ChatMemory>();
  const active = () => threads.find((entry) => entry.id === activeId) ?? threads[0];
  const room = () => thread.scrollHeight - thread.clientHeight;

  function renderSide() {
    sideList.innerHTML = threads
      .map(
        (entry) =>
          `<button type="button" tabindex="-1" class="gp-chat-item" data-thread="${entry.id}"${entry.id === activeId ? " data-active" : ""}>${esc(entry.title)}</button>`,
      )
      .join("");
  }

  /** The Outputs and Sources card: only the parts the chat has, and only if the card is on. */
  function renderInfo() {
    const chat = active();
    const has = chat.outputs.length > 0 || chat.sources.length > 0;
    main.dataset.info = infoOpen && has ? "open" : "closed";
    infoToggle.toggleAttribute("data-on", infoOpen && has);
    outputsCard.hidden = chat.outputs.length === 0;
    sourcesCard.hidden = chat.sources.length === 0;
    outputsList.innerHTML = chat.outputs
      .map(
        (url) =>
          `<button type="button" tabindex="-1" class="gp-row" data-output="${esc(url)}"><span class="gp-row-icon">${ICONS.globe}</span><span class="gp-row-text">${esc(url)}</span></button>`,
      )
      .join("");
    const shown = allSources ? chat.sources : chat.sources.slice(0, SOURCES_SHOWN);
    const more =
      chat.sources.length > SOURCES_SHOWN
        ? `<button type="button" tabindex="-1" class="gp-row gp-viewall" data-viewall><span class="gp-row-icon">${ICONS.link}</span><span class="gp-row-text">${allSources ? "Show less" : "View all"}</span></button>`
        : "";
    sourcesList.innerHTML = shown.map(sourceRow).join("") + more;
  }

  function remember() {
    memory.set(activeId, {
      scroll: room() - thread.scrollTop <= 2 ? "bottom" : thread.scrollTop,
    });
  }
  /** Show a chat: its messages, its card, and where it was scrolled to. */
  function show(id: string) {
    activeId = id;
    const chat = active();
    const saved = memory.get(id);
    allSources = false;
    title.textContent = chat.title;
    dock.dataset.limit = String(!!chat.limit);
    threadIn.innerHTML = chat.messages.length
      ? chat.messages.map(messageHtml).join("")
      : EMPTY_CHAT;
    renderSide();
    renderInfo();
    thread.scrollTop = !saved || saved.scroll === "bottom" ? room() : saved.scroll;
    updateJump();
  }
  function openThread(id: string) {
    if (id === activeId) return;
    remember();
    show(id);
  }
  function newChat() {
    if (!threads.some((entry) => entry.id === NEW_CHAT))
      threads = [{ id: NEW_CHAT, title: "New chat", messages: [], outputs: [], sources: [] }, ...threads];
    memory.delete(NEW_CHAT);
    if (activeId === NEW_CHAT) return;
    remember();
    show(NEW_CHAT);
  }

  // ---- Chat: "jump to latest" ------------------------------------------------------
  function updateJump() {
    jump.dataset.show = String(room() - thread.scrollTop > JUMP_DISTANCE);
  }
  thread.addEventListener("scroll", updateJump, { passive: true });
  const toBottom = (smooth: boolean) =>
    thread.scrollTo({ top: room(), behavior: smooth ? "smooth" : "instant" });

  // ---- Window state ----------------------------------------------------------------
  let state: WindowState = "closed";
  let restoreTo: "full" | "windowed" = "full";
  let closeTimer: ReturnType<typeof setTimeout> | undefined;
  const hidden = () => state === "minimised" || state === "closed";

  function reset() {
    threads = [...THREADS];
    memory.clear();
    infoOpen = true;
    shell.dataset.side = "open";
    projects.dataset.open = "false";
    shell.classList.remove("gp-projects-open");
    show(FIRST_THREAD);
    toBottom(false);
    updateJump();
  }
  reset();

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
    const fromClosed = state === "closed";
    state = next;
    root.dataset.window = next;
    root.inert = hidden();
    maximise.innerHTML = next === "full" ? WINDOW_ICONS.restore : WINDOW_ICONS.maximise;
    clearTimeout(closeTimer);
    // A window opened from closed starts at the latest message.
    if (fromClosed && !hidden()) toBottom(false);
    // A closed window starts over once it has shrunk away.
    if (next === "closed")
      closeTimer = setTimeout(() => {
        if (state === "closed") reset();
      }, 600);
    onChange(next === "closed" ? "closed" : next === "minimised" ? "minimised" : "open");
  }

  const open = () => {
    if (hidden()) set(state === "closed" ? "full" : restoreTo);
    else onChange("open");
  };

  root.addEventListener("click", (event) => {
    const el = event.target as HTMLElement;
    if (el.closest(".gp-jump")) return toBottom(true);
    const ran = el.closest<HTMLElement>("[data-ran]");
    if (ran) {
      const box = ran.parentElement!;
      box.dataset.open = String(box.dataset.open !== "true");
      return updateJump();
    }
    const more = el.closest<HTMLElement>("[data-more]");
    if (more) {
      const bubble = more.parentElement!;
      const clamped = bubble.hasAttribute("data-clamped");
      if (clamped) bubble.removeAttribute("data-clamped");
      else bubble.setAttribute("data-clamped", "");
      more.querySelector("span")!.textContent = clamped ? "Show less" : "Show more";
      return updateJump();
    }
    const source = el.closest<HTMLElement>("[data-source], [data-output]");
    if (source) {
      win.querySelectorAll<HTMLElement>("[data-source], [data-output]").forEach((row) => {
        if (row === source) row.dataset.selected = "";
        else delete row.dataset.selected;
      });
      return;
    }
    if (el.closest("[data-viewall]")) {
      allSources = !allSources;
      return renderInfo();
    }
    const chat = el.closest<HTMLElement>("[data-thread]");
    if (chat?.dataset.thread) return openThread(chat.dataset.thread);
    if (el.closest("[data-new]")) return newChat();
    if (el.closest("[data-projects]")) {
      const next = projects.dataset.open !== "true";
      projects.dataset.open = String(next);
      shell.classList.toggle("gp-projects-open", next);
      return;
    }
    if (el.closest('[data-action="side"]')) {
      shell.dataset.side = shell.dataset.side === "open" ? "closed" : "open";
      return updateJump();
    }
    if (el.closest('[data-action="info"]')) {
      infoOpen = !infoOpen;
      renderInfo();
      return updateJump();
    }
    const hit = el.closest<HTMLElement>("[data-control]");
    if (!hit) return;
    if (hit.dataset.control === "minimise") set("minimised");
    else if (hit.dataset.control === "close") set("closed");
    else if (hit.dataset.control === "maximise") {
      if (state === "full") set("windowed");
      else if (state === "windowed") set("full");
    }
  });

  // The wheel scrolls the chat or the chat list while it can; at either end the page takes it
  // back (after a moment, so a spinning wheel does not leak through).
  let lastScrollAt = 0;
  root.addEventListener(
    "wheel",
    (event) => {
      const box = (event.target as HTMLElement).closest<HTMLElement>(".gp-scroll");
      if (!box) return;
      const span = box.scrollHeight - box.clientHeight;
      if (span <= 1) return;
      const delta = event.deltaMode === 1 ? event.deltaY * 16 : event.deltaY;
      const next = Math.min(span, Math.max(0, box.scrollTop + delta));
      if (next === box.scrollTop) {
        if (performance.now() - lastScrollAt < WHEEL_LATCH_MS) {
          event.preventDefault();
          event.stopPropagation();
        }
        return;
      }
      event.preventDefault();
      event.stopPropagation();
      lastScrollAt = performance.now();
      box.scrollTop = next;
    },
    { passive: false },
  );

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
