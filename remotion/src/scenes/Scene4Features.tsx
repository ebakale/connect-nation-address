import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";

const features = [
  { icon: "🔑", text: "Unique UAC Address Codes", desc: "ISO-standard digital identity for every location" },
  { icon: "📡", text: "GPS Field Verification", desc: "On-ground confirmation by authorized verifiers" },
  { icon: "🌍", text: "Multilingual Support", desc: "Spanish, French, and Fang interfaces" },
  { icon: "📴", text: "Offline Capability", desc: "Works in areas with limited connectivity" },
  { icon: "🛡️", text: "Government-Grade Security", desc: "AES-256 encryption, role-based access" },
  { icon: "📱", text: "Mobile-First Design", desc: "Optimized for smartphone access nationwide" },
];

export const Scene4Features: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleOpacity = interpolate(frame, [5, 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill
      style={{
        background: "linear-gradient(160deg, #050D1A 0%, #0A2D6B 60%, #0E1B3D 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
      }}
    >
      {/* Accent glow */}
      <div
        style={{
          position: "absolute",
          width: 500,
          height: 500,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(212,168,83,0.1) 0%, transparent 70%)",
          top: "30%",
          right: "10%",
        }}
      />

      <div
        style={{
          fontSize: 18,
          color: "#D4A853",
          fontWeight: 700,
          letterSpacing: 6,
          textTransform: "uppercase",
          opacity: titleOpacity,
          fontFamily: "sans-serif",
          marginBottom: 12,
        }}
      >
        Platform Capabilities
      </div>

      <div
        style={{
          fontSize: 52,
          color: "white",
          fontWeight: 800,
          opacity: titleOpacity,
          fontFamily: "sans-serif",
          marginBottom: 60,
          letterSpacing: -1,
        }}
      >
        Built for a Nation
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px 60px", padding: "0 200px" }}>
        {features.map((f, i) => {
          const delay = 25 + i * 12;
          const s = spring({ frame: frame - delay, fps, config: { damping: 20, stiffness: 150 } });
          const opacity = interpolate(frame, [delay, delay + 10], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
          return (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 20,
                opacity,
                transform: `translateX(${interpolate(s, [0, 1], [-40, 0])}px)`,
              }}
            >
              <div
                style={{
                  fontSize: 36,
                  width: 60,
                  height: 60,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "rgba(212,168,83,0.1)",
                  borderRadius: 14,
                  flexShrink: 0,
                }}
              >
                {f.icon}
              </div>
              <div>
                <div style={{ fontSize: 22, fontWeight: 700, color: "white", fontFamily: "sans-serif", marginBottom: 4 }}>{f.text}</div>
                <div style={{ fontSize: 16, color: "rgba(255,255,255,0.5)", fontFamily: "sans-serif" }}>{f.desc}</div>
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
