"use client";

import { useState } from "react";

import { EmptyState, PageFrame, StatusLine } from "@/components/shell/PageFrame";
import { BUYER_FAQ } from "@/lib/reports/buyerFaq";
import { frameworkLabel } from "@/lib/ui/displayLabels";

type ReportRow = {
  id: string;
  version: number;
  status: string;
  framework: string;
  shareToken: string | null;
  publishedAt: string | null;
  scores?: { overall?: number | null } | null;
  viewCount: number;
};

type Framework = "CSRD_SIMPLIFIED" | "BRSR";

export function ReportsClient({
  initial,
  canPublish = true,
}: {
  initial: ReportRow[];
  canPublish?: boolean;
}) {
  const [rows, setRows] = useState(initial);
  const [status, setStatus] = useState<string | null>(null);
  const [statusTone, setStatusTone] = useState<"neutral" | "error" | "ok">("neutral");
  const [diff, setDiff] = useState<Array<{ path: string; from: string; to: string }>>([]);
  const [pending, setPending] = useState<Framework | null>(null);
  const [busy, setBusy] = useState(false);

  async function refresh() {
    const res = await fetch("/api/app/reports");
    if (!res.ok) return;
    const data = (await res.json()) as { reports: ReportRow[] };
    setRows(data.reports);
  }

  function requestPublish(framework: Framework) {
    if (!canPublish) {
      setStatusTone("error");
      setStatus("Publishing requires an admin or owner. Ask a teammate with that role.");
      return;
    }
    setPending(framework);
    setStatusTone("neutral");
    setStatus(
      framework === "BRSR"
        ? "Confirm BRSR-readiness publish. This snapshots current data as a readiness view — not a complete BRSR principle mapping."
        : "Confirm CSRD (simplified) publish. This creates an immutable snapshot of scores, emissions, materiality, evidence, and factor versions.",
    );
  }

  async function confirmPublish() {
    if (!pending || busy) return;
    const framework = pending;
    setBusy(true);
    setStatusTone("neutral");
    setStatus("Publishing…");
    try {
      const res = await fetch("/api/app/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ framework, shareDays: 90 }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        shareUrl?: string;
        version?: number;
        diff?: Array<{ path: string; from: string; to: string }>;
      };
      if (!res.ok) {
        const raw = data.error ?? "Publish failed";
        setStatusTone("error");
        setStatus(
          raw === "Forbidden"
            ? "You do not have permission to publish. Ask an admin or owner."
            : raw,
        );
        return;
      }
      setDiff(data.diff ?? []);
      setPending(null);
      setStatusTone("ok");
      if (data.shareUrl) {
        try {
          await navigator.clipboard.writeText(data.shareUrl);
        } catch {
          /* ignore */
        }
        setStatus(
          `Published v${data.version}. Living report link copied. Next: share it with your buyer or bank.`,
        );
        try {
          window.localStorage.setItem("clearesg-first-share", "1");
        } catch {
          /* ignore */
        }
      } else {
        setStatus(`Published v${data.version}`);
      }
      await refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <PageFrame
      eyebrow="Reports"
      title="Publish"
      help="Publishing snapshots scores, emissions, materiality, evidence, and factor versions. Published versions are immutable. ClearESG is not an assurance provider."
      actions={
        canPublish ? (
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={busy}
              onClick={() => requestPublish("CSRD_SIMPLIFIED")}
              className="border border-rule bg-surface-1 px-3 py-2 text-sm text-ink hover:border-rule-strong disabled:opacity-40"
            >
              Publish CSRD (simplified)
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => requestPublish("BRSR")}
              className="border border-rule px-3 py-2 text-sm text-ink-muted hover:border-rule-strong hover:text-ink disabled:opacity-40"
            >
              Publish BRSR-readiness
            </button>
          </div>
        ) : (
          <p className="text-sm text-ink-muted">View only — ask an admin to publish</p>
        )
      }
      rail={
        <div className="space-y-6 text-sm text-ink-muted">
          <div>
            <p className="label-caps text-ink">Narrative starter</p>
            <p className="mt-2">
              In this period we measured our material emissions and linked source evidence
              where available. Scope totals update when datapoints change. Replace this
              with your board wording before external use.
            </p>
            <p className="mt-2">
              Electricity and fuels drive most of our operational footprint; supplier data
              closes Scope 3 gaps as responses arrive.
            </p>
            <p className="mt-2">
              This living report is the source of truth for buyers and lenders until the
              next publish.
            </p>
          </div>
          <div>
            <p className="label-caps text-ink">Frameworks</p>
            <p className="mt-2">
              CSRD (simplified) is the primary publish path. BRSR-readiness labels the
              same snapshot for India beachhead prep — principle-level BRSR mappings are
              not complete yet.
            </p>
          </div>
          <div>
            <p className="label-caps text-ink">For banks &amp; buyers</p>
            <ul className="mt-2 space-y-2">
              {BUYER_FAQ.slice(0, 2).map((f) => (
                <li key={f.q}>
                  <span className="text-ink">{f.q}</span>
                  <span className="mt-0.5 block text-xs">{f.a}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="label-caps text-ink">Assurance</p>
            <p className="mt-2">ClearESG does not provide assurance or audit opinions.</p>
          </div>
        </div>
      }
    >
      {status ? <StatusLine tone={statusTone}>{status}</StatusLine> : null}

      {pending ? (
        <div className="mt-4 border-t border-rule py-4">
          <p className="text-sm text-ink">
            {pending === "BRSR"
              ? "Publish BRSR-readiness snapshot?"
              : "Publish CSRD (simplified) snapshot?"}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              disabled={busy}
              onClick={() => void confirmPublish()}
              className="border border-rule bg-surface-1 px-3 py-2 text-sm text-ink hover:border-rule-strong disabled:opacity-40"
            >
              Confirm publish
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => {
                setPending(null);
                setStatus(null);
              }}
              className="border border-rule px-3 py-2 text-sm text-ink-muted hover:border-rule-strong hover:text-ink"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : null}

      {diff.length > 0 ? (
        <div className="mt-6 border-t border-rule pt-4">
          <p className="label-caps mb-2">Diff vs previous version</p>
          <ul className="space-y-1 font-data text-sm text-ink-muted">
            {diff.map((d) => (
              <li key={d.path}>
                {d.path}: {d.from} → {d.to}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {rows.length === 0 ? (
        <EmptyState
          title="No published reports yet"
          body="Publish a CSRD (simplified) or BRSR-readiness snapshot when your period data is ready."
        />
      ) : (
        <div className="mt-6 overflow-x-auto border-t border-rule">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-rule text-ink-muted">
              <tr>
                <th className="px-3 py-2 font-normal">Version</th>
                <th className="px-3 py-2 font-normal">Framework</th>
                <th className="px-3 py-2 font-normal">Score</th>
                <th className="px-3 py-2 font-normal">Views</th>
                <th className="px-3 py-2 font-normal">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b border-rule/60">
                  <td className="px-3 py-3 font-data text-ink">v{r.version}</td>
                  <td className="px-3 py-3 text-ink-muted">
                    {frameworkLabel(r.framework)}
                  </td>
                  <td className="px-3 py-3 font-data text-ink">
                    {r.scores?.overall ?? "—"}
                  </td>
                  <td className="px-3 py-3 font-data text-ink-muted">{r.viewCount}</td>
                  <td className="px-3 py-3">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                      {r.shareToken ? (
                        <a
                          className="text-signal underline-offset-2 hover:underline"
                          href={`/r/${r.shareToken}`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Open live report
                        </a>
                      ) : null}
                      <a
                        className="text-ink underline-offset-2 hover:underline"
                        href={`/api/app/reports/${r.id}/pdf`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        PDF
                      </a>
                      <span className="text-xs text-ink-muted">
                        <a
                          className="underline-offset-2 hover:underline"
                          href={`/api/app/reports/${r.id}/export?format=json`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          JSON
                        </a>
                        <span aria-hidden="true"> · </span>
                        <a
                          className="underline-offset-2 hover:underline"
                          href={`/api/app/reports/${r.id}/export?format=csv`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          CSV
                        </a>
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </PageFrame>
  );
}
