import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";

import { PdfGauge } from "./PdfGauge";
import type { ReportSnapshot } from "./types";

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: "Helvetica",
    color: "#0B0D0E",
  },
  h1: { fontSize: 22, marginBottom: 8 },
  h2: { fontSize: 14, marginTop: 16, marginBottom: 6 },
  muted: { color: "#3A4044", marginBottom: 4 },
  row: { flexDirection: "row", justifyContent: "space-between", marginBottom: 3 },
  mono: { fontFamily: "Courier", fontSize: 10 },
  box: {
    borderWidth: 1,
    borderColor: "#3A4044",
    padding: 8,
    marginTop: 8,
  },
  disclaimer: { marginTop: 24, fontSize: 8, color: "#8A9299" },
  watermark: {
    position: "absolute",
    top: 360,
    left: 60,
    right: 60,
    fontSize: 28,
    color: "#C8CED4",
    opacity: 0.45,
    textAlign: "center",
    transform: "rotate(-28deg)",
  },
});

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
        <Text style={styles.h1}>ClearESG Report</Text>
        <Text style={styles.muted}>{snapshot.organisationName}</Text>
        <Text style={styles.muted}>
          {snapshot.periodLabel} · {snapshot.framework} · v{snapshot.version}
        </Text>
        <PdfGauge score={snapshot.scores.overall} />
        <Text style={styles.mono}>
          Overall {snapshot.scores.overall} ({snapshot.band})
        </Text>

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
