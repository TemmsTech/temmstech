import type { BrowserKind } from "@/lib/screen-browser";

export type DesktopStyle = "windows" | "mac";
/** "auto" follows the visitor's operating system. */
export type DesktopOption = DesktopStyle | "auto";
/** What the browser window is doing, as far as the desktop is concerned. */
export type DesktopApp = "open" | "minimised" | "closed";
/** The video player's taskbar button: out of sight, open, minimised into it, or closed (pinned, no running dot). */
export type DesktopVideo = "hidden" | "open" | "minimised" | "closed";

const LOGO = "/images/brand/logo-mark.png";
const DOUBLE_CLICK_MS = 450;
const CLOCK_MS = 20_000;

const svg = (viewBox: string, body: string) =>
  `<svg viewBox="${viewBox}" width="100%" height="100%" aria-hidden="true">${body}</svg>`;

const ICONS = {
  start: svg(
    "0 0 32 32",
    '<g fill="#03b2fa"><rect x="5" y="5" width="10.5" height="10.5" rx="1.5"/><rect x="16.5" y="5" width="10.5" height="10.5" rx="1.5"/><rect x="5" y="16.5" width="10.5" height="10.5" rx="1.5"/><rect x="16.5" y="16.5" width="10.5" height="10.5" rx="1.5"/></g>',
  ),
  browser: svg(
    "0 0 32 32",
    '<g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="16" cy="16" r="11.5"/><ellipse cx="16" cy="16" rx="5" ry="11.5"/><path d="M4.5 16h23M6.5 9.5h19M6.5 22.5h19"/></g>',
  ),
  video: svg(
    "0 0 32 32",
    '<g fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><rect x="4.5" y="6.5" width="23" height="19" rx="4.5"/><path d="M13.5 12v8l7-4z" fill="currentColor"/></g>',
  ),
  bin: svg(
    "0 0 32 32",
    '<g fill="rgb(255 255 255 / 0.14)" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M8.5 10h15l-1.5 17a2 2 0 0 1-2 1.8h-8a2 2 0 0 1-2-1.8z"/><path d="M6.5 10h19M12.5 10V6.8h7V10M13 14.5v9M16 14.5v9M19 14.5v9" fill="none"/></g>',
  ),
  finder: svg(
    "0 0 60 60",
    '<rect width="60" height="60" rx="14" fill="#2b8cf0"/><path d="M30 0h16a14 14 0 0 1 14 14v32a14 14 0 0 1-14 14H30z" fill="#1559c4"/><path d="M17 36c5 8 21 8 26 0" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round"/><circle cx="21" cy="23" r="2.8" fill="#fff"/><circle cx="39" cy="23" r="2.8" fill="#fff"/>',
  ),
  apple: svg(
    "0 0 24 24",
    '<path fill="currentColor" d="M16.37 12.62c-.03-2.6 2.12-3.85 2.22-3.91-1.21-1.77-3.09-2.01-3.76-2.04-1.6-.16-3.12.94-3.93.94-.81 0-2.06-.92-3.39-.89-1.74.03-3.35 1.01-4.25 2.57-1.81 3.14-.46 7.8 1.3 10.35.86 1.25 1.89 2.65 3.24 2.6 1.3-.05 1.79-.84 3.36-.84 1.57 0 2.01.84 3.38.82 1.4-.03 2.28-1.27 3.13-2.53.99-1.45 1.4-2.85 1.42-2.92-.03-.01-2.72-1.04-2.75-4.15zM13.8 5c.71-.87 1.2-2.07 1.07-3.27-1.03.04-2.28.69-3.02 1.55-.66.77-1.24 2-1.09 3.18 1.15.09 2.32-.58 3.04-1.46z"/>',
  ),
} as const;

