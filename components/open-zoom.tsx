"use client";
import { useEffect } from "react";

/**
 * Presses the hero's own "Zoom in & interact" button as soon as it appears
 * (it only renders once the 3D laptop is ready), so the real zoom code runs
 * exactly as it does for a visitor. Used on the home page and on /scratch.
 * Skipped under browser automation (navigator.webdriver) so the scroll tests
 * still see the laptop in its normal, unzoomed state.
 */
export function OpenZoom() {
  useEffect(() => {
    if (navigator.webdriver) return;
    let frame = 0;
    const press = () => {
      const button = document.querySelector<HTMLButtonElement>(".device-hint");
      if (!button) return false;
      // The zoom refuses to open once the page has scrolled (a reload can
      // restore an old scroll position), and it closes on any scroll event.
      // So go to the top first and let that scroll event pass before pressing.
      if (scrollY > 1) scrollTo(0, 0);
      frame = requestAnimationFrame(() => {
        frame = requestAnimationFrame(() => button.click());
      });
      return true;
    };
    if (press()) return () => cancelAnimationFrame(frame);
    const watch = new MutationObserver(() => {
      if (press()) watch.disconnect();
    });
    watch.observe(document.body, { childList: true, subtree: true });
    return () => {
      watch.disconnect();
      cancelAnimationFrame(frame);
    };
  }, []);
  return null;
}
