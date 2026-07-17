"use client";

import { useState } from "react";

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

export function ReportsClient({ initial }: { initial: ReportRow[] }) {
  const [rows, setRows] = useState(initial);
  const [status, setStatus] = useState<string | null>(null);
  const [diff, setDiff] = useState<Array<{ path: string; from: string; to: string }>>([]);

  async function refresh() {
    const res = await fetch("/api/app/reports");
    if (!res.ok) return;
    const data = (await res.json()) as { reports: ReportRow[] };
    setRows(data.reports);
  }

  async function publish(framework: "CSRD_SIMPLIFIED" | "BRSR") {
    setStatus("Publishing…");
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
      setStatus(data.error ?? "Publish failed");
      return;
    }
    setDiff(data.diff ?? []);
    if (data.shareUrl) {
      try {
        await navigator.clipboard.writeText(data.shareUrl);
      } catch {
        /* ignore */
      }
      setStatus(`Published v${data.version}. Living report link copied.`);
    } else {
      setStatus(`Published v${data.version}`);
    }
    await refresh();
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8 px-6 py-12">
      <div>
        <p className="label-caps">Reports</p>
        <h1 className="font-display mt-2 text-3xl text-bone">Publish</h1>
        <p className="mt-2 max-w-xl text-ash">
          Publishing snapshots scores, emissions, materiality, evidence, and factor
          versions. Published versions are immutable. ClearESG is not an assurance
          provider.
        </p>
        {status ? <p className="mt-3 text-sm text-ash">{status}</p> : null}
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => void publish("CSRD_SIMPLIFIED")}
          className="border border-graphite bg-slate px-3 py-2 text-sm text-bone hover:border-ash"
        >
          Publish CSRD (simplified)
        </button>
        <button
          type="button"
          onClick={() => void publish("BRSR")}
          className="border border-graphite px-3 py-2 text-sm text-ash hover:border-ash hover:text-bone"
        >
          Publish BRSR
        </button>
      </div>

      {diff.length > 0 ? (
        <div className="border border-graphite p-4">
          <p className="label-caps mb-2">Diff vs previous version</p>
          <ul className="space-y-1 font-data text-sm text-ash">
            {diff.map((d) => (
              <li key={d.path}>
                {d.path}: {d.from} → {d.to}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {rows.length === 0 ? (
        <p className="text-ash">No published reports yet.</p>
      ) : (
        <div className="overflow-x-auto border border-graphite">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-graphite text-ash">
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
                <tr key={r.id} className="border-b border-graphite/60">
                  <td className="px-3 py-3 font-data text-bone">v{r.version}</td>
                  <td className="px-3 py-3 text-ash">{r.framework}</td>
                  <td className="px-3 py-3 font-data text-bone">
                    {r.scores?.overall ?? "—"}
                  </td>
                  <td className="px-3 py-3 font-data text-ash">{r.viewCount}</td>
                  <td className="px-3 py-3">
                    <div className="flex flex-wrap gap-3">
                      <a
                        className="text-bone underline-offset-2 hover:underline"
                        href={`/api/app/reports/${r.id}/pdf`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        PDF
                      </a>
                      <a
                        className="text-ash underline-offset-2 hover:underline"
                        href={`/api/app/reports/${r.id}/export?format=json`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        JSON
                      </a>
                      <a
                        className="text-ash underline-offset-2 hover:underline"
                        href={`/api/app/reports/${r.id}/export?format=csv`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        CSV
                      </a>
                      {r.shareToken ? (
                        <a
                          className="text-signal underline-offset-2 hover:underline"
                          href={`/r/${r.shareToken}`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Living
                        </a>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
