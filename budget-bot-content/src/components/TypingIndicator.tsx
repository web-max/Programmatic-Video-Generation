import React from 'react';
import { useCurrentFrame, interpolate } from 'remotion';

interface TypingIndicatorProps {
  visible: boolean;
}

export const TypingIndicator: React.FC<TypingIndicatorProps> = ({ visible }) => {
  const frame = useCurrentFrame();

  const opacity = interpolate(frame % 30, [0, 5, 25, 30], [0.5, 1, 1, 0.5], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  if (!visible) return null;

  const dots = [0, 10, 20];

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-end',
        padding: '0 32px 16px',
      }}
    >
      <div
        style={{
          background: '#1f2c34',
          borderRadius: '20px 20px 20px 4px',
          padding: '20px 28px',
          display: 'flex',
          gap: 10,
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
                width: 16,
                height: 16,
                borderRadius: '50%',
                background: '#8e9eab',
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
