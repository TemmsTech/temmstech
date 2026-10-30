"use client";

import { useEffect, useRef, useState } from "react";

export function useNavbarVisibility() {
  const [visible, setVisible] = useState(true);
  const lastY = useRef(0);
  const ticking = useRef(false);

  useEffect(() => {
    lastY.current = 0;
    let frame = 0;
    let travel = 0;

    const evaluate = () => {
      const currentY = Math.max(
        0,
        Math.min(
          window.scrollY,
          document.documentElement.scrollHeight - innerHeight,
        ),
      );
      const delta = currentY - lastY.current;
      travel = Math.sign(delta) === Math.sign(travel) ? travel + delta : delta;

      if (currentY <= 8) {
        setVisible(true);
        travel = 0;
      } else if (travel > 24) {
        setVisible(false);
        travel = 0;
      } else if (travel < -24) {
        setVisible(true);
        travel = 0;
      }

      lastY.current = currentY;
      ticking.current = false;
    };

    const onScroll = () => {
      if (ticking.current) return;
      ticking.current = true;
      frame = requestAnimationFrame(evaluate);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
      ticking.current = false;
    };
  }, []);

  return visible;
}
