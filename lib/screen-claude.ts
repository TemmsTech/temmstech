import { claudeLogo } from "@/lib/screen-app-icons";
import {
  THREADS,
  type Block,
  type FileEntry,
  type Lang,
  type Message,
  type Thread,
} from "@/lib/screen-claude-threads";
import { WINDOW_ICONS } from "@/lib/window-controls";

/** What the Claude window is doing, as far as the desktop is concerned. */
export type ClaudeState = "open" | "minimised" | "closed";
type WindowState = "full" | "windowed" | "minimised" | "closed";
type Panel = "open" | "wide" | "closed";

/** After a scroll box hits its end, wheel inertia is still swallowed for this long. */
const WHEEL_LATCH_MS = 350;
/** The thread shows its "jump to latest" button once it is this far from the bottom. */
const JUMP_DISTANCE = 60;
const COPIED_MS = 1400;
/** The chat that is on show when the window first opens, and again after it is closed. */
const FIRST_THREAD = THREADS[0].id;
const NEW_CHAT = "new";

const icon = (body: string, size = 16) =>
  `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${body}</svg>`;

const ICONS = {
  menu: icon('<path d="M4 7h16M4 12h16M4 17h16"/>', 15),
  sidebar: icon('<rect x="3.5" y="4.5" width="17" height="15" rx="2.5"/><path d="M9.5 4.5v15"/>', 15),
  back: icon('<path d="m14.5 6-6 6 6 6"/>', 14),
  forward: icon('<path d="m9.5 6 6 6-6 6"/>', 14),
  chevron: icon('<path d="m7 10 5 5 5-5"/>', 12),
  plus: icon('<path d="M12 5v14M5 12h14"/>', 15),
  mic: icon('<rect x="9" y="3.5" width="6" height="11" rx="3"/><path d="M5.5 11.5a6.5 6.5 0 0 0 13 0M12 18v2.5"/>', 14),
  wave: icon('<path d="M5 10v4M9 7v10M13 4.5v15M17 8v8M21 10.5v3"/>', 14),
  send: icon('<path d="M19 6v6.5a2 2 0 0 1-2 2H6M10 10.5l-4 4 4 4"/>', 14),
  copy: icon('<rect x="8.5" y="8.5" width="11" height="11" rx="2"/><path d="M15.5 8.5v-2a2 2 0 0 0-2-2h-7a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h2"/>', 13),
  check: icon('<path d="m5 12.5 4.5 4.5L19 7.5"/>', 13),
  shrink: icon('<path d="M5 14.5h5.5V20M19 9.5h-5.5V4M10.5 14.5 4.5 20.5M13.5 9.5l6-6"/>', 14),
  expand: icon('<path d="M14 4.5h5.5V10M10 19.5H4.5V14M19.5 4.5l-6 6M4.5 19.5l6-6"/>', 14),
  close: icon('<path d="m6 6 12 12M18 6 6 18"/>', 14),
  down: icon('<path d="M12 5v14M6 13l6 6 6-6"/>', 15),
  code: icon('<path d="m9 7-5 5 5 5M15 7l5 5-5 5"/>', 15),
  zip: icon('<path d="M6 3.5h8l4 4v13a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-16a1 1 0 0 1 1-1zM12 4v5M12 11v1.5M12 14.5V16"/>', 15),
  doc: icon('<path d="M6 3.5h8l4 4v13a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-16a1 1 0 0 1 1-1zM8.5 12h7M8.5 15.5h7M8.5 8.5H11"/>', 15),
  download: icon('<path d="M12 4v11M7 11l5 5 5-5M5 19.5h14"/>', 14),
  chat: icon('<path d="M5 6.5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-6l-4.5 3.5v-3.5H7a2 2 0 0 1-2-2z"/>', 14),
};

const fileGlyph = (file: FileEntry) =>
  file.type === "ZIP" ? ICONS.zip : file.lang === "text" ? ICONS.doc : ICONS.code;

const esc = (text: string) =>
  text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

