import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";

const connections = [
  { from: "María", action: "registers address", to: "Carlos", fromColor: "#3B82F6", toColor: "#D4A853" },
  { from: "Carlos", action: "verifies & assigns UAC", to: "System", fromColor: "#D4A853", toColor: "#10B981" },
  { from: "Ana", action: "locates emergency via UAC", to: "Manuel", fromColor: "#EF4444", toColor: "#10B981" },
  { from: "Jean-Pierre", action: "routes package by UAC", to: "Lucía", fromColor: "#10B981", toColor: "#3B82F6" },
  { from: "Lucía", action: "delivers to exact UAC point", to: "María", fromColor: "#3B82F6", toColor: "#3B82F6" },
  { from: "Director Mbá", action: "monitors all metrics", to: "Nation", fromColor: "#D4A853", toColor: "#D4A853" },
];

export const Scene9Connection: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill style={{ background: "linear-gradient(160deg, #050D1A 0%, #0A2D6B 50%, #0E1B3D 100%)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
      <div style={{ position: "absolute", width: 900, height: 900, borderRadius: "50%", background: "radial-gradient(circle, rgba(212,168,83,0.06) 0%, transparent 60%)", top: "50%", left: "50%", transform: "translate(-50%, -50%)" }} />

      <div style={{ fontSize: 14, color: "#D4A853", fontWeight: 700, letterSpacing: 6, textTransform: "uppercase", fontFamily: "sans-serif", marginBottom: 8, opacity: interpolate(frame, [5, 18], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) }}>
        The UAC is the Thread
      </div>
      <div style={{ fontSize: 48, fontWeight: 800, color: "white", fontFamily: "sans-serif", marginBottom: 12, opacity: interpolate(frame, [10, 25], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }), transform: `translateY(${interpolate(frame, [10, 25], [20, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}px)` }}>
        One Code Connects Everyone
      </div>
      <div style={{ fontSize: 18, color: "rgba(255,255,255,0.4)", fontFamily: "sans-serif", marginBottom: 40, opacity: interpolate(frame, [20, 32], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) }}>
        The same UAC code María registered flows through every module
      </div>

      {/* Central UAC code */}
      <div style={{
        padding: "16px 40px", background: "rgba(212,168,83,0.1)", border: "2px solid rgba(212,168,83,0.4)", borderRadius: 14, marginBottom: 40,
        opacity: interpolate(frame, [30, 45], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
        transform: `scale(${spring({ frame: frame - 30, fps, config: { damping: 15, stiffness: 80 } })})`,
      }}>
        <div style={{ fontSize: 32, color: "#D4A853", fontFamily: "monospace", fontWeight: 800, letterSpacing: 3 }}>GQ-BN-MAL-ENG-0847</div>
      </div>

      {/* Connection flow */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10, width: 900 }}>
        {connections.map((c, i) => {
          const delay = 45 + i * 16;
          const s = spring({ frame: frame - delay, fps, config: { damping: 20, stiffness: 140 } });
          const op = interpolate(frame, [delay, delay + 10], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
          return (
            <div key={i} style={{
              display: "flex", alignItems: "center", gap: 16, padding: "10px 20px", borderRadius: 10,
              background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", opacity: op,
              transform: `translateX(${interpolate(s, [0, 1], [-30, 0])}px)`,
            }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: c.fromColor, fontFamily: "sans-serif", width: 130, textAlign: "right" }}>{c.from}</div>
              <div style={{ fontSize: 16, color: "rgba(255,255,255,0.3)", fontFamily: "sans-serif" }}>→</div>
              <div style={{ flex: 1, fontSize: 15, color: "rgba(255,255,255,0.5)", fontFamily: "sans-serif" }}>{c.action}</div>
              <div style={{ fontSize: 16, color: "rgba(255,255,255,0.3)", fontFamily: "sans-serif" }}>→</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: c.toColor, fontFamily: "sans-serif", width: 100 }}>{c.to}</div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
