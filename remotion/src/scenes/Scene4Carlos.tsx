import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";

const queue = [
  { id: "REQ-2026-00847", name: "María Nguema", status: "Urgent", color: "#EF4444", days: "6 days" },
  { id: "REQ-2026-00851", name: "Fatou Mba", status: "Normal", color: "#F59E0B", days: "3 days" },
  { id: "REQ-2026-00855", name: "José Engonga", status: "New", color: "#10B981", days: "Today" },
];

export const Scene4Carlos: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill style={{ background: "linear-gradient(160deg, #050D1A 0%, #0D2850 50%, #0E1B3D 100%)", display: "flex", overflow: "hidden" }}>
      <div style={{ position: "absolute", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(212,168,83,0.08) 0%, transparent 70%)", top: "20%", left: "10%" }} />

      {/* Left — persona */}
      <div style={{ width: "35%", display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 80px" }}>
        <div style={{
          fontSize: 14, color: "#D4A853", fontWeight: 700, letterSpacing: 5, textTransform: "uppercase", fontFamily: "sans-serif", marginBottom: 8,
          opacity: interpolate(frame, [5, 18], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
        }}>
          Persona 2 — Municipal Verifier
        </div>
        <div style={{
          fontSize: 48, fontWeight: 800, color: "white", fontFamily: "sans-serif", marginBottom: 12,
          opacity: interpolate(frame, [10, 25], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
          transform: `translateY(${interpolate(frame, [10, 25], [20, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}px)`,
        }}>
          Carlos Ndong
        </div>
        <div style={{
          fontSize: 18, color: "rgba(255,255,255,0.5)", fontFamily: "sans-serif", lineHeight: 1.6, marginBottom: 24,
          opacity: interpolate(frame, [20, 35], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
        }}>
          Municipal verifier for Ela Nguema district.<br />
          Processes address requests with AI assistance.
        </div>
        <div style={{
          fontSize: 22, color: "#D4A853", fontFamily: "sans-serif", fontStyle: "italic",
          opacity: interpolate(frame, [30, 45], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
        }}>
          "I verify address requests for my municipality"
        </div>
      </div>

      {/* Right — verification panel */}
      <div style={{ width: "65%", display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 60px", gap: 16 }}>
        {/* Stats bar */}
        <div style={{
          display: "flex", gap: 20, marginBottom: 16,
          opacity: interpolate(frame, [30, 45], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
        }}>
          {[
            { label: "Queue", value: "12", color: "#3B82F6" },
            { label: "Urgent", value: "3", color: "#EF4444" },
            { label: "Monthly Rate", value: "94%", color: "#10B981" },
          ].map((s, i) => (
            <div key={i} style={{ padding: "12px 24px", background: `${s.color}10`, border: `1px solid ${s.color}30`, borderRadius: 10, textAlign: "center" }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: s.color, fontFamily: "sans-serif" }}>{s.value}</div>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", fontFamily: "sans-serif" }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Queue items */}
        {queue.map((item, i) => {
          const delay = 45 + i * 20;
          const s = spring({ frame: frame - delay, fps, config: { damping: 18, stiffness: 120 } });
          const op = interpolate(frame, [delay, delay + 10], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
          return (
            <div key={i} style={{
              display: "flex", alignItems: "center", gap: 20, padding: "16px 24px", borderRadius: 12,
              background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", opacity: op,
              transform: `translateX(${interpolate(s, [0, 1], [50, 0])}px)`,
            }}>
              <div style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: item.color, flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 18, fontWeight: 600, color: "white", fontFamily: "sans-serif" }}>{item.name}</div>
                <div style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", fontFamily: "sans-serif" }}>{item.id}</div>
              </div>
              <div style={{ fontSize: 13, color: item.color, fontWeight: 600, fontFamily: "sans-serif" }}>{item.status}</div>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.3)", fontFamily: "sans-serif" }}>{item.days}</div>
            </div>
          );
        })}

        {/* AI assessment */}
        <div style={{
          marginTop: 12, padding: "20px 24px", background: "rgba(59,130,246,0.06)", border: "1px solid rgba(59,130,246,0.2)", borderRadius: 14,
          opacity: interpolate(frame, [120, 140], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
          transform: `translateY(${interpolate(frame, [120, 140], [15, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}px)`,
        }}>
          <div style={{ fontSize: 14, color: "#3B82F6", fontWeight: 700, fontFamily: "sans-serif", marginBottom: 8, letterSpacing: 2 }}>AI PRE-ASSESSMENT</div>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ fontSize: 36, fontWeight: 800, color: "#10B981", fontFamily: "sans-serif" }}>82/100</div>
            <div style={{ fontSize: 15, color: "rgba(255,255,255,0.5)", fontFamily: "sans-serif" }}>AI assists but never replaces the human verifier's decision</div>
          </div>
        </div>

        {/* Approval */}
        <div style={{
          padding: "14px 24px", background: "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.2)", borderRadius: 12,
          opacity: interpolate(frame, [155, 175], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
          display: "flex", alignItems: "center", gap: 12,
        }}>
          <div style={{ fontSize: 16, color: "#10B981", fontFamily: "sans-serif", fontWeight: 600 }}>✓ Approved → UAC: GQ-BN-MAL-ENG-0847 auto-generated → Citizen notified instantly</div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
