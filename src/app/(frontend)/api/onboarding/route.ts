import { getPayload } from "payload";
import { NextResponse } from "next/server";

import { ACTIVE_ORG_COOKIE, getCurrentContext } from "@/lib/auth";
import config from "@/payload.config";

function slugify(input: string): string {
  return (
    input
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 48) || "org"
  );
}

export async function POST(req: Request) {
  const ctx = await getCurrentContext();
  if (ctx.role === "viewer") {
    return NextResponse.json({ error: "Viewers cannot onboard" }, { status: 403 });
  }

  const body = (await req.json()) as {
    sector?: string;
    headcount?: string;
    country?: string;
    revenueBand?: string;
    orgName?: string;
  };

  const payload = await getPayload({ config });
  let orgId = ctx.activeOrg?.id ?? null;
  const sector = body.sector ?? ctx.activeOrg?.sector ?? "C25";
  const country = body.country ?? ctx.activeOrg?.country ?? "GB";
  const revenueBand = body.revenueBand as
    "lt_2m" | "2_10m" | "10_50m" | "50_250m" | "gt_250m" | undefined;
  const employeeCount = body.headcount ? Number(body.headcount) : undefined;
  const onboardedAt = new Date().toISOString();

  if (!orgId) {
    const baseName =
      body.orgName?.trim() ||
      `${ctx.user.firstName ?? "My"} organisation`.trim() ||
      "My organisation";
    const baseSlug = `${slugify(baseName)}-${Date.now().toString(36)}`;
    const org = await payload.create({
      collection: "organisations",
      data: {
        name: baseName,
        slug: baseSlug,
        type: "company",
        sector,
        country,
        employeeCount,
        revenueBand,
        plan: "free",
        subscriptionStatus: "none",
        onboardedAt,
      },
      overrideAccess: true,
    });
    orgId = org.id;

    await payload.create({
      collection: "memberships",
      data: {
        organisation: orgId,
        user: ctx.user.id,
        role: "owner",
        status: "active",
        acceptedAt: new Date().toISOString(),
      },
      overrideAccess: true,
    });
  } else {
    await payload.update({
      collection: "organisations",
      id: orgId,
      data: {
        sector,
        country,
        employeeCount,
        revenueBand,
        onboardedAt,
      },
      overrideAccess: true,
    });
  }

  const existing = await payload.find({
    collection: "compliance-obligations",
    where: { organisation: { equals: orgId } },
    limit: 1,
    overrideAccess: true,
  });

  if (!existing.docs[0]) {
    const deadlineYear = country === "IN" ? 2026 : 2028;
    await payload.create({
      collection: "compliance-obligations",
      data: {
        organisation: orgId,
        wave: country === "IN" ? "brsr_listed" : "2",
        jurisdiction: country === "IN" ? "IN" : "EU",
        standardVersion: country === "IN" ? "BRSR" : "CSRD_SIMPLIFIED",
        firstReportingFY: country === "IN" ? "FY2025" : "FY2027",
        filingDeadline: `${deadlineYear}-06-30`,
      },
      overrideAccess: true,
    });
  }

  const res = NextResponse.json({ ok: true, organisationId: orgId });
  res.cookies.set(ACTIVE_ORG_COOKIE, orgId, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
  });
  return res;
}
