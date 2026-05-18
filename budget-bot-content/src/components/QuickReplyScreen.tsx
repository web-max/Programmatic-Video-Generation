import React from 'react';
import { useCurrentFrame, interpolate } from 'remotion';
import { ChatBubble } from './ChatBubble';
import { ChatScreenLayout } from './ChatScreenLayout';
import { makeExitFade } from '../utils/animations';
import { FRAMES_PER_LINE_SCENE } from '../config/constants';

export interface QuickReplyScreenProps {
  enterFrame: number;
  exitFrame?: number;
  replyFrame: number;
  theirReplyFrame: number;
  contactName: string;
  avatarSrc?: string;
  previewMessage: string;
  userMessage: string;
  contactResponse: string;
  previewTime?: string;
  replyTime?: string;
  responseTime?: string;
}

export const QuickReplyScreen: React.FC<QuickReplyScreenProps> = ({
  enterFrame,
  exitFrame,
  replyFrame,
  theirReplyFrame,
  contactName,
  avatarSrc,
  previewMessage,
  userMessage,
  contactResponse,
  previewTime,
  replyTime,
  responseTime,
}) => {
  const frame = useCurrentFrame();

  const enterOpacity = interpolate(frame, [enterFrame, enterFrame + 15], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const exitProgress = exitFrame != null ? makeExitFade(frame, exitFrame) : 0;
  const opacity = enterOpacity * interpolate(exitProgress, [0, 1], [1, 0]);

  return (
    <ChatScreenLayout
      contactName={contactName}
      avatarSrc={avatarSrc}
      style={{ position: 'absolute', inset: 0, opacity }}
    >
      <ChatBubble
        role="bot"
        lines={[previewMessage]}
        startFrame={enterFrame + 10}
        framesPerLine={FRAMES_PER_LINE_SCENE}
        time={previewTime}
      />
      {frame >= replyFrame && (
        <ChatBubble
          role="user"
          lines={[userMessage]}
          startFrame={replyFrame}
          framesPerLine={FRAMES_PER_LINE_SCENE}
          time={replyTime}
        />
      )}
      {frame >= theirReplyFrame && (
        <ChatBubble
          role="bot"
          lines={[contactResponse]}
          startFrame={theirReplyFrame}
          framesPerLine={FRAMES_PER_LINE_SCENE}
          time={responseTime}
        />
      )}
    </ChatScreenLayout>
  );
};
