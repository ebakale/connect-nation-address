import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";
import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { Scene1Opening } from "./scenes/Scene1Opening";
import { Scene2Problem } from "./scenes/Scene2Problem";
import { Scene3Maria } from "./scenes/Scene3Maria";
import { Scene4Carlos } from "./scenes/Scene4Carlos";
import { Scene5Pedro } from "./scenes/Scene5Pedro";
import { Scene6Emergency } from "./scenes/Scene6Emergency";
import { Scene7Postal } from "./scenes/Scene7Postal";
import { Scene8Impact } from "./scenes/Scene8Impact";
import { Scene9Connection } from "./scenes/Scene9Connection";
import { Scene10Closing } from "./scenes/Scene10Closing";

const T = 20; // transition duration

export const MainVideo: React.FC = () => {
  const frame = useCurrentFrame();

  // Persistent subtle particle layer
  const particles = Array.from({ length: 12 }, (_, i) => ({
    x: ((i * 173) % 1920),
    y: ((i * 271 + frame * (0.3 + i * 0.05)) % 1080),
    size: 2 + (i % 3),
    opacity: 0.04 + (i % 4) * 0.01,
  }));

  return (
    <AbsoluteFill style={{ backgroundColor: "#050D1A" }}>
      {/* Floating particles */}
      {particles.map((p, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: p.x,
            top: p.y,
            width: p.size,
            height: p.size,
            borderRadius: "50%",
            backgroundColor: "#D4A853",
            opacity: p.opacity,
          }}
        />
      ))}

      <TransitionSeries>
        <TransitionSeries.Sequence durationInFrames={180}>
          <Scene1Opening />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: T })}
        />
        <TransitionSeries.Sequence durationInFrames={180}>
          <Scene2Problem />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={slide({ direction: "from-right" })}
          timing={linearTiming({ durationInFrames: T })}
        />
        <TransitionSeries.Sequence durationInFrames={240}>
          <Scene3Maria />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: T })}
        />
        <TransitionSeries.Sequence durationInFrames={200}>
          <Scene4Carlos />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={slide({ direction: "from-left" })}
          timing={linearTiming({ durationInFrames: T })}
        />
        <TransitionSeries.Sequence durationInFrames={200}>
          <Scene5Pedro />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: T })}
        />
        <TransitionSeries.Sequence durationInFrames={260}>
          <Scene6Emergency />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={slide({ direction: "from-right" })}
          timing={linearTiming({ durationInFrames: T })}
        />
        <TransitionSeries.Sequence durationInFrames={240}>
          <Scene7Postal />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: T })}
        />
        <TransitionSeries.Sequence durationInFrames={200}>
          <Scene8Impact />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: T })}
        />
        <TransitionSeries.Sequence durationInFrames={200}>
          <Scene9Connection />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: T })}
        />
        <TransitionSeries.Sequence durationInFrames={180}>
          <Scene10Closing />
        </TransitionSeries.Sequence>
      </TransitionSeries>
    </AbsoluteFill>
  );
};
