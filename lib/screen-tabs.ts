import { addressOf, labelOf, parseAddress } from "@/lib/screen-address";

/** Most tabs open at once. */
const MAX_TABS = 9;
/** How long the "not a valid address" hint stays up. */
const INVALID_MS = 1800;
/** How long a reload covers the page. */
const RELOAD_MS = 700;

/** A tab the window starts with: a picture of a page, with a made-up address. */
export type TabSpec = {
  id: string;
  title: string;
  url: string;
  /** Favicon markup. */
  favicon: string;
  /** Source of the page picture. */
  shot: string;
  /** Shown before the address, like Chrome does for a file on this computer. */
  chip?: string;
  fit?: "cover" | "width";
};

type TabsOptions = {
  /** Class prefix of the window: "ch" or "br". */
  prefix: string;
  specs: readonly TabSpec[];
  /** The inside of a picture tab's pane. */
  shotMarkup: (spec: TabSpec) => string;
  /** Called whenever the open page changes, so the window can restyle the address bar's start. */
  onPage: (info: { chip?: string }) => void;
  /** The last tab was closed: the window closes with it. */
  onEmpty: () => void;
};

export type ScreenTabs = {
  /** Put the starting tabs back (a closed window starts over). */
  reset: () => void;
  /** Sites only load while the window is on show. */
  setVisible: (visible: boolean) => void;
  dispose: () => void;
};

type Page = {
  kind: "shot" | "site" | "blank";
  title: string;
  /** Shown address: made up for a picture, the real link for a site. */
  shown: string;
  /** The real link of a site. */
  url?: string;
  spec?: TabSpec;
};

