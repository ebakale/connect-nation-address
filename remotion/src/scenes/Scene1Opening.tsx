import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig, Img, staticFile } from "remotion";

export const Scene1Opening: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const logoScale = spring({ frame: frame - 10, fps, config: { damping: 20, stiffness: 100 } });
  const logoOpacity = interpolate(frame, [10, 30], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const lines = [
    "Every Address.",
    "Every Emergency.",
    "Every Delivery.",
  ];

  // Subtle grid animation
  const gridOffset = frame * 0.3;

  return (
    <AbsoluteFill
      style={{
        background: "linear-gradient(160deg, #050D1A 0%, #0A2D6B 50%, #0E1B3D 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
      }}
    >
      {/* Animated grid */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0.06,
          backgroundImage: `
            linear-gradient(rgba(212,168,83,0.5) 1px, transparent 1px),
            linear-gradient(90deg, rgba(212,168,83,0.5) 1px, transparent 1px)
          `,
          backgroundSize: "80px 80px",
          transform: `translateY(${gridOffset % 80}px)`,
        }}
      />

      {/* Radial glow */}
      <div
        style={{
          position: "absolute",
          width: 800,
          height: 800,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(10,45,107,0.6) 0%, transparent 70%)",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
        }}
      />

      {/* Logo */}
      <div
        style={{
          transform: `scale(${logoScale})`,
          opacity: logoOpacity,
          marginBottom: 40,
        }}
      >
        <Img src={staticFile("images/biakam-logo.png")} style={{ width: 160, height: 160, objectFit: "contain" }} />
      </div>

      {/* Title */}
      <div
        style={{
          fontSize: 72,
          fontWeight: 800,
          color: "white",
          letterSpacing: -2,
          opacity: interpolate(frame, [25, 45], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
          transform: `translateY(${interpolate(frame, [25, 45], [30, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}px)`,
          fontFamily: "sans-serif",
        }}
      >
        ConEG
      </div>

      {/* Taglines */}
      <div style={{ marginTop: 50, display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
        {lines.map((line, i) => {
          const delay = 50 + i * 20;
          const lineOpacity = interpolate(frame, [delay, delay + 15], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
          const lineY = interpolate(frame, [delay, delay + 15], [20, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
          return (
            <div
              key={i}
              style={{
                fontSize: 36,
                color: "#D4A853",
                fontWeight: 500,
                opacity: lineOpacity,
                transform: `translateY(${lineY}px)`,
                fontFamily: "sans-serif",
                letterSpacing: 1,
              }}
            >
              {line}
            </div>
          );
        })}
      </div>

      {/* Bottom accent line */}
      <div
        style={{
          position: "absolute",
          bottom: 80,
          height: 2,
          backgroundColor: "#D4A853",
          width: interpolate(frame, [100, 140], [0, 600], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
          opacity: 0.6,
        }}
      />
    </AbsoluteFill>
  );
};
