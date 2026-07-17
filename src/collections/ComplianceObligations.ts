import type { CollectionConfig } from "payload";

import { tenantAccess } from "@/lib/access";

/**
 * Per-org compliance deadline source of truth.
 * Phase 5 Compliance Runway reads from here — never hardcode dates.
 */
export const ComplianceObligations: CollectionConfig = {
  slug: "compliance-obligations",
  admin: {
    useAsTitle: "standardVersion",
    defaultColumns: [
      "organisation",
      "jurisdiction",
      "standardVersion",
      "wave",
      "filingDeadline",
    ],
  },
  access: tenantAccess({ writeMin: "admin", adminWriteMin: "admin" }),
  fields: [
    {
      name: "organisation",
      type: "relationship",
      relationTo: "organisations",
      required: true,
      index: true,
    },
    {
      name: "wave",
      type: "select",
      required: true,
      options: [
        { label: "Wave 1", value: "1" },
        { label: "Wave 2", value: "2" },
        { label: "Wave 3", value: "3" },
        { label: "BRSR listed", value: "brsr_listed" },
        { label: "BRSR supply chain", value: "brsr_supply" },
        { label: "Other", value: "other" },
      ],
    },
    {
      name: "jurisdiction",
      type: "text",
      required: true,
      admin: { description: "ISO country or region code, e.g. EU, IN, GB" },
    },
    {
      name: "standardVersion",
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
    {
      name: "firstReportingFY",
      type: "text",
      required: true,
      admin: { description: 'e.g. "FY2025" or "2025-26"' },
    },
    {
      name: "filingDeadline",
      type: "date",
      required: true,
      admin: {
        description: "The countdown the Compliance Runway displays",
        date: { pickerAppearance: "dayOnly" },
      },
    },
    { name: "notes", type: "textarea" },
  ],
};
