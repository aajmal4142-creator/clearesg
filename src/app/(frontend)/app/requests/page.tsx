"use client";

import { useEffect, useState } from "react";

import {
  EmptyState,
  PageFrame,
  PageSkeleton,
  StatusLine,
} from "@/components/shell/PageFrame";
import { Button } from "@/components/ui/button";

type RequestRow = {
  id: string;
  title: string;
  requestStatus: string;
  dueDate?: string | null;
  metricKeys: string[];
};

type Teammate = { id: string; email: string; name: string };

async function fetchRequests(): Promise<{
  rows: RequestRow[];
  teammates: Teammate[];
  error: string | null;
}> {
  const [reqRes, teamRes] = await Promise.all([
    fetch("/api/app/internal-requests"),
    fetch("/api/app/teammates"),
  ]);

  if (!reqRes.ok) {
    const data = (await reqRes.json().catch(() => ({}))) as { error?: string };
    return {
      rows: [],
      teammates: [],
      error:
        data.error ??
        "Could not load requests. Finish onboarding or switch organisation.",
    };
  }

  const data = (await reqRes.json()) as { requests: RequestRow[] };
  let teammates: Teammate[] = [];
  if (teamRes.ok) {
    const t = (await teamRes.json()) as { teammates: Teammate[] };
    teammates = t.teammates ?? [];
  }

  return { rows: data.requests, teammates, error: null };
}

export default function RequestsPage() {
  const [rows, setRows] = useState<RequestRow[]>([]);
  const [teammates, setTeammates] = useState<Teammate[]>([]);
  const [title, setTitle] = useState("Q1 energy pack");
  const [assigneeId, setAssigneeId] = useState("");
  const [metricKeys, setMetricKeys] = useState("electricity_kwh,diesel_litres");
  const [dueDate, setDueDate] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [statusTone, setStatusTone] = useState<"neutral" | "error" | "ok">("neutral");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    void fetchRequests().then((result) => {
      if (cancelled) return;
      setRows(result.rows);
      setTeammates(result.teammates);
      setLoadError(result.error);
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  function reload() {
    setLoading(true);
    setReloadKey((k) => k + 1);
  }

  async function create() {
    if (!assigneeId) {
      setStatusTone("error");
      setStatus("Choose a teammate.");
      return;
    }
    setStatusTone("neutral");
    setStatus("Sending…");
    const res = await fetch("/api/app/internal-requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        assigneeId,
        metricKeys: metricKeys
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        dueDate: dueDate || undefined,
      }),
    });
    const data = (await res.json().catch(() => ({}))) as { error?: string };
    if (!res.ok) {
      setStatusTone("error");
      setStatus(data.error ?? "Failed");
      return;
    }
    setStatusTone("ok");
    setStatus("Request sent");
    reload();
  }

  async function patchStatus(id: string, requestStatus: string) {
    const res = await fetch("/api/app/internal-requests", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, requestStatus }),
    });
    if (!res.ok) {
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      setStatusTone("error");
      setStatus(data.error ?? "Update failed");
      return;
    }
    reload();
  }

  return (
    <PageFrame
      eyebrow="Intra-org"
      title="Internal data requests"
      help="Assign structured metric packs to teammates. Same request-status pattern as suppliers — Membership users, not public tokens."
      rail={
        <div className="text-sm text-ink-muted">
          <p className="label-caps text-ink">Open</p>
          <p className="mt-2 font-data text-2xl text-ink">{rows.length}</p>
        </div>
      }
    >
      {loading ? <PageSkeleton /> : null}
      {loadError ? <EmptyState title="Requests unavailable" body={loadError} /> : null}

      {!loading && !loadError ? (
        <>
          <div className="space-y-3 border-b border-rule pb-8">
            <input
              className="w-full border border-rule bg-surface-1 px-3 py-2 text-sm"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Title"
              aria-label="Request title"
            />
            <label className="block text-sm">
              <span className="label-caps">Assignee</span>
              <select
                className="mt-1 w-full border border-rule bg-surface-1 px-3 py-2 text-sm"
                value={assigneeId}
                onChange={(e) => setAssigneeId(e.target.value)}
              >
                <option value="">Select teammate</option>
                {teammates.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name || t.email || t.id}
                  </option>
                ))}
              </select>
            </label>
            {teammates.length === 0 ? (
              <p className="text-xs text-ink-muted">
                No teammates found. Invite members before assigning requests.
              </p>
            ) : null}
            <input
              className="w-full border border-rule bg-surface-1 px-3 py-2 font-data text-sm"
              value={metricKeys}
              onChange={(e) => setMetricKeys(e.target.value)}
              placeholder="metric keys, comma-separated"
              aria-label="Metric keys"
            />
            <label className="block text-sm">
              <span className="label-caps">Due date</span>
              <input
                type="date"
                className="mt-1 w-full border border-rule bg-surface-1 px-3 py-2 font-data text-sm"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </label>
            <Button type="button" size="sm" onClick={() => void create()}>
              Send request
            </Button>
            {status ? <StatusLine tone={statusTone}>{status}</StatusLine> : null}
          </div>

          {rows.length === 0 ? (
            <EmptyState
              title="No internal requests yet"
              body="Create one to assign energy or social metrics to a teammate with a due date."
            />
          ) : (
            <ul className="mt-2 border-t border-rule">
              {rows.map((r) => (
                <li key={r.id} className="border-b border-rule py-3 text-sm">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-ink">{r.title}</p>
                      <p className="font-data text-xs text-ink-muted">
                        {r.requestStatus}
                        {r.dueDate ? ` · due ${String(r.dueDate).slice(0, 10)}` : ""}
                        {" · "}
                        {r.metricKeys.join(", ")}
                      </p>
                    </div>
                    <select
                      className="border border-rule bg-surface-1 px-2 py-1 text-xs"
                      value={r.requestStatus}
                      onChange={(e) => void patchStatus(r.id, e.target.value)}
                      aria-label={`Status for ${r.title}`}
                    >
                      <option value="not_sent">not_sent</option>
                      <option value="sent">sent</option>
                      <option value="opened">opened</option>
                      <option value="submitted">submitted</option>
                    </select>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </>
      ) : null}
    </PageFrame>
  );
}
