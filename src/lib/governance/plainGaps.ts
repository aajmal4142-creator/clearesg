/** Everyday copy for runway gaps — what to do, not jargon. */

const PLAIN: Record<string, { need: string; action: string }> = {
  electricity_kwh: {
    need: "Need last period’s electricity bill (kWh).",
    action: "Enter electricity",
  },
  natural_gas_kwh: {
    need: "Need natural gas use for the period.",
    action: "Enter gas",
  },
  diesel_litres: {
    need: "Need diesel litres used in the period.",
    action: "Enter diesel",
  },
  petrol_litres: {
    need: "Need petrol litres used in the period.",
    action: "Enter petrol",
  },
  headcount: {
    need: "Need headcount (FTE) for the period.",
    action: "Confirm headcount",
  },
  revenue: {
    need: "Need revenue for intensity metrics.",
    action: "Enter revenue",
  },
  water_m3: {
    need: "Need water use in cubic metres.",
    action: "Enter water",
  },
  waste_tonnes: {
    need: "Need waste tonnage for the period.",
    action: "Enter waste",
  },
  business_travel_km: {
    need: "Need business travel kilometres.",
    action: "Enter travel",
  },
  supplier_reported_tco2e: {
    need: "Need supplier emissions (or send requests).",
    action: "Chase suppliers",
  },
};

export function plainGapCopy(
  metricKey: string,
  fallbackLabel: string,
): {
  need: string;
  action: string;
} {
  return (
    PLAIN[metricKey] ?? {
      need: `Still missing: ${fallbackLabel}.`,
      action: `Add ${fallbackLabel}`,
    }
  );
}
