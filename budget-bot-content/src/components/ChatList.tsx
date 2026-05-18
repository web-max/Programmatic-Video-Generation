import React from 'react';
import { useCurrentFrame, interpolate, spring, useVideoConfig } from 'remotion';
import { ChatListItem } from '../data/types';
import { WA } from '../styles/WhatsAppTheme';
import WhatsAppChatsTop from './WhatsAppChatsTop';
import WhatsAppBottomTabs from './WhatsAppBottomTabs';
import { PinIcon } from './icons/Icons';
import { SCALE } from '../config/constants';
import { ENTER_SPRING, makeExitFade } from '../utils/animations';

interface ChatListProps {
  items: ChatListItem[];
  highlightName: string;
  tapStartFrame: number;
  exitFrame: number;
}

const STAGGER = 8;

function DefaultAvatar({ initial, bg }: { initial: string; bg: string }) {
  return (
    <div className="wa-avatar-fallback" style={{ background: bg, color: '#fff' }}>
      {initial}
    </div>
  );
}

export const ChatList: React.FC<ChatListProps> = ({
  items,
  highlightName,
  tapStartFrame,
  exitFrame,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const exitProgress = makeExitFade(frame, exitFrame);
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
      {/* Top section */}
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
            config: ENTER_SPRING,
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
                transform: `translateY(${translateY}px)`,
                opacity: itemOpacity,
                position: 'relative',
                background:
                  isTapped && tapProgress > 0
                    ? `rgba(37, 211, 102, ${interpolate(tapProgress, [0, 0.5, 1], [0, 0.25, 0.12])})`
                    : 'transparent',
              }}
            >
              {/* Tap ripple */}
              {isTapped && tapProgress > 0 && tapProgress < 1 && (
                <div
                  style={{
                    position: 'absolute',
                    left: 68,
                    top: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: interpolate(tapProgress, [0, 1], [0, 160]),
                    height: interpolate(tapProgress, [0, 1], [0, 160]),
                    borderRadius: '50%',
                    background: 'rgba(37, 211, 102, 0.35)',
                    opacity: interpolate(tapProgress, [0, 0.6, 1], [0.9, 0.4, 0]),
                    pointerEvents: 'none',
                  }}
                />
              )}

              <article className="wa-cl-row">
                <div className="wa-cl-avatar">
                  <DefaultAvatar initial={item.avatar} bg={avatarBg} />
                </div>

                <div className="wa-cl-main">
                  <div className="wa-cl-title-line">
                    <h2 className="wa-cl-name">{item.name}</h2>
                    <time className={item.unread ? 'wa-cl-time unread' : 'wa-cl-time'}>
                      {item.time}
                    </time>
                  </div>
                  <div className="wa-cl-sub-line">
                    <div className="wa-cl-message">
                      <span>{item.preview}</span>
                    </div>
                    <div className="wa-cl-meta">
                      {item.pinned && <PinIcon />}
                      {item.unread ? (
                        <span className="wa-cl-badge">{item.unread}</span>
                      ) : null}
                    </div>
                  </div>
                </div>
              </article>
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

      <style>{`
        .wa-cl-row {
          height: 213px;
          display: grid;
          grid-template-columns: 168px 1fr;
          box-sizing: border-box;
        }

        .wa-cl-avatar {
          width: 132px;
          height: 132px;
          border-radius: 50%;
          overflow: hidden;
          margin-left: 34px;
          margin-top: 14px;
          background: #f1f1f1;
          flex-shrink: 0;
        }

        .wa-cl-avatar img,
        .wa-avatar-fallback {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 62px;
          font-weight: 500;
          line-height: 1;
          object-fit: cover;
          font-family: Arial, Helvetica, sans-serif;
        }

        .wa-cl-main {
          padding-top: 24px;
          padding-left: 16px;
          padding-right: 44px;
          min-width: 0;
        }

        .wa-cl-title-line {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 16px;
          min-width: 0;
        }

        .wa-cl-name {
          margin: 0;
          min-width: 0;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          color: ${WA.textListPrimary};
          font-size: 44px;
          line-height: 1.08;
          letter-spacing: -1.8px;
          font-weight: 500;
          font-family: Arial, Helvetica, sans-serif;
        }

        .wa-cl-time {
          color: ${WA.textListMuted};
          font-size: 32px;
          line-height: 1.1;
          letter-spacing: -1px;
          font-weight: 400;
          white-space: nowrap;
          padding-top: 4px;
          font-family: Arial, Helvetica, sans-serif;
        }

        .wa-cl-time.unread {
          color: ${WA.green};
          font-weight: 700;
        }

        .wa-cl-sub-line {
          margin-top: 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 14px;
          min-width: 0;
        }

        .wa-cl-message {
          min-width: 0;
          display: flex;
          align-items: center;
          gap: 14px;
          color: ${WA.textListMuted};
          font-size: 40px;
          line-height: 1.08;
          letter-spacing: -1.4px;
          font-weight: 400;
          font-family: Arial, Helvetica, sans-serif;
        }

        .wa-cl-message span {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .wa-cl-meta {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 24px;
          min-width: 110px;
        }

        .wa-cl-badge {
          width: 56px;
          height: 56px;
          border-radius: 50%;
          background: ${WA.green};
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 34px;
          line-height: 1;
          font-weight: 600;
          letter-spacing: -0.5px;
          font-family: Arial, Helvetica, sans-serif;
        }
      `}</style>
    </div>
  );
};
