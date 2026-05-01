import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig, Sequence } from "remotion";

export const Scene6Emergency: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Phase 1: Ana the dispatcher (frames 0-130)
  // Phase 2: Sgt Manuel in the field (frames 130-260)
  const isPhase2 = frame > 130;
  const phase2Frame = Math.max(0, frame - 130);

  // Pulsing red glow
  const pulseOpacity = 0.08 + Math.sin(frame * 0.15) * 0.04;

  return (
    <AbsoluteFill style={{ background: isPhase2 ? "linear-gradient(160deg, #050D1A 0%, #0A2D1A 50%, #0E1B3D 100%)" : "linear-gradient(160deg, #0E0505 0%, #2D0A0A 40%, #0A1020 100%)", display: "flex", overflow: "hidden" }}>
      <div style={{ position: "absolute", width: 700, height: 700, borderRadius: "50%", background: `radial-gradient(circle, ${isPhase2 ? "rgba(16,185,129,0.08)" : `rgba(239,68,68,${pulseOpacity})`} 0%, transparent 70%)`, top: "40%", left: "50%", transform: "translate(-50%, -50%)" }} />

      {!isPhase2 ? (
        /* Phase 1: Ana — 112 Dispatcher */
        <>
          <div style={{ width: "35%", display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 70px" }}>
            <div style={{ fontSize: 14, color: "#EF4444", fontWeight: 700, letterSpacing: 5, textTransform: "uppercase", fontFamily: "sans-serif", marginBottom: 8, opacity: interpolate(frame, [5, 18], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) }}>
              Persona 4 — 112 Dispatcher
            </div>
            <div style={{ fontSize: 48, fontWeight: 800, color: "white", fontFamily: "sans-serif", marginBottom: 12, opacity: interpolate(frame, [10, 25], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }), transform: `translateY(${interpolate(frame, [10, 25], [20, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}px)` }}>
              Ana Bibang
            </div>
            <div style={{ fontSize: 18, color: "rgba(255,255,255,0.5)", fontFamily: "sans-serif", lineHeight: 1.6, opacity: interpolate(frame, [20, 35], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) }}>
              28 years old, 112 operator.<br />
              Night shift at the Emergency Center.<br />
              15 incidents per shift average.
            </div>
          </div>

          <div style={{ width: "65%", display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 50px", gap: 16 }}>
            {/* Incoming call */}
            <div style={{
              padding: "20px 24px", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 14,
              opacity: interpolate(frame, [25, 38], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
              transform: `scale(${spring({ frame: frame - 25, fps, config: { damping: 15, stiffness: 120 } })})`,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                <div style={{ fontSize: 24 }}>📞</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: "#EF4444", fontFamily: "sans-serif" }}>INCOMING EMERGENCY CALL</div>
              </div>
              <div style={{ fontSize: 15, color: "rgba(255,255,255,0.5)", fontFamily: "sans-serif", marginBottom: 8 }}>+240 222 XXX XXX</div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ fontSize: 14, color: "#3B82F6", fontFamily: "sans-serif" }}>📍 Auto-located:</div>
                <div style={{ fontSize: 16, color: "#3B82F6", fontFamily: "monospace", fontWeight: 700 }}>GQ-BN-MAL-ENG-0847 — María Nguema</div>
              </div>
            </div>

            {/* Key point */}
            <div style={{
              padding: "14px 24px", background: "rgba(212,168,83,0.05)", border: "1px solid rgba(212,168,83,0.15)", borderRadius: 10,
              opacity: interpolate(frame, [50, 65], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
            }}>
              <div style={{ fontSize: 15, color: "#D4A853", fontFamily: "sans-serif" }}>⚡ With UAC, location is INSTANT — no time wasted asking "where are you?"</div>
            </div>

            {/* Units */}
            <div style={{ opacity: interpolate(frame, [65, 80], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) }}>
              <div style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", fontFamily: "sans-serif", marginBottom: 10, letterSpacing: 2 }}>AVAILABLE UNITS</div>
              {[
                { icon: "🚑", name: "Ambulance A-03", dist: "2.1 km", status: "Available", best: true },
                { icon: "🚑", name: "Ambulance A-07", dist: "4.5 km", status: "Available", best: false },
                { icon: "🚓", name: "Patrol P-12", dist: "1.8 km", status: "On duty", best: false },
              ].map((u, i) => (
                <div key={i} style={{
                  display: "flex", alignItems: "center", gap: 16, padding: "10px 18px", marginBottom: 6, borderRadius: 10,
                  background: u.best ? "rgba(16,185,129,0.08)" : "rgba(255,255,255,0.02)",
                  border: u.best ? "1px solid rgba(16,185,129,0.3)" : "1px solid rgba(255,255,255,0.05)",
                }}>
                  <div style={{ fontSize: 22 }}>{u.icon}</div>
                  <div style={{ fontSize: 16, color: "white", fontFamily: "sans-serif", flex: 1, fontWeight: u.best ? 700 : 400 }}>{u.name}</div>
                  <div style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", fontFamily: "sans-serif" }}>{u.dist}</div>
                  {u.best && <div style={{ fontSize: 12, color: "#10B981", fontWeight: 700, fontFamily: "sans-serif", padding: "3px 8px", border: "1px solid rgba(16,185,129,0.3)", borderRadius: 6 }}>NEAREST</div>}
                </div>
              ))}
            </div>

            {/* Dispatched */}
            <div style={{
              padding: "12px 24px", background: "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.2)", borderRadius: 10,
              opacity: interpolate(frame, [100, 115], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
            }}>
              <div style={{ fontSize: 15, color: "#10B981", fontFamily: "sans-serif", fontWeight: 600 }}>✓ Dispatched — ETA: 6 minutes — GPS tracking active</div>
            </div>
          </div>
        </>
      ) : (
        /* Phase 2: Sgt. Manuel — Field Response */
        <>
          <div style={{ width: "35%", display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 70px" }}>
            <div style={{ fontSize: 14, color: "#10B981", fontWeight: 700, letterSpacing: 5, textTransform: "uppercase", fontFamily: "sans-serif", marginBottom: 8, opacity: interpolate(phase2Frame, [5, 18], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) }}>
              Persona 5 — Field Agent
            </div>
            <div style={{ fontSize: 44, fontWeight: 800, color: "white", fontFamily: "sans-serif", marginBottom: 12, opacity: interpolate(phase2Frame, [8, 22], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }), transform: `translateY(${interpolate(phase2Frame, [8, 22], [20, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}px)` }}>
              Sgt. Manuel Esono
            </div>
            <div style={{ fontSize: 18, color: "rgba(255,255,255,0.5)", fontFamily: "sans-serif", lineHeight: 1.6, opacity: interpolate(phase2Frame, [18, 30], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) }}>
              Police sergeant, Patrol Unit P-12.<br />
              Uses ConEG mobile app in the field.
            </div>
          </div>

          <div style={{ width: "65%", display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 50px", gap: 14 }}>
            {[
              { delay: 15, icon: "🔴", title: "Alert Received", desc: "Public disturbance — UAC: GQ-BN-MAL-CEN-0223 — Priority: High" },
              { delay: 35, icon: "🗺️", title: "GPS Navigation Active", desc: "Navigate directly to UAC point — ETA: 4 minutes" },
              { delay: 55, icon: "📷", title: "On-Scene Registration", desc: "Photos + encrypted field notes + GPS timestamp — legal evidence" },
              { delay: 75, icon: "🆘", title: "Backup Protocol Available", desc: "'Officer Down' button — one tap for maximum priority response" },
              { delay: 95, icon: "✅", title: "Incident Closed", desc: "Full audit trail: 23 minutes total — resolved on scene" },
            ].map((step, i) => {
              const s = spring({ frame: phase2Frame - step.delay, fps, config: { damping: 18, stiffness: 130 } });
              const op = interpolate(phase2Frame, [step.delay, step.delay + 10], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
              return (
                <div key={i} style={{
                  display: "flex", alignItems: "flex-start", gap: 16, padding: "14px 22px", borderRadius: 12,
                  background: "rgba(16,185,129,0.04)", border: "1px solid rgba(16,185,129,0.12)", opacity: op,
                  transform: `translateX(${interpolate(s, [0, 1], [50, 0])}px)`,
                }}>
                  <div style={{ fontSize: 22, marginTop: 2 }}>{step.icon}</div>
                  <div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: "white", fontFamily: "sans-serif", marginBottom: 3 }}>{step.title}</div>
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
