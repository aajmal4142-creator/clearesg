/**
 * Figure lineage for Assurance Room — Phase 4.
 * Factors resolve from snapshot-pinned factorId only — never “latest by metricKey”.
 */

import type { FactorUsage } from "@/lib/calc/types";
import type { DatapointProvenance } from "@/lib/frameworks/types";

export type EvidenceLinkState = "verified" | "unverified";

export type LineageEvidence = {
  id: string;
  filename: string;
  sha256: string;
  uploadedAt: string;
  coverageStart?: string | null;
  coverageEnd?: string | null;
  /** True only when bidirectional link is established. */
  bidirectionallyLinked: boolean;
};

export type PinnedFactor = {
  factorId: string;
  key: string;
  value: number;
  source: string;
  year: number;
};

export type FigureLineage = {
  metricKey: string;
  value: number | null;
  quality: string;
  provenance?: DatapointProvenance | null;
  evidenceLink: EvidenceLinkState;
  evidence: LineageEvidence[];
  /** Null when no pin in snapshot — never invent from latest registry. */
  factor: PinnedFactor | null;
  factorUnresolvedReason: string | null;
};

/**
 * Bidirectional link: evidence appears on datapoint.evidence AND datapoint appears
 * on evidence.linkedDatapoints. Legacy metricKey-only soft matches are unverified.
 */
export function evidenceLinkState(input: {
  datapointEvidenceIds: string[];
  evidenceDocs: Array<{ id: string; linkedDatapointIds: string[] }>;
  datapointId: string;
}): EvidenceLinkState {
  const onDp = new Set(input.datapointEvidenceIds);
  const verified = input.evidenceDocs.some(
    (e) => onDp.has(e.id) && e.linkedDatapointIds.includes(input.datapointId),
  );
  return verified ? "verified" : "unverified";
}

/** Resolve factor from published snapshot pins — never latest-by-metricKey. */
export function resolvePinnedFactor(input: {
  /** Prefer datapoint.factorId when set at publish time. */
  datapointFactorId?: string | null;
  /** Snapshot factorsUsed / report factorVersionsUsed pins. */
  factorsUsed: FactorUsage[];
  /** Optional metricKey fallback only among pins (not registry). */
  metricKey?: string;
}): { factor: PinnedFactor | null; reason: string | null } {
  const { datapointFactorId, factorsUsed, metricKey } = input;
  if (datapointFactorId) {
    const hit = factorsUsed.find((f) => f.factorId === datapointFactorId);
    if (hit) {
      return {
        factor: {
          factorId: hit.factorId,
          key: hit.key,
          value: hit.value,
          source: hit.source,
          year: hit.year,
        },
        reason: null,
      };
    }
    return {
      factor: null,
      reason: "Pinned factorId not found in this report snapshot",
    };
  }
  if (metricKey) {
    const hit = factorsUsed.find((f) => f.key === metricKey);
    if (hit) {
      return {
        factor: {
          factorId: hit.factorId,
          key: hit.key,
          value: hit.value,
          source: hit.source,
          year: hit.year,
        },
        reason: null,
      };
    }
  }
  return {
    factor: null,
    reason: "No factor pinned on this figure for this report version",
  };
}

export function buildFigureLineage(input: {
  datapointId: string;
  metricKey: string;
  value: number | null;
  quality: string;
  provenance?: DatapointProvenance | null;
  datapointFactorId?: string | null;
  datapointEvidenceIds: string[];
  evidenceDocs: Array<{
    id: string;
    filename: string;
    sha256: string;
    uploadedAt: string;
    coverageStart?: string | null;
    coverageEnd?: string | null;
    linkedDatapointIds: string[];
  }>;
  factorsUsed: FactorUsage[];
}): FigureLineage {
  const link = evidenceLinkState({
    datapointEvidenceIds: input.datapointEvidenceIds,
    evidenceDocs: input.evidenceDocs,
    datapointId: input.datapointId,
  });
  const pinned = resolvePinnedFactor({
    datapointFactorId: input.datapointFactorId,
    factorsUsed: input.factorsUsed,
    metricKey: input.metricKey,
  });
  const evidence: LineageEvidence[] = input.evidenceDocs.map((e) => ({
    id: e.id,
    filename: e.filename,
    sha256: e.sha256,
    uploadedAt: e.uploadedAt,
    coverageStart: e.coverageStart,
    coverageEnd: e.coverageEnd,
    bidirectionallyLinked:
      input.datapointEvidenceIds.includes(e.id) &&
      e.linkedDatapointIds.includes(input.datapointId),
  }));
  return {
    metricKey: input.metricKey,
    value: input.value,
    quality: input.quality,
    provenance: input.provenance ?? null,
    evidenceLink: link,
    evidence,
    factor: pinned.factor,
    factorUnresolvedReason: pinned.reason,
  };
}
