import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig, Img, staticFile } from "remotion";

export const Scene1Opening: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const logoScale = spring({ frame: frame - 15, fps, config: { damping: 18, stiffness: 80 } });
  const logoOpacity = interpolate(frame, [15, 35], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const gridOffset = frame * 0.3;

  const lines = [
    { text: "National Address System", delay: 55 },
    { text: "Emergency Response", delay: 70 },
    { text: "Postal & Logistics", delay: 85 },
  ];

  return (
    <AbsoluteFill style={{ background: "linear-gradient(160deg, #050D1A 0%, #0A2D6B 50%, #0E1B3D 100%)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
      {/* Grid */}
      <div style={{ position: "absolute", inset: 0, opacity: 0.05, backgroundImage: "linear-gradient(rgba(212,168,83,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(212,168,83,0.5) 1px, transparent 1px)", backgroundSize: "80px 80px", transform: `translateY(${gridOffset % 80}px)` }} />

      {/* Radial glow */}
      <div style={{ position: "absolute", width: 900, height: 900, borderRadius: "50%", background: "radial-gradient(circle, rgba(10,45,107,0.5) 0%, transparent 70%)", top: "50%", left: "50%", transform: "translate(-50%, -50%)" }} />

      {/* Logo */}
      <div style={{ transform: `scale(${logoScale})`, opacity: logoOpacity, marginBottom: 30 }}>
        <Img src={staticFile("images/biakam-logo.png")} style={{ width: 150, height: 150, objectFit: "contain" }} />
      </div>

      {/* Title */}
      <div style={{
        fontSize: 82, fontWeight: 800, color: "white", letterSpacing: -3, fontFamily: "sans-serif",
        opacity: interpolate(frame, [30, 50], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
        transform: `translateY(${interpolate(frame, [30, 50], [30, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}px)`,
      }}>
        ConEG
      </div>

      <div style={{
        fontSize: 22, color: "rgba(255,255,255,0.5)", fontFamily: "sans-serif", letterSpacing: 6, marginTop: 8,
        opacity: interpolate(frame, [40, 55], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
      }}>
        CONNECT EQUATORIAL GUINEA
      </div>

      {/* Pillar lines */}
      <div style={{ marginTop: 50, display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
        {lines.map((line, i) => {
          const op = interpolate(frame, [line.delay, line.delay + 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
          const y = interpolate(frame, [line.delay, line.delay + 12], [15, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
          return (
            <div key={i} style={{ fontSize: 28, color: "#D4A853", fontWeight: 500, opacity: op, transform: `translateY(${y}px)`, fontFamily: "sans-serif", letterSpacing: 2 }}>
              {line.text}
            </div>
          );
        })}
      </div>

      {/* Gold line */}
      <div style={{ position: "absolute", bottom: 80, height: 2, backgroundColor: "#D4A853", width: interpolate(frame, [110, 150], [0, 700], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }), opacity: 0.5 }} />

      {/* Subtitle */}
      <div style={{
        position: "absolute", bottom: 40, fontSize: 16, color: "rgba(255,255,255,0.3)", fontFamily: "sans-serif", letterSpacing: 3,
        opacity: interpolate(frame, [120, 140], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
      }}>
        NATIONAL DIGITAL INFRASTRUCTURE PLATFORM
      </div>
    </AbsoluteFill>
  );
};
