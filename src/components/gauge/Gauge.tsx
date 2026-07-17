"use client";

import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { useEffect } from "react";

import { houseSpringOptions, useMotionSafe } from "@/lib/motion";
import { cn } from "@/lib/utils";

type GaugeProps = {
  score: number;
  previousScore?: number | null;
  estimated?: boolean;
  size?: number;
  className?: string;
};

function bandColor(score: number): string {
  if (score >= 70) return "var(--signal)";
  if (score >= 45) return "var(--amber)";
  return "var(--rust)";
}

export function Gauge({
  score,
  previousScore = null,
  estimated = false,
  size = 280,
  className,
}: GaugeProps) {
  const transition = useMotionSafe();
  const clamped = Math.max(0, Math.min(100, score));
  const startAngle = -210;
  const sweep = 240;
  const r = size * 0.38;
  const cx = size / 2;
  const cy = size / 2 + size * 0.06;

  const progress = useMotionValue(0);
  const spring = useSpring(progress, {
    ...houseSpringOptions,
    ...(transition.type === "tween" ? { stiffness: 1000, damping: 100 } : {}),
  });

  useEffect(() => {
    const target = clamped / 100;
    if (transition.type === "tween") {
      progress.set(target);
      return;
    }
    progress.set(0);
    const id = requestAnimationFrame(() => {
      progress.set(Math.min(1, target * 1.04));
      window.setTimeout(() => progress.set(target), 280);
    });
    return () => cancelAnimationFrame(id);
  }, [clamped, progress, transition.type]);

  const rotation = useTransform(spring, (p) => startAngle + 90 + sweep * p);
  const arcLength = spring;

  const ticks = Array.from({ length: 21 }, (_, i) => i * 5);

  function polar(angleDeg: number, radius: number) {
    const rad = (angleDeg * Math.PI) / 180;
    return { x: cx + radius * Math.cos(rad), y: cy + radius * Math.sin(rad) };
  }

  const start = polar(startAngle, r);
  const end = polar(startAngle + sweep, r);
  const arcPath = `M ${start.x} ${start.y} A ${r} ${r} 0 1 1 ${end.x} ${end.y}`;

  const ghostRotation =
    previousScore === null || previousScore === undefined
      ? null
      : startAngle + 90 + sweep * (Math.max(0, Math.min(100, previousScore)) / 100);

  return (
    <div className={cn("relative inline-flex flex-col items-center", className)}>
      <svg width={size} height={size * 0.72} viewBox={`0 0 ${size} ${size * 0.72}`}>
        <path d={arcPath} fill="none" stroke="var(--graphite)" strokeWidth={1} />
        <motion.path
          d={arcPath}
          fill="none"
          stroke={bandColor(clamped)}
          strokeWidth={3}
          pathLength={1}
          style={{ pathLength: arcLength }}
        />
        {ticks.map((v) => {
          const a = startAngle + sweep * (v / 100);
          const major = v % 20 === 0;
          const outer = polar(a, r);
          const inner = polar(a, r - (major ? 10 : 5));
          const label = polar(a, r - 22);
          return (
            <g key={v}>
              <line
                x1={inner.x}
                y1={inner.y}
                x2={outer.x}
                y2={outer.y}
                stroke="var(--ash)"
                strokeWidth={major ? 1.25 : 0.75}
              />
              {major ? (
                <text
                  x={label.x}
                  y={label.y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="var(--ash)"
                  fontSize={10}
                  fontFamily="var(--font-geist-mono)"
                >
                  {v}
                </text>
              ) : null}
            </g>
          );
        })}
        {ghostRotation !== null ? (
          <g transform={`rotate(${ghostRotation} ${cx} ${cy})`}>
            <line
              x1={cx}
              y1={cy}
              x2={cx}
              y2={cy - (r - 16)}
              stroke="var(--ash)"
              strokeWidth={1}
              strokeOpacity={0.35}
            />
          </g>
        ) : null}
        <motion.g style={{ rotate: rotation, transformOrigin: `${cx}px ${cy}px` }}>
          <line
            x1={cx}
            y1={cy}
            x2={cx}
            y2={cy - (r - 14)}
            stroke="var(--bone)"
            strokeWidth={1.5}
          />
        </motion.g>
        <circle cx={cx} cy={cy} r={3} fill="var(--bone)" />
      </svg>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center pt-8">
        <span className="font-data text-[64px] leading-none text-bone md:text-[96px]">
          {Math.round(clamped)}
        </span>
        {estimated ? (
          <span className="label-caps mt-2 text-amber">Estimated</span>
        ) : (
          <span className="label-caps mt-2">Overall</span>
        )}
      </div>
    </div>
  );
}
