"use client";

import { useState } from "react";

import { PageMasthead } from "@/components/motion";

type BenchmarkPayload =
  | {
      available: false;
      reason: string;
      minCohortSize: number;
    }
  | {
      available: true;
      sector: string;
      metricKey: string;
      p25: number;
      p50: number;
      p75: number;
      cohortSize: number;
      userValue: number | null;
      percentileRank: number | null;
      improve: Array<{ label: string; href: string }>;
    };

export function BenchmarksClient({ initial }: { initial: BenchmarkPayload }) {
  const [data, setData] = useState(initial);
  const [status, setStatus] = useState<string | null>(null);

  async function recompute() {
    setStatus("Recomputing…");
    const res = await fetch("/api/app/benchmarks/recompute", { method: "POST" });
    const body = (await res.json().catch(() => ({}))) as {
      error?: string;
      written?: number;
    };
    if (!res.ok) {
      setStatus(body.error ?? "Recompute failed");
      return;
    }
    const get = await fetch("/api/app/benchmarks?metricKey=electricity_kwh");
    const next = (await get.json()) as BenchmarkPayload;
    setData(next);
    setStatus(`Wrote ${body.written ?? 0} cohort(s)`);
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8 px-6 py-12">
      <PageMasthead
        label="Benchmarking"
        title="Sector position"
        description="Cohorts with fewer than 8 organisations are never shown."
      >
        {status ? <p className="mt-3 text-sm text-ink-muted">{status}</p> : null}
      </PageMasthead>

      <button
        type="button"
        onClick={() => void recompute()}
        className="border border-rule px-3 py-2 text-sm text-ink-muted hover:border-rule-strong hover:text-ink"
      >
        Recompute cohorts
      </button>

      {!data.available ? (
        <p className="text-ink-muted">{data.reason}</p>
      ) : (
        <>
          <div className="border border-rule p-4">
            <p className="label-caps">
              {data.metricKey} · sector {data.sector} · n={data.cohortSize}
            </p>
            <div className="mt-6 flex items-end gap-2">
              {(
                [
                  ["p25", data.p25],
                  ["p50", data.p50],
                  ["p75", data.p75],
                ] as const
              ).map(([label, value]) => (
                <div key={label} className="flex-1">
                  <div
                    className="w-full bg-graphite"
                    style={{
                      height: `${Math.max(8, (value / (data.p75 * 1.4)) * 120)}px`,
                    }}
                  />
                  <p className="font-data mt-2 text-sm text-ink">
                    {value.toLocaleString()}
                  </p>
                  <p className="label-caps">{label}</p>
                </div>
              ))}
            </div>
            {data.userValue !== null ? (
              <p className="mt-6 font-data text-ink">
                You: {data.userValue.toLocaleString()}
                {data.percentileRank !== null
                  ? ` · ~${data.percentileRank}th percentile`
                  : ""}
              </p>
            ) : (
              <p className="mt-6 text-sm text-ink-muted">
                Enter {data.metricKey} to mark your position.
              </p>
            )}
          </div>

          <div>
            <p className="label-caps mb-3">How to improve</p>
            <ul className="space-y-2">
              {data.improve.map((a) => (
                <li key={a.href}>
                  <a
                    href={a.href}
                    className="block border border-rule px-3 py-2 text-sm text-ink hover:border-rule-strong"
                  >
                    {a.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    </div>
  );
}
