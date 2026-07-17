"use client";

import { useMemo, useState } from "react";

import { Gauge } from "@/components/gauge/Gauge";
import { Metric } from "@/components/ui/metric";
import { FACTORS_FIXTURE } from "@/lib/calc/__fixtures__/factors.fixture";
import { computeScope1 } from "@/lib/calc/emissions";
import {
  computeEScore,
  computeGScore,
  computeOverall,
  computeSScore,
} from "@/lib/calc/scores";
import type { DatapointValue } from "@/lib/calc/types";

function demoScore(headcount: number, dieselL: number, renewablePct: number): number {
  const metrics: Record<string, DatapointValue> = {
    diesel_litres: {
      value: dieselL,
      unit: "L",
      quality: "estimated",
    },
  };
  const scope1 = computeScope1(metrics, FACTORS_FIXTURE, "GB", 2024);
  const carbonPerEmployee =
    scope1.measured.quality === "missing"
      ? 0
      : scope1.measured.value / Math.max(1, headcount);

  const e = computeEScore({
    carbonPerEmployeeTco2e: carbonPerEmployee,
    renewablePct,
  });
  const s = computeSScore({
    diversityPct: 40,
    injuryRate: 1.2,
    trainingHoursPerEmployee: 8,
  });
  const g = computeGScore({
    boardIndependencePct: 50,
    policiesTrue: 2,
  });
  return computeOverall(e.score, s.score, g.score);
}

function SliderField({
  label,
  value,
  min,
  max,
  step,
  unit,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  onChange: (n: number) => void;
}) {
  return (
    <label className="block">
      <span className="label-caps flex items-baseline justify-between gap-2">
        <span>{label}</span>
        <Metric value={value} unit={unit} size="sm" animate={false} />
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-2 h-1 w-full cursor-pointer appearance-none rounded-none bg-graphite accent-bone"
      />
    </label>
  );
}

/**
 * Marketing hero — live Gauge driven by real lib/calc.
 * Three sliders: headcount / diesel L / renewable %.
 */
export function LiveHeroGauge() {
  const [headcount, setHeadcount] = useState(120);
  const [dieselL, setDieselL] = useState(18000);
  const [renewablePct, setRenewablePct] = useState(35);

  const score = useMemo(
    () => demoScore(headcount, dieselL, renewablePct),
    [headcount, dieselL, renewablePct],
  );

  return (
    <div className="relative flex w-full flex-col items-center">
      <div
        className="hero-backlight pointer-events-none absolute inset-0 -z-0"
        aria-hidden
      />
      <div className="relative z-[1]">
        <Gauge score={score} previousScore={null} size={320} live />
      </div>
      <div className="relative z-[1] mt-8 grid w-full max-w-sm gap-5">
        <SliderField
          label="Headcount"
          value={headcount}
          min={10}
          max={500}
          step={5}
          unit="FTE"
          onChange={setHeadcount}
        />
        <SliderField
          label="Diesel"
          value={dieselL}
          min={0}
          max={80000}
          step={500}
          unit="L"
          onChange={setDieselL}
        />
        <SliderField
          label="Renewable"
          value={renewablePct}
          min={0}
          max={100}
          step={1}
          unit="%"
          onChange={setRenewablePct}
        />
      </div>
    </div>
  );
}
