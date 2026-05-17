import React from 'react';
import { useCurrentFrame, interpolate } from 'remotion';

interface PhoneFrameProps {
  children: React.ReactNode;
  enterStartFrame?: number;
}

export const PhoneFrame: React.FC<PhoneFrameProps> = ({
  children,
  enterStartFrame = 0,
}) => {
  const frame = useCurrentFrame();

  const progress = interpolate(frame, [enterStartFrame, enterStartFrame + 18], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const scale = interpolate(progress, [0, 1], [0.96, 1]);
  const opacity = interpolate(progress, [0, 1], [0, 1]);

  return (
    <div
      style={{
        width: 1080,
        height: 1920,
        background: 'linear-gradient(160deg, #1a1a2e 0%, #0d0d0d 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: '"Roboto", sans-serif',
      }}
    >
      <div
        style={{
          width: 980,
          height: 1820,
          background: '#0a0a0a',
          borderRadius: 80,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 0 0 3px #2a2a2a, 0 40px 120px rgba(0,0,0,0.8)',
          transform: `scale(${scale})`,
          opacity,
        }}
      >
        {/* Notch */}
        <div
          style={{
            position: 'absolute',
            top: 52,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 240,
            height: 36,
            background: '#000',
            borderRadius: 20,
            zIndex: 100,
          }}
        />
        {children}
      </div>
    </div>
  );
};
