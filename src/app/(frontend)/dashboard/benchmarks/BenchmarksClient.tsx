"use client";

import { useState } from "react";

import { EmptyState, PageFrame, StatusLine } from "@/components/shell/PageFrame";
import type { MembershipRole } from "@/lib/access/membership";
import { sectorLabel } from "@/lib/ui/displayLabels";

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

function emptyBenchmarkBody(
  data: Extract<BenchmarkPayload, { available: false }>,
): string {
  if (data.reason === "Forbidden") {
    return "This cohort is not available for your organisation yet.";
  }
  return `Not enough organisations in your sector yet for a private comparison. We need at least ${data.minCohortSize} peers before percentiles appear.`;
}

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
  const showRecompute = canRecompute || role === null;

  async function recompute() {
    setStatusTone("neutral");
    setStatus("Updating sector comparison…");
    const res = await fetch("/api/app/benchmarks/recompute", { method: "POST" });
    const body = (await res.json().catch(() => ({}))) as {
      error?: string;
      written?: number;
    };
    if (!res.ok) {
      const raw = body.error ?? "Could not update cohorts";
      setStatusTone("error");
      setStatus(
        raw === "Forbidden"
          ? "Updating cohorts requires an admin or owner. Ask a teammate with that role."
          : raw,
      );
      return;
    }
    const get = await fetch("/api/app/benchmarks?metricKey=electricity_kwh");
    const next = (await get.json()) as BenchmarkPayload;
    setData(next);
    setStatusTone("ok");
    setStatus(
      body.written && body.written > 0
        ? `Updated ${body.written} cohort(s)`
        : "No new cohorts yet — more organisations need published electricity data",
    );
  }

  return (
    <PageFrame
      eyebrow="Benchmarking"
      title="Sector position"
      help="Comparisons stay private until at least eight organisations share a sector cohort."
      actions={
        showRecompute ? (
          <button
            type="button"
            onClick={() => void recompute()}
            className={`border border-rule px-3 py-2 text-sm ${
              !data.available
                ? "text-ink-muted/70 hover:border-rule hover:text-ink-muted"
                : "text-ink-muted hover:border-rule-strong hover:text-ink"
            }`}
          >
            {!data.available ? "Check for new peers" : "Refresh cohorts"}
          </button>
        ) : role !== null ? (
          <p className="text-sm text-ink-muted">Cohort refresh is admin-only</p>
        ) : null
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
        <EmptyState title="No cohort available" body={emptyBenchmarkBody(data)} />
      ) : (
        <>
          <div className="mt-4 border-t border-rule pt-4">
            <p className="label-caps">
              {data.metricKey} · {sectorLabel(data.sector)} · {data.cohortSize}{" "}
              organisations
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
