import { createSectionPreview } from "@/lib/section-preview";

type Point = { x: number; y: number };
type Quad = [Point, Point, Point, Point];

// Project a flat DOM viewport onto the four corners of the model display.
function projectiveTransform(
  [a, b, c, d]: Quad,
  width: number,
  height: number,
) {
  const dx1 = b.x - c.x,
    dx2 = d.x - c.x,
    dx3 = a.x - b.x + c.x - d.x;
  const dy1 = b.y - c.y,
    dy2 = d.y - c.y,
    dy3 = a.y - b.y + c.y - d.y;
  const denominator = dx1 * dy2 - dx2 * dy1;
  if (Math.abs(denominator) < 0.001) return "none";
  const g = (dx3 * dy2 - dx2 * dy3) / denominator;
  const h = (dx1 * dy3 - dx3 * dy1) / denominator;
  return `matrix3d(${(b.x - a.x + g * b.x) / width},${(b.y - a.y + g * b.y) / width},0,${g / width},${(d.x - a.x + h * d.x) / height},${(d.y - a.y + h * d.y) / height},0,${h / height},0,0,1,0,${a.x},${a.y},0,1)`;
}

/**
 * The section's preview, followed by the sections after it stacked beneath,
 * exactly as the page lays them out, until `minHeight` pixels are covered. A
 * tall screen (a phone) is then filled with real content, not empty space.
 */
function createPreviewStack(source: HTMLElement, minHeight: number) {
  const first = createSectionPreview(source);
  first.style.removeProperty("visibility");
  if (minHeight <= 0) return first;
  const stack = document.createElement("div");
  stack.appendChild(first);
  let covered = source.getBoundingClientRect().height;
  for (
    let next = source.nextElementSibling;
    next && covered < minHeight;
    next = next.nextElementSibling
  ) {
    // Skip spacers such as the transition runways; only real sections.
    if (!(next instanceof HTMLElement) || next.tagName !== "SECTION") continue;
    const copy = createSectionPreview(next);
    copy.style.removeProperty("visibility");
    stack.appendChild(copy);
    covered += next.getBoundingClientRect().height;
  }
  // Out of sections and the screen still has room: the site footer follows
  // <main> on every page, so finish the page with it.
  const footer = source.closest("main")?.nextElementSibling;
  if (
    covered < minHeight &&
    footer instanceof HTMLElement &&
    footer.tagName === "FOOTER"
  )
    stack.appendChild(createSectionPreview(footer));
  return stack;
}

export function createScreenPortal(
  host: HTMLElement,
  sectionId: string,
  options: {
    aspectRatio?: number;
    backdrop?: boolean;
    settleFrom?: number;
    refreshOnEntry?: boolean;
    /** Fill the whole screen with the target and the sections after it. */
    fillScreen?: boolean;
    /**
     * Lay the preview out at the full page width for the whole flight, so
     * nothing is cropped on the right. Use it when the screen is much narrower
     * than the page (a phone); the camera must then end at exactly page width.
     */
    keepPageWidth?: boolean;
  } = {},
) {
  const source = document.getElementById(sectionId);
  if (!source) return null;
  const backdrop = document.createElement("div");
  backdrop.className = "portal-backdrop";
  backdrop.setAttribute("aria-hidden", "true");
  host.appendChild(backdrop);
  const viewport = document.createElement("div");
  viewport.className = "screen-portal";
  viewport.setAttribute("aria-hidden", "true");
  viewport.inert = true;
  // The screen is as tall as the page is wide divided by its aspect ratio.
  const screenHeight = () =>
    options.fillScreen && options.aspectRatio
      ? innerWidth / options.aspectRatio
      : 0;
  let copy = createPreviewStack(source, screenHeight());
  let active = false;
  const style = getComputedStyle(source);
  for (const name of [
    "background",
    "foreground",
    "card",
    "card-foreground",
    "muted-foreground",
    "border",
    "accent-foreground",
    "secondary",
    "primary",
    "primary-foreground",
  ])
    viewport.style.setProperty(
      `--${name}`,
      style.getPropertyValue(`--${name}`),
    );
  viewport.appendChild(copy);
  host.appendChild(viewport);
  viewport.hidden = true;
  backdrop.hidden = true;
  return {
    update(corners: Quad, progress: number, mobile: boolean, occluder?: Quad) {
      // Lay the preview out at the real page width, which excludes a scrollbar.
      const pageWidth = host.clientWidth || innerWidth;
      backdrop.hidden =
        options.backdrop === false || progress <= 0 || progress >= 1;
      backdrop.style.opacity = String(Math.min(1, progress / 0.18));
      viewport.hidden = progress <= 0 || progress >= 1;
      if (viewport.hidden) {
        active = false;
        return;
      }
      if (!active && options.refreshOnEntry) {
        copy = createPreviewStack(source, screenHeight());
        viewport.replaceChildren(copy);
      }
      active = true;
      const projectedWidth = Math.hypot(
        corners[1].x - corners[0].x,
        corners[1].y - corners[0].y,
      );
      const settleFrom = options.settleFrom ?? 0.55;
      const settle = Math.max(
        0,
        Math.min(1, (progress - settleFrom) / (1 - settleFrom)),
      );
      const eased = settle * settle * (3 - 2 * settle);
      const layoutEase = options.keepPageWidth ? 0 : eased;
      const width = pageWidth + (projectedWidth - pageWidth) * layoutEase;
      const height =
        width /
        (options.aspectRatio ?? (mobile ? 6.52655 / 14.08495 : 0.294 / 0.17));
      viewport.style.width = `${width}px`;
      viewport.style.height = `${height}px`;
      viewport.style.borderRadius = mobile
        ? `${width * 0.045 * (1 - eased)}px`
        : "0";
      copy.style.width = `${pageWidth}px`;
      const transform = projectiveTransform(corners, width, height);
      viewport.style.transform = transform;
      if (occluder && transform !== "none") {
        // CSS previews must leave a hole for a WebGL device in front of the screen.
        const inverse = new DOMMatrix(transform).inverse();
        const hole = occluder.map((point) => {
          const local = new DOMPoint(point.x, point.y).matrixTransform(inverse);
          return `${local.x / local.w} ${local.y / local.w}`;
        });
        viewport.style.clipPath = `path(evenodd, "M0 0 H${width} V${height} H0 Z M${hole.join(" L")} Z")`;
      } else viewport.style.clipPath = "none";
    },
    hide() {
      active = false;
      viewport.hidden = true;
      backdrop.hidden = true;
    },
    dispose() {
      viewport.remove();
      backdrop.remove();
    },
  };
}
