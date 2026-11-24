import {
  createScreenDesktop,
  resolveDesktop,
  type DesktopOption,
} from "@/lib/screen-desktop";
import { addressOf, labelOf, parseAddress } from "@/lib/screen-address";
import { projectiveTransform, type Quad } from "@/lib/screen-portal";
import { createScreenBrave } from "@/lib/screen-brave";
import { createScreenChrome } from "@/lib/screen-chrome";
import { createScreenChatgpt } from "@/lib/screen-chatgpt";
import { createScreenClaude } from "@/lib/screen-claude";
import { createScreenExplorer } from "@/lib/screen-explorer";
import { createScreenGranola } from "@/lib/screen-granola";
import { createScreenRecycleBin } from "@/lib/screen-recycle-bin";
import { createScreenPower } from "@/lib/screen-power";
import { createScreenStart } from "@/lib/screen-start";
import { PROFILE_NAME } from "@/data/start-menu";
import { createScreenTerminal } from "@/lib/screen-terminal";
import { createScreenWhatsApp } from "@/lib/screen-whatsapp";
import { createScreenVideoPlayer } from "@/lib/screen-video-player";
import { createScreenVsCode } from "@/lib/screen-vscode";
import {
  dispatchShowcaseTab,
  dispatchShowcaseWindow,
} from "@/lib/showcase-events";
import { WINDOW_ICONS } from "@/lib/window-controls";
import { showcaseVideo } from "@/data/device-showcase";
import type { ShowcaseProject, ShowcaseVideo } from "@/types/showcase";

const TYPING_STEP_MS = 22;
// The VLC media player window is on for every visitor.
const vlcEnabled = () => true;
// How long a simulated reload covers the page; the progress bar runs 900ms.
const RELOAD_MS = 900;
// Most tabs open at once; the strip stays readable up to here.
const MAX_TABS = 9;
// From this many open tabs the strip drops the tab icons to make room.
const DENSE_TABS = 7;
// How long the "not a valid address" hint stays up.
const INVALID_MS = 1800;
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
  update: (
    corners: Quad,
    visible: boolean,
    /** How far down the screen stays visible (0–1) at its left, middle and right edges; the rest is covered by the model. */
    cover?: readonly [number, number, number],
  ) => void;
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

