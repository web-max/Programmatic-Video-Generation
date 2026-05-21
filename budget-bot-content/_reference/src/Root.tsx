import React from 'react';
import { Composition } from 'remotion';
import { VideoComposition } from './compositions/VideoComposition';
import { BubbleWidthTest } from './compositions/BubbleWidthTest';
import { scenarios } from './data/scenarios';
import { computeTotalDuration } from './utils/sceneTiming';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {scenarios.map((scenario) => (
        <Composition
          key={scenario.id}
          id={scenario.id}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          component={VideoComposition as React.ComponentType<any>}
          durationInFrames={computeTotalDuration(scenario)}
          fps={30}
          width={1080}
          height={1920}
          defaultProps={{ scenario }}
        />
      ))}
      <Composition
        id="BubbleWidthTest"
        component={BubbleWidthTest}
        durationInFrames={120}
        fps={30}
        width={1080}
        height={1920}
      />
    </>
  );
};
