import React from 'react';
import { useCurrentFrame, interpolate, spring, useVideoConfig } from 'remotion';
import { StatusBar } from './StatusBar';
import { ChatBubble } from './ChatBubble';
import { TypingIndicator } from './TypingIndicator';
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
  <svg width="46" height="46" viewBox="0 0 24 24" fill={WA.textPrimary}>
    <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z" />
  </svg>
);

const PhoneIcon = () => (
  <svg width="42" height="42" viewBox="0 0 24 24" fill={WA.textPrimary}>
    <path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1-9.4 0-17-7.6-17-17 0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z" />
  </svg>
);

const ThreeDotsIcon = () => (
  <svg width="36" height="36" viewBox="0 0 24 24" fill={WA.textPrimary}>
    <circle cx="12" cy="5" r="2" /><circle cx="12" cy="12" r="2" /><circle cx="12" cy="19" r="2" />
  </svg>
);

const EmojiIcon = () => (
  <svg width="44" height="44" viewBox="0 0 24 24" fill={WA.textSecondary}>
    <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z" />
  </svg>
);

const AttachIcon = () => (
  <svg width="44" height="44" viewBox="0 0 24 24" fill={WA.textSecondary}>
    <path d="M16.5 6v11.5c0 2.21-1.79 4-4 4s-4-1.79-4-4V5c0-1.38 1.12-2.5 2.5-2.5s2.5 1.12 2.5 2.5v10.5c0 .55-.45 1-1 1s-1-.45-1-1V6H10v9.5c0 1.38 1.12 2.5 2.5 2.5s2.5-1.12 2.5-2.5V5c0-2.21-1.79-4-4-4S7 2.79 7 5v12.5c0 3.04 2.46 5.5 5.5 5.5s5.5-2.46 5.5-5.5V6h-1.5z" />
  </svg>
);

const CameraSmallIcon = () => (
  <svg width="44" height="44" viewBox="0 0 24 24" fill={WA.textSecondary}>
    <path d="M12 15.2A3.2 3.2 0 1 1 15.2 12 3.2 3.2 0 0 1 12 15.2zm8.8-9.6h-3.36l-1.68-2.4H8.24L6.56 5.6H3.2A2.4 2.4 0 0 0 .8 8v10.4a2.4 2.4 0 0 0 2.4 2.4h17.6a2.4 2.4 0 0 0 2.4-2.4V8a2.4 2.4 0 0 0-2.4-2.4z" />
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
              fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
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
      <div
        style={{
          padding: '12px 20px 36px',
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          background: WA.bgConversation,
        }}
      >
        <EmojiIcon />
        <div
          style={{
            flex: 1,
            background: WA.bgInput,
            borderRadius: WA.inputRadius,
            padding: '18px 28px',
            fontSize: WA.fontPreview,
            color: WA.textPlaceholder,
            fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
          }}
        >
          Message
        </div>
        <AttachIcon />
        <CameraSmallIcon />
        <div
          style={{
            width: 80,
            height: 80,
            borderRadius: '50%',
            background: WA.green,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <svg width="38" height="38" viewBox="0 0 24 24" fill="white">
            <path d="M12 14c1.66 0 2.99-1.34 2.99-3L15 5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z" />
          </svg>
        </div>
      </div>
    </div>
  );
};
