import React from 'react';
import { useCurrentFrame, interpolate, spring, useVideoConfig } from 'remotion';
import { StatusBar } from './StatusBar';
import { ChatBubble } from './ChatBubble';
import { TypingIndicator } from './TypingIndicator';
import { Message } from '../data/scenario';

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

  const opacity = interpolate(enterProgress, [0, 1], [0, 1]) * interpolate(exitProgress, [0, 1], [1, 0]);
  const translateX = interpolate(enterProgress, [0, 1], [80, 0]);

  // Compute per-message start frames
  const messageStartFrames: number[] = [];
  let cursor = enterFrame + 20;
  for (let i = 0; i < messages.length; i++) {
    const msg = messages[i];
    messageStartFrames.push(cursor);
    const linesCount = msg.lines.filter((l) => l !== '').length;
    cursor += msg.delayFrames + linesCount * 12 + 20;
  }

  const showTyping =
    frame >= typingFrame && frame < typingFrame + typingDuration;

  // Scroll: offset all content upward as more messages appear
  const totalMessages = messages.filter(
    (_, i) => frame >= messageStartFrames[i]
  ).length;
  const scrollOffset = Math.max(0, (totalMessages - 2) * 160);

  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        background: '#0b141a',
        opacity,
        transform: `translateX(${translateX}px)`,
      }}
    >
      <StatusBar />

      {/* Header bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: '12px 24px 16px',
          gap: 20,
          borderBottom: '1px solid #1a2a33',
          background: '#1f2c34',
        }}
      >
        <svg width="40" height="40" viewBox="0 0 24 24" fill="#8e9eab">
          <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
        </svg>
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: '50%',
            background: '#00a884',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 30,
            color: '#fff',
            fontWeight: 700,
          }}
        >
          💰
        </div>
        <div>
          <div
            style={{
              fontSize: 34,
              fontWeight: 600,
              color: '#e9edef',
              fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
            }}
          >
            {contactName}
          </div>
          <div style={{ fontSize: 24, color: '#8e9eab' }}>online</div>
        </div>
      </div>

      {/* Messages */}
      <div
        style={{
          flex: 1,
          overflowY: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          padding: '16px 0',
        }}
      >
        <div
          style={{
            transform: `translateY(-${scrollOffset}px)`,
            transition: 'none',
          }}
        >
          {messages.map((msg, i) => (
            <ChatBubble
              key={i}
              role={msg.role}
              lines={msg.lines}
              startFrame={messageStartFrames[i]}
              framesPerLine={10}
            />
          ))}
          <TypingIndicator visible={showTyping} />
        </div>
      </div>

      {/* Input bar */}
      <div
        style={{
          padding: '16px 24px 32px',
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          background: '#1f2c34',
        }}
      >
        <div
          style={{
            flex: 1,
            background: '#2a3942',
            borderRadius: 40,
            padding: '18px 28px',
            fontSize: 30,
            color: '#8e9eab',
            fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
          }}
        >
          Message
        </div>
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: '50%',
            background: '#00a884',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <svg width="34" height="34" viewBox="0 0 24 24" fill="white">
            <path d="M12 1a11 11 0 1 0 0 22A11 11 0 0 0 12 1zm-1 16v-8l6 4-6 4z" />
          </svg>
        </div>
      </div>
    </div>
  );
};
