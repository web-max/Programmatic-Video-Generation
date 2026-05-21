import React from 'react';
import { useCurrentFrame, interpolate, AbsoluteFill } from 'remotion';
import { Scenario } from '../data/types';
import { computeTimeline, computeTotalDuration } from '../utils/sceneTiming';
import { ScreenRecordingFrame } from '../components/ScreenRecordingFrame';
import { ChatList } from '../components/ChatList';
import { ChatConversation } from '../components/ChatConversation';
import { QuickReplyScreen } from '../components/QuickReplyScreen';

// Each scene starts rendering OVERLAP frames before its startFrame and
// keeps rendering OVERLAP frames past its end, allowing cross-fades.
const SCENE_OVERLAP = 15;

interface VideoCompositionProps {
  scenario: Scenario;
}

export const VideoComposition: React.FC<VideoCompositionProps> = ({ scenario }) => {
  const frame = useCurrentFrame();
  const timeline = computeTimeline(scenario);
  const totalDuration = computeTotalDuration(scenario);

  const globalFade = interpolate(frame, [totalDuration - 50, totalDuration], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill style={{ background: '#000', opacity: globalFade }}>
      <ScreenRecordingFrame>
        {scenario.scenes.map((scene, i) => {
          const { startFrame, duration } = timeline[i];
          const visible =
            frame >= startFrame - SCENE_OVERLAP &&
            frame < startFrame + duration + SCENE_OVERLAP;
          if (!visible) return null;

          if (scene.type === 'chat-list') {
            return (
              <div key={i} style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column' }}>
                <ChatList
                  items={scenario.chatList}
                  highlightName={scene.tapContact}
                  tapStartFrame={startFrame + duration - 15}
                  exitFrame={startFrame + duration}
                />
              </div>
            );
          }

          if (scene.type === 'conversation') {
            return (
              <div key={i} style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column' }}>
                <ChatConversation
                  contactName={scene.contactName}
                  avatarSrc={scene.contactAvatarSrc}
                  messages={scene.messages}
                  enterFrame={startFrame}
                  exitFrame={startFrame + duration}
                  typingDuration={scene.typingDuration ?? 18}
                />
              </div>
            );
          }

          if (scene.type === 'quick-reply') {
            return (
              <QuickReplyScreen
                key={i}
                enterFrame={startFrame}
                exitFrame={startFrame + duration}
                replyFrame={startFrame + (scene.replyOffset ?? 50)}
                theirReplyFrame={startFrame + (scene.responseOffset ?? 110)}
                contactName={scene.contactName}
                avatarSrc={scene.contactAvatarSrc}
                previewMessage={scene.previewMessage}
                userMessage={scene.userMessage}
                contactResponse={scene.contactResponse}
                previewTime={scene.times?.preview}
                replyTime={scene.times?.reply}
                responseTime={scene.times?.response}
              />
            );
          }

          return null;
        })}
      </ScreenRecordingFrame>
    </AbsoluteFill>
  );
};
