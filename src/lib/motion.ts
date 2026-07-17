"use client";

import { type SpringOptions, type Transition, useReducedMotion } from "motion/react";

/** Exactly three springs — BUILD_PLAN §3 Motion */
export const spring = {
  type: "spring",
  stiffness: 260,
  damping: 30,
} as const satisfies Transition;

export const springSoft = {
  type: "spring",
  stiffness: 180,
  damping: 24,
} as const satisfies Transition;

export const springSnap = {
  type: "spring",
  stiffness: 400,
  damping: 32,
} as const satisfies Transition;

/** Gauge needle — underdamped; not exported as a fourth public spring, used only by Gauge */
export const needleSpringOptions: SpringOptions = {
  stiffness: 180,
  damping: 12,
  mass: 1.2,
};

export const arcSpringOptions: SpringOptions = {
  stiffness: 200,
  damping: 26,
};

/** @deprecated Prefer `spring` */
export const houseSpring: Transition = spring;

export const houseSpringOptions: SpringOptions = {
  stiffness: 260,
  damping: 30,
};

export const stagger = {
  container: {
    animate: {
      transition: { staggerChildren: 0.04, delayChildren: 0.06 },
    },
  },
  item: {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0, transition: springSoft },
  },
} as const;

export const pageLayer = {
  chrome: 0,
  structure: 0.04,
  data: 0.08,
} as const;

export type PageLayer = keyof typeof pageLayer;

const INSTANT: Transition = { type: "tween", duration: 0 };

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
