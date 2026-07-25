import Link from "next/link";

import { ApprovalChip } from "@/components/governance/ApprovalChip";
import { InkReveal } from "@/components/motion";
import { Metric } from "@/components/ui/metric";
import { METRICS_HREF, METRICS_LABEL } from "@/lib/metrics";
import { cn } from "@/lib/utils";

import { GoLink } from "./GoLink";
import type { RunwayAction } from "./types";

type RunwayActionsProps = {
  actions: RunwayAction[];
  approvalByMetric: Record<string, string>;
};

export function RunwayActions({ actions, approvalByMetric }: RunwayActionsProps) {
  const rows = actions.slice(0, 5);

  return (
    <InkReveal delay={0.12} className="min-w-0 lg:col-span-7">
      <div className="flex items-baseline justify-between gap-3">
        <p className="label-caps">Next actions</p>
        <Link href={METRICS_HREF} className="editorial-link text-xs">
          All {METRICS_LABEL.toLowerCase()}
        </Link>
      </div>

      <div className="mt-4 overflow-hidden rounded-[6px] border border-rule bg-surface-1">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-rule-strong bg-surface-1">
                <th className="label-caps w-10 px-3 py-2.5 text-left">#</th>
                <th className="label-caps px-3 py-2.5 text-left">Need</th>
                <th className="label-caps px-3 py-2.5 text-left">Status</th>
                <th className="label-caps px-3 py-2.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((action, index) => (
                <tr
                  key={action.href + action.label}
                  className={cn(
                    "border-b border-rule bg-surface-1 last:border-b-0",
                    "hover:bg-accent-quiet",
                  )}
                >
                  <td className="px-3 py-3 align-top">
                    <Metric
                      value={index + 1}
                      size="sm"
                      decimals={0}
                      tone="muted"
                      animate={false}
                    />
                  </td>
                  <td className="max-w-[18rem] px-3 py-3 align-top text-xs text-ink-muted">
                    {action.need}
                  </td>
                  <td className="px-3 py-3 align-top">
                    {action.metricKey ? (
                      <ApprovalChip
                        state={approvalByMetric[action.metricKey] ?? "pending"}
                      />
                    ) : (
                      <ApprovalChip placeholder />
                    )}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3 text-right align-top">
                    <GoLink href={action.href}>{action.label}</GoLink>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </InkReveal>
  );
}
