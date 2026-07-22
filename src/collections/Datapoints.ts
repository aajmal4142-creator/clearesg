import type { CollectionConfig, PayloadRequest } from "payload";

import { tenantAccess } from "@/lib/access";

async function periodIsWritable(req: PayloadRequest, periodId: string): Promise<boolean> {
  const period = await req.payload.findByID({
    collection: "reporting-periods",
    id: periodId,
    depth: 0,
    overrideAccess: true,
  });
  return period.status === "open";
}

function periodIdOf(value: unknown): string | null {
  if (!value) return null;
  if (typeof value === "string") return value;
  if (typeof value === "object" && value !== null && "id" in value) {
    return String((value as { id: string }).id);
  }
  return null;
}

export const Datapoints: CollectionConfig = {
  slug: "datapoints",
  admin: {
    defaultColumns: ["metricKey", "organisation", "period", "value", "quality"],
  },
  access: tenantAccess({ writeMin: "contributor", adminWriteMin: "admin" }),
  indexes: [
    {
      fields: ["organisation", "period", "metricKey"],
      unique: true,
    },
  ],
  hooks: {
    beforeChange: [
      async ({ data, req, operation }) => {
        const periodId = periodIdOf(data?.period);
        if (!periodId) {
          throw new Error("Datapoint requires a reporting period.");
        }
        const writable = await periodIsWritable(req, periodId);
        if (!writable) {
          throw new Error(
            "Reporting period is locked or published. Datapoint writes are rejected.",
          );
        }
        if (operation === "create" && req.user?.id) {
          data.enteredBy = req.user.id;
          data.enteredAt = new Date().toISOString();
        }
        return data;
      },
    ],
  },
  fields: [
    {
      name: "organisation",
      type: "relationship",
      relationTo: "organisations",
      required: true,
      index: true,
    },
    {
      name: "period",
      type: "relationship",
      relationTo: "reporting-periods",
      required: true,
      index: true,
    },
    { name: "metricKey", type: "text", required: true, index: true },
    { name: "value", type: "number" },
    { name: "unit", type: "text" },
    {
      name: "quality",
      type: "select",
      required: true,
      options: [
        { label: "Measured", value: "measured" },
        { label: "Calculated", value: "calculated" },
        { label: "Estimated", value: "estimated" },
        { label: "Missing", value: "missing" },
      ],
    },
    {
      name: "evidence",
      type: "relationship",
      relationTo: "evidence",
      hasMany: true,
    },
    {
      name: "source",
      type: "select",
      required: true,
      defaultValue: "manual",
      options: [
        { label: "Manual", value: "manual" },
        { label: "Import", value: "import" },
        { label: "Supplier", value: "supplier" },
        { label: "Estimate", value: "estimate" },
        { label: "API", value: "api" },
        { label: "Internal survey", value: "internal_survey" },
      ],
    },
    {
      name: "approvalState",
      type: "select",
      required: true,
      defaultValue: "pending",
      index: true,
      options: [
        { label: "Pending", value: "pending" },
        { label: "Approved", value: "approved" },
        { label: "Rejected", value: "rejected" },
      ],
    },
    {
      name: "approvalReason",
      type: "textarea",
      admin: { description: "Required when approvalState is rejected." },
    },
    {
      name: "assignedTo",
      type: "relationship",
      relationTo: "users",
      index: true,
    },
    { name: "dueDate", type: "date", index: true },
    {
      name: "taskStatus",
      type: "select",
      defaultValue: "open",
      options: [
        { label: "Open", value: "open" },
        { label: "Submitted", value: "submitted" },
        { label: "Approved", value: "approved" },
      ],
    },
    {
      name: "enteredBy",
      type: "relationship",
      relationTo: "users",
    },
    { name: "enteredAt", type: "date" },
    { name: "note", type: "textarea" },
  ],
};
