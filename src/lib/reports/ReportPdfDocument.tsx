import {
  Circle,
  Document,
  G,
  Line,
  Page,
  Path,
  StyleSheet,
  Svg,
  Text,
  View,
} from "@react-pdf/renderer";

import type { ReportSnapshot } from "./types";

/** PDF always renders LIGHT — printed document tokens (hex OK in React-PDF).
 * Motion is app-only. This document is the static flagship artefact: Gauge at
 * final position, no count-up, no ink-settle. Assembly metaphor stops at print. */
const C = {
  canvas: "#FBF9F5",
  surface1: "#FFFFFF",
  surface2: "#F5F2EC",
  ink: "#1A1714",
  muted: "#6B635A",
  rule: "#E0DAD0",
  ruleStrong: "#C4BBAE",
  accent: "#7A2E2E",
  signal: "#0E7C4A",
  amber: "#B87309",
  rust: "#B03A2E",
} as const;

const styles = StyleSheet.create({
  page: {
    padding: 48,
    fontSize: 10,
    fontFamily: "Helvetica",
    color: C.ink,
    backgroundColor: C.canvas,
  },
  accentRule: {
    height: 2,
    backgroundColor: C.accent,
    marginBottom: 28,
  },
  title: {
    fontSize: 28,
    fontFamily: "Times-Roman",
    marginBottom: 6,
    color: C.ink,
  },
  mono: { fontFamily: "Courier", fontSize: 10, color: C.ink },
  muted: { color: C.muted, marginBottom: 4, fontSize: 9 },
  h2: {
    fontSize: 12,
    marginTop: 20,
    marginBottom: 8,
    color: C.ink,
    borderBottomWidth: 1,
    borderBottomColor: C.rule,
    paddingBottom: 4,
  },
  row: { flexDirection: "row", justifyContent: "space-between", marginBottom: 3 },
  box: {
    borderWidth: 1,
    borderColor: C.rule,
    backgroundColor: C.surface1,
    padding: 10,
    marginTop: 4,
  },
  disclaimer: { marginTop: 28, fontSize: 8, color: C.muted },
  watermark: {
    position: "absolute",
    top: 360,
    left: 60,
    right: 60,
    fontSize: 22,
    color: C.ruleStrong,
    opacity: 0.5,
    textAlign: "center",
    transform: "rotate(-28deg)",
  },
  scoreBig: {
    fontFamily: "Courier",
    fontSize: 36,
    textAlign: "center",
    marginTop: 4,
  },
  label: {
    fontSize: 8,
    letterSpacing: 1.2,
    color: C.muted,
    textAlign: "center",
    textTransform: "uppercase",
  },
});

function PdfGauge({ score, size = 180 }: { score: number; size?: number }) {
  const clamped = Math.max(0, Math.min(100, score));
  const startAngle = -210;
  const sweep = 240;
  const cx = size / 2;
  const cy = size / 2 + size * 0.06;
  const r = size * 0.38;
  const progress = clamped / 100;
  const band = clamped >= 70 ? C.signal : clamped >= 45 ? C.amber : C.rust;

  function polar(angleDeg: number, radius: number) {
    const rad = (angleDeg * Math.PI) / 180;
    return { x: cx + radius * Math.cos(rad), y: cy + radius * Math.sin(rad) };
  }

  const start = polar(startAngle, r);
  const end = polar(startAngle + sweep, r);
  const mid = polar(startAngle + sweep * progress, r);
  const large = sweep * progress > 180 ? 1 : 0;
  const fillPath = `M ${start.x} ${start.y} A ${r} ${r} 0 ${large} 1 ${mid.x} ${mid.y}`;
  const trackPath = `M ${start.x} ${start.y} A ${r} ${r} 0 1 1 ${end.x} ${end.y}`;
  const needleAngle = startAngle + 90 + sweep * progress;
  const tip = polar(needleAngle - 90, r - 14);
  const ticks = [0, 20, 40, 60, 80, 100];

  return (
    <View style={{ alignItems: "center", marginVertical: 16 }}>
      <Svg width={size} height={size * 0.72} viewBox={`0 0 ${size} ${size * 0.72}`}>
        <Circle
          cx={cx}
          cy={cy}
          r={r + 22}
          fill={C.surface2}
          stroke={C.rule}
          strokeWidth={1}
        />
        <Path d={trackPath} stroke={C.rule} strokeWidth={2} fill="none" />
        <Path d={fillPath} stroke={band} strokeWidth={4} fill="none" />
        {ticks.map((v) => {
          const a = startAngle + sweep * (v / 100);
          const outer = polar(a, r - 2);
          const inner = polar(a, r - 14);
          const label = polar(a, r - 26);
          return (
            <G key={v}>
              <Line
                x1={inner.x}
                y1={inner.y}
                x2={outer.x}
                y2={outer.y}
                stroke={C.muted}
                strokeWidth={1}
              />
              <Text
                x={label.x - 6}
                y={label.y + 3}
                style={{ fontSize: 7, fontFamily: "Courier", color: C.muted }}
              >
                {String(v)}
              </Text>
            </G>
          );
        })}
        <Line x1={cx} y1={cy} x2={tip.x} y2={tip.y} stroke={C.ink} strokeWidth={1.5} />
        <Circle cx={cx} cy={cy} r={7} fill={C.surface1} stroke={C.rule} strokeWidth={1} />
        <Circle cx={cx} cy={cy} r={3} fill={C.ink} />
      </Svg>
      <Text style={styles.scoreBig}>{Math.round(clamped)}</Text>
      <Text style={styles.label}>Overall</Text>
    </View>
  );
}

