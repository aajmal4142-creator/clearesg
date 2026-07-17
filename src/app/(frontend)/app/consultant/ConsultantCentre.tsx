"use client";

import { useState } from "react";

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
};

export function ConsultantCentre({ initialClients, consultancy, templates }: Props) {
  const [clients, setClients] = useState(initialClients);
  const [selected, setSelected] = useState<string[]>([]);
  const [status, setStatus] = useState<string | null>(null);
  const [primaryColor, setPrimaryColor] = useState(
    consultancy.brand.primaryColor ?? "#00E08A",
  );
  const [domain, setDomain] = useState(consultancy.brand.domain ?? "");

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
    setStatus("Sending nudges…");
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
    setStatus(
      res.ok ? `Nudges sent: ${data.nudgesSent ?? 0}` : (data.error ?? "Nudge failed"),
    );
  }

  async function saveBrand() {
    setStatus("Saving brand…");
    const res = await fetch("/api/app/consultant/brand", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ primaryColor, domain }),
    });
    setStatus(
      res.ok ? "Brand saved — refresh to see portal colours" : "Brand save failed",
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-10 px-6 py-12">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="label-caps">Consultant command centre</p>
          <h1 className="font-display mt-2 text-3xl text-bone">{consultancy.name}</h1>
          <p className="mt-2 text-ash">
            Clients sorted by deadline risk. Plan{" "}
            <span className="font-data text-bone">{consultancy.plan}</span> ·{" "}
            <span className="font-data text-bone">
              {consultancy.clientCount}/{consultancy.clientCap}
            </span>{" "}
            clients.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => void nudge()}
            className="border border-graphite bg-slate px-3 py-2 text-sm text-bone hover:border-ash"
          >
            Nudge selected
          </button>
          <button
            type="button"
            onClick={() => {
              window.location.assign("/api/app/consultant/export");
            }}
            className="border border-graphite px-3 py-2 text-sm text-ash hover:border-ash hover:text-bone"
          >
            Export all
          </button>
          <button
            type="button"
            onClick={() => void refresh()}
            className="border border-graphite px-3 py-2 text-sm text-ash hover:border-ash hover:text-bone"
          >
            Refresh
          </button>
        </div>
      </div>

      {status ? <p className="text-sm text-ash">{status}</p> : null}

      <section className="grid gap-6 border border-graphite p-4 md:grid-cols-2">
        <div>
          <p className="label-caps mb-2">White-label</p>
          <label className="block text-sm text-ash">
            Primary colour
            <input
              className="mt-1 w-full border border-graphite bg-slate px-2 py-2 font-data text-bone"
              value={primaryColor}
              onChange={(e) => setPrimaryColor(e.target.value)}
              placeholder="#00E08A"
            />
          </label>
          <label className="mt-3 block text-sm text-ash">
            Custom domain
            <input
              className="mt-1 w-full border border-graphite bg-slate px-2 py-2 text-bone"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              placeholder="esg.yourfirm.com"
            />
          </label>
          <button
            type="button"
            onClick={() => void saveBrand()}
            className="mt-3 border border-graphite px-3 py-2 text-sm text-bone hover:border-ash"
          >
            Save brand
          </button>
        </div>
        <div>
          <p className="label-caps mb-2">Sector templates</p>
          <ul className="space-y-2 text-sm text-ash">
            {templates.map((t) => (
              <li key={t.id} className="border border-graphite/60 p-2">
                <span className="text-bone">{t.label}</span>
                <span className="font-data mt-1 block text-xs">
                  {t.metricKeys.length} metrics
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-ash">
            Billing: Consultant €199/mo includes 10 clients; +€15/client after (Phase 12
            Stripe).
          </p>
        </div>
      </section>

      {clients.length === 0 ? (
        <p className="text-ash">
          No client organisations linked. Set a company&apos;s parentOrg to this
          consultancy in admin/seed.
        </p>
      ) : (
        <div className="overflow-x-auto border border-graphite">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-graphite text-ash">
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
                <tr key={c.id} className="border-b border-graphite/60">
                  <td className="px-3 py-3">
                    <input
                      type="checkbox"
                      checked={selected.includes(c.id)}
                      onChange={() => toggle(c.id)}
                    />
                  </td>
                  <td className="px-3 py-3">
                    <div className="text-bone">{c.name}</div>
                    <div className="font-data text-xs text-ash">
                      {c.sector} · {c.country}
                    </div>
                  </td>
                  <td className="px-3 py-3 font-data text-bone">
                    {c.daysToFiling === null ? "—" : c.daysToFiling}
                  </td>
                  <td className="px-3 py-3 font-data text-ash">
                    {c.datapointsCollected}/{c.datapointsRequired}
                  </td>
                  <td className="px-3 py-3 font-data text-bone">
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
                            : "text-ash"
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
    </div>
  );
}
