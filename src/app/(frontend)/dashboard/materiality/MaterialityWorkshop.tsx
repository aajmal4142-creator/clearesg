"use client";

import { motion } from "motion/react";
import { useMemo, useRef, useState } from "react";

import { PageFrame, StatusLine } from "@/components/shell/PageFrame";
import { spring, useMotionSafe } from "@/lib/motion";
import {
  ESRS_TOPICS,
  financialScoreOf,
  impactScoreOf,
  isMaterial,
  MATERIALITY_THRESHOLD,
  type EsrsTopic,
} from "@/lib/materiality";

type TopicScore = {
  esrsTopic: string;
  impactSeverity: number;
  impactScope: number;
  impactIrremediability: number;
  financialMagnitude: number;
  financialLikelihood: number;
  rationale: string;
};

function emptyScores(): TopicScore[] {
  return ESRS_TOPICS.map((t) => ({
    esrsTopic: t.id,
    impactSeverity: 0,
    impactScope: 0,
    impactIrremediability: 0,
    financialMagnitude: 0,
    financialLikelihood: 0,
    rationale: "",
  }));
}

function fromAssessment(topics: unknown): TopicScore[] {
  if (!Array.isArray(topics) || topics.length === 0) return emptyScores();
  const byId = new Map(
    topics.map((t) => {
      const row = t as Record<string, unknown>;
      return [String(row.esrsTopic), row] as const;
    }),
  );
  return ESRS_TOPICS.map((t) => {
    const row = byId.get(t.id);
    return {
      esrsTopic: t.id,
      impactSeverity: Number(row?.impactSeverity ?? 0),
      impactScope: Number(row?.impactScope ?? 0),
      impactIrremediability: Number(row?.impactIrremediability ?? 0),
      financialMagnitude: Number(row?.financialMagnitude ?? 0),
      financialLikelihood: Number(row?.financialLikelihood ?? 0),
      rationale: String(row?.rationale ?? ""),
    };
  });
}

