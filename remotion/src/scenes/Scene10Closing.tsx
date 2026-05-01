import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig, Img, staticFile } from "remotion";

export const Scene10Closing: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const logoScale = spring({ frame: frame - 10, fps, config: { damping: 20, stiffness: 80 } });
  const glowScale = 1 + Math.sin(frame * 0.05) * 0.05;

  return (
    <AbsoluteFill style={{ background: "linear-gradient(160deg, #050D1A 0%, #0A2D6B 50%, #050D1A 100%)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
      <div style={{ position: "absolute", width: 800, height: 800, borderRadius: "50%", background: "radial-gradient(circle, rgba(212,168,83,0.1) 0%, transparent 55%)", top: "50%", left: "50%", transform: `translate(-50%, -50%) scale(${glowScale})` }} />

      <div style={{ transform: `scale(${logoScale})`, opacity: interpolate(frame, [10, 30], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }), marginBottom: 24 }}>
        <Img src={staticFile("images/biakam-logo.png")} style={{ width: 130, height: 130, objectFit: "contain" }} />
      </div>

      <div style={{ fontSize: 80, fontWeight: 800, color: "white", letterSpacing: -3, fontFamily: "sans-serif", opacity: interpolate(frame, [25, 45], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }), transform: `translateY(${interpolate(frame, [25, 45], [20, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}px)` }}>
        ConEG
      </div>

      <div style={{ height: 3, backgroundColor: "#D4A853", width: interpolate(frame, [45, 80], [0, 500], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }), marginTop: 20, marginBottom: 20, borderRadius: 2 }} />

      <div style={{ fontSize: 28, color: "rgba(255,255,255,0.7)", fontWeight: 400, fontFamily: "sans-serif", letterSpacing: 4, opacity: interpolate(frame, [60, 80], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) }}>
        Connecting Equatorial Guinea
      </div>

      {/* Three pillars reminder */}
      <div style={{
        display: "flex", gap: 40, marginTop: 40,
        opacity: interpolate(frame, [80, 100], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
      }}>
        {[
          { icon: "📍", label: "Addresses" },
          { icon: "🚨", label: "Emergencies" },
          { icon: "📦", label: "Postal" },
        ].map((p, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ fontSize: 22 }}>{p.icon}</div>
            <div style={{ fontSize: 16, color: "rgba(255,255,255,0.4)", fontFamily: "sans-serif", fontWeight: 500 }}>{p.label}</div>
          </div>
        ))}
      </div>

      <div style={{
        fontSize: 18, color: "#D4A853", fontWeight: 600, fontFamily: "sans-serif", marginTop: 40, letterSpacing: 3,
        opacity: interpolate(frame, [100, 120], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
      }}>
        NATIONAL DIGITAL INFRASTRUCTURE
      </div>

      <div style={{ position: "absolute", bottom: 40, fontSize: 14, color: "rgba(255,255,255,0.25)", fontFamily: "sans-serif", letterSpacing: 2, opacity: interpolate(frame, [110, 130], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) }}>
        BIAKAM TECHNOLOGY · 2026
      </div>
    </AbsoluteFill>
  );
};
