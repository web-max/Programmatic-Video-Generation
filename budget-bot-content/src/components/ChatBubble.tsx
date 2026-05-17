import React from 'react';
import { useCurrentFrame, interpolate, spring, useVideoConfig } from 'remotion';
import { WA } from '../styles/WhatsAppTheme';
import { ENTER_SPRING } from '../utils/animations';

interface ChatBubbleProps {
  role: 'user' | 'bot';
  lines: string[];
  startFrame: number;
  framesPerLine?: number;
  time?: string;
}

const RADIUS = 28;
const TAIL_RADIUS = 10;
// Inline spacer width appended to the last visible line so the absolute timestamp never overlaps.
// Incoming: time_text(~128) + right_pos(12) - right_pad(26) = 114 → 150
// Outgoing: adds ticks(52) + tick_gap(4) → 114 + 56 = 170 → 200
const INCOMING_META_SPACE = 150;
const OUTGOING_META_SPACE = 200;

export const ChatBubble: React.FC<ChatBubbleProps> = ({
  role,
  lines,
  startFrame,
  framesPerLine = 12,
  time,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const enterProgress = spring({
    frame: frame - startFrame,
    fps,
    config: ENTER_SPRING,
  });

  const scale = interpolate(enterProgress, [0, 1], [0.88, 1]);
  const opacity = interpolate(enterProgress, [0, 1], [0, 1]);

  const isUser = role === 'user';
  const elapsed = Math.max(0, frame - startFrame);
  const bg = isUser ? WA.bgBubbleSent : WA.bgBubbleReceived;

  const nonEmptyLines = lines.filter((l) => l !== '');
  const visibleLineCount = framesPerLine === 0
    ? nonEmptyLines.length
    : Math.min(nonEmptyLines.length, Math.floor(elapsed / framesPerLine) + 1);

  let nonEmptyVisible = 0;
  const visibleLines: string[] = [];
  for (const line of lines) {
    if (line === '') {
      if (nonEmptyVisible > 0) visibleLines.push('');
    } else {
      if (nonEmptyVisible < visibleLineCount) {
        visibleLines.push(line);
        nonEmptyVisible++;
      }
    }
  }

  if (frame < startFrame) return null;

  const allVisible = visibleLineCount >= nonEmptyLines.length;

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: isUser ? 'flex-end' : 'flex-start',
        padding: isUser ? `4px 8px 4px 48px` : `4px 48px 4px 8px`,
        transform: `scale(${scale})`,
        opacity,
        transformOrigin: isUser ? 'right center' : 'left center',
      }}
    >
      <div
        style={{
          display: 'inline-block',
          maxWidth: WA.bubbleMaxWidth,
          position: 'relative',
          background: bg,
          borderRadius: isUser
            ? `${RADIUS}px ${TAIL_RADIUS}px ${RADIUS}px ${RADIUS}px`
            : `${TAIL_RADIUS}px ${RADIUS}px ${RADIUS}px ${RADIUS}px`,
          boxShadow: '0 1px 2px rgba(11, 20, 26, 0.15)',
          color: WA.textPrimary,
          fontSize: WA.fontMessage,
          lineHeight: 1.35,
          fontFamily: '"Roboto", Arial, sans-serif',
        }}
      >
        {/* Text lines with inline meta-spacer on the last visible line */}
        <div
          style={{
            padding: `${WA.bubblePadV}px ${WA.bubblePadH}px ${WA.bubblePadV + 2}px ${WA.bubblePadH}px`,
          }}
        >
          {(() => {
            const metaSpace = isUser ? OUTGOING_META_SPACE : INCOMING_META_SPACE;
            let lastNonEmptyIdx = -1;
            for (let i = visibleLines.length - 1; i >= 0; i--) {
              if (visibleLines[i] !== '') { lastNonEmptyIdx = i; break; }
            }
            return visibleLines.map((line, i) =>
              line === '' ? (
                <div key={i} style={{ height: 20 }} />
              ) : (
                <div key={i}>
                  {line}
                  {i === lastNonEmptyIdx && (
                    <span style={{ display: 'inline-block', width: metaSpace, height: 1, verticalAlign: 'bottom' }} />
                  )}
                </div>
              )
            );
          })()}
        </div>

        {/* Timestamp + ticks overlaid at bottom-right, shown once all lines are visible */}
        {allVisible && (
          <div
            style={{
              position: 'absolute',
              right: 12,
              bottom: WA.bubblePadV - 2,
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            <span
              style={{
                fontSize: WA.fontTimestamp,
                color: WA.textTimestamp,
                lineHeight: 1,
                whiteSpace: 'nowrap',
              }}
            >
              {time ?? ''}
            </span>
            {isUser && (
              <svg width="52" height="33" viewBox="0 0 52 33" fill="none">
                <path
                  d="M3 17l8 8L27 7"
                  stroke={WA.blue}
                  strokeWidth="5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M22 17l8 8L50 5"
                  stroke={WA.blue}
                  strokeWidth="5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
