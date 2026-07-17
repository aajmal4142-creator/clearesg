"use client";

import { motion, AnimatePresence } from "motion/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Metric } from "@/components/ui/metric";
import { useMotionSafe } from "@/lib/motion";

const QUESTIONS = [
  {
    key: "sector",
    label: "Sector",
    type: "select" as const,
    options: [
      { value: "C25", label: "Manufacturing" },
      { value: "J62", label: "IT / Services" },
      { value: "G46", label: "Wholesale" },
      { value: "H49", label: "Transport" },
      { value: "M70", label: "Consulting" },
    ],
  },
  { key: "headcount", label: "Headcount (FTE)", type: "number" as const },
  {
    key: "country",
    label: "Country",
    type: "select" as const,
    options: [
      { value: "GB", label: "United Kingdom" },
      { value: "IN", label: "India" },
      { value: "IE", label: "Ireland" },
      { value: "DE", label: "Germany" },
      { value: "NL", label: "Netherlands" },
      { value: "US", label: "United States" },
    ],
  },
  {
    key: "revenueBand",
    label: "Revenue band",
    type: "select" as const,
    options: [
      { value: "lt_2m", label: "< €2m" },
      { value: "2_10m", label: "€2–10m" },
      { value: "10_50m", label: "€10–50m" },
      { value: "50_250m", label: "€50–250m" },
      { value: "gt_250m", label: "> €250m" },
    ],
  },
  { key: "sites", label: "Number of sites", type: "number" as const },
  {
    key: "tenure",
    label: "Premises",
    type: "select" as const,
    options: [
      { value: "own", label: "Owned" },
      { value: "lease", label: "Leased" },
      { value: "mix", label: "Mix" },
    ],
  },
];

function estimateScore(
  sector: string,
  headcount: number,
): { score: number; tCO2e: number } {
  const intensity = sector.startsWith("C")
    ? 8
    : sector.startsWith("J") || sector.startsWith("M")
      ? 2
      : 4;
  const tCO2e = Math.max(1, headcount) * intensity;
  const carbonPerEmployee = tCO2e / Math.max(1, headcount);
  const score = Math.max(
    0,
    Math.min(100, Math.round(100 - Math.max(0, carbonPerEmployee - 1) * 12)),
  );
  return { score, tCO2e };
}

export function OnboardingWizard() {
  const transition = useMotionSafe();
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);
  const [values, setValues] = useState<Record<string, string>>({
    sector: "C25",
    headcount: "80",
    country: "GB",
    revenueBand: "10_50m",
    sites: "2",
    tenure: "lease",
  });

  const q = QUESTIONS[step];
  const progress = ((step + (done ? 1 : 0)) / QUESTIONS.length) * 100;
  const estimate = estimateScore(values.sector, Number(values.headcount) || 1);

  async function finish() {
    const res = await fetch("/api/onboarding", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    if (!res.ok) {
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      window.alert(data.error ?? "Onboarding failed");
      return;
    }
    setDone(true);
    router.refresh();
  }

  if (done) {
    return (
      <div className="mx-auto flex max-w-2xl flex-col items-center px-6 py-16">
        <p className="label-caps mb-4">Baseline</p>
        <Metric value={estimate.score} size="display" decimals={0} tone="amber" />
        <p className="label-caps mt-2 text-amber">Estimated score</p>
        <div className="mt-6">
          <Metric
            value={estimate.tCO2e}
            unit="tCO2e"
            size="xl"
            decimals={0}
            tone="amber"
          />
        </div>
        <p className="label-caps mt-1 text-amber">Estimated footprint</p>
        <p className="measure-body mt-6 text-center text-ash">
          Replace estimates with measured data to raise your confidence score. Your
          Compliance Runway is ready.
        </p>
        <Button
          type="button"
          className="mt-10"
          onClick={() => {
            router.refresh();
            router.push("/app");
          }}
        >
          Open runway
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl px-6 py-16">
      <div className="mb-10 h-px w-full bg-graphite">
        <div
          className="h-px bg-bone transition-[width]"
          style={{ width: `${progress}%` }}
        />
      </div>
      <AnimatePresence mode="wait">
        <motion.div
          key={q.key}
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -24 }}
          transition={transition}
        >
          <p className="label-caps mb-3">
            Question {step + 1} of {QUESTIONS.length}
          </p>
          <h1 className="font-display text-3xl text-bone">{q.label}</h1>
          <div className="mt-8">
            {q.type === "number" ? (
              <Input
                type="number"
                className="h-11"
                value={values[q.key] ?? ""}
                onChange={(e) => setValues((v) => ({ ...v, [q.key]: e.target.value }))}
              />
            ) : (
              <select
                className="surface-inset h-11 w-full rounded-[4px] px-3 text-bone"
                value={values[q.key] ?? ""}
                onChange={(e) => setValues((v) => ({ ...v, [q.key]: e.target.value }))}
              >
                {q.options?.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            )}
          </div>
          <div className="mt-10 flex gap-3">
            <Button
              type="button"
              variant="secondary"
              disabled={step === 0}
              onClick={() => setStep((s) => Math.max(0, s - 1))}
            >
              Back
            </Button>
            <Button
              type="button"
              onClick={() => {
                if (step >= QUESTIONS.length - 1) void finish();
                else setStep((s) => s + 1);
              }}
            >
              {step >= QUESTIONS.length - 1 ? "See baseline" : "Continue"}
            </Button>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
