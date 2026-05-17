import React from 'react';
import { useCurrentFrame, interpolate, spring, useVideoConfig } from 'remotion';
import { StatusBar } from './StatusBar';
import { ChatListItem } from '../data/scenario';
import { WA } from '../styles/WhatsAppTheme';

interface ChatListProps {
  items: ChatListItem[];
  highlightName: string;
  tapStartFrame: number;
  exitFrame: number;
}

const STAGGER = 8;
const FILTER_CHIPS = [
  { label: 'All', count: null },
  { label: 'Unread', count: 26 },
  { label: 'Favorites', count: null },
  { label: 'Groups', count: 11 },
];
const NAV_TABS = ['Chats', 'Updates', 'Communities', 'Calls'];

// SVG icons
const CameraIcon = () => (
  <svg width="46" height="46" viewBox="0 0 24 24" fill={WA.textPrimary}>
    <path d="M12 15.2A3.2 3.2 0 1 1 15.2 12 3.2 3.2 0 0 1 12 15.2zm8.8-9.6h-3.36l-1.68-2.4H8.24L6.56 5.6H3.2A2.4 2.4 0 0 0 .8 8v10.4a2.4 2.4 0 0 0 2.4 2.4h17.6a2.4 2.4 0 0 0 2.4-2.4V8a2.4 2.4 0 0 0-2.4-2.4z" />
  </svg>
);

const ThreeDotsIcon = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill={WA.textPrimary}>
    <circle cx="12" cy="5" r="2" /><circle cx="12" cy="12" r="2" /><circle cx="12" cy="19" r="2" />
  </svg>
);

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
      <StatusBar />

      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '14px 32px 20px',
        }}
      >
        <span
          style={{
            fontSize: WA.fontTitle,
            fontWeight: 700,
            color: WA.green,
            fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
          }}
        >
          WhatsApp
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
          <CameraIcon />
          <ThreeDotsIcon />
        </div>
      </div>

      {/* Search bar */}
      <div style={{ padding: '0 24px 16px' }}>
        <div
          style={{
            background: WA.bgSearchBar,
            borderRadius: WA.inputRadius,
            padding: '18px 32px',
            display: 'flex',
            alignItems: 'center',
            gap: 16,
          }}
        >
          <svg width="34" height="34" viewBox="0 0 24 24" fill={WA.textSecondary}>
            <path d="M15.5 14h-.79l-.28-.27A6.47 6.47 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
          </svg>
          <span style={{ fontSize: WA.fontPreview, color: WA.textSecondary }}>
            Ask Meta AI or Search
          </span>
        </div>
      </div>

      {/* Filter chips */}
      <div style={{ display: 'flex', gap: 16, padding: '0 24px 20px', overflowX: 'hidden' }}>
        {FILTER_CHIPS.map(({ label, count }) => {
          const isActive = label === 'All';
          return (
            <div
              key={label}
              style={{
                borderRadius: 32,
                border: isActive ? 'none' : `1px solid #d1d7db`,
                background: isActive ? WA.green : 'transparent',
                padding: '10px 28px',
                fontSize: WA.fontFilter,
                color: isActive ? '#fff' : WA.textSecondary,
                whiteSpace: 'nowrap',
                fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
              }}
            >
              {count != null ? `${label} ${count}` : label}
            </div>
          );
        })}
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
                padding: '34px 28px',
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
              <div style={{ flex: 1, minWidth: 0, borderBottom: '1px solid #e9edef', paddingBottom: 22 }}>
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

      {/* Bottom nav bar */}
      <div
        style={{
          background: WA.bgHeader,
          display: 'flex',
          justifyContent: 'space-around',
          alignItems: 'center',
          padding: '20px 16px 40px',
          borderTop: '1px solid #e9edef',
        }}
      >
        {NAV_TABS.map((tab) => {
          const isActive = tab === 'Chats';
          return (
            <div
              key={tab}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 8,
                color: isActive ? WA.green : WA.textSecondary,
              }}
            >
              <div style={{ position: 'relative' }}>
                <NavIcon tab={tab} active={isActive} />
                {tab === 'Chats' && (
                  <div
                    style={{
                      position: 'absolute',
                      top: -8,
                      right: -12,
                      minWidth: 36,
                      height: 36,
                      borderRadius: 18,
                      background: WA.green,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 22,
                      fontWeight: 700,
                      color: '#fff',
                      padding: '0 6px',
                    }}
                  >
                    26
                  </div>
                )}
              </div>
              <span style={{ fontSize: WA.fontNav }}>{tab}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const NavIcon: React.FC<{ tab: string; active: boolean }> = ({ tab, active }) => {
  const color = active ? WA.green : WA.textSecondary;
  const size = 52;
  if (tab === 'Chats') return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
    </svg>
  );
  if (tab === 'Updates') return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round">
      <circle cx="12" cy="12" r="3" fill={color} />
      <circle cx="12" cy="12" r="9" stroke={color} />
    </svg>
  );
  if (tab === 'Communities') return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
    </svg>
  );
  // Calls
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1-9.4 0-17-7.6-17-17 0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z" />
    </svg>
  );
};
