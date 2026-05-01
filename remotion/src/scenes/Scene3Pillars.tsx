import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";

const pillars = [
  {
    icon: "📍",
    title: "National Address Registry",
    subtitle: "NAR / CAR",
    features: ["UAC unique codes", "GPS verification", "Citizen self-registration"],
    color: "#3B82F6",
  },
  {
    icon: "🚨",
    title: "Emergency Management",
    subtitle: "112 Dispatch",
    features: ["Instant UAC location", "Real-time unit tracking", "Priority protocols"],
    color: "#EF4444",
  },
  {
    icon: "📦",
    title: "Postal & Logistics",
    subtitle: "Delivery Service",
    features: ["Package tracking", "Route optimization", "Cash on delivery"],
    color: "#10B981",
  },
];

export const Scene3Pillars: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleOpacity = interpolate(frame, [5, 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const titleY = interpolate(frame, [5, 20], [30, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill
      style={{
        background: "linear-gradient(160deg, #050D1A 0%, #0A1B3D 50%, #081428 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          fontSize: 18,
          color: "#D4A853",
          fontWeight: 700,
          letterSpacing: 6,
          textTransform: "uppercase",
          opacity: titleOpacity,
          transform: `translateY(${titleY}px)`,
          fontFamily: "sans-serif",
          marginBottom: 12,
        }}
      >
        Three Integrated Modules
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
        One Unified Platform
      </div>

      <div style={{ display: "flex", gap: 40, padding: "0 100px" }}>
        {pillars.map((p, i) => {
          const delay = 30 + i * 25;
          const s = spring({ frame: frame - delay, fps, config: { damping: 18, stiffness: 100 } });
          const opacity = interpolate(frame, [delay, delay + 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
          return (
            <div
              key={i}
              style={{
                flex: 1,
                background: `linear-gradient(180deg, ${p.color}15 0%, ${p.color}05 100%)`,
                border: `1px solid ${p.color}40`,
                borderRadius: 20,
                padding: "44px 36px",
                opacity,
                transform: `translateY(${interpolate(s, [0, 1], [60, 0])}px)`,
              }}
            >
              <div style={{ fontSize: 56, marginBottom: 20 }}>{p.icon}</div>
              <div style={{ fontSize: 28, fontWeight: 800, color: "white", fontFamily: "sans-serif", marginBottom: 6 }}>{p.title}</div>
              <div style={{ fontSize: 16, fontWeight: 600, color: p.color, fontFamily: "sans-serif", marginBottom: 24, letterSpacing: 2 }}>{p.subtitle}</div>
              {p.features.map((f, j) => {
                const fDelay = delay + 30 + j * 8;
                const fOpacity = interpolate(frame, [fDelay, fDelay + 10], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
                return (
                  <div key={j} style={{ fontSize: 18, color: "rgba(255,255,255,0.7)", fontFamily: "sans-serif", marginBottom: 10, opacity: fOpacity, display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: p.color }} />
                    {f}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
