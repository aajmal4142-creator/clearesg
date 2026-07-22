"use client";

import { useState } from "react";

import { PageFrame, StatusLine } from "@/components/shell/PageFrame";
import type { MembershipRole } from "@/lib/access/membership";
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
    <div className="border-t border-rule py-3">
      <div className="mb-2 flex justify-between text-sm">
        <span className="text-ink-muted">{label}</span>
        <span className="font-data text-ink">
          {used}
          {max === null ? " / ∞" : ` / ${max}`}
        </span>
      </div>
      <div className="h-1 bg-surface-2">
        <div
          className={`h-1 ${near ? "bg-amber" : "bg-signal"}`}
          style={{ width: max === null ? "8%" : `${pct}%` }}
        />
      </div>
    </div>
  );
}

export function BillingClient({
  initial,
  role = null,
}: {
  initial: BillingState;
  role?: MembershipRole | null;
}) {
  const [state, setState] = useState(initial);
  const [status, setStatus] = useState<string | null>(null);
  const [statusTone, setStatusTone] = useState<"neutral" | "error" | "ok">("neutral");
  const [busy, setBusy] = useState(false);
  const canManage = role === null ? true : role === "owner" || role === "admin";
  const readOnlyNonOwner = role !== null && role !== "owner" && role !== "admin";

  async function checkout(plan: Exclude<PlanId, "free">) {
    if (!canManage) {
      setStatusTone("error");
      setStatus("Only an owner or admin can change the plan.");
      return;
    }
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
        const raw = data.error ?? "Checkout failed";
        setStatusTone("error");
        setStatus(
          raw === "Forbidden"
            ? "You do not have permission to change billing. Ask an owner."
            : raw,
        );
        return;
      }
      window.location.assign(data.url);
    } finally {
      setBusy(false);
    }
  }

  async function portal() {
    if (!canManage) {
      setStatusTone("error");
      setStatus("Only an owner or admin can open the billing portal.");
      return;
    }
    setBusy(true);
    setStatus(null);
    try {
      const res = await fetch("/api/app/billing/portal", { method: "POST" });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !data.url) {
        const raw = data.error ?? "Portal unavailable";
        setStatusTone("error");
        setStatus(
          raw === "Forbidden"
            ? "You do not have permission to manage billing. Ask an owner."
            : raw,
        );
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
    <PageFrame
      eyebrow="Billing"
      title="Plan & usage"
      help="Entitlements are enforced server-side. Free keeps full calculation; paid unlocks clean PDF, periods, evidence, and consultant tooling."
      actions={
        readOnlyNonOwner ? (
          <p className="text-sm text-ink-muted">Read-only — ask an owner to upgrade</p>
        ) : undefined
      }
      rail={
        <div className="space-y-3 text-sm text-ink-muted">
          <p className="label-caps text-ink">Current</p>
          <p className="font-data text-xl text-ink">
            {PLAN_LIMITS[state.plan].label}
            {PLAN_LIMITS[state.plan].priceEur > 0
              ? ` · €${PLAN_LIMITS[state.plan].priceEur}/mo`
              : ""}
          </p>
          <p className="font-data text-xs">status {state.subscriptionStatus}</p>
          {state.usage.watermarkedPdf ? (
            <p className="text-amber">
              PDFs are watermarked on Free. Upgrade to Pro for a clean export.
            </p>
          ) : null}
        </div>
      }
    >
      {status ? <StatusLine tone={statusTone}>{status}</StatusLine> : null}

      {readOnlyNonOwner ? (
        <StatusLine tone="neutral">
          Plan changes and the Stripe portal are limited to owners and admins. You can
          still review usage below.
        </StatusLine>
      ) : null}

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          disabled={busy}
          onClick={() => void refresh()}
          className="border border-rule px-3 py-2 text-sm text-ink-muted hover:border-rule-strong hover:text-ink"
        >
          Refresh
        </button>
        {canManage ? (
          <button
            type="button"
            disabled={busy}
            onClick={() => void portal()}
            className="border border-rule px-3 py-2 text-sm text-ink-muted hover:border-rule-strong hover:text-ink"
          >
            Manage billing
          </button>
        ) : null}
      </div>

      <section className="mt-6 space-y-1 border-t border-rule pt-2">
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

      <section className="mt-8 grid gap-6 border-t border-rule pt-4 md:grid-cols-2">
        {(
          [
            ["pro", "Unlimited periods, clean PDF, evidence vault, 10 suppliers"],
            [
              "consultant",
              "Everything in Pro + white-label, bulk nudge, 10 clients (+€15/client after)",
            ],
          ] as const
        ).map(([plan, blurb]) => (
          <div key={plan} className="border-b border-rule pb-4 md:border-b-0 md:pr-4">
            <p className="label-caps text-ink-muted">{PLAN_LIMITS[plan].label}</p>
            <p className="mt-1 font-data text-xl text-ink">
              €{PLAN_LIMITS[plan].priceEur}/mo
            </p>
            <p className="mt-2 text-sm text-ink-muted">{blurb}</p>
            {canManage ? (
              <button
                type="button"
                disabled={busy || state.plan === plan}
                onClick={() => void checkout(plan)}
                className="mt-4 border border-rule bg-surface-1 px-3 py-2 text-sm text-ink hover:border-rule-strong disabled:opacity-40"
              >
                {state.plan === plan
                  ? "Current"
                  : `Upgrade to ${PLAN_LIMITS[plan].label}`}
              </button>
            ) : (
              <p className="mt-4 text-sm text-ink-muted">
                {state.plan === plan ? "Current plan" : "Ask an owner to upgrade"}
              </p>
            )}
          </div>
        ))}
      </section>
    </PageFrame>
  );
}
