"use client";

import { useState } from "react";

import { PLAN_LIMITS, type PlanId } from "@/lib/billing/plans";
import type { UsageMeters } from "@/lib/billing/usage";

type BillingState = {
  plan: PlanId;
  subscriptionStatus: string;
  usage: UsageMeters;
};

function Meter({
  label,
  used,
  max,
}: {
  label: string;
  used: number;
  max: number | null;
}) {
  const pct =
    max === null || max === 0 ? 0 : Math.min(100, Math.round((used / max) * 100));
  const near = max !== null && used / max >= 0.8;
  return (
    <div className="border border-graphite p-3">
      <div className="mb-2 flex justify-between text-sm">
        <span className="text-ash">{label}</span>
        <span className="font-data text-bone">
          {used}
          {max === null ? " / ∞" : ` / ${max}`}
        </span>
      </div>
      <div className="h-1 bg-slate">
        <div
          className={`h-1 ${near ? "bg-amber" : "bg-signal"}`}
          style={{ width: max === null ? "8%" : `${pct}%` }}
        />
      </div>
    </div>
  );
}

export function BillingClient({ initial }: { initial: BillingState }) {
  const [state, setState] = useState(initial);
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function checkout(plan: Exclude<PlanId, "free">) {
    setBusy(true);
    setStatus(null);
    try {
      const res = await fetch("/api/app/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const data = (await res.json()) as { url?: string; error?: string; mode?: string };
      if (!res.ok || !data.url) {
        setStatus(data.error ?? "Checkout failed");
        return;
      }
      window.location.assign(data.url);
    } finally {
      setBusy(false);
    }
  }

  async function portal() {
    setBusy(true);
    setStatus(null);
    try {
      const res = await fetch("/api/app/billing/portal", { method: "POST" });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !data.url) {
        setStatus(data.error ?? "Portal unavailable");
        return;
      }
      window.location.assign(data.url);
    } finally {
      setBusy(false);
    }
  }

  async function refresh() {
    const res = await fetch("/api/app/billing/usage");
    if (!res.ok) return;
    const data = (await res.json()) as BillingState;
    setState(data);
  }

  return (
    <main className="mx-auto max-w-3xl space-y-8 px-6 py-10">
      <header className="space-y-2">
        <p className="label-caps text-ash">Billing</p>
        <h1 className="font-display text-3xl text-bone">Plan & usage</h1>
        <p className="text-sm text-ash">
          Entitlements are enforced server-side. Free keeps full calculation; paid unlocks
          clean PDF, periods, evidence, and consultant tooling.
        </p>
      </header>

      <section className="border border-graphite p-4">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm text-ash">Current plan</p>
            <p className="font-data text-2xl text-bone">
              {PLAN_LIMITS[state.plan].label}
              {PLAN_LIMITS[state.plan].priceEur > 0
                ? ` · €${PLAN_LIMITS[state.plan].priceEur}/mo`
                : ""}
            </p>
            <p className="mt-1 font-data text-sm text-ash">
              status {state.subscriptionStatus}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={busy}
              onClick={() => void refresh()}
              className="border border-graphite px-3 py-2 text-sm text-ash hover:border-ash hover:text-bone"
            >
              Refresh
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => void portal()}
              className="border border-graphite px-3 py-2 text-sm text-ash hover:border-ash hover:text-bone"
            >
              Manage billing
            </button>
          </div>
        </div>
        {state.usage.watermarkedPdf ? (
          <p className="mt-4 border border-amber/40 bg-slate px-3 py-2 text-sm text-amber">
            PDFs are watermarked on Free. Upgrade to Pro for a clean export.
          </p>
        ) : null}
      </section>

      <section className="grid gap-3 sm:grid-cols-3">
        <Meter
          label="Reporting periods"
          used={state.usage.periods.used}
          max={state.usage.periods.max}
        />
        <Meter
          label="Suppliers"
          used={state.usage.suppliers.used}
          max={state.usage.suppliers.max}
        />
        <Meter
          label="Clients"
          used={state.usage.clients.used}
          max={state.usage.clients.max}
        />
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        {(
          [
            ["pro", "Unlimited periods, clean PDF, evidence vault, 10 suppliers"],
            [
              "consultant",
              "Everything in Pro + white-label, bulk nudge, 10 clients (+€15/client after)",
            ],
          ] as const
        ).map(([plan, blurb]) => (
          <div key={plan} className="border border-graphite p-4">
            <p className="label-caps text-ash">{PLAN_LIMITS[plan].label}</p>
            <p className="mt-1 font-data text-xl text-bone">
              €{PLAN_LIMITS[plan].priceEur}/mo
            </p>
            <p className="mt-2 text-sm text-ash">{blurb}</p>
            <button
              type="button"
              disabled={busy || state.plan === plan}
              onClick={() => void checkout(plan)}
              className="mt-4 border border-graphite bg-slate px-3 py-2 text-sm text-bone hover:border-ash disabled:opacity-40"
            >
              {state.plan === plan ? "Current" : `Upgrade to ${PLAN_LIMITS[plan].label}`}
            </button>
          </div>
        ))}
      </section>

      {status ? <p className="text-sm text-rust">{status}</p> : null}
    </main>
  );
}
