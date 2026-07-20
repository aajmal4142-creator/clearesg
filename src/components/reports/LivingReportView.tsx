"use client";

import { Assemble, InkReveal, PageMasthead, RuleDraw } from "@/components/motion";
import { Metric } from "@/components/ui/metric";
import type { ReportSnapshot } from "@/lib/reports";

export function LivingReportView({ snapshot }: { snapshot: ReportSnapshot }) {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16 text-ink">
      <PageMasthead
        label="ClearESG living report"
        title={snapshot.organisationName}
        description={`${snapshot.periodLabel} · ${snapshot.framework} · v${snapshot.version}`}
      />

      <Assemble layer="data" className="mt-8">
        <Metric
          value={snapshot.scores.overall}
          size="display"
          decimals={0}
          inView={false}
        />
        <p className="label-caps mt-1">Overall · {snapshot.band}</p>
      </Assemble>

      <InkReveal className="mt-10" delay={0.08}>
        <RuleDraw delay={0} duration={0.4} className="mb-4" />
        <div className="grid grid-cols-3 gap-3">
          {(
            [
              ["E", snapshot.scores.e],
              ["S", snapshot.scores.s],
              ["G", snapshot.scores.g],
            ] as const
          ).map(([k, v]) => (
            <div key={k} className="surface-1 rounded-[4px] p-3">
              <p className="label-caps">{k}</p>
              <Metric value={v} size="xl" decimals={0} className="mt-2" />
            </div>
          ))}
        </div>
      </InkReveal>

      <InkReveal className="surface-1 mt-10 rounded-[4px] p-4" delay={0.12}>
        <p className="label-caps mb-3">Emissions tCO2e</p>
        <div className="flex flex-wrap gap-4 text-ink-muted">
          <Metric value={snapshot.emissions.scope1} unit="S1" size="sm" decimals={2} />
          <Metric value={snapshot.emissions.scope2} unit="S2" size="sm" decimals={2} />
          <Metric value={snapshot.emissions.scope3} unit="S3" size="sm" decimals={2} />
          <Metric value={snapshot.emissions.total} unit="total" size="sm" decimals={2} />
        </div>
        <div className="mt-2">
          <Metric
            value={snapshot.emissions.dataQualityPct}
            unit="% quality"
            size="sm"
            decimals={0}
            tone="ash"
          />
        </div>
      </InkReveal>

      <InkReveal className="mt-10 border border-rule p-4" delay={0.16}>
        <p className="label-caps mb-2">Materiality</p>
        <p className="text-sm text-ink-muted">
          {snapshot.materiality.narrative ?? "No materiality narrative on this version."}
        </p>
      </InkReveal>

      <p className="mt-12 text-xs text-ink-muted">{snapshot.disclaimer}</p>
    </main>
  );
}
