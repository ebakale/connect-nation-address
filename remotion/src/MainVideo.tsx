import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { Scene1Opening } from "./scenes/Scene1Opening";
import { Scene2Problem } from "./scenes/Scene2Problem";
import { Scene3Pillars } from "./scenes/Scene3Pillars";
import { Scene4Features } from "./scenes/Scene4Features";
import { Scene5Closing } from "./scenes/Scene5Closing";
import { AbsoluteFill } from "remotion";

const TRANSITION_DURATION = 20;

export const MainVideo: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#050D1A" }}>
      <TransitionSeries>
        <TransitionSeries.Sequence durationInFrames={160}>
          <Scene1Opening />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: TRANSITION_DURATION })}
        />
        <TransitionSeries.Sequence durationInFrames={160}>
          <Scene2Problem />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: TRANSITION_DURATION })}
        />
        <TransitionSeries.Sequence durationInFrames={180}>
          <Scene3Pillars />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: TRANSITION_DURATION })}
        />
        <TransitionSeries.Sequence durationInFrames={160}>
          <Scene4Features />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: TRANSITION_DURATION })}
        />
        <TransitionSeries.Sequence durationInFrames={170}>
          <Scene5Closing />
        </TransitionSeries.Sequence>
      </TransitionSeries>
    </AbsoluteFill>
  );
};
