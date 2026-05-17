import React from 'react';
import { useCurrentFrame, interpolate, spring, useVideoConfig, staticFile } from 'remotion';
import { ChatBubble } from './ChatBubble';
import { TypingIndicator } from './TypingIndicator';
import { WhatsAppComposer } from './WhatsAppComposer';
import WhatsAppChatHeader from './WhatsAppChatHeader';
import { Message } from '../data/scenario';
import { WA } from '../styles/WhatsAppTheme';

const SCALE = 1080 / 1536;

interface ChatConversationProps {
  contactName: string;
  messages: Message[];
  enterFrame: number;
  exitFrame: number;
  typingFrame: number;
  typingDuration: number;
}


export const ChatConversation: React.FC<ChatConversationProps> = ({
  contactName,
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
    config: { damping: 20, stiffness: 200, mass: 0.8 },
  });

  const exitProgress = interpolate(frame, [exitFrame, exitFrame + 12], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

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
    cursor += msg.delayFrames + linesCount * 10 + 20;
  }

  const showTyping = frame >= typingFrame && frame < typingFrame + typingDuration;

  const visibleCount = messages.filter((_, i) => frame >= messageStartFrames[i]).length;
  const scrollOffset = Math.max(0, (visibleCount - 2) * 160);

  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        background: WA.bgConversation,
        opacity,
        transform: `translateX(${translateX}px)`,
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div style={{ height: Math.round(231 * SCALE), overflow: 'hidden', flexShrink: 0 }}>
        <div style={{ transformOrigin: 'left top', transform: `scale(${SCALE})` }}>
          <WhatsAppChatHeader name={contactName} />
        </div>
      </div>

      {/* Messages area */}
      <div
        style={{
          flex: 1,
          overflowY: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          padding: '12px 0',
          backgroundImage: `url(${staticFile('wa-bg-light.png')})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div style={{ transform: `translateY(-${scrollOffset}px)` }}>
          {messages.map((msg, i) => (
            <ChatBubble
              key={i}
              role={msg.role}
              lines={msg.lines}
              startFrame={messageStartFrames[i]}
              framesPerLine={10}
              time={msg.time}
            />
          ))}
          <TypingIndicator visible={showTyping} />
        </div>
      </div>

      {/* Input bar */}
      <div style={{ background: '#f4f0e8', paddingBottom: 36 }}>
        <div style={{ height: 168, overflow: 'hidden' }}>
          <WhatsAppComposer
            style={{
              width: 1536,
              maxWidth: 'none',
              transformOrigin: 'left top',
              transform: `scale(${1080 / 1536})`,
            }}
          />
        </div>
      </div>
    </div>
  );
};