/** Captions of the desktop-icons sprite (public/images/desktop/desktop-icons.png), in sprite order. */
const DESKTOP_ICONS = [
  "Recycle Bin", "Microsoft Edge", "UltraISO", "PowerISO", "VLC media player",
  "Foxit PDF Reader", "Adobe Acrobat", "Brave", "Google Chrome", "Claude",
  "GitHub Desktop", "HandBrake", "Makinde - Chrome", "Google Drive", "Google Docs",
  "Google Sheets", "Google Slides", "3D Prototypes", "Loom", "Granola", "Adobe Express",
] as const;
/** Cells of the taskbar sprite (public/images/desktop/taskbar-icons.png). */
const BAR = {
  start: 0, taskview: 1, edge: 2, explorer: 3, outlook: 4, store: 5, teams: 6,
  code: 7, brave: 8, terminal: 9, granola: 10, chat: 11, whatsapp: 12, weather: 13,
} as const;
const sprite = (sheet: "desk" | "bar", index: number) =>
  `<span class="screen-sprite" data-sheet="${sheet}" style="--i:${index}"></span>`;

const tray = (body: string) =>
  `<svg viewBox="0 0 24 24" width="100%" height="100%" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${body}</svg>`;
const TRAY = [
  tray('<path d="m6 15 6-6 6 6"/>'),
  tray('<path d="M7 18h10a4 4 0 0 0 .6-7.9A5.5 5.5 0 0 0 7 9.5 4.3 4.3 0 0 0 7 18z"/>'),
  tray('<path d="M3 9.5a14 14 0 0 1 18 0M6 13a9 9 0 0 1 12 0M9.3 16.3a4.4 4.4 0 0 1 5.4 0"/><circle cx="12" cy="19" r=".8" fill="currentColor"/>'),
  tray('<path d="M4 9.5v5h3.5L12 18.5v-13L7.5 9.5z" fill="currentColor"/><path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a8 8 0 0 1 0 11"/>'),
  tray('<rect x="3" y="8" width="16" height="9" rx="2"/><path d="M21 11v3"/><rect x="5" y="10" width="9" height="5" rx="1" fill="currentColor"/>'),
] as const;

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

function holder(className: string, markup: string) {
  const node = create("span", className);
  node.innerHTML = markup;
  return node;
}

function iconButton(label: string, glyph: HTMLElement, caption: string) {
  const button = create("button", "screen-desktop-icon");
  button.type = "button";
  button.tabIndex = -1;
  button.setAttribute("aria-label", label);
  button.append(glyph, create("span", "screen-desktop-label", caption));
  return button;
}

/** True on a Mac; iPads that pose as one (they have a touch screen) do not count. */
function visitorIsMac() {
  if (typeof navigator === "undefined") return false;
  const nav = navigator as Navigator & { userAgentData?: { platform?: string } };
  const platform = nav.userAgentData?.platform || navigator.platform || "";
  return /mac/i.test(platform) && navigator.maxTouchPoints < 2;
}

/** The tablet is a Surface, so "auto" only gives a Mac desktop to the laptop. */
export function resolveDesktop(
  option: DesktopOption,
  kind: BrowserKind,
): DesktopStyle {
  if (option !== "auto") return option;
  return kind === "laptop" && visitorIsMac() ? "mac" : "windows";
}

export type ScreenDesktop = {
  element: HTMLElement;
  /** The taskbar or dock button of the browser; the window shrinks into it. */
  appButton: HTMLElement;
  /** The video player's taskbar or dock button; the player shrinks into it. */
  videoButton: HTMLElement;
  /** The Visual Studio Code taskbar button (Windows desktop only). */
  codeButton: HTMLElement;
  /** The File Explorer taskbar button (Windows desktop only). */
  explorerButton: HTMLElement;
  /** The Terminal taskbar button (Windows desktop only). */
  terminalButton: HTMLElement;
  /** The WhatsApp taskbar button (Windows desktop only). */
  whatsappButton: HTMLElement;
  /** The Brave taskbar button (Windows desktop only). */
  braveButton: HTMLElement;
  /** The Granola taskbar button (Windows desktop only). */
  granolaButton: HTMLElement;
  setCode: (code: DesktopApp) => void;
  setExplorer: (explorer: DesktopApp) => void;
  setTerminal: (terminal: DesktopApp) => void;
  setWhatsApp: (whatsapp: DesktopApp) => void;
  setBrave: (brave: DesktopApp) => void;
  setGranola: (granola: DesktopApp) => void;
  setApp: (app: DesktopApp) => void;
  setVideo: (video: DesktopVideo) => void;
  dispose: () => void;
};

