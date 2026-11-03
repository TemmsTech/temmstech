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
import { loadVideoDurations, showcaseDelay } from "@/lib/showcase-timing";
import type { ShowcaseProject } from "@/types/showcase";

type DeviceShowcaseProps = {
  projects: readonly ShowcaseProject[];
  className?: string;
  nextSectionId: string;
};
export function DeviceShowcase({
  projects,
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
  // A tab with a video stays open until the video ends.
  const [durationsLoaded, setDurationsLoaded] = useState(0);
  useEffect(() => {
    let cancelled = false;
    loadVideoDurations(projects).then(() => {
      if (!cancelled) setDurationsLoaded((count) => count + 1);
    });
    return () => {
      cancelled = true;
    };
  }, [projects]);
  const delayFor = useCallback(
    (at: number) => showcaseDelay(projects[at]),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [projects, durationsLoaded],
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
  const [index] = useShowcasePlayback(
    section,
    !reducedMotion && status !== "loading" && !holding,
    projects.length,
    delayFor,
  );
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
  }, [projects, nextSectionId, kind]);
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