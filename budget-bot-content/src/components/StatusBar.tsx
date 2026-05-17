import React from 'react';
import { WA } from '../styles/WhatsAppTheme';

export const StatusBar: React.FC = () => (
  <div
    style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '14px 40px 8px',
      fontSize: 28,
      fontWeight: 600,
      color: WA.textPrimary,
      fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
    }}
  >
    <span>9:41</span>
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      {/* Signal bars */}
      <svg width="32" height="20" viewBox="0 0 32 20" fill="white">
        <rect x="0" y="12" width="5" height="8" rx="1" opacity="1" />
        <rect x="7" y="8" width="5" height="12" rx="1" opacity="1" />
        <rect x="14" y="4" width="5" height="16" rx="1" opacity="1" />
        <rect x="21" y="0" width="5" height="20" rx="1" opacity="0.4" />
      </svg>
      {/* WiFi */}
      <svg width="32" height="22" viewBox="0 0 32 22" fill="white">
        <path d="M16 18a2 2 0 1 1 0 4 2 2 0 0 1 0-4z" />
        <path d="M8.5 13.5C10.5 11.5 13.1 10.2 16 10.2s5.5 1.3 7.5 3.3" strokeWidth="2.5" stroke="white" fill="none" strokeLinecap="round" />
        <path d="M3 8C6.8 4.2 11.1 2 16 2s9.2 2.2 13 6" strokeWidth="2.5" stroke="white" fill="none" strokeLinecap="round" />
      </svg>
      {/* Battery */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <div style={{ width: 40, height: 20, border: '2px solid white', borderRadius: 4, padding: 2 }}>
          <div style={{ width: '78%', height: '100%', background: 'white', borderRadius: 2 }} />
        </div>
        <div style={{ width: 3, height: 8, background: 'white', borderRadius: '0 2px 2px 0' }} />
      </div>
    </div>
  </div>
);
