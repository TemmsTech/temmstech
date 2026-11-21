import { binItems, type BinItem } from "@/data/recycle-bin";
import { WINDOW_ICONS } from "@/lib/window-controls";

/** What the Recycle Bin window is doing, as far as the desktop is concerned. */
export type RecycleBinState = "open" | "minimised" | "closed";
type WindowState = "full" | "windowed" | "minimised" | "closed";

const DAY_MS = 86_400_000;

const esc = (text: string) =>
  text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const line = (body: string, size = 16) =>
  `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${body}</svg>`;
const flat = (body: string, size = 15) =>
  `<svg viewBox="0 0 20 20" width="${size}" height="${size}" aria-hidden="true">${body}</svg>`;

const FOLDER_SM =
  '<svg viewBox="0 0 20 16" width="17" height="14" aria-hidden="true"><path d="M1 3a1.5 1.5 0 0 1 1.5-1.5H7l1.8 1.8h8.7A1.5 1.5 0 0 1 19 4.8V13a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 1 13z" fill="#f2b630"/><path d="M1 6.2h18V13a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 1 13z" fill="#ffd45e"/></svg>';
const BIN_SM = flat(
  '<path d="M5 6h10l-1 11H6z" fill="#cfd8e3"/><path d="M4 6h12M8 6V4h4v2M8.5 9v6M11.5 9v6" stroke="#6b7a8c" fill="none" stroke-linecap="round"/>',
  16,
);
const PIN = line('<path d="M9 4h6l-1 5 3 3v1.5H7V12l3-3zM12 13.5V20"/>', 11);

/** Left pane: display only, like the real Recycle Bin's navigation pane. */
const PANE: { icon: string; label: string; pin?: boolean; gap?: boolean; on?: boolean }[] = [
  { icon: flat('<path d="M3 10 10 3l7 7v7H3z" fill="#f08a3c"/><path d="M8 17v-5h4v5" fill="#ffd2a8"/>'), label: "Home" },
  { icon: flat('<rect x="2.5" y="3.5" width="15" height="13" rx="2" fill="#2b8cf0"/><circle cx="7" cy="8" r="1.6" fill="#fff"/><path d="m4 15 4-4 3 3 2-2 3 3z" fill="#fff"/>'), label: "Gallery" },
  { icon: flat('<path d="M5.5 15.5h9a3 3 0 0 0 .4-6 4.5 4.5 0 0 0-8.6-.8A3.4 3.4 0 0 0 5.5 15.5z" fill="#3ba7ee"/>'), label: "Personal" },
  { icon: FOLDER_SM, label: "Apps", gap: true },
  { icon: flat('<rect x="2" y="3" width="16" height="11" rx="1.5" fill="#3ba7ee"/><path d="M6 17h8" stroke="#8fa3b8" stroke-width="1.6" stroke-linecap="round"/>'), label: "Desktop", pin: true },
  { icon: flat('<path d="M10 3v10M6 9l4 4 4-4M4 17h12" stroke="#2fb36d" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>'), label: "Downloads", pin: true },
  { icon: flat('<path d="M5 2h7l4 4v12H5z" fill="#cfd8e3"/><path d="M8 9h6M8 12h6M8 15h4" stroke="#6b7a8c"/>'), label: "Documents", pin: true },
  { icon: flat('<rect x="2.5" y="3.5" width="15" height="13" rx="2" fill="#2b8cf0"/><path d="m4 15 4-4 3 3 2-2 3 3z" fill="#fff"/>'), label: "Pictures", pin: true },
  { icon: flat('<circle cx="10" cy="10" r="8" fill="#f0626b"/><path d="M8 14V6.5l5-1V12" stroke="#fff" fill="none" stroke-width="1.4"/>'), label: "Music", pin: true },
  { icon: flat('<rect x="3" y="3" width="14" height="14" rx="2" fill="#7b5cf0"/><path d="M8.5 7v6l5-3z" fill="#fff"/>'), label: "Videos", pin: true },
  { icon: FOLDER_SM, label: "Screenshots" },
  { icon: flat('<rect x="2" y="3" width="16" height="11" rx="1.5" fill="#3ba7ee"/><path d="M6 17h8" stroke="#8fa3b8" stroke-width="1.6" stroke-linecap="round"/>'), label: "This PC", gap: true },
  { icon: BIN_SM, label: "Recycle Bin", on: true },
];

