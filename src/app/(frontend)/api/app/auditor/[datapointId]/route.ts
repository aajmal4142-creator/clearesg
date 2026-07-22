import { getPayload } from "payload";
import { NextResponse } from "next/server";

import { getCurrentContext } from "@/lib/auth";
import config from "@/payload.config";

type Props = { params: Promise<{ datapointId: string }> };

/**
 * Auditor one-click traversal. §15.1.1
 * number → evidence hash → factor metadata → quality → approval.
 */
export async function GET(_req: Request, { params }: Props) {
  const ctx = await getCurrentContext();
  if (!ctx.activeOrg) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { datapointId } = await params;
  const payload = await getPayload({ config });

  const dp = await payload.findByID({
    collection: "datapoints",
    id: datapointId,
    depth: 2,
    overrideAccess: true,
  });
  const orgId =
    typeof dp.organisation === "string" ? dp.organisation : dp.organisation?.id;
  if (orgId !== ctx.activeOrg.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const evidenceIds = (dp.evidence ?? []).map((e) => (typeof e === "string" ? e : e.id));
  const evidenceDocs = [];
  for (const id of evidenceIds) {
    const ev = await payload.findByID({
      collection: "evidence",
      id,
      depth: 1,
      overrideAccess: true,
    });
    evidenceDocs.push({
      id: ev.id,
      filename: ev.filename,
      sha256: ev.sha256,
      uploadedAt: ev.createdAt,
      ocrStatus: ev.ocrStatus,
      uploader:
        typeof ev.uploadedBy === "object" && ev.uploadedBy
          ? {
              id: ev.uploadedBy.id,
              email: "email" in ev.uploadedBy ? ev.uploadedBy.email : null,
            }
          : null,
    });
  }

  const factors = await payload.find({
    collection: "emission-factors",
    where: { key: { equals: dp.metricKey } },
    limit: 1,
    sort: "-publicationYear",
    overrideAccess: true,
  });
  const factor = factors.docs[0];

  return NextResponse.json({
    datapoint: {
      id: dp.id,
      metricKey: dp.metricKey,
      value: dp.value,
      unit: dp.unit,
      quality: dp.quality,
      approvalState: dp.approvalState ?? "pending",
      approvalReason: dp.approvalReason ?? null,
      source: dp.source,
      enteredAt: dp.enteredAt,
      note: dp.note,
    },
    evidence: evidenceDocs,
    factor: factor
      ? {
          id: factor.id,
          source: factor.source,
          publicationYear: factor.publicationYear,
          region: factor.region,
          unit: factor.unit,
          value: factor.value,
          versionLabel: `${factor.source} ${factor.publicationYear}`,
        }
      : null,
  });
}
