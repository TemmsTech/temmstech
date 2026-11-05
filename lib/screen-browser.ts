import {
  createScreenDesktop,
  resolveDesktop,
  type DesktopOption,
} from "@/lib/screen-desktop";
import { projectiveTransform, type Quad } from "@/lib/screen-portal";
import { createScreenBrave } from "@/lib/screen-brave";
import { createScreenExplorer } from "@/lib/screen-explorer";
import { createScreenGranola } from "@/lib/screen-granola";
import { createScreenTerminal } from "@/lib/screen-terminal";
import { createScreenWhatsApp } from "@/lib/screen-whatsapp";
import { createScreenVideoPlayer } from "@/lib/screen-video-player";
import { createScreenVsCode } from "@/lib/screen-vscode";
import {
  dispatchShowcaseTab,
  dispatchShowcaseWindow,
} from "@/lib/showcase-events";
import { WINDOW_ICONS } from "@/lib/window-controls";
import type { ShowcaseProject, ShowcaseVideo } from "@/types/showcase";

const TYPING_STEP_MS = 22;
// How long a simulated reload covers the page; the progress bar runs 900ms.
const RELOAD_MS = 900;
const CONTROL_LABELS = {
  minimise: "Minimise",
  maximise: "Maximise",
  restore: "Restore down",
  close: "Close",
} as const;

export type BrowserKind = "laptop" | "tablet" | "phone";

type ScreenBrowserOptions = {
  kind: BrowserKind;
  /** Width / height of the model's display. */
  aspect: number;
  /** Plays once in a miniature player over the screen, then minimises. */
  video?: ShowcaseVideo;
  /** Desktop behind the window (laptop and tablet): "auto" follows the visitor's OS. */
  desktop?: DesktopOption;
};

/** full: fills the screen · windowed: smaller, centred · minimised / closed: shrunk into the taskbar. */
type WindowState = "full" | "windowed" | "minimised" | "closed";

export type ScreenBrowser = {
  /** Pin the browser to the projected screen corners, or hide it. */
  update: (corners: Quad, visible: boolean) => void;
  /** Open the tab for a project; animated opens slide the page in. */
  setActive: (index: number, animate: boolean) => void;
  /** Load the live site of the open tab and run the video player, or unload and pause both. */
  setLive: (enabled: boolean) => void;
  /** Kept for the scenes' autoplay hook. There is no simulated pointer any more (visitors use their own mouse), so this does nothing. */
  setAuto: (enabled: boolean) => void;
  dispose: () => void;
};

function create<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  className: string,
  text?: string,
) {
  const node = document.createElement(tag);
  node.className = className;
  if (text) node.textContent = text;
  return node;
}

function addressOf(url: string) {
  const { host, pathname } = new URL(url);
  return pathname === "/" ? host : `${host}${pathname}`;
}

/**
 * A DOM browser window that sits over a device's screen: a tab strip (laptop
 * and tablet), an address bar and the live website. WebGL cannot paint
 * cross-origin pages, so the window is real DOM, laid out at the device's own
 * viewport size and mapped onto the model's screen in perspective. Phones get
 * a 390px-wide viewport so sites show their real mobile layout.
 */
