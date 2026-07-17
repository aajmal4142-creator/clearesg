import { redirect } from "next/navigation";
import { getPayload } from "payload";

import { BenchmarksClient } from "@/app/(frontend)/app/benchmarks/BenchmarksClient";
import { AppShell } from "@/components/shell/AppShell";
import { getCurrentContext } from "@/lib/auth";
import { MIN_COHORT_SIZE } from "@/lib/benchmarks";
import config from "@/payload.config";

export default async function BenchmarksPage() {
  const ctx = await getCurrentContext();
  if (!ctx.activeOrg) redirect("/app/onboarding");
  if (!ctx.activeOrg.onboardedAt) redirect("/app/onboarding");

  const payload = await getPayload({ config });
  const sectorPrefix = ctx.activeOrg.sector.trim().charAt(0).toUpperCase() || "C";
  const stats = await payload.find({
    collection: "benchmark-stats",
    where: {
      and: [
        { metricKey: { equals: "electricity_kwh" } },
        { sector: { equals: sectorPrefix } },
        { cohortSize: { greater_than_equal: MIN_COHORT_SIZE } },
      ],
    },
    limit: 1,
    overrideAccess: true,
  });
  const row = stats.docs[0];

  const initial = row
    ? {
        available: true as const,
        sector: row.sector,
        metricKey: row.metricKey,
        p25: row.p25,
        p50: row.p50,
        p75: row.p75,
        cohortSize: row.cohortSize,
        userValue: null as number | null,
        percentileRank: null as number | null,
        improve: [
          { label: "Enter electricity (kWh)", href: "/app/data#electricity_kwh" },
          { label: "Request supplier data", href: "/app/suppliers" },
          { label: "Publish report", href: "/app/reports" },
        ],
      }
    : {
        available: false as const,
        reason: `No cohort with n ≥ ${MIN_COHORT_SIZE} for sector ${sectorPrefix}. Run recompute.`,
        minCohortSize: MIN_COHORT_SIZE,
      };

  return (
    <AppShell
      orgs={ctx.memberships.map((m) => ({
        id: m.organisationId,
        name: m.organisationName,
      }))}
      activeOrgId={ctx.activeOrg.id}
    >
      <BenchmarksClient initial={initial} />
    </AppShell>
  );
}
