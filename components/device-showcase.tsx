"use client";
import { LiveFrame } from "@/components/live-frame";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  useDeviceKind,
  useDeviceMotion,
  useMediaQuery,
  useShowcasePlayback,
} from "@/hooks";
import { cn } from "@/lib/utils";
import type { DeviceScene } from "@/lib/device-scene";
import { createZoom } from "@/lib/device-zoom";
import { SHOWCASE_INTERVAL_MS } from "@/lib/showcase-timing";
import { onShowcasePlayer } from "@/lib/screen-video-player";
import {
  onShowcaseTab,
  onShowcaseWindow,
  watchPointerHover,
} from "@/lib/showcase-events";
import type { ShowcaseProject, ShowcaseVideo } from "@/types/showcase";
import "./screen-brave.css";
import "./screen-chrome.css";
import "./screen-chatgpt.css";
import "./screen-claude.css";
import "./screen-desktop.css";
import "./screen-explorer.css";
import "./screen-granola.css";
import "./screen-recycle-bin.css";
import "./screen-power.css";
import "./screen-start.css";
import "./screen-terminal.css";
import "./screen-whatsapp.css";
import "./screen-vscode.css";

type DeviceShowcaseProps = {
  projects: readonly ShowcaseProject[];
  /** Plays once in a miniature player on the screens, then minimises. */
  video?: ShowcaseVideo;
  className?: string;
  nextSectionId: string;
  /** Dev scratch page only: open interact mode as soon as the laptop is ready. */
  startOpen?: boolean;
};
export function DeviceShowcase({
  projects,
  video,
  className,
  nextSectionId,
  startOpen = false,
}: DeviceShowcaseProps) {
  const host = useRef<HTMLDivElement>(null);
  const section = useRef<HTMLDivElement>(null);
  const scene = useRef<DeviceScene | null>(null);
  const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)", true);
  const kind = useDeviceKind();
  const [status, setStatus] = useState<"loading" | "ready" | "fallback">(
    "loading",
  );
  // Interact mode (laptop only): the laptop grows over a dimmed backdrop.
  // "closing" lasts while it shrinks back into the hero.
  const [mode, setMode] = useState<"closed" | "open" | "closing">("closed");
  const modeRef = useRef(mode);
  const zoom = useRef<ReturnType<typeof createZoom> | null>(null);
  const hint = useRef<HTMLButtonElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  const changeMode = useCallback((next: typeof mode) => {
    modeRef.current = next;
    setMode(next);
  }, []);
  // The tab timer waits while the device is being turned by hand.
  const [holding, setHolding] = useState(false);
  useEffect(() => {
    const element = host.current;
    if (!element) return;
    const release = () => {
      setHolding(false);
      window.removeEventListener("pointerup", release);
      window.removeEventListener("pointercancel", release);
    };
    const press = () => {
      setHolding(true);
      window.addEventListener("pointerup", release);
      window.addEventListener("pointercancel", release);
    };
    element.addEventListener("pointerdown", press);
    return () => {
      element.removeEventListener("pointerdown", press);
      release();
    };
  }, []);
  // The tabs hold still while the screen's video player is open.
  const [playerOpen, setPlayerOpen] = useState(false);
  useEffect(() => {
    const element = host.current;
    if (!element) return;
    return onShowcasePlayer(element, setPlayerOpen);
  }, []);
  // ...and while the browser window is minimised or closed to the desktop.
  const [windowHidden, setWindowHidden] = useState(false);
  useEffect(() => {
    const element = host.current;
    if (!element) return;
    return onShowcaseWindow(element, setWindowHidden);
  }, []);
  // ...and while a mouse is over the device, so a tab never changes under it.
  const [hovering, setHovering] = useState(false);
  useEffect(() => {
    const element = host.current;
    if (!element) return;
    return watchPointerHover(element, setHovering);
  }, []);
  // The laptop's browser stays on the tab the visitor picks; it no longer cycles.
  const autoplay =
    kind !== "laptop" &&
    !reducedMotion &&
    status !== "loading" &&
    !holding &&
    !playerOpen &&
    !windowHidden &&
    !hovering;
  const [index, setIndex] = useShowcasePlayback(
    section,
    autoplay,
    projects.length,
    SHOWCASE_INTERVAL_MS,
  );
  // Clicking a tab on the simulated screen opens that site.
  useEffect(() => {
    const element = host.current;
    if (!element) return;
    return onShowcaseTab(element, (at) => {
      if (at >= 0 && at < projects.length) setIndex(at);
    });
  }, [projects.length, setIndex]);
  // The simulated pointer only plays while the tabs rotate on their own.
  const autoplayRef = useRef(autoplay);
  useEffect(() => {
    autoplayRef.current = autoplay;
    scene.current?.setAutoplay(autoplay);
  }, [autoplay, status]);
  const project = projects[index] ?? projects[0];
  useEffect(() => {
    const element = host.current;
    if (!element || !projects.length) return;
    const controller = new AbortController();
    let created: DeviceScene | undefined;
    // Tablets get their own tablet; phones and laptops share one scene.
    const load =
      kind === "tablet"
        ? import("@/lib/tablet-hero-scene").then(
            (module) => module.createTabletHeroScene,
          )
        : import("@/lib/device-scene").then(
            (module) => module.createDeviceScene,
          );
    load
      .then((createScene) => {
        if (!controller.signal.aborted)
          return createScene(
            element,
            projects,
            controller.signal,
            () => setStatus("fallback"),
            nextSectionId,
            video,
          );
      })
      .then((result) => {
        if (!result) return;
        created = result;
        if (controller.signal.aborted) {
          result.dispose();
          return;
        }
        scene.current = result;
        result.setAutoplay(autoplayRef.current);
        setStatus("ready");
      })
      .catch(() => {
        if (!controller.signal.aborted) setStatus("fallback");
      });
    return () => {
      controller.abort();
      created?.dispose();
      scene.current = null;
    };
  }, [projects, nextSectionId, kind, video]);
  useEffect(() => {
    scene.current?.setProject(index, !reducedMotion);
  }, [index, reducedMotion, status]);
  useDeviceMotion(
    section,
    host,
    scene,
    status === "ready" && !reducedMotion,
    mode !== "closed",
  );
  useEffect(() => {
    const element = host.current;
    if (!element) return;
    const handle = createZoom(element, section.current?.closest("section") ?? null);
    zoom.current = handle;
    return () => {
      handle.dispose();
      zoom.current = null;
    };
  }, []);
  const openZoom = () => {
    if (kind !== "laptop" || status !== "ready" || modeRef.current === "open")
      return;
    // Once the visitor has started scrolling, the scroll zoom owns the laptop.
    if (window.scrollY > 1) return;
    changeMode("open");
    scene.current?.setFocus?.(true);
    zoom.current?.open(reducedMotion);
  };
  // Scratch page: zoom in once, as soon as the laptop is ready.
  const autoOpened = useRef(false);
  useEffect(() => {
    if (!startOpen || autoOpened.current) return;
    if (kind !== "laptop" || status !== "ready") return;
    const timer = setTimeout(() => {
      autoOpened.current = true;
      openZoom();
    }, 0);
    return () => clearTimeout(timer);
  });
  const closeZoom = useCallback(
    (instant: boolean, refocus: boolean) => {
      if (modeRef.current !== "open") return;
      changeMode("closing");
      scene.current?.setFocus?.(false);
      zoom.current?.close(instant || reducedMotion, () => {
        if (modeRef.current === "closing") changeMode("closed");
      });
      if (refocus) hint.current?.focus({ preventScroll: true });
    },
    [changeMode, reducedMotion],
  );
  // The laptop scene is gone (tablet, phone, or a failed renderer): leave at once.
  useEffect(() => {
    if (kind !== "laptop" || status !== "ready") closeZoom(true, false);
  }, [kind, status, closeZoom]);
  // Close sits exactly over the navbar's "Let's talk" button while interact
  // mode is open (the backdrop already covers the navbar). Without that button
  // on screen (phones), the CSS position is used instead.
  useEffect(() => {
    if (mode !== "open") return;
    const place = () => {
      const close = closeButton.current;
      if (!close) return;
      const talk = [
        ...document.querySelectorAll<HTMLElement>('.site-navbar a[href="/contact"]'),
      ].find((link) => link.getBoundingClientRect().width > 0);
      if (!talk) {
        for (const key of ["top", "left", "width", "height"] as const)
          close.style.removeProperty(key);
        close.style.removeProperty("right");
        return;
      }
      const box = talk.getBoundingClientRect();
      close.style.top = `${box.top}px`;
      close.style.left = `${box.left}px`;
      close.style.width = `${box.width}px`;
      close.style.height = `${box.height}px`;
      close.style.right = "auto";
    };
    place();
    addEventListener("resize", place);
    return () => removeEventListener("resize", place);
  }, [mode]);
  useEffect(() => {
    if (mode !== "open") return;
    closeButton.current?.focus({ preventScroll: true });
    const width = innerWidth;
    const height = innerHeight;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeZoom(false, true);
      } else if (event.key === "Tab") {
        // Nothing else is reachable while it is open.
        event.preventDefault();
        closeButton.current?.focus({ preventScroll: true });
      }
    };
    const onResize = () => {
      if (innerWidth !== width || innerHeight !== height) closeZoom(true, false);
    };
    const onScroll = () => closeZoom(true, false);
    const onHidden = () => {
      if (document.hidden) closeZoom(true, false);
    };
    document.addEventListener("keydown", onKey);
    window.addEventListener("resize", onResize);
    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("visibilitychange", onHidden);
    return () => {
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("visibilitychange", onHidden);
    };
  }, [mode, closeZoom]);
  if (!project) return null;
  return (
    <div
      ref={section}
      className={cn("device-showcase relative min-w-0", className)}
    >
      <div
        className="device-stage relative"
        role="img"
        aria-label={`Device preview of the website: ${project.title}`}
        data-renderer={status}
      >
        <div
          ref={host}
          className={cn("absolute inset-0", status !== "ready" && "invisible")}
        />
        {status === "fallback" && (
          <div className="device-fallback" aria-hidden="true">
            <div className="fallback-laptop">
              <LiveFrame
                key={`${project.id}-desktop`}
                url={project.url}
                title={project.title}
                controls={false}
              />
            </div>
            <div className="fallback-phone">
              <LiveFrame
                key={`${project.id}-mobile`}
                url={project.url}
                title={project.title}
                controls={false}
                siteWidth={390}
                aspect={600 / 1295}
              />
            </div>
          </div>
        )}
      </div>
      {status === "ready" && kind === "laptop" && (
        <button
          ref={hint}
          type="button"
          className="device-hint"
          aria-expanded={mode === "open"}
          onClick={openZoom}
        >
          <svg
            viewBox="0 0 24 24"
            className="size-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
            strokeLinecap="round"
            aria-hidden="true"
          >
            <path d="m5 3 14 7-6 2.2L10.8 19 5 3Zm8 9.2 5 5" />
          </svg>
          Zoom in &amp; interact
        </button>
      )}
      {mode !== "closed" && (
        <div className="device-backdrop" data-state={mode} aria-hidden="true" />
      )}
      {mode === "open" && (
        <button
          ref={closeButton}
          type="button"
          className="device-close"
          onClick={() => closeZoom(false, true)}
        >
          <svg
            viewBox="0 0 24 24"
            className="size-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            aria-hidden="true"
          >
            <path d="M6 6l12 12M18 6 6 18" />
          </svg>
          Close
        </button>
      )}
      <p role="status" className="sr-only">
        {mode === "open"
          ? "Interactive view open. Drag to turn the laptop. Press Escape to close."
          : status === "ready"
          ? "3D showcase ready."
          : status === "fallback"
            ? "Showing static project previews because 3D is unavailable."
            : "Loading 3D showcase."}
      </p>
    </div>
  );
}