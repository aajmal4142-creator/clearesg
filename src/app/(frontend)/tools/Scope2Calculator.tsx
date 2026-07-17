"use client";

import { useState } from "react";
import Link from "next/link";

/** Open illustrative factors — educational; production calc uses registry. */
const FACTORS: Record<string, { label: string; kgPerKwh: number; source: string }> = {
  IE: { label: "Ireland", kgPerKwh: 0.3, source: "Illustrative grid factor, 2024" },
  DE: { label: "Germany", kgPerKwh: 0.35, source: "Illustrative grid factor, 2024" },
  IN: { label: "India", kgPerKwh: 0.7, source: "Illustrative grid factor, 2024" },
  GB: {
    label: "United Kingdom",
    kgPerKwh: 0.2,
    source: "Illustrative grid factor, 2024",
  },
};

export function Scope2Calculator() {
  const [kwh, setKwh] = useState(100000);
  const [region, setRegion] = useState("IE");

  const f = FACTORS[region] ?? FACTORS.IE;
  const tco2e = (kwh * f.kgPerKwh) / 1000;

  return (
    <div className="space-y-4 border border-graphite p-4">
      <label className="block text-sm text-ash">
        Electricity (kWh)
        <input
          type="number"
          className="mt-1 w-full border border-graphite bg-slate px-3 py-2 font-data text-bone"
          value={kwh}
          onChange={(e) => setKwh(Number(e.target.value))}
        />
      </label>
      <label className="block text-sm text-ash">
        Region
        <select
          className="mt-1 w-full border border-graphite bg-slate px-3 py-2 text-bone"
          value={region}
          onChange={(e) => setRegion(e.target.value)}
        >
          {Object.entries(FACTORS).map(([code, meta]) => (
            <option key={code} value={code}>
              {meta.label}
            </option>
          ))}
        </select>
      </label>
      <div className="border border-graphite bg-slate p-3">
        <p className="text-sm text-ash">Location-based Scope 2</p>
        <p className="font-data text-3xl text-signal">{tco2e.toFixed(2)} tCO2e</p>
        <p className="mt-2 font-data text-xs text-ash">
          {f.kgPerKwh} kgCO2e/kWh · {f.source}
        </p>
        <p className="mt-4 text-sm text-ash">
          Save this and track it over time →{" "}
          <Link href="/sign-up" className="text-bone underline">
            Start free
          </Link>
        </p>
      </div>
    </div>
  );
}
