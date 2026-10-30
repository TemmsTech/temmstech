"use client";
import { useEffect, useState, type RefObject } from "react";
import { useMediaQuery } from "@/hooks/use-media-query";
import { observeSectionNavigation } from "@/lib/section-navigation";
import { paceScroll } from "@/lib/pace-scroll";
import type { TabletScene } from "@/lib/tablet-scene";

export function useTabletTransition(
  runway: RefObject<HTMLDivElement | null>,
  host: RefObject<HTMLDivElement | null>,
  fromId: string,
  toId: string,
) {
  const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)", true);
  const [status, setStatus] = useState<"loading" | "ready" | "fallback">(
    "loading",
  );
  useEffect(() => {
    const track = runway.current,
      surface = host.current;
    const source = document.getElementById(fromId),
      target = document.getElementById(toId);
    if (reducedMotion || !track || !surface || !source || !target) return;
    const controller = new AbortController();
    let scene: TabletScene | undefined;
    let frame = 0;
    let previousProgress = 0;
    let skipForAnchor = location.hash === `#${toId}`;
    const originalVisibility = target.style.visibility;
    const reset = () => {
      surface.hidden = true;
      surface.style.top = "";
      surface.style.height = "";
      target.style.visibility = originalVisibility;
    };
    const update = () => {
      frame = 0;
      if (!scene || document.hidden) {
        reset();
        return;
      }
      const sourceBottom = source.getBoundingClientRect().bottom;
      const distance = Math.max(
        innerHeight + track.getBoundingClientRect().height,
        1,
      );
      const travelled = innerHeight - sourceBottom;
      // Round-off at the endpoints must not leave an inert preview on screen.
      const progress =
        travelled <= 1
          ? 0
          : travelled >= distance - 1
            ? 1
            : travelled / distance;
      if (progress === 0 && previousProgress > 0) skipForAnchor = false;
      previousProgress = progress;
      const active = progress > 0 && progress < 1 && !skipForAnchor;
      target.style.visibility = active ? "hidden" : originalVisibility;
      if (!active) {
        surface.hidden = true;
        scene.hide();
        return;
      }
      const stripTop = Math.max(0, Math.min(innerHeight - 1, sourceBottom));
      const stripHeight = innerHeight - stripTop;
      surface.hidden = false;
      surface.style.top = `${stripTop}px`;
      surface.style.height = `${stripHeight}px`;
      scene.render(progress, stripHeight);
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    const fail = () => {
      if (controller.signal.aborted) return;
      reset();
      const removedHeight = track.getBoundingClientRect().height;
      const belowTrack = target.getBoundingClientRect().top < innerHeight;
      track.style.height = "0px";
      if (belowTrack)
        window.scrollBy({ top: -removedHeight, behavior: "instant" });
      scene?.dispose();
      scene = undefined;
      if (!controller.signal.aborted) setStatus("fallback");
    };
    import("@/lib/tablet-scene")
      .then(({ createTabletScene }) =>
        createTabletScene(surface, toId, controller.signal, fail),
      )
      .then((result) => {
        if (controller.signal.aborted) {
          result.dispose();
          return;
        }
        scene = result;

        setStatus("ready");
        schedule();
      })
      .catch(fail);
    const stopNavigation = observeSectionNavigation(toId, () => {
      skipForAnchor = true;
      schedule();
    });
    const stopPacing = paceScroll(() => {
      if (!scene || skipForAnchor) return null;
      const start =
        source.getBoundingClientRect().bottom + scrollY - innerHeight;
      return {
        start,
        end: start + innerHeight + track.getBoundingClientRect().height,
      };
    });
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    document.addEventListener("visibilitychange", schedule);
    return () => {
      controller.abort();
      cancelAnimationFrame(frame);
      stopNavigation();
      stopPacing();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      document.removeEventListener("visibilitychange", schedule);
      reset();
      track.style.removeProperty("height");
      scene?.dispose();
    };
  }, [fromId, toId, reducedMotion, runway, host]);
  return reducedMotion ? "reduced-motion" : status;
}
