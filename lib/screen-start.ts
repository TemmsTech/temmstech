import {
  CATEGORIES,
  PHONE,
  PINNED,
  PROFILE_NAME,
  RECENT,
  SEARCHABLE,
  type StartApp,
  type StartLaunch,
  type StartPicture,
  type StartRecent,
} from "@/data/start-menu";
import { CHATGPT_ICON, claudeLogo } from "@/lib/screen-app-icons";
import type { PowerAction } from "@/lib/screen-power";
import { START_ICONS } from "@/lib/screen-start-icons";
import { VLC_CONE_SVG } from "@/lib/screen-vlc-icon";

const WHEEL_LATCH_MS = 350;

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

/** One app's picture, as markup. */
function picture(source: StartPicture | StartRecent["picture"]): string {
  if ("sheet" in source)
    return `<span class="screen-sprite" data-sheet="${source.sheet}" style="--i:${source.cell}"></span>`;
  if ("drawn" in source) return START_ICONS[source.drawn];
  if ("file" in source) return START_ICONS[source.file === "image" ? "image" : "download"];
  if (source.logo === "claude") return claudeLogo(undefined, 3);
  if (source.logo === "chatgpt") return CHATGPT_ICON;
  return VLC_CONE_SVG;
}

export type ScreenStart = {
  element: HTMLElement;
  open: () => void;
  close: () => void;
  toggle: () => void;
  isOpen: () => boolean;
  dispose: () => void;
};

type StartOptions = {
  /** The pressed app has a window: bring it up. */
  launch: (app: StartLaunch) => void;
  /** Called with true while the menu is on show, so the Start button can light up. */
  onChange: (open: boolean) => void;
  /** The Start button itself: a press on it is the toggle's job, not "outside". */
  button: () => HTMLElement | undefined;
  /** A power choice was made (lock, sleep, shut down, restart). When missing, the power button is decoration. */
  onPower?: (action: PowerAction) => void;
  /** The press listener goes on the device, so a press anywhere on it closes the menu. */
  host: HTMLElement;
};

/**
 * The Windows 11 Start menu for the simulated desktop: search, pinned apps,
 * recent files, the "All" folders, the profile bar and the iPhone panel.
 * Typing searches the apps; apps that have a window on this desktop open it.
 * Everything else only closes the menu. Nothing in it is live.
 */
