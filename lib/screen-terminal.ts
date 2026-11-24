import { TERMINAL_BANNER, TERMINAL_LOG } from "@/data/terminal-log";
import { WINDOW_ICONS } from "@/lib/window-controls";

/** What the Terminal window is doing, as far as the desktop is concerned. */
export type TerminalState = "open" | "minimised" | "closed";
type WindowState = "full" | "windowed" | "minimised" | "closed";

const TITLE = "next-server (v16.3.5)";
/** Keystroke pace for a typed command, and the pauses around the session. */
const KEY_MS: [number, number] = [45, 110];
const START_MS = 500;
const ENTER_MS = 380;
/** A second command waits this long after the output before its prompt shows. */
const PROMPT_MS = 700;
/** Printed lines come quickly; a line that starts a new event waits a little first. */
const LINE_MS: [number, number] = [5, 14];
const EVENT_MS: [number, number] = [90, 220];
/** After a listing hits its end, wheel inertia is still swallowed for this long. */
const WHEEL_LATCH_MS = 350;

const PROMPT_PATTERN = /^PS C:\\[^>]*> /;
const EVENT_PATTERN = /^( GET |○|✓ Compiled|✓ Finished|\[browser\] THREE|⨯ \.\/)/;

const esc = (text: string) =>
  text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const span = (colour: string, text: string) =>
  `<span class="tm-${colour}">${esc(text)}</span>`;

const isPrompt = (line: string) => PROMPT_PATTERN.test(line);
const commandOf = (line: string) => line.replace(PROMPT_PATTERN, "");
const commandMarkup = (command: string) => {
  const [name, ...rest] = command.split(" ");
  return `${span("b", name)}${rest.length ? ` ${esc(rest.join(" "))}` : ""}`;
};

