/** Heuristic metric suggestion from an uploaded evidence filename. */

const RULES: Array<{ re: RegExp; metricKey: string; label: string }> = [
  {
    re: /electric|kwh|power|utility|edf|sse|octopus/i,
    metricKey: "electricity_kwh",
    label: "Electricity (kWh)",
  },
  { re: /gas|therm|btu/i, metricKey: "natural_gas_kwh", label: "Natural gas" },
  { re: /diesel|gasoil/i, metricKey: "diesel_litres", label: "Diesel" },
  { re: /petrol|gasoline|fuel/i, metricKey: "petrol_litres", label: "Petrol" },
  { re: /water|m3|metre/i, metricKey: "water_m3", label: "Water (m³)" },
  { re: /waste|landfill|recycl/i, metricKey: "waste_tonnes", label: "Waste (t)" },
  {
    re: /travel|flight|rail|mileage/i,
    metricKey: "business_travel_km",
    label: "Business travel",
  },
  { re: /payroll|headcount|fte|employee/i, metricKey: "headcount", label: "Headcount" },
  { re: /revenue|turnover|p.?l|profit/i, metricKey: "revenue", label: "Revenue" },
  {
    re: /supplier|scope.?3|vendor/i,
    metricKey: "supplier_reported_tco2e",
    label: "Supplier Scope 3",
  },
];

export function suggestMetricFromFilename(filename: string): {
  metricKey: string;
  label: string;
} | null {
  const base = filename.split(/[/\\]/).pop() ?? filename;
  for (const rule of RULES) {
    if (rule.re.test(base)) {
      return { metricKey: rule.metricKey, label: rule.label };
    }
  }
  return null;
}
