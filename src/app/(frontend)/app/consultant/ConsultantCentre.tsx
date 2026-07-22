"use client";

import { useState } from "react";

import { EmptyState, PageFrame, StatusLine } from "@/components/shell/PageFrame";
import type { ClientRiskRow } from "@/lib/consultant";
import type { SectorTemplate } from "@/lib/consultant/templates";

type Props = {
  initialClients: ClientRiskRow[];
  consultancy: {
    name: string;
    plan: string;
    clientCount: number;
    clientCap: number;
    brand: { primaryColor: string | null; domain: string | null };
  };
  templates: SectorTemplate[];
  canWrite?: boolean;
};

export function ConsultantCentre({
  initialClients,
  consultancy,
  templates,
  canWrite = true,
}: Props) {
  const [clients, setClients] = useState(initialClients);
  const [selected, setSelected] = useState<string[]>([]);
  const [status, setStatus] = useState<string | null>(null);
  const [statusTone, setStatusTone] = useState<"neutral" | "error" | "ok">("neutral");
  const [primaryColor, setPrimaryColor] = useState(consultancy.brand.primaryColor ?? "");
  const [domain, setDomain] = useState(consultancy.brand.domain ?? "");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteName, setInviteName] = useState("");

  function note(message: string, tone: "neutral" | "error" | "ok" = "neutral") {
    setStatusTone(tone);
    setStatus(message);
  }

  function toggle(id: string) {
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  }

  async function refresh() {
    const res = await fetch("/api/app/consultant/clients");
    if (!res.ok) return;
    const data = (await res.json()) as { clients: ClientRiskRow[] };
    setClients(data.clients);
  }

  async function nudge() {
    if (!canWrite) {
      note("Viewers cannot send nudges.", "error");
      return;
    }
    note("Sending nudges…");
    const res = await fetch("/api/app/consultant/nudge", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        clientIds: selected.length > 0 ? selected : clients.map((c) => c.id),
        message: "Please complete outstanding datapoints before your filing deadline.",
      }),
    });
    const data = (await res.json().catch(() => ({}))) as {
      nudgesSent?: number;
      error?: string;
    };
    if (!res.ok) {
      const raw = data.error ?? "Nudge failed";
      note(
        raw === "Forbidden" ? "You do not have permission to nudge clients." : raw,
        "error",
      );
      return;
    }
    note(`Nudges sent: ${data.nudgesSent ?? 0}`, "ok");
  }

  async function inviteClient() {
    if (!canWrite) {
      note("Viewers cannot invite clients.", "error");
      return;
    }
    note("Inviting client…");
    const res = await fetch("/api/app/consultant/clients/invite", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: inviteEmail,
        clientName: inviteName,
        country: "IN",
        framework: "BRSR",
      }),
    });
    const data = (await res.json().catch(() => ({}))) as {
      error?: string;
      slug?: string;
    };
    if (!res.ok) {
      const raw = data.error ?? "Invite failed";
      note(
        raw === "Forbidden" ? "You do not have permission to invite clients." : raw,
        "error",
      );
      return;
    }
    note(`Client invited (${data.slug ?? "ok"}) — pre-branded`, "ok");
    void refresh();
  }

  async function saveBrand() {
    if (!canWrite) {
      note("Viewers cannot change brand settings.", "error");
      return;
    }
    note("Saving brand…");
    const res = await fetch("/api/app/consultant/brand", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        primaryColor: primaryColor.trim() || undefined,
        domain,
      }),
    });
    if (!res.ok) {
      note("Brand save failed. Check the colour format and try again.", "error");
      return;
    }
    note("Brand saved — refresh to see portal colours", "ok");
  }

  return (
    <PageFrame
      eyebrow="Consultant command centre"
      title={consultancy.name}
      help={`Clients sorted by deadline risk. Plan ${consultancy.plan} · ${consultancy.clientCount}/${consultancy.clientCap} clients.`}
      actions={
        <div className="flex flex-wrap gap-2">
          {canWrite ? (
            <button
              type="button"
              onClick={() => void nudge()}
              className="border border-rule bg-surface-1 px-3 py-2 text-sm text-ink hover:border-rule-strong"
            >
              Nudge selected
            </button>
          ) : null}
          <button
            type="button"
            onClick={() => {
              window.location.assign("/api/app/consultant/export");
            }}
            className="border border-rule px-3 py-2 text-sm text-ink-muted hover:border-rule-strong hover:text-ink"
          >
            Export all
          </button>
          <button
            type="button"
            onClick={() => void refresh()}
            className="border border-rule px-3 py-2 text-sm text-ink-muted hover:border-rule-strong hover:text-ink"
          >
            Refresh
          </button>
        </div>
      }
      rail={
        <div className="space-y-4 text-sm text-ink-muted">
          <p className="label-caps text-ink">White-label</p>
          <p>
            Accent colour injects via BrandVars for client portals. Leave blank to keep
            the ClearESG default accent.
          </p>
          <p className="label-caps text-ink">Billing</p>
          <p>
            Consultant €199/mo includes 10 clients; +€15/client after (Phase 12 Stripe).
          </p>
        </div>
      }
    >
      {status ? <StatusLine tone={statusTone}>{status}</StatusLine> : null}

      <section className="mt-4 grid gap-8 border-t border-rule pt-4 md:grid-cols-2">
        <div>
          <p className="label-caps mb-2">Brand</p>
          <label className="block text-sm text-ink-muted">
            Primary colour
            <input
              className="mt-1 w-full border border-rule bg-surface-1 px-2 py-2 font-data text-ink"
              value={primaryColor}
              onChange={(e) => setPrimaryColor(e.target.value)}
              placeholder="Leave blank for default"
              disabled={!canWrite}
            />
          </label>
          <label className="mt-3 block text-sm text-ink-muted">
            Custom domain
            <input
              className="mt-1 w-full border border-rule bg-surface-1 px-2 py-2 text-ink"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              placeholder="esg.yourfirm.com"
              disabled={!canWrite}
            />
          </label>
          {canWrite ? (
            <button
              type="button"
              onClick={() => void saveBrand()}
              className="mt-3 border border-rule px-3 py-2 text-sm text-ink hover:border-rule-strong"
            >
              Save brand
            </button>
          ) : null}
        </div>
        <div>
          <p className="label-caps mb-2">Invite client (pre-branded)</p>
          {canWrite ? (
            <>
              <label className="block text-sm text-ink-muted">
                Client name
                <input
                  className="mt-1 w-full border border-rule bg-surface-1 px-2 py-2 text-ink"
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                />
              </label>
              <label className="mt-3 block text-sm text-ink-muted">
                Owner email
                <input
                  className="mt-1 w-full border border-rule bg-surface-1 px-2 py-2 font-data text-ink"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                />
              </label>
              <button
                type="button"
                onClick={() => void inviteClient()}
                className="mt-3 border border-rule px-3 py-2 text-sm text-ink hover:border-rule-strong"
              >
                Invite client
              </button>
            </>
          ) : (
            <p className="text-sm text-ink-muted">View only — ask an admin to invite.</p>
          )}
        </div>
      </section>

      <section className="mt-8 border-t border-rule pt-4">
        <p className="label-caps mb-2">Sector templates</p>
        <ul className="space-y-2 text-sm text-ink-muted">
          {templates.map((t) => (
            <li key={t.id} className="border-b border-rule/60 py-2">
              <span className="text-ink">{t.label}</span>
              <span className="font-data mt-1 block text-xs">
                {t.metricKeys.length} metrics
              </span>
            </li>
          ))}
        </ul>
      </section>

      {clients.length === 0 ? (
        <EmptyState
          title="No linked clients"
          body="Invite a client above, or link a company by setting its parent organisation to this consultancy."
        />
      ) : (
        <div className="mt-8 overflow-x-auto border-t border-rule">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-rule text-ink-muted">
              <tr>
                <th className="px-3 py-2 font-normal" />
                <th className="px-3 py-2 font-normal">Client</th>
                <th className="px-3 py-2 font-normal">Days</th>
                <th className="px-3 py-2 font-normal">Data</th>
                <th className="px-3 py-2 font-normal">Score</th>
                <th className="px-3 py-2 font-normal">Risk</th>
              </tr>
            </thead>
            <tbody>
              {clients.map((c) => (
                <tr key={c.id} className="border-b border-rule/60">
                  <td className="px-3 py-3">
                    <input
                      type="checkbox"
                      checked={selected.includes(c.id)}
                      onChange={() => toggle(c.id)}
                      disabled={!canWrite}
                    />
                  </td>
                  <td className="px-3 py-3">
                    <div className="text-ink">{c.name}</div>
                    <div className="font-data text-xs text-ink-muted">
                      {c.sector} · {c.country}
                    </div>
                  </td>
                  <td className="px-3 py-3 font-data text-ink">
                    {c.daysToFiling === null ? "—" : c.daysToFiling}
                  </td>
                  <td className="px-3 py-3 font-data text-ink-muted">
                    {c.datapointsCollected}/{c.datapointsRequired}
                  </td>
                  <td className="px-3 py-3 font-data text-ink">
                    {c.overallScore === null ? "—" : c.overallScore}
                  </td>
                  <td
                    className={`px-3 py-3 font-data ${
                      c.risk === "critical"
                        ? "text-rust"
                        : c.risk === "at_risk"
                          ? "text-amber"
                          : c.risk === "on_track"
                            ? "text-signal"
                            : "text-ink-muted"
                    }`}
                  >
                    {c.risk}
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
