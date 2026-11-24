"use client";

import { useEffect } from "react";
import { useDeviceKind } from "@/hooks";

/**
 * Marks the page with how it is controlled, so hover effects follow the device
 * type instead of the browser's pointer report. Some touchscreen Windows
 * laptops report no hover and no fine pointer, which the media queries would
 * read as touch-only. Laptops get data-pointer="fine"; phones and tablets get
 * "coarse". Styles that need hover use :where(:root[data-pointer="fine"]).
 */
export function PointerMode() {
  const kind = useDeviceKind();

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.pointer = kind === "laptop" ? "fine" : "coarse";
    return () => {
      delete root.dataset.pointer;
    };
  }, [kind]);

  return null;
}