export function ReportPdfDocument({
  snapshot,
  watermarked = false,
}: {
  snapshot: ReportSnapshot;
  watermarked?: boolean;
}) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {watermarked ? (
          <Text style={styles.watermark}>ClearESG Free — upgrade for clean PDF</Text>
        ) : null}
        <View style={styles.accentRule} />
        <Text style={styles.title}>ClearESG Report</Text>
        <Text style={styles.mono}>{snapshot.organisationName}</Text>
        <Text style={styles.muted}>
          {snapshot.periodLabel} · {snapshot.framework} · v{snapshot.version}
        </Text>

        <PdfGauge score={snapshot.scores.overall} />

        <Text style={styles.h2}>Scores</Text>
        <View style={styles.box}>
          <View style={styles.row}>
            <Text>E</Text>
            <Text style={styles.mono}>{snapshot.scores.e}</Text>
          </View>
          <View style={styles.row}>
            <Text>S</Text>
            <Text style={styles.mono}>{snapshot.scores.s}</Text>
          </View>
          <View style={styles.row}>
            <Text>G</Text>
            <Text style={styles.mono}>{snapshot.scores.g}</Text>
          </View>
        </View>

        <Text style={styles.h2}>Emissions (tCO2e)</Text>
        <View style={styles.box}>
          <View style={styles.row}>
            <Text>Scope 1</Text>
            <Text style={styles.mono}>{snapshot.emissions.scope1}</Text>
          </View>
          <View style={styles.row}>
            <Text>Scope 2</Text>
            <Text style={styles.mono}>{snapshot.emissions.scope2}</Text>
          </View>
          <View style={styles.row}>
            <Text>Scope 3</Text>
            <Text style={styles.mono}>{snapshot.emissions.scope3}</Text>
          </View>
          <View style={styles.row}>
            <Text>Total</Text>
            <Text style={styles.mono}>{snapshot.emissions.total}</Text>
          </View>
          <View style={styles.row}>
            <Text>Data quality</Text>
            <Text style={styles.mono}>{snapshot.emissions.dataQualityPct}%</Text>
          </View>
        </View>

        <Text style={styles.h2}>Materiality</Text>
        <Text style={styles.muted}>
          {snapshot.materiality.narrative ?? "No materiality assessment finalised."}
        </Text>
        {snapshot.materiality.points
          .filter((p) => p.material)
          .map((p) => (
            <Text key={p.esrsTopic} style={styles.mono}>
              {p.esrsTopic} impact={p.impactScore} financial={p.financialScore}
            </Text>
          ))}

        <Text style={styles.h2}>Factor versions</Text>
        {snapshot.factorsUsed.length === 0 ? (
          <Text style={styles.muted}>No factors pinned (missing activity data).</Text>
        ) : (
          snapshot.factorsUsed.map((f) => (
            <Text key={f.factorId} style={styles.mono}>
              {f.key} · {f.source} · {f.year} · {f.value}
            </Text>
          ))
        )}

        <Text style={styles.h2}>Evidence index</Text>
        {snapshot.evidenceIndex.length === 0 ? (
          <Text style={styles.muted}>No evidence uploaded.</Text>
        ) : (
          snapshot.evidenceIndex.slice(0, 30).map((e) => (
            <Text key={e.sha256} style={styles.mono}>
              {e.filename} · {e.sha256.slice(0, 12)}…
            </Text>
          ))
        )}

        <Text style={styles.disclaimer}>{snapshot.disclaimer}</Text>
      </Page>
    </Document>
  );
}
