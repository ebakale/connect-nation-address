import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig, Img, staticFile } from "remotion";

export const Scene5Closing: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const logoScale = spring({ frame: frame - 10, fps, config: { damping: 20, stiffness: 80 } });
  const logoOpacity = interpolate(frame, [10, 30], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const titleOpacity = interpolate(frame, [30, 50], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const titleY = interpolate(frame, [30, 50], [20, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const lineWidth = interpolate(frame, [50, 90], [0, 500], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const taglineOpacity = interpolate(frame, [70, 90], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Subtle pulse on the glow
  const glowScale = 1 + Math.sin(frame * 0.05) * 0.05;

  return (
    <AbsoluteFill
      style={{
        background: "linear-gradient(160deg, #050D1A 0%, #0A2D6B 50%, #050D1A 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
      }}
    >
      {/* Pulsing glow */}
      <div
        style={{
          position: "absolute",
          width: 700,
          height: 700,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(212,168,83,0.12) 0%, transparent 60%)",
          top: "50%",
          left: "50%",
          transform: `translate(-50%, -50%) scale(${glowScale})`,
        }}
      />

      {/* Logo */}
      <div
        style={{
          transform: `scale(${logoScale})`,
          opacity: logoOpacity,
          marginBottom: 30,
        }}
      >
        <Img src={staticFile("images/biakam-logo.png")} style={{ width: 140, height: 140, objectFit: "contain" }} />
      </div>

      {/* Title */}
      <div
        style={{
          fontSize: 80,
          fontWeight: 800,
          color: "white",
          letterSpacing: -3,
          opacity: titleOpacity,
          transform: `translateY(${titleY}px)`,
          fontFamily: "sans-serif",
        }}
      >
        ConEG
      </div>

      {/* Gold line */}
      <div
        style={{
          height: 3,
          backgroundColor: "#D4A853",
          width: lineWidth,
          marginTop: 24,
          marginBottom: 24,
          borderRadius: 2,
        }}
      />

      {/* Tagline */}
      <div
        style={{
          fontSize: 30,
          color: "rgba(255,255,255,0.7)",
          fontWeight: 400,
          opacity: taglineOpacity,
          fontFamily: "sans-serif",
          letterSpacing: 4,
        }}
      >
        Connecting Equatorial Guinea
      </div>

      {/* Subtitle */}
      <div
        style={{
          fontSize: 18,
          color: "#D4A853",
          fontWeight: 600,
          opacity: interpolate(frame, [90, 110], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
          fontFamily: "sans-serif",
          marginTop: 40,
          letterSpacing: 3,
        }}
      >
        NATIONAL DIGITAL INFRASTRUCTURE
      </div>

      {/* Bottom text */}
      <div
        style={{
          position: "absolute",
          bottom: 50,
          fontSize: 14,
          color: "rgba(255,255,255,0.3)",
          fontFamily: "sans-serif",
          letterSpacing: 2,
          opacity: interpolate(frame, [100, 120], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
        }}
      >
        BIAKAM TECHNOLOGY · 2026
      </div>
    </AbsoluteFill>
  );
};
