import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";

const problems = [
  { icon: "⚠️", stat: "No Postal System", desc: "No standardized addresses nationwide" },
  { icon: "🚑", stat: "+15-30 min", desc: "Emergency response delays" },
  { icon: "🏠", stat: "Thousands", desc: "Citizens without formal addresses" },
  { icon: "💰", stat: "Millions USD", desc: "Untapped e-commerce market" },
];

export const Scene2Problem: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleOpacity = interpolate(frame, [5, 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const titleY = interpolate(frame, [5, 20], [30, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill
      style={{
        background: "linear-gradient(160deg, #0E0A0A 0%, #1A0A0A 40%, #0A1020 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
      }}
    >
      {/* Red accent glow */}
      <div
        style={{
          position: "absolute",
          width: 600,
          height: 600,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(200,40,40,0.15) 0%, transparent 70%)",
          top: "20%",
          left: "50%",
          transform: "translate(-50%, -50%)",
        }}
      />

      <div
        style={{
          fontSize: 18,
          color: "#C82828",
          fontWeight: 700,
          letterSpacing: 6,
          textTransform: "uppercase",
          opacity: titleOpacity,
          transform: `translateY(${titleY}px)`,
          fontFamily: "sans-serif",
          marginBottom: 12,
        }}
      >
        The Challenge
      </div>

      <div
        style={{
          fontSize: 52,
          color: "white",
          fontWeight: 800,
          opacity: titleOpacity,
          transform: `translateY(${titleY}px)`,
          fontFamily: "sans-serif",
          marginBottom: 60,
          letterSpacing: -1,
        }}
      >
        Equatorial Guinea Today
      </div>

      <div style={{ display: "flex", gap: 40, padding: "0 120px" }}>
        {problems.map((p, i) => {
          const delay = 30 + i * 18;
          const s = spring({ frame: frame - delay, fps, config: { damping: 15, stiffness: 120 } });
          const opacity = interpolate(frame, [delay, delay + 10], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
          return (
            <div
              key={i}
              style={{
                flex: 1,
                background: "rgba(200,40,40,0.08)",
                border: "1px solid rgba(200,40,40,0.2)",
                borderRadius: 16,
                padding: "40px 30px",
                textAlign: "center",
                opacity,
                transform: `scale(${s}) translateY(${interpolate(s, [0, 1], [40, 0])}px)`,
              }}
            >
              <div style={{ fontSize: 48, marginBottom: 16 }}>{p.icon}</div>
              <div style={{ fontSize: 32, fontWeight: 800, color: "#E8544E", fontFamily: "sans-serif", marginBottom: 8 }}>{p.stat}</div>
              <div style={{ fontSize: 18, color: "rgba(255,255,255,0.6)", fontFamily: "sans-serif", lineHeight: 1.4 }}>{p.desc}</div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
