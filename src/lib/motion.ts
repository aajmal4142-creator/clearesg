"use client";

import { type SpringOptions, type Transition, useReducedMotion } from "motion/react";

/** House spring — §3 Motion default */
export const spring = {
  type: "spring",
  stiffness: 260,
  damping: 30,
} as const satisfies Transition;

/** Softer arrival for staggered structure / scroll reveal */
export const springSoft = {
  type: "spring",
  stiffness: 180,
  damping: 24,
} as const satisfies Transition;

/** Snappy micro-interactions (table edge bar, toasts) */
export const springSnap = {
  type: "spring",
  stiffness: 400,
  damping: 32,
} as const satisfies Transition;

/** Gauge needle — deliberately underdamped; mass + low damping = visible oscillation */
export const springNeedle = {
  type: "spring",
  stiffness: 180,
  damping: 12,
  mass: 1.2,
} as const satisfies Transition;

/** Gauge arc fill — trails the needle */
export const springArc = {
  type: "spring",
  stiffness: 200,
  damping: 26,
} as const satisfies Transition;

/** @deprecated Prefer `spring` — kept for existing imports */
export const houseSpring: Transition = spring;

export const houseSpringOptions: SpringOptions = {
  stiffness: 260,
  damping: 30,
};

export const needleSpringOptions: SpringOptions = {
  stiffness: 180,
  damping: 12,
  mass: 1.2,
};

export const arcSpringOptions: SpringOptions = {
  stiffness: 200,
  damping: 26,
};

export const stagger = {
  container: {
    animate: {
      transition: { staggerChildren: 0.04, delayChildren: 0.06 },
    },
  },
  item: {
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0, transition: springSoft },
  },
} as const;

/** Page assembly: chrome → structure → data, 40ms apart */
export const pageLayer = {
  chrome: 0,
  structure: 0.04,
  data: 0.08,
} as const;

export type PageLayer = keyof typeof pageLayer;

const INSTANT: Transition = { type: "tween", duration: 0 };

/**
 * Returns the house spring, or an instant transition when the user prefers
 * reduced motion. Wire this into every animated surface — never check
 * prefers-reduced-motion per component.
 */
export function useMotionSafe(variant: "house" | "soft" | "snap" = "house"): Transition {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return INSTANT;
  }

  if (variant === "soft") return springSoft;
  if (variant === "snap") return springSnap;
  return spring;
}

export function usePrefersReducedMotion(): boolean {
  return Boolean(useReducedMotion());
}
