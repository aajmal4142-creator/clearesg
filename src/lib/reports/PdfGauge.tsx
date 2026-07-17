import { Circle, G, Line, Path, Svg, Text, View } from "@react-pdf/renderer";

/** Static 240° gauge for PDF page 1 — third placement only. */
export function PdfGauge({ score, size = 160 }: { score: number; size?: number }) {
  const clamped = Math.max(0, Math.min(100, score));
  const startAngle = -210;
  const sweep = 240;
  const cx = size / 2;
  const cy = size / 2 + size * 0.06;
  const r = size * 0.38;
  const progress = clamped / 100;

  const band = clamped >= 70 ? "#00E08A" : clamped >= 45 ? "#FFB020" : "#FF5C4D";

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
  const needleLen = r - 14;
  const tip = polar(needleAngle - 90, needleLen);

  const ticks = [0, 20, 40, 60, 80, 100];

  return (
    <View style={{ alignItems: "center", marginVertical: 12 }}>
      <Svg width={size} height={size * 0.72} viewBox={`0 0 ${size} ${size * 0.72}`}>
        <Path d={trackPath} stroke="#3A4044" strokeWidth={2} fill="none" />
        <Path d={fillPath} stroke={band} strokeWidth={3} fill="none" />
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
                stroke="#8A9299"
                strokeWidth={1}
              />
              <Text
                x={label.x - 6}
                y={label.y + 3}
                style={{ fontSize: 7, fontFamily: "Courier", color: "#8A9299" }}
              >
                {String(v)}
              </Text>
            </G>
          );
        })}
        <Line x1={cx} y1={cy} x2={tip.x} y2={tip.y} stroke="#0B0D0E" strokeWidth={1.5} />
        <Circle cx={cx} cy={cy} r={5} fill="#1A1D1F" />
        <Circle cx={cx} cy={cy} r={2} fill="#0B0D0E" />
      </Svg>
      <Text style={{ fontFamily: "Courier", fontSize: 28, marginTop: 4 }}>
        {Math.round(clamped)}
      </Text>
      <Text style={{ fontSize: 8, color: "#8A9299", letterSpacing: 1.2 }}>OVERALL</Text>
    </View>
  );
}
