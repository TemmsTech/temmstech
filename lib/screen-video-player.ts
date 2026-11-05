import { WINDOW_ICONS } from "@/lib/window-controls";
import type { ShowcaseVideo } from "@/types/showcase";

/** Fired on the device host when a screen's video player opens or minimises. */
export const SHOWCASE_PLAYER_EVENT = "showcase-player";

const SKIP_SECONDS = 5;
/** How long the small player lingers after the video ends before it closes. */
const MINI_HOLD_MS = 2200;

type PlayerEvent = CustomEvent<{ active: boolean }>;

// A laptop and a phone player share one host; only one is ever live, but both
// report here so the last one to close cannot hide the other's state.
const openPlayers = new WeakMap<HTMLElement, number>();

function announce(host: HTMLElement, delta: 1 | -1) {
  const count = Math.max(0, (openPlayers.get(host) ?? 0) + delta);
  openPlayers.set(host, count);
  host.dispatchEvent(
    new CustomEvent(SHOWCASE_PLAYER_EVENT, { detail: { active: count > 0 } }),
  );
}

/** Calls back with true while a screen's video player is open, false otherwise. */
export function onShowcasePlayer(
  host: HTMLElement,
  listener: (active: boolean) => void,
) {
  const handler = (event: Event) => listener((event as PlayerEvent).detail.active);
  host.addEventListener(SHOWCASE_PLAYER_EVENT, handler);
  return () => host.removeEventListener(SHOWCASE_PLAYER_EVENT, handler);
}

export type ScreenVideoPlayer = {
  /** Start (first time) or resume the player while its screen is on show; pause it otherwise. */
  setLive: (enabled: boolean) => void;
  /** Bring the player back from the taskbar (or the corner chip). */
  restore: () => void;
  dispose: () => void;
};

/**
 * Where a minimised player goes. Without one (phones) it shrinks to a small
 * window and then a chip in the corner; with one it shrinks straight into a
 * taskbar button on the simulated desktop.
 */
export type PlayerDock = {
  /** Centre of the taskbar button, in the screen's own pixels. */
  target: () => { x: number; y: number } | undefined;
  /** Called whenever the player goes between idle, open, minimised to and closed on the taskbar. */
  onChange: (state: "idle" | "open" | "mini" | "docked" | "closed") => void;
};

