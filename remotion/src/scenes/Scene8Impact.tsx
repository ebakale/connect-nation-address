import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";

const metrics = [
  { label: "Successful Deliveries", before: "65%", after: "94%", improvement: "+45%", color: "#10B981" },
  { label: "Lost Packages", before: "12%", after: "0.3%", improvement: "-97%", color: "#10B981" },
  { label: "Avg Delivery Time", before: "5-7 days", after: "1.8 days", improvement: "-70%", color: "#3B82F6" },
  { label: "Customer Complaints", before: "340/mo", after: "45/mo", improvement: "-87%", color: "#8B5CF6" },
  { label: "Address Not Found", before: "28%", after: "0.5%", improvement: "-98%", color: "#D4A853" },
];

export const Scene8Impact: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill style={{ background: "linear-gradient(160deg, #050D1A 0%, #0A2D6B 50%, #0E1B3D 100%)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
      <div style={{ position: "absolute", width: 800, height: 800, borderRadius: "50%", background: "radial-gradient(circle, rgba(16,185,129,0.06) 0%, transparent 60%)", top: "50%", left: "50%", transform: "translate(-50%, -50%)" }} />

      <div style={{ fontSize: 14, color: "#D4A853", fontWeight: 700, letterSpacing: 6, textTransform: "uppercase", fontFamily: "sans-serif", marginBottom: 8, opacity: interpolate(frame, [5, 18], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) }}>
        Director Mbá — Executive Dashboard
      </div>
      <div style={{ fontSize: 48, fontWeight: 800, color: "white", fontFamily: "sans-serif", marginBottom: 10, opacity: interpolate(frame, [10, 25], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }), transform: `translateY(${interpolate(frame, [10, 25], [20, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}px)` }}>
        Measurable National Impact
      </div>
      <div style={{ fontSize: 18, color: "rgba(255,255,255,0.4)", fontFamily: "sans-serif", marginBottom: 40, opacity: interpolate(frame, [18, 30], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) }}>
        Before vs. After ConEG Implementation
      </div>

      {/* Metrics table */}
      <div style={{ width: 1100, display: "flex", flexDirection: "column", gap: 8 }}>
        {/* Header */}
        <div style={{
          display: "flex", padding: "10px 28px", opacity: interpolate(frame, [25, 38], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
        }}>
          <div style={{ flex: 2, fontSize: 13, color: "rgba(255,255,255,0.3)", fontFamily: "sans-serif", letterSpacing: 2 }}>METRIC</div>
          <div style={{ flex: 1, fontSize: 13, color: "rgba(255,255,255,0.3)", fontFamily: "sans-serif", letterSpacing: 2, textAlign: "center" }}>BEFORE</div>
          <div style={{ flex: 1, fontSize: 13, color: "rgba(255,255,255,0.3)", fontFamily: "sans-serif", letterSpacing: 2, textAlign: "center" }}>WITH CONEG</div>
          <div style={{ flex: 1, fontSize: 13, color: "rgba(255,255,255,0.3)", fontFamily: "sans-serif", letterSpacing: 2, textAlign: "center" }}>CHANGE</div>
        </div>

        {metrics.map((m, i) => {
          const delay = 35 + i * 18;
          const s = spring({ frame: frame - delay, fps, config: { damping: 18, stiffness: 130 } });
          const op = interpolate(frame, [delay, delay + 10], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
          return (
            <div key={i} style={{
              display: "flex", alignItems: "center", padding: "16px 28px", borderRadius: 12,
              background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", opacity: op,
              transform: `translateY(${interpolate(s, [0, 1], [20, 0])}px)`,
            }}>
              <div style={{ flex: 2, fontSize: 18, color: "white", fontFamily: "sans-serif", fontWeight: 600 }}>{m.label}</div>
              <div style={{ flex: 1, fontSize: 18, color: "rgba(255,255,255,0.35)", fontFamily: "sans-serif", textAlign: "center", textDecoration: "line-through" }}>{m.before}</div>
              <div style={{ flex: 1, fontSize: 20, color: "white", fontFamily: "sans-serif", fontWeight: 700, textAlign: "center" }}>{m.after}</div>
              <div style={{ flex: 1, fontSize: 20, color: m.color, fontFamily: "sans-serif", fontWeight: 800, textAlign: "center" }}>{m.improvement}</div>
            </div>
          );
        })}
      </div>

      {/* Bottom note */}
      <div style={{
        marginTop: 30, fontSize: 16, color: "rgba(255,255,255,0.5)", fontFamily: "sans-serif",
        opacity: interpolate(frame, [150, 170], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
      }}>
        📊 UAC eliminated the "address not found" problem entirely
      </div>
    </AbsoluteFill>
  );
};
