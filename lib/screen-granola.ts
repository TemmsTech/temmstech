import { WINDOW_ICONS } from "@/lib/window-controls";

/** What the Granola window is doing, as far as the desktop is concerned. */
export type GranolaState = "open" | "minimised" | "closed";
type WindowState = "full" | "windowed" | "minimised" | "closed";

/** The question typed into the "Ask anything" box. */
const QUESTION = "What did we agree in the client kickoff?";
/** Keystroke pace, and the pause before the first key. */
const KEY_MS: [number, number] = [45, 105];
const START_MS = 900;
const DAY_MS = 86_400_000;

const icon = (body: string, size = 14) =>
  `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${body}</svg>`;

const ICONS = {
  panel: icon('<rect x="4" y="5" width="16" height="14" rx="2.5"/><path d="M10 5v14"/>', 15),
  search: icon('<circle cx="10.5" cy="10.5" r="6"/><path d="m15 15 5 5"/>', 15),
  home: icon('<path d="M4.5 11 12 4.5l7.5 6.5v8h-5v-5h-5v5h-5z"/>'),
  people: icon('<circle cx="9" cy="9" r="3"/><path d="M3.5 19a5.5 5.5 0 0 1 11 0M16 6.5a3 3 0 0 1 0 5.6M18.5 14.5a5 5 0 0 1 2 4.5"/>'),
  chat: icon('<path d="M5 18.5V6.5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H9.5z"/>'),
  lock: icon('<rect x="5.5" y="10.5" width="13" height="9" rx="2" fill="currentColor" stroke="none"/><path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5"/>', 13),
  plus: icon('<path d="M12 5.5v13M5.5 12h13"/>', 13),
  slash: icon('<rect x="4" y="4" width="16" height="16" rx="3.5"/><path d="m14.5 8.5-5 7"/>', 13),
  screen: icon('<rect x="3.5" y="5" width="14" height="10" rx="2"/><circle cx="17.5" cy="16.5" r="3.2"/><path d="M17.5 15v1.6l1 .6"/>', 15),
  gift: icon('<rect x="4.5" y="9" width="15" height="10.5" rx="1.5"/><path d="M4 9h16M12 9v10.5M12 9c-2.5 0-4-1-4-2.2S9 4.5 10.2 5 12 7.5 12 9zm0 0c2.5 0 4-1 4-2.2S15 4.5 13.8 5 12 7.5 12 9z"/>', 15),
  file: icon('<path d="M7 4h6.5L18 8.5V20H7z"/><path d="M13.5 4v4.5H18"/>', 15),
  calendar: icon('<rect x="3.5" y="5.5" width="14" height="12" rx="2"/><path d="M3.5 9.5h14M8 3.5v3M13 3.5v3"/><circle cx="17" cy="16.5" r="3.6" fill="#363635"/><path d="M17 14.8v1.8l1.1.6"/>', 24),
  updown: icon('<path d="m8 9.5 4-3.5 4 3.5M8 14.5l4 3.5 4-3.5"/>', 12),
} as const;

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

const rand = ([low, high]: [number, number]) => low + Math.random() * (high - low);

/** The visitor's own clock, like the taskbar's; nothing is fetched. */
function agenda() {
  const today = new Date();
  const day = (back: number) =>
    new Date(today.getTime() - back * DAY_MS).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  return {
    number: today.getDate(),
    month: today.toLocaleDateString("en-US", { month: "long" }),
    weekday: today.toLocaleDateString("en-US", { weekday: "short" }),
    groups: [
      { day: day(6), notes: [{ title: "Short recording", time: "3:30", half: "PM" }] },
      {
        day: day(10),
        notes: [
          { title: "Client kickoff call", time: "11:57", half: "AM" },
          { title: "Short recording", time: "10:00", half: "AM" },
        ],
      },
    ],
  };
}

const noteRow = (note: { title: string; time: string; half: string }) =>
  `<div class="gr-note"><span class="gr-note-icon">${ICONS.file}</span><span class="gr-note-text"><b>${esc(note.title)}</b><i>Me</i></span><span class="gr-note-time">${note.time} <small>${note.half}</small></span></div>`;

export type ScreenGranola = {
  element: HTMLElement;
  /** Open (or bring back) the window. */
  open: () => void;
  /** Like a real taskbar button: hide a visible window, bring back a hidden one. */
  toggle: () => void;
  /** Whether the window is currently out of sight. */
  hidden: () => boolean;
  /** The question only types while the screen is live and the window is on show. */
  setLive: (enabled: boolean) => void;
  dispose: () => void;
};

type GranolaOptions = {
  /** Centre of the taskbar button, in the screen's own pixels. */
  target: () => { x: number; y: number } | undefined;
  /** Called with "open" while on show, "minimised" while shrunk into the taskbar, "closed" after close. */
  onChange: (state: GranolaState) => void;
};

