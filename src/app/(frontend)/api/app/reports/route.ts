import { randomBytes } from "node:crypto";

import { getPayload } from "payload";
import { NextResponse } from "next/server";

import { getCurrentContext } from "@/lib/auth";
import { BillingDeniedError, billingDeniedResponse } from "@/lib/billing";
import { ensureOpenPeriod } from "@/lib/org/period";
import { buildReportSnapshot, diffSnapshots, type ReportSnapshot } from "@/lib/reports";
import config from "@/payload.config";

async function withPeriod<T>(run: () => Promise<T>): Promise<T | NextResponse> {
  try {
    return await run();
  } catch (err) {
    if (err instanceof BillingDeniedError) {
      return NextResponse.json(billingDeniedResponse(err), { status: 402 });
    }
    throw err;
  }
}

export async function GET() {
  const ctx = await getCurrentContext();
  if (!ctx.activeOrg) {
    return NextResponse.json({ error: "No active organisation" }, { status: 403 });
  }
  return withPeriod(async () => {
    const payload = await getPayload({ config });
    const periodId = await ensureOpenPeriod(ctx.activeOrg!.id, ctx.activeOrg!.plan);
    const reports = await payload.find({
      collection: "reports",
      where: {
        and: [
          { organisation: { equals: ctx.activeOrg!.id } },
          { period: { equals: periodId } },
        ],
      },
      sort: "-version",
      limit: 20,
      overrideAccess: true,
    });

    return NextResponse.json({
      periodId,
      reports: reports.docs.map((r) => ({
        id: r.id,
        version: r.version,
        status: r.status,
        framework: r.framework,
        shareToken: r.shareToken ?? null,
        publishedAt: r.publishedAt ?? null,
        scores: r.scores,
        viewCount: r.viewCount ?? 0,
      })),
    });
  });
}

export async function POST(req: Request) {
  const ctx = await getCurrentContext();
  if (!ctx.activeOrg || !ctx.role) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (ctx.role === "viewer" || ctx.role === "contributor") {
    return NextResponse.json(
      { error: "Admin required to publish reports" },
      { status: 403 },
    );
  }

  const body = (await req.json()) as {
    framework?: "CSRD_SET1" | "CSRD_SIMPLIFIED" | "BRSR" | "VSME" | "GRI" | "CUSTOM";
    shareDays?: number;
  };
  const framework = body.framework ?? "CSRD_SIMPLIFIED";

  return withPeriod(async () => {
    const payload = await getPayload({ config });
    const periodId = await ensureOpenPeriod(ctx.activeOrg!.id, ctx.activeOrg!.plan);

    const existing = await payload.find({
      collection: "reports",
      where: {
        and: [
          { organisation: { equals: ctx.activeOrg!.id } },
          { period: { equals: periodId } },
          { framework: { equals: framework } },
        ],
      },
      sort: "-version",
      limit: 1,
      overrideAccess: true,
    });
    const nextVersion = (existing.docs[0]?.version ?? 0) + 1;

    const snapshot = await buildReportSnapshot({
      organisationId: ctx.activeOrg!.id,
      periodId,
      framework,
      version: nextVersion,
    });

    const shareToken = randomBytes(18).toString("base64url");
    const shareDays = body.shareDays ?? 90;
    const shareExpiresAt = new Date();
    shareExpiresAt.setUTCDate(shareExpiresAt.getUTCDate() + shareDays);

    const report = await payload.create({
      collection: "reports",
      data: {
        organisation: ctx.activeOrg!.id,
        period: periodId,
        framework,
        version: nextVersion,
        status: "published",
        scores: snapshot.scores,
        emissions: {
          scope1: snapshot.emissions.scope1,
          scope2: snapshot.emissions.scope2,
          scope3: snapshot.emissions.scope3,
        },
        dataQualityPct: snapshot.emissions.dataQualityPct,
        snapshot,
        shareToken,
        shareExpiresAt: shareExpiresAt.toISOString(),
        viewCount: 0,
        publishedAt: new Date().toISOString(),
        publishedBy: ctx.user.id,
      },
      overrideAccess: true,
    });

    let diff: ReturnType<typeof diffSnapshots> = [];
    if (existing.docs[0]?.snapshot) {
      diff = diffSnapshots(existing.docs[0].snapshot as ReportSnapshot, snapshot);
    }

    const origin = new URL(req.url).origin;
    return NextResponse.json({
      ok: true,
      id: report.id,
      version: nextVersion,
      shareUrl: `${origin}/r/${shareToken}`,
      diff,
    });
  });
}
