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

  // Show timestamp only once all lines are visible
  const allVisible = visibleLineCount >= nonEmptyLines.length;

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: isUser ? 'flex-end' : 'flex-start',
        padding: `4px ${isUser ? 40 : 32}px 4px ${isUser ? 32 : 40}px`,
        transform: `scale(${scale})`,
        opacity,
        transformOrigin: isUser ? 'right center' : 'left center',
      }}
    >
      <div style={{ position: 'relative', maxWidth: WA.bubbleMaxWidth }}>
        {/* Bubble tail */}
        {isUser ? (
          <div
            style={{
              position: 'absolute',
              right: -WA.tailSize + 2,
              bottom: 0,
              width: 0,
              height: 0,
              borderTop: `${WA.tailSize}px solid transparent`,
              borderLeft: `${WA.tailSize}px solid ${bg}`,
            }}
          />
        ) : (
          <div
            style={{
              position: 'absolute',
              left: -WA.tailSize + 2,
              bottom: 0,
              width: 0,
              height: 0,
              borderTop: `${WA.tailSize}px solid transparent`,
              borderRight: `${WA.tailSize}px solid ${bg}`,
            }}
          />
        )}

        {/* Bubble body */}
        <div
          style={{
            background: bg,
            borderRadius: isUser
              ? `${WA.bubbleRadius}px ${WA.bubbleRadius}px 4px ${WA.bubbleRadius}px`
              : `${WA.bubbleRadius}px ${WA.bubbleRadius}px ${WA.bubbleRadius}px 4px`,
            padding: `${WA.bubblePadV}px ${WA.bubblePadH}px`,
            color: WA.textPrimary,
            fontSize: WA.fontMessage,
            lineHeight: 1.45,
            fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
            boxShadow: '0 1px 2px rgba(0,0,0,0.13)',
          }}
        >
          {visibleLines.map((line, i) =>
            line === '' ? (
              <div key={i} style={{ height: 6 }} />
            ) : (
              <div key={i}>{line}</div>
            )
          )}

          {/* Timestamp + read receipts */}
          {allVisible && (
            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                alignItems: 'center',
                gap: 6,
                marginTop: 8,
              }}
            >
              <span style={{ fontSize: WA.fontTimestamp, color: WA.textTimestamp }}>
                {time ?? ''}
              </span>
              {isUser && (
                <svg width="34" height="16" viewBox="0 0 34 16" fill="none">
                  <path d="M1 8l4 4 7-7" stroke={WA.blue} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M8 8l4 4 7-7" stroke={WA.blue} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