export function createScreenBrowser(
  host: HTMLElement,
  projects: readonly ShowcaseProject[],
  { kind, aspect, video, desktop = "auto" }: ScreenBrowserOptions,
): ScreenBrowser {
  const phone = kind === "phone";
  const width = phone ? 390 : 1280;
  const height = Math.round(width / aspect);
  const chrome = phone ? 110 : 116;

  const root = create("div", "screen-browser");
  root.dataset.kind = kind;
  root.style.width = `${width}px`;
  root.style.height = `${height}px`;
  root.hidden = true;
  // Everything of the browser lives in one window, so it can shrink, move and
  // hide as a whole while the desktop stays still behind it.
  const win = create("div", "screen-window");
  root.appendChild(win);

  const pill = create("div", "screen-browser-pill");
  const tabs = phone
    ? []
    : projects.map((project) => {
        const tab = create("div", "screen-browser-tab");
        tab.append(
          create("span", "screen-browser-tab-icon", project.title.charAt(0)),
          create("span", "screen-browser-tab-title", project.title),
        );
        return tab;
      });
  let tabStrip: HTMLElement | undefined;
  const controlButtons: Partial<
    Record<"minimise" | "maximise" | "close", HTMLButtonElement>
  > = {};
  if (phone) win.appendChild(create("div", "screen-browser-status"));
  else {
    tabStrip = create("div", "screen-browser-tabs");
    // The right end of the strip is kept clear for the window controls.
    pill.style.width = `calc((100% - 14px - var(--window-controls)) / ${projects.length})`;
    const controls = create("div", "screen-browser-controls");
    for (const name of ["minimise", "maximise", "close"] as const) {
      const control = create("button", "screen-browser-control");
      control.type = "button";
      control.tabIndex = -1;
      control.dataset.control = name;
      control.setAttribute(
        "aria-label",
        name === "maximise" ? CONTROL_LABELS.restore : CONTROL_LABELS[name],
      );
      control.innerHTML = WINDOW_ICONS[name === "maximise" ? "restore" : name];
      control.addEventListener("click", () => pressControl(name));
      controlButtons[name] = control;
      controls.appendChild(control);
    }
    tabStrip.append(pill, ...tabs, controls);
    win.appendChild(tabStrip);
    // Pressing a tab must not start turning the device by hand.
    tabStrip.addEventListener("pointerdown", (event) => event.stopPropagation());
    tabs.forEach((tab, index) =>
      tab.addEventListener("click", () => dispatchShowcaseTab(host, index)),
    );
  }

  const bar = create("div", "screen-browser-bar");
  const address = create("div", "screen-browser-address");
  const urlText = create("span", "screen-browser-url");
  address.append(create("span", "screen-browser-scheme", "https://"), urlText);
  const progress = create("div", "screen-browser-load");
  if (!phone) {
    const nav = create("div", "screen-browser-nav");
    const navButton = (label: string, glyph: string, run: () => void) => {
      const button = create("button", "screen-browser-nav-btn", glyph);
      button.type = "button";
      button.tabIndex = -1;
      button.setAttribute("aria-label", label);
      button.addEventListener("click", run);
      return button;
    };
    nav.append(
      navButton("Back", "‹", () => step(-1)),
      navButton("Forward", "›", () => step(1)),
      navButton("Reload", "↻", () => simulateReload()),
    );
    bar.appendChild(nav);
    // Pressing a control must not start turning the device by hand.
    bar.addEventListener("pointerdown", (event) => event.stopPropagation());
  }
  bar.append(address, progress);
  win.appendChild(bar);

  const stage = create("div", "screen-browser-stage");
  const pages = projects.map((project) => {
    const page = create("div", "screen-browser-page");
    page.dataset.state = "idle";
    const loading = create("div", "live-frame-loading");
    loading.append(
      create("span", "live-frame-sheen"),
      create("p", "screen-browser-loading-title", project.title),
    );
    page.appendChild(loading);
    stage.appendChild(page);
    return { page, loading };
  });
  win.appendChild(stage);

  // Click-to-interact: the site stays behind a shield so the page can still
  // scroll while the mouse is over the laptop. The first click engages the
  // site; leaving the device hands scrolling back to the page.
  const shield = create("div", "screen-browser-shield");
  shield.style.top = `${chrome}px`;
  win.appendChild(shield);
  // A ripple marks where a visitor's click engages the site.
  const ripple = create("div", "screen-cursor-ripple");
  win.appendChild(ripple);

  // Out of reach of keyboard and assistive tech; only the tabs, the nav buttons, the shield and
  // (once engaged) the site respond to the mouse.
  for (const part of win.children) {
    part.setAttribute("aria-hidden", "true");
    if (part !== tabStrip && part !== bar && part !== shield && part !== stage)
      (part as HTMLElement).inert = true;
  }
  stage.inert = true;
  // On a laptop or tablet the video minimises into a taskbar button; the
  // phone has no taskbar, so its player keeps the corner chip.
  const player = video
    ? createScreenVideoPlayer(
        root,
        host,
        video,
        phone
          ? undefined
          : {
              target: () => (desk ? centreOf(desk.videoButton, root) : undefined),
              onChange: (state) => {
                root.dataset.video = state;
                desk?.setVideo(
                  state === "idle"
                    ? "hidden"
                    : state === "open" || state === "mini"
                      ? "open"
                      : state === "closed"
                        ? "closed"
                        : "minimised",
                );
              },
            },
      )
    : undefined;
  // The desktop sits behind the window; phones have no window buttons, so no desktop.
  const desktopStyle = resolveDesktop(desktop, kind);
  const desk = phone
    ? undefined
    : createScreenDesktop(host, desktopStyle, {
        onApp: () => pressTaskbar(),
        onOpen: () => {
          if (windowHidden()) reopen();
        },
        onVideo: () => player?.restore(),
        onCode: () => code?.toggle(),
        onOpenCode: () => code?.open(),
        onExplorer: () => explorer?.toggle(),
        onTerminal: () => terminal?.toggle(),
        onWhatsApp: () => whatsapp?.toggle(),
        onBrave: () => brave?.toggle(),
        onOpenBrave: () => brave?.open(),
        onGranola: () => granola?.toggle(),
        onOpenGranola: () => granola?.open(),
      });
  if (desk) {
    root.dataset.desktop = desktopStyle;
    root.dataset.window = "full";
    root.dataset.top = "browser";
    root.insertBefore(desk.element, win);
  }
  // Static VS Code, File Explorer, Terminal, WhatsApp, Brave and Granola windows, on the Windows desktop only.
  // Whichever window was opened last sits on top (see raise).
  const code =
    desk && desktopStyle === "windows"
      ? createScreenVsCode(root, {
          target: () => centreOf(desk.codeButton, root),
          onChange: (state) => {
            desk.setCode(state);
            if (state === "open") raise("code");
          },
        })
      : undefined;
  const explorer =
    desk && desktopStyle === "windows"
      ? createScreenExplorer(root, {
          target: () => centreOf(desk.explorerButton, root),
          onChange: (state) => {
            desk.setExplorer(state);
            if (state === "open") raise("explorer");
          },
          onOpenFile: (path) => code?.openFile(path),
        })
      : undefined;
  const terminal =
    desk && desktopStyle === "windows"
      ? createScreenTerminal(root, {
          target: () => centreOf(desk.terminalButton, root),
          onChange: (state) => {
            desk.setTerminal(state);
            if (state === "open") raise("terminal");
          },
        })
      : undefined;
  const whatsapp =
    desk && desktopStyle === "windows"
      ? createScreenWhatsApp(root, {
          target: () => centreOf(desk.whatsappButton, root),
          onChange: (state) => {
            desk.setWhatsApp(state);
            if (state === "open") raise("whatsapp");
          },
        })
      : undefined;
  const brave =
    desk && desktopStyle === "windows"
      ? createScreenBrave(root, {
          target: () => centreOf(desk.braveButton, root),
          onChange: (state) => {
            desk.setBrave(state);
            if (state === "open") raise("brave");
          },
        })
      : undefined;
  const granola =
    desk && desktopStyle === "windows"
      ? createScreenGranola(root, {
          target: () => centreOf(desk.granolaButton, root),
          onChange: (state) => {
            desk.setGranola(state);
            if (state === "open") raise("granola");
          },
        })
      : undefined;

  // The windows' stacking order, lowest first; z-index 1.. follows it, below
  // the video layer. Opening or restoring a window moves it to the end.
  type AppName = "browser" | "code" | "explorer" | "terminal" | "whatsapp" | "brave" | "granola";
  const stack: AppName[] = ["browser"];
  function raise(name: AppName) {
    const at = stack.indexOf(name);
    if (at >= 0) stack.splice(at, 1);
    stack.push(name);
    root.dataset.top = name;
    const layers: Record<AppName, HTMLElement | undefined> = {
      browser: win,
      code: code?.element,
      explorer: explorer?.element,
      terminal: terminal?.element,
      whatsapp: whatsapp?.element,
      brave: brave?.element,
      granola: granola?.element,
    };
    stack.forEach((app, index) => {
      const layer = layers[app];
      if (layer) layer.style.zIndex = String(index + 1);
    });
  }
  host.appendChild(root);

  function rippleAt(x: number, y: number) {
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;
    delete ripple.dataset.run;
    void ripple.offsetWidth;
    ripple.dataset.run = "";
  }
  function engage(x: number, y: number) {
    root.dataset.engaged = "";
    stage.inert = false;
    rippleAt(x, y + chrome);
  }
  function disengage() {
    delete root.dataset.engaged;
    stage.inert = true;
  }
  shield.addEventListener("pointerdown", (event) => event.stopPropagation());
  shield.addEventListener("click", (event) => engage(event.offsetX, event.offsetY));
  host.addEventListener("pointerleave", disengage);

  const frames = new Map<number, HTMLIFrameElement>();
  let active = 0;
  let live = false;
  let typingTimer: ReturnType<typeof setInterval> | undefined;
  let reloadTimer: ReturnType<typeof setTimeout> | undefined;
  let reloading = -1;

  // Centre of an element in the given box's own layout pixels (the window by default).
  function centreOf(element: HTMLElement, within: HTMLElement = win) {
    let x = element.offsetWidth / 2;
    let y = element.offsetHeight / 2;
    for (
      let node: HTMLElement | null = element;
      node && node !== within;
      node = node.offsetParent as HTMLElement | null
    ) {
      x += node.offsetLeft;
      y += node.offsetTop;
    }
    return { x, y };
  }
  // Window state. Minimise and close only hide the window: every iframe stays
  // mounted, so nothing reloads, and restoring plays the same motion backwards.
  let windowState: WindowState = "full";
  let restoreTo: "full" | "windowed" = "full";
  let windowAnnounced = false;

  function windowHidden() {
    return windowState === "minimised" || windowState === "closed";
  }
  // Like the video player, tell the host while the window is out of sight so
  // the tab rotation holds still. Only a live screen reports.
  function announceWindow() {
    const hidden = live && windowHidden();
    if (hidden === windowAnnounced) return;
    windowAnnounced = hidden;
    dispatchShowcaseWindow(host, hidden);
  }
  // The window shrinks towards the taskbar button: offsets from its own centre.
  function aimAtTaskbar() {
    if (!desk) return;
    const target = centreOf(desk.appButton, root);
    root.style.setProperty("--min-x", `${target.x - width / 2}px`);
    root.style.setProperty("--min-y", `${target.y - height / 2}px`);
  }
  function setWindow(next: WindowState) {
    if (!desk || next === windowState) return;
    if (next === "minimised" && windowState !== "closed")
      restoreTo = windowState === "windowed" ? "windowed" : "full";
    if (next === "closed") restoreTo = "full";
    if (next === "minimised" || next === "closed") {
      aimAtTaskbar();
      disengage();
    }
    windowState = next;
    root.dataset.window = next;
    if (next === "full" || next === "windowed") raise("browser");
    win.inert = windowHidden();
    const maximise = controlButtons.maximise;
    if (maximise) {
      const full = next === "full";
      maximise.innerHTML = full ? WINDOW_ICONS.restore : WINDOW_ICONS.maximise;
      maximise.setAttribute(
        "aria-label",
        full ? CONTROL_LABELS.restore : CONTROL_LABELS.maximise,
      );
    }
    desk.setApp(
      next === "closed" ? "closed" : next === "minimised" ? "minimised" : "open",
    );
    announceWindow();
  }
  function reopen() {
    setWindow(windowState === "closed" ? "full" : restoreTo);
  }
  function pressControl(name: "minimise" | "maximise" | "close") {
    if (name === "minimise") setWindow("minimised");
    else if (name === "close") setWindow("closed");
    else if (windowState === "full") setWindow("windowed");
    else if (windowState === "windowed") setWindow("full");
  }
  // Like a real taskbar: it brings a hidden window back and hides a visible one.
  function pressTaskbar() {
    if (windowHidden()) reopen();
    else setWindow("minimised");
  }

  function mountFrame(index: number) {
    if (!live || !projects[index]) return;
    mountSite(index);
  }

  function mountSite(index: number) {
    const project = projects[index];
    if (!project || frames.has(index)) return;
    const frame = document.createElement("iframe");
    frame.title = `${project.title} live website preview`;
    frame.setAttribute(
      "sandbox",
      "allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox",
    );
    frame.referrerPolicy = "strict-origin-when-cross-origin";
    frame.tabIndex = -1;
    frame.style.width = `${width}px`;
    frame.style.height = `${height - chrome}px`;
    const { page, loading } = pages[index];
    frame.addEventListener("load", () => {
      frame.dataset.loaded = "";
      if (reloading !== index) loading.dataset.loaded = "";
    });
    frame.src = project.url;
    page.appendChild(frame);
    frames.set(index, frame);
  }

  // Back and forward walk the tabs like a history, through the same path a
  // tab click takes, so the rest of the showcase stays in step.
  function step(direction: 1 | -1) {
    if (projects.length < 2) return;
    dispatchShowcaseTab(
      host,
      (active + direction + projects.length) % projects.length,
    );
  }

  // The site is already loaded and is never really reloaded: cover it with the
  // loading placeholder and run the progress bar, then reveal it again.
  function endReload() {
    clearTimeout(reloadTimer);
    if (reloading < 0) return;
    const { loading } = pages[reloading];
    delete loading.dataset.reload;
    if (frames.get(reloading)?.dataset.loaded !== undefined)
      loading.dataset.loaded = "";
    reloading = -1;
  }
  function simulateReload() {
    if (!live || !frames.has(active)) return;
    endReload();
    reloading = active;
    const { loading } = pages[active];
    loading.dataset.reload = "";
    delete loading.dataset.loaded;
    restartProgress();
    reloadTimer = setTimeout(endReload, RELOAD_MS);
  }

  function typeAddress(text: string, animate: boolean) {
    clearInterval(typingTimer);
    if (!animate) {
      urlText.textContent = text;
      return;
    }
    let length = 0;
    urlText.textContent = "";
    typingTimer = setInterval(() => {
      length += 1;
      urlText.textContent = text.slice(0, length);
      if (length >= text.length) clearInterval(typingTimer);
    }, TYPING_STEP_MS);
  }

  function restartProgress() {
    delete progress.dataset.run;
    void progress.offsetWidth;
    progress.dataset.run = "";
  }

  function setActive(index: number, animate: boolean) {
    if (!projects[index]) return;
    const previous = active;
    active = index;
    endReload();
    // Jumps (first paint, reduced motion) skip every transition.
    if (!animate) {
      root.dataset.instant = "";
      void root.offsetWidth;
    }
    tabs.forEach((tab, i) => {
      tab.dataset.active = String(i === index);
    });
    pill.style.transform = `translateX(${index * 100}%)`;
    pages.forEach(({ page }, i) => {
      page.dataset.state =
        i === index
          ? "active"
          : animate && i === previous
            ? "leaving"
            : "idle";
    });
    typeAddress(addressOf(projects[index].url), animate);
    if (animate) restartProgress();
    else {
      void root.offsetWidth;
      delete root.dataset.instant;
    }
    // Each site loads once, the first time its tab opens, and then stays in
    // place for good, so switching tabs never reloads or replays anything.
    mountFrame(index);
  }

  setActive(0, false);

  return {
    update(corners, visible) {
      const transform = visible
        ? projectiveTransform(corners, width, height)
        : "none";
      const hide = transform === "none";
      if (root.hidden !== hide) root.hidden = hide;
      if (!hide) root.style.transform = transform;
    },
    setActive,
    setLive(enabled) {
      if (enabled === live) return;
      live = enabled;
      player?.setLive(enabled);
      code?.setLive(enabled);
      terminal?.setLive(enabled);
      granola?.setLive(enabled);
      if (enabled) mountFrame(active);
      announceWindow();
    },
    setAuto() {},
    dispose() {
      clearInterval(typingTimer);
      clearTimeout(reloadTimer);
      host.removeEventListener("pointerleave", disengage);
      live = false;
      announceWindow();
      desk?.dispose();
      code?.dispose();
      explorer?.dispose();
      terminal?.dispose();
      whatsapp?.dispose();
      brave?.dispose();
      granola?.dispose();
      player?.dispose();
      frames.clear();
      root.remove();
    },
  };
}
