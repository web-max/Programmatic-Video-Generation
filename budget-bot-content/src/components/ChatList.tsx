import React from 'react';
import { useCurrentFrame, interpolate, spring, useVideoConfig } from 'remotion';
import { StatusBar } from './StatusBar';
import { ChatListItem } from '../data/scenario';

interface ChatListProps {
  items: ChatListItem[];
  highlightName: string;
  tapStartFrame: number;
  exitFrame: number;
}

const STAGGER = 8;
const ENTER_START = 0;

const AVATAR_COLORS: Record<string, string> = {
  M: '#e57373',
  R: '#64b5f6',
  L: '#81c784',
  B: '#ffb74d',
  W: '#ba68c8',
};

export const ChatList: React.FC<ChatListProps> = ({
  items,
  highlightName,
  tapStartFrame,
  exitFrame,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const exitProgress = interpolate(frame, [exitFrame, exitFrame + 12], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const containerOpacity = interpolate(exitProgress, [0, 1], [1, 0]);
  const containerScale = interpolate(exitProgress, [0, 1], [1, 0.95]);

  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        background: '#0a0a0a',
        opacity: containerOpacity,
        transform: `scale(${containerScale})`,
      }}
    >
      <StatusBar />

      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 32px 24px',
          borderBottom: '1px solid #1a1a1a',
        }}
      >
        <span
          style={{
            fontSize: 52,
            fontWeight: 700,
            color: '#e9edef',
            fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
          }}
        >
          Chats
        </span>
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: '50%',
            background: '#00a884',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <svg width="32" height="32" viewBox="0 0 24 24" fill="white">
            <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z" />
          </svg>
        </div>
      </div>

      {/* Chat items */}
      <div style={{ flex: 1, overflowY: 'hidden' }}>
        {items.map((item, index) => {
          const itemEnter = ENTER_START + index * STAGGER;
          const enterProgress = spring({
            frame: frame - itemEnter,
            fps,
            config: { damping: 20, stiffness: 180, mass: 0.9 },
          });

          const translateY = interpolate(enterProgress, [0, 1], [60, 0]);
          const itemOpacity = interpolate(enterProgress, [0, 1], [0, 1]);

          const isTapped = item.name === highlightName;
          const tapProgress = isTapped
            ? interpolate(frame, [tapStartFrame, tapStartFrame + 15], [0, 1], {
                extrapolateLeft: 'clamp',
                extrapolateRight: 'clamp',
              })
            : 0;
          const bgOpacity = isTapped
            ? interpolate(tapProgress, [0, 0.5, 1], [0, 0.3, 0.15])
            : 0;

          return (
            <div
              key={item.name}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '20px 32px',
                gap: 24,
                borderBottom: '1px solid #111',
                transform: `translateY(${translateY}px)`,
                opacity: itemOpacity,
                position: 'relative',
                background:
                  isTapped && tapProgress > 0
                    ? `rgba(0, 168, 132, ${bgOpacity})`
                    : 'transparent',
              }}
            >
              {/* Tap ripple */}
              {isTapped && tapProgress > 0 && tapProgress < 1 && (
                <div
                  style={{
                    position: 'absolute',
                    left: 80,
                    top: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: interpolate(tapProgress, [0, 1], [0, 160]),
                    height: interpolate(tapProgress, [0, 1], [0, 160]),
                    borderRadius: '50%',
                    background: 'rgba(0, 168, 132, 0.4)',
                    opacity: interpolate(tapProgress, [0, 0.6, 1], [0.8, 0.4, 0]),
                    pointerEvents: 'none',
                  }}
                />
              )}

              {/* Avatar */}
              <div
                style={{
                  width: 96,
                  height: 96,
                  borderRadius: '50%',
                  background: AVATAR_COLORS[item.avatar] || '#555',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 38,
                  fontWeight: 700,
                  color: '#fff',
                  flexShrink: 0,
                  fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
                }}
              >
                {item.avatar}
              </div>

              {/* Content */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'baseline',
                    marginBottom: 6,
                  }}
                >
                  <span
                    style={{
                      fontSize: 34,
                      fontWeight: 600,
                      color: '#e9edef',
                      fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
                    }}
                  >
                    {item.name}
                  </span>
                  <span
                    style={{
                      fontSize: 26,
                      color: item.unread ? '#00a884' : '#8e9eab',
                    }}
                  >
                    {item.time}
                  </span>
                </div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <span
                    style={{
                      fontSize: 28,
                      color: '#8e9eab',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      maxWidth: 480,
                      fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
                    }}
                  >
                    {item.preview}
                  </span>
                  {item.unread && (
                    <div
                      style={{
                        minWidth: 40,
                        height: 40,
                        borderRadius: 20,
                        background: '#00a884',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 24,
                        fontWeight: 700,
                        color: '#fff',
                        padding: '0 8px',
                      }}
                    >
                      {item.unread}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
