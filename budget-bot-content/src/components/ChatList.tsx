import React from 'react';
import { useCurrentFrame, interpolate, spring, useVideoConfig } from 'remotion';
import { ChatListItem } from '../data/scenario';
import { WA } from '../styles/WhatsAppTheme';
import WhatsAppChatsTop from './WhatsAppChatsTop';
import WhatsAppBottomTabs from './WhatsAppBottomTabs';

interface ChatListProps {
  items: ChatListItem[];
  highlightName: string;
  tapStartFrame: number;
  exitFrame: number;
}

const STAGGER = 8;
const SCALE = 1080 / 1536;

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
  const containerScale = interpolate(exitProgress, [0, 1], [1, 0.97]);

  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        background: WA.bgChatList,
        opacity: containerOpacity,
        transform: `scale(${containerScale})`,
        height: '100%',
      }}
    >
      {/* Top section: WhatsApp header + search + filters */}
      <div style={{ height: Math.round(726 * SCALE), overflow: 'hidden', flexShrink: 0 }}>
        <div style={{ transformOrigin: 'left top', transform: `scale(${SCALE})` }}>
          <WhatsAppChatsTop unreadCount={26} groupCount={11} />
        </div>
      </div>

      {/* Chat items */}
      <div style={{ flex: 1, overflowY: 'hidden' }}>
        {items.map((item, index) => {
          const itemEnter = index * STAGGER;
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

          const avatarBg = WA.avatarColors[item.avatar] ?? '#555';

          return (
            <div
              key={item.name}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '38px 28px',
                gap: 26,
                transform: `translateY(${translateY}px)`,
                opacity: itemOpacity,
                position: 'relative',
                background: isTapped && tapProgress > 0
                  ? `rgba(37, 211, 102, ${interpolate(tapProgress, [0, 0.5, 1], [0, 0.25, 0.12])})`
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
                    width: interpolate(tapProgress, [0, 1], [0, 180]),
                    height: interpolate(tapProgress, [0, 1], [0, 180]),
                    borderRadius: '50%',
                    background: 'rgba(37, 211, 102, 0.35)',
                    opacity: interpolate(tapProgress, [0, 0.6, 1], [0.9, 0.4, 0]),
                    pointerEvents: 'none',
                  }}
                />
              )}

              {/* Avatar */}
              <div
                style={{
                  width: WA.avatarLg,
                  height: WA.avatarLg,
                  borderRadius: '50%',
                  background: avatarBg,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 50,
                  fontWeight: 700,
                  color: '#fff',
                  flexShrink: 0,
                }}
              >
                {item.avatar}
              </div>

              {/* Content */}
              <div style={{ flex: 1, minWidth: 0, borderBottom: '1px solid #e9edef', paddingBottom: 24 }}>
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
                      fontSize: WA.fontName,
                      fontWeight: 600,
                      color: WA.textPrimary,
                    }}
                  >
                    {item.name}
                  </span>
                  <span
                    style={{
                      fontSize: WA.fontTimestamp,
                      color: item.unread ? WA.green : WA.textSecondary,
                      flexShrink: 0,
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
                    gap: 12,
                  }}
                >
                  <span
                    style={{
                      fontSize: WA.fontPreview,
                      color: WA.textSecondary,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {item.preview}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                    {item.pinned && (
                      <svg width="28" height="28" viewBox="0 0 24 24" fill={WA.textSecondary} style={{ opacity: 0.7 }}>
                        <path d="M16 12V4h1V2H7v2h1v8l-2 2v2h5.2v6h1.6v-6H18v-2l-2-2z"/>
                      </svg>
                    )}
                    {item.unread ? (
                      <div
                        style={{
                          minWidth: 44,
                          height: 44,
                          borderRadius: 22,
                          background: WA.green,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: WA.fontBadge,
                          fontWeight: 700,
                          color: '#fff',
                          padding: '0 8px',
                        }}
                      >
                        {item.unread}
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom nav */}
      <div style={{ height: Math.round(330 * SCALE), overflow: 'hidden', flexShrink: 0 }}>
        <div style={{ width: 1536, transformOrigin: 'left top', transform: `scale(${SCALE})` }}>
          <WhatsAppBottomTabs chatCount={26} />
        </div>
      </div>
    </div>
  );
};
