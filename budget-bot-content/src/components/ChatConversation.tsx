import React from 'react';
import { useCurrentFrame, interpolate, spring, useVideoConfig, staticFile } from 'remotion';
import { StatusBar } from './StatusBar';
import { ChatBubble } from './ChatBubble';
import { TypingIndicator } from './TypingIndicator';
import { WhatsAppComposer } from './WhatsAppComposer';
import { Message } from '../data/scenario';
import { WA } from '../styles/WhatsAppTheme';

interface ChatConversationProps {
  contactName: string;
  messages: Message[];
  enterFrame: number;
  exitFrame: number;
  typingFrame: number;
  typingDuration: number;
}

// Simple SVG icon helpers
const VideoIcon = () => (
  <svg width="46" height="46" viewBox="0 0 24 24" fill="none" stroke={WA.textPrimary} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="23 7 16 12 23 17 23 7"/>
    <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
  </svg>
);

const PhoneIcon = () => (
  <svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke={WA.textPrimary} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.8a19.79 19.79 0 01-3.07-8.67A2 2 0 012 3.18h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 11a16 16 0 006.9 6.9l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/>
  </svg>
);

const ThreeDotsIcon = () => (
  <svg width="36" height="36" viewBox="0 0 24 24" fill={WA.textPrimary}>
    <circle cx="12" cy="5" r="2" /><circle cx="12" cy="12" r="2" /><circle cx="12" cy="19" r="2" />
  </svg>
);


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
      <StatusBar />

      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: '10px 24px 14px',
          gap: 18,
          background: WA.bgHeader,
        }}
      >
        <svg width="40" height="40" viewBox="0 0 24 24" fill={WA.textSecondary}>
          <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
        </svg>
        <div
          style={{
            width: WA.avatarSm,
            height: WA.avatarSm,
            borderRadius: '50%',
            background: WA.green,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 36,
            flexShrink: 0,
          }}
        >
          💰
        </div>
        <div style={{ flex: 1 }}>
          <div
            style={{
              fontSize: WA.fontName,
              fontWeight: 600,
              color: WA.textPrimary,
              fontFamily: '"Roboto", sans-serif',
            }}
          >
            {contactName}
          </div>
          <div style={{ fontSize: WA.fontStatus, color: WA.textSecondary }}>online</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
          <VideoIcon />
          <PhoneIcon />
          <ThreeDotsIcon />
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