/** Toolbar parts that never do anything (dimmed where the real Recycle Bin dims them). */
const TOOLS_BEFORE = [
  { icon: line('<circle cx="12" cy="12" r="8.5"/><path d="M12 8v8M8 12h8"/>'), label: "New ⌄", off: true },
  { icon: "", sep: true },
  { icon: line('<circle cx="7" cy="17" r="2.5"/><circle cx="17" cy="17" r="2.5"/><path d="M8.5 15 17 4M15.5 15 7 4"/>'), off: true },
  { icon: line('<rect x="8" y="8" width="11" height="12" rx="2"/><path d="M5 15V6a2 2 0 0 1 2-2h8"/>'), off: true },
  { icon: line('<rect x="5" y="5" width="14" height="16" rx="2"/><path d="M9 5V3.5h6V5"/>'), off: true },
  { icon: line('<rect x="3.5" y="7" width="17" height="10" rx="2"/><path d="M12 4v16"/>'), off: true },
  { icon: line('<path d="M12 15V4M8 8l4-4 4 4"/><path d="M6 12v6a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-6"/>'), off: true },
] as const;
const TRASH = line('<path d="M5 7h14M10 7V4.5h4V7M7 7l1 13h8l1-13"/>');
const TOOLS_AFTER = [
  { icon: line('<path d="M8 20V5M5 8l3-3 3 3M16 4v15M13 16l3 3 3-3"/>'), label: "Sort ⌄" },
  { icon: line('<rect x="4" y="5" width="16" height="12" rx="1.5"/><path d="M9 20h6"/>'), label: "View ⌄" },
] as const;
const BIN_TOOL = line('<path d="M5 7h14M10 7V4.5h4V7M7 7l1 13h8l1-13M10 11v5M14 11v5"/>');
const RESTORE_TOOL = line('<path d="M5 12a7 7 0 1 0 2.2-5M5 4.5v4.5h4.5"/>');

/** One item's big icon. Pictures are drawn with CSS (no screenshots are shipped). */
function folderIcon(zip: boolean) {
  const zipper = zip
    ? '<rect x="3" y="27" width="66" height="12" fill="#e6e9ee"/><path d="M3 33h66" stroke="#737b88" stroke-width="12" stroke-dasharray="1.7 1.7"/><rect x="29" y="25" width="14" height="16" rx="3" fill="#f4f6f8" stroke="#737b88" stroke-width="1.4"/>'
    : "";
  return `<svg viewBox="0 0 72 56" width="72" height="56" aria-hidden="true"><path d="M3 8a5 5 0 0 1 5-5h16l6 6h34a5 5 0 0 1 5 5v35a5 5 0 0 1-5 5H8a5 5 0 0 1-5-5z" fill="#f2b630"/><path d="M3 20a5 5 0 0 1 5-5h56a5 5 0 0 1 5 5v30a5 5 0 0 1-5 5H8a5 5 0 0 1-5-5z" fill="#ffd45e"/>${zipper}</svg>`;
}
const MODEL_ICON =
  '<svg viewBox="0 0 48 60" width="48" height="60" aria-hidden="true"><path d="M4 3a3 3 0 0 1 3-3h24l13 13v44a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3z" fill="#f4f5f7"/><path d="M31 0v10a3 3 0 0 0 3 3h10z" fill="#c9ced6"/><g fill="none" stroke="#1f2430" stroke-width="2" stroke-linejoin="round"><path d="m24 22 10 5.5v11L24 44l-10-5.5v-11z"/><path d="m14 27.5 10 5.5 10-5.5M24 33v11"/></g></svg>';
