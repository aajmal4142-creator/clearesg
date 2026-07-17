"use client";

import { motion, useSpring, useTransform, type MotionValue } from "motion/react";
import { useEffect } from "react";

import {
  pageLayer,
  type PageLayer,
  useMotionSafe,
  usePrefersReducedMotion,
} from "@/lib/motion";
import { cn } from "@/lib/utils";

type AssembleProps = {
  layer: PageLayer;
  children: React.ReactNode;
  className?: string;
  as?: "div" | "header" | "main" | "section" | "nav";
};

/**
 * Page assembly: chrome → structure → data.
 * Data arrives last — the instrument boots, then it reads.
 */
export function Assemble({ layer, children, className, as = "div" }: AssembleProps) {
  const transition = useMotionSafe("soft");
  const reduced = usePrefersReducedMotion();
  const Comp = motion[as];

  return (
    <Comp
      className={className}
      initial={reduced ? false : { opacity: 0, y: layer === "chrome" ? 0 : 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        ...transition,
        delay: reduced ? 0 : pageLayer[layer],
      }}
    >
      {children}
    </Comp>
  );
}

type MetricSize = "sm" | "md" | "lg" | "xl" | "display" | "gauge";

const SIZE_CLASS: Record<MetricSize, string> = {
  sm: "text-sm",
  md: "text-base",
  lg: "text-xl",
  xl: "text-2xl",
  display: "text-[64px] leading-none md:text-[96px]",
  gauge: "text-[64px] leading-none md:text-[96px]",
};

type MetricProps = {
  value: number;
  unit?: string;
  /** Fixed decimal places. Omit to show decimals only when present. */
  decimals?: number;
  size?: MetricSize;
  /** Count from 0 on mount / value change. Default true. */
  animate?: boolean;
  /** Delay before count starts (seconds). */
  animateDelay?: number;
  className?: string;
  integerClassName?: string;
  unitClassName?: string;
  tone?: "bone" | "signal" | "amber" | "rust" | "ash";
};

function splitParts(
  value: number,
  decimals: number | undefined,
): { integer: string; fraction: string | null } {
  const abs = Math.abs(value);
  let fixed: string;
  if (decimals !== undefined) {
    fixed = abs.toFixed(decimals);
  } else if (Number.isInteger(abs) || Math.abs(abs - Math.round(abs)) < 1e-9) {
    fixed = String(Math.round(abs));
  } else {
    const rounded = Math.round(abs * 100) / 100;
    fixed = String(rounded);
  }

  const [intPart, fracPart] = fixed.split(".");
  const sign = value < 0 ? "-" : "";
  return {
    integer: `${sign}${intPart}`,
    fraction: fracPart !== undefined && fracPart.length > 0 ? fracPart : null,
  };
}

function MetricDigits({
  springValue,
  decimals,
  toneClass,
  integerClassName,
}: {
  springValue: MotionValue<number>;
  decimals: number | undefined;
  toneClass: string;
  integerClassName?: string;
}) {
  const integer = useTransform(springValue, (v) => splitParts(v, decimals).integer);
  const fraction = useTransform(springValue, (v) => {
    const f = splitParts(v, decimals).fraction;
    return f !== null ? `.${f}` : "";
  });

  return (
    <span className={cn(toneClass, integerClassName)}>
      <motion.span>{integer}</motion.span>
      <motion.span className="text-[0.85em] text-ash">{fraction}</motion.span>
    </span>
  );
}

/**
 * Instrument number primitive — integer at full weight, decimal in ash @ 0.85em, unit as label.
 * Values count; they never fade.
 */
export function Metric({
  value,
  unit,
  decimals,
  size = "md",
  animate = true,
  animateDelay = 0,
  className,
  integerClassName,
  unitClassName,
  tone = "bone",
}: MetricProps) {
  const reduced = usePrefersReducedMotion();
  const shouldAnimate = animate && !reduced;
  const springValue = useSpring(shouldAnimate ? 0 : value, {
    stiffness: 120,
    damping: 22,
    mass: 0.8,
  });

  useEffect(() => {
    if (!shouldAnimate) {
      springValue.jump(value);
      return;
    }
    springValue.jump(0);
    const id = window.setTimeout(() => {
      springValue.set(value);
    }, animateDelay * 1000);
    return () => window.clearTimeout(id);
  }, [value, shouldAnimate, animateDelay, springValue]);

  const toneClass =
    tone === "signal"
      ? "text-signal"
      : tone === "amber"
        ? "text-amber"
        : tone === "rust"
          ? "text-rust"
          : tone === "ash"
            ? "text-ash"
            : "text-bone";

  return (
    <span
      className={cn(
        "font-data inline-flex items-baseline gap-1.5",
        SIZE_CLASS[size],
        className,
      )}
    >
      <MetricDigits
        springValue={springValue}
        decimals={decimals}
        toneClass={toneClass}
        integerClassName={integerClassName}
      />
      {unit ? (
        <span className={cn("label-caps !normal-case tracking-normal", unitClassName)}>
          {unit}
        </span>
      ) : null}
    </span>
  );
}
