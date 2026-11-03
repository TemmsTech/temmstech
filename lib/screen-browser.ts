import { projectiveTransform, type Quad } from "@/lib/screen-portal";
import type { ShowcaseProject } from "@/types/showcase";

// Matches the CSS transition on .screen-browser-page.
const PAGE_TRANSITION_MS = 300;
const TYPING_STEP_MS = 22;

export type BrowserKind = "laptop" | "tablet" | "phone";

type ScreenBrowserOptions = {
  kind: BrowserKind;
  /** Width / height of the model's display. */
  aspect: number;
};

export type ScreenBrowser = {
  /** Pin the browser to the projected screen corners, or hide it. */
  update: (corners: Quad, visible: boolean) => void;
  /** Open the tab for a project; animated opens slide the page in. */
  setActive: (index: number, animate: boolean) => void;
  /** Load the live site of the open tab, or unload every site. */
  setLive: (enabled: boolean) => void;
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
  { kind, aspect }: ScreenBrowserOptions,
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
  if (phone) root.appendChild(create("div", "screen-browser-status"));
  else {
    const tabStrip = create("div", "screen-browser-tabs");
    pill.style.width = `calc((100% - 28px) / ${projects.length})`;
    tabStrip.append(pill, ...tabs);
    root.appendChild(tabStrip);
  }

  const bar = create("div", "screen-browser-bar");
  const address = create("div", "screen-browser-address");
  const urlText = create("span", "screen-browser-url");
  address.append(create("span", "screen-browser-scheme", "https://"), urlText);
  const progress = create("div", "screen-browser-load");
  if (!phone) bar.appendChild(create("span", "screen-browser-nav", "‹  ›  ↻"));
  bar.append(address, progress);
  root.appendChild(bar);

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
  root.appendChild(stage);

  // Sound toggle: a centred button over the page area, shown on hover and
  // only while the open tab is playing a video.
  const soundZone = create("div", "screen-browser-sound");
  soundZone.style.top = `${chrome}px`;
  soundZone.hidden = true;
  const soundButton = create("button", "screen-browser-sound-button");
  soundButton.type = "button";
  soundButton.innerHTML =
    '<svg class="icon-on" viewBox="0 0 24 24" width="100%" height="100%" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M11 5 6 9H3v6h3l5 4z"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/><path d="M18.5 5.5a9 9 0 0 1 0 13"/></svg>' +
    '<svg class="icon-off" viewBox="0 0 24 24" width="100%" height="100%" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M11 5 6 9H3v6h3l5 4z"/><path d="m16 9 5 6"/><path d="m21 9-5 6"/></svg>';
  soundZone.appendChild(soundButton);
  root.appendChild(soundZone);
  // Everything except the sound button stays out of reach of pointer,
  // keyboard and assistive tech, as before.
  for (const part of root.children) {
    if (part === soundZone) continue;
    (part as HTMLElement).inert = true;
    part.setAttribute("aria-hidden", "true");
  }
  host.appendChild(root);

  const frames = new Map<number, HTMLElement>();
  let active = 0;
  let live = false;
  let parkTimer: ReturnType<typeof setTimeout> | undefined;
  let typingTimer: ReturnType<typeof setInterval> | undefined;

  function syncSound() {
    const media = frames.get(active);
    const video = media instanceof HTMLVideoElement ? media : undefined;
    soundZone.hidden = !video;
    const muted = !video || video.muted;
    soundButton.dataset.muted = String(muted);
    soundButton.setAttribute("aria-pressed", String(!muted));
    soundButton.setAttribute("aria-label", muted ? "Unmute video" : "Mute video");
  }
  soundButton.addEventListener("click", () => {
    const media = frames.get(active);
    if (!(media instanceof HTMLVideoElement)) return;
    media.muted = !media.muted;
    if (!media.muted && media.volume === 0) media.volume = 1;
    void media.play().catch(() => {});
    syncSound();
  });

  function mountFrame(index: number) {
    const project = projects[index];
    if (!live || !project || frames.has(index)) return;
    if (project.video) {
      mountVideo(index, project.video);
      return;
    }
    mountSite(index);
  }

  function mountVideo(index: number, src: string) {
    const video = document.createElement("video");
    video.muted = true;
    video.loop = false;
    video.autoplay = true;
    video.playsInline = true;
    video.preload = "auto";
    video.tabIndex = -1;
    video.setAttribute("aria-hidden", "true");
    video.style.width = `${width}px`;
    video.style.height = `${height - chrome}px`;
    const { page, loading } = pages[index];
    video.addEventListener("loadeddata", () => {
      video.dataset.loaded = "";
      loading.dataset.loaded = "";
      void video.play().catch(() => {});
    });
    // A missing or unplayable file falls back to the live site.
    video.addEventListener("error", () => {
      if (frames.get(index) !== video) return;
      video.remove();
      frames.delete(index);
      syncSound();
      mountSite(index);
    });
    video.addEventListener("volumechange", () => {
      if (index === active) syncSound();
    });
    video.src = src;
    page.appendChild(video);
    frames.set(index, video);
    syncSound();
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
      loading.dataset.loaded = "";
    });
    frame.src = project.url;
    page.appendChild(frame);
    frames.set(index, frame);
  }

  function unmountFrame(index: number) {
    frames.get(index)?.remove();
    frames.delete(index);
    delete pages[index].loading.dataset.loaded;
    syncSound();
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
    clearTimeout(parkTimer);
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
    // Only the open tab keeps a running site; its intro replays on return.
    const release = () => {
      frames.forEach((_, i) => {
        if (i !== active) unmountFrame(i);
      });
      mountFrame(active);
    };
    if (animate && previous !== index) {
      mountFrame(index);
      parkTimer = setTimeout(release, PAGE_TRANSITION_MS);
    } else release();
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
      if (enabled) mountFrame(active);
      else frames.forEach((_, index) => unmountFrame(index));
    },
    dispose() {
      clearTimeout(parkTimer);
      clearInterval(typingTimer);
      frames.clear();
      root.remove();
    },
  };
}
