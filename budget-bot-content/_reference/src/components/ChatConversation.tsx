import React from 'react';
import { useCurrentFrame, interpolate, spring, useVideoConfig } from 'remotion';
import { ChatBubble } from './ChatBubble';
import { TypingIndicator } from './TypingIndicator';
import { ChatScreenLayout } from './ChatScreenLayout';
import { Message } from '../data/types';
import { ENTER_SPRING, makeExitFade } from '../utils/animations';
import { FRAMES_PER_LINE_INSTANT, FRAMES_PER_LINE_USER } from '../config/constants';
import { WA } from '../styles/WhatsAppTheme';

interface ChatConversationProps {
  contactName: string;
  avatarSrc?: string;
  messages: Message[];
  enterFrame: number;
  exitFrame: number;
  typingDuration: number;
}

/**
 * Estimate the rendered height of a chat bubble in pixels.
 *
 * Uses known CSS values from WhatsAppTheme + ChatBubble layout:
 *   - lineH = fontMessage × lineHeight(1.35)
 *   - empty lines use a 20px spacer div
 *   - 1.3× line multiplier absorbs wrapping on long lines
 *   - bubblePadV × 2 + 2px (top + bottom + bottom offset)
 *   - 8px outer wrapper padding (4px top + 4px bottom)
 *
 * The estimate intentionally rounds UP so that the maxHeight animation
 * never clips content. Over-estimation is harmless (maxHeight > actual
 * height means CSS uses the actual height).
 */
function estimateBubbleHeight(msg: Message): number {
  const nonEmpty = msg.lines.filter((l) => l !== '').length;
  const empty    = msg.lines.filter((l) => l === '').length;
  const lineH    = Math.round(WA.fontMessage * 1.35); // ~53px at fontMessage=39
  // 1.3× per-line wrapping buffer for long bot messages
  return Math.round(nonEmpty * lineH * 1.3) + empty * 20
       + 2 * WA.bubblePadV + 2
       + 8;
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

  // Per-message start frames with deterministic micro-jitter (0-2 frames per message)
  // Simulates Android OS scheduler variance — makes timing feel organic, not robotic.
  const JITTER = [0, 2, 1, 0, 2, 1, 2, 0, 1, 2];
  const messageStartFrames: number[] = [];
  let cursor = enterFrame + 20;
  for (let i = 0; i < messages.length; i++) {
    const msg = messages[i];
    messageStartFrames.push(cursor + JITTER[i % JITTER.length]);
    const linesCount = msg.lines.filter((l) => l !== '').length;
    const revealFrames = msg.role === 'bot' ? FRAMES_PER_LINE_INSTANT : linesCount * FRAMES_PER_LINE_USER;
    cursor += msg.delayFrames + revealFrames + 20;
  }

  // Per-bot-message typing windows: each window ends exactly when the bot message appears.
  // This ensures (1) multiple bot messages each get an indicator, and (2) no overlap
  // between the indicator and the message it precedes.
  const showTyping = messages.some((msg, i) => {
    if (msg.role !== 'bot') return false;
    const botStart = messageStartFrames[i];
    const typingStart = Math.max(enterFrame + 5, botStart - typingDuration);
    return frame >= typingStart && frame < botStart;
  });

  const visibleCount = messages.filter((_, i) => frame >= messageStartFrames[i]).length;

  // Content-aware scroll: estimate each bubble's rendered height from line counts,
  // then spring-animate between scroll targets as new messages appear.
  // Show the last 2 messages; scroll older ones out of view.
  const cumH = messages.reduce<number[]>((acc, msg, i) => {
    acc.push((acc[i - 1] ?? 0) + estimateBubbleHeight(msg));
    return acc;
  }, []);
  const getTarget = (n: number) => (n <= 2 ? 0 : cumH[n - 3]);
  const target     = getTarget(visibleCount);
  const prevTarget = getTarget(visibleCount - 1);
  const triggerIdx = Math.max(0, visibleCount - 1);
  const scrollProgress = spring({
    frame: frame - (messageStartFrames[triggerIdx] ?? enterFrame),
    fps,
    config: { damping: 20, stiffness: 200, mass: 1 },
  });
  const scrollOffset = Math.max(0, interpolate(scrollProgress, [0, 1], [prevTarget, target]));

  return (
    <ChatScreenLayout
      contactName={contactName}
      avatarSrc={avatarSrc}
      scrollOffset={scrollOffset}
      style={{ opacity, transform: `translateX(${translateX}px)` }}
    >
      {messages.map((msg, i) => {
        if (frame < messageStartFrames[i]) return null;

        const bubble = (
          <ChatBubble
            role={msg.role}
            lines={msg.lines}
            startFrame={messageStartFrames[i]}
            framesPerLine={msg.role === 'bot' ? FRAMES_PER_LINE_INSTANT : FRAMES_PER_LINE_USER}
            time={msg.time}
          />
        );

        // Bot messages appear instantly (all lines at once) so the flex-end layout
        // snaps existing messages upward by the full bubble height in a single frame.
        // Animating maxHeight from 0 → estimated height makes that shift gradual.
        if (msg.role === 'bot') {
          const heightProgress = spring({
            frame: frame - messageStartFrames[i],
            fps,
            config: { damping: 20, stiffness: 200, mass: 1 },
          });
          const maxH = interpolate(
            heightProgress,
            [0, 1],
            [0, estimateBubbleHeight(msg)],
            { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
          );
          return (
            <div key={i} style={{ maxHeight: maxH, overflow: 'hidden' }}>
              {bubble}
            </div>
          );
        }

        return <React.Fragment key={i}>{bubble}</React.Fragment>;
      })}
      <TypingIndicator visible={showTyping} />
    </ChatScreenLayout>
  );
};
