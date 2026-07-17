import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        background: "#0B0D0E",
        color: "#E8E6E1",
        padding: 64,
        fontFamily: "sans-serif",
      }}
    >
      <div style={{ fontSize: 28, letterSpacing: 4, textTransform: "uppercase" }}>
        ClearESG
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ fontSize: 64, lineHeight: 1.05, maxWidth: 900 }}>
          Precision instrument for mandatory disclosure.
        </div>
        <div style={{ fontSize: 28, color: "#8A9299", maxWidth: 800 }}>
          Audit-ready this quarter.
        </div>
      </div>
      <div style={{ fontSize: 40, fontFamily: "monospace", color: "#00E08A" }}>72</div>
    </div>,
    { ...size },
  );
}
