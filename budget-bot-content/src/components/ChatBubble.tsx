import React from 'react';
import { useCurrentFrame, interpolate, spring, useVideoConfig } from 'remotion';

interface ChatBubbleProps {
  role: 'user' | 'bot';
  lines: string[];
  startFrame: number;
  framesPerLine?: number;
}

export const ChatBubble: React.FC<ChatBubbleProps> = ({
  role,
  lines,
  startFrame,
  framesPerLine = 12,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const enterProgress = spring({
    frame: frame - startFrame,
    fps,
    config: { damping: 18, stiffness: 200, mass: 0.8 },
  });

  const scale = interpolate(enterProgress, [0, 1], [0.85, 1]);
  const opacity = interpolate(enterProgress, [0, 1], [0, 1]);

  const isUser = role === 'user';
  const elapsed = Math.max(0, frame - startFrame);

  const nonEmptyLines = lines.filter((l) => l !== '');
  const visibleLineCount = Math.min(
    nonEmptyLines.length,
    Math.floor(elapsed / framesPerLine) + 1
  );

  // Map visible non-empty lines back, preserving empty line spacing
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

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: isUser ? 'flex-end' : 'flex-start',
        padding: '4px 32px',
        transform: `scale(${scale})`,
        opacity,
        transformOrigin: isUser ? 'right center' : 'left center',
      }}
    >
      <div
        style={{
          maxWidth: '78%',
          background: isUser ? '#005c4b' : '#1f2c34',
          borderRadius: isUser
            ? '20px 20px 4px 20px'
            : '20px 20px 20px 4px',
          padding: '18px 24px',
          color: '#e9edef',
          fontSize: 32,
          lineHeight: 1.5,
          fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
        }}
      >
        {visibleLines.map((line, i) =>
          line === '' ? (
            <div key={i} style={{ height: 8 }} />
          ) : (
            <div key={i}>{line}</div>
          )
        )}
      </div>
    </div>
  );
};
