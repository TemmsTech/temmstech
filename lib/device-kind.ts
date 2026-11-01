export type DeviceKind = "phone" | "tablet" | "laptop";

export const PHONE_QUERY = "(max-width: 767.98px)";
export const TOUCH_QUERY = "(pointer: coarse)";

/**
 * Phone: under 768px wide. Tablet: 768px or wider with touch as the primary
 * input. Everything else (mouse or trackpad) is a laptop/desktop. Touch
 * laptops report a fine primary pointer, so they stay laptops.
 */
export function readDeviceKind(): DeviceKind {
  if (window.matchMedia(PHONE_QUERY).matches) return "phone";
  return window.matchMedia(TOUCH_QUERY).matches ? "tablet" : "laptop";
}
