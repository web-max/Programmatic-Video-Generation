import React from 'react';
import { useCurrentFrame, interpolate } from 'remotion';
import { ChatBubble } from './ChatBubble';
import { ChatScreenLayout } from './ChatScreenLayout';
import { FRAMES_PER_LINE_SCENE } from '../config/constants';

export interface Act3ScreenProps {
  /** Frame at which this screen fades in. */
  enterFrame: number;
  /** Frame at which the user's reply bubble appears. */
  replyFrame: number;
  /** Frame at which the contact's response bubble appears. */
  theirReplyFrame: number;

  /** Contact name shown in the chat header. */
  contactName: string;
  /** Optional avatar data-URI or static file path for the contact. */
  avatarSrc?: string;

  /** The contact's pre-existing message shown at the top of the conversation. */
  contactPreviewMessage: string;
  /** The user's reply to the contact. */
  userMessage: string;
  /** The contact's response after the user replies. */
  contactResponse: string;

  /** Timestamp for the contact's preview message bubble. */
  previewTime?: string;
  /** Timestamp for the user's reply bubble. */
  replyTime?: string;
  /** Timestamp for the contact's response bubble. */
  responseTime?: string;
}

/**
 * Generic resolution scene: shows a brief 3-message exchange with a contact.
 * Used as Act 3 in the BudgetBot video — but fully props-driven so any scenario
 * can reuse it for its resolution moment.
 */
export const Act3Screen: React.FC<Act3ScreenProps> = ({
  enterFrame,
  replyFrame,
  theirReplyFrame,
  contactName,
  avatarSrc,
  contactPreviewMessage,
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

  return (
    <ChatScreenLayout
      contactName={contactName}
      avatarSrc={avatarSrc}
      style={{
        position: 'absolute',
        inset: 0,
        opacity: enterOpacity,
      }}
    >
      <ChatBubble
        role="bot"
        lines={[contactPreviewMessage]}
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