const formatTime = (seconds: number) => {
  const total = Math.max(0, Math.floor(Number.isFinite(seconds) ? seconds : 0));
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, "0")}`;
};

function create<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  className: string,
) {
  const node = document.createElement(tag);
  node.className = className;
  return node;
}

const svg = (body: string) =>
  `<svg viewBox="0 0 24 24" width="100%" height="100%" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${body}</svg>`;

const ICONS = {
  back: svg(
    `<path d="M3 12a9 9 0 1 0 3-6.7"/><path d="M3 4v5h5"/><text x="12" y="15.2" text-anchor="middle" font-size="8" font-weight="700" fill="currentColor" stroke="none">${SKIP_SECONDS}</text>`,
  ),
  forward: svg(
    `<path d="M21 12a9 9 0 1 1-3-6.7"/><path d="M21 4v5h-5"/><text x="12" y="15.2" text-anchor="middle" font-size="8" font-weight="700" fill="currentColor" stroke="none">${SKIP_SECONDS}</text>`,
  ),
  play: svg(
    `<path d="M8 5.6v12.8a1 1 0 0 0 1.5.9l10.4-6.4a1 1 0 0 0 0-1.8L9.5 4.7A1 1 0 0 0 8 5.6z" fill="currentColor" stroke="none"/>`,
  ),
  pause: svg(
    `<rect x="6" y="4.5" width="4.2" height="15" rx="1.4" fill="currentColor" stroke="none"/><rect x="13.8" y="4.5" width="4.2" height="15" rx="1.4" fill="currentColor" stroke="none"/>`,
  ),
  soundOn: svg(
    `<path d="M11 5 6 9H3v6h3l5 4z" fill="currentColor"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/><path d="M18.5 5.5a9 9 0 0 1 0 13"/>`,
  ),
  soundOff: svg(
    `<path d="M11 5 6 9H3v6h3l5 4z" fill="currentColor"/><path d="m16 9 5 6"/><path d="m21 9-5 6"/>`,
  ),
};

function button(className: string, label: string, icons: string) {
  const node = create("button", className);
  node.type = "button";
  node.setAttribute("aria-label", label);
  node.innerHTML = icons;
  return node;
}

/**
 * The video player on a device screen. The screen opens on it: a full-screen
 * window, with the same minimise / maximise / close buttons as the browser, playing the video. The middle button
 * (restore down), or the video ending, shrinks it to a small window in the
 * bottom-right corner (above the taskbar on a laptop); the same button then
 * maximises it again. Minimise and close send it to the taskbar button or
 * chip, which also brings the big player back. While
 * the big player is open it reports itself on the device host so the device's
 * sway and the tab rotation hold still; they resume as it shrinks. A missing
 * or unplayable file removes the player and reports nothing.
 */
export function createScreenVideoPlayer(
  parent: HTMLElement,
  host: HTMLElement,
  media: ShowcaseVideo,
  taskbar?: PlayerDock,
): ScreenVideoPlayer {
  const layer = create("div", "screen-player-layer");
  layer.dataset.state = "idle";
  if (taskbar) layer.dataset.dock = "taskbar";
  const scrim = create("div", "screen-player-scrim");

  const windowEl = create("div", "screen-player");
  const bar = create("div", "screen-player-bar");
  const title = create("span", "screen-player-title");
  title.textContent = media.title;
  const windowButtons = create("div", "screen-player-wincontrols");
  const minButton = button("screen-player-win", "Minimise video", WINDOW_ICONS.minimise);
  const maxButton = button("screen-player-win", "Restore video down", WINDOW_ICONS.restore);
  const closeButton = button("screen-player-win", "Close video", WINDOW_ICONS.close);
  minButton.dataset.action = "minimise";
  maxButton.dataset.action = "maximise";
  closeButton.dataset.action = "close";
  windowButtons.append(minButton, maxButton, closeButton);
  bar.append(title, windowButtons);

  const video = create("video", "screen-player-video");
  video.muted = true;
  video.loop = false;
  video.playsInline = true;
  video.preload = "none";
  video.tabIndex = -1;
  video.setAttribute("aria-hidden", "true");
  if (media.poster) video.poster = media.poster;

  // Apple-style controls: a frosted capsule floating over the video, with the
  // scrubber and both times on top and the transport buttons below.
  const hud = create("div", "screen-hud");
  const backButton = button(
    "screen-hud-btn screen-hud-skip",
    `Back ${SKIP_SECONDS} seconds`,
    ICONS.back,
  );
  const playButton = button(
    "screen-hud-btn screen-hud-play",
    "Play video",
    `<span class="icon-play">${ICONS.play}</span><span class="icon-pause">${ICONS.pause}</span>`,
  );
  const forwardButton = button(
    "screen-hud-btn screen-hud-skip",
    `Forward ${SKIP_SECONDS} seconds`,
    ICONS.forward,
  );
  const elapsed = create("span", "screen-hud-time");
  const remaining = create("span", "screen-hud-time");
  const track = create("div", "screen-hud-track");
  const rail = create("div", "screen-hud-rail");
  const fill = create("div", "screen-hud-fill");
  rail.appendChild(fill);
  const thumb = create("div", "screen-hud-thumb");
  track.append(rail, thumb);
  const times = create("div", "screen-hud-times");
  times.append(elapsed, track, remaining);
  const muteButton = button(
    "screen-hud-btn screen-hud-mute",
    "Unmute video",
    `<span class="icon-on">${ICONS.soundOn}</span><span class="icon-off">${ICONS.soundOff}</span>`,
  );
  const transport = create("div", "screen-hud-transport");
  transport.append(backButton, playButton, forwardButton);
  const buttons = create("div", "screen-hud-buttons");
  buttons.append(muteButton, transport, create("span", "screen-hud-spacer"));
  hud.append(times, buttons);
  windowEl.append(bar, video, hud);

  const dock = button(
    "screen-player-dock",
    `Play ${media.title}`,
    `<span class="screen-player-dock-icon">${ICONS.play}</span>`,
  );
  const dockLabel = create("span", "screen-player-dock-label");
  dockLabel.textContent = media.title;
  dock.appendChild(dockLabel);

  layer.append(scrim, windowEl, dock);
  // Pressing a control must not start turning the device by hand.
  layer.addEventListener("pointerdown", (event) => {
    event.stopPropagation();
    clearTimeout(closeTimer);
  });
  parent.appendChild(layer);

  // open: big and playing · mini: small corner window · docked: closed to the chip
  let state: "idle" | "open" | "mini" | "docked" | "closed" | "failed" = "idle";
  let closeTimer: ReturnType<typeof setTimeout> | undefined;
  let live = false;
  let ready = false;
  let loading = false;
  let announced = false;
  let reported: "idle" | "open" | "mini" | "docked" | "closed" = "idle";

  // Shrink target: the taskbar button, measured when the window sets off.
  function aim() {
    const target = taskbar?.target();
    if (!target) return;
    layer.style.setProperty("--dock-x", `${target.x}px`);
    layer.style.setProperty("--dock-y", `${target.y}px`);
  }

  function sync() {
    layer.dataset.state = state;
    windowEl.inert = state !== "open" && state !== "mini";
    dock.inert = state !== "docked";
    // The middle button restores the big window down to the corner mini
    // player, and maximises it back up again; all three only apply while the
    // window is on show.
    const big = state === "open";
    maxButton.innerHTML = big ? WINDOW_ICONS.restore : WINDOW_ICONS.maximise;
    maxButton.setAttribute(
      "aria-label",
      big ? "Restore video down" : "Maximise video",
    );
    maxButton.disabled = state !== "open" && state !== "mini";
    minButton.disabled = state !== "open" && state !== "mini";
    closeButton.disabled = state !== "open" && state !== "mini";
    // Only the big player holds the device still.
    const active = state === "open" && live;
    if (active !== announced) {
      announced = active;
      announce(host, active ? 1 : -1);
    }
    const next =
      state === "open"
        ? "open"
        : state === "mini"
          ? "mini"
          : state === "docked"
          ? "docked"
          : state === "closed"
            ? "closed"
            : "idle";
    if (next !== reported) {
      reported = next;
      taskbar?.onChange(next);
    }
  }

  function syncPlayback() {
    playButton.dataset.playing = String(!video.paused && !video.ended);
    playButton.setAttribute(
      "aria-label",
      video.paused ? "Play video" : "Pause video",
    );
  }

  function syncSound() {
    muteButton.dataset.muted = String(video.muted);
    muteButton.setAttribute(
      "aria-pressed",
      String(!video.muted),
    );
    muteButton.setAttribute(
      "aria-label",
      video.muted ? "Unmute video" : "Mute video",
    );
  }

  function syncProgress() {
    const ratio =
      video.duration > 0 ? Math.min(1, video.currentTime / video.duration) : 0;
    fill.style.transform = `scaleX(${ratio})`;
    thumb.style.left = `${ratio * 100}%`;
    elapsed.textContent = formatTime(video.currentTime);
    remaining.textContent = `-${formatTime(
      video.duration > 0 ? video.duration - video.currentTime : 0,
    )}`;
  }

  function play() {
    // Muted autoplay is normally allowed; if it is refused, shrink the player
    // rather than leave the device waiting on a paused video.
    video.play().catch(() => shrink());
  }

  // Restore down (the middle window button): the big player shrinks to the
  // mini player in the bottom-right corner and keeps playing.
  function shrink() {
    if (state !== "open") return;
    state = "mini";
    sync();
    // Already finished: let the small window show briefly, then close it.
    if (video.ended) scheduleClose();
  }

  // Minimise (the left window button): into the taskbar button on a laptop;
  // phones have no taskbar, so they shrink to the corner window instead.
  function minimise() {
    if (state !== "open") return;
    if (!taskbar) {
      shrink();
      return;
    }
    // Nothing plays while it is out of sight.
    video.pause();
    aim();
    state = "docked";
    sync();
  }

  function maximise() {
    if (state !== "mini" && state !== "docked" && state !== "closed") return;
    clearTimeout(closeTimer);
    if (video.ended || video.currentTime >= video.duration - 0.25)
      video.currentTime = 0;
    state = "open";
    sync();
    if (live) play();
  }

  function close() {
    if (state !== "open" && state !== "mini") return;
    clearTimeout(closeTimer);
    video.pause();
    aim();
    if (taskbar) {
      // Like closing VS Code: the window shrinks into its taskbar button,
      // which stays pinned but stops showing as running, and the video starts
      // over the next time it is opened.
      video.currentTime = 0;
      state = "closed";
    } else state = "docked";
    sync();
  }

  function scheduleClose() {
    clearTimeout(closeTimer);
    closeTimer = setTimeout(() => {
      if (state !== "mini") return;
      video.pause();
      aim();
      state = "docked";
      sync();
    }, MINI_HOLD_MS);
  }

  function tryOpen() {
    if (state !== "idle" || !ready || !live) return;
    state = "open";
    sync();
    play();
  }

  function fail() {
    state = "failed";
    sync();
    layer.remove();
  }

  video.addEventListener("loadeddata", () => {
    ready = true;
    tryOpen();
  });
  video.addEventListener("error", fail);
  video.addEventListener("play", syncPlayback);
  video.addEventListener("pause", syncPlayback);
  video.addEventListener("ended", () => {
    syncPlayback();
    if (state === "open") shrink();
    else if (state === "mini") scheduleClose();
  });
  video.addEventListener("timeupdate", syncProgress);
  video.addEventListener("volumechange", syncSound);

  const skip = (seconds: number) => {
    if (!(video.duration > 0)) return;
    video.currentTime = Math.max(
      0,
      Math.min(video.duration - 0.05, video.currentTime + seconds),
    );
  };
  minButton.addEventListener("click", () => {
    if (state === "open") minimise();
    else if (state === "mini") close();
  });
  maxButton.addEventListener("click", () => {
    if (state === "open") shrink();
    else maximise();
  });
  closeButton.addEventListener("click", close);
  dock.addEventListener("click", maximise);
  backButton.addEventListener("click", () => skip(-SKIP_SECONDS));
  forwardButton.addEventListener("click", () => skip(SKIP_SECONDS));
  playButton.addEventListener("click", () => {
    if (video.paused || video.ended) {
      if (video.ended) video.currentTime = 0;
      play();
    } else video.pause();
  });
  muteButton.addEventListener("click", () => {
    video.muted = !video.muted;
    if (!video.muted && video.volume === 0) video.volume = 1;
  });

  // offsetX is in the track's own (untransformed) space, so seeking stays
  // accurate while the screen is mapped onto the 3D model.
  const seek = (event: PointerEvent) => {
    if (!(video.duration > 0) || !track.offsetWidth) return;
    const ratio = Math.max(0, Math.min(1, event.offsetX / track.offsetWidth));
    video.currentTime = ratio * video.duration;
    syncProgress();
  };
  track.addEventListener("pointerdown", (event) => {
    track.setPointerCapture(event.pointerId);
    seek(event);
  });
  track.addEventListener("pointermove", (event) => {
    if (track.hasPointerCapture(event.pointerId)) seek(event);
  });

  syncPlayback();
  syncSound();
  syncProgress();
  sync();

  return {
    restore: maximise,
    setLive(enabled) {
      if (enabled === live || state === "failed") return;
      live = enabled;
      if (enabled) {
        if (!loading) {
          loading = true;
          video.preload = "auto";
          video.src = media.src;
        }
        if (state === "open" || (state === "mini" && !video.ended)) play();
        else tryOpen();
      } else if (state === "open" || state === "mini") video.pause();
      sync();
    },
    dispose() {
      clearTimeout(closeTimer);
      live = false;
      sync();
      video.pause();
      video.removeAttribute("src");
      video.load();
      layer.remove();
    },
  };
}
