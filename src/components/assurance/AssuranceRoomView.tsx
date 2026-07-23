"use client";

import { PageFrame } from "@/components/shell/PageFrame";
import { Metric } from "@/components/ui/metric";
import type { FigureLineage, FreshnessResult } from "@/lib/assurance";
import type { ReportSnapshot } from "@/lib/reports";

export type AssuranceFigure = {
  datapointId: string;
  metricKey: string;
  value: number | null;
  unit: string | null;
  quality: string;
  lineage: FigureLineage;
  freshness: Array<{ evidenceId: string } & FreshnessResult>;
};

export function AssuranceRoomView({
  snapshot,
  figures,
  versionLabel,
  readOnlyToken,
  sharePath,
}: {
  snapshot: ReportSnapshot;
  figures: AssuranceFigure[];
  versionLabel: string;
  /** When set, this is the public /a/[token] surface. */
  readOnlyToken?: boolean;
  /** Internal dashboard: path to the public Assurance Room link. */
  sharePath?: string | null;
}) {
  const body = (
    <AssuranceBody
      snapshot={snapshot}
      figures={figures}
      versionLabel={versionLabel}
      sharePath={sharePath}
    />
  );

  if (readOnlyToken) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-16 text-ink">
        <header className="mb-10">
          <p className="label-caps text-ink-muted">Assurance Room</p>
          <h1 className="font-display mt-2 text-3xl text-ink">
            {snapshot.organisationName}
          </h1>
          <p className="mt-2 text-sm text-ink-muted">
            {snapshot.periodLabel} · {snapshot.framework} · {versionLabel}
          </p>
          <p className="mt-4 text-sm text-ink-muted">{snapshot.disclaimer}</p>
        </header>
        {body}
      </main>
    );
  }

  return (
    <PageFrame
      eyebrow="Assurance"
      title="Assurance Room"
      help="Read-only figure lineage for the latest published version. Factors are pinned at publish — never the live registry."
    >
      {body}
    </PageFrame>
  );
}

function AssuranceBody({
  snapshot,
  figures,
  versionLabel,
  sharePath,
}: {
  snapshot: ReportSnapshot;
  figures: AssuranceFigure[];
  versionLabel: string;
  sharePath?: string | null;
}) {
  return (
    <div className="space-y-8">
      <p className="text-sm text-ink-muted">
        Published snapshot {versionLabel}. Overall{" "}
        <Metric value={snapshot.scores.overall} size="sm" animate={false} /> ·{" "}
        <span className="font-data">{snapshot.factorsUsed.length}</span> pinned factors.
        {sharePath ? (
          <>
            {" "}
            ·{" "}
            <a
              className="text-ink underline-offset-2 hover:underline"
              href={sharePath}
              target="_blank"
              rel="noreferrer"
            >
              Open auditor link
            </a>
          </>
        ) : null}
      </p>

      <section>
        <p className="label-caps mb-3">Factor registry (pinned)</p>
        {snapshot.factorsUsed.length === 0 ? (
          <p className="text-sm text-ink-muted">No factors pinned on this version.</p>
        ) : (
          <ul className="divide-y divide-rule border-t border-rule">
            {snapshot.factorsUsed.map((f) => (
              <li key={f.factorId} className="flex flex-wrap gap-3 py-2 text-sm">
                <span className="font-data text-ink">{f.key}</span>
                <span className="text-ink-muted">
                  {f.source} {f.year}
                </span>
                <span className="font-data text-ink-muted">{f.value}</span>
                <span className="text-[10px] text-ink-muted">{f.factorId}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <p className="label-caps mb-3">Figures</p>
        {figures.length === 0 ? (
          <p className="text-sm text-ink-muted">
            No datapoints in this period, or none linked for assurance.
          </p>
        ) : (
          <ul className="space-y-4">
            {figures.map((fig) => (
              <li key={fig.datapointId} className="border-t border-rule pt-3">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="text-ink">
                    <span className="font-data">{fig.metricKey}</span>
                    {fig.unit ? (
                      <span className="text-ink-muted"> · {fig.unit}</span>
                    ) : null}
                  </p>
                  <p className="font-data text-sm text-ink">
                    {fig.value ?? "∅"} · {fig.quality}
                  </p>
                </div>
                <p
                  className={
                    fig.lineage.evidenceLink === "verified"
                      ? "mt-1 text-xs text-signal"
                      : "mt-1 text-xs text-rust"
                  }
                >
                  {fig.lineage.evidenceLink === "verified"
                    ? "Evidence link verified"
                    : "Evidence link unverified"}
                </p>
                {fig.lineage.factor ? (
                  <p className="mt-1 text-xs text-ink-muted">
                    Factor pinned: {fig.lineage.factor.source} {fig.lineage.factor.year} (
                    {fig.lineage.factor.key})
                  </p>
                ) : (
                  <p className="mt-1 text-xs text-amber">
                    {fig.lineage.factorUnresolvedReason ?? "No pinned factor"}
                  </p>
                )}
                {fig.freshness.map((f) => (
                  <p key={f.evidenceId} className="text-xs text-amber">
                    Freshness · {f.label}
                  </p>
                ))}
                {fig.lineage.evidence.length > 0 ? (
                  <ul className="mt-2 space-y-1">
                    {fig.lineage.evidence.map((e) => (
                      <li key={e.id} className="text-xs text-ink-muted">
                        {e.filename} ·{" "}
                        <span className="font-data">{e.sha256.slice(0, 12)}…</span>
                        {!e.bidirectionallyLinked ? (
                          <span className="text-rust"> · link unverified</span>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
