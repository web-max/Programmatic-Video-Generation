import React from 'react';
import { useCurrentFrame, interpolate, spring, useVideoConfig } from 'remotion';
import { ChatBubble } from './ChatBubble';
import { TypingIndicator } from './TypingIndicator';
import { ChatScreenLayout } from './ChatScreenLayout';
import { Message } from '../data/scenario';
import { ENTER_SPRING, makeExitFade } from '../utils/animations';
import { FRAMES_PER_LINE_INSTANT, FRAMES_PER_LINE_USER } from '../config/constants';

interface ChatConversationProps {
  contactName: string;
  avatarSrc?: string;
  messages: Message[];
  enterFrame: number;
  exitFrame: number;
  typingFrame: number;
  typingDuration: number;
}

/**
 * Animated WhatsApp conversation screen used for the Budget Bot exchange (Act 2).
 * Slides in from the right on enter, fades out on exit.
 * Messages reveal sequentially based on delayFrames from scenario data.
 */
export const ChatConversation: React.FC<ChatConversationProps> = ({
  contactName,
  avatarSrc,
  messages,
  enterFrame,
  exitFrame,
  typingFrame,
  typingDuration,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const enterProgress = spring({
    frame: frame - enterFrame,
    fps,
    config: ENTER_SPRING,
  });

  const exitProgress = makeExitFade(frame, exitFrame);

  const opacity =
    interpolate(enterProgress, [0, 1], [0, 1]) *
    interpolate(exitProgress, [0, 1], [1, 0]);
  const translateX = interpolate(enterProgress, [0, 1], [60, 0]);

  // Per-message start frames
  const messageStartFrames: number[] = [];
  let cursor = enterFrame + 20;
  for (const msg of messages) {
    messageStartFrames.push(cursor);
    const linesCount = msg.lines.filter((l) => l !== '').length;
    const revealFrames = msg.role === 'bot' ? FRAMES_PER_LINE_INSTANT : linesCount * FRAMES_PER_LINE_USER;
    cursor += msg.delayFrames + revealFrames + 20;
  }

  const showTyping = frame >= typingFrame && frame < typingFrame + typingDuration;

  const visibleCount = messages.filter((_, i) => frame >= messageStartFrames[i]).length;
  const scrollOffset = Math.max(0, (visibleCount - 2) * 160);

  return (
    <ChatScreenLayout
      contactName={contactName}
      avatarSrc={avatarSrc}
      scrollOffset={scrollOffset}
      style={{ opacity, transform: `translateX(${translateX}px)` }}
    >
      {messages.map((msg, i) => (
        <ChatBubble
          key={i}
          role={msg.role}
          lines={msg.lines}
          startFrame={messageStartFrames[i]}
          framesPerLine={msg.role === 'bot' ? FRAMES_PER_LINE_INSTANT : FRAMES_PER_LINE_USER}
          time={msg.time}
        />
      ))}
      <TypingIndicator visible={showTyping} />
    </ChatScreenLayout>
  );
};
