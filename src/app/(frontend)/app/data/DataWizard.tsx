"use client";

import { useMemo, useState } from "react";

import { DERIVED_METRICS } from "@/lib/derive/registry";

type Metric = {
  key: string;
  label: string;
  unit: string | null;
  category: "E" | "S" | "G";
  inputType: "number" | "boolean";
};

const METRICS: Metric[] = [
  {
    key: "electricity_kwh",
    label: "Electricity consumed",
    unit: "kWh",
    category: "E",
    inputType: "number",
  },
  {
    key: "electricity_renewable_pct",
    label: "Renewable share of electricity",
    unit: "%",
    category: "E",
    inputType: "number",
  },
  {
    key: "diesel_litres",
    label: "Diesel consumed",
    unit: "L",
    category: "E",
    inputType: "number",
  },
  {
    key: "natural_gas_m3",
    label: "Natural gas consumed",
    unit: "m³",
    category: "E",
    inputType: "number",
  },
  {
    key: "petrol_litres",
    label: "Petrol consumed",
    unit: "L",
    category: "E",
    inputType: "number",
  },
  {
    key: "district_heat_kwh",
    label: "District heating or cooling",
    unit: "kWh",
    category: "E",
    inputType: "number",
  },
  {
    key: "supplier_spend_total",
    label: "Total supplier spend",
    unit: "currency",
    category: "E",
    inputType: "number",
  },
  {
    key: "business_travel_km",
    label: "Business travel distance",
    unit: "km",
    category: "E",
    inputType: "number",
  },
  {
    key: "employees_total",
    label: "Total employees",
    unit: "FTE",
    category: "S",
    inputType: "number",
  },
  {
    key: "employees_women",
    label: "Women employees",
    unit: "FTE",
    category: "S",
    inputType: "number",
  },
  {
    key: "injuries_recordable",
    label: "Recordable injuries",
    unit: "count",
    category: "S",
    inputType: "number",
  },
  {
    key: "hours_worked_total",
    label: "Total hours worked",
    unit: "hours",
    category: "S",
    inputType: "number",
  },
  {
    key: "training_hours_total",
    label: "Training hours",
    unit: "hours",
    category: "S",
    inputType: "number",
  },
  {
    key: "board_size",
    label: "Board members",
    unit: "count",
    category: "G",
    inputType: "number",
  },
  {
    key: "board_independent",
    label: "Independent directors",
    unit: "count",
    category: "G",
    inputType: "number",
  },
  {
    key: "policy_anti_corruption",
    label: "Anti-corruption policy",
    unit: null,
    category: "G",
    inputType: "boolean",
  },
  {
    key: "policy_whistleblower",
    label: "Whistleblower channel",
    unit: null,
    category: "G",
    inputType: "boolean",
  },
  {
    key: "policy_data_privacy",
    label: "Data privacy policy",
    unit: null,
    category: "G",
    inputType: "boolean",
  },
];

function mappingNote(metricKey: string): string {
  const derived = DERIVED_METRICS.filter(
    (d) =>
      d.key.includes("energy") &&
      (metricKey.includes("electricity") ||
        metricKey.includes("diesel") ||
        metricKey.includes("petrol") ||
        metricKey.includes("gas") ||
        metricKey.includes("district")),
  );
  if (derived.length === 0) {
    return "No ESRS mapping on this raw input. Framework views attach after calculation where defined.";
  }
  const refs = derived
    .flatMap((d) =>
      d.frameworkMappings.filter((m) => m.approved).map((m) => m.datapointRef),
    )
    .filter((v, i, a) => a.indexOf(v) === i);
  return `Raw input — ESRS mapping applies after derivation (${refs.join(", ") || "E1-5"}).`;
}

