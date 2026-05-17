import React from 'react';

export const ScreenRecordingFrame: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div
    style={{
      width: 1080,
      height: 1920,
      background: '#111b21',
      overflow: 'hidden',
      position: 'relative',
      fontFamily: '"Roboto", sans-serif',
    }}
  >
    {children}
  </div>
);
