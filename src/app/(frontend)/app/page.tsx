import Link from "next/link";
import { redirect } from "next/navigation";
import { getPayload } from "payload";

import { Gauge } from "@/components/gauge/Gauge";
import { CountUp } from "@/components/runway/CountUp";
import { AppShell } from "@/components/shell/AppShell";
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
      <main className="mx-auto grid max-w-6xl gap-12 px-6 py-12 lg:grid-cols-[1.1fr_0.9fr]">
        <section>
          <p className="label-caps">Compliance runway</p>
          <p className="mt-2 text-ash">{ctx.activeOrg.name}</p>
          {days === null ? (
            <p className="mt-8 text-ash">
              No filing deadline on file. Add a compliance obligation to start the
              countdown.
            </p>
          ) : (
            <>
              <p className="font-data mt-6 text-[64px] leading-none text-bone md:text-[96px]">
                <CountUp value={days} />
              </p>
              <p className="label-caps mt-2">Days to filing</p>
              <p className="font-data mt-8 text-xl text-bone">
                {collected}
                <span className="text-ash"> / {required}</span>
              </p>
              <p className="label-caps mt-1">Datapoints collected</p>
              {coveragePct !== null ? (
                <>
                  <p className="font-data mt-6 text-xl text-bone">{coveragePct}%</p>
                  <p className="label-caps mt-1">Supplier spend covered</p>
                </>
              ) : null}
              {projectedMiss > 0 ? (
                <p className="mt-4 text-rust">
                  At your current rate you will miss the deadline by{" "}
                  <span className="font-data">{projectedMiss}</span> days.
                </p>
              ) : (
                <p className="mt-4 text-signal">On track at current collection rate.</p>
              )}
            </>
          )}

          <div className="mt-12">
            <p className="label-caps mb-4">Next actions</p>
            <ul className="space-y-2">
              {nextActions.map((a) => (
                <li key={a.href}>
                  <Link
                    href={a.href}
                    className="block border border-graphite px-3 py-2 text-sm text-bone hover:border-ash"
                  >
                    {a.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="flex flex-col items-center">
          <Gauge score={62} previousScore={58} />
          <div className="mt-10 w-full max-w-sm">
            <p className="label-caps mb-3">Emissions stack (illustrative)</p>
            <div className="flex h-8 w-full overflow-hidden border border-graphite">
              <div className="bg-rust/80" style={{ width: "28%" }} title="Scope 1" />
              <div className="bg-amber/80" style={{ width: "22%" }} title="Scope 2" />
              <div
                className="bg-ultramarine/80"
                style={{ width: "50%" }}
                title="Scope 3"
              />
            </div>
            <div className="mt-2 flex justify-between text-xs text-ash">
              <span>S1</span>
              <span>S2</span>
              <span>S3</span>
            </div>
          </div>
        </section>
      </main>
    </AppShell>
  );
}