export function DataWizard({
  initial,
}: {
  initial: Record<string, { value: number | null; quality: string }>;
}) {
  const [rows, setRows] = useState(initial);
  const [status, setStatus] = useState<string | null>(null);
  const [csvPreview, setCsvPreview] = useState<string[][] | null>(null);

  const grouped = useMemo(() => {
    return {
      E: METRICS.filter((m) => m.category === "E"),
      S: METRICS.filter((m) => m.category === "S"),
      G: METRICS.filter((m) => m.category === "G"),
    };
  }, []);

  async function save(metricKey: string) {
    const row = rows[metricKey];
    setStatus(`Saving ${metricKey}…`);
    const res = await fetch("/api/datapoints", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        metricKey,
        value: row?.value,
        quality: row?.quality ?? "estimated",
      }),
    });
    setStatus(res.ok ? `Saved ${metricKey}` : `Could not save ${metricKey}`);
  }

  const [evidenceMetric, setEvidenceMetric] = useState("electricity_kwh");

  async function onEvidence(metricKey: string, files: FileList | null) {
    if (!files?.[0]) return;
    setStatus(`Uploading evidence for ${metricKey}…`);
    const form = new FormData();
    form.append("file", files[0]);
    form.append("metricKey", metricKey);
    const res = await fetch("/api/evidence", { method: "POST", body: form });
    if (!res.ok) {
      setStatus(`Evidence upload failed for ${metricKey}`);
      return;
    }
    const data = (await res.json()) as { sha256?: string };
    setStatus(`Evidence stored — sha256 ${data.sha256?.slice(0, 12) ?? "…"}…`);
  }

  return (
    <div className="mx-auto max-w-3xl space-y-12 px-6 py-12">
      <div>
        <p className="label-caps">Data collection</p>
        <h1 className="font-display mt-2 text-3xl text-bone">Enter once</h1>
        <p className="mt-2 text-ash">
          Quality is required on every field. Raw energy inputs derive into ESRS E1-5
          shapes — they are not mapped directly.
        </p>
        {status ? <p className="mt-3 text-sm text-ash">{status}</p> : null}
      </div>

      {(["E", "S", "G"] as const).map((cat) => (
        <section key={cat}>
          <p className="label-caps mb-4">
            {cat === "E" ? "Environmental" : cat === "S" ? "Social" : "Governance"}
          </p>
          <div className="space-y-6">
            {grouped[cat].map((m) => (
              <div key={m.key} id={m.key} className="border border-graphite p-4">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <label className="text-bone" htmlFor={`field-${m.key}`}>
                    {m.label}
                  </label>
                  {m.unit ? (
                    <span className="font-data text-sm text-ash">{m.unit}</span>
                  ) : null}
                </div>
                <p className="mt-1 text-xs text-ash">{mappingNote(m.key)}</p>
                <div className="mt-3 flex flex-wrap gap-3">
                  {m.inputType === "boolean" ? (
                    <select
                      id={`field-${m.key}`}
                      className="border border-graphite bg-slate px-2 py-2 text-bone"
                      value={
                        rows[m.key]?.value === 1
                          ? "1"
                          : rows[m.key]?.value === 0
                            ? "0"
                            : ""
                      }
                      onChange={(e) =>
                        setRows((r) => ({
                          ...r,
                          [m.key]: {
                            value: e.target.value === "" ? null : Number(e.target.value),
                            quality: r[m.key]?.quality ?? "measured",
                          },
                        }))
                      }
                      onBlur={() => void save(m.key)}
                    >
                      <option value="">Not set</option>
                      <option value="1">Yes</option>
                      <option value="0">No</option>
                    </select>
                  ) : (
                    <input
                      id={`field-${m.key}`}
                      type="number"
                      className="font-data border border-graphite bg-slate px-2 py-2 text-bone"
                      value={rows[m.key]?.value ?? ""}
                      onChange={(e) =>
                        setRows((r) => ({
                          ...r,
                          [m.key]: {
                            value: e.target.value === "" ? null : Number(e.target.value),
                            quality: r[m.key]?.quality ?? "estimated",
                          },
                        }))
                      }
                      onBlur={() => void save(m.key)}
                    />
                  )}
                  <select
                    className="border border-graphite bg-slate px-2 py-2 text-sm text-bone"
                    value={rows[m.key]?.quality ?? "estimated"}
                    onChange={(e) =>
                      setRows((r) => ({
                        ...r,
                        [m.key]: {
                          value: r[m.key]?.value ?? null,
                          quality: e.target.value,
                        },
                      }))
                    }
                    onBlur={() => void save(m.key)}
                  >
                    <option value="measured">Measured</option>
                    <option value="estimated">Estimated</option>
                    <option value="missing">Missing</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}

      <section className="border border-dashed border-graphite p-6">
        <p className="label-caps mb-2">Evidence</p>
        <p className="mb-4 text-sm text-ash">
          Attach a bill or certificate. SHA-256 is stored as the audit anchor.
        </p>
        <select
          className="mb-3 border border-graphite bg-slate px-2 py-2 text-sm text-bone"
          value={evidenceMetric}
          onChange={(e) => setEvidenceMetric(e.target.value)}
        >
          {METRICS.map((m) => (
            <option key={m.key} value={m.key}>
              {m.label}
            </option>
          ))}
        </select>
        <input
          type="file"
          className="block text-sm text-ash"
          onChange={(e) => void onEvidence(evidenceMetric, e.target.files)}
        />
      </section>

      <section className="border border-graphite p-6">
        <p className="label-caps mb-2">CSV import</p>
        <p className="mb-4 text-sm text-ash">
          Dry-run only — review the parsed rows before committing.
        </p>
        <input
          type="file"
          accept=".csv,text/csv"
          className="text-sm text-ash"
          onChange={async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            const text = await file.text();
            const parsed = text
              .trim()
              .split(/\r?\n/)
              .slice(0, 6)
              .map((line) => line.split(","));
            setCsvPreview(parsed);
          }}
        />
        {csvPreview ? (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-sm text-ash">
              <tbody>
                {csvPreview.map((row, i) => (
                  <tr key={i} className="border-t border-graphite">
                    {row.map((cell, j) => (
                      <td key={j} className="px-2 py-1 font-data text-bone">
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="mt-2 text-xs text-ash">Dry-run preview — not committed.</p>
          </div>
        ) : null}
      </section>
    </div>
  );
}