export function createScreenStart(
  parent: HTMLElement,
  { launch, onChange, button, host, onPower }: StartOptions,
): ScreenStart {
  const root = create("div", "screen-start");
  root.dataset.open = "false";
  root.inert = true;
  root.addEventListener("pointerdown", (event) => {
    event.stopPropagation();
    const target = event.target as Node | null;
    if (target && !flyout.contains(target) && !power.contains(target)) setFlyout(false);
  });

  // ---- Main panel -----------------------------------------------------------
  const main = create("div", "st-main");
  const searchBar = create("div", "st-search");
  const lens = create("span", "st-search-icon", START_ICONS.search);
  const input = create("input", "st-search-input");
  input.type = "text";
  input.placeholder = "Search for apps, settings, and documents";
  input.autocomplete = "off";
  input.spellcheck = false;
  input.setAttribute("aria-label", "Search for apps, settings, and documents");
  const phoneIcon = create("span", "st-search-phone", START_ICONS.phone);
  searchBar.append(lens, input, phoneIcon);
  const head = create("div", "st-head");
  head.appendChild(searchBar);

  const scroll = create("div", "st-scroll");
  const home = create("div", "st-home");
  const results = create("div", "st-results");
  results.hidden = true;
  scroll.append(home, results);

  const sectionHead = (title: string, action?: string, icon?: string) => {
    const row = create("div", "st-section-head");
    row.appendChild(create("h3", "st-section-title", esc(title)));
    if (action) {
      const link = create(
        "button",
        "st-section-action",
        `<span>${esc(action)}</span><i>${icon ?? START_ICONS.chevron}</i>`,
      );
      link.type = "button";
      link.tabIndex = -1;
      row.appendChild(link);
    }
    return row;
  };

  const appButton = (app: StartApp, className: string) => {
    const node = create(
      "button",
      className,
      `<span class="st-app-icon">${picture(app.picture)}</span><span class="st-app-name">${esc(app.name)}</span>`,
    );
    node.type = "button";
    node.tabIndex = -1;
    node.dataset.app = app.name;
    node.addEventListener("click", () => run(app));
    return node;
  };

  // Pinned
  const pinned = create("section", "st-section");
  const pinnedHead = sectionHead("Pinned", "Show all");
  const pinnedGrid = create("div", "st-pinned");
  pinnedGrid.append(...PINNED.map((app) => appButton(app, "st-pin")));
  pinned.append(pinnedHead, pinnedGrid);

  // Recent
  const recent = create("section", "st-section");
  const recentGrid = create("div", "st-recent");
  recentGrid.append(
    ...RECENT.map((item) => {
      const node = create(
        "button",
        "st-recent-item",
        `<span class="st-app-icon">${picture(item.picture)}</span><span class="st-recent-text"><span class="st-recent-name">${esc(item.name)}</span><span class="st-recent-note">${esc(item.note)}</span></span>`,
      );
      node.type = "button";
      node.tabIndex = -1;
      node.addEventListener("click", () => close());
      return node;
    }),
  );
  recent.append(sectionHead("Recent", "Show all"), recentGrid);

  // All: folders of four
  const all = create("section", "st-section");
  const allHead = sectionHead("All", "View: Category", START_ICONS.down);
  const folders = create("div", "st-folders");
  folders.append(
    ...CATEGORIES.map((category) => {
      const node = create(
        "button",
        "st-folder",
        category.apps
          .map((app) => `<span class="st-folder-icon">${picture(app.picture)}</span>`)
          .join(""),
      );
      node.type = "button";
      node.tabIndex = -1;
      node.setAttribute("aria-label", category.title);
      node.addEventListener("click", () => showList(category.title, category.apps, true));
      return node;
    }),
  );
  all.append(allHead, folders);
  home.append(pinned, recent, all);

  const foot = create("div", "st-foot");
  const profile = create("div", "st-profile");
  profile.append(
    create("span", "st-avatar", "T"),
    create("span", "st-profile-name", esc(PROFILE_NAME)),
  );
  const power = create("button", "st-power", START_ICONS.power);
  power.type = "button";
  power.tabIndex = -1;
  power.setAttribute("aria-label", "Power");
  foot.append(profile, power);

  // The power button opens a small list above it.
  const flyout = create("div", "st-flyout");
  flyout.dataset.open = "false";
  flyout.inert = true;
  const CHOICES: readonly [PowerAction, string, string][] = [
    ["lock", "Lock", START_ICONS.lock],
    ["sleep", "Sleep", START_ICONS.sleep],
    ["shutdown", "Shut down", START_ICONS.power],
    ["restart", "Restart", START_ICONS.restart],
  ];
  for (const [action, label, glyph] of CHOICES) {
    const choice = create("button", "st-flyout-item", `<i>${glyph}</i><span>${label}</span>`);
    choice.type = "button";
    choice.tabIndex = -1;
    choice.dataset.action = action;
    choice.addEventListener("click", () => {
      close();
      onPower?.(action);
    });
    flyout.appendChild(choice);
  }
  function setFlyout(show: boolean) {
    flyout.dataset.open = String(show);
    flyout.inert = !show;
  }
  power.addEventListener("click", () => {
    if (onPower) setFlyout(flyout.dataset.open !== "true");
  });
  main.append(head, scroll, foot, flyout);

  // ---- The iPhone panel -----------------------------------------------------
  const side = create("div", "st-side");
  const actions = [START_ICONS.messages, START_ICONS.calls, START_ICONS.send];
  side.innerHTML = `
    <div class="st-phone">
      <span class="st-phone-pic">${START_ICONS.iphone}</span>
      <strong class="st-phone-name">${PHONE.name}</strong>
      <span class="st-phone-status">
        <i class="st-phone-ok">${START_ICONS.check}</i>
        <i class="st-phone-bt">${START_ICONS.bluetooth}</i>
        <i class="st-phone-bat">${START_ICONS.battery}</i><span>${PHONE.battery}</span>
      </span>
    </div>
    <div class="st-phone-actions">
      ${PHONE.actions
        .map(
          (label, index) =>
            `<button type="button" tabindex="-1" class="st-phone-action"><i>${actions[index]}</i><span>${label}</span></button>`,
        )
        .join("")}
    </div>
    <h3 class="st-side-title">Recent</h3>
    <div class="st-notes">
      ${PHONE.notifications
        .map(
          (note) =>
            `<div class="st-note"><i>${START_ICONS[note.icon]}</i><span><b>${note.app}</b><em>${note.note}</em></span></div>`,
        )
        .join("")}
    </div>
    <div class="st-side-foot"><i>${START_ICONS.more}</i></div>`;

  root.append(main, side);
  parent.appendChild(root);

  // ---- Behaviour ------------------------------------------------------------
  let isOpen = false;

  function run(app: StartApp) {
    close();
    if (app.opens) launch(app.opens);
  }

  function showHome() {
    results.hidden = true;
    home.hidden = false;
    scroll.scrollTop = 0;
  }

  /** A list of apps in place of the home view: search matches, or one folder. */
  function showList(title: string, apps: readonly StartApp[], back: boolean, empty?: string) {
    results.innerHTML = "";
    const row = create("div", "st-results-head");
    if (back) {
      const button = create("button", "st-back", `<i>${START_ICONS.back}</i><span>${esc(title)}</span>`);
      button.type = "button";
      button.tabIndex = -1;
      button.addEventListener("click", () => showHome());
      row.appendChild(button);
    } else row.appendChild(create("h3", "st-section-title", esc(title)));
    results.appendChild(row);
    if (apps.length === 0 && empty) results.appendChild(create("p", "st-empty", esc(empty)));
    for (const app of apps) results.appendChild(appButton(app, "st-result"));
    home.hidden = true;
    results.hidden = false;
    scroll.scrollTop = 0;
  }

  const matches = (query: string) => {
    const needle = query.trim().toLowerCase();
    return SEARCHABLE.filter((app) => app.name.toLowerCase().includes(needle)).sort(
      (a, b) =>
        Number(b.name.toLowerCase().startsWith(needle)) -
        Number(a.name.toLowerCase().startsWith(needle)),
    );
  };

  input.addEventListener("input", () => {
    if (input.value.trim() === "") showHome();
    else showList("Best match", matches(input.value), false, `No results for “${input.value.trim()}”`);
  });
  input.addEventListener("keydown", (event) => {
    event.stopPropagation();
    if (event.key === "Escape") close();
    if (event.key === "Enter") {
      const first = matches(input.value)[0];
      if (first && input.value.trim() !== "") run(first);
    }
  });

  // "Show all" under Pinned jumps to the folders.
  pinnedHead.querySelector("button")?.addEventListener("click", () =>
    scroll.scrollTo({ top: all.offsetTop - 8, behavior: "smooth" }),
  );

  function open() {
    if (isOpen) return;
    isOpen = true;
    input.value = "";
    showHome();
    root.dataset.open = "true";
    root.inert = false;
    onChange(true);
    input.focus({ preventScroll: true });
  }
  function close() {
    if (!isOpen) return;
    isOpen = false;
    root.dataset.open = "false";
    root.inert = true;
    setFlyout(false);
    input.blur();
    onChange(false);
  }

  // A press anywhere else on the device closes it (the capture phase sees it
  // before the windows and the desktop stop it).
  const outside = (event: PointerEvent) => {
    if (!isOpen) return;
    const target = event.target as Node | null;
    if (target && (root.contains(target) || button()?.contains(target))) return;
    close();
  };
  host.addEventListener("pointerdown", outside, true);

  // The wheel scrolls the menu while it can; at either end the page takes it back
  // (after a moment, so a spinning wheel does not leak through).
  let lastScrollAt = 0;
  scroll.addEventListener(
    "wheel",
    (event) => {
      const room = scroll.scrollHeight - scroll.clientHeight;
      if (room <= 1) return;
      const delta = event.deltaMode === 1 ? event.deltaY * 16 : event.deltaY;
      const next = Math.min(room, Math.max(0, scroll.scrollTop + delta));
      if (next === scroll.scrollTop) {
        if (performance.now() - lastScrollAt < WHEEL_LATCH_MS) {
          event.preventDefault();
          event.stopPropagation();
        }
        return;
      }
      event.preventDefault();
      event.stopPropagation();
      lastScrollAt = performance.now();
      scroll.scrollTop = next;
    },
    { passive: false },
  );

  return {
    element: root,
    open,
    close,
    isOpen: () => isOpen,
    toggle: () => (isOpen ? close() : open()),
    dispose() {
      host.removeEventListener("pointerdown", outside, true);
      root.remove();
    },
  };
}
