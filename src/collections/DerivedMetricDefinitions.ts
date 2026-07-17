import type { CollectionConfig } from "payload";

import { authenticated, denyAll } from "@/lib/access";

/**
 * Derived metric registry — frameworkMappings live here, not on raw MetricDefinition.
 * Seeded; not user-created. Only approved mappings.
 */
export const DerivedMetricDefinitions: CollectionConfig = {
  slug: "derived-metric-definitions",
  admin: {
    useAsTitle: "label",
    defaultColumns: ["key", "unit"],
  },
  access: {
    read: authenticated,
    create: denyAll,
    update: denyAll,
    delete: denyAll,
  },
  fields: [
    { name: "key", type: "text", required: true, unique: true, index: true },
    { name: "label", type: "text", required: true },
    { name: "description", type: "textarea", required: true },
    { name: "unit", type: "text", required: true },
    {
      name: "frameworkMappings",
      type: "array",
      fields: [
        {
          name: "framework",
          type: "select",
          required: true,
          options: [
            { label: "CSRD Set 1", value: "CSRD_SET1" },
            { label: "CSRD Simplified", value: "CSRD_SIMPLIFIED" },
            { label: "BRSR", value: "BRSR" },
            { label: "VSME", value: "VSME" },
            { label: "GRI", value: "GRI" },
          ],
        },
        { name: "datapointRef", type: "text", required: true },
        { name: "required", type: "checkbox", defaultValue: false },
        { name: "validFrom", type: "date" },
        { name: "validUntil", type: "date" },
        { name: "sourceDoc", type: "text", required: true },
        { name: "sourceSheet", type: "text", required: true },
        { name: "sourceRow", type: "number", required: true },
        { name: "extractedAt", type: "date", required: true },
        {
          name: "approved",
          type: "checkbox",
          required: true,
          defaultValue: false,
          admin: { description: "Must be true to surface in product mappings" },
        },
      ],
    },
  ],
};
