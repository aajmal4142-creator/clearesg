import { describe, expect, it } from "vitest";

import { diffSnapshots, snapshotToCsv, type ReportSnapshot } from "./types";

function base(over: Partial<ReportSnapshot> = {}): ReportSnapshot {
  return {
    organisationName: "Acme",
    periodLabel: "FY2025",
    framework: "CSRD_SIMPLIFIED",
    version: 1,
    publishedAt: "2026-01-01T00:00:00.000Z",
    scores: { overall: 50, e: 40, s: 50, g: 60 },
    emissions: {
      scope1: 1,
      scope2: 2,
      scope3: 3,
      total: 6,
      dataQualityPct: 70,
    },
    band: "moderate",
    breakdown: [],
    factorsUsed: [],
    materiality: { narrative: null, points: [] },
    evidenceIndex: [],
    disclaimer: "x",
    ...over,
  };
}

describe("report snapshot helpers", () => {
  it("diffs score changes", () => {
    const d = diffSnapshots(
      base(),
      base({ scores: { overall: 55, e: 40, s: 50, g: 60 } }),
    );
    expect(d.some((x) => x.path === "scores.overall")).toBe(true);
  });

  it("exports csv header", () => {
    expect(snapshotToCsv(base()).startsWith("section,key,value")).toBe(true);
  });
});
