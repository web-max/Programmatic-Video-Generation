import React from 'react';
import { useCurrentFrame, interpolate, AbsoluteFill, staticFile } from 'remotion';
import { ScreenRecordingFrame } from '../components/ScreenRecordingFrame';
import { ChatList } from '../components/ChatList';
import { ChatConversation } from '../components/ChatConversation';
import { ChatBubble } from '../components/ChatBubble';
import { StatusBar } from '../components/StatusBar';
import { scenario } from '../data/scenario';
import { WA } from '../styles/WhatsAppTheme';

// Frame timing (30fps)
const ACT1_START = 0;
const ACT1_TAP_FRAME = 90;
const ACT1_EXIT = 105;

const ACT2_START = 110;
const ACT2_TYPING_FRAME = 155;
const ACT2_TYPING_DURATION = 45;
const ACT2_EXIT = 900;

const ACT3_START = 910;
const ACT3_REPLY_FRAME = 960;
const ACT3_THEIR_REPLY = 1020;
const FADE_OUT_START = 1300;
const TOTAL_FRAMES = 1350;

export const BudgetBotVideo: React.FC = () => {
  const frame = useCurrentFrame();

  const showAct1 = frame < ACT1_EXIT + 20;
  const showAct2 = frame >= ACT2_START - 10 && frame < ACT2_EXIT + 20;
  const showAct3 = frame >= ACT3_START - 10;

  const globalFade = interpolate(frame, [FADE_OUT_START, TOTAL_FRAMES], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill style={{ background: '#000', opacity: globalFade }}>
      <ScreenRecordingFrame>
        {showAct1 && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column' }}>
            <ChatList
              items={scenario.chatList}
              highlightName={scenario.triggerContact}
              tapStartFrame={ACT1_TAP_FRAME}
              exitFrame={ACT1_EXIT}
            />
          </div>
        )}

        {showAct2 && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column' }}>
            <ChatConversation
              contactName="💰 Budget Bot"
              messages={scenario.botConversation}
              enterFrame={ACT2_START}
              exitFrame={ACT2_EXIT}
              typingFrame={ACT2_TYPING_FRAME}
              typingDuration={ACT2_TYPING_DURATION}
            />
          </div>
        )}

        {showAct3 && (
          <Act3Screen
            enterFrame={ACT3_START}
            replyFrame={ACT3_REPLY_FRAME}
            theirReplyFrame={ACT3_THEIR_REPLY}
          />
        )}
      </ScreenRecordingFrame>
    </AbsoluteFill>
  );
};

interface Act3ScreenProps {
  enterFrame: number;
  replyFrame: number;
  theirReplyFrame: number;
}

const Act3Screen: React.FC<Act3ScreenProps> = ({ enterFrame, replyFrame, theirReplyFrame }) => {
  const frame = useCurrentFrame();

  const enterOpacity = interpolate(frame, [enterFrame, enterFrame + 15], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const bigMikePreview =
    scenario.chatList.find((c) => c.name === scenario.resolution.replyTo)?.preview ?? '';

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        background: WA.bgConversation,
        opacity: enterOpacity,
      }}
    >
      <StatusBar />

      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: '10px 24px 14px',
          gap: 18,
          background: WA.bgHeader,
        }}
      >
        <svg width="40" height="40" viewBox="0 0 24 24" fill={WA.textSecondary}>
          <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
        </svg>
        <div
          style={{
            width: WA.avatarSm,
            height: WA.avatarSm,
            borderRadius: '50%',
            background: WA.avatarColors['B'] ?? '#e67e22',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 36,
            fontWeight: 700,
            color: '#fff',
            flexShrink: 0,
          }}
        >
          B
        </div>
        <div style={{ flex: 1 }}>
          <div
            style={{
              fontSize: WA.fontName,
              fontWeight: 600,
              color: WA.textPrimary,
              fontFamily: '"Roboto", sans-serif',
            }}
          >
            {scenario.resolution.replyTo}
          </div>
          <div style={{ fontSize: WA.fontStatus, color: WA.textSecondary }}>last seen today</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
          <svg width="46" height="46" viewBox="0 0 24 24" fill="none" stroke={WA.textPrimary} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="23 7 16 12 23 17 23 7"/>
            <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
          </svg>
          <svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke={WA.textPrimary} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.8a19.79 19.79 0 01-3.07-8.67A2 2 0 012 3.18h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 11a16 16 0 006.9 6.9l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/>
          </svg>
          <svg width="36" height="36" viewBox="0 0 24 24" fill={WA.textPrimary}>
            <circle cx="12" cy="5" r="2" /><circle cx="12" cy="12" r="2" /><circle cx="12" cy="19" r="2" />
          </svg>
        </div>
      </div>

      {/* Messages */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          paddingBottom: 12,
          backgroundImage: `url(${staticFile('wa-bg-light.png')})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <ChatBubble
          role="bot"
          lines={[bigMikePreview]}
          startFrame={enterFrame + 10}
          framesPerLine={8}
          time="9:15 AM"
        />
        {frame >= replyFrame && (
          <ChatBubble
            role="user"
            lines={[scenario.resolution.userMessage]}
            startFrame={replyFrame}
            framesPerLine={8}
            time="9:41 AM"
          />
        )}
        {frame >= theirReplyFrame && (
          <ChatBubble
            role="bot"
            lines={[scenario.resolution.theirResponse]}
            startFrame={theirReplyFrame}
            framesPerLine={8}
            time="9:41 AM"
          />
        )}
      </div>

      {/* Input bar */}
      <div
        style={{
          padding: '12px 20px 36px',
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          background: WA.bgHeader,
        }}
      >
        <svg width="44" height="44" viewBox="0 0 24 24" fill={WA.textSecondary}>
          <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z" />
        </svg>
        <div
          style={{
            flex: 1,
            background: WA.bgInput,
            borderRadius: WA.inputRadius,
            padding: '18px 28px',
            fontSize: WA.fontPreview,
            color: WA.textPlaceholder,
          }}
        >
          Message
        </div>
        <svg width="44" height="44" viewBox="0 0 24 24" fill={WA.textSecondary}>
          <path d="M16.5 6v11.5c0 2.21-1.79 4-4 4s-4-1.79-4-4V5c0-1.38 1.12-2.5 2.5-2.5s2.5 1.12 2.5 2.5v10.5c0 .55-.45 1-1 1s-1-.45-1-1V6H10v9.5c0 1.38 1.12 2.5 2.5 2.5s2.5-1.12 2.5-2.5V5c0-2.21-1.79-4-4-4S7 2.79 7 5v12.5c0 3.04 2.46 5.5 5.5 5.5s5.5-2.46 5.5-5.5V6h-1.5z" />
        </svg>
        <div
          style={{
            width: 80,
            height: 80,
            borderRadius: '50%',
            background: WA.green,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <svg width="38" height="38" viewBox="0 0 24 24" fill="white">
            <path d="M12 14c1.66 0 2.99-1.34 2.99-3L15 5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z" />
          </svg>
        </div>
      </div>
    </div>
  );
};
