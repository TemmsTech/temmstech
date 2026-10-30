type ScrollRange = { start: number; end: number };
const ranges = new Set<() => ScrollRange | null>();
let activeStop: (() => void) | undefined;

/** Pace wheel input only while crossing a ready animation; native navigation stays native. */
export function paceScroll(getRange: () => ScrollRange | null) {
  ranges.add(getRange);
  let frame = 0;
  let target = window.scrollY;
  let direction = 0;
  let previousTime = 0;
  let position = window.scrollY;
  const duration =
    parseFloat(
      getComputedStyle(document.documentElement).getPropertyValue(
        "--scroll-traverse-ms",
      ),
    ) || 900;
  const stop = () => {
    cancelAnimationFrame(frame);
    frame = 0;
    direction = 0;
    if (activeStop === stop) activeStop = undefined;
  };
  const tick = (time: number) => {
    const range = getRange();
    if (!range || document.hidden) {
      stop();
      return;
    }
    target = Math.min(
      target,
      document.documentElement.scrollHeight - innerHeight,
    );
    const delta = target - position;
    const elapsed = Math.min(time - previousTime, 64);
    const step =
      ((range.end - range.start) * elapsed) /
      duration;
    previousTime = time;
    position += Math.sign(delta) * Math.min(Math.abs(delta), step);
    if (Math.abs(target - position) <= 1) position = target;
    window.scrollTo({
      top: position,
      behavior: "instant",
    });
    if (Math.abs(target - window.scrollY) > 1)
      frame = requestAnimationFrame(tick);
    else stop();
  };
  const onWheel = (event: WheelEvent) => {
    if (
      event.defaultPrevented ||
      !event.cancelable ||
      event.ctrlKey ||
      event.metaKey ||
      Math.abs(event.deltaX) > Math.abs(event.deltaY)
    )
      return;
    if (
      event.target instanceof Element &&
      event.target.closest(
        "textarea, input, select, [contenteditable=true], [data-native-scroll]",
      )
    )
      return;
    const range = getRange();
    if (!range || range.end <= range.start) return;
    const delta =
      event.deltaY *
      (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? innerHeight : 1);
    const y = window.scrollY;
    const nearest = [...ranges]
      .map((read) => ({ read, range: read() }))
      .filter(
        (entry) =>
          entry.range &&
          (delta > 0
            ? y < entry.range.end - 1 && y + delta > entry.range.start
            : y > entry.range.start + 1 && y + delta < entry.range.end),
      )
      .sort((a, b) =>
        delta > 0
          ? (a.range?.start ?? 0) - (b.range?.start ?? 0)
          : (b.range?.end ?? 0) - (a.range?.end ?? 0),
      )[0];
    if (nearest?.read !== getRange) return;
    if (
      !delta ||
      (delta > 0
        ? y >= range.end - 1 || y + delta <= range.start
        : y <= range.start + 1 || y + delta >= range.end)
    )
      return;
    event.preventDefault();
    if (activeStop !== stop) {
      activeStop?.();
      activeStop = stop;
    }
    const nextDirection = Math.sign(delta);
    if (!frame || direction !== nextDirection) {
      target = y;
      position = y;
    }
    direction = nextDirection;
    target = Math.max(range.start, Math.min(range.end, target + delta));
    if (!frame) {
      previousTime = performance.now();
      frame = requestAnimationFrame(tick);
    }
  };
  window.addEventListener("wheel", onWheel, { passive: false });
  window.addEventListener("keydown", stop);
  window.addEventListener("pointerdown", stop);
  window.addEventListener("touchstart", stop, { passive: true });
  window.addEventListener("hashchange", stop);
  window.addEventListener("resize", stop);
  document.addEventListener("visibilitychange", stop);
  return () => {
    ranges.delete(getRange);
    stop();
    window.removeEventListener("wheel", onWheel);
    window.removeEventListener("keydown", stop);
    window.removeEventListener("pointerdown", stop);
    window.removeEventListener("touchstart", stop);
    window.removeEventListener("hashchange", stop);
    window.removeEventListener("resize", stop);
    document.removeEventListener("visibilitychange", stop);
  };
}