type Tab = {
  id: string;
  history: Page[];
  at: number;
  node: HTMLElement;
  fav: HTMLElement;
  title: HTMLElement;
  pane: HTMLElement;
  frame?: HTMLIFrameElement;
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

const esc = (text: string) =>
  text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/**
 * Real browsing for a simulated browser window (Chrome, Brave): tabs that
 * open, close and switch, an address bar that loads any web link as a live
 * page, back, forward and reload through each tab's own history, and pages
 * that scroll behind a click-to-interact shield. The window supplies the
 * markup and look; this supplies the behaviour. The window's own pictures
 * stay as its starting tabs.
 *
 * The window must hold `.{p}-tabs` with a `.{p}-tab-add` in it, `.{p}-url-text`
 * inside a box, three `[data-nav="back" | "forward" | "reload"]` buttons and an
 * empty `.{p}-page`.
 */
export function createScreenTabs(
  win: HTMLElement,
  { prefix: p, specs, shotMarkup, onPage, onEmpty }: TabsOptions,
): ScreenTabs {
  const strip = win.querySelector<HTMLElement>(`.${p}-tabs`)!;
  const add = win.querySelector<HTMLElement>(`.${p}-tab-add`)!;
  const urlText = win.querySelector<HTMLElement>(`.${p}-url-text`)!;
  const urlBox = urlText.parentElement!;
  const pageBox = win.querySelector<HTMLElement>(`.${p}-page`)!;
  const nav = (name: string) =>
    win.querySelector<HTMLElement>(`[data-nav="${name}"]`)!;
  const backButton = nav("back");
  const forwardButton = nav("forward");
  const reloadButton = nav("reload");

  add.setAttribute("role", "button");
  add.setAttribute("aria-label", "New tab");

  // The address bar is text until it is pressed, then a field.
  const input = create("input", `${p}-url-input`);
  input.type = "text";
  input.hidden = true;
  input.maxLength = 2048;
  input.spellcheck = false;
  input.autocomplete = "off";
  input.autocapitalize = "off";
  input.inputMode = "url";
  input.enterKeyHint = "go";
  input.placeholder = "Search or type a web address";
  input.setAttribute("aria-label", "Address bar");
  urlText.after(input);

  // Sites sit behind a shield so the page still scrolls while the mouse is over
  // the laptop; the first click engages the site, leaving the window hands it back.
  const shield = create("div", `${p}-shield`);
  shield.hidden = true;
  const external = create("button", `${p}-external`, "Open in a real tab ↗");
  external.type = "button";
  external.tabIndex = -1;
  external.hidden = true;
  pageBox.append(shield, external);

  const tabs: Tab[] = [];
  let active: Tab | undefined;
  let visible = false;
  let uid = 0;
  let invalidTimer: ReturnType<typeof setTimeout> | undefined;
  let reloadTimer: ReturnType<typeof setTimeout> | undefined;

  const current = (tab: Tab) => tab.history[tab.at];
  const favicon = (page: Page) =>
    page.spec?.favicon ??
    `<span class="${p}-letter">${page.kind === "site" ? esc(page.title.charAt(0).toUpperCase()) : ""}</span>`;

  function newTab(first: Page, id = `tab-${++uid}`) {
    const node = create("button", `${p}-tab`);
    node.type = "button";
    node.tabIndex = -1;
    node.dataset.tab = id;
    const fav = create("span", `${p}-fav`);
    const title = create("span", `${p}-tab-title`);
    const close = create("i", `${p}-tab-x`, "×");
    close.dataset.close = id;
    close.setAttribute("aria-hidden", "true");
    node.append(fav, title, close);
    const pane = create("div", `${p}-pane`);
    pane.dataset.pane = id;
    strip.insertBefore(node, add);
    pageBox.insertBefore(pane, shield);
    const tab: Tab = { id, history: [first], at: 0, node, fav, title, pane };
    tabs.push(tab);
    return tab;
  }

  function mountSite(tab: Tab) {
    const page = current(tab);
    if (page.kind !== "site" || !page.url || tab.frame || !visible) return;
    const loading = create("div", "live-frame-loading");
    loading.append(create("span", "live-frame-sheen"));
    const frame = document.createElement("iframe");
    frame.className = `${p}-frame`;
    frame.title = `${page.title} live website`;
    frame.setAttribute(
      "sandbox",
      "allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox",
    );
    frame.referrerPolicy = "strict-origin-when-cross-origin";
    frame.tabIndex = -1;
    frame.addEventListener("load", () => {
      loading.dataset.loaded = "";
    });
    frame.src = page.url;
    tab.pane.append(frame, loading);
    tab.frame = frame;
  }

  // Draws a tab's current page into its pane.
  function render(tab: Tab) {
    const page = current(tab);
    tab.pane.replaceChildren();
    tab.frame = undefined;
    delete tab.pane.dataset.fit;
    tab.pane.dataset.kind = page.kind;
    if (page.kind === "shot" && page.spec) {
      tab.pane.innerHTML = shotMarkup(page.spec);
      if (page.spec.fit) tab.pane.dataset.fit = page.spec.fit;
    } else if (page.kind === "blank") {
      tab.pane.append(
        create(
          "div",
          `${p}-newtab`,
          `<b>New tab</b><span>Type a web address in the bar above and press Enter.</span>`,
        ),
      );
    } else mountSite(tab);
    tab.title.textContent = page.title;
    tab.node.title = page.title;
    tab.fav.innerHTML = favicon(page);
    tab.node
      .querySelector("[data-close]")!
      .setAttribute("aria-label", `Close ${page.title} tab`);
  }

  // Brings the window's bar and buttons in line with the open tab.
  function sync() {
    if (!active) return;
    const page = current(active);
    for (const tab of tabs) {
      if (tab === active) {
        tab.node.dataset.active = "";
        tab.pane.dataset.on = "";
      } else {
        delete tab.node.dataset.active;
        delete tab.pane.dataset.on;
      }
    }
    urlText.textContent = page.shown;
    onPage({ chip: page.spec?.chip });
    const dim = (button: HTMLElement, off: boolean) => {
      if (off) button.dataset.dim = "";
      else delete button.dataset.dim;
    };
    dim(backButton, active.at === 0);
    dim(forwardButton, active.at >= active.history.length - 1);
    const site = page.kind === "site";
    shield.hidden = !site;
    external.hidden = !site;
    delete win.dataset.engaged;
    add.toggleAttribute("data-dim", tabs.length >= MAX_TABS);
    clearInvalid();
  }

  function select(tab: Tab) {
    active = tab;
    sync();
    mountSite(tab);
  }

  // A page the visitor asked for replaces the open one, and back returns to it.
  function go(tab: Tab, page: Page) {
    tab.history = tab.history.slice(0, tab.at + 1);
    tab.history.push(page);
    tab.at += 1;
    render(tab);
    if (tab === active) sync();
  }

  function step(direction: 1 | -1) {
    if (!active) return;
    const next = active.at + direction;
    if (next < 0 || next >= active.history.length) return;
    active.at = next;
    render(active);
    sync();
  }

  function reload() {
    if (!active) return;
    const tab = active;
    clearTimeout(reloadTimer);
    if (tab.frame) {
      const loading = tab.pane.querySelector<HTMLElement>(".live-frame-loading");
      if (loading) delete loading.dataset.loaded;
      tab.frame.src = current(tab).url ?? "";
      return;
    }
    // A picture has nothing to fetch: cover it for a moment, like a reload.
    const cover = create("div", "live-frame-loading");
    cover.dataset.reload = "";
    cover.append(create("span", "live-frame-sheen"));
    tab.pane.append(cover);
    reloadTimer = setTimeout(() => cover.remove(), RELOAD_MS);
  }

  function openTab() {
    if (tabs.length >= MAX_TABS) return;
    const tab = newTab({ kind: "blank", title: "New tab", shown: "" });
    render(tab);
    select(tab);
    if (matchMedia("(pointer: fine)").matches) startEditing();
  }

  // The tab to the right of a closed one takes over, else the one to its left.
  function closeTab(tab: Tab) {
    const index = tabs.indexOf(tab);
    if (index < 0) return;
    tabs.splice(index, 1);
    tab.node.remove();
    tab.pane.remove();
    if (!tabs.length) {
      active = undefined;
      onEmpty();
      return;
    }
    if (tab === active) select(tabs[index] ?? tabs[tabs.length - 1]);
    else sync();
  }

  // ---- Address bar ---------------------------------------------------------
  function clearInvalid() {
    clearTimeout(invalidTimer);
    delete urlBox.dataset.invalid;
    input.removeAttribute("aria-invalid");
  }
  function flagInvalid() {
    clearTimeout(invalidTimer);
    urlBox.dataset.invalid = "Enter a valid web address";
    input.setAttribute("aria-invalid", "true");
    invalidTimer = setTimeout(clearInvalid, INVALID_MS);
  }
  function startEditing() {
    if (!active || !input.hidden) return;
    const page = current(active);
    input.value = page.kind === "blank" ? "" : page.shown;
    urlText.hidden = true;
    input.hidden = false;
    input.focus({ preventScroll: true });
    input.select();
  }
  function stopEditing() {
    input.hidden = true;
    urlText.hidden = false;
    clearInvalid();
  }
  function submit() {
    const url = parseAddress(input.value);
    if (!url || !active) {
      flagInvalid();
      return;
    }
    stopEditing();
    go(active, {
      kind: "site",
      title: labelOf(url),
      shown: addressOf(url),
      url,
    });
  }

  input.addEventListener("input", clearInvalid);
  input.addEventListener("keydown", (event) => {
    // Typing here must not reach the page's own key handling.
    event.stopPropagation();
    if (event.key === "Enter") submit();
    else if (event.key === "Escape") stopEditing();
  });
  input.addEventListener("blur", () => {
    if (!input.hidden) stopEditing();
  });
  urlBox.addEventListener("click", (event) => {
    if (event.target !== input) startEditing();
  });

  // ---- Presses -------------------------------------------------------------
  strip.addEventListener("click", (event) => {
    const target = event.target as HTMLElement;
    const closing = target.closest<HTMLElement>("[data-close]");
    if (closing) {
      const tab = tabs.find((entry) => entry.id === closing.dataset.close);
      if (tab) closeTab(tab);
      return;
    }
    if (target.closest(`.${p}-tab-add`)) {
      openTab();
      return;
    }
    const hit = target.closest<HTMLElement>("[data-tab]");
    const tab = tabs.find((entry) => entry.id === hit?.dataset.tab);
    if (tab && tab !== active) select(tab);
  });
  backButton.addEventListener("click", () => step(-1));
  forwardButton.addEventListener("click", () => step(1));
  reloadButton.addEventListener("click", reload);
  external.addEventListener("click", () => {
    const url = active && current(active).url;
    if (url) window.open(url, "_blank", "noopener,noreferrer");
  });
  shield.addEventListener("click", () => {
    win.dataset.engaged = "";
  });
  const disengage = () => delete win.dataset.engaged;
  win.addEventListener("pointerleave", disengage);

  function reset() {
    clearTimeout(reloadTimer);
    stopEditing();
    for (const tab of [...tabs]) {
      tab.node.remove();
      tab.pane.remove();
    }
    tabs.length = 0;
    for (const spec of specs) {
      const tab = newTab(
        { kind: "shot", title: spec.title, shown: spec.url, spec },
        spec.id,
      );
      render(tab);
    }
    select(tabs[0]);
  }
  reset();

  return {
    reset,
    setVisible(next) {
      visible = next;
      if (visible && active) mountSite(active);
    },
    dispose() {
      clearTimeout(invalidTimer);
      clearTimeout(reloadTimer);
      win.removeEventListener("pointerleave", disengage);
    },
  };
}
