import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";

export const Scene7Postal: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const isPhase2 = frame > 120;
  const phase2Frame = Math.max(0, frame - 120);

  return (
    <AbsoluteFill style={{ background: isPhase2 ? "linear-gradient(160deg, #050D1A 0%, #0A1B3D 50%, #0D2850 100%)" : "linear-gradient(160deg, #050D1A 0%, #1A2D0A 40%, #0A1020 100%)", display: "flex", overflow: "hidden" }}>
      <div style={{ position: "absolute", width: 500, height: 500, borderRadius: "50%", background: `radial-gradient(circle, ${isPhase2 ? "rgba(59,130,246,0.08)" : "rgba(16,185,129,0.08)"} 0%, transparent 70%)`, top: "35%", right: "15%" }} />

      {!isPhase2 ? (
        /* Phase 1: Jean-Pierre — Package Processing */
        <>
          <div style={{ width: "35%", display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 70px" }}>
            <div style={{ fontSize: 14, color: "#10B981", fontWeight: 700, letterSpacing: 5, textTransform: "uppercase", fontFamily: "sans-serif", marginBottom: 8, opacity: interpolate(frame, [5, 18], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) }}>
              Persona 6 — Postal Clerk
            </div>
            <div style={{ fontSize: 44, fontWeight: 800, color: "white", fontFamily: "sans-serif", marginBottom: 12, opacity: interpolate(frame, [10, 25], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }), transform: `translateY(${interpolate(frame, [10, 25], [20, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}px)` }}>
              Jean-Pierre Ondo
            </div>
            <div style={{ fontSize: 18, color: "rgba(255,255,255,0.5)", fontFamily: "sans-serif", lineHeight: 1.6, opacity: interpolate(frame, [20, 35], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) }}>
              Central post office clerk.<br />
              Processes ~80 packages daily.<br />
              Smart routing with UAC codes.
            </div>
          </div>

          <div style={{ width: "65%", display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 50px", gap: 14 }}>
            {/* Package card */}
            <div style={{
              padding: "20px 24px", background: "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.2)", borderRadius: 14,
              opacity: interpolate(frame, [25, 40], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
              transform: `scale(${spring({ frame: frame - 25, fps, config: { damping: 18, stiffness: 100 } })})`,
            }}>
              <div style={{ fontSize: 14, color: "#10B981", fontWeight: 700, letterSpacing: 2, fontFamily: "sans-serif", marginBottom: 12 }}>📦 NEW PACKAGE REGISTERED</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px 30px" }}>
                {[
                  ["From", "Ministry of Education"],
                  ["To", "María Nguema"],
                  ["UAC", "GQ-BN-MAL-ENG-0847"],
                  ["Tracking", "PKG-2026-04521"],
                  ["Type", "Certified document"],
                  ["Requires signature", "Yes"],
                ].map(([label, value], i) => (
                  <div key={i}>
                    <span style={{ fontSize: 13, color: "rgba(255,255,255,0.3)", fontFamily: "sans-serif" }}>{label}: </span>
                    <span style={{ fontSize: 15, color: "white", fontFamily: label === "UAC" || label === "Tracking" ? "monospace" : "sans-serif", fontWeight: label === "UAC" ? 700 : 400 }}>{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Smart routing */}
            <div style={{
              padding: "16px 24px", background: "rgba(59,130,246,0.05)", border: "1px solid rgba(59,130,246,0.15)", borderRadius: 12,
              opacity: interpolate(frame, [55, 70], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
            }}>
              <div style={{ fontSize: 14, color: "#3B82F6", fontWeight: 700, letterSpacing: 2, fontFamily: "sans-serif", marginBottom: 8 }}>🤖 SMART CLASSIFICATION</div>
              <div style={{ fontSize: 15, color: "rgba(255,255,255,0.5)", fontFamily: "sans-serif" }}>Zone: Ela Nguema → Route: North-3 → Agent: Lucía Nchama (lowest load) → Window: 8:00-12:00</div>
            </div>

            {/* Daily stats */}
            <div style={{
              display: "flex", gap: 16, opacity: interpolate(frame, [80, 95], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
            }}>
              {[
                { value: "67/80", label: "Processed", color: "#3B82F6" },
                { value: "5", label: "Active routes", color: "#10B981" },
                { value: "23", label: "Delivered", color: "#10B981" },
                { value: "2", label: "Failed", color: "#EF4444" },
              ].map((s, i) => (
                <div key={i} style={{ flex: 1, padding: "12px 16px", background: `${s.color}08`, border: `1px solid ${s.color}20`, borderRadius: 10, textAlign: "center" }}>
                  <div style={{ fontSize: 24, fontWeight: 800, color: s.color, fontFamily: "sans-serif" }}>{s.value}</div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", fontFamily: "sans-serif" }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        /* Phase 2: Lucía — Delivery Agent */
        <>
          <div style={{ width: "35%", display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 70px" }}>
            <div style={{ fontSize: 14, color: "#3B82F6", fontWeight: 700, letterSpacing: 5, textTransform: "uppercase", fontFamily: "sans-serif", marginBottom: 8, opacity: interpolate(phase2Frame, [5, 18], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) }}>
              Persona 7 — Delivery Agent
            </div>
            <div style={{ fontSize: 44, fontWeight: 800, color: "white", fontFamily: "sans-serif", marginBottom: 12, opacity: interpolate(phase2Frame, [8, 22], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }), transform: `translateY(${interpolate(phase2Frame, [8, 22], [20, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}px)` }}>
              Lucía Nchama
            </div>
            <div style={{ fontSize: 18, color: "rgba(255,255,255,0.5)", fontFamily: "sans-serif", lineHeight: 1.6, opacity: interpolate(phase2Frame, [18, 30], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) }}>
              26 years old, delivery agent.<br />
              Delivers 12-18 packages daily by motorbike.<br />
              Uses mobile app with UAC navigation.
            </div>
          </div>

          <div style={{ width: "65%", display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 50px", gap: 12 }}>
            {[
              { delay: 15, icon: "🗺️", title: "Optimized Route Started", desc: "15 stops ordered by proximity — ETA: 4.5 hours" },
              { delay: 35, icon: "📍", title: "GPS Navigation to UAC", desc: "Direct navigation to each address code — no guessing" },
              { delay: 55, icon: "📷", title: "Delivery Proof Captured", desc: "Photo + GPS + timestamp — legally valid evidence" },
              { delay: 70, icon: "✍️", title: "Certified Delivery to María", desc: "ID verification + digital signature for official documents" },
              { delay: 85, icon: "📊", title: "Route Complete", desc: "13/15 delivered — 87% efficiency — 45,000 XAF COD collected" },
            ].map((step, i) => {
              const s = spring({ frame: phase2Frame - step.delay, fps, config: { damping: 18, stiffness: 130 } });
              const op = interpolate(phase2Frame, [step.delay, step.delay + 10], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
              return (
                <div key={i} style={{
                  display: "flex", alignItems: "flex-start", gap: 16, padding: "13px 20px", borderRadius: 12,
                  background: "rgba(59,130,246,0.04)", border: "1px solid rgba(59,130,246,0.12)", opacity: op,
                  transform: `translateX(${interpolate(s, [0, 1], [50, 0])}px)`,
                }}>
                  <div style={{ fontSize: 20, marginTop: 2 }}>{step.icon}</div>
                  <div>
                    <div style={{ fontSize: 17, fontWeight: 700, color: "white", fontFamily: "sans-serif", marginBottom: 2 }}>{step.title}</div>
                    <div style={{ fontSize: 14, color: "rgba(255,255,255,0.45)", fontFamily: "sans-serif" }}>{step.desc}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </AbsoluteFill>
  );
};
