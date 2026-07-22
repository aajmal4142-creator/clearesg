"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { SUPPLIER_FORM_FIELDS } from "@/lib/suppliers/fields";

export type SupplierFormMeta = {
  orgName: string;
  supplierName: string;
  expired: boolean;
  used: boolean;
  expiresAt: string | null;
  error?: string;
};

function draftKey(token: string) {
  return `clearesg-supplier-draft:${token}`;
}

export function SupplierPublicForm({
  token,
  initial,
}: {
  token: string;
  initial: SupplierFormMeta;
}) {
  const [error, setError] = useState<string | null>(initial.error ?? null);
  const [done, setDone] = useState(initial.used);
  const [values, setValues] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const meta = initial;

  useEffect(() => {
    void Promise.resolve().then(() => {
      try {
        const raw = sessionStorage.getItem(draftKey(token));
        if (raw) setValues(JSON.parse(raw) as Record<string, string>);
      } catch {
        /* ignore */
      }
    });
  }, [token]);

  useEffect(() => {
    try {
      sessionStorage.setItem(draftKey(token), JSON.stringify(values));
    } catch {
      /* ignore */
    }
  }, [token, values]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (meta.expired || meta.used || meta.error) return;
    setSaving(true);
    setError(null);
    const body: Record<string, number | null> = {};
    for (const f of SUPPLIER_FORM_FIELDS) {
      const raw = values[f.key]?.trim() ?? "";
      if (!raw) {
        body[f.key] = null;
        continue;
      }
      body[f.key] = Number(raw);
    }
    const res = await fetch(`/api/s/${token}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setSaving(false);
    if (!res.ok) {
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      setError(data.error ?? "Could not submit");
      return;
    }
    try {
      sessionStorage.removeItem(draftKey(token));
    } catch {
      /* ignore */
    }
    setDone(true);
  }

  if (meta.error) {
    return (
      <main className="mx-auto max-w-lg px-6 py-16 text-ink">
        <p className="text-ink-muted">{meta.error}</p>
      </main>
    );
  }

  if (done || meta.used) {
    return (
      <main className="mx-auto max-w-lg px-6 py-16 text-ink">
        <p className="label-caps">{meta.orgName}</p>
        <h1 className="font-display mt-4 text-3xl">You&apos;re done</h1>
        <p className="mt-4 text-lg text-ink-muted">
          Thank you. Your response is recorded for {meta.orgName}. This link cannot be
          used again.
        </p>
      </main>
    );
  }

  if (meta.expired) {
    return (
      <main className="mx-auto max-w-lg px-6 py-16 text-ink">
        <p className="label-caps">{meta.orgName}</p>
        <h1 className="font-display mt-4 text-3xl">Link expired</h1>
        <p className="mt-4 text-ink-muted">Ask {meta.orgName} to send a new request.</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-lg px-5 py-10 text-ink sm:px-6 sm:py-12">
      <p className="label-caps">{meta.orgName}</p>
      <h1 className="font-display mt-4 text-3xl leading-tight sm:text-4xl">
        Supplier data return
      </h1>
      <p className="mt-3 text-base text-ink-muted sm:text-lg">
        For {meta.supplierName}. Six fields. About 90 seconds. Numbers only — measured
        where possible. Your draft is kept on this device until you submit.
      </p>
      {error ? <p className="mt-4 text-sm text-rust">{error}</p> : null}

      <form className="mt-10 space-y-7" onSubmit={(e) => void submit(e)}>
        {SUPPLIER_FORM_FIELDS.map((f) => (
          <div key={f.key}>
            <label
              className="flex items-baseline justify-between gap-2 text-base"
              htmlFor={f.key}
            >
              <span>
                {f.label}
                {f.required ? "" : " (optional)"}
              </span>
              <span className="font-data text-sm text-ink-muted">{f.unit}</span>
            </label>
            <input
              id={f.key}
              type="number"
              inputMode="decimal"
              min={0}
              step="any"
              required={f.required}
              className="mt-2 min-h-12 w-full rounded-[4px] border border-rule bg-surface-1 px-4 py-3 font-data text-base text-ink"
              value={values[f.key] ?? ""}
              onChange={(e) => setValues((v) => ({ ...v, [f.key]: e.target.value }))}
            />
          </div>
        ))}
        <button
          type="submit"
          disabled={saving}
          className="min-h-12 w-full rounded-[4px] border border-accent bg-accent px-4 py-3 text-base font-medium text-canvas disabled:opacity-50 sm:w-auto"
        >
          {saving ? "Submitting…" : "Submit"}
        </button>
      </form>
      <p className="mt-12 border-t border-rule pt-6 text-xs text-ink-muted">
        Need to report your own emissions?{" "}
        <Link href="/" className="text-accent underline-offset-2 hover:underline">
          ClearESG
        </Link>
      </p>
    </main>
  );
}
