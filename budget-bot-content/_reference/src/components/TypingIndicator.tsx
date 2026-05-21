import React from 'react';
import { useCurrentFrame, interpolate } from 'remotion';
import { WA } from '../styles/WhatsAppTheme';

interface TypingIndicatorProps {
  visible: boolean;
}

export const TypingIndicator: React.FC<TypingIndicatorProps> = ({ visible }) => {
  const frame = useCurrentFrame();

  if (!visible) return null;

  const dots = [0, 13, 26];

  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', padding: '4px 32px 8px', position: 'relative' }}>
      {/* tail */}
      <div
        style={{
          position: 'absolute',
          left: 23,
          bottom: 8,
          width: 0,
          height: 0,
          borderTop: `${WA.tailSize}px solid transparent`,
          borderRight: `${WA.tailSize}px solid ${WA.bgBubbleReceived}`,
        }}
      />
      <div
        style={{
          background: WA.bgBubbleReceived,
          borderRadius: `${WA.bubbleRadius}px ${WA.bubbleRadius}px ${WA.bubbleRadius}px 4px`,
          padding: '22px 32px',
          display: 'flex',
          gap: 12,
          alignItems: 'center',
        }}
      >
        {dots.map((offset, i) => {
          const dotOpacity = interpolate(
            (frame + offset) % 40,
            [0, 10, 20, 40],
            [0.3, 1, 0.3, 0.3],
            { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
          );
          const dotY = interpolate(
            (frame + offset) % 40,
            [0, 10, 20, 40],
            [0, -8, 0, 0],
            { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
          );
          return (
            <div
              key={i}
              style={{
                width: 18,
                height: 18,
                borderRadius: '50%',
                background: WA.textSecondary,
                opacity: dotOpacity,
                transform: `translateY(${dotY}px)`,
              }}
            />
          );
        })}
      </div>
    </div>
  );
};
