"use client";

import { useState } from "react";

import { EmptyState, PageFrame, StatusLine } from "@/components/shell/PageFrame";
import type { MembershipRole } from "@/lib/access/membership";

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

export function BenchmarksClient({
  initial,
  role = null,
}: {
  initial: BenchmarkPayload;
  role?: MembershipRole | null;
}) {
  const [data, setData] = useState(initial);
  const [status, setStatus] = useState<string | null>(null);
  const [statusTone, setStatusTone] = useState<"neutral" | "error" | "ok">("neutral");
  const canRecompute = role === "owner" || role === "admin";

  async function recompute() {
    setStatusTone("neutral");
    setStatus("Recomputing…");
    const res = await fetch("/api/app/benchmarks/recompute", { method: "POST" });
    const body = (await res.json().catch(() => ({}))) as {
      error?: string;
      written?: number;
    };
    if (!res.ok) {
      const raw = body.error ?? "Recompute failed";
      setStatusTone("error");
      setStatus(
        raw === "Forbidden"
          ? "Recompute requires an admin or owner. Ask a teammate with that role."
          : raw,
      );
      return;
    }
    const get = await fetch("/api/app/benchmarks?metricKey=electricity_kwh");
    const next = (await get.json()) as BenchmarkPayload;
    setData(next);
    setStatusTone("ok");
    setStatus(`Wrote ${body.written ?? 0} cohort(s)`);
  }

  return (
    <PageFrame
      eyebrow="Benchmarking"
      title="Sector position"
      help="Cohorts with fewer than 8 organisations are never shown."
      actions={
        canRecompute ? (
          <button
            type="button"
            onClick={() => void recompute()}
            className="border border-rule px-3 py-2 text-sm text-ink-muted hover:border-rule-strong hover:text-ink"
          >
            Recompute cohorts
          </button>
        ) : role !== null ? (
          <p className="text-sm text-ink-muted">Recompute is admin-only</p>
        ) : (
          <button
            type="button"
            onClick={() => void recompute()}
            className="border border-rule px-3 py-2 text-sm text-ink-muted hover:border-rule-strong hover:text-ink"
          >
            Recompute cohorts
          </button>
        )
      }
      rail={
        <div className="space-y-3 text-sm text-ink-muted">
          <p className="label-caps text-ink">Privacy</p>
          <p>
            Opted-out organisations are excluded. Small cohorts never surface percentiles.
          </p>
        </div>
      }
    >
      {status ? <StatusLine tone={statusTone}>{status}</StatusLine> : null}

      {!data.available ? (
        <EmptyState
          title="No cohort available"
          body={
            data.reason === "Forbidden"
              ? "This cohort is not available for your organisation yet."
              : data.reason
          }
        />
      ) : (
        <>
          <div className="mt-4 border-t border-rule pt-4">
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
                    className="w-full bg-surface-2"
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

          <div className="mt-8 border-t border-rule pt-4">
            <p className="label-caps mb-3">How to improve</p>
            <ul className="space-y-2">
              {data.improve.map((a) => (
                <li key={a.href}>
                  <a
                    href={a.href}
                    className="block border-b border-rule px-0 py-2 text-sm text-ink hover:text-accent"
                  >
                    {a.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    </PageFrame>
  );
}
