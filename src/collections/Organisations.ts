import type { Access, CollectionConfig, Where } from "payload";

import { authenticated } from "@/lib/access";
import { accessibleOrgIds, canWriteOrg } from "@/lib/access/membership";

const organisationRead: Access = async ({ req }) => {
  if (!req.user) return false;
  const ids = await accessibleOrgIds(req);
  if (ids.length === 0) return false;
  const where: Where = { id: { in: ids } };
  return where;
};

export const Organisations: CollectionConfig = {
  slug: "organisations",
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "type", "country", "plan"],
  },
  access: {
    read: organisationRead,
    create: authenticated,
    update: async ({ req, id }) => {
      if (!req.user || !id) return false;
      return canWriteOrg(req, String(id), "admin");
    },
    delete: async ({ req, id }) => {
      if (!req.user || !id) return false;
      return canWriteOrg(req, String(id), "owner");
    },
  },
  fields: [
    { name: "name", type: "text", required: true },
    {
      name: "slug",
      type: "text",
      required: true,
      unique: true,
      index: true,
    },
    {
      name: "type",
      type: "select",
      required: true,
      options: [
        { label: "Company", value: "company" },
        { label: "Consultancy", value: "consultancy" },
      ],
    },
    {
      name: "sector",
      type: "text",
      required: true,
      admin: { description: "NACE code" },
    },
    {
      name: "country",
      type: "text",
      required: true,
      admin: { description: "ISO 3166-1 alpha-2" },
    },
    { name: "employeeCount", type: "number", min: 0 },
    {
      name: "revenueBand",
      type: "select",
      options: [
        { label: "< €2m", value: "lt_2m" },
        { label: "€2–10m", value: "2_10m" },
        { label: "€10–50m", value: "10_50m" },
        { label: "€50–250m", value: "50_250m" },
        { label: "> €250m", value: "gt_250m" },
      ],
    },
    {
      name: "fiscalYearEnd",
      type: "text",
      admin: { description: "MM-DD, e.g. 03-31" },
    },
    {
      name: "parentOrg",
      type: "relationship",
      relationTo: "organisations",
      admin: { description: "Consultancy parent — one level deep only" },
    },
    {
      name: "brand",
      type: "group",
      fields: [
        { name: "logo", type: "upload", relationTo: "media" },
        { name: "primaryColor", type: "text" },
        { name: "domain", type: "text" },
      ],
    },
    { name: "stripeCustomerId", type: "text", admin: { readOnly: true } },
    {
      name: "plan",
      type: "select",
      defaultValue: "free",
      options: [
        { label: "Free", value: "free" },
        { label: "Pro", value: "pro" },
        { label: "Consultant", value: "consultant" },
      ],
    },
    {
      name: "subscriptionStatus",
      type: "select",
      defaultValue: "none",
      options: [
        { label: "None", value: "none" },
        { label: "Active", value: "active" },
        { label: "Past due", value: "past_due" },
        { label: "Canceled", value: "canceled" },
      ],
    },
    { name: "onboardedAt", type: "date" },
    {
      name: "guideProgress",
      type: "json",
      admin: {
        description: "First-report guided checklist — org-scoped, not localStorage.",
      },
    },
    {
      name: "benchmarkOptOut",
      type: "checkbox",
      defaultValue: false,
      admin: {
        description: "Opt out of anonymised sector benchmark aggregation (ToS consent).",
      },
    },
  ],
};
