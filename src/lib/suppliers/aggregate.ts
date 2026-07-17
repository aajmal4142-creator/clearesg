import type { Payload } from "payload";

import { SUPPLIER_REPORTED_METRIC } from "@/lib/suppliers";

/** Sum estimated_tco2e from all submitted suppliers into one org datapoint. */
export async function reaggregateSupplierReported(
  payload: Payload,
  organisationId: string,
  periodId: string,
): Promise<void> {
  const suppliers = await payload.find({
    collection: "suppliers",
    where: {
      and: [
        { organisation: { equals: organisationId } },
        { requestStatus: { equals: "submitted" } },
      ],
    },
    limit: 500,
    overrideAccess: true,
  });

  let sum = 0;
  let any = false;
  for (const s of suppliers.docs) {
    const data = s.submittedData as { estimated_tco2e?: number | null } | null;
    const v = data?.estimated_tco2e;
    if (typeof v === "number" && Number.isFinite(v)) {
      sum += v;
      any = true;
    }
  }

  const existing = await payload.find({
    collection: "datapoints",
    where: {
      and: [
        { organisation: { equals: organisationId } },
        { period: { equals: periodId } },
        { metricKey: { equals: SUPPLIER_REPORTED_METRIC } },
      ],
    },
    limit: 1,
    overrideAccess: true,
  });

  if (!any) {
    if (existing.docs[0]) {
      await payload.update({
        collection: "datapoints",
        id: existing.docs[0].id,
        data: {
          value: undefined,
          quality: "missing",
          source: "supplier",
          note: "No supplier estimated_tco2e values submitted",
        },
        overrideAccess: true,
      });
    }
    return;
  }

  const data = {
    organisation: organisationId,
    period: periodId,
    metricKey: SUPPLIER_REPORTED_METRIC,
    value: sum,
    unit: "tCO2e",
    quality: "measured" as const,
    source: "supplier" as const,
    enteredAt: new Date().toISOString(),
    note: `Sum of ${suppliers.docs.length} supplier submission(s)`,
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
}

export async function ensureOpenPeriod(
  payload: Payload,
  organisationId: string,
): Promise<string> {
  const periods = await payload.find({
    collection: "reporting-periods",
    where: {
      and: [{ organisation: { equals: organisationId } }, { status: { equals: "open" } }],
    },
    limit: 1,
    overrideAccess: true,
  });
  if (periods.docs[0]) return periods.docs[0].id;

  const year = new Date().getFullYear();
  const period = await payload.create({
    collection: "reporting-periods",
    data: {
      organisation: organisationId,
      label: `FY${year}`,
      startDate: `${year - 1}-04-01`,
      endDate: `${year}-03-31`,
      status: "open",
    },
    overrideAccess: true,
  });
  return period.id;
}
