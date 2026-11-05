/** Fired on the device host when someone clicks a tab on the simulated screen. */
export const SHOWCASE_TAB_EVENT = "showcase-tab";

export function dispatchShowcaseTab(host: HTMLElement, index: number) {
  host.dispatchEvent(new CustomEvent(SHOWCASE_TAB_EVENT, { detail: { index } }));
}

/** Calls back with the index of each tab someone clicks on the simulated screen. */
export function onShowcaseTab(
  host: HTMLElement,
  listener: (index: number) => void,
) {
  const handler = (event: Event) =>
    listener((event as CustomEvent<{ index: number }>).detail.index);
  host.addEventListener(SHOWCASE_TAB_EVENT, handler);
  return () => host.removeEventListener(SHOWCASE_TAB_EVENT, handler);
}

/** Calls back with true while a mouse or pen hovers the host; touch never counts. */
export function watchPointerHover(
  host: HTMLElement,
  listener: (hovering: boolean) => void,
) {
  const enter = (event: PointerEvent) => {
    if (event.pointerType !== "touch") listener(true);
  };
  const leave = () => listener(false);
  host.addEventListener("pointerenter", enter);
  host.addEventListener("pointerleave", leave);
  return () => {
    host.removeEventListener("pointerenter", enter);
    host.removeEventListener("pointerleave", leave);
  };
}

/** Fired on the device host while the screen's browser window is minimised or closed. */
export const SHOWCASE_WINDOW_EVENT = "showcase-window";

export function dispatchShowcaseWindow(host: HTMLElement, hidden: boolean) {
  host.dispatchEvent(
    new CustomEvent(SHOWCASE_WINDOW_EVENT, { detail: { hidden } }),
  );
}

/** Calls back with true while the browser window is out of sight, false once it is back. */
export function onShowcaseWindow(
  host: HTMLElement,
  listener: (hidden: boolean) => void,
) {
  const handler = (event: Event) =>
    listener((event as CustomEvent<{ hidden: boolean }>).detail.hidden);
  host.addEventListener(SHOWCASE_WINDOW_EVENT, handler);
  return () => host.removeEventListener(SHOWCASE_WINDOW_EVENT, handler);
}