/** One printed line, coloured the way Windows Terminal shows this output. */
function paint(line: string): string {
  const prompt = PROMPT_PATTERN.exec(line);
  if (prompt) return esc(prompt[0]) + commandMarkup(commandOf(line));
  let found: RegExpExecArray | null;
  if ((found = /^npm (notice run)(.*)$/.exec(line)))
    return `npm ${span("c", found[1])}${esc(found[2])}`;
  if ((found = /^(▲ Next\.js [\d.]+)(.*)$/.exec(line))) return span("m", found[1]) + esc(found[2]);
  if ((found = /^(✓)(.*)$/.exec(line))) return span("g", found[1]) + esc(found[2]);
  if ((found = /^(⨯)(.*)$/.exec(line))) return span("r", found[1]) + esc(found[2]);
  if ((found = /^( GET \S+ )(\d{3})( in \S+ )(\(.*\))$/.exec(line)))
    return esc(found[1]) + span(found[2] === "200" ? "g" : "r", found[2]) + esc(found[3]) + span("k", found[4]);
  if ((found = /^(\[browser\])( .*)$/.exec(line))) {
    const warn = / (THREE\.|Detected )/.test(found[2]);
    const fail = / Failed /.test(found[2]);
    const tail = / \(lib\/[^)]*\)$/.exec(found[2]);
    const body = tail ? found[2].slice(0, tail.index) : found[2];
    return (
      span("u", found[1]) +
      (warn ? span("y", body) : fail ? span("r", body) : esc(body)) +
      (tail ? span("k", tail[0]) : "")
    );
  }
  if ((found = /^(\(\d+,\d+-\d+\): warning .*?)( \(lib\/[^)]*\))?$/.exec(line)))
    return span("y", found[1]) + (found[2] ? span("k", found[2]) : "");
  if ((found = /^(\s+[\w]+: )(-?\d+)(,?)$/.exec(line)))
    return esc(found[1]) + span("y", found[2]) + esc(found[3]);
  if ((found = /^(\s+[\w]+: )('[^']*')(,?)$/.exec(line)))
    return esc(found[1]) + span("g", found[2]) + esc(found[3]);
  if ((found = /^(\s*\| )(\^+)$/.exec(line))) return esc(found[1]) + span("r", found[2]);
  return esc(line);
}

const rand = ([low, high]: [number, number]) => low + Math.random() * (high - low);

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

const POWERSHELL =
  '<svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><rect x="0.5" y="2.5" width="15" height="11" rx="2" fill="#2a4675"/><path d="m4.6 5.8 3 2.2-3 2.2" fill="none" stroke="#fff" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/><path d="M8.8 10.4h3" stroke="#fff" stroke-width="1.3" stroke-linecap="round"/></svg>';

export type ScreenTerminal = {
  element: HTMLElement;
  /** Open (or bring back) the window. */
  open: () => void;
  /** Like a real taskbar button: hide a visible window, bring back a hidden one. */
  toggle: () => void;
  /** Whether the window is currently out of sight. */
  hidden: () => boolean;
  /** The command only types while the screen is live and the window is on show. */
  setLive: (enabled: boolean) => void;
  dispose: () => void;
};

type TerminalOptions = {
  /** Centre of the taskbar button, in the screen's own pixels. */
  target: () => { x: number; y: number } | undefined;
  /** Called with "open" while on show, "minimised" while shrunk into the taskbar, "closed" after close. */
  onChange: (state: TerminalState) => void;
};

/**
 * A static Windows Terminal window for the simulated Windows desktop. Opened
 * from its taskbar button, it plays a dev session (data/terminal-log.ts): each
 * command types out, its output prints, and the view follows the newest line.
 * The wheel scrolls it back while it can. Windowed means snapped to the left
 * half, where the lines wrap like the real thing. A closed window starts over
 * the next time it opens. Nothing in it is live.
 */
export function createScreenTerminal(
  parent: HTMLElement,
  { target, onChange }: TerminalOptions,
): ScreenTerminal {
  const root = create("div", "screen-terminal");
  root.dataset.window = "closed";
  root.inert = true;
  root.addEventListener("pointerdown", (event) => event.stopPropagation());
  const win = create("div", "tm-window");
  root.appendChild(win);

  const controls = create("div", "tm-controls");
  const buttons: Record<"minimise" | "maximise" | "close", HTMLButtonElement> = {
    minimise: create("button", "tm-control"),
    maximise: create("button", "tm-control"),
    close: create("button", "tm-control"),
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

  const tabs = create(
    "div",
    "tm-tabs",
    `<div class="tm-tab">${POWERSHELL}<span class="tm-tab-title">${TITLE}</span><i>×</i></div><span class="tm-tab-add">+</span><span class="tm-tab-add">⌄</span>`,
  );
  tabs.appendChild(controls);

  const body = create("div", "tm-body");
  const screen = create("div", "tm-screen");
  const text = create("pre", "tm-text");
  const log = create("span", "tm-log");
  const typed = create("span", "tm-typed");
  const tail = create("span", "tm-tail");
  const cursor = create("i", "tm-cursor");
  text.append(log, typed, tail, cursor);
  screen.appendChild(text);
  const thumb = create("i", "tm-thumb");
  body.append(screen, thumb);

  win.append(tabs, body);
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
    // A closed window starts over once it has shrunk away.
    if (next === "closed")
      setTimeout(() => {
        if (state === "closed") restart();
      }, 600);
    sync();
    onChange(next === "closed" ? "closed" : next === "minimised" ? "minimised" : "open");
  }

  // ---- The session plays out: commands type, output prints ------------------
  const reduceMotion =
    typeof matchMedia === "function" &&
    matchMedia("(prefers-reduced-motion: reduce)").matches;
  let live = false;
  let timer: ReturnType<typeof setTimeout> | undefined;
  /** The next log line to handle, and how many characters of a command are on show (-1: none). */
  let at = 0;
  let keys = -1;
  let wait = START_MS;
  /** The newest output stays in view until the visitor scrolls up. */
  let follow = true;

  log.textContent = TERMINAL_BANNER.join("\n") + "\n";

  function paintThumb() {
    const room = screen.scrollHeight - screen.clientHeight;
    thumb.dataset.show = String(room > 1);
    if (room <= 1) return;
    const size = Math.max(24, (screen.clientHeight / screen.scrollHeight) * screen.clientHeight);
    thumb.style.height = `${size}px`;
    thumb.style.transform = `translateY(${(screen.scrollTop / room) * (screen.clientHeight - size)}px)`;
  }
  function toEnd() {
    if (follow) screen.scrollTop = screen.scrollHeight;
    paintThumb();
  }
  function show(command: string) {
    const prompt = PROMPT_PATTERN.exec(TERMINAL_LOG[at])?.[0] ?? "";
    typed.innerHTML = esc(prompt) + commandMarkup(command);
  }

  const delayBefore = (line: string | undefined) =>
    line === undefined
      ? 0
      : isPrompt(line)
        ? PROMPT_MS
        : EVENT_PATTERN.test(line)
          ? rand(EVENT_MS)
          : rand(LINE_MS);

  function tick() {
    timer = undefined;
    if (keys >= 0) {
      const command = commandOf(TERMINAL_LOG[at]);
      if (keys < command.length) {
        keys += 1;
        show(command.slice(0, keys));
        wait = keys === command.length ? ENTER_MS : rand(KEY_MS);
      } else {
        // Enter: the typed line joins the output.
        tail.insertAdjacentHTML("beforeend", `${typed.innerHTML}\n`);
        typed.innerHTML = "";
        keys = -1;
        at += 1;
        wait = delayBefore(TERMINAL_LOG[at]);
      }
    } else if (isPrompt(TERMINAL_LOG[at])) {
      keys = 0;
      show("");
      wait = rand(KEY_MS);
    } else {
      tail.insertAdjacentHTML("beforeend", `${paint(TERMINAL_LOG[at])}\n`);
      at += 1;
      wait = delayBefore(TERMINAL_LOG[at]);
    }
    toEnd();
    sync();
  }
  // Runs only while the screen is live and the window is on show.
  function sync() {
    clearTimeout(timer);
    timer = undefined;
    if (live && !hidden() && !reduceMotion && at < TERMINAL_LOG.length)
      timer = setTimeout(tick, wait);
  }
  function restart() {
    clearTimeout(timer);
    timer = undefined;
    typed.innerHTML = "";
    keys = -1;
    follow = true;
    wait = START_MS;
    if (reduceMotion) {
      // The finished session, static.
      at = TERMINAL_LOG.length;
      tail.innerHTML = TERMINAL_LOG.map((line) => `${paint(line)}\n`).join("");
    } else {
      at = 0;
      tail.innerHTML = "";
    }
    screen.scrollTop = 0;
    toEnd();
  }
  restart();

  // The wheel scrolls the session back while it can; at either end the page takes it back
  // (after a moment, so a spinning wheel does not leak through).
  let lastScrollAt = 0;
  screen.addEventListener(
    "wheel",
    (event) => {
      const room = screen.scrollHeight - screen.clientHeight;
      if (room <= 1) return;
      const delta = event.deltaMode === 1 ? event.deltaY * 16 : event.deltaY;
      const next = Math.min(room, Math.max(0, screen.scrollTop + delta));
      if (next === screen.scrollTop) {
        if (performance.now() - lastScrollAt < WHEEL_LATCH_MS) {
          event.preventDefault();
          event.stopPropagation();
        }
        return;
      }
      event.preventDefault();
      event.stopPropagation();
      lastScrollAt = performance.now();
      screen.scrollTop = next;
      follow = next >= room - 4;
      paintThumb();
    },
    { passive: false },
  );

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
  // Snapping reflows the wrapped lines; keep the newest line in view.
  const watch = typeof ResizeObserver === "function" ? new ResizeObserver(toEnd) : undefined;
  watch?.observe(screen);

  return {
    element: root,
    open,
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
      watch?.disconnect();
      root.remove();
    },
  };
}
