import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig, Sequence } from "remotion";

const steps = [
  { label: "1", title: "Register on Portal", desc: "Creates account from mobile phone", icon: "📱" },
  { label: "2", title: "Request Address", desc: "GPS location + documents uploaded", icon: "📍" },
  { label: "3", title: "Track Status", desc: "REQ-2026-00847 — Pending verification", icon: "📋" },
  { label: "4", title: "Receive UAC Code", desc: "GQ-BN-MAL-ENG-0847 — Verified!", icon: "🎉" },
];

export const Scene3Maria: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill style={{ background: "linear-gradient(160deg, #050D1A 0%, #0A2D6B 50%, #0E1B3D 100%)", display: "flex", overflow: "hidden" }}>
      {/* Blue accent glow */}
      <div style={{ position: "absolute", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(59,130,246,0.12) 0%, transparent 70%)", top: "30%", right: "5%" }} />

      {/* Left side — persona */}
      <div style={{ width: "35%", display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 80px" }}>
        <div style={{
          fontSize: 14, color: "#3B82F6", fontWeight: 700, letterSpacing: 5, textTransform: "uppercase", fontFamily: "sans-serif", marginBottom: 8,
          opacity: interpolate(frame, [5, 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
        }}>
          Persona 1 — Citizen
        </div>

        <div style={{
          fontSize: 52, fontWeight: 800, color: "white", fontFamily: "sans-serif", marginBottom: 12, letterSpacing: -1,
          opacity: interpolate(frame, [10, 25], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
          transform: `translateY(${interpolate(frame, [10, 25], [20, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}px)`,
        }}>
          María Nguema
        </div>

        <div style={{
          fontSize: 18, color: "rgba(255,255,255,0.5)", fontFamily: "sans-serif", lineHeight: 1.6, marginBottom: 24,
          opacity: interpolate(frame, [20, 35], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
        }}>
          32 years old, teacher in Malabo.<br />
          Has never had a formal address.<br />
          Needs one to open a bank account.
        </div>

        <div style={{
          fontSize: 22, color: "#D4A853", fontFamily: "sans-serif", fontStyle: "italic",
          opacity: interpolate(frame, [30, 45], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
        }}>
          "I want my home to have an official address"
        </div>
      </div>

      {/* Right side — flow steps */}
      <div style={{ width: "65%", display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 60px", gap: 20 }}>
        {steps.map((step, i) => {
          const delay = 40 + i * 30;
          const s = spring({ frame: frame - delay, fps, config: { damping: 20, stiffness: 120 } });
          const op = interpolate(frame, [delay, delay + 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

          // Highlight active step
          const isActive = frame >= delay + 20 && (i === steps.length - 1 || frame < 40 + (i + 1) * 30 + 20);
          const borderColor = isActive ? "rgba(59,130,246,0.5)" : "rgba(59,130,246,0.15)";
          const bg = isActive ? "rgba(59,130,246,0.08)" : "rgba(59,130,246,0.03)";

          return (
            <div key={i} style={{
              display: "flex", alignItems: "center", gap: 24, padding: "20px 28px", borderRadius: 14,
              background: bg, border: `1px solid ${borderColor}`, opacity: op,
              transform: `translateX(${interpolate(s, [0, 1], [60, 0])}px)`,
            }}>
              <div style={{ fontSize: 36, width: 56, height: 56, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(59,130,246,0.15)", borderRadius: 12, flexShrink: 0 }}>
                {step.icon}
              </div>
              <div>
                <div style={{ fontSize: 22, fontWeight: 700, color: "white", fontFamily: "sans-serif", marginBottom: 4 }}>{step.title}</div>
                <div style={{ fontSize: 16, color: "rgba(255,255,255,0.5)", fontFamily: "sans-serif" }}>{step.desc}</div>
              </div>
              {i === steps.length - 1 && frame > delay + 15 && (
                <div style={{
                  marginLeft: "auto", fontSize: 14, fontWeight: 700, color: "#10B981", fontFamily: "sans-serif", letterSpacing: 2, padding: "6px 14px", border: "1px solid rgba(16,185,129,0.3)", borderRadius: 8,
                  opacity: interpolate(frame, [delay + 15, delay + 25], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
                }}>
                  ✓ APPROVED
                </div>
              )}
            </div>
          );
        })}

        {/* Result */}
        <div style={{
          marginTop: 10, padding: "16px 28px", background: "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.2)", borderRadius: 14,
          opacity: interpolate(frame, [180, 200], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
          transform: `translateY(${interpolate(frame, [180, 200], [15, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}px)`,
        }}>
          <div style={{ fontSize: 16, color: "#10B981", fontFamily: "sans-serif", fontWeight: 600 }}>
            ✓ María can now open a bank account, receive packages, and be located in emergencies
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
