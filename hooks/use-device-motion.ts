"use client";
import { useEffect, type RefObject } from "react";
import { observeSectionNavigation } from "@/lib/section-navigation";
import { paceScroll } from "@/lib/pace-scroll";
import type { DeviceScene } from "@/lib/device-scene";
export function useDeviceMotion(
  section: RefObject<HTMLDivElement | null>,
  host: RefObject<HTMLDivElement | null>,
  scene: RefObject<DeviceScene | null>,
  enabled: boolean,
) {
  useEffect(() => {
    const element = section.current;
    const canvasHost = host.current;
    const hero = element?.closest("section");
    const stage = canvasHost?.parentElement;
    if (!element || !canvasHost || !hero || !stage) return;
    let frame = 0;
    const nextSection = hero.nextElementSibling;
    const targetId = nextSection?.id ?? "";
    let skipForAnchor = location.hash === `#${targetId}`;
    let previousProgress = 0;
    const reveal = () => {
      if (nextSection instanceof HTMLElement)
        nextSection.style.removeProperty("visibility");
    };
    const reset = () => {
      canvasHost.removeAttribute("style");
      reveal();
      scene.current?.setScroll(0);
      scene.current?.setMotion(false);
    };
    const update = () => {
      frame = 0;
      if (!enabled || document.hidden) {
        reset();
        return;
      }
      const rect = stage.getBoundingClientRect();
      const heroRect = hero.getBoundingClientRect();
      const documentBottom = heroRect.bottom + window.scrollY;
      const start = 0;
      const distance = Math.max(1, documentBottom - start);
      const travelled = window.scrollY - start;
      const progress =
        travelled <= 1
          ? 0
          : travelled >= distance - 1
            ? 1
            : travelled / distance;
      if (progress === 0 && previousProgress > 0) skipForAnchor = false;
      previousProgress = progress;
      if (skipForAnchor && progress > 0) {
        reveal();
        scene.current?.setScroll(1);
        scene.current?.setMotion(false);
        canvasHost.setAttribute("style", "visibility:hidden");
        return;
      }
      scene.current?.setMotion(
        heroRect.top < innerHeight && heroRect.bottom > 0 && progress < 1,
      );
      scene.current?.setScroll(progress);
      if (nextSection instanceof HTMLElement) {
        if (progress < 1) nextSection.style.setProperty("visibility", "hidden");
        else reveal();
      }
      if (progress > 0 && progress < 1) {
        const expand = Math.min(1, progress * 3);
        const initialTop = rect.top + progress * distance;
        canvasHost.setAttribute(
          "style",
          `position:fixed;z-index:30;pointer-events:none;left:${rect.left * (1 - expand)}px;top:${initialTop * (1 - expand)}px;width:${rect.width + (innerWidth - rect.width) * expand}px;height:${rect.height + (innerHeight - rect.height) * expand}px;background:transparent;opacity:1`,
        );
      } else {
        canvasHost.removeAttribute("style");
        if (progress === 1)
          canvasHost.setAttribute("style", "visibility:hidden");
      }
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    const stopNavigation = observeSectionNavigation(targetId, () => {
      skipForAnchor = true;
      schedule();
    });
    const stopPacing = paceScroll(() => {
      if (!enabled || skipForAnchor) return null;
      const end = hero.getBoundingClientRect().bottom + scrollY;
      return { start: 0, end };
    });
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    document.addEventListener("visibilitychange", schedule);
    update();
    return () => {
      cancelAnimationFrame(frame);
      stopNavigation();
      stopPacing();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      document.removeEventListener("visibilitychange", schedule);
      reset();
    };
  }, [enabled, section, host, scene]);
}
