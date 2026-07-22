/**
 * Gap analysis — missing required datapoints ranked by impact×ease. §15.1.4
 */

export type RequiredMetric = {
  metricKey: string;
  label: string;
  /** Higher = more impact on score/completeness. */
  impact: number;
  /** Higher = easier to collect. */
  ease: number;
};

/** Core metrics for CSRD-simplified / BRSR-readiness runway. */
export const REQUIRED_RUNWAY_METRICS: RequiredMetric[] = [
  { metricKey: "electricity_kwh", label: "Electricity (kWh)", impact: 10, ease: 9 },
  { metricKey: "natural_gas_kwh", label: "Natural gas", impact: 8, ease: 7 },
  { metricKey: "diesel_litres", label: "Diesel", impact: 8, ease: 6 },
  { metricKey: "petrol_litres", label: "Petrol", impact: 6, ease: 6 },
  { metricKey: "headcount", label: "Headcount", impact: 7, ease: 10 },
  { metricKey: "revenue", label: "Revenue", impact: 5, ease: 8 },
  { metricKey: "water_m3", label: "Water (m³)", impact: 4, ease: 5 },
  { metricKey: "waste_tonnes", label: "Waste (t)", impact: 4, ease: 4 },
  { metricKey: "business_travel_km", label: "Business travel", impact: 6, ease: 5 },
  { metricKey: "supplier_reported_tco2e", label: "Supplier Scope 3", impact: 9, ease: 3 },
];

export type GapItem = RequiredMetric & {
  missing: boolean;
  rank: number;
};

export function rankGaps(
  presentKeys: Set<string>,
  required: RequiredMetric[] = REQUIRED_RUNWAY_METRICS,
): { missing: GapItem[]; collected: number; total: number } {
  const missing: GapItem[] = required
    .filter((m) => !presentKeys.has(m.metricKey))
    .map((m) => ({
      ...m,
      missing: true,
      rank: m.impact * m.ease,
    }))
    .sort((a, b) => b.rank - a.rank);

  return {
    missing,
    collected: required.length - missing.length,
    total: required.length,
  };
}
