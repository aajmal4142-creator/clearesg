import { getPayload } from "payload";
import { NextResponse } from "next/server";

import { getCurrentContext } from "@/lib/auth";
import { BillingDeniedError, billingDeniedResponse } from "@/lib/billing";
import { ensureOpenPeriod } from "@/lib/org/period";
import config from "@/payload.config";

export async function POST(req: Request) {
  const ctx = await getCurrentContext();
  if (!ctx.activeOrg || !ctx.role) {
    return NextResponse.json({ error: "No active organisation" }, { status: 403 });
  }
  if (ctx.role === "viewer") {
    return NextResponse.json(
      { error: "Viewers cannot write datapoints" },
      { status: 403 },
    );
  }

  const body = (await req.json()) as {
    metricKey?: string;
    value?: number | null;
    quality?: "measured" | "calculated" | "estimated" | "missing";
    unit?: string;
  };
  if (!body.metricKey || !body.quality) {
    return NextResponse.json(
      { error: "metricKey and quality required" },
      { status: 400 },
    );
  }

  let periodId: string;
  try {
    periodId = await ensureOpenPeriod(ctx.activeOrg.id, ctx.activeOrg.plan);
  } catch (err) {
    if (err instanceof BillingDeniedError) {
      return NextResponse.json(billingDeniedResponse(err), { status: 402 });
    }
    throw err;
  }

  const payload = await getPayload({ config });
  const existing = await payload.find({
    collection: "datapoints",
    where: {
      and: [
        { organisation: { equals: ctx.activeOrg.id } },
        { period: { equals: periodId } },
        { metricKey: { equals: body.metricKey } },
      ],
    },
    limit: 1,
    overrideAccess: true,
  });

  const data = {
    organisation: ctx.activeOrg.id,
    period: periodId,
    metricKey: body.metricKey,
    value: body.value ?? undefined,
    unit: body.unit,
    quality: body.quality,
    source: "manual" as const,
    enteredBy: ctx.user.id,
    enteredAt: new Date().toISOString(),
  };

  if (existing.docs[0]) {
    await payload.update({
      collection: "datapoints",
      id: existing.docs[0].id,
      data,
      overrideAccess: true,
    });
  } else {
    await payload.create({
      collection: "datapoints",
      data,
      overrideAccess: true,
    });
  }

  return NextResponse.json({ ok: true });
}
