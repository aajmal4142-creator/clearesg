"use client";

import { FRAMEWORK_DISPLAY, type FrameworkCoverageSummary } from "@/lib/frameworks";
import { Metric } from "@/components/ui/metric";

/**
 * Quiet Runway-like framework coverage proportions.
 * Never paints “satisfied” green for partial / contribute-only states.
 */
export function FrameworkCoveragePanel({
  summaries,
}: {
  summaries: FrameworkCoverageSummary[];
}) {
  if (summaries.length === 0) {
    return (
      <div className="border-b border-rule px-0 py-3">
        <p className="label-caps text-ink-muted">Framework coverage</p>
        <p className="mt-1 text-sm text-ink-muted">
          No applicable frameworks for this organisation yet.
        </p>
      </div>
    );
  }

  return (
    <div className="border-b border-rule py-3">
      <p className="label-caps text-ink-muted">Framework coverage</p>
      <p className="mt-1 max-w-2xl text-sm text-ink-muted">
        Satisfied requires honest measured or calculated data on a required disclosure.
        Estimates and spend-based figures count as partial — never complete.
      </p>
      <ul className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {summaries.map((s) => (
          <li key={s.framework} className="border-t border-rule pt-2">
            <p className="text-sm text-ink">{FRAMEWORK_DISPLAY[s.framework]}</p>
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs">
              <span className="text-signal">
                Satisfied{" "}
                <Metric value={s.pctSatisfied} unit="%" size="sm" animate={false} />
              </span>
              <span className="text-amber">
                Partial <Metric value={s.pctPartial} unit="%" size="sm" animate={false} />
              </span>
              <span className="text-rust">
                Gap <Metric value={s.pctGap} unit="%" size="sm" animate={false} />
              </span>
            </div>
            <p className="mt-1 text-[10px] text-ink-muted">
              {s.satisfied} satisfied · {s.partial} partial · {s.contributes} contributes
              · {s.gap} gap · {s.total} disclosures
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
