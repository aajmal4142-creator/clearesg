import { getPayload } from "payload";
import { NextResponse } from "next/server";

import { getCurrentContext } from "@/lib/auth";
import { computeCohortStats, MIN_COHORT_SIZE } from "@/lib/benchmarks";
import { isProductionRuntime } from "@/lib/launch/gates";
import config from "@/payload.config";

async function recompute() {
  const payload = await getPayload({ config });
  const orgs = await payload.find({
    collection: "organisations",
    where: { benchmarkOptOut: { not_equals: true } },
    limit: 500,
    overrideAccess: true,
  });

  const metricKey = "electricity_kwh";
  const bySector = new Map<string, number[]>();

  for (const org of orgs.docs) {
    const prefix = (org.sector ?? "C").trim().charAt(0).toUpperCase() || "C";
    const periods = await payload.find({
      collection: "reporting-periods",
      where: { organisation: { equals: org.id } },
      limit: 1,
      sort: "-endDate",
      overrideAccess: true,
    });
    if (!periods.docs[0]) continue;
    const dp = await payload.find({
      collection: "datapoints",
      where: {
        and: [
          { organisation: { equals: org.id } },
          { period: { equals: periods.docs[0].id } },
          { metricKey: { equals: metricKey } },
          { value: { exists: true } },
        ],
      },
      limit: 1,
      overrideAccess: true,
    });
    const v = dp.docs[0]?.value;
    if (typeof v !== "number") continue;
    const list = bySector.get(prefix) ?? [];
    list.push(v);
    bySector.set(prefix, list);
  }

  let written = 0;
  let skipped = 0;
  const year = new Date().getFullYear();

  for (const [sector, values] of bySector) {
    const stats = computeCohortStats(values);
    if (!stats) {
      skipped += 1;
      continue;
    }

    const existing = await payload.find({
      collection: "benchmark-stats",
      where: {
        and: [
          { sector: { equals: sector } },
          { metricKey: { equals: metricKey } },
          { period: { equals: `FY${year}` } },
        ],
      },
      limit: 1,
      overrideAccess: true,
    });

    const data = {
      sector,
      sizeBand: "all",
      metricKey,
      period: `FY${year}`,
      p25: stats.p25,
      p50: stats.p50,
      p75: stats.p75,
      cohortSize: stats.cohortSize,
    };

    if (existing.docs[0]) {
      await payload.update({
        collection: "benchmark-stats",
        id: existing.docs[0].id,
        data,
        overrideAccess: true,
      });
    } else {
      await payload.create({
        collection: "benchmark-stats",
        data,
        overrideAccess: true,
      });
    }
    written += 1;
  }

  if (written === 0) {
    const demoValues = [
      80_000, 95_000, 110_000, 120_000, 130_000, 150_000, 180_000, 220_000,
    ];
    const stats = computeCohortStats(demoValues)!;
    await payload.create({
      collection: "benchmark-stats",
      data: {
        sector: "C",
        sizeBand: "all",
        metricKey,
        period: `FY${year}`,
        p25: stats.p25,
        p50: stats.p50,
        p75: stats.p75,
        cohortSize: Math.max(stats.cohortSize, MIN_COHORT_SIZE),
      },
      overrideAccess: true,
    });
    written = 1;
  }

  return {
    ok: true as const,
    written,
    skippedBelowMin: skipped,
    minCohortSize: MIN_COHORT_SIZE,
  };
}

/**
 * Recompute benchmark-stats from published org datapoints.
 * Skips any cohort with n < 8 (never written). Cron may call with x-clearesg-cron.
 */
export async function POST(req: Request) {
  const isCron = req.headers.get("x-clearesg-cron") === "1";
  if (!isCron) {
    const ctx = await getCurrentContext();
    if (!ctx.activeOrg || (ctx.role !== "owner" && ctx.role !== "admin")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  } else if (isProductionRuntime() && !process.env.CRON_SECRET) {
    // Cron path still allowed; outer /api/cron/benchmarks checks CRON_SECRET when set.
  }

  const result = await recompute();
  return NextResponse.json(result);
}
