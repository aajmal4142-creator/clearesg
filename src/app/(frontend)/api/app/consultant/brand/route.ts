import { getPayload } from "payload";
import { NextResponse } from "next/server";

import { getCurrentContext } from "@/lib/auth";
import {
  BillingDeniedError,
  billingDeniedResponse,
  can,
  normalizePlan,
} from "@/lib/billing";
import config from "@/payload.config";

/** Update consultancy white-label brand (primary colour + domain). */
export async function PUT(req: Request) {
  const ctx = await getCurrentContext();
  if (!ctx.activeOrg || ctx.activeOrg.type !== "consultancy") {
    return NextResponse.json({ error: "Consultancy required" }, { status: 403 });
  }
  if (ctx.role !== "owner" && ctx.role !== "admin") {
    return NextResponse.json({ error: "Admin required" }, { status: 403 });
  }
  if (!can(ctx.activeOrg.plan, "white_label")) {
    return NextResponse.json(
      billingDeniedResponse(
        new BillingDeniedError(normalizePlan(ctx.activeOrg.plan), "white_label"),
      ),
      { status: 402 },
    );
  }

  const body = (await req.json()) as {
    primaryColor?: string;
    domain?: string;
  };

  if (body.primaryColor && !/^#[0-9A-Fa-f]{6}$/.test(body.primaryColor)) {
    return NextResponse.json({ error: "primaryColor must be #RRGGBB" }, { status: 400 });
  }

  const payload = await getPayload({ config });
  await payload.update({
    collection: "organisations",
    id: ctx.activeOrg.id,
    data: {
      brand: {
        primaryColor: body.primaryColor,
        domain: body.domain?.trim() || undefined,
      },
    },
    overrideAccess: true,
  });

  return NextResponse.json({ ok: true });
}
