import { getPayload } from "payload";
import { NextResponse } from "next/server";

import {
  assertRateLimit,
  isTokenExpired,
  SUPPLIER_FORM_FIELDS,
  type SupplierFormValues,
} from "@/lib/suppliers";
import { ensureOpenPeriod, reaggregateSupplierReported } from "@/lib/suppliers/aggregate";
import config from "@/payload.config";

type Ctx = { params: Promise<{ token: string }> };

function clientKey(req: Request, token: string): string {
  const fwd = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const ip = fwd || req.headers.get("x-real-ip") || "unknown";
  return `${token}:${ip}`;
}

export async function GET(req: Request, ctx: Ctx) {
  const { token } = await ctx.params;
  const limited = await assertRateLimit(`get:${clientKey(req, token)}`);
  if (!limited.ok) {
    return NextResponse.json(
      { error: "Rate limit exceeded" },
      { status: 429, headers: { "Retry-After": String(limited.retryAfterSec) } },
    );
  }

  const payload = await getPayload({ config });
  const found = await payload.find({
    collection: "suppliers",
    where: { requestToken: { equals: token } },
    limit: 1,
    depth: 1,
    overrideAccess: true,
  });
  const supplier = found.docs[0];
  if (!supplier) {
    return NextResponse.json({ error: "Link not found" }, { status: 404 });
  }

  if (supplier.requestStatus === "sent") {
    await payload.update({
      collection: "suppliers",
      id: supplier.id,
      data: { requestStatus: "opened" },
      overrideAccess: true,
    });
  }

  const org =
    typeof supplier.organisation === "object" && supplier.organisation !== null
      ? supplier.organisation
      : null;

  const expired = isTokenExpired(
    supplier.requestExpiresAt ? String(supplier.requestExpiresAt) : null,
  );
  const used = supplier.requestStatus === "submitted";

  return NextResponse.json({
    orgName: org && "name" in org ? String(org.name) : "ClearESG customer",
    supplierName: supplier.name,
    fields: SUPPLIER_FORM_FIELDS,
    expired,
    used,
    expiresAt: supplier.requestExpiresAt ?? null,
  });
}

export async function POST(req: Request, ctx: Ctx) {
  const { token } = await ctx.params;
  const limited = await assertRateLimit(`post:${clientKey(req, token)}`);
  if (!limited.ok) {
    return NextResponse.json(
      { error: "Rate limit exceeded" },
      { status: 429, headers: { "Retry-After": String(limited.retryAfterSec) } },
    );
  }

  const payload = await getPayload({ config });
  const found = await payload.find({
    collection: "suppliers",
    where: { requestToken: { equals: token } },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  });
  const supplier = found.docs[0];
  if (!supplier) {
    return NextResponse.json({ error: "Link not found" }, { status: 404 });
  }
  if (supplier.requestStatus === "submitted") {
    return NextResponse.json({ error: "This link was already used" }, { status: 409 });
  }
  if (
    isTokenExpired(supplier.requestExpiresAt ? String(supplier.requestExpiresAt) : null)
  ) {
    return NextResponse.json({ error: "This link has expired" }, { status: 410 });
  }

  const body = (await req.json()) as SupplierFormValues;
  const submitted: Record<string, number | null> = {};
  for (const field of SUPPLIER_FORM_FIELDS) {
    const raw = body[field.key];
    if (raw === undefined || raw === null || raw === ("" as unknown)) {
      if (field.required) {
        return NextResponse.json({ error: `${field.key} is required` }, { status: 400 });
      }
      submitted[field.key] = null;
      continue;
    }
    const n = Number(raw);
    if (!Number.isFinite(n) || n < 0) {
      return NextResponse.json(
        { error: `${field.key} must be a non-negative number` },
        { status: 400 },
      );
    }
    submitted[field.key] = n;
  }

  const orgId =
    typeof supplier.organisation === "object" && supplier.organisation !== null
      ? supplier.organisation.id
      : String(supplier.organisation);

  await payload.update({
    collection: "suppliers",
    id: supplier.id,
    data: {
      requestStatus: "submitted",
      respondedAt: new Date().toISOString(),
      submittedData: submitted,
      // Invalidate token for single-use
      requestToken: `used-${supplier.id}-${Date.now()}`,
    },
    overrideAccess: true,
  });

  const periodId = await ensureOpenPeriod(payload, orgId);
  await reaggregateSupplierReported(payload, orgId, periodId);

  return NextResponse.json({ ok: true });
}
