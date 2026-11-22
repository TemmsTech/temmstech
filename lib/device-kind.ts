export type DeviceKind = "phone" | "tablet" | "laptop";

export const PHONE_QUERY = "(max-width: 767.98px)";
export const TOUCH_QUERY = "(pointer: coarse)";
export const FINE_ANY_QUERY = "(any-pointer: fine)";

type NavigatorWithUAData = Navigator & {
  userAgentData?: { platform?: string };
};

/** Windows touchscreen laptops can report touch as their only pointer, so the pointer alone cannot tell them from a tablet. */
function isWindows(): boolean {
  const nav = navigator as NavigatorWithUAData;
  const platform = nav.userAgentData?.platform ?? navigator.platform ?? "";
  return /win/i.test(platform);
}

/**
 * Phone: under 768px wide. Tablet: 768px or wider, touch is the primary
 * input, no mouse or trackpad is reported, and the device is not running
 * Windows (iPads and Android tablets). Everything else is a laptop/desktop.
 */
export function readDeviceKind(): DeviceKind {
  if (window.matchMedia(PHONE_QUERY).matches) return "phone";
  const touchPrimary = window.matchMedia(TOUCH_QUERY).matches;
  const hasFinePointer = window.matchMedia(FINE_ANY_QUERY).matches;
  return touchPrimary && !hasFinePointer && !isWindows() ? "tablet" : "laptop";
}
