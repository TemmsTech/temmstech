"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

export function usePageStartNavigation() {
  const pathname = usePathname();
  const pending = useRef(false);
  useEffect(() => {
    if (pending.current) {
      window.scrollTo({ top: 0, behavior: "instant" });
      pending.current = false;
    }
  }, [pathname]);
  return (destination: string) => {
    pending.current = destination !== pathname;
    window.scrollTo({ top: 0, behavior: "instant" });
  };
}
