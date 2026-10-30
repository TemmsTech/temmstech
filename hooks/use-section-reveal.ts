"use client";

import { useEffect, type RefObject } from "react";
import { useMediaQuery } from "@/hooks/use-media-query";
import { createSectionPreview } from "@/lib/section-preview";
import { observeSectionNavigation } from "@/lib/section-navigation";
import { paceScroll } from "@/lib/pace-scroll";

const clamp = (value: number) => Math.max(0, Math.min(1, value));
const ease = (value: number) =>
  value < 0.5 ? 4 * value ** 3 : 1 - (-2 * value + 2) ** 3 / 2;

export function useSectionReveal(
  trackRef: RefObject<HTMLDivElement | null>,
  surfaceRef: RefObject<HTMLDivElement | null>,
  fromId: string,
  toId: string,
) {
  const reduced = useMediaQuery("(prefers-reduced-motion: reduce)", true);
  useEffect(() => {
    const track = trackRef.current,
      surface = surfaceRef.current;
    const source = document.getElementById(fromId),
      target = document.getElementById(toId);
    if (reduced || !track || !surface || !source || !target) return;
    let frame = 0;
    let active = false;
    let bypass = location.hash === `#${toId}`;
    const visibility = target.style.visibility;
    let preview: HTMLElement | undefined;
    let outgoing: HTMLElement | undefined;
    const backdrop = document.createElement("div");
    backdrop.className = "section-reveal-backdrop";
    backdrop.hidden = true;
    backdrop.inert = true;
    backdrop.setAttribute("aria-hidden", "true");
    track.prepend(backdrop);
    const range = () => {
      const end = target.getBoundingClientRect().top + scrollY;
      return { start: end - track.offsetHeight - innerHeight, end };
    };
    const update = () => {
      frame = 0;
      const { start, end } = range();
      const travelled = scrollY - start;
      const distance = Math.max(1, end - start);
      const p =
        travelled <= 1
          ? 0
          : travelled >= distance - 1
            ? 1
            : clamp(travelled / distance);
      if (p === 0) bypass = false;
      const nextActive = p > 0 && p < 1 && !bypass && !document.hidden;
      if (nextActive && !active) {
        preview = createSectionPreview(target);
        preview.style.visibility = "visible";
        surface.replaceChildren(preview);
        outgoing = createSectionPreview(source);
        backdrop.replaceChildren(outgoing);
        backdrop.style.background = getComputedStyle(source).backgroundColor;
        surface.style.background = getComputedStyle(target).backgroundColor;
      }
      active = nextActive;
      surface.hidden = !active;
      backdrop.hidden = !active;
      target.style.visibility = active ? "hidden" : visibility;
      if (!active || !preview) return;
      if (outgoing) {
        outgoing.style.transform = `translateY(${Math.min(0, innerHeight - source.offsetHeight)}px)`;
      }
      const size = Math.min(innerWidth, innerHeight) * 0.32;
      const rise = ease(clamp(p * 2));
      const expand = ease(clamp((p - 0.5) * 2));
      const cy =
        innerHeight +
        size / 2 +
        (innerHeight / 2 - innerHeight - size / 2) * rise;
      const top = (cy - size / 2) * (1 - expand);
      const bottom = (innerHeight - cy - size / 2) * (1 - expand);
      const side = ((innerWidth - size) / 2) * (1 - expand);
      surface.style.clipPath = `inset(${top}px ${side}px ${bottom}px round ${size * 0.3 * (1 - expand)}px)`;
      preview.style.transformOrigin = "50% 0";
      preview.style.transform = `translateY(${(cy - size / 2) * (1 - expand)}px) scale(${0.5 + expand * 0.5})`;
      preview.style.opacity = String(Math.min(1, 0.3 + expand * 1.4));
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    const stopPacing = paceScroll(() => (bypass ? null : range()));
    const stopNavigation = observeSectionNavigation(toId, () => {
      bypass = true;
      schedule();
    });
    const observer = new ResizeObserver(schedule);
    observer.observe(source);
    observer.observe(target);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    document.addEventListener("visibilitychange", schedule);
    schedule();
    return () => {
      cancelAnimationFrame(frame);
      stopPacing();
      stopNavigation();
      observer.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      document.removeEventListener("visibilitychange", schedule);
      surface.replaceChildren();
      surface.hidden = true;
      backdrop.remove();
      target.style.visibility = visibility;
    };
  }, [reduced, trackRef, surfaceRef, fromId, toId]);
}
