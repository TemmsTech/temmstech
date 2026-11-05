"use client";
import { LiveFrame } from "@/components/live-frame";
import { useEffect, useRef, useState } from "react";
import {
  useDeviceKind,
  useDeviceMotion,
  useMediaQuery,
  useShowcasePlayback,
} from "@/hooks";
import { cn } from "@/lib/utils";
import type { DeviceScene } from "@/lib/device-scene";
import { SHOWCASE_INTERVAL_MS } from "@/lib/showcase-timing";
import { onShowcasePlayer } from "@/lib/screen-video-player";
import {
  onShowcaseTab,
  onShowcaseWindow,
  watchPointerHover,
} from "@/lib/showcase-events";
import type { ShowcaseProject, ShowcaseVideo } from "@/types/showcase";
import "./screen-desktop.css";
import "./screen-explorer.css";
import "./screen-terminal.css";
import "./screen-vscode.css";

type DeviceShowcaseProps = {
  projects: readonly ShowcaseProject[];
  /** Plays once in a miniature player on the screens, then minimises. */
  video?: ShowcaseVideo;
  className?: string;
  nextSectionId: string;
};
export function DeviceShowcase({
  projects,
  video,
  className,
  nextSectionId,
}: DeviceShowcaseProps) {
  const host = useRef<HTMLDivElement>(null);
  const section = useRef<HTMLDivElement>(null);
  const scene = useRef<DeviceScene | null>(null);
  const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)", true);
  const kind = useDeviceKind();
  const [status, setStatus] = useState<"loading" | "ready" | "fallback">(
    "loading",
  );
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
  const autoplay =
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
  useDeviceMotion(section, host, scene, status === "ready" && !reducedMotion);
  if (!project) return null;
  return (
    <div ref={section} className={cn("device-showcase min-w-0", className)}>
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
        {status === "ready" && (
          <p className="device-hint" aria-hidden="true">
            <svg
              viewBox="0 0 24 24"
              className="size-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinejoin="round"
              strokeLinecap="round"
            >
              <path d="m5 3 14 7-6 2.2L10.8 19 5 3Zm8 9.2 5 5" />
            </svg>
            Zoom in &amp; interact
          </p>
        )}
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
      <p role="status" className="sr-only">
        {status === "ready"
          ? "3D showcase ready."
          : status === "fallback"
            ? "Showing static project previews because 3D is unavailable."
            : "Loading 3D showcase."}
      </p>
    </div>
  );
}