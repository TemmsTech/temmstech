"use client";

import { useEffect, useState } from "react";

export function useHeroVisibility() {
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const hero = document.querySelector(".hero-stage");
    if (!hero) return;
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { rootMargin: "-80px 0px 0px 0px" },
    );
    observer.observe(hero);
    return () => observer.disconnect();
  }, []);
  return visible;
}
