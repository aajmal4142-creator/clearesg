import { Assemble } from "@/components/motion";

import { RunwayActions } from "./RunwayActions";
import { RunwayAnomalies } from "./RunwayAnomalies";
import { RunwayEmissions } from "./RunwayEmissions";
import { RunwayFiling } from "./RunwayFiling";
import { RunwayFooter } from "./RunwayFooter";
import { RunwayHero, RunwayPageChrome, RunwayToolbar } from "./RunwayHero";
import type { RunwayViewProps } from "./types";

export function RunwayView(props: RunwayViewProps) {
  return (
    <RunwayPageChrome>
      <Assemble layer="data">
        <RunwayToolbar
          periodLabel={props.periodLabel}
          calm={props.calm}
          primaryAction={props.primaryAction}
        />

        <RunwayHero
          days={props.days}
          filingOverdue={props.filingOverdue}
          deadlineIso={props.deadlineIso}
          standardVersion={props.standardVersion}
          wave={props.wave}
          calmHint={props.calm.hint}
          projectedMiss={props.projectedMiss}
          calcOk={props.calcOk}
          overall={props.overall}
          readinessPct={props.readiness.pct}
          coveragePct={props.coveragePct}
          pendingApproval={props.pendingApproval}
          assignedCount={props.assignedCount}
          overdueCount={props.overdueCount}
          collected={props.collected}
          required={props.required}
          primaryNeed={props.primaryAction.need}
          primaryHref={props.primaryAction.href}
        />

        <RunwayEmissions
          totalEmissions={props.totalEmissions}
          scope1={props.scope1}
          scope2={props.scope2}
          scope3={props.scope3}
          s1Pct={props.s1Pct}
          s2Pct={props.s2Pct}
          s3Pct={props.s3Pct}
          hasScope3Composition={props.hasScope3Composition}
          primarySharePct={props.primarySharePct}
        />

        <div className="grid min-w-0 gap-10 border-b border-rule py-7 lg:grid-cols-12">
          <RunwayActions
            actions={props.nextActions}
            approvalByMetric={props.approvalByMetric}
          />
          <RunwayFiling
            days={props.days}
            filingOverdue={props.filingOverdue}
            deadlineIso={props.deadlineIso}
            standardVersion={props.standardVersion}
            derivationReason={props.derivationReason}
            projectedMiss={props.projectedMiss}
            secondary={props.secondary}
            hasObligation={props.hasObligation}
            obligationId={props.obligationId}
            canManage={props.canManage}
            needsConfirmation={props.needsConfirmation}
            baselineDrift={props.baselineDrift}
            obligationSource={props.obligationSource}
            baselineIncomplete={props.baselineIncomplete}
            missingCountry={props.missingCountry}
            missingHeadcount={props.missingHeadcount}
            missingRevenue={props.missingRevenue}
          />
        </div>

        <RunwayAnomalies anomalies={props.anomalies} />
        <RunwayFooter />
      </Assemble>
    </RunwayPageChrome>
  );
}
