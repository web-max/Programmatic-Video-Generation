import React from 'react';
import { Composition } from 'remotion';
import { BudgetBotVideo } from './compositions/BudgetBotVideo';
import { BubbleWidthTest } from './compositions/BubbleWidthTest';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="BudgetBotVideo"
        component={BudgetBotVideo}
        durationInFrames={1350}
        fps={30}
        width={1080}
        height={1920}
      />
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
