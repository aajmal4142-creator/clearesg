import { getPayload } from "payload";
import { NextResponse } from "next/server";

import { getCurrentContext } from "@/lib/auth";
import { assertCan, BillingDeniedError, billingDeniedResponse } from "@/lib/billing";
import { writeAuditLog } from "@/lib/audit/write";
import { sendTransactionalEmail } from "@/lib/email/send";
import config from "@/payload.config";

/**
 * Consultant → client invite: pre-branded child org, half set-up. §15.3
 */
export async function POST(req: Request) {
  const ctx = await getCurrentContext();
  if (!ctx.activeOrg || !ctx.role) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (ctx.activeOrg.type !== "consultancy") {
    return NextResponse.json(
      { error: "Only consultancy organisations can invite clients" },
      { status: 403 },
    );
  }
  try {
    assertCan(ctx.activeOrg.plan, "consultant_cc");
  } catch (err) {
    if (err instanceof BillingDeniedError) {
      return NextResponse.json(billingDeniedResponse(err), { status: 402 });
    }
    throw err;
  }

  const body = (await req.json()) as {
    email?: string;
    clientName?: string;
    sector?: string;
    country?: string;
    framework?: "CSRD_SIMPLIFIED" | "BRSR";
  };
  const email = body.email?.trim().toLowerCase();
  if (!email || !body.clientName?.trim()) {
    return NextResponse.json({ error: "email and clientName required" }, { status: 400 });
  }

  const payload = await getPayload({ config });
  const parent = await payload.findByID({
    collection: "organisations",
    id: ctx.activeOrg.id,
    depth: 0,
    overrideAccess: true,
  });

  const slugBase = body.clientName
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40);
  const slug = `${slugBase}-${Date.now().toString(36)}`;

  const child = await payload.create({
    collection: "organisations",
    data: {
      name: body.clientName.trim(),
      slug,
      type: "company",
      parentOrg: parent.id,
      sector: body.sector ?? parent.sector,
      country: body.country ?? parent.country ?? "IN",
      plan: "free",
      brand: parent.brand
        ? {
            primaryColor: parent.brand.primaryColor,
            domain: parent.brand.domain,
            logo: parent.brand.logo,
          }
        : undefined,
    },
    overrideAccess: true,
  });

  let user = (
    await payload.find({
      collection: "users",
      where: { email: { equals: email } },
      limit: 1,
      overrideAccess: true,
    })
  ).docs[0];
  if (!user) {
    user = await payload.create({
      collection: "users",
      data: {
        email,
        password: `invite-pending-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      },
      overrideAccess: true,
    });
  }

  await payload.create({
    collection: "memberships",
    data: {
      organisation: child.id,
      user: user.id,
      role: "owner",
      status: "invited",
      invitedBy: ctx.user.id,
      invitedAt: new Date().toISOString(),
    },
    overrideAccess: true,
  });

  const framework =
    body.framework ??
    (body.country === "IN" || !body.country ? "BRSR" : "CSRD_SIMPLIFIED");
  await payload.create({
    collection: "compliance-obligations",
    data: {
      organisation: child.id,
      wave: framework === "BRSR" ? "brsr_supply" : "3",
      jurisdiction: body.country ?? "IN",
      standardVersion: framework,
      firstReportingFY: `FY${new Date().getFullYear()}`,
      filingDeadline: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString(),
    },
    overrideAccess: true,
  });

  const origin = new URL(req.url).origin;
  const delivery = await sendTransactionalEmail({
    to: email,
    subject: `${parent.name} invited you to ClearESG`,
    html: `<p><strong>${parent.name}</strong> set up <strong>${child.name}</strong> for ESG reporting.</p><p><a href="${origin}/sign-in">Sign in to continue onboarding</a></p>`,
  });

  await writeAuditLog(payload, {
    organisationId: parent.id,
    actorId: ctx.user.id,
    action: "consultant.client_invite",
    entityType: "organisations",
    entityId: child.id,
    after: { email, framework, slug: child.slug },
  });

  return NextResponse.json({
    ok: true,
    clientId: child.id,
    slug: child.slug,
    delivery: delivery.delivery,
  });
}