const PLAY =
  '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M8 5.5v13l11-6.5z" fill="#fff"/></svg>';

function bigIcon(item: BinItem) {
  switch (item.kind) {
    case "folder":
      return folderIcon(false);
    case "zip":
      return folderIcon(true);
    case "model":
      return MODEL_ICON;
    case "video":
      return `<span class="rb-shot rb-video">${PLAY}</span>`;
    default: {
      const [background, accent] = item.look ?? ["#1a202a", "#4cc2ff"];
      return `<span class="rb-shot" data-mobile="${item.kind === "mobile"}" style="--bg:${background};--ac:${accent}"><i></i><i></i><i></i></span>`;
    }
  }
}

const clock = (item: BinItem) => {
  const [back, hour, minute] = item.deleted;
  const date = new Date(Date.now() - back * DAY_MS);
  date.setHours(hour, minute, 0, 0);
  return `${date.toLocaleDateString("en-US")} ${date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}`;
};

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

export type ScreenRecycleBin = {
  element: HTMLElement;
  /** Open (or bring back) the window. */
  open: () => void;
  /** Like a real taskbar button: hide a visible window, bring back a hidden one. */
  toggle: () => void;
  /** Whether the window is currently out of sight. */
  hidden: () => boolean;
  dispose: () => void;
};

type RecycleBinOptions = {
  /** Centre of the taskbar button, in the screen's own pixels. */
  target: () => { x: number; y: number } | undefined;
  /** Called with "open" while on show, "minimised" while shrunk into the taskbar, "closed" after close. */
  onChange: (state: RecycleBinState) => void;
};

/**
 * A static Recycle Bin window for the simulated Windows desktop, laid out like
 * File Explorer. Click an item to select it (Ctrl or Cmd adds to the selection),
 * click the empty part of the window to clear it. "Restore" puts back the
 * selected items, or all of them when none is selected; "Empty Recycle Bin" and
 * the bin button delete for good after a Yes/No question. Details opens a side
 * pane about the selected item. Windowed is the whole window scaled to 0.78
 * (like Brave and VS Code). Nothing is live; closing puts everything back.
 */
