import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";

const members = [
  { icon: "👤", name: "Pedro Obiang", role: "Head of household", status: "Active", color: "#3B82F6" },
  { icon: "👤", name: "Elena Asumu", role: "Co-resident (spouse)", status: "Confirmed", color: "#10B981" },
  { icon: "👶", name: "Juan Obiang (14)", role: "Dependent — minor", status: "Registered", color: "#8B5CF6" },
  { icon: "👶", name: "Sofía Obiang (9)", role: "Dependent — minor", status: "Registered", color: "#8B5CF6" },
  { icon: "👶", name: "Baby Obiang (4)", role: "Dependent — minor", status: "Registered", color: "#8B5CF6" },
];

export const Scene5Pedro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill style={{ background: "linear-gradient(160deg, #050D1A 0%, #1A0D3D 50%, #0E1B3D 100%)", display: "flex", overflow: "hidden" }}>
      <div style={{ position: "absolute", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(139,92,246,0.1) 0%, transparent 70%)", top: "40%", right: "15%" }} />

      {/* Left */}
      <div style={{ width: "38%", display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 80px" }}>
        <div style={{ fontSize: 14, color: "#8B5CF6", fontWeight: 700, letterSpacing: 5, textTransform: "uppercase", fontFamily: "sans-serif", marginBottom: 8, opacity: interpolate(frame, [5, 18], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) }}>
          Persona 3 — Head of Household
        </div>
        <div style={{ fontSize: 48, fontWeight: 800, color: "white", fontFamily: "sans-serif", marginBottom: 12, opacity: interpolate(frame, [10, 25], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }), transform: `translateY(${interpolate(frame, [10, 25], [20, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}px)` }}>
          Pedro Obiang
        </div>
        <div style={{ fontSize: 18, color: "rgba(255,255,255,0.5)", fontFamily: "sans-serif", lineHeight: 1.6, marginBottom: 20, opacity: interpolate(frame, [20, 35], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) }}>
          45 years old, public servant in Bata.<br />
          Married with 3 children.<br />
          Needs to register his entire family.
        </div>
        <div style={{ fontSize: 22, color: "#D4A853", fontFamily: "sans-serif", fontStyle: "italic", opacity: interpolate(frame, [30, 45], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) }}>
          "My whole family needs to be registered"
        </div>

        {/* Address card */}
        <div style={{
          marginTop: 30, padding: "16px 20px", background: "rgba(139,92,246,0.06)", border: "1px solid rgba(139,92,246,0.2)", borderRadius: 12,
          opacity: interpolate(frame, [40, 55], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
        }}>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", fontFamily: "sans-serif", marginBottom: 4 }}>Home Address</div>
          <div style={{ fontSize: 18, color: "#8B5CF6", fontFamily: "monospace", fontWeight: 700 }}>GQ-LT-BAT-CEN-0312</div>
        </div>
      </div>

      {/* Right — household members */}
      <div style={{ width: "62%", display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 60px", gap: 14 }}>
        <div style={{
          fontSize: 16, color: "rgba(255,255,255,0.4)", fontWeight: 600, letterSpacing: 3, textTransform: "uppercase", fontFamily: "sans-serif", marginBottom: 8,
          opacity: interpolate(frame, [40, 55], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
        }}>
          🏠 Household: Familia Obiang-Asumu
        </div>

        {members.map((m, i) => {
          const delay = 50 + i * 18;
          const s = spring({ frame: frame - delay, fps, config: { damping: 18, stiffness: 130 } });
          const op = interpolate(frame, [delay, delay + 10], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
          return (
            <div key={i} style={{
              display: "flex", alignItems: "center", gap: 16, padding: "14px 22px", borderRadius: 12,
              background: `${m.color}08`, border: `1px solid ${m.color}20`, opacity: op,
              transform: `translateX(${interpolate(s, [0, 1], [40, 0])}px)`,
            }}>
              <div style={{ fontSize: 28 }}>{m.icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 18, fontWeight: 600, color: "white", fontFamily: "sans-serif" }}>{m.name}</div>
                <div style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", fontFamily: "sans-serif" }}>{m.role}</div>
              </div>
              <div style={{ fontSize: 12, color: m.color, fontWeight: 600, fontFamily: "sans-serif", padding: "4px 10px", border: `1px solid ${m.color}30`, borderRadius: 6 }}>{m.status}</div>
            </div>
          );
        })}

        {/* Privacy note */}
        <div style={{
          marginTop: 10, padding: "14px 22px", background: "rgba(212,168,83,0.05)", border: "1px solid rgba(212,168,83,0.15)", borderRadius: 12,
          opacity: interpolate(frame, [160, 178], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
        }}>
          <div style={{ fontSize: 14, color: "#D4A853", fontFamily: "sans-serif", fontWeight: 500 }}>
            🔒 Minors have maximum data privacy — both legal guardians must authorize registration
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