/** One tab: a showcase site, or a tab the visitor opened (blank until an address is typed). */
type Entry = { title: string; url: string };

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
  // Every tab, in strip order: the showcase sites first, then any the visitor
  // opens. Indices never change or get reused, so a closed tab keeps its slot.
  const entries: Entry[] = projects.map(({ title, url }) => ({ title, url }));
  const isOwn = (index: number) => index >= projects.length;
  function makeTab(index: number) {
    const entry = entries[index];
    const tab = create("div", "screen-browser-tab");
    // Closes this tab only; it must not also select it.
    const closeTab = create("button", "screen-browser-tab-close");
    closeTab.type = "button";
    closeTab.tabIndex = -1;
    closeTab.setAttribute("aria-label", `Close ${entry.title} tab`);
    closeTab.innerHTML = WINDOW_ICONS.close;
    closeTab.addEventListener("click", (event) => {
      event.stopPropagation();
      closeTabAt(index);
    });
    tab.append(
      create("span", "screen-browser-tab-icon", entry.title.charAt(0)),
      create("span", "screen-browser-tab-title", entry.title),
      closeTab,
    );
    tab.title = entry.title;
    tab.addEventListener("click", () => select(index));
    return tab;
  }
  const tabs = phone ? [] : entries.map((_, index) => makeTab(index));
  let tabStrip: HTMLElement | undefined;
  let addTab: HTMLButtonElement | undefined;
  const controlButtons: Partial<
    Record<"minimise" | "maximise" | "close", HTMLButtonElement>
  > = {};
  if (phone) win.appendChild(create("div", "screen-browser-status"));
  else {
    tabStrip = create("div", "screen-browser-tabs");
    // The right end of the strip is kept clear for the window controls.
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
    addTab = create("button", "screen-browser-tab-add", "+");
    addTab.type = "button";
    addTab.tabIndex = -1;
    addTab.setAttribute("aria-label", "New tab");
    addTab.addEventListener("click", () => openTab());
    tabStrip.append(pill, ...tabs, addTab, controls);
    win.appendChild(tabStrip);
    // Pressing a tab must not start turning the device by hand.
    tabStrip.addEventListener("pointerdown", (event) => event.stopPropagation());
  }

  const bar = create("div", "screen-browser-bar");
  const address = create("div", "screen-browser-address");
  // Laptop and tablet: a real text field. The phone's bar is only a label.
  const urlInput = phone ? undefined : create("input", "screen-browser-url");
  const urlText = phone ? create("span", "screen-browser-url") : undefined;
  address.append(
    create("span", "screen-browser-scheme", "https://"),
    (urlInput ?? urlText) as HTMLElement,
  );
  // For a page the visitor typed in: many sites refuse to be shown inside
  // another page and browsers offer no way round that, so it opens for real.
  const external = create(
    "button",
    "screen-browser-external",
    "Open in a real tab ↗",
  );
  external.type = "button";
  external.tabIndex = -1;
  external.hidden = true;
  external.addEventListener("click", () => {
    const url = entries[active]?.url;
    if (url) window.open(url, "_blank", "noopener,noreferrer");
  });
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
  if (urlInput) {
    urlInput.type = "text";
    urlInput.tabIndex = -1;
    urlInput.maxLength = 2048;
    urlInput.spellcheck = false;
    urlInput.autocomplete = "off";
    urlInput.autocapitalize = "off";
    urlInput.inputMode = "url";
    urlInput.enterKeyHint = "go";
    urlInput.placeholder = "Type a web address";
    urlInput.setAttribute("aria-label", "Address bar");
    urlInput.addEventListener("focus", () =>
      requestAnimationFrame(() => urlInput.select()),
    );
    urlInput.addEventListener("input", () => {
      clearInterval(typingTimer);
      clearInvalid();
    });
    urlInput.addEventListener("keydown", (event) => {
      // Typing here must not reach the page's own key handling.
      event.stopPropagation();
      if (event.key === "Enter") submitAddress();
      else if (event.key === "Escape") {
        showAddress(addressOf(entries[active]?.url ?? ""));
        clearInvalid();
        urlInput.blur();
      }
    });
  }
  bar.append(address, external, progress);
  win.appendChild(bar);

  const stage = create("div", "screen-browser-stage");
  type Page = {
    page: HTMLElement;
    loading: HTMLElement;
    title: HTMLElement;
    blank?: HTMLElement;
  };
  // A page holds the loading placeholder and, once it loads, the site's iframe.
  // A tab the visitor opened starts as a blank "new tab" page with no placeholder.
  function makePage(index: number): Page {
    const entry = entries[index];
    const page = create("div", "screen-browser-page");
    page.dataset.state = "idle";
    const loading = create("div", "live-frame-loading");
    const title = create("p", "screen-browser-loading-title", entry.title);
    loading.append(create("span", "live-frame-sheen"), title);
    page.appendChild(loading);
    let blank: HTMLElement | undefined;
    if (!entry.url) {
      loading.dataset.loaded = "";
      blank = create("div", "screen-browser-newtab");
      blank.append(
        create("p", "screen-browser-newtab-title", "New tab"),
        create(
          "p",
          "screen-browser-newtab-hint",
          "Type a web address in the bar above and press Enter.",
        ),
      );
      page.appendChild(blank);
    }
    stage.appendChild(page);
    return { page, loading, title, blank };
  }
  const pages = projects.map((_, index) => makePage(index));
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
                        ? "hidden"
                        : "minimised",
                );
              },
              // The video ended or was closed: leave the browser on its taskbar
              // button so the visitor lands on the desktop (it is one click away).
              onDone: () => {
                if (!windowHidden()) setWindow("minimised");
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
          // Hidden: bring it back. Already open but under another window: bring it forward.
          if (windowHidden()) reopen();
          else raise("browser");
        },
        onVideo: () => player?.restore(),
        onCode: () => toggleApp("code", code),
        onOpenCode: () => code?.open(),
        onExplorer: () => toggleApp("explorer", explorer),
        onTerminal: () => toggleApp("terminal", terminal),
        onWhatsApp: () => toggleApp("whatsapp", whatsapp),
        onBrave: () => toggleApp("brave", brave),
        onOpenBrave: () => brave?.open(),
        onGranola: () => toggleApp("granola", granola),
        onOpenGranola: () => granola?.open(),
        onBin: () => toggleApp("bin", bin),
        onOpenBin: () => bin?.open(),
        // 3D Prototypes is an empty folder: File Explorer opens on it, like a real folder on the desktop.
        onOpenPrototypes: () => explorer?.openPlace("3D Prototypes"),
        // VLC: the taskbar button opens it or sends it away; a double-click on the icon opens it.
        onVlc: () => {
          if (vlcState === "open" || vlcState === "mini") vlc?.minimise();
          else vlc?.restore();
        },
        onOpenVlc: () => {
          if (vlcState !== "open" && vlcState !== "mini") vlc?.restore();
        },
        onChrome: () => toggleApp("chrome", chromeApp),
        onOpenChrome: () => chromeApp?.open(),
        onClaude: () => toggleApp("claude", claudeApp),
        onOpenClaude: () => claudeApp?.open(),
        onChatgpt: () => toggleApp("chatgpt", chatgptApp),
        onOpenChatgpt: () => chatgptApp?.open(),
        onStart: () => start?.toggle(),
      });
  if (desk) {
    root.dataset.desktop = desktopStyle;
    root.dataset.window = "full";
    root.dataset.top = "browser";
    root.insertBefore(desk.element, win);
  }
  // Static VS Code, File Explorer, Terminal, WhatsApp, Brave, Granola, Recycle Bin and Chrome windows, on the Windows desktop only.
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
  const chromeApp =
    desk && desktopStyle === "windows"
      ? createScreenChrome(root, {
          target: () => centreOf(desk.chromeButton, root),
          onChange: (state) => {
            desk.setChrome(state);
            if (state === "open") raise("chrome");
          },
        })
      : undefined;
  const claudeApp =
    desk && desktopStyle === "windows"
      ? createScreenClaude(root, {
          target: () => centreOf(desk.claudeButton, root),
          onChange: (state) => {
            desk.setClaude(state);
            if (state === "open") raise("claude");
          },
        })
      : undefined;
  const chatgptApp =
    desk && desktopStyle === "windows"
      ? createScreenChatgpt(root, {
          target: () => centreOf(desk.chatgptButton, root),
          onChange: (state) => {
            desk.setChatgpt(state);
            if (state === "open") raise("chatgpt");
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
  const bin =
    desk && desktopStyle === "windows"
      ? createScreenRecycleBin(root, {
          target: () => centreOf(desk.binButton, root),
          onChange: (state) => {
            desk.setBin(state);
            if (state === "open") raise("bin");
          },
        })
      : undefined;

  // VLC media player (Windows desktop only): the same video player as above,
  // wearing a VLC frame. It plays showcaseVideo, waits for its icon or taskbar
  // button, and shrinks into that button when minimised or closed.
  let vlcState: "idle" | "open" | "mini" | "docked" | "closed" = "closed";
  const vlc =
    vlcEnabled() && desk && desktopStyle === "windows"
      ? createScreenVideoPlayer(
          root,
          host,
          showcaseVideo,
          {
            target: () => centreOf(desk.vlcButton, root),
            onChange: (state) => {
              vlcState = state;
              desk.setVlc(
                state === "open" || state === "mini"
                  ? "open"
                  : state === "docked"
                    ? "minimised"
                    : "closed",
              );
            },
          },
          { skin: "vlc" },
        )
      : undefined;

  // The windows' stacking order, lowest first; z-index 1.. follows it, below
  // the video layer. Opening or restoring a window moves it to the end.
  type AppName = "browser" | "code" | "explorer" | "terminal" | "whatsapp" | "brave" | "granola" | "bin" | "chrome" | "claude" | "chatgpt";
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
      bin: bin?.element,
      chrome: chromeApp?.element,
      claude: claudeApp?.element,
      chatgpt: chatgptApp?.element,
    };
    stack.forEach((app, index) => {
      const layer = layers[app];
      if (layer) layer.style.zIndex = String(index + 1);
    });
  }
  // Focus follows the click: pressing anywhere on a visible window lifts it over
  // the others, so a windowed (smaller) window never has to be minimised first.
  // Capture phase, because each window stops pointerdown from bubbling out.
  const clickable: Partial<Record<AppName, HTMLElement | undefined>> = {
    browser: win,
    code: code?.element,
    explorer: explorer?.element,
    terminal: terminal?.element,
    whatsapp: whatsapp?.element,
    brave: brave?.element,
    granola: granola?.element,
    bin: bin?.element,
    chrome: chromeApp?.element,
    claude: claudeApp?.element,
    chatgpt: chatgptApp?.element,
  };
  if (desk)
    for (const [name, layer] of Object.entries(clickable) as [AppName, HTMLElement | undefined][])
      layer?.addEventListener(
        "pointerdown",
        () => {
          if (stack[stack.length - 1] !== name) raise(name);
        },
        true,
      );
  // A taskbar button, like Windows: hidden opens it, open but under another window
  // brings it forward, and only the window already on top minimises.
  function toggleApp(name: AppName, app?: { hidden: () => boolean; toggle: () => void }) {
    if (!app) return;
    if (!app.hidden() && stack[stack.length - 1] !== name) raise(name);
    else app.toggle();
  }
  // The Start menu (Windows desktop). It sits above every window and opens the ones this desktop has.
  // Lock, sleep, shut down and restart, from the Start menu's power button.
  const power =
    desk && desktopStyle === "windows"
      ? createScreenPower(root, { name: PROFILE_NAME })
      : undefined;
  const start =
    desk && desktopStyle === "windows"
      ? createScreenStart(root, {
          host,
          button: () => desk.startButton,
          onChange: (open) => desk.setStart(open),
          onPower: power ? (action) => power.run(action) : undefined,
          launch: (app) => {
            const opens: Record<typeof app, () => void> = {
              edge: () => (windowHidden() ? reopen() : raise("browser")),
              chrome: () => chromeApp?.open(),
              brave: () => brave?.open(),
              code: () => code?.open(),
              explorer: () => explorer?.open(),
              terminal: () => terminal?.open(),
              granola: () => granola?.open(),
              claude: () => claudeApp?.open(),
              chatgpt: () => chatgptApp?.open(),
              whatsapp: () => whatsapp?.open(),
              bin: () => bin?.open(),
              vlc: () => {
                if (vlcState !== "open" && vlcState !== "mini") vlc?.restore();
              },
            };
            opens[app]();
          },
        })
      : undefined;
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
  // Tabs the visitor has closed. They stay in the data; only the strip hides them.
  const closed = new Set<number>();
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
    if (windowState === "closed") restoreTabs();
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
    if (!live || !entries[index]) return;
    mountSite(index);
  }

  function mountSite(index: number) {
    const entry = entries[index];
    if (!entry?.url || closed.has(index) || frames.has(index)) return;
    const frame = document.createElement("iframe");
    frame.title = `${entry.title} live website preview`;
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
    frame.src = entry.url;
    page.appendChild(frame);
    frames.set(index, frame);
  }

  // Back and forward walk the tabs like a history, through the same path a
  // tab click takes, so the rest of the showcase stays in step.
  function openTabs() {
    return entries.map((_, i) => i).filter((i) => !closed.has(i));
  }
  function step(direction: 1 | -1) {
    const open = openTabs();
    if (open.length < 2) return;
    const at = open.indexOf(active);
    select(open[(at + direction + open.length) % open.length] ?? 0);
  }
  // A tab opens locally; only the showcase's own sites also move the hero.
  function select(index: number) {
    if (closed.has(index) || !entries[index]) return;
    setActive(index, true);
    if (!isOwn(index)) dispatchShowcaseTab(host, index);
  }

  // The highlight sits behind the open tabs only, which share the strip
  // (minus the room kept for the + button and the window controls).
  function layoutTabs() {
    if (phone || !tabStrip) return;
    const open = openTabs();
    if (addTab) addTab.disabled = open.length >= MAX_TABS;
    if (open.length > DENSE_TABS) tabStrip.dataset.dense = "";
    else delete tabStrip.dataset.dense;
    if (!open.length) return;
    pill.style.width = `calc((100% - 14px - var(--window-controls) - var(--tab-add)) / ${open.length})`;
    const position = open.filter((i) => i < active).length;
    pill.style.transform = `translateX(${position * 100}%)`;
  }

  // A closed tab ends its page and stays closed: nothing brings it back until
  // the whole page is refreshed, which restarts the simulation.
  function removeTab(index: number) {
    if (reloading === index) endReload();
    closed.add(index);
    tabs[index].hidden = true;
    frames.get(index)?.remove();
    frames.delete(index);
    const { page, loading } = pages[index];
    delete loading.dataset.loaded;
    delete loading.dataset.reload;
    page.dataset.state = "idle";
    // A tab the visitor opened leaves nothing behind in the page.
    if (isOwn(index)) {
      tabs[index].remove();
      page.remove();
    }
  }

  // The tab to the right of a closed one takes over, else the one to its left.
  // Closing the last tab closes the window, like a real browser.
  function closeTabAt(index: number) {
    if (closed.has(index) || !entries[index]) return;
    if (openTabs().length <= 1) {
      removeTab(index);
      layoutTabs();
      setWindow("closed");
      return;
    }
    const wasActive = index === active;
    removeTab(index);
    if (wasActive) {
      const open = openTabs();
      select(open.find((i) => i > index) ?? open[open.length - 1] ?? 0);
    } else layoutTabs();
  }

  // The window opens again after its last tab was closed: a fresh, blank tab.
  function restoreTabs() {
    if (!openTabs().length) openTab(undefined, false);
  }

  // A new tab joins the end of the strip. With an address it loads that page;
  // without one it is a blank page and the address bar takes the typing.
  function openTab(url?: string, focus = true) {
    if (phone || !tabStrip || !addTab) return;
    if (openTabs().length >= MAX_TABS) return;
    const index = entries.length;
    entries.push({ title: "New tab", url: "" });
    const tab = makeTab(index);
    tabs.push(tab);
    tabStrip.insertBefore(tab, addTab);
    pages.push(makePage(index));
    setActive(index, true);
    if (url) navigate(index, url);
    else if (focus && matchMedia("(pointer: fine)").matches)
      urlInput?.focus({ preventScroll: true });
  }

  // Shows a page the visitor asked for in one of their own tabs: the tab takes
  // the site's name and the page loads behind the same placeholder as ours.
  function navigate(index: number, url: string) {
    const entry = entries[index];
    if (!entry || !isOwn(index) || closed.has(index)) return;
    const label = labelOf(url);
    if (reloading === index) endReload();
    entry.url = url;
    entry.title = label;
    tabs[index].querySelector(".screen-browser-tab-icon")!.textContent =
      label.charAt(0).toUpperCase();
    tabs[index].querySelector(".screen-browser-tab-title")!.textContent = label;
    tabs[index].title = label;
    tabs[index]
      .querySelector(".screen-browser-tab-close")!
      .setAttribute("aria-label", `Close ${label} tab`);
    const entryPage = pages[index];
    entryPage.title.textContent = label;
    entryPage.blank?.remove();
    entryPage.blank = undefined;
    frames.get(index)?.remove();
    frames.delete(index);
    delete entryPage.loading.dataset.loaded;
    delete entryPage.loading.dataset.reload;
    if (index === active) {
      showAddress(addressOf(url));
      restartProgress();
      updateExternal();
    }
    mountFrame(index);
  }

  // What was typed in the address bar. A tab of ours keeps its own site, so
  // the page opens in a new tab; a tab the visitor opened loads it in place.
  function submitAddress() {
    if (!urlInput) return;
    const url = parseAddress(urlInput.value);
    if (!url || (!isOwn(active) && openTabs().length >= MAX_TABS)) {
      flagInvalid(url ? "Too many tabs open" : "Enter a valid web address");
      return;
    }
    clearInvalid();
    urlInput.blur();
    if (isOwn(active) && !closed.has(active)) navigate(active, url);
    else openTab(url);
  }

  let invalidTimer: ReturnType<typeof setTimeout> | undefined;
  function flagInvalid(message: string) {
    clearTimeout(invalidTimer);
    address.dataset.invalid = message;
    urlInput?.setAttribute("aria-invalid", "true");
    invalidTimer = setTimeout(clearInvalid, INVALID_MS);
  }
  function clearInvalid() {
    clearTimeout(invalidTimer);
    delete address.dataset.invalid;
    urlInput?.removeAttribute("aria-invalid");
  }
  function updateExternal() {
    external.hidden = !(isOwn(active) && entries[active]?.url);
  }
  function showAddress(text: string) {
    if (urlInput) urlInput.value = text;
    else if (urlText) urlText.textContent = text;
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
    if (!animate || !text) {
      showAddress(text);
      return;
    }
    let length = 0;
    showAddress("");
    typingTimer = setInterval(() => {
      length += 1;
      showAddress(text.slice(0, length));
      if (length >= text.length) clearInterval(typingTimer);
    }, TYPING_STEP_MS);
  }

  function restartProgress() {
    delete progress.dataset.run;
    void progress.offsetWidth;
    progress.dataset.run = "";
  }

  let shown = false;
  function setActive(index: number, animate: boolean) {
    if (!entries[index] || closed.has(index)) return;
    // Already open (a tab click reaches here once from the tab and again from the hero).
    if (shown && index === active) return;
    shown = true;
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
    layoutTabs();
    pages.forEach(({ page }, i) => {
      page.dataset.state =
        i === index
          ? "active"
          : animate && i === previous
            ? "leaving"
            : "idle";
    });
    clearInvalid();
    typeAddress(addressOf(entries[index].url), animate);
    updateExternal();
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
  layoutTabs();

  return {
    update(corners, visible, cover) {
      const transform = visible
        ? projectiveTransform(corners, width, height)
        : "none";
      const hide = transform === "none";
      if (root.hidden !== hide) root.hidden = hide;
      if (hide) return;
      root.style.transform = transform;
      const clip = cover
        ? `polygon(0 0, ${width}px 0, ${width}px ${cover[2] * height}px, ${width / 2}px ${cover[1] * height}px, 0 ${cover[0] * height}px)`
        : "";
      if (root.style.clipPath !== clip) root.style.clipPath = clip;
    },
    setActive,
    setLive(enabled) {
      if (enabled === live) return;
      live = enabled;
      player?.setLive(enabled);
      vlc?.setLive(enabled);
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
      clearTimeout(invalidTimer);
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
      bin?.dispose();
      chromeApp?.dispose();
      claudeApp?.dispose();
      chatgptApp?.dispose();
      start?.dispose();
      power?.dispose();
      player?.dispose();
      vlc?.dispose();
      frames.clear();
      root.remove();
    },
  };
}
