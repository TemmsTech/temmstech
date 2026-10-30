"use client";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useDeviceMotion, useMediaQuery, useShowcasePlayback } from "@/hooks";
import { cn } from "@/lib/utils";
import type { DeviceScene } from "@/lib/device-scene";
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
  const [status, setStatus] = useState<"loading" | "ready" | "fallback">(
    "loading",
  );
  const [index] = useShowcasePlayback(
    section,
    !reducedMotion && status === "ready",
    projects.length,
    7000,
  );
  const project = projects[index] ?? projects[0];
  useEffect(() => {
    const element = host.current;
    if (!element || !projects.length) return;
    const controller = new AbortController();
    let created: DeviceScene | undefined;
    import("@/lib/device-scene")
      .then(({ createDeviceScene }) => {
        if (!controller.signal.aborted)
          return createDeviceScene(
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
  }, [projects, nextSectionId]);
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
        aria-label={`Laptop and iPhone displaying the website: ${project.title}`}
        data-renderer={status}
      >
        <div
          ref={host}
          className={cn("absolute inset-0", status !== "ready" && "invisible")}
        />
        {status !== "ready" && (
          <div className="device-fallback" aria-hidden="true">
            {(["desktop", "mobile"] as const).map((size) => (
              <div
                key={size}
                className={
                  size === "desktop" ? "fallback-laptop" : "fallback-phone"
                }
              >
                <Image
                  src={
                    size === "desktop"
                      ? project.desktopImage
                      : project.mobileImage
                  }
                  alt=""
                  fill
                  sizes={size === "desktop" ? "600px" : "180px"}
                  unoptimized
                  loading="eager"
                />
              </div>
            ))}
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