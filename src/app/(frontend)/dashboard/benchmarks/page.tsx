import { redirect } from "next/navigation";
import { getPayload } from "payload";

import { BenchmarksClient } from "@/app/(frontend)/dashboard/benchmarks/BenchmarksClient";
import { getCurrentContext } from "@/lib/auth";
import { MIN_COHORT_SIZE } from "@/lib/benchmarks";
import { sectorLabel } from "@/lib/ui/displayLabels";
import config from "@/payload.config";

export default async function BenchmarksPage() {
  const ctx = await getCurrentContext();
  if (!ctx.activeOrg) redirect("/dashboard/onboarding");
  if (!ctx.activeOrg.onboardedAt) redirect("/dashboard/onboarding");

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
          { label: "Enter electricity (kWh)", href: "/dashboard/data#electricity_kwh" },
          { label: "Request supplier data", href: "/dashboard/suppliers" },
          { label: "Publish report", href: "/dashboard/reports" },
        ],
      }
    : {
        available: false as const,
        reason:
          ctx.role === "owner" || ctx.role === "admin"
            ? `Not enough peers in ${sectorLabel(sectorPrefix)} yet (need ${MIN_COHORT_SIZE}+ with electricity data). Check again once more organisations have published.`
            : `Not enough peers in ${sectorLabel(sectorPrefix)} yet (need ${MIN_COHORT_SIZE}+). An admin can refresh cohorts when more organisations have data.`,
        minCohortSize: MIN_COHORT_SIZE,
      };

  return <BenchmarksClient initial={initial} role={ctx.role} />;
}
