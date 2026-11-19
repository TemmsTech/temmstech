/** How long the laptop takes to grow into, and shrink out of, interact mode. Keep in step with --zoom-ms in globals.css. */
export const ZOOM_MS = 520;

export type ZoomRect = {
  left: number;
  top: number;
  width: number;
  height: number;
};

/** Where the laptop's host sits while zoomed in: most of the window, with a margin all round. */
export function zoomRect(): ZoomRect {
  const marginX = Math.round(window.innerWidth * 0.03);
  const marginY = Math.round(window.innerHeight * 0.05);
  return {
    left: marginX,
    top: marginY,
    width: window.innerWidth - marginX * 2,
    height: window.innerHeight - marginY * 2,
  };
}

/** Stops the page behind from scrolling without letting its layout shift. Returns the undo. */
export function lockPageScroll() {
  const root = document.documentElement;
  const before = {
    overflow: root.style.overflow,
    gutter: root.style.scrollbarGutter,
    padding: root.style.paddingRight,
  };
  const gutter = window.innerWidth - root.clientWidth;
  root.style.overflow = "hidden";
  if (gutter > 0) {
    // Keep the scrollbar's width reserved so nothing behind the backdrop moves.
    if (CSS.supports("scrollbar-gutter", "stable"))
      root.style.scrollbarGutter = "stable";
    else root.style.paddingRight = `${gutter}px`;
  }
  return () => {
    root.style.overflow = before.overflow;
    root.style.scrollbarGutter = before.gutter;
    root.style.paddingRight = before.padding;
  };
}

const ease = (k: number) =>
  k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;

/**
 * Grows the device host out of its stage to fill most of the window, and back.
 * While zoomed the host carries data-zoom, which tells the scene to frame the
 * laptop by the host's size (lib/device-scene.ts).
 */
export function createZoom(host: HTMLElement, hero: Element | null) {
  let frame = 0;
  let unlock: (() => void) | undefined;
  const place = (rect: ZoomRect) => {
    const style = host.style;
    style.position = "fixed";
    style.zIndex = "2";
    style.inset = "auto";
    style.left = `${rect.left}px`;
    style.top = `${rect.top}px`;
    style.width = `${rect.width}px`;
    style.height = `${rect.height}px`;
    style.background = "transparent";
  };
  const glide = (target: ZoomRect, instant: boolean, done?: () => void) => {
    cancelAnimationFrame(frame);
    frame = 0;
    const box = host.getBoundingClientRect();
    const from = {
      left: box.left,
      top: box.top,
      width: box.width,
      height: box.height,
    };
    if (instant) {
      place(target);
      done?.();
      return;
    }
    place(from);
    const start = performance.now();
    const step = (now: number) => {
      const k = Math.min(1, Math.max(0, (now - start) / ZOOM_MS));
      const e = ease(k);
      place({
        left: from.left + (target.left - from.left) * e,
        top: from.top + (target.top - from.top) * e,
        width: from.width + (target.width - from.width) * e,
        height: from.height + (target.height - from.height) * e,
      });
      if (k < 1) frame = requestAnimationFrame(step);
      else {
        frame = 0;
        done?.();
      }
    };
    frame = requestAnimationFrame(step);
  };
  const finish = () => {
    cancelAnimationFrame(frame);
    frame = 0;
    host.removeAttribute("style");
    host.removeAttribute("data-zoom");
    hero?.removeAttribute("data-interact");
    unlock?.();
    unlock = undefined;
  };
  return {
    open(instant: boolean) {
      // The hero rises above the sticky navbar so the backdrop covers it too.
      hero?.setAttribute("data-interact", "");
      host.setAttribute("data-zoom", "");
      unlock ??= lockPageScroll();
      glide(zoomRect(), instant);
    },
    close(instant: boolean, done?: () => void) {
      const stage = host.parentElement;
      if (!stage) {
        finish();
        done?.();
        return;
      }
      const box = stage.getBoundingClientRect();
      glide(
        { left: box.left, top: box.top, width: box.width, height: box.height },
        instant,
        () => {
          finish();
          done?.();
        },
      );
    },
    dispose: finish,
  };
}
