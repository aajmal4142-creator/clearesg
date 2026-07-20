"use client";

import { useState } from "react";

import { Assemble, PageMasthead } from "@/components/motion";
import { Metric } from "@/components/ui/metric";

export type SupplierRow = {
  id: string;
  name: string;
  contactEmail: string;
  category: string;
  annualSpend: number | null;
  requestStatus: string;
  requestToken: string | null;
  reminderCount: number;
};

const CATEGORIES = [
  { value: "purchased_goods", label: "Purchased goods" },
  { value: "capital_goods", label: "Capital goods" },
  { value: "transport", label: "Transport" },
  { value: "waste", label: "Waste" },
  { value: "business_travel", label: "Business travel" },
  { value: "other", label: "Other" },
];

export function SuppliersClient({
  initialSuppliers,
  initialCoveragePct,
  initialResponseRatePct,
}: {
  initialSuppliers: SupplierRow[];
  initialCoveragePct: number | null;
  initialResponseRatePct: number | null;
}) {
  const [rows, setRows] = useState(initialSuppliers);
  const [coveragePct, setCoveragePct] = useState(initialCoveragePct);
  const [responseRate, setResponseRate] = useState(initialResponseRatePct);
  const [status, setStatus] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    contactEmail: "",
    category: "purchased_goods",
    annualSpend: "",
  });

  async function refresh() {
    const res = await fetch("/api/app/suppliers");
    if (!res.ok) {
      setStatus("Could not load suppliers");
      return;
    }
    const data = (await res.json()) as {
      suppliers: SupplierRow[];
      coveragePct: number | null;
      responseRatePct: number | null;
    };
    setRows(data.suppliers);
    setCoveragePct(data.coveragePct);
    setResponseRate(data.responseRatePct);
  }

  async function addSupplier(e: React.FormEvent) {
    e.preventDefault();
    setStatus("Saving…");
    const res = await fetch("/api/app/suppliers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name,
        contactEmail: form.contactEmail,
        category: form.category,
        annualSpend: form.annualSpend === "" ? null : Number(form.annualSpend),
      }),
    });
    if (!res.ok) {
      setStatus("Could not add supplier");
      return;
    }
    setForm({
      name: "",
      contactEmail: "",
      category: "purchased_goods",
      annualSpend: "",
    });
    setStatus("Supplier added");
    await refresh();
  }

  async function sendRequest(id: string) {
    setStatus("Sending request…");
    const res = await fetch(`/api/app/suppliers/${id}/request`, { method: "POST" });
    const data = (await res.json().catch(() => ({}))) as {
      link?: string;
      error?: string;
      delivery?: string;
    };
    if (!res.ok) {
      setStatus(data.error ?? "Could not send request");
      return;
    }
    if (data.link) {
      try {
        await navigator.clipboard.writeText(data.link);
      } catch {
        /* ignore */
      }
      const via =
        data.delivery === "resend"
          ? "Email sent via Resend."
          : data.delivery === "failed"
            ? "Email failed."
            : "No RESEND_API_KEY — email logged to server console only.";
      setStatus(`${via} Link copied: ${data.link}`);
    } else {
      setStatus(data.error ?? "Request sent");
    }
    await refresh();
  }

  async function chaseReminders() {
    setStatus("Sending reminders…");
    const res = await fetch("/api/app/suppliers/reminders", { method: "POST" });
    const data = (await res.json().catch(() => ({}))) as {
      remindersSent?: number;
      error?: string;
    };
    if (!res.ok) {
      setStatus(data.error ?? "Could not send reminders");
      return;
    }
    setStatus(`Reminders sent: ${data.remindersSent ?? 0}`);
    await refresh();
  }

  async function remove(id: string) {
    if (!window.confirm("Remove this supplier?")) return;
    const res = await fetch(`/api/app/suppliers/${id}`, { method: "DELETE" });
    if (!res.ok) {
      setStatus("Could not remove supplier");
      return;
    }
    setStatus("Supplier removed");
    await refresh();
  }

  return (
    <div className="mx-auto max-w-5xl space-y-10 px-6 py-12">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <PageMasthead
          label="Supplier chains"
          title="Scope 3 collection"
          description="Tokenised public forms. No supplier account. Response flows into your Scope 3 as measured supplier data."
          className="flex-1"
        />
        <Assemble layer="data" className="flex gap-8">
          <div>
            {coveragePct === null ? (
              <span className="font-data text-3xl text-ink-muted">—</span>
            ) : (
              <Metric value={coveragePct} unit="%" size="xl" decimals={0} />
            )}
            <p className="label-caps mt-1">Spend covered</p>
          </div>
          <div>
            {responseRate === null ? (
              <span className="font-data text-3xl text-ink-muted">—</span>
            ) : (
              <Metric value={responseRate} unit="%" size="xl" decimals={0} />
            )}
            <p className="label-caps mt-1">Response rate</p>
          </div>
        </Assemble>
      </div>

      {status ? <p className="text-sm text-ink-muted">{status}</p> : null}

      <form
        onSubmit={(e) => void addSupplier(e)}
        className="grid gap-3 border border-rule p-4 md:grid-cols-5"
      >
        <input
          required
          placeholder="Supplier name"
          className="border border-rule bg-surface-1 px-2 py-2 text-ink md:col-span-1"
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
        />
        <input
          required
          type="email"
          placeholder="Contact email"
          className="border border-rule bg-surface-1 px-2 py-2 text-ink"
          value={form.contactEmail}
          onChange={(e) => setForm((f) => ({ ...f, contactEmail: e.target.value }))}
        />
        <select
          className="border border-rule bg-surface-1 px-2 py-2 text-ink"
          value={form.category}
          onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
        >
          {CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
        <input
          type="number"
          min={0}
          placeholder="Annual spend"
          className="border border-rule bg-surface-1 px-2 py-2 font-data text-ink"
          value={form.annualSpend}
          onChange={(e) => setForm((f) => ({ ...f, annualSpend: e.target.value }))}
        />
        <button
          type="submit"
          className="border border-rule bg-surface-1 px-3 py-2 text-sm text-ink hover:border-rule-strong"
        >
          Add supplier
        </button>
      </form>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => void chaseReminders()}
          className="border border-rule px-3 py-2 text-sm text-ink-muted hover:border-rule-strong hover:text-ink"
        >
          Send due reminders (day 7 / 14)
        </button>
      </div>

      {rows.length === 0 ? (
        <p className="text-ink-muted">
          No suppliers yet. Add one to start collecting Scope 3 data.
        </p>
      ) : (
        <div className="overflow-x-auto border border-rule">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-rule text-ink-muted">
              <tr>
                <th className="px-3 py-2 font-normal">Name</th>
                <th className="px-3 py-2 font-normal">Category</th>
                <th className="px-3 py-2 font-normal">Spend</th>
                <th className="px-3 py-2 font-normal">Status</th>
                <th className="px-3 py-2 font-normal">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b border-rule/60">
                  <td className="px-3 py-3">
                    <div className="text-ink">{r.name}</div>
                    <div className="text-xs text-ink-muted">{r.contactEmail}</div>
                  </td>
                  <td className="px-3 py-3 text-ink-muted">{r.category}</td>
                  <td className="px-3 py-3 font-data text-ink">
                    {r.annualSpend === null ? "—" : r.annualSpend.toLocaleString()}
                  </td>
                  <td className="px-3 py-3 font-data text-ink-muted">
                    {r.requestStatus}
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex flex-wrap gap-2">
                      {r.requestStatus !== "submitted" ? (
                        <button
                          type="button"
                          className="text-sm text-ink underline-offset-2 hover:underline"
                          onClick={() => void sendRequest(r.id)}
                        >
                          {r.requestStatus === "not_sent" ? "Send request" : "Resend"}
                        </button>
                      ) : null}
                      <button
                        type="button"
                        className="text-sm text-ink-muted hover:text-rust"
                        onClick={() => void remove(r.id)}
                      >
                        Remove
                      </button>
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
