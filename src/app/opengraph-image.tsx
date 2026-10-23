import { ImageResponse } from "next/og";

export const alt = "PlanCheck — PostgreSQL EXPLAIN Analyzer";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "72px",
          background: "#071015",
          color: "white",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18, color: "#67e8f9", fontSize: 28 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, border: "1px solid #155e75", display: "flex", alignItems: "center", justifyContent: "center" }}>P</div>
          PlanCheck
        </div>
        <div style={{ marginTop: 48, fontSize: 70, fontWeight: 700, letterSpacing: "-3px", lineHeight: 1.05, maxWidth: 1000 }}>
          Your PostgreSQL query is slow.
        </div>
        <div style={{ marginTop: 12, fontSize: 70, fontWeight: 700, letterSpacing: "-3px", color: "#67e8f9" }}>
          Find out why.
        </div>
        <div style={{ marginTop: 36, fontSize: 28, color: "#94a3b8" }}>
          Evidence-based EXPLAIN analysis · No signup · Runs in your browser
        </div>
      </div>
    ),
    size
  );
}