type DesktopHandlers = {
  /** The taskbar or dock button was pressed. */
  onApp: () => void;
  /** The Temms Tech desktop icon was double-clicked. */
  onOpen: () => void;
  /** The video button was pressed. */
  onVideo: () => void;
  /** The Visual Studio Code taskbar button was pressed. */
  onCode: () => void;
  /** The Visual Studio Code desktop icon was double-clicked. */
  onOpenCode: () => void;
  /** The File Explorer taskbar button was pressed. */
  onExplorer: () => void;
  /** The Terminal taskbar button was pressed. */
  onTerminal: () => void;
  /** The WhatsApp taskbar button was pressed. */
  onWhatsApp: () => void;
  /** The Brave taskbar button was pressed. */
  onBrave: () => void;
  /** The Brave desktop icon was double-clicked. */
  onOpenBrave: () => void;
  /** The Granola taskbar button was pressed. */
  onGranola: () => void;
  /** The Granola desktop icon was double-clicked. */
  onOpenGranola: () => void;
};

/**
 * The desktop behind the browser window: wallpaper, desktop icons, and either
 * a Windows 11 taskbar or a macOS menu bar and dock. Laid out in the same
 * 1280px units as the window. Only its buttons take the mouse; the wallpaper
 * lets presses through, so the device can still be turned by hand.
 */