export function MaterialityWorkshop({
  initialAssessment,
  topicsCatalog,
  canWrite = true,
}: {
  initialAssessment: {
    topics?: unknown;
    status?: string;
    narrative?: string | null;
  } | null;
  topicsCatalog: EsrsTopic[];
  canWrite?: boolean;
}) {
  const transition = useMotionSafe();
  const matrixRef = useRef<HTMLDivElement>(null);
  const locked = initialAssessment?.status === "final" || !canWrite;
  const [scores, setScores] = useState(() => fromAssessment(initialAssessment?.topics));
  const [active, setActive] = useState(0);
  const [status, setStatus] = useState<string | null>(null);
  const [statusTone, setStatusTone] = useState<"neutral" | "error" | "ok">("neutral");
  const [narrative, setNarrative] = useState(initialAssessment?.narrative ?? "");

  const computed = useMemo(
    () =>
      scores.map((s) => {
        const impact = impactScoreOf({
          severity: s.impactSeverity,
          scope: s.impactScope,
          irremediability: s.impactIrremediability,
        });
        const financial = financialScoreOf({
          magnitude: s.financialMagnitude,
          likelihood: s.financialLikelihood,
        });
        return {
          ...s,
          impactScore: impact,
          financialScore: financial,
          material: isMaterial(impact, financial),
        };
      }),
    [scores],
  );

  const topic = topicsCatalog[active] ?? ESRS_TOPICS[active];
  const row = scores[active];

  async function save(finalise: boolean) {
    if (locked) return;
    setStatusTone("neutral");
    setStatus(finalise ? "Finalising…" : "Saving…");
    const res = await fetch("/api/app/materiality", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topics: computed, finalise }),
    });
    const data = (await res.json().catch(() => ({}))) as {
      error?: string;
      assessment?: { narrative?: string };
    };
    if (!res.ok) {
      const raw = data.error ?? "Save failed";
      setStatusTone("error");
      setStatus(
        raw === "Forbidden"
          ? "You do not have permission to change this assessment. Ask an admin."
          : raw,
      );
      return;
    }
    if (data.assessment?.narrative) setNarrative(data.assessment.narrative);
    setStatusTone("ok");
    setStatus(finalise ? "Assessment finalised" : "Draft saved");
  }

  function setField(key: keyof TopicScore, value: number | string) {
    setScores((prev) => prev.map((s, i) => (i === active ? { ...s, [key]: value } : s)));
  }

  return (
    <PageFrame
      eyebrow="Double materiality"
      title="Workshop"
      help={`Score impact (severity × scope × irremediability) and financial (magnitude × likelihood). Threshold ${MATERIALITY_THRESHOLD} on either axis. Scores live here — not in a spreadsheet.`}
      actions={
        !canWrite ? (
          <p className="text-sm text-ink-muted">View only</p>
        ) : initialAssessment?.status === "final" ? (
          <p className="text-sm text-signal">Final — locked for this period</p>
        ) : undefined
      }
      rail={
        <div>
          <p className="label-caps mb-4">Matrix</p>
          <div
            ref={matrixRef}
            className="relative aspect-square w-full border border-rule bg-surface-1"
          >
            <div
              className="absolute left-0 right-0 border-t border-dashed border-rule"
              style={{ bottom: `${(MATERIALITY_THRESHOLD / 5) * 100}%` }}
            />
            <div
              className="absolute top-0 bottom-0 border-l border-dashed border-rule"
              style={{ left: `${(MATERIALITY_THRESHOLD / 5) * 100}%` }}
            />
            <span className="absolute bottom-2 left-2 text-xs text-ink-muted">
              Impact →
            </span>
            <span className="absolute left-2 top-2 text-xs text-ink-muted">
              Financial ↑
            </span>

            {computed.map((p, idx) => {
              const baseLeft = (p.impactScore / 5) * 100;
              const baseBottom = (p.financialScore / 5) * 100;
              // ~1–2% jitter so equal scores do not stack exactly.
              const jitterX = ((idx % 5) - 2) * 0.4;
              const jitterY = (((idx * 3) % 5) - 2) * 0.4;
              const left = `${Math.min(98, Math.max(2, baseLeft + jitterX))}%`;
              const bottom = `${Math.min(98, Math.max(2, baseBottom + jitterY))}%`;
              const topicIdx = scores.findIndex((s) => s.esrsTopic === p.esrsTopic);
              const markerClass = `absolute -translate-x-1/2 translate-y-1/2 font-data text-xs ${
                p.material ? "text-signal" : "text-ink-muted"
              }`;

              if (locked) {
                return (
                  <span
                    key={p.esrsTopic}
                    className={`${markerClass} pointer-events-none`}
                    style={{ left, bottom }}
                  >
                    {p.esrsTopic}
                  </span>
                );
              }

              return (
                <motion.button
                  key={p.esrsTopic}
                  type="button"
                  drag
                  dragConstraints={matrixRef}
                  dragMomentum={false}
                  onDragEnd={(e) => {
                    if (!matrixRef.current) return;
                    const rect = matrixRef.current.getBoundingClientRect();
                    const pe = e as unknown as PointerEvent;
                    const clientX = "clientX" in pe ? pe.clientX : 0;
                    const clientY = "clientY" in pe ? pe.clientY : 0;
                    const x = Math.min(
                      5,
                      Math.max(0, ((clientX - rect.left) / rect.width) * 5),
                    );
                    const y = Math.min(
                      5,
                      Math.max(0, ((rect.bottom - clientY) / rect.height) * 5),
                    );
                    const xi = Math.round(x);
                    const yi = Math.round(y);
                    setScores((prev) =>
                      prev.map((s, i) =>
                        i === topicIdx
                          ? {
                              ...s,
                              impactSeverity: xi,
                              impactScope: xi,
                              impactIrremediability: xi,
                              financialMagnitude: yi,
                              financialLikelihood: yi,
                            }
                          : s,
                      ),
                    );
                    setActive(topicIdx);
                  }}
                  transition={transition.type === "spring" ? spring : transition}
                  className={`${markerClass} cursor-grab active:cursor-grabbing`}
                  style={{ left, bottom }}
                  onClick={() => setActive(topicIdx)}
                >
                  {p.esrsTopic}
                </motion.button>
              );
            })}
          </div>
          {!locked ? (
            <p className="mt-3 text-sm text-ink-muted">
              Drag a topic to reposition. Material topics render in signal green.
            </p>
          ) : (
            <p className="mt-3 text-sm text-ink-muted">
              Material topics render in signal green.
            </p>
          )}
        </div>
      }
    >
      {status ? <StatusLine tone={statusTone}>{status}</StatusLine> : null}

      <div className="mt-4 flex flex-wrap gap-2">
        {topicsCatalog.map((t, i) => {
          const c = computed[i];
          const selected = i === active;
          return (
            <button
              key={t.id}
              type="button"
              aria-pressed={selected}
              onClick={() => setActive(i)}
              className={`border px-2 py-1 font-data text-xs ${
                selected
                  ? "border-rule-strong text-ink"
                  : c?.material
                    ? "border-signal/60 text-signal"
                    : "border-rule text-ink-muted"
              }`}
            >
              {t.id}
            </button>
          );
        })}
      </div>

      {topic && row ? (
        <div
          className={`mt-8 space-y-4 border-t border-rule pt-4 ${locked ? "opacity-60" : ""}`}
        >
          <h2 className="text-lg text-ink">
            {topic.id} — {topic.label}
          </h2>
          <p className="text-sm text-ink-muted">{topic.description}</p>
          {(
            [
              ["impactSeverity", "Impact severity"],
              ["impactScope", "Impact scope"],
              ["impactIrremediability", "Irremediability"],
              ["financialMagnitude", "Financial magnitude"],
              ["financialLikelihood", "Financial likelihood"],
            ] as const
          ).map(([key, label]) => (
            <label key={key} className={`block ${locked ? "opacity-70" : ""}`}>
              <span className="label-caps">{label}</span>
              <input
                type="range"
                min={0}
                max={5}
                step={1}
                disabled={locked}
                className="mt-2 w-full accent-[var(--signal)] disabled:cursor-not-allowed"
                value={Number(row[key])}
                onChange={(e) => setField(key, Number(e.target.value))}
              />
              <span className="font-data text-sm text-ink">{row[key]}</span>
            </label>
          ))}
          <label className={`block ${locked ? "opacity-70" : ""}`}>
            <span className="label-caps">Rationale</span>
            <textarea
              disabled={locked}
              className="mt-2 w-full border border-rule bg-surface-1 px-2 py-2 text-sm text-ink disabled:cursor-not-allowed"
              rows={3}
              value={row.rationale}
              onChange={(e) => setField("rationale", e.target.value)}
            />
          </label>
          <p className="font-data text-sm text-ink-muted">
            Impact {computed[active]?.impactScore} · Financial{" "}
            {computed[active]?.financialScore}
            {computed[active]?.material ? " · material" : ""}
          </p>
        </div>
      ) : null}

      {!locked && canWrite && initialAssessment?.status !== "final" ? (
        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={() => void save(false)}
            className="border border-rule px-3 py-2 text-sm text-ink-muted hover:border-rule-strong hover:text-ink"
          >
            Save draft
          </button>
          <button
            type="button"
            onClick={() => void save(true)}
            className="border border-rule bg-surface-1 px-3 py-2 text-sm text-ink hover:border-rule-strong"
          >
            Finalise
          </button>
        </div>
      ) : null}

      {narrative ? (
        <div className="mt-8 border-t border-rule pt-4">
          <p className="label-caps mb-2">Narrative</p>
          <p className="text-sm text-ink-muted">{narrative}</p>
        </div>
      ) : null}
    </PageFrame>
  );
}
