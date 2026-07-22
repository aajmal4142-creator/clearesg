"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { ApprovalChip } from "@/components/governance/ApprovalChip";
import { PageFrame, StatusLine } from "@/components/shell/PageFrame";
import { Button } from "@/components/ui/button";
import { Metric } from "@/components/ui/metric";
import {
  DATA_METRICS,
  IMPORT_COLUMNS,
  QUALITY_VALUES,
  previewTco2e,
  type DiffRow,
  type ImportColumn,
} from "@/lib/data";
import { suggestMetricFromFilename } from "@/lib/data/suggestMetric";
import type { FactorRecord, Quality } from "@/lib/calc";
import { DERIVED_METRICS } from "@/lib/derive/registry";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export type DataRowState = {
  metricKey: string;
  value: number | null;
  quality: Quality;
  unit: string | null;
  approvalState: string;
  evidenceCount: number;
  assignedTo: string | null;
};

type Teammate = { id: string; email: string; name: string };

type Mode = "enter" | "spreadsheet";

export function DataWorkspace({
  initialRows,
  periodLocked,
  factors,
  region,
  year,
  canWrite,
}: {
  initialRows: DataRowState[];
  periodLocked: boolean;
  factors: FactorRecord[];
  region: string;
  year: number;
  canWrite: boolean;
}) {
  const [mode, setMode] = useState<Mode>("enter");
  const [rows, setRows] = useState<DataRowState[]>(() => {
    const byKey = new Map(initialRows.map((r) => [r.metricKey, r]));
    return DATA_METRICS.map((m) => {
      const existing = byKey.get(m.key);
      return (
        existing ?? {
          metricKey: m.key,
          value: null,
          quality: "missing" as Quality,
          unit: m.unit,
          approvalState: "pending",
          evidenceCount: 0,
          assignedTo: null,
        }
      );
    });
  });
  const [status, setStatus] = useState<string | null>(null);
  const [statusTone, setStatusTone] = useState<"neutral" | "error" | "ok">("neutral");
  const [teammates, setTeammates] = useState<Teammate[]>([]);
  const [diff, setDiff] = useState<DiffRow[] | null>(null);
  const [columns, setColumns] = useState<ImportColumn[]>([
    "metricKey",
    "label",
    "value",
    "unit",
    "quality",
  ]);
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [focusIndex, setFocusIndex] = useState(0);

  useEffect(() => {
    void fetch("/api/app/teammates")
      .then((r) => r.json())
      .then((d: { teammates?: Teammate[] }) => setTeammates(d.teammates ?? []))
      .catch(() => undefined);
  }, []);

  const derivedKeys = useMemo(() => new Set(DERIVED_METRICS.map((d) => d.key)), []);

  const saveRow = useCallback(
    async (row: DataRowState) => {
      if (!canWrite || periodLocked) {
        setStatusTone("error");
        setStatus(
          periodLocked
            ? "Reporting period is locked or published. Writes are refused."
            : "You do not have permission to write datapoints.",
        );
        return;
      }
      setSavingKey(row.metricKey);
      setStatus(null);
      const res = await fetch("/api/datapoints", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          metricKey: row.metricKey,
          value: row.quality === "missing" ? null : row.value,
          quality: row.quality,
          unit: row.unit,
          assignedTo: row.assignedTo,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        approvalReset?: boolean;
      };
      setSavingKey(null);
      if (!res.ok) {
        setStatusTone("error");
        setStatus(data.error ?? "Save failed");
        return;
      }
      if (data.approvalReset) {
        setRows((prev) =>
          prev.map((r) =>
            r.metricKey === row.metricKey ? { ...r, approvalState: "pending" } : r,
          ),
        );
        setStatusTone("neutral");
        setStatus("Saved. Approval reset to pending — re-validation required.");
      } else {
        setStatusTone("ok");
        setStatus(`Saved ${row.metricKey}`);
      }
    },
    [canWrite, periodLocked],
  );

  function updateRow(metricKey: string, patch: Partial<DataRowState>) {
    setRows((prev) =>
      prev.map((r) => (r.metricKey === metricKey ? { ...r, ...patch } : r)),
    );
  }

  async function onEvidenceDrop(metricKey: string, files: FileList | null) {
    const file = files?.[0];
    if (!file || !canWrite || periodLocked) return;
    const tip = suggestMetricFromFilename(file.name);
    if (tip && tip.metricKey !== metricKey) {
      const ok = window.confirm(
        `This file looks like “${tip.label}”. Attach to ${metricKey} anyway? Cancel to pick the suggested metric instead.`,
      );
      if (!ok) {
        setStatusTone("neutral");
        setStatus(
          `Suggested metric: ${tip.label} (${tip.metricKey}). Drop the file on that row.`,
        );
        return;
      }
    }
    const form = new FormData();
    form.set("file", file);
    form.set("metricKey", metricKey);
    const why = window.prompt(
      "Why does this document prove the figure? (optional note for auditors)",
      "",
    );
    if (why) form.set("whyNote", why);
    const res = await fetch("/api/evidence", { method: "POST", body: form });
    if (!res.ok) {
      setStatusTone("error");
      setStatus("Evidence upload failed");
      return;
    }
    updateRow(metricKey, {
      evidenceCount:
        (rows.find((r) => r.metricKey === metricKey)?.evidenceCount ?? 0) + 1,
    });
    setStatusTone("ok");
    setStatus(`Evidence attached to ${metricKey}`);
  }

  async function duplicatePriorStructure() {
    if (!canWrite || periodLocked) return;
    setStatusTone("neutral");
    setStatus("Duplicating prior period structure…");
    const res = await fetch("/api/app/periods/duplicate", { method: "POST" });
    const data = (await res.json().catch(() => ({}))) as {
      error?: string;
      created?: number;
    };
    if (!res.ok) {
      setStatusTone("error");
      setStatus(data.error ?? "Could not duplicate period structure");
      return;
    }
    setStatusTone("ok");
    setStatus(`Added ${data.created ?? 0} missing metric rows from the prior period.`);
    toast.message("Structure duplicated", {
      description: "Fill values in the new rows when you have the numbers.",
    });
    window.location.reload();
  }

  async function onPaste(e: React.ClipboardEvent, startKey: string) {
    const text = e.clipboardData.getData("text/plain");
    if (!text.includes("\n") && !text.includes("\t")) return;
    e.preventDefault();
    if (!canWrite || periodLocked) {
      setStatusTone("error");
      setStatus(
        periodLocked
          ? "Reporting period is locked. Paste refused."
          : "Viewers cannot paste datapoints.",
      );
      return;
    }

    const startIdx = rows.findIndex((r) => r.metricKey === startKey);
    const lines = text
      .trim()
      .split(/\r?\n/)
      .map((l) => l.split(/\t/)[0]?.trim() ?? "");
    const importRows = lines.map((val, i) => {
      const row = rows[startIdx + i];
      return {
        metricKey: row?.metricKey ?? "",
        value: val,
        unit: row?.unit ?? "",
        quality:
          row?.quality === "missing" && val ? "estimated" : (row?.quality ?? "estimated"),
      };
    });

    const res = await fetch("/api/app/data/import", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mode: "dry-run", rows: importRows, source: "paste" }),
    });
    const data = (await res.json()) as { rows?: DiffRow[]; error?: string };
    if (!res.ok) {
      setStatusTone("error");
      setStatus(data.error ?? "Paste validation failed");
      return;
    }
    setDiff(data.rows ?? []);
    setMode("spreadsheet");
    setStatusTone("neutral");
    setStatus("Paste dry-run ready — review and commit.");
  }

  async function runFileDryRun(file: File) {
    const form = new FormData();
    form.set("file", file);
    form.set("mode", "dry-run");
    const res = await fetch("/api/app/data/import", { method: "POST", body: form });
    const data = (await res.json()) as { rows?: DiffRow[]; error?: string };
    if (!res.ok) {
      setStatusTone("error");
      setStatus(data.error ?? "Import dry-run failed");
      return;
    }
    setDiff(data.rows ?? []);
    setStatusTone("neutral");
    setStatus("Dry-run complete — review before commit.");
  }

  async function commitDiff() {
    if (!diff) return;
    const rowsToCommit = diff
      .filter((r) => r.kind === "added" || r.kind === "changed")
      .map((r) => ({
        metricKey: r.metricKey,
        value: r.after?.value ?? null,
        unit: r.after?.unit ?? "",
        quality: r.after?.quality ?? "missing",
      }));
    const res = await fetch("/api/app/data/import", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mode: "commit", rows: rowsToCommit, source: "import" }),
    });
    const data = (await res.json()) as { error?: string; written?: number };
    if (!res.ok) {
      setStatusTone("error");
      setStatus(data.error ?? "Commit failed");
      return;
    }
    setStatusTone("ok");
    setStatus(`Committed ${data.written ?? 0} row(s). Reloading…`);
    window.location.reload();
  }

  function downloadTemplate(kind: "smart" | "blank") {
    const q = new URLSearchParams({
      kind,
      columns: columns.join(","),
    });
    window.location.href = `/api/app/data/import?${q.toString()}`;
  }

  return (
    <PageFrame
      eyebrow="Data collection"
      title="Enter figures"
      help="Interactive entry is the product. Spreadsheet import is an on-ramp — never the spine."
      wide
      actions={
        canWrite ? (
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              variant={mode === "enter" ? "default" : "outline"}
              onClick={() => setMode("enter")}
            >
              Enter here
            </Button>
            <Button
              type="button"
              size="sm"
              variant={mode === "spreadsheet" ? "default" : "outline"}
              onClick={() => setMode("spreadsheet")}
            >
              Use a spreadsheet
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={periodLocked}
              onClick={() => void duplicatePriorStructure()}
            >
              Duplicate prior structure
            </Button>
          </div>
        ) : (
          <p className="text-sm text-ink-muted">View only</p>
        )
      }
      rail={
        <div className="space-y-4 text-sm text-ink-muted">
          <p className="label-caps text-ink">Session</p>
          {periodLocked ? (
            <p className="text-rust">
              Period locked. Cells are read-only; server refuses writes.
            </p>
          ) : (
            <p>Open period — edits write through Membership checks.</p>
          )}
          <p className="label-caps text-ink">Derived</p>
          <ul className="space-y-1 text-xs">
            {DERIVED_METRICS.slice(0, 6).map((d) => (
              <li key={d.key} className="font-data">
                {d.key}
              </li>
            ))}
          </ul>
        </div>
      }
    >
      {status ? <StatusLine tone={statusTone}>{status}</StatusLine> : null}

      {mode === "spreadsheet" ? (
        <div className="space-y-6">
          <p className="text-sm text-ink-muted">
            Download a template, fill it offline, re-upload for a dry-run diff. Allowed
            quality values live on the Reference sheet — validation happens on upload, not
            via Excel dropdowns.
          </p>
          <fieldset className="space-y-2">
            <legend className="label-caps">Columns for smart template</legend>
            <div className="flex flex-wrap gap-2">
              {IMPORT_COLUMNS.map((c) => (
                <label key={c} className="flex items-center gap-1.5 text-xs text-ink">
                  <input
                    type="checkbox"
                    checked={columns.includes(c)}
                    onChange={(e) => {
                      setColumns((prev) =>
                        e.target.checked ? [...prev, c] : prev.filter((x) => x !== c),
                      );
                    }}
                  />
                  {c}
                </label>
              ))}
            </div>
          </fieldset>
          <div className="flex flex-wrap gap-2">
            <Button type="button" size="sm" onClick={() => downloadTemplate("smart")}>
              Download smart template
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => downloadTemplate("blank")}
            >
              Download blank template
            </Button>
          </div>
          <label className="block text-sm">
            <span className="label-caps">Upload xlsx or csv</span>
            <input
              type="file"
              accept=".xlsx,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv"
              className="mt-2 block text-sm text-ink-muted"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) void runFileDryRun(f);
              }}
            />
          </label>
          {diff ? (
            <div className="border-t border-rule pt-4">
              <p className="label-caps mb-3">Dry-run diff</p>
              <ul className="max-h-80 overflow-y-auto text-sm">
                {diff.map((r, i) => (
                  <li
                    key={`${r.metricKey}-${i}`}
                    className={cn(
                      "border-b border-rule py-2 font-data text-xs",
                      r.kind === "rejected" && "text-rust",
                      r.kind === "added" && "text-signal",
                      r.kind === "changed" && "text-amber",
                    )}
                  >
                    <span className="uppercase">{r.kind}</span> · {r.metricKey}
                    {r.reason ? ` — ${r.reason}` : null}
                    {r.after ? ` → ${r.after.value ?? "∅"} (${r.after.quality})` : null}
                  </li>
                ))}
              </ul>
              <Button
                type="button"
                className="mt-4"
                size="sm"
                disabled={!canWrite || periodLocked}
                onClick={() => void commitDiff()}
              >
                Commit accepted rows
              </Button>
            </div>
          ) : null}
        </div>
      ) : (
        <div
          className="overflow-x-auto border-t border-rule"
          tabIndex={0}
          role="grid"
          aria-label="Datapoints"
          onKeyDown={(e) => {
            if (mode !== "enter") return;
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setFocusIndex((i) => Math.min(rows.length - 1, i + 1));
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              setFocusIndex((i) => Math.max(0, i - 1));
            } else if (e.key === "Escape") {
              (document.activeElement as HTMLElement | null)?.blur?.();
            }
          }}
        >
          <p className="py-2 text-[11px] text-ink-muted">
            Keyboard: ↑↓ move · Enter focuses value · Esc blurs
          </p>
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-rule text-xs text-ink-muted">
                <th className="py-2 pr-2 font-medium">Metric</th>
                <th className="py-2 pr-2 font-medium">Value</th>
                <th className="py-2 pr-2 font-medium">tCO₂e</th>
                <th className="py-2 pr-2 font-medium">Quality</th>
                <th className="py-2 pr-2 font-medium">Evidence</th>
                <th className="py-2 pr-2 font-medium">Owner</th>
                <th className="py-2 font-medium">State</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, idx) => {
                const def = DATA_METRICS.find((m) => m.key === row.metricKey)!;
                const locked =
                  periodLocked || !canWrite || derivedKeys.has(row.metricKey);
                const tco2e = previewTco2e({
                  metricKey: row.metricKey,
                  value: row.value,
                  factors,
                  region,
                  year,
                });
                return (
                  <tr
                    key={row.metricKey}
                    id={row.metricKey}
                    className={cn(
                      "border-b border-rule",
                      idx % 2 === 1 && "bg-surface-2/60",
                      locked && "opacity-70",
                      focusIndex === idx && "outline outline-1 outline-accent",
                    )}
                    onClick={() => setFocusIndex(idx)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      if (!locked)
                        void onEvidenceDrop(row.metricKey, e.dataTransfer.files);
                    }}
                  >
                    <td className="py-2 pr-2">
                      <p className="text-ink">{def.label}</p>
                      <p className="font-data text-[10px] text-ink-muted">
                        {row.metricKey}
                        {def.unit ? ` · ${def.unit}` : null}
                        {locked && periodLocked ? " · locked" : null}
                      </p>
                    </td>
                    <td className="py-2 pr-2">
                      {def.inputType === "boolean" ? (
                        <button
                          type="button"
                          disabled={locked}
                          className={cn(
                            "rounded-[4px] border border-rule px-2 py-1 text-xs",
                            row.value === 1
                              ? "bg-accent text-primary-foreground"
                              : "bg-surface-1",
                          )}
                          onClick={() => {
                            const next = row.value === 1 ? 0 : 1;
                            const nextRow = {
                              ...row,
                              value: next,
                              quality: "measured" as Quality,
                            };
                            updateRow(row.metricKey, nextRow);
                            void saveRow(nextRow);
                          }}
                        >
                          {row.value === 1 ? "Yes" : "No"}
                        </button>
                      ) : (
                        <input
                          type="text"
                          inputMode="decimal"
                          disabled={locked}
                          className="w-28 border border-rule bg-surface-1 px-2 py-1 font-data text-ink tabular-nums disabled:cursor-not-allowed"
                          value={row.value ?? ""}
                          aria-label={def.label}
                          onPaste={(e) => void onPaste(e, row.metricKey)}
                          onChange={(e) => {
                            const raw = e.target.value.trim();
                            const n = raw === "" ? null : Number(raw);
                            updateRow(row.metricKey, {
                              value:
                                Number.isFinite(n as number) || n === null
                                  ? n
                                  : row.value,
                              quality:
                                raw === ""
                                  ? "missing"
                                  : row.quality === "missing"
                                    ? "estimated"
                                    : row.quality,
                            });
                          }}
                          onBlur={() => {
                            const current = rows.find(
                              (r) => r.metricKey === row.metricKey,
                            );
                            if (current) void saveRow(current);
                          }}
                        />
                      )}
                      {savingKey === row.metricKey ? (
                        <span className="ml-1 text-[10px] text-ink-muted">…</span>
                      ) : null}
                    </td>
                    <td className="py-2 pr-2 font-data text-xs text-ink-muted">
                      {tco2e != null ? (
                        <Metric value={tco2e} size="sm" decimals={3} inView={false} />
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="py-2 pr-2">
                      <div
                        role="group"
                        aria-label="Quality"
                        className="inline-flex flex-wrap gap-0.5"
                      >
                        {QUALITY_VALUES.map((q) => (
                          <button
                            key={q}
                            type="button"
                            disabled={locked}
                            className={cn(
                              "rounded-[2px] px-1.5 py-0.5 text-[10px] uppercase tracking-wide",
                              row.quality === q
                                ? "bg-accent text-primary-foreground"
                                : "bg-surface-1 text-ink-muted hover:text-ink",
                            )}
                            onClick={() => {
                              const next = {
                                ...row,
                                quality: q,
                                value: q === "missing" ? null : row.value,
                              };
                              updateRow(row.metricKey, next);
                              void saveRow(next);
                            }}
                          >
                            {q.slice(0, 3)}
                          </button>
                        ))}
                      </div>
                    </td>
                    <td className="py-2 pr-2">
                      <label className="inline-flex cursor-pointer items-center gap-1 text-xs">
                        <span
                          className={cn(
                            "rounded-[2px] border px-1.5 py-0.5 font-data text-[10px] uppercase",
                            row.evidenceCount > 0
                              ? "border-signal text-signal"
                              : "border-amber text-amber",
                          )}
                          title={
                            row.evidenceCount > 0
                              ? "Evidence attached — drop another file to add"
                              : "Bare — drop a bill onto this row"
                          }
                        >
                          {row.evidenceCount > 0 ? "evidenced" : "bare"}
                        </span>
                        {!locked ? (
                          <input
                            type="file"
                            className="sr-only"
                            onChange={(e) =>
                              void onEvidenceDrop(row.metricKey, e.target.files)
                            }
                          />
                        ) : null}
                      </label>
                    </td>
                    <td className="py-2 pr-2">
                      <select
                        disabled={locked || teammates.length === 0}
                        className="max-w-[9rem] border border-rule bg-surface-1 px-1 py-1 text-xs"
                        value={row.assignedTo ?? ""}
                        onChange={(e) => {
                          const assignedTo = e.target.value || null;
                          const next = { ...row, assignedTo };
                          updateRow(row.metricKey, next);
                          void saveRow(next);
                        }}
                      >
                        <option value="">Unassigned</option>
                        {teammates.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.name || t.email || t.id}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="py-2">
                      <ApprovalChip state={row.approvalState} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </PageFrame>
  );
}
