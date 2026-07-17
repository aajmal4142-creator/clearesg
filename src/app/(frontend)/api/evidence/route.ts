import { createHash } from "node:crypto";

import { getPayload } from "payload";
import { NextResponse } from "next/server";

import { getCurrentContext } from "@/lib/auth";
import { BillingDeniedError, billingDeniedResponse, can } from "@/lib/billing";
import config from "@/payload.config";

/**
 * Evidence vault — sha256 is the audit anchor; Media holds the binary.
 * Pro / Consultant entitlement.
 */
export async function POST(req: Request) {
  const ctx = await getCurrentContext();
  if (!ctx.activeOrg || !ctx.role) {
    return NextResponse.json({ error: "No active organisation" }, { status: 403 });
  }
  if (ctx.role === "viewer") {
    return NextResponse.json(
      { error: "Viewers cannot upload evidence" },
      { status: 403 },
    );
  }
  if (!can(ctx.activeOrg.plan, "evidence_vault")) {
    const err = new BillingDeniedError(
      ctx.activeOrg.plan === "pro" || ctx.activeOrg.plan === "consultant"
        ? ctx.activeOrg.plan
        : "free",
      "evidence_vault",
    );
    return NextResponse.json(billingDeniedResponse(err), { status: 402 });
  }

  const form = await req.formData();
  const file = form.get("file");
  const metricKey = String(form.get("metricKey") ?? "");
  const datapointId = form.get("datapointId")
    ? String(form.get("datapointId"))
    : undefined;

  if (!(file instanceof File) || !metricKey) {
    return NextResponse.json({ error: "file and metricKey required" }, { status: 400 });
  }

  const buf = Buffer.from(await file.arrayBuffer());
  const sha256 = createHash("sha256").update(buf).digest("hex");

  const payload = await getPayload({ config });
  const media = await payload.create({
    collection: "media",
    data: { alt: `${metricKey} evidence: ${file.name}` },
    file: {
      data: buf,
      mimetype: file.type || "application/octet-stream",
      name: file.name,
      size: buf.byteLength,
    },
    overrideAccess: true,
  });

  const evidence = await payload.create({
    collection: "evidence",
    data: {
      organisation: ctx.activeOrg.id,
      file: media.id,
      filename: file.name,
      mimeType: file.type || "application/octet-stream",
      size: buf.byteLength,
      sha256,
      uploadedBy: ctx.user.id,
      uploadedAt: new Date().toISOString(),
      linkedDatapoints: datapointId ? [datapointId] : undefined,
      extractedData: { metricKey },
      ocrStatus: "pending",
    },
    overrideAccess: true,
  });

  return NextResponse.json({
    ok: true,
    id: evidence.id,
    sha256,
  });
}
