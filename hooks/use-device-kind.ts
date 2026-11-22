"use client";

import { useCallback, useSyncExternalStore } from "react";
import {
  FINE_ANY_QUERY,
  PHONE_QUERY,
  TOUCH_QUERY,
  readDeviceKind,
  type DeviceKind,
} from "@/lib/device-kind";

export function useDeviceKind(serverValue: DeviceKind = "laptop") {
  const subscribe = useCallback((notify: () => void) => {
    const queries = [PHONE_QUERY, TOUCH_QUERY, FINE_ANY_QUERY].map((query) =>
      window.matchMedia(query),
    );
    queries.forEach((media) => media.addEventListener("change", notify));
    return () =>
      queries.forEach((media) => media.removeEventListener("change", notify));
  }, []);
  return useSyncExternalStore(subscribe, readDeviceKind, () => serverValue);
}
