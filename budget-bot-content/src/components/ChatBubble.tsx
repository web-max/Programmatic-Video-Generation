import React from 'react';
import { useCurrentFrame, interpolate, spring, useVideoConfig } from 'remotion';
import { WA } from '../styles/WhatsAppTheme';

interface ChatBubbleProps {
  role: 'user' | 'bot';
  lines: string[];
  startFrame: number;
  framesPerLine?: number;
  time?: string;
}

const RADIUS = 28;
const TAIL_RADIUS = 10;
// Extra right padding in the text area so the overlay timestamp doesn't cover text
const TIMESTAMP_PAD = 110;

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
    config: { damping: 18, stiffness: 200, mass: 0.8 },
  });

  const scale = interpolate(enterProgress, [0, 1], [0.88, 1]);
  const opacity = interpolate(enterProgress, [0, 1], [0, 1]);

  const isUser = role === 'user';
  const elapsed = Math.max(0, frame - startFrame);
  const bg = isUser ? WA.bgBubbleSent : WA.bgBubbleReceived;

  const nonEmptyLines = lines.filter((l) => l !== '');
  const visibleLineCount = Math.min(
    nonEmptyLines.length,
    Math.floor(elapsed / framesPerLine) + 1
  );

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
          maxWidth: '85%',
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
        {/* Text lines — always reserve right padding so timestamp overlay fits */}
        <div
          style={{
            padding: `${WA.bubblePadV}px ${WA.bubblePadH + TIMESTAMP_PAD}px ${WA.bubblePadV + 2}px ${WA.bubblePadH}px`,
          }}
        >
          {visibleLines.map((line, i) =>
            line === '' ? (
              <div key={i} style={{ height: 6 }} />
            ) : (
              <div key={i}>{line}</div>
            )
          )}
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
              <svg width="34" height="16" viewBox="0 0 34 16" fill="none">
                <path
                  d="M1 8l4 4 7-7"
                  stroke={WA.blue}
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M8 8l4 4 7-7"
                  stroke={WA.blue}
                  strokeWidth="2.2"
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
