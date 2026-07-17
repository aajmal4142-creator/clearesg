import { getPayload } from "payload";
import { NextResponse } from "next/server";

import { getCurrentContext } from "@/lib/auth";
import { MIN_COHORT_SIZE, percentileRank } from "@/lib/benchmarks";
import config from "@/payload.config";

/**
 * Returns benchmarks only when cohortSize >= 8 (hard gate in query).
 */
export async function GET(req: Request) {
  const ctx = await getCurrentContext();
  if (!ctx.activeOrg) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const metricKey = new URL(req.url).searchParams.get("metricKey") ?? "electricity_kwh";
  const sectorPrefix = ctx.activeOrg.sector.trim().charAt(0).toUpperCase() || "C";

  const payload = await getPayload({ config });
  const stats = await payload.find({
    collection: "benchmark-stats",
    where: {
      and: [
        { metricKey: { equals: metricKey } },
        { sector: { equals: sectorPrefix } },
        { cohortSize: { greater_than_equal: MIN_COHORT_SIZE } },
      ],
    },
    limit: 1,
    overrideAccess: true,
  });

  const row = stats.docs[0];
  if (!row) {
    return NextResponse.json({
      available: false,
      reason: `No cohort with n ≥ ${MIN_COHORT_SIZE} for sector ${sectorPrefix} / ${metricKey}`,
      minCohortSize: MIN_COHORT_SIZE,
    });
  }

  // User's latest value for percentile position
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
  let userValue: number | null = null;
  if (periods.docs[0]) {
    const dp = await payload.find({
      collection: "datapoints",
      where: {
        and: [
          { organisation: { equals: ctx.activeOrg.id } },
          { period: { equals: periods.docs[0].id } },
          { metricKey: { equals: metricKey } },
        ],
      },
      limit: 1,
      overrideAccess: true,
    });
    const v = dp.docs[0]?.value;
    userValue = typeof v === "number" ? v : null;
  }

  // Synthetic sorted sample from quartiles for curve display (not raw peers).
  const synthetic = [
    row.p25 * 0.7,
    row.p25,
    (row.p25 + row.p50) / 2,
    row.p50,
    (row.p50 + row.p75) / 2,
    row.p75,
    row.p75 * 1.15,
    row.p75 * 1.3,
  ].sort((a, b) => a - b);

  const rank = userValue === null ? null : percentileRank(synthetic, userValue);

  return NextResponse.json({
    available: true,
    sector: row.sector,
    sizeBand: row.sizeBand,
    metricKey: row.metricKey,
    period: row.period,
    p25: row.p25,
    p50: row.p50,
    p75: row.p75,
    cohortSize: row.cohortSize,
    userValue,
    percentileRank: rank,
    improve:
      rank !== null && rank > 50
        ? [
            { label: "Enter measured electricity", href: "/app/data#electricity_kwh" },
            {
              label: "Raise renewable share",
              href: "/app/data#electricity_renewable_pct",
            },
            { label: "Request supplier data", href: "/app/suppliers" },
          ]
        : [
            { label: "Review material topics", href: "/app/materiality" },
            { label: "Publish living report", href: "/app/reports" },
          ],
  });
}
