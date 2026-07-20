export type SectorPage = {
  slug: string;
  name: string;
  nace: string;
  answer: string;
  focusTopics: string[];
  updatedAt: string;
};

export const CSRD_SECTORS: SectorPage[] = [
  {
    slug: "manufacturing",
    name: "Manufacturing",
    nace: "C",
    answer:
      "CSRD compliance for manufacturers centres on ESRS E1 climate (energy, fuels, process emissions), E2/E5 where chemicals or waste are material, and S1 workforce. Scope 3 purchased goods usually dominates once Tier-1 suppliers respond.",
    focusTopics: [
      "E1 Climate",
      "E5 Circular economy",
      "S1 Own workforce",
      "G1 Business conduct",
    ],
    updatedAt: "2026-07-01",
  },
  {
    slug: "logistics",
    name: "Logistics & transport",
    nace: "H",
    answer:
      "CSRD for logistics firms typically materials Scope 1 fleet fuels, Scope 2 depot electricity, and Scope 3 upstream/downstream transport. Double materiality almost always flags climate and own workforce safety.",
    focusTopics: ["E1 Climate", "S1 Own workforce", "S2 Workers in value chain"],
    updatedAt: "2026-07-01",
  },
  {
    slug: "professional-services",
    name: "Professional services",
    nace: "M",
    answer:
      "Professional services CSRD programmes are lighter on process emissions but still need Scope 2 office electricity, business travel Scope 3, and strong G1/S1 disclosures. Buyer questionnaires often arrive before formal CSRD scope.",
    focusTopics: ["E1 Climate", "S1 Own workforce", "G1 Business conduct"],
    updatedAt: "2026-07-01",
  },
];

export function sectorBySlug(slug: string): SectorPage | undefined {
  return CSRD_SECTORS.find((s) => s.slug === slug);
}

export type CompetitorPage = {
  slug: string;
  name: string;
  answer: string;
  whereTheyWin: string[];
  whereWeWin: string[];
  updatedAt: string;
};

export const COMPETITORS: CompetitorPage[] = [
  {
    slug: "workiva",
    name: "Workiva",
    answer:
      "Workiva is a strong enterprise reporting and controls platform. ClearESG is built for SMEs and boutique consultants who need ESRS-oriented collection, supplier chains, and a living report without a six-figure implementation.",
    whereTheyWin: [
      "Large-group SOX-style controls and multi-entity narrative publishing",
      "Deep finance/close integrations at enterprise scale",
    ],
    whereWeWin: [
      "60-second baseline → runway → supplier requests in one product flow",
      "Derivation layer that refuses fake raw→ESRS mappings",
      "Consultant command centre + white-label at SME price points",
    ],
    updatedAt: "2026-07-01",
  },
  {
    slug: "persefoni",
    name: "Persefoni",
    answer:
      "Persefoni is a carbon accounting platform aimed at larger organisations needing financed emissions and institutional workflows. ClearESG focuses on mandatory disclosure readiness for SMEs — materiality, evidence, PDF/living report — not financed emissions.",
    whereTheyWin: [
      "Financed emissions / PCAF-oriented workflows",
      "Institutional carbon programmes",
    ],
    whereWeWin: [
      "Double materiality workshop with audit trail",
      "Supplier request viral loop with expiry tokens",
      "Free tier with real calc and watermarked PDF only",
    ],
    updatedAt: "2026-07-01",
  },
  {
    slug: "greenly",
    name: "Greenly",
    answer:
      "Greenly offers accessible carbon footprinting for SMEs. ClearESG overlaps on emissions but adds CSRD-oriented materiality, consultant multi-client tooling, living reports, and a hard n≥8 benchmark gate.",
    whereTheyWin: [
      "Fast consumer-grade carbon footprint UX",
      "Broad SMB brand recognition in some EU markets",
    ],
    whereWeWin: [
      "Editorial report layout with monospaced measurement discipline",
      "Framework-agnostic datapoints + derive registry",
      "Benchmarking that never shows cohorts under n=8",
    ],
    updatedAt: "2026-07-01",
  },
];

export function competitorBySlug(slug: string): CompetitorPage | undefined {
  return COMPETITORS.find((c) => c.slug === slug);
}

export type DeadlinePage = {
  slug: string;
  country: string;
  iso: string;
  answer: string;
  notes: string[];
  updatedAt: string;
};

export const DEADLINES: DeadlinePage[] = [
  {
    slug: "ie",
    country: "Ireland",
    iso: "IE",
    answer:
      "Ireland-transposed CSRD obligations follow EU wave timing for large undertakings and listed entities. Exact filing calendars depend on financial year end and whether the entity is in wave 1, 2, or later SME waves — verify against IAASA / Companies Registration Office guidance for the reporting year.",
    notes: [
      "Use fiscal year end + wave membership to compute days-to-filing in ClearESG Runway.",
      "Value-chain questionnaires can arrive earlier than statutory filing.",
    ],
    updatedAt: "2026-07-01",
  },
  {
    slug: "de",
    country: "Germany",
    iso: "DE",
    answer:
      "Germany implements CSRD via national law aligning with EU waves. Large German undertakings in early waves face ESRS reporting with auditor assurance requirements escalating over time. Check the current HGB / CSRD transposition text for your size class.",
    notes: [
      "Manufacturers often materialise E1 and S1 first.",
      "ClearESG deadlines/[country] pages are guidance, not legal advice.",
    ],
    updatedAt: "2026-07-01",
  },
  {
    slug: "in",
    country: "India",
    iso: "IN",
    answer:
      "India's primary listed-company ESG format is BRSR (SEBI), not CSRD. Indian exporters and suppliers still face CSRD-shaped requests from EU customers. DPDP Act data-residency questions may affect hosting choices before shipping ClearESG commercially in India.",
    notes: [
      "INR / Razorpay billing is an open decision before Phase 12 India launch.",
      "Treat buyer questionnaires as operational deadlines.",
    ],
    updatedAt: "2026-07-01",
  },
];

export function deadlineBySlug(slug: string): DeadlinePage | undefined {
  return DEADLINES.find((d) => d.slug === slug);
}