/**
 * A static Granola window for the simulated Windows desktop: the Home screen
 * with a calendar card and a short list of notes, all made up. While the
 * window is on show and the screen is live, a question types itself into the
 * "Ask anything" box; a closed window starts over the next time it opens.
 * Nothing in it is live, and reduced motion shows the question already typed.
 */
export function createScreenGranola(
  parent: HTMLElement,
  { target, onChange }: GranolaOptions,
): ScreenGranola {
  const root = create("div", "screen-granola");
  root.dataset.window = "closed";
  root.inert = true;
  root.addEventListener("pointerdown", (event) => event.stopPropagation());
  const win = create("div", "gr-window");
  root.appendChild(win);

  const when = agenda();
  const controls = (["minimise", "maximise", "close"] as const)
    .map(
      (name) =>
        `<button type="button" tabindex="-1" class="gr-control" data-control="${name}" aria-label="${name[0].toUpperCase()}${name.slice(1)}">${WINDOW_ICONS[name === "maximise" ? "restore" : name]}</button>`,
    )
    .join("");

  win.innerHTML = `
    <aside class="gr-side">
      <div class="gr-side-top"><span>${ICONS.panel}</span><span>${ICONS.search}</span></div>
      <nav class="gr-nav">
        <span class="gr-row" data-on>${ICONS.home}Home</span>
        <span class="gr-row">${ICONS.people}Shared with me</span>
        <span class="gr-row">${ICONS.chat}Chat</span>
      </nav>
      <p class="gr-label">Spaces</p>
      <nav class="gr-nav">
        <span class="gr-row"><span class="gr-lock">${ICONS.lock}</span>My notes</span>
        <span class="gr-row"><span class="gr-avatar">T</span>TemmsTech HQ</span>
      </nav>
      <div class="gr-side-foot">
        <div class="gr-tools"><span>${ICONS.slash}</span><span>${ICONS.screen}</span><span>${ICONS.gift}</span></div>
        <div class="gr-plan"><span><b>Free plan</b></span><em>Upgrade</em></div>
        <div class="gr-space"><span class="gr-avatar">T</span><b>TemmsTech workspace</b>${ICONS.updown}</div>
      </div>
    </aside>
    <main class="gr-main">
      <div class="gr-top"><span class="gr-new">${ICONS.plus}New note</span><span class="gr-controls">${controls}</span></div>
      <div class="gr-column">
        <h2 class="gr-title">Coming up</h2>
        <section class="gr-card">
          <div class="gr-date"><strong>${when.number}</strong><span><b>${when.month}<i></i></b><small>${when.weekday}</small></span></div>
          <div class="gr-empty">
            <span class="gr-empty-icon">${ICONS.calendar}</span>
            <p>No upcoming events</p>
            <small>Check your visible calendars</small>
            <span class="gr-pill">Calendar settings</span>
          </div>
        </section>
        ${when.groups
          .map(
            (group) =>
              `<section class="gr-group"><h3>${group.day}</h3>${group.notes.map(noteRow).join("")}</section>`,
          )
          .join("")}
      </div>
      <div class="gr-ask">
        <span class="gr-ask-text" data-empty><span class="gr-typed"></span><i class="gr-caret"></i><span class="gr-hint">Ask anything</span></span>
        <span class="gr-chip">${ICONS.slash}List recent todos</span>
      </div>
    </main>`;
  parent.appendChild(root);

  const typed = win.querySelector<HTMLElement>(".gr-typed")!;
  const field = win.querySelector<HTMLElement>(".gr-ask-text")!;
  const maximise = win.querySelector<HTMLElement>('[data-control="maximise"]')!;

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
        if (state === "closed") restart();
      }, 600);
    sync();
    onChange(next === "closed" ? "closed" : next === "minimised" ? "minimised" : "open");
  }

  // ---- The question types itself ----------------------------------------------
  const reduceMotion =
    typeof matchMedia === "function" &&
    matchMedia("(prefers-reduced-motion: reduce)").matches;
  let live = false;
  let timer: ReturnType<typeof setTimeout> | undefined;
  let keys = 0;
  let wait = START_MS;

  function paint() {
    typed.textContent = QUESTION.slice(0, keys);
    if (keys > 0) delete field.dataset.empty;
    else field.dataset.empty = "";
  }
  function tick() {
    timer = undefined;
    keys += 1;
    paint();
    wait = rand(KEY_MS);
    sync();
  }
  // Runs only while the screen is live and the window is on show.
  function sync() {
    clearTimeout(timer);
    timer = undefined;
    if (live && !hidden() && !reduceMotion && keys < QUESTION.length)
      timer = setTimeout(tick, wait);
  }
  function restart() {
    clearTimeout(timer);
    timer = undefined;
    keys = reduceMotion ? QUESTION.length : 0;
    wait = START_MS;
    paint();
  }
  restart();

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
      clearTimeout(closeTimer);
      live = false;
      root.remove();
    },
  };
}
