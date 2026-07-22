import Link from "next/link";
import { redirect } from "next/navigation";
import { getPayload } from "payload";

import { Gauge } from "@/components/gauge/Gauge";
import { ApprovalChip } from "@/components/governance/ApprovalChip";
import { Assemble, InkReveal, RuleDraw } from "@/components/motion";
import { PageFrame } from "@/components/shell/PageFrame";
import { Metric } from "@/components/ui/metric";
import { getCurrentContext } from "@/lib/auth";
import { calculate, type DatapointValue, type FactorRecord } from "@/lib/calc";
import { calmStatus, readinessBreakdown } from "@/lib/governance/calmStatus";
import { detectAnomalies } from "@/lib/governance/anomalies";
import { rankGaps } from "@/lib/governance/gaps";
import { plainGapCopy } from "@/lib/governance/plainGaps";
import { spendCoveragePct } from "@/lib/suppliers";
import config from "@/payload.config";

function daysUntil(iso: string): number {
  const target = new Date(iso).getTime();
  const now = Date.now();
  return Math.ceil((target - now) / (1000 * 60 * 60 * 24));
}

function isPastDue(iso: string): boolean {
  return Date.parse(String(iso)) < Date.now();
}

export default async function RunwayPage() {
  const ctx = await getCurrentContext();
  if (!ctx.activeOrg) {
    redirect("/dashboard/onboarding");
  }
  if (!ctx.activeOrg.onboardedAt) {
    redirect("/dashboard/onboarding");
  }

  const payload = await getPayload({ config });
  const obligations = await payload.find({
    collection: "compliance-obligations",
    where: { organisation: { equals: ctx.activeOrg.id } },
    limit: 1,
    sort: "filingDeadline",
    overrideAccess: true,
  });
  const obligation = obligations.docs[0];
  const days = obligation ? daysUntil(String(obligation.filingDeadline)) : null;

  const periods = await payload.find({
    collection: "reporting-periods",
    where: {
      and: [
        { organisation: { equals: ctx.activeOrg.id } },
        { status: { equals: "open" } },
      ],
    },
    limit: 1,
    overrideAccess: true,
  });
  const period = periods.docs[0];

  const dps = period
    ? await payload.find({
        collection: "datapoints",
        where: {
          and: [
            { organisation: { equals: ctx.activeOrg.id } },
            { period: { equals: period.id } },
          ],
        },
        limit: 200,
        depth: 0,
        overrideAccess: true,
      })
    : { docs: [] };

  const present = new Set(
    dps.docs
      .filter((d) => d.quality !== "missing" && d.value != null)
      .map((d) => d.metricKey),
  );
  const gaps = rankGaps(present);
  const collected = gaps.collected;
  const required = gaps.total;

  const suppliers = await payload.find({
    collection: "suppliers",
    where: { organisation: { equals: ctx.activeOrg.id } },
    limit: 200,
    overrideAccess: true,
  });
  const coveragePct = spendCoveragePct(
    suppliers.docs.map((s) => ({
      annualSpend: s.annualSpend,
      requestStatus: s.requestStatus ?? "not_sent",
    })),
  );

  const velocityPerDay = collected > 0 ? collected / 30 : 0.2;
  const remaining = Math.max(0, required - collected);
  const daysNeeded = velocityPerDay > 0 ? Math.ceil(remaining / velocityPerDay) : 999;
  const projectedMiss = days !== null && daysNeeded > days ? daysNeeded - days : 0;

  const sectorPrefix = (ctx.activeOrg.sector ?? "C").charAt(0).toUpperCase();
  const cohort = await payload.find({
    collection: "benchmark-stats",
    where: {
      and: [
        { sector: { equals: sectorPrefix } },
        { metricKey: { equals: "electricity_kwh" } },
      ],
    },
    limit: 1,
    overrideAccess: true,
  });
  const median = cohort.docs[0]?.p50 ?? null;
  const cohortSize = cohort.docs[0]?.cohortSize ?? null;

  const anomalies = detectAnomalies(
    dps.docs.map((d) => ({
      metricKey: d.metricKey,
      value: d.value,
      unit: d.unit,
      evidenceCount: Array.isArray(d.evidence) ? d.evidence.length : 0,
      cohortMedian: d.metricKey === "electricity_kwh" ? median : null,
      cohortSize: d.metricKey === "electricity_kwh" ? cohortSize : null,
    })),
  );

  const assignedToMe = dps.docs.filter((d) => {
    const id = typeof d.assignedTo === "string" ? d.assignedTo : d.assignedTo?.id;
    return id === ctx.user.id && d.taskStatus !== "approved";
  });
  const overdue = assignedToMe.filter((d) => d.dueDate && isPastDue(String(d.dueDate)));

  const approvalByMetric = new Map(
    dps.docs.map((d) => [d.metricKey, d.approvalState ?? "pending"]),
  );

  const nextActions = [
    ...gaps.missing.slice(0, 5).map((g) => {
      const plain = plainGapCopy(g.metricKey, g.label);
      return {
        label: plain.action,
        need: plain.need,
        href:
          g.metricKey === "supplier_reported_tco2e"
            ? "/dashboard/suppliers"
            : `/dashboard/data#${g.metricKey}`,
        meta: `impact×ease ${g.rank}`,
        metricKey: g.metricKey,
      };
    }),
    ...anomalies.slice(0, 3).map((a) => ({
      label: `Review unusual figure: ${a.metricKey}`,
      need: a.reason,
      href: `/dashboard/data#${a.metricKey}`,
      meta: a.reason,
      metricKey: a.metricKey,
    })),
  ].slice(0, 8);

  if (nextActions.length === 0) {
    nextActions.push({
      label: "Publish a living report",
      need: "Required runway metrics are present. Share a living link.",
      href: "/dashboard/reports",
      meta: "All required runway metrics present",
      metricKey: "",
    });
  }

  const primaryAction = nextActions[0]!;
  const calm = calmStatus({ daysLeft: days, collected, required });
  const readiness = readinessBreakdown(collected, required);

  const pendingApproval = dps.docs.filter(
    (d) => (d.approvalState ?? "pending") === "pending" && d.quality !== "missing",
  ).length;

  // Live calc — never hardcode Gauge or stack widths
  const metrics: Record<string, DatapointValue> = {};
  for (const dp of dps.docs) {
    metrics[dp.metricKey] = {
      value: typeof dp.value === "number" ? dp.value : null,
      quality: dp.quality,
      unit: dp.unit ?? undefined,
    };
  }
  const year = period
    ? new Date(String(period.endDate)).getFullYear()
    : new Date().getFullYear();
  const region = ctx.activeOrg.country || "GB";
  const factorsResult = await payload.find({
    collection: "emission-factors",
    limit: 500,
    overrideAccess: true,
  });
  const factors: FactorRecord[] = factorsResult.docs.map((f) => ({
    id: f.id,
    key: f.key,
    value: f.value,
    unit: f.unit,
    source: f.source,
    publicationYear: f.publicationYear,
    region: f.region,
    validFrom: f.validFrom ? String(f.validFrom) : undefined,
    validUntil: f.validUntil ? String(f.validUntil) : undefined,
  }));

  let overall = 0;
  let scope1 = 0;
  let scope2 = 0;
  let scope3 = 0;
  let calcOk = false;
  try {
    const calc = calculate({ metrics, context: { region, year } }, factors);
    overall = calc.scores.overall;
    scope1 = calc.emissions.scope1.value;
    scope2 = calc.emissions.scope2.value;
    scope3 = calc.emissions.scope3.value;
    calcOk = true;
  } catch {
    calcOk = false;
  }

  const totalEmissions = scope1 + scope2 + scope3;
  const s1Pct = totalEmissions > 0 ? (scope1 / totalEmissions) * 100 : 0;
  const s2Pct = totalEmissions > 0 ? (scope2 / totalEmissions) * 100 : 0;
  const s3Pct = totalEmissions > 0 ? (scope3 / totalEmissions) * 100 : 0;

  return (
    <PageFrame
      eyebrow="Compliance runway"
      title="Compliance runway"
      help="Countdown to filing — live scores from your datapoints, not placeholders."
      context={
        period
          ? {
              period: `${String(period.startDate).slice(0, 10)} → ${String(period.endDate).slice(0, 10)}`,
              status: `${period.status === "open" ? "Open" : period.status} · ${calm.label}`,
            }
          : { status: calm.label }
      }
      rail={
        <div className="flex flex-col">
          {calcOk ? (
            <Gauge score={overall} playOnView={false} size={280} />
          ) : (
            <p className="text-sm text-ink-muted">
              Score unavailable — add emission factors and core activity data.
            </p>
          )}
          <InkReveal className="mt-8 w-full" delay={0.16}>
            <RuleDraw delay={0} duration={0.4} className="mb-3" />
            <p className="label-caps mb-3">Emissions stack (tCO₂e)</p>
            {totalEmissions > 0 ? (
              <>
                <div className="flex h-8 w-full overflow-hidden border border-rule bg-surface-2">
                  <div
                    className="bg-rust/80"
                    style={{ width: `${s1Pct}%` }}
                    title={`Scope 1: ${scope1.toFixed(2)}`}
                  />
                  <div
                    className="bg-amber/80"
                    style={{ width: `${s2Pct}%` }}
                    title={`Scope 2: ${scope2.toFixed(2)}`}
                  />
                  <div
                    className="bg-cobalt/80"
                    style={{ width: `${s3Pct}%` }}
                    title={`Scope 3: ${scope3.toFixed(2)}`}
                  />
                </div>
                <div className="mt-2 flex justify-between text-xs font-semibold uppercase tracking-[0.08em] text-ink-muted">
                  <span>
                    Scope 1{" "}
                    <Metric
                      value={scope1}
                      size="sm"
                      decimals={1}
                      className="inline"
                      inView={false}
                    />
                  </span>
                  <span>
                    Scope 2{" "}
                    <Metric
                      value={scope2}
                      size="sm"
                      decimals={1}
                      className="inline"
                      inView={false}
                    />
                  </span>
                  <span>
                    Scope 3{" "}
                    <Metric
                      value={scope3}
                      size="sm"
                      decimals={1}
                      className="inline"
                      inView={false}
                    />
                  </span>
                </div>
              </>
            ) : (
              <p className="text-sm text-ink-muted">
                No emissions yet. Enter electricity, fuel, or spend on Data.
              </p>
            )}
            <div className="mt-8 rounded-[6px] border border-rule bg-surface-1 p-4">
              <p className="label-caps mb-2">Living report</p>
              <p className="text-sm text-ink-muted">
                Share a link that stays current as you update figures.
              </p>
              <Link
                href="/dashboard/reports"
                className="mt-3 inline-block text-sm text-accent underline-offset-2 hover:underline"
              >
                Open reports
              </Link>
            </div>
            <p className="mt-6 text-xs text-ink-muted">
              <Link
                href="/dashboard/guide"
                className="text-accent underline-offset-2 hover:underline"
              >
                First-report guided mode
              </Link>
              {" · "}
              <Link
                href="/dashboard/audit"
                className="text-accent underline-offset-2 hover:underline"
              >
                Change log
              </Link>
            </p>
          </InkReveal>
        </div>
      }
    >
      <Assemble layer="data">
        <div
          className={
            calm.level === "critical"
              ? "rounded-[6px] border border-rust/40 bg-rust/5 px-4 py-3"
              : calm.level === "at_risk"
                ? "rounded-[6px] border border-amber/40 bg-amber/5 px-4 py-3"
                : "rounded-[6px] border border-rule bg-surface-1 px-4 py-3"
          }
        >
          <p className="label-caps text-ink">{calm.label}</p>
          <p className="mt-1 text-sm text-ink-muted">{calm.hint}</p>
          <Link
            href={primaryAction.href}
            className="mt-3 inline-flex text-sm font-medium text-accent underline-offset-2 hover:underline"
          >
            Next: {primaryAction.label}
          </Link>
          <p className="mt-1 text-xs text-ink-muted">{primaryAction.need}</p>
        </div>
      </Assemble>

      {days === null ? (
        <p className="mt-8 text-ink-muted">
          No filing deadline on file. Add a compliance obligation to start the countdown.
        </p>
      ) : (
        <Assemble layer="data" className="mt-8">
          <Metric value={days} size="display" decimals={0} inView={false} />
          <p className="label-caps mt-2">Days to filing</p>
          <div className="mt-8 flex items-baseline gap-1">
            <Metric value={readiness.pct} size="lg" decimals={0} inView={false} />
            <span className="font-data text-xl text-ink-muted">%</span>
          </div>
          <p className="label-caps mt-1">{readiness.label}</p>
          <p className="mt-2 max-w-[66ch] text-xs text-ink-muted">{readiness.detail}</p>
          <div className="mt-3 h-1.5 w-full max-w-xs overflow-hidden rounded-full bg-surface-2">
            <div
              className="h-full rounded-full bg-accent"
              style={{ width: `${Math.min(100, readiness.pct)}%` }}
            />
          </div>
          {coveragePct !== null ? (
            <>
              <div className="mt-6">
                <Metric
                  value={coveragePct}
                  unit="%"
                  size="lg"
                  decimals={0}
                  inView={false}
                />
              </div>
              <p className="label-caps mt-1">Supplier spend covered</p>
            </>
          ) : null}
          {projectedMiss > 0 ? (
            <p className="mt-4 text-rust">
              At your current rate you will miss the deadline by{" "}
              <Metric
                value={projectedMiss}
                size="sm"
                decimals={0}
                tone="rust"
                className="inline-flex"
                inView={false}
              />{" "}
              days.
            </p>
          ) : calm.level === "on_track" ? (
            <p className="mt-4 text-signal">On track at current collection rate.</p>
          ) : (
            <p className="mt-4 text-ink-muted">
              Collection pace is fine — finish the missing metrics below to clear{" "}
              {calm.label.toLowerCase()}.
            </p>
          )}
          <p className="mt-4 text-sm text-ink-muted">
            Assigned to you: {assignedToMe.length}
            {overdue.length > 0 ? (
              <span className="text-rust"> ({overdue.length} overdue)</span>
            ) : null}
            {" · "}
            <Link
              href="/dashboard/data"
              className="text-accent underline-offset-2 hover:underline"
            >
              Pending approval: {pendingApproval}
            </Link>
          </p>
        </Assemble>
      )}

      {anomalies.length > 0 ? (
        <InkReveal className="mt-8" delay={0.08}>
          <p className="label-caps mb-2">Unusual figures</p>
          <ul className="space-y-2 text-sm text-amber">
            {anomalies.slice(0, 4).map((a) => (
              <li key={a.metricKey + a.reason}>
                <Link
                  href={`/dashboard/data#${a.metricKey}`}
                  className="underline-offset-2 hover:underline"
                >
                  {a.metricKey}
                </Link>
                <span className="text-ink-muted"> — {a.reason}</span>
              </li>
            ))}
          </ul>
        </InkReveal>
      ) : null}

      <InkReveal className="mt-12" delay={0.12}>
        <RuleDraw delay={0} duration={0.4} className="mb-4" />
        <p className="label-caps mb-4">What&apos;s missing — next three</p>
        <ul className="space-y-0">
          {nextActions.slice(0, 3).map((a) => (
            <li key={a.href + a.label} className="border-b border-rule">
              <Link
                href={a.href}
                className="panel-hover block px-1 py-3 text-sm text-ink"
              >
                <span className="flex items-center justify-between gap-3">
                  <span>{a.label}</span>
                  {a.metricKey ? (
                    <ApprovalChip
                      state={approvalByMetric.get(a.metricKey) ?? "pending"}
                    />
                  ) : (
                    <ApprovalChip placeholder />
                  )}
                </span>
                <span className="mt-1 block text-xs text-ink-muted">{a.need}</span>
              </Link>
            </li>
          ))}
        </ul>
      </InkReveal>
    </PageFrame>
  );
}
