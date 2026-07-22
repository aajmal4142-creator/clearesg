"use client";

import { useState } from "react";

import { EmptyState, PageFrame, StatusLine } from "@/components/shell/PageFrame";
import { Button } from "@/components/ui/button";
import { Metric } from "@/components/ui/metric";
import { qualityLabel } from "@/lib/ui/displayLabels";

type FieldRow = {
  fieldId: string;
  label: string;
  metricKey: string;
  value: number | null;
  unit: string | null;
  quality: string;
  approvalState: string | null;
  status: string;
};

type ExportPayload = {
  questionnaireId: string;
  name: string;
  organisation: string;
  responses: FieldRow[];
  note?: string;
};

export default function QuestionnairesPage() {
  const [payload, setPayload] = useState<ExportPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function generate() {
    setBusy(true);
    setError(null);
    const res = await fetch("/api/app/questionnaires/respond", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ questionnaireId: "ecovadis-lite" }),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) {
      setError(
        typeof data === "object" && data && "error" in data
          ? String((data as { error: string }).error)
          : "Export failed. Finish onboarding or switch organisation.",
      );
      setPayload(null);
      return;
    }
    setPayload(data as ExportPayload);
  }

  function downloadJson() {
    if (!payload) return;
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `clearesg-${payload.questionnaireId}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const mapped = payload?.responses.filter((r) => r.status === "mapped").length ?? 0;
  const total = payload?.responses.length ?? 0;

  return (
    <PageFrame
      eyebrow="Inbound questionnaire"
      title="Buyer questionnaire response"
      help="Fills a buyer questionnaire (EcoVadis-lite) from the metrics you already entered. Same numbers every time — no AI. This is a response pack, not a filing."
      actions={
        <Button type="button" size="sm" disabled={busy} onClick={() => void generate()}>
          {busy ? "Generating…" : "Generate evidenced export"}
        </Button>
      }
      rail={
        <div className="text-sm text-ink-muted">
          <p className="label-caps text-ink">Coverage</p>
          {payload ? (
            <p className="mt-2 font-data text-2xl text-ink">
              <Metric
                value={mapped}
                size="lg"
                decimals={0}
                className="inline"
                inView={false}
              />
              <span className="text-ink-muted"> / {total}</span>
            </p>
          ) : (
            <p className="mt-2">Generate to see mapped fields.</p>
          )}
          {payload ? (
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="mt-4"
              onClick={downloadJson}
            >
              Download JSON
            </Button>
          ) : null}
        </div>
      }
    >
      {error ? <StatusLine tone="error">{error}</StatusLine> : null}

      {!payload && !error ? (
        <EmptyState
          title="No export yet"
          body="Generate a downloadable response from your current period data. Fields we cannot map stay blank — we never invent zeros."
        />
      ) : null}

      {payload ? (
        <div className="overflow-x-auto border-t border-rule">
          <p className="py-3 text-sm text-ink-muted">{payload.note}</p>
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-rule text-xs text-ink-muted">
                <th className="py-2 pr-2">Field</th>
                <th className="py-2 pr-2">Metric</th>
                <th className="py-2 pr-2">Value</th>
                <th className="py-2 pr-2">Quality</th>
                <th className="py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {payload.responses.map((r, i) => (
                <tr
                  key={r.fieldId}
                  className={
                    i % 2 === 1
                      ? "border-b border-rule bg-surface-2/60"
                      : "border-b border-rule"
                  }
                >
                  <td className="py-2 pr-2 text-ink">{r.label}</td>
                  <td className="py-2 pr-2 font-data text-xs text-ink-muted">
                    {r.metricKey}
                  </td>
                  <td className="py-2 pr-2 font-data">
                    {r.value == null ? "—" : r.value}
                    {r.unit ? ` ${r.unit}` : ""}
                  </td>
                  <td className="py-2 pr-2 text-xs">{qualityLabel(r.quality)}</td>
                  <td className="py-2 text-xs">{r.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </PageFrame>
  );
}
