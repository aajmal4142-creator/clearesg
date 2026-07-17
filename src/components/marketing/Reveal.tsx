"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";

import { springSoft, usePrefersReducedMotion } from "@/lib/motion";
import { cn } from "@/lib/utils";

export function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const reduced = usePrefersReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduced ? false : { opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ ...springSoft, delay: reduced ? 0 : delay }}
    >
      {children}
    </motion.div>
  );
}

/** Self-drawing hairline rule — scaleX from left on viewport entry. */
export function HairlineRule({
  className,
  delay = 0,
  accent = false,
}: {
  className?: string;
  delay?: number;
  accent?: boolean;
}) {
  const reduced = usePrefersReducedMotion();
  return (
    <motion.div
      aria-hidden
      className={cn(
        "h-px w-full origin-left",
        accent ? "h-0.5 bg-accent" : "bg-rule",
        className,
      )}
      initial={reduced ? false : { scaleX: 0 }}
      whileInView={{ scaleX: 1 }}
      viewport={{ once: true, margin: "-20px" }}
      transition={
        reduced ? { duration: 0 } : { duration: 0.4, ease: [0.22, 1, 0.36, 1], delay }
      }
    />
  );
}

export function StrikeReveal({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const reduced = usePrefersReducedMotion();
  return (
    <motion.li
      className={cn("relative text-ink-muted", className)}
      initial={reduced ? false : { opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ ...springSoft, delay: reduced ? 0 : delay }}
    >
      <span className="relative inline-block">
        {children}
        <motion.span
          aria-hidden
          className="absolute left-0 top-1/2 h-px w-full origin-left bg-canvas-muted"
          initial={reduced ? false : { scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={
            reduced
              ? { duration: 0 }
              : { duration: 0.45, ease: [0.22, 1, 0.36, 1], delay: delay + 0.15 }
          }
        />
      </span>
    </motion.li>
  );
}