export function createScreenDesktop(
  host: HTMLElement,
  style: DesktopStyle,
  {
    onApp,
    onOpen,
    onVideo,
    onCode,
    onOpenCode,
    onExplorer,
    onTerminal,
    onWhatsApp,
    onBrave,
    onOpenBrave,
    onGranola,
    onOpenGranola,
  }: DesktopHandlers,
): ScreenDesktop {
  const mac = style === "mac";
  const element = create("div", "screen-desktop");
  element.dataset.style = style;
  element.dataset.app = "open";
  // Pressing anything on the desktop must not start turning the device.
  element.addEventListener("pointerdown", (event) => event.stopPropagation());

  const logo = create("img", "screen-desktop-logo");
  logo.src = LOGO;
  logo.alt = "";
  logo.draggable = false;
  const appIcon = iconButton(
    "Temms Tech",
    holder("screen-desktop-glyph", ""),
    "Temms Tech",
  );
  appIcon.querySelector(".screen-desktop-glyph")?.appendChild(logo);
  const icons = [appIcon];
  let codeIcon: HTMLButtonElement | undefined;
  let braveIcon: HTMLButtonElement | undefined;
  let granolaIcon: HTMLButtonElement | undefined;
  if (!mac) {
    // Laid out like the real desktop: columns of eight, filled top to bottom,
    // with Temms Tech and Visual Studio Code after the last of them.
    codeIcon = iconButton(
      "Visual Studio Code",
      holder("screen-desktop-glyph", sprite("bar", BAR.code)),
      "Visual Studio Code",
    );
    const desktopIcons = DESKTOP_ICONS.map((name, index) =>
      iconButton(name, holder("screen-desktop-glyph", sprite("desk", index)), name),
    );
    braveIcon = desktopIcons[DESKTOP_ICONS.indexOf("Brave")];
    granolaIcon = desktopIcons[DESKTOP_ICONS.indexOf("Granola")];
    icons.splice(0, 1, ...desktopIcons, appIcon, codeIcon);
  }
  const iconColumn = create("div", "screen-desktop-icons");
  iconColumn.append(...icons);

  const taskbarButton = (className: string, icon: string, run: () => void) => {
    const node = create("button", `screen-desktop-app ${className}`);
    node.type = "button";
    node.tabIndex = -1;
    node.dataset.state = "open";
    node.append(
      holder("screen-desktop-app-icon", icon),
      create("span", "screen-desktop-dot"),
    );
    node.addEventListener("click", run);
    return node;
  };
  const appButton = taskbarButton(
    "screen-desktop-browser",
    mac ? ICONS.browser : sprite("bar", BAR.edge),
    onApp,
  );
  const codeButton = taskbarButton(
    "screen-desktop-code",
    sprite("bar", BAR.code),
    onCode,
  );
  codeButton.dataset.state = "closed";
  codeButton.setAttribute("aria-label", "Open Visual Studio Code");
  const explorerButton = taskbarButton(
    "screen-desktop-explorer",
    sprite("bar", BAR.explorer),
    onExplorer,
  );
  explorerButton.dataset.state = "closed";
  explorerButton.setAttribute("aria-label", "Open File Explorer");
  const terminalButton = taskbarButton(
    "screen-desktop-terminal",
    sprite("bar", BAR.terminal),
    onTerminal,
  );
  terminalButton.dataset.state = "closed";
  terminalButton.setAttribute("aria-label", "Open Terminal");
  const whatsappButton = taskbarButton(
    "screen-desktop-whatsapp",
    sprite("bar", BAR.whatsapp),
    onWhatsApp,
  );
  whatsappButton.dataset.state = "closed";
  whatsappButton.setAttribute("aria-label", "Open WhatsApp");
  const braveButton = taskbarButton("screen-desktop-brave", sprite("bar", BAR.brave), onBrave);
  braveButton.dataset.state = "closed";
  braveButton.setAttribute("aria-label", "Open Brave");
  const granolaButton = taskbarButton("screen-desktop-granola", sprite("bar", BAR.granola), onGranola);
  granolaButton.dataset.state = "closed";
  granolaButton.setAttribute("aria-label", "Open Granola");
  const videoButton = taskbarButton("screen-desktop-video", ICONS.video, onVideo);
  videoButton.hidden = true;
  videoButton.setAttribute("aria-label", "Open video");

  const time = create("span", "screen-clock-time");
  const date = create("span", "screen-clock-date");
  const tick = () => {
    const now = new Date();
    time.textContent = now.toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
    });
    date.textContent = mac
      ? now.toLocaleDateString([], {
          weekday: "short",
          day: "numeric",
          month: "short",
        })
      : now.toLocaleDateString();
  };
  tick();
  const clockTimer = setInterval(tick, CLOCK_MS);

  element.appendChild(iconColumn);
  if (mac) {
    const menu = create("div", "screen-menubar");
    menu.append(
      holder("screen-menubar-apple", ICONS.apple),
      create("strong", "screen-menubar-app", "Temms Tech"),
      ...["File", "Edit", "View", "Window", "Help"].map((label) =>
        create("span", "screen-menubar-item", label),
      ),
    );
    const clock = create("div", "screen-clock");
    clock.append(date, time);
    menu.appendChild(clock);
    const dock = create("div", "screen-dock");
    dock.append(
      holder("screen-dock-item", ICONS.finder),
      appButton,
      videoButton,
      holder("screen-dock-item screen-dock-bin", ICONS.bin),
    );
    element.append(menu, dock);
  } else {
    const bar = create("div", "screen-taskbar");
    const item = (index: number) => holder("screen-taskbar-item", sprite("bar", index));
    const weather = create("div", "screen-weather");
    weather.append(
      holder("screen-weather-icon", sprite("bar", BAR.weather)),
      create("span", "screen-weather-text", "83°F"),
      create("span", "screen-weather-sky", "Clear"),
    );
    const search = create("div", "screen-taskbar-search");
    search.append(
      holder(
        "screen-taskbar-search-icon",
        tray('<circle cx="10.5" cy="10.5" r="6"/><path d="m15 15 5 5"/>'),
      ),
      create("span", "", "Search"),
    );
    const centre = create("div", "screen-taskbar-centre");
    centre.append(
      item(BAR.start),
      search,
      item(BAR.taskview),
      appButton,
      explorerButton,
      item(BAR.outlook),
      item(BAR.store),
      item(BAR.teams),
      codeButton,
      braveButton,
      terminalButton,
      granolaButton,
      item(BAR.chat),
      whatsappButton,
      videoButton,
    );
    const trayBox = create("div", "screen-tray");
    trayBox.append(...TRAY.map((icon) => holder("screen-tray-icon", icon)));
    const clock = create("div", "screen-clock");
    clock.append(time, date);
    bar.append(weather, centre, trayBox, clock);
    element.appendChild(bar);
  }

  // Click an icon to select it; a second click soon after opens it. This also
  // works on touch, where the browser's own double-click is unreliable.
  let lastIcon: HTMLElement | undefined;
  let lastAt = 0;
  const select = (icon?: HTMLElement) => {
    for (const node of icons) node.dataset.selected = String(node === icon);
  };
  select();
  for (const icon of icons) {
    icon.addEventListener("click", () => {
      const now = performance.now();
      const again = lastIcon === icon && now - lastAt < DOUBLE_CLICK_MS;
      lastIcon = icon;
      lastAt = again ? 0 : now;
      select(icon);
      if (again && icon === appIcon) onOpen();
      if (again && icon === codeIcon) onOpenCode();
      if (again && icon === braveIcon) onOpenBrave();
      if (again && icon === granolaIcon) onOpenGranola();
    });
  }
  // A press anywhere else on the device clears the selection (presses on the
  // desktop's own buttons stop above and never get here).
  const clear = () => select();
  host.addEventListener("pointerdown", clear);

  return {
    element,
    appButton,
    videoButton,
    codeButton,
    explorerButton,
    terminalButton,
    whatsappButton,
    braveButton,
    granolaButton,
    setGranola(granola) {
      granolaButton.dataset.state = granola;
      granolaButton.setAttribute(
        "aria-label",
        granola === "open" ? "Minimise Granola" : "Open Granola",
      );
      if (granola !== "open") select();
    },
    setBrave(brave) {
      braveButton.dataset.state = brave;
      braveButton.setAttribute("aria-label", brave === "open" ? "Minimise Brave" : "Open Brave");
      if (brave !== "open") select();
    },
    setWhatsApp(whatsapp) {
      whatsappButton.dataset.state = whatsapp;
      whatsappButton.setAttribute(
        "aria-label",
        whatsapp === "open" ? "Minimise WhatsApp" : "Open WhatsApp",
      );
      if (whatsapp !== "open") select();
    },
    setTerminal(terminal) {
      terminalButton.dataset.state = terminal;
      terminalButton.setAttribute(
        "aria-label",
        terminal === "open" ? "Minimise Terminal" : "Open Terminal",
      );
      if (terminal !== "open") select();
    },
    setExplorer(explorer) {
      explorerButton.dataset.state = explorer;
      explorerButton.setAttribute(
        "aria-label",
        explorer === "open" ? "Minimise File Explorer" : "Open File Explorer",
      );
      if (explorer !== "open") select();
    },
    setCode(code) {
      codeButton.dataset.state = code;
      codeButton.setAttribute(
        "aria-label",
        code === "open" ? "Minimise Visual Studio Code" : "Open Visual Studio Code",
      );
      if (code !== "open") select();
    },
    setVideo(video) {
      videoButton.hidden = video === "hidden";
      videoButton.dataset.state = video;
      videoButton.setAttribute(
        "aria-label",
        video === "open" ? "Video player" : "Open video",
      );
    },
    setApp(app) {
      element.dataset.app = app;
      appButton.dataset.state = app;
      appButton.setAttribute(
        "aria-label",
        app === "open" ? "Minimise Temms Tech" : "Open Temms Tech",
      );
      if (app !== "open") select();
    },
    dispose() {
      clearInterval(clockTimer);
      host.removeEventListener("pointerdown", clear);
      element.remove();
    },
  };
}
