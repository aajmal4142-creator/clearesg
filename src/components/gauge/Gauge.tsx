"use client";

import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { useEffect, useId, useMemo } from "react";

import { Metric } from "@/components/ui/metric";
import {
  arcSpringOptions,
  needleSpringOptions,
  springSoft,
  usePrefersReducedMotion,
} from "@/lib/motion";
import { cn } from "@/lib/utils";

type GaugeProps = {
  score: number;
  previousScore?: number | null;
  estimated?: boolean;
  size?: number;
  className?: string;
  /** When true, skip entrance and snap to value (interactive hero). */
  live?: boolean;
};

function bandColor(score: number): string {
  if (score >= 70) return "var(--signal)";
  if (score >= 45) return "var(--amber)";
  return "var(--rust)";
}

function polar(
  cx: number,
  cy: number,
  angleDeg: number,
  radius: number,
): { x: number; y: number } {
  const rad = (angleDeg * Math.PI) / 180;
  return { x: cx + radius * Math.cos(rad), y: cy + radius * Math.sin(rad) };
}

/** Tapered needle: 6px at hub → 1.5px at tip, with dark centre spine. */
function needlePath(cx: number, cy: number, length: number): string {
  const hubHalf = 3;
  const tipHalf = 0.75;
  return [
    `M ${cx - hubHalf} ${cy}`,
    `L ${cx - tipHalf} ${cy - length}`,
    `L ${cx + tipHalf} ${cy - length}`,
    `L ${cx + hubHalf} ${cy}`,
    "Z",
  ].join(" ");
}

/**
 * Precision 240° instrument dial.
 * Placements only: marketing hero, dashboard runway, PDF page 1.
 */
