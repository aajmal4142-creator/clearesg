import { getPayload } from "payload";
import { NextResponse } from "next/server";

import { getCurrentContext } from "@/lib/auth";
import {
  appOrigin,
  getStripe,
  isPlanId,
  stripeConfigured,
  stripePriceIdForPlan,
  type PlanId,
} from "@/lib/billing";
import {
  mayEnablePaidBilling,
  paidBillingDenial,
  devBypassAllowed,
} from "@/lib/launch/gates";
import config from "@/payload.config";

/**
 * Start Checkout for Pro or Consultant.
 * Paid LIVE requires WS0 sign-off (§17.2). Dev bypass only outside production.
 */
export async function POST(req: Request) {
  const ctx = await getCurrentContext();
  if (!ctx.activeOrg) {
    return NextResponse.json({ error: "No active organisation" }, { status: 403 });
  }
  if (ctx.role !== "owner" && ctx.role !== "admin") {
    return NextResponse.json({ error: "Admin required for billing" }, { status: 403 });
  }

  const body = (await req.json()) as { plan?: string };
  if (!body.plan || body.plan === "free" || !isPlanId(body.plan)) {
    return NextResponse.json(
      { error: "plan must be pro or consultant" },
      { status: 400 },
    );
  }
  const target = body.plan as Exclude<PlanId, "free">;

  if (!mayEnablePaidBilling()) {
    return NextResponse.json(paidBillingDenial(), { status: 403 });
  }

  const origin = appOrigin(req);
  const payload = await getPayload({ config });

  if (!stripeConfigured()) {
    if (!devBypassAllowed()) {
      return NextResponse.json(
        { error: "Stripe is not configured. Set STRIPE_SECRET_KEY." },
        { status: 503 },
      );
    }
    await payload.update({
      collection: "organisations",
      id: ctx.activeOrg.id,
      data: {
        plan: target,
        subscriptionStatus: "active",
      },
      overrideAccess: true,
    });
    return NextResponse.json({
      ok: true,
      mode: "dev_bypass",
      url: `${origin}/dashboard/billing?upgraded=${target}`,
    });
  }

  const stripe = getStripe();
  const org = await payload.findByID({
    collection: "organisations",
    id: ctx.activeOrg.id,
    depth: 0,
    overrideAccess: true,
  });

  let customerId = org.stripeCustomerId ?? null;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: ctx.user.email,
      name: org.name,
      metadata: {
        organisationId: org.id,
        organisationSlug: org.slug,
      },
    });
    customerId = customer.id;
    await payload.update({
      collection: "organisations",
      id: org.id,
      data: { stripeCustomerId: customerId },
      overrideAccess: true,
    });
  }

  const priceId = stripePriceIdForPlan(target);
  if (!priceId) {
    return NextResponse.json(
      {
        error: `Missing env ${target === "pro" ? "STRIPE_PRICE_PRO" : "STRIPE_PRICE_CONSULTANT"}`,
      },
      { status: 503 },
    );
  }

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${origin}/dashboard/billing?checkout=success`,
    cancel_url: `${origin}/dashboard/billing?checkout=cancel`,
    metadata: {
      organisationId: org.id,
      plan: target,
    },
    subscription_data: {
      metadata: {
        organisationId: org.id,
        plan: target,
      },
    },
  });

  if (!session.url) {
    return NextResponse.json({ error: "Checkout session missing URL" }, { status: 500 });
  }

  return NextResponse.json({ ok: true, mode: "stripe", url: session.url });
}
