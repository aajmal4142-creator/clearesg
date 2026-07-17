import Link from "next/link";
import { redirect } from "next/navigation";
import { getPayload } from "payload";

import { Gauge } from "@/components/gauge/Gauge";
import { AppShell } from "@/components/shell/AppShell";
import { Assemble, Metric } from "@/components/ui/metric";
import { getCurrentContext } from "@/lib/auth";
import { spendCoveragePct } from "@/lib/suppliers";
import config from "@/payload.config";

function daysUntil(iso: string): number {
  const target = new Date(iso).getTime();
  const now = Date.now();
  return Math.ceil((target - now) / (1000 * 60 * 60 * 24));
}

export default async function RunwayPage() {
  const ctx = await getCurrentContext();
  if (!ctx.activeOrg) {
    redirect("/app/onboarding");
  }
  if (!ctx.activeOrg.onboardedAt) {
    redirect("/app/onboarding");
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

  let collected = 0;
  const required = 18;
  if (period) {
    const dps = await payload.find({
      collection: "datapoints",
      where: {
        and: [
          { organisation: { equals: ctx.activeOrg.id } },
          { period: { equals: period.id } },
          { quality: { not_equals: "missing" } },
        ],
      },
      limit: 100,
      overrideAccess: true,
    });
    collected = dps.docs.length;
  }

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

  const nextActions = [
    { label: "Enter electricity (kWh)", href: "/app/data#electricity_kwh" },
    { label: "Request supplier Scope 3 data", href: "/app/suppliers" },
    { label: "Confirm headcount (FTE)", href: "/app/data#employees_total" },
  ];

  return (
    <AppShell
      orgs={ctx.memberships.map((m) => ({
        id: m.organisationId,
        name: m.organisationName,
      }))}
      activeOrgId={ctx.activeOrg.id}
    >
      <main className="mx-auto grid max-w-6xl gap-12 px-6 py-12 lg:grid-cols-[minmax(0,66ch)_280px]">
        <Assemble layer="structure" as="section">
          <div className="title-rule pt-4">
            <p className="label-caps">Compliance runway</p>
            <h1 className="font-display mt-2 text-[28px] tracking-[-0.01em] text-ink">
              {ctx.activeOrg.name}
            </h1>
          </div>
          {days === null ? (
            <p className="mt-8 text-ink-muted">
              No filing deadline on file. Add a compliance obligation to start the
              countdown.
            </p>
          ) : (
            <Assemble layer="data" className="mt-8">
              <Metric value={days} size="display" decimals={0} />
              <p className="label-caps mt-2">Days to filing</p>
              <div className="mt-8 flex items-baseline gap-1">
                <Metric value={collected} size="lg" decimals={0} />
                <span className="font-data text-xl text-ink-muted">/</span>
                <Metric
                  value={required}
                  size="lg"
                  decimals={0}
                  animate={false}
                  tone="muted"
                />
              </div>
              <p className="label-caps mt-1">Datapoints collected</p>
              {coveragePct !== null ? (
                <>
                  <div className="mt-6">
                    <Metric value={coveragePct} unit="%" size="lg" decimals={0} />
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
                  />{" "}
                  days.
                </p>
              ) : (
                <p className="mt-4 text-signal">On track at current collection rate.</p>
              )}
            </Assemble>
          )}

          <div className="mt-12">
            <p className="label-caps section-rule mb-4 pb-2">Next actions</p>
            <ul className="space-y-0">
              {nextActions.map((a) => (
                <li key={a.href} className="border-b border-rule">
                  <Link
                    href={a.href}
                    className="panel-hover block px-1 py-3 text-sm text-ink"
                  >
                    {a.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </Assemble>

        <Assemble
          layer="data"
          as="section"
          className="flex flex-col border-l border-rule pl-8 max-lg:border-l-0 max-lg:pl-0"
        >
          <Gauge score={62} previousScore={58} />
          <div className="mt-10 w-full">
            <p className="label-caps section-rule mb-3 pb-2">Emissions stack</p>
            <div className="flex h-8 w-full overflow-hidden border border-rule bg-surface-2">
              <div className="bg-rust/80" style={{ width: "28%" }} title="Scope 1" />
              <div className="bg-amber/80" style={{ width: "22%" }} title="Scope 2" />
              <div className="bg-cobalt/80" style={{ width: "50%" }} title="Scope 3" />
            </div>
            <div className="mt-2 flex justify-between text-xs font-semibold uppercase tracking-[0.08em] text-ink-muted">
              <span>S1</span>
              <span>S2</span>
              <span>S3</span>
            </div>
          </div>
        </Assemble>
      </main>
    </AppShell>
  );
}
