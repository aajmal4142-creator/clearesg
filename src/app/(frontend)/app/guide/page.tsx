"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import {
  EmptyState,
  PageFrame,
  PageSkeleton,
  StatusLine,
} from "@/components/shell/PageFrame";
import { Button } from "@/components/ui/button";

const STEPS = [
  { id: "sector", label: "Confirm sector and country", href: "/app/onboarding" },
  { id: "baseline", label: "Finish 60-second baseline", href: "/app/onboarding" },
  {
    id: "top3",
    label: "Replace top three estimated figures",
    href: "/app/data",
  },
  { id: "supplier", label: "Request one supplier", href: "/app/suppliers" },
  { id: "publish", label: "Publish living report", href: "/app/reports" },
] as const;

type GuideResult =
  { kind: "ok"; done: Record<string, boolean> } | { kind: "error"; message: string };

async function fetchGuide(): Promise<GuideResult> {
  const res = await fetch("/api/app/guide");
  const data = (await res.json().catch(() => ({}))) as {
    done?: Record<string, boolean>;
    error?: string;
  };
  if (!res.ok) {
    return {
      kind: "error",
      message:
        data.error ??
        "Could not load checklist. Finish onboarding or switch organisation.",
    };
  }
  return { kind: "ok", done: data.done ?? {} };
}

export default function GuidePage() {
  const [done, setDone] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    void fetchGuide().then((result) => {
      if (cancelled) return;
      if (result.kind === "error") {
        setError(result.message);
      } else {
        setDone(result.done);
        setError(null);
      }
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  async function toggle(id: string) {
    const next = { ...done, [id]: !done[id] };
    setDone(next);
    const res = await fetch("/api/app/guide", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ done: next }),
    });
    if (!res.ok) {
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      setError(data.error ?? "Could not save checklist");
      setLoading(true);
      setReloadKey((k) => k + 1);
    }
  }

  const next = STEPS.find((s) => !done[s.id]);
  const completed = STEPS.filter((s) => done[s.id]).length;

  return (
    <PageFrame
      eyebrow="Guided mode"
      title="First report — do this with me"
      help="Linear checklist from empty to published. Progress is saved on your organisation — shared across the team."
      rail={
        <div className="text-sm text-ink-muted">
          <p className="label-caps text-ink">Progress</p>
          <p className="mt-2 font-data text-2xl text-ink">
            {completed}/{STEPS.length}
          </p>
          <div className="mt-3 h-1.5 w-full bg-surface-2">
            <div
              className="h-full bg-accent transition-[width]"
              style={{ width: `${(completed / STEPS.length) * 100}%` }}
            />
          </div>
        </div>
      }
    >
      {loading ? <PageSkeleton rows={5} /> : null}
      {error ? <StatusLine tone="error">{error}</StatusLine> : null}
      {!loading && !error ? (
        <>
          {next ? (
            <p className="text-sm text-ink">
              Next:{" "}
              <Link
                href={next.href}
                className="text-accent underline-offset-2 hover:underline"
              >
                {next.label}
              </Link>
            </p>
          ) : (
            <p className="text-sm text-signal">Checklist complete.</p>
          )}
          <ul className="mt-8 space-y-0 border-t border-rule">
            {STEPS.map((s) => (
              <li
                key={s.id}
                className="flex items-center gap-3 border-b border-rule py-3"
              >
                <input
                  type="checkbox"
                  checked={Boolean(done[s.id])}
                  onChange={() => void toggle(s.id)}
                  aria-label={s.label}
                />
                <Link href={s.href} className="text-sm text-ink hover:text-accent">
                  {s.label}
                </Link>
              </li>
            ))}
          </ul>
          {next ? (
            <Button asChild className="mt-6" size="sm">
              <Link href={next.href}>Continue</Link>
            </Button>
          ) : null}
        </>
      ) : null}
      {!loading && error ? (
        <EmptyState
          title="Guide unavailable"
          body="Sign in with an organisation membership to use the shared checklist."
        />
      ) : null}
    </PageFrame>
  );
}