export function createScreenRecycleBin(
  parent: HTMLElement,
  { target, onChange }: RecycleBinOptions,
): ScreenRecycleBin {
  const root = create("div", "screen-recycle-bin");
  root.dataset.window = "closed";
  root.inert = true;
  root.addEventListener("pointerdown", (event) => event.stopPropagation());
  const win = create("div", "rb-window");
  root.appendChild(win);

  const controls = (["minimise", "maximise", "close"] as const)
    .map(
      (name) =>
        `<button type="button" tabindex="-1" class="rb-control" data-control="${name}" aria-label="${name[0].toUpperCase()}${name.slice(1)}">${WINDOW_ICONS[name === "maximise" ? "restore" : name]}</button>`,
    )
    .join("");
  const tool = (item: { icon: string; label?: string; off?: boolean; sep?: boolean }) =>
    item.sep
      ? '<i class="rb-sep"></i>'
      : `<span class="rb-tool" data-off="${item.off ?? false}">${item.icon}${item.label ? `<em>${item.label}</em>` : ""}</span>`;

  win.innerHTML = `
    <div class="rb-tabs">
      <div class="rb-tab">${BIN_SM}<span class="rb-tab-title">Recycle Bin</span><i>×</i></div>
      <span class="rb-tab-add">+</span>
      <span class="rb-controls">${controls}</span>
    </div>
    <div class="rb-nav">
      <span class="rb-navbtn" data-off="true">←</span>
      <span class="rb-navbtn" data-off="true">→</span>
      <span class="rb-navbtn">↑</span>
      <span class="rb-navbtn">↻</span>
      <div class="rb-address">${line('<rect x="4" y="5" width="16" height="11" rx="1.5"/><path d="M9 20h6"/>', 15)}<span class="rb-crumbs"><i>›</i>Recycle Bin</span></div>
      <div class="rb-search"><span>Search Recycle Bin</span>${line('<circle cx="11" cy="11" r="6"/><path d="m20 20-4.2-4.2"/>', 14)}</div>
    </div>
    <div class="rb-toolbar">
      ${TOOLS_BEFORE.map(tool).join("")}
      <span class="rb-tool" data-action="delete" data-off="true">${TRASH}</span>
      <i class="rb-sep"></i>
      ${TOOLS_AFTER.map(tool).join("")}
      <i class="rb-sep"></i>
      <span class="rb-tool" data-action="empty">${BIN_TOOL}<em>Empty Recycle Bin</em></span>
      <span class="rb-tool" data-action="restore">${RESTORE_TOOL}<em class="rb-restore-label">Restore all items</em></span>
      <i class="rb-sep"></i>
      <span class="rb-tool">···</span>
      <span class="rb-tool rb-details-tool" data-action="details" data-on="false">${line('<rect x="3.5" y="5" width="17" height="14" rx="2"/><path d="M14 5v14"/>', 15)}<em>Details</em></span>
    </div>
    <div class="rb-body">
      <div class="rb-pane">${PANE.map(
        (item) =>
          `${item.gap ? '<i class="rb-pane-gap"></i>' : ""}<div class="rb-pane-item"${item.on ? ' data-selected="true"' : ""}><span class="rb-pane-icon">${item.icon}</span><span>${esc(item.label)}</span>${item.pin ? `<span class="rb-pin">${PIN}</span>` : ""}</div>`,
      ).join("")}</div>
      <div class="rb-main"><div class="rb-content"></div></div>
      <aside class="rb-details"></aside>
    </div>
    <div class="rb-status"><span class="rb-count"></span><span class="rb-sel"></span></div>
    <div class="rb-dialog">
      <div class="rb-box">
        <div class="rb-box-title"></div>
        <p class="rb-box-text"></p>
        <div class="rb-box-buttons"><span class="rb-answer" data-answer="yes">Yes</span><span class="rb-answer" data-answer="no">No</span></div>
      </div>
    </div>`;
  parent.appendChild(root);

  const content = win.querySelector<HTMLElement>(".rb-content")!;
  const details = win.querySelector<HTMLElement>(".rb-details")!;
  const count = win.querySelector<HTMLElement>(".rb-count")!;
  const selectedText = win.querySelector<HTMLElement>(".rb-sel")!;
  const maximise = win.querySelector<HTMLElement>('[data-control="maximise"]')!;
  const dialog = win.querySelector<HTMLElement>(".rb-dialog")!;
  const dialogTitle = win.querySelector<HTMLElement>(".rb-box-title")!;
  const dialogText = win.querySelector<HTMLElement>(".rb-box-text")!;
  const restoreLabel = win.querySelector<HTMLElement>(".rb-restore-label")!;
  const act = (name: string) => win.querySelector<HTMLElement>(`[data-action="${name}"]`)!;

  // ---- What is in the bin ---------------------------------------------------
  let items: readonly BinItem[] = binItems;
  let chosen = new Set<string>();
  let asking: readonly BinItem[] | undefined;
  const plural = (n: number) => `${n} ${n === 1 ? "item" : "items"}`;

  function paint() {
    content.innerHTML = items.length
      ? `<div class="rb-grid">${items
          .map(
            (item) =>
              `<div class="rb-item" data-item="${item.id}" data-selected="${chosen.has(item.id)}"><span class="rb-big">${bigIcon(item)}</span><span class="rb-label">${esc(item.name)}</span></div>`,
          )
          .join("")}</div>`
      : '<div class="rb-empty">This folder is empty.</div>';
    count.textContent = plural(items.length);
    selectedText.textContent = chosen.size ? `${plural(chosen.size)} selected` : "";
    restoreLabel.textContent =
      chosen.size === 0 ? "Restore all items" : chosen.size === 1 ? "Restore this item" : "Restore the selected items";
    act("empty").dataset.off = String(items.length === 0);
    act("restore").dataset.off = String(items.length === 0);
    act("delete").dataset.off = String(chosen.size === 0);
    paintDetails();
  }
  function paintDetails() {
    const one = chosen.size === 1 ? items.find((item) => chosen.has(item.id)) : undefined;
    details.innerHTML = one
      ? `<div class="rb-d-icon">${bigIcon(one)}</div><b class="rb-d-name">${esc(one.name)}</b><span class="rb-d-type">${esc(one.type)}</span>
         <dl><dt>Original location</dt><dd>${esc(one.from)}</dd><dt>Date deleted</dt><dd>${clock(one)}</dd><dt>Size</dt><dd>${one.size}</dd></dl>`
      : `<p class="rb-d-hint">${chosen.size > 1 ? `${plural(chosen.size)} selected` : "Select a single file to get more information"}</p>`;
  }
  function remove(gone: readonly BinItem[]) {
    const ids = new Set(gone.map((item) => item.id));
    items = items.filter((item) => !ids.has(item.id));
    chosen = new Set([...chosen].filter((id) => !ids.has(id)));
    paint();
  }
  function ask(list: readonly BinItem[]) {
    if (!list.length) return;
    asking = list;
    const [first] = list;
    dialogTitle.textContent =
      list.length > 1 ? "Delete Multiple Items" : first.kind === "folder" ? "Delete Folder" : "Delete File";
    dialogText.textContent =
      list.length > 1
        ? `Are you sure you want to permanently delete these ${list.length} items?`
        : `Are you sure you want to permanently delete "${first.name}"?`;
    dialog.dataset.open = "";
  }
  function settle(yes: boolean) {
    const list = asking;
    asking = undefined;
    delete dialog.dataset.open;
    if (yes && list) remove(list);
  }
  function reset() {
    items = binItems;
    chosen = new Set();
    asking = undefined;
    delete dialog.dataset.open;
    delete win.dataset.details;
    act("details").dataset.on = "false";
    paint();
  }
  reset();

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
    // A closed window starts over (everything back in the bin) once it has shrunk away.
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
    const here = event.target as HTMLElement;
    const hit = here.closest<HTMLElement>("[data-control],[data-action],[data-item],[data-answer]");
    if (hit?.dataset.control) {
      const name = hit.dataset.control;
      if (name === "minimise") set("minimised");
      else if (name === "close") set("closed");
      else if (state === "full") set("windowed");
      else if (state === "windowed") set("full");
      return;
    }
    if (hit?.dataset.answer) {
      settle(hit.dataset.answer === "yes");
      return;
    }
    // The question must be answered before anything else in the window responds.
    if (asking) return;
    if (hit?.dataset.action) {
      if (hit.dataset.off === "true") return;
      const picked = items.filter((item) => chosen.has(item.id));
      if (hit.dataset.action === "restore") remove(picked.length ? picked : items);
      else if (hit.dataset.action === "empty") ask(items);
      else if (hit.dataset.action === "delete") ask(picked);
      else if (hit.dataset.action === "details") {
        const on = win.dataset.details === undefined;
        if (on) win.dataset.details = "";
        else delete win.dataset.details;
        hit.dataset.on = String(on);
      }
      return;
    }
    if (hit?.dataset.item) {
      const id = hit.dataset.item;
      if (event.ctrlKey || event.metaKey) {
        if (!chosen.delete(id)) chosen.add(id);
      } else chosen = new Set([id]);
      paint();
    } else if (here.closest(".rb-main") && chosen.size) {
      chosen = new Set();
      paint();
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