export function Gauge({
  score,
  previousScore = null,
  estimated = false,
  size = 280,
  className,
  live = false,
}: GaugeProps) {
  const reduced = usePrefersReducedMotion();
  const glowId = useId();
  const clamped = Math.max(0, Math.min(100, score));
  const startAngle = -210;
  const sweep = 240;
  const r = size * 0.38;
  const cx = size / 2;
  const cy = size / 2 + size * 0.06;
  const dishR = r + 28;
  const needleLen = r - 14;

  const progress = useMotionValue(reduced || live ? clamped / 100 : 0);
  const needleSpring = useSpring(progress, {
    ...(reduced ? { stiffness: 1000, damping: 100, mass: 0.1 } : needleSpringOptions),
  });
  const arcProgress = useMotionValue(reduced || live ? clamped / 100 : 0);
  const arcSpring = useSpring(arcProgress, {
    ...(reduced ? { stiffness: 1000, damping: 100, mass: 0.1 } : arcSpringOptions),
  });

  useEffect(() => {
    const target = clamped / 100;
    if (reduced) {
      progress.jump(target);
      arcProgress.jump(target);
      return;
    }
    if (live) {
      progress.set(target);
      window.setTimeout(() => arcProgress.set(target), 40);
      return;
    }
    progress.jump(0);
    arcProgress.jump(0);
    const id = requestAnimationFrame(() => {
      progress.set(target);
      window.setTimeout(() => arcProgress.set(target), 40);
    });
    return () => cancelAnimationFrame(id);
  }, [clamped, progress, arcProgress, reduced, live]);

  const rotation = useTransform(needleSpring, (p) => startAngle + 90 + sweep * p);
  const arcLength = arcSpring;

  const ticks = useMemo(() => Array.from({ length: 21 }, (_, i) => i * 5), []);

  const start = polar(cx, cy, startAngle, r);
  const end = polar(cx, cy, startAngle + sweep, r);
  const arcPath = `M ${start.x} ${start.y} A ${r} ${r} 0 1 1 ${end.x} ${end.y}`;

  const ghostRotation =
    previousScore === null || previousScore === undefined
      ? null
      : startAngle + 90 + sweep * (Math.max(0, Math.min(100, previousScore)) / 100);

  const band = bandColor(clamped);
  /** Readout lands ~100ms after needle rest (~1.2s) */
  const readoutDelay = reduced || live ? 0 : 1.3;

  return (
    <div className={cn("relative inline-flex flex-col items-center", className)}>
      {/* Recessed dish */}
      <div className="relative" style={{ width: size, height: size * 0.72 }}>
        <div
          className="gauge-dish pointer-events-none absolute left-1/2 top-[52%] -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{ width: dishR * 2, height: dishR * 2 }}
          aria-hidden
        />
        <svg
          width={size}
          height={size * 0.72}
          viewBox={`0 0 ${size} ${size * 0.72}`}
          className="relative z-[1]"
          role="img"
          aria-label={`ESG score ${Math.round(clamped)}${estimated ? ", estimated" : ""}`}
        >
          <defs>
            <filter id={glowId} x="-40%" y="-40%" width="180%" height="180%">
              <feDropShadow
                dx="0"
                dy="0"
                stdDeviation="3"
                floodColor={band}
                floodOpacity="0.4"
              />
            </filter>
          </defs>

          {/* Track */}
          <path d={arcPath} fill="none" stroke="var(--graphite)" strokeWidth={2} />

          {/* Band fill */}
          <motion.path
            d={arcPath}
            fill="none"
            stroke={band}
            strokeWidth={3}
            strokeLinecap="butt"
            pathLength={1}
            style={{ pathLength: arcLength }}
            filter={`url(#${glowId})`}
          />

          {/* Ticks — hang inside the arc */}
          {ticks.map((v, i) => {
            const a = startAngle + sweep * (v / 100);
            const major = v % 20 === 0;
            const outer = polar(cx, cy, a, r - 2);
            const inner = polar(cx, cy, a, r - (major ? 14 : 8));
            const label = polar(cx, cy, a, r - 26);
            return (
              <motion.g
                key={v}
                initial={reduced ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{
                  ...springSoft,
                  delay: reduced ? 0 : i * 0.008,
                }}
              >
                <line
                  x1={inner.x}
                  y1={inner.y}
                  x2={outer.x}
                  y2={outer.y}
                  stroke={major ? "var(--ash)" : "var(--graphite)"}
                  strokeWidth={1}
                />
                {major ? (
                  <text
                    x={label.x}
                    y={label.y}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill="var(--ash)"
                    fontSize={11}
                    fontFamily="var(--font-geist-mono)"
                  >
                    {v}
                  </text>
                ) : null}
              </motion.g>
            );
          })}

          {/* Ghost needle — previous period, at rest */}
          {ghostRotation !== null ? (
            <g transform={`rotate(${ghostRotation} ${cx} ${cy})`}>
              <line
                x1={cx}
                y1={cy}
                x2={cx}
                y2={cy - needleLen}
                stroke="var(--graphite)"
                strokeWidth={1}
                strokeOpacity={0.5}
              />
            </g>
          ) : null}

          {/* Live needle — tapered polygon + spine */}
          <motion.g style={{ rotate: rotation, transformOrigin: `${cx}px ${cy}px` }}>
            <path d={needlePath(cx, cy, needleLen)} fill="var(--bone)" />
            <line
              x1={cx}
              y1={cy}
              x2={cx}
              y2={cy - needleLen}
              stroke="var(--ink)"
              strokeWidth={0.6}
              strokeOpacity={0.55}
            />
          </motion.g>

          {/* Hub — screw head */}
          <circle
            cx={cx}
            cy={cy}
            r={6}
            fill="var(--slate)"
            className="gauge-hub-rim"
            strokeWidth={1}
            stroke="var(--highlight-hover)"
          />
          <circle cx={cx} cy={cy} r={2.5} fill="var(--ink)" />
        </svg>

        {/* Centre readout — below hub */}
        <div className="pointer-events-none absolute inset-x-0 bottom-[8%] flex flex-col items-center">
          <Metric
            value={clamped}
            decimals={0}
            size="gauge"
            animate={!live}
            animateDelay={readoutDelay}
          />
          {estimated ? (
            <span className="label-caps mt-2 text-amber">Estimated</span>
          ) : (
            <span className="label-caps mt-2">Overall</span>
          )}
        </div>
      </div>
    </div>
  );
}
