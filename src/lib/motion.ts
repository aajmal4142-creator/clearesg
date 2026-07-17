"use client";

import { type SpringOptions, type Transition, useReducedMotion } from "motion/react";

/** House spring: stiffness 260, damping 30 — §3 Motion */
export const houseSpring: Transition = {
  type: "spring",
  stiffness: 260,
  damping: 30,
};

export const houseSpringOptions: SpringOptions = {
  stiffness: 260,
  damping: 30,
};

/**
 * Returns the house spring, or an instant transition when the user prefers
 * reduced motion. Wire this into every animated surface — never check
 * prefers-reduced-motion per component.
 */
export function useMotionSafe(): Transition {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return { type: "tween", duration: 0 };
  }

  return houseSpring;
}
