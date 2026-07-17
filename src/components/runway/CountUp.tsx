"use client";

import { useEffect, useRef, useState } from "react";

import { useMotionSafe } from "@/lib/motion";

export function CountUp({ value, className }: { value: number; className?: string }) {
  const transition = useMotionSafe();
  const reduced = transition.type === "tween";
  const [display, setDisplay] = useState(0);
  const frameRef = useRef(0);

  useEffect(() => {
    if (reduced) return;

    const start = performance.now();
    const from = 0;
    const duration = 900;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(Math.round(from + (value - from) * eased));
      if (t < 1) frameRef.current = requestAnimationFrame(tick);
    };
    frameRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameRef.current);
  }, [value, reduced]);

  return <span className={className}>{reduced ? value : display}</span>;
}