// ---- A small syntax colourer (no library): comments, strings, keywords, numbers ----
type Rule = { re: RegExp; cls: string | ((word: string, rest: string) => string | undefined) };
const STRING = /"(?:\\.|[^"\\\n])*"|'(?:\\.|[^'\\\n])*'/y;
const JS_WORDS = new Set([
  "const", "let", "var", "function", "return", "if", "else", "new", "true", "false", "null", "for", "of", "in",
  "typeof", "import", "from", "export", "type", "interface", "async", "await", "as", "default", "void",
  "undefined", "class", "extends", "throw", "try", "catch", "switch", "case", "break", "continue", "readonly",
]);
const JS_RULES: Rule[] = [
  { re: /\/\/[^\n]*/y, cls: "cm" },
  { re: /\/\*[\s\S]*?\*\//y, cls: "cm" },
  { re: STRING, cls: "st" },
  { re: /`(?:\\.|[^`\\\n])*`/y, cls: "st" },
  { re: /\d+(?:\.\d+)?/y, cls: "nu" },
  { re: /[A-Za-z_$][\w$]*/y, cls: (word) => (JS_WORDS.has(word) ? "kw" : undefined) },
];
const RULES: Record<Lang, Rule[]> = {
  js: JS_RULES,
  ts: JS_RULES,
  css: [
    { re: /\/\*[\s\S]*?\*\//y, cls: "cm" },
    { re: STRING, cls: "st" },
    { re: /#[0-9a-fA-F]{3,8}\b/y, cls: "st" },
    { re: /-?\d+(?:\.\d+)?[a-z%]*/y, cls: "nu" },
    { re: /-{0,2}[A-Za-z_][\w-]*/y, cls: (_word, rest) => (/^\s*:/.test(rest) ? "kw" : undefined) },
  ],
  html: [
    { re: /<!--[\s\S]*?-->/y, cls: "cm" },
    { re: /<!?\/?[A-Za-z][\w-]*|\/?>/y, cls: "kw" },
    { re: STRING, cls: "st" },
    { re: /[A-Za-z_:][\w:.-]*(?=\s*=)/y, cls: "at" },
  ],
  text: [],
};

function colour(code: string, lang: Lang) {
  const rules = RULES[lang];
  let out = "";
  let at = 0;
  while (at < code.length) {
    let done = false;
    for (const rule of rules) {
      rule.re.lastIndex = at;
      const match = rule.re.exec(code);
      if (!match || !match[0]) continue;
      const cls =
        typeof rule.cls === "string"
          ? rule.cls
          : rule.cls(match[0], code.slice(at + match[0].length, at + match[0].length + 4));
      if (!cls) continue;
      // A token that spans lines (a block comment) is closed and reopened at each break,
      // so every row of the code panel holds balanced markup.
      out += esc(match[0])
        .split("\n")
        .map((part) => `<i class="tk-${cls}">${part}</i>`)
        .join("\n");
      at += match[0].length;
      done = true;
      break;
    }
    if (done) continue;
    // Plain text: take a whole word so keyword rules never start mid-word.
    const word = /^[\w$-]+/.exec(code.slice(at));
    const text = word ? word[0] : code[at];
    out += esc(text);
    at += text.length;
  }
  return out;
}

/** The code as numbered rows; long lines wrap under their number. */
const numbered = (code: string, lang: Lang) =>
  colour(code, lang)
    .split("\n")
    .map(
      (line, index) =>
        `<div class="cl-line"><span class="cl-n">${index + 1}</span><span class="cl-c">${line || "\u200b"}</span></div>`,
    )
    .join("");

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

const fileCard = (file: FileEntry) =>
  `<button type="button" tabindex="-1" class="cl-file" data-file="${file.id}"><span class="cl-file-icon">${fileGlyph(file)}</span><span class="cl-file-text"><b>${esc(file.name)}</b><small>${file.type === "ZIP" ? "ZIP" : `Code &middot; ${file.type}`}</small></span></button>`;

function blockHtml(block: Block, files: readonly FileEntry[]) {
  if ("p" in block) return `<p>${block.p}</p>`;
  if ("list" in block)
    return `<ul>${block.list.map((item) => `<li>${item}</li>`).join("")}</ul>`;
  if ("code" in block)
    return `<div class="cl-codebox"><div class="cl-codehead"><span>${block.label}</span><button type="button" tabindex="-1" class="cl-copy-mini" data-copy="inline">${ICONS.copy}<b>Copy</b></button></div><pre>${colour(block.code, block.lang)}</pre></div>`;
  const cards = block.files
    .map((id) => files.find((entry) => entry.id === id))
    .filter((entry): entry is FileEntry => !!entry)
    .map(fileCard)
    .join("");
  const all = block.all
    ? `<button type="button" tabindex="-1" class="cl-all">${ICONS.download}<b>Download all</b></button>`
    : "";
  return `<div class="cl-files">${cards}${all}</div>`;
}

function messageHtml(message: Message, files: readonly FileEntry[]) {
  if (message.who === "user")
    return `<div class="cl-msg cl-user"><p>${esc(message.text)}</p></div>`;
  return `<div class="cl-msg cl-claude">${message.blocks.map((block) => blockHtml(block, files)).join("")}</div>`;
}

const EMPTY_CHAT = `<div class="cl-empty"><span class="cl-empty-logo">${claudeLogo(34)}</span><h2>How can I help you today?</h2></div>`;

export type ScreenClaude = {
  element: HTMLElement;
  /** Open (or bring back) the window. */
  open: () => void;
  /** Like a real taskbar button: hide a visible window, bring back a hidden one. */
  toggle: () => void;
  /** Whether the window is currently out of sight. */
  hidden: () => boolean;
  dispose: () => void;
};

type ClaudeOptions = {
  /** Centre of the taskbar button, in the screen's own pixels. */
  target: () => { x: number; y: number } | undefined;
  /** Called with "open" while on show, "minimised" while shrunk into the taskbar, "closed" after close. */
  onChange: (state: ClaudeState) => void;
};

/** What a chat remembers while another one is on show. */
type ChatMemory = { scroll: number | "bottom"; file?: string; panel: Panel };

/**
 * A Claude desktop window for the simulated Windows desktop: a sidebar of
 * chats, a conversation that scrolls, file cards that open in a code panel on
 * the right (line numbers, scrolling, a Copy button) and the title bar and
 * reply box of the real app. Each chat remembers its scroll position and open
 * file. Nothing is live. Closing resets it to how it first opened.
 */
export function createScreenClaude(
  parent: HTMLElement,
  { target, onChange }: ClaudeOptions,
): ScreenClaude {
  const root = create("div", "screen-claude");
  root.dataset.window = "closed";
  root.inert = true;
  root.addEventListener("pointerdown", (event) => event.stopPropagation());
  const win = create("div", "cl-window");
  root.appendChild(win);

  const controls = (["minimise", "maximise", "close"] as const)
    .map(
      (name) =>
        `<button type="button" tabindex="-1" class="cl-control" data-control="${name}" aria-label="${name[0].toUpperCase()}${name.slice(1)}">${WINDOW_ICONS[name === "maximise" ? "restore" : name]}</button>`,
    )
    .join("");

  win.innerHTML = `
    <div class="cl-bar">
      <span class="cl-tool">${ICONS.menu}</span>
      <button type="button" tabindex="-1" class="cl-tool cl-tool-btn" data-action="side" aria-label="Toggle sidebar">${ICONS.sidebar}</button>
      <span class="cl-tool">${ICONS.back}</span>
      <span class="cl-tool" data-dim>${ICONS.forward}</span>
      <span class="cl-title"><b></b>${ICONS.chevron}</span>
      <span class="cl-plan"><span>Free plan</span><i>&middot;</i><u>Upgrade</u><em aria-hidden="true">&times;</em></span>
      <span class="cl-controls">${controls}</span>
    </div>
    <div class="cl-shell" data-side="open">
      <aside class="cl-side">
        <button type="button" tabindex="-1" class="cl-new" data-new>${ICONS.plus}<b>New chat</b></button>
        <small class="cl-side-label">Recents</small>
        <div class="cl-side-list cl-scroll"></div>
        <div class="cl-me"><span class="cl-avatar">D</span><span class="cl-me-text"><b>Dev</b><small>Free plan</small></span></div>
      </aside>
      <div class="cl-body" data-panel="open">
        <section class="cl-chat">
          <div class="cl-thread cl-scroll"><div class="cl-thread-in"></div></div>
          <button type="button" tabindex="-1" class="cl-jump" aria-label="Scroll to latest" data-show="false">${ICONS.down}</button>
          <div class="cl-dock">
            <div class="cl-reply"><span>Reply</span>${ICONS.send}</div>
            <div class="cl-dock-row">
              <span class="cl-dock-tools"><span>${ICONS.plus}</span><span>${ICONS.mic}</span><span>${ICONS.wave}</span><span>${ICONS.chevron}</span></span>
              <small>Claude is AI and can make mistakes.</small>
              <span class="cl-model"><b>Sonnet 5.5</b><span>Medium</span><span class="cl-manual">Manual</span></span>
            </div>
          </div>
        </section>
        <aside class="cl-panel">
          <div class="cl-panel-head">
            <span class="cl-panel-name"><b></b><span></span></span>
            <span class="cl-copy"><button type="button" tabindex="-1" class="cl-copy-main" data-copy="panel">${ICONS.copy}<b>Copy</b></button><i class="cl-copy-more">${ICONS.chevron}</i></span>
            <button type="button" tabindex="-1" class="cl-icon-btn" data-panel-action="wide" aria-label="Expand">${ICONS.expand}</button>
            <button type="button" tabindex="-1" class="cl-icon-btn" data-panel-action="close" aria-label="Close panel">${ICONS.close}</button>
          </div>
          <div class="cl-code cl-scroll"></div>
        </aside>
      </div>
    </div>`;
  parent.appendChild(root);

  const shell = win.querySelector<HTMLElement>(".cl-shell")!;
  const body = win.querySelector<HTMLElement>(".cl-body")!;
  const sideList = win.querySelector<HTMLElement>(".cl-side-list")!;
  const title = win.querySelector<HTMLElement>(".cl-title b")!;
  const thread = win.querySelector<HTMLElement>(".cl-thread")!;
  const threadIn = win.querySelector<HTMLElement>(".cl-thread-in")!;
  const jump = win.querySelector<HTMLElement>(".cl-jump")!;
  const code = win.querySelector<HTMLElement>(".cl-code")!;
  const panelName = win.querySelector<HTMLElement>(".cl-panel-name b")!;
  const panelType = win.querySelector<HTMLElement>(".cl-panel-name span")!;
  const maximise = win.querySelector<HTMLElement>('[data-control="maximise"]')!;
  const expandButton = win.querySelector<HTMLElement>('[data-panel-action="wide"]')!;

  // ---- The chats ---------------------------------------------------------------
  let threads: Thread[] = [...THREADS];
  let activeId = FIRST_THREAD;
  let fileId: string | undefined;
  const memory = new Map<string, ChatMemory>();
  const active = () => threads.find((entry) => entry.id === activeId) ?? threads[0];
  const room = () => thread.scrollHeight - thread.clientHeight;

  function renderSide() {
    sideList.innerHTML = threads
      .map(
        (entry) =>
          `<button type="button" tabindex="-1" class="cl-thread-item" data-thread="${entry.id}"${entry.id === activeId ? " data-active" : ""}><span class="cl-thread-icon">${ICONS.chat}</span><span class="cl-thread-title">${esc(entry.title)}</span></button>`,
      )
      .join("");
  }

  // ---- Side panel: which file, and how wide ------------------------------------
  function showFile(id: string) {
    const entry = active().files.find((file) => file.id === id);
    if (!entry) return;
    fileId = entry.id;
    panelName.textContent = entry.name;
    panelType.textContent = ` \u00b7 ${entry.type}`;
    code.innerHTML = numbered(entry.code, entry.lang);
    code.scrollTop = 0;
    win.querySelectorAll<HTMLElement>("[data-file]").forEach((card) => {
      if (card.dataset.file === entry.id) card.dataset.selected = "";
      else delete card.dataset.selected;
    });
    if (body.dataset.panel === "closed") setPanel("open");
  }
  function setPanel(next: Panel) {
    // A chat with no file open has nothing to show in the panel.
    const shown: Panel = next !== "closed" && !fileId ? "closed" : next;
    body.dataset.panel = shown;
    expandButton.innerHTML = shown === "wide" ? ICONS.shrink : ICONS.expand;
    expandButton.setAttribute("aria-label", shown === "wide" ? "Shrink" : "Expand");
    updateJump();
  }

  function remember() {
    memory.set(activeId, {
      scroll: room() - thread.scrollTop <= 2 ? "bottom" : thread.scrollTop,
      file: fileId,
      panel: body.dataset.panel as Panel,
    });
  }
  /** Show a chat: its messages, its open file and panel, and where it was scrolled to. */
  function show(id: string) {
    activeId = id;
    const chat = active();
    const saved = memory.get(id);
    title.textContent = chat.title;
    threadIn.innerHTML = chat.messages.length
      ? chat.messages.map((message) => messageHtml(message, chat.files)).join("")
      : EMPTY_CHAT;
    fileId = undefined;
    const wanted = saved ? saved.file : chat.firstFile;
    if (wanted) showFile(wanted);
    setPanel(saved ? saved.panel : wanted ? "open" : "closed");
    renderSide();
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
      threads = [{ id: NEW_CHAT, title: "New chat", messages: [], files: [] }, ...threads];
    memory.delete(NEW_CHAT);
    if (activeId === NEW_CHAT) return;
    remember();
    show(NEW_CHAT);
  }

  // ---- Thread: "jump to latest" -------------------------------------------------
  function updateJump() {
    jump.dataset.show = String(room() - thread.scrollTop > JUMP_DISTANCE);
  }
  thread.addEventListener("scroll", updateJump, { passive: true });
  const toBottom = (smooth: boolean) =>
    thread.scrollTo({ top: room(), behavior: smooth ? "smooth" : "instant" });

  // ---- Copy feedback (nothing is written to the real clipboard) ----------------
  const timers = new Map<HTMLElement, ReturnType<typeof setTimeout>>();
  function flashCopied(button: HTMLElement) {
    const label = button.querySelector("b");
    const glyph = button.querySelector("svg");
    if (!label || !glyph) return;
    clearTimeout(timers.get(button));
    glyph.outerHTML = ICONS.check;
    label.textContent = "Copied";
    button.dataset.done = "";
    timers.set(
      button,
      setTimeout(() => {
        const now = button.querySelector("svg");
        if (now) now.outerHTML = ICONS.copy;
        label.textContent = "Copy";
        delete button.dataset.done;
      }, COPIED_MS),
    );
  }

  // ---- Window state --------------------------------------------------------------
  let state: WindowState = "closed";
  let restoreTo: "full" | "windowed" = "full";
  let closeTimer: ReturnType<typeof setTimeout> | undefined;
  const hidden = () => state === "minimised" || state === "closed";

  function reset() {
    threads = [...THREADS];
    memory.clear();
    shell.dataset.side = "open";
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
    const copy = el.closest<HTMLElement>("[data-copy]");
    if (copy) return flashCopied(copy);
    if (el.closest(".cl-jump")) return toBottom(true);
    const card = el.closest<HTMLElement>("[data-file]");
    if (card?.dataset.file) return showFile(card.dataset.file);
    const chat = el.closest<HTMLElement>("[data-thread]");
    if (chat?.dataset.thread) return openThread(chat.dataset.thread);
    if (el.closest("[data-new]")) return newChat();
    if (el.closest('[data-action="side"]')) {
      shell.dataset.side = shell.dataset.side === "open" ? "closed" : "open";
      return updateJump();
    }
    const action = el.closest<HTMLElement>("[data-panel-action]")?.dataset.panelAction;
    if (action === "close") return setPanel("closed");
    if (action === "wide") return setPanel(body.dataset.panel === "wide" ? "open" : "wide");
    const hit = el.closest<HTMLElement>("[data-control]");
    if (!hit) return;
    if (hit.dataset.control === "minimise") set("minimised");
    else if (hit.dataset.control === "close") set("closed");
    else if (hit.dataset.control === "maximise") {
      if (state === "full") set("windowed");
      else if (state === "windowed") set("full");
    }
  });

  // The wheel scrolls the chat, the code or the chat list while it can; at either end the page
  // takes it back (after a moment, so a spinning wheel does not leak through).
  let lastScrollAt = 0;
  root.addEventListener(
    "wheel",
    (event) => {
      const box = (event.target as HTMLElement).closest<HTMLElement>(".cl-scroll");
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
      timers.forEach((timer) => clearTimeout(timer));
      root.remove();
    },
  };
}
