import React from 'react';
import { useCurrentFrame, interpolate, AbsoluteFill } from 'remotion';
import { PhoneFrame } from '../components/PhoneFrame';
import { ChatList } from '../components/ChatList';
import { ChatConversation } from '../components/ChatConversation';
import { ChatBubble } from '../components/ChatBubble';
import { StatusBar } from '../components/StatusBar';
import { scenario } from '../data/scenario';

// Frame timing constants (at 30fps)
const ACT1_START = 0;
const ACT1_TAP_FRAME = 90;   // 3s: tap Big Mike
const ACT1_EXIT = 105;        // 3.5s: fade out list

const ACT2_START = 110;       // ~3.7s: conversation enters
const ACT2_TYPING_FRAME = 155; // after first user message, bot starts typing
const ACT2_TYPING_DURATION = 45; // 1.5s typing
const ACT2_EXIT = 900;         // 30s: leave conversation

const ACT3_START = 910;        // ~30.3s: back to chat list
const ACT3_REPLY_FRAME = 960;  // 32s: user reply animates in
const ACT3_THEIR_REPLY = 1020; // 34s: Big Mike's response
const ACT3_HOLD_END = 1200;    // 40s
const FADE_OUT_START = 1300;
const TOTAL_FRAMES = 1350;

export const BudgetBotVideo: React.FC = () => {
  const frame = useCurrentFrame();

  const showAct1 = frame < ACT1_EXIT + 20;
  const showAct2 = frame >= ACT2_START - 10 && frame < ACT2_EXIT + 20;
  const showAct3 = frame >= ACT3_START - 10;

  const globalFade = interpolate(
    frame,
    [FADE_OUT_START, TOTAL_FRAMES],
    [1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  return (
    <AbsoluteFill style={{ background: '#000', opacity: globalFade }}>
      <PhoneFrame enterStartFrame={ACT1_START}>
        {/* Act 1: Chat List */}
        {showAct1 && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <ChatList
              items={scenario.chatList}
              highlightName={scenario.triggerContact}
              tapStartFrame={ACT1_TAP_FRAME}
              exitFrame={ACT1_EXIT}
            />
          </div>
        )}

        {/* Act 2: Budget Bot Conversation */}
        {showAct2 && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
            }}
          >
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

        {/* Act 3: Resolution chat list */}
        {showAct3 && (
          <Act3Screen
            enterFrame={ACT3_START}
            replyFrame={ACT3_REPLY_FRAME}
            theirReplyFrame={ACT3_THEIR_REPLY}
          />
        )}
      </PhoneFrame>
    </AbsoluteFill>
  );
};

interface Act3ScreenProps {
  enterFrame: number;
  replyFrame: number;
  theirReplyFrame: number;
}

const Act3Screen: React.FC<Act3ScreenProps> = ({
  enterFrame,
  replyFrame,
  theirReplyFrame,
}) => {
  const frame = useCurrentFrame();

  const enterOpacity = interpolate(frame, [enterFrame, enterFrame + 15], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        background: '#0b141a',
        opacity: enterOpacity,
      }}
    >
      <StatusBar />

      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: '12px 24px 16px',
          gap: 20,
          background: '#1f2c34',
        }}
      >
        <svg width="40" height="40" viewBox="0 0 24 24" fill="#8e9eab">
          <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
        </svg>
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: '50%',
            background: '#ffb74d',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 32,
            fontWeight: 700,
            color: '#fff',
            fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
          }}
        >
          B
        </div>
        <div>
          <div
            style={{
              fontSize: 34,
              fontWeight: 600,
              color: '#e9edef',
              fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
            }}
          >
            {scenario.resolution.replyTo}
          </div>
          <div style={{ fontSize: 24, color: '#8e9eab' }}>last seen today</div>
        </div>
      </div>

      {/* Messages */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          paddingBottom: 16,
        }}
      >
        {/* Original message from Big Mike */}
        <ChatBubble
          role="bot"
          lines={[scenario.chatList.find((c) => c.name === scenario.resolution.replyTo)?.preview ?? '']}
          startFrame={enterFrame + 10}
          framesPerLine={8}
        />

        {/* User's reply */}
        {frame >= replyFrame && (
          <ChatBubble
            role="user"
            lines={[scenario.resolution.userMessage]}
            startFrame={replyFrame}
            framesPerLine={8}
          />
        )}

        {/* Big Mike's response */}
        {frame >= theirReplyFrame && (
          <ChatBubble
            role="bot"
            lines={[scenario.resolution.theirResponse]}
            startFrame={theirReplyFrame}
            framesPerLine={8}
          />
        )}
      </div>

      {/* Input bar */}
      <div
        style={{
          padding: '16px 24px 32px',
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          background: '#1f2c34',
        }}
      >
        <div
          style={{
            flex: 1,
            background: '#2a3942',
            borderRadius: 40,
            padding: '18px 28px',
            fontSize: 30,
            color: '#8e9eab',
            fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
          }}
        >
          Message
        </div>
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: '50%',
            background: '#00a884',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <svg width="34" height="34" viewBox="0 0 24 24" fill="white">
            <path d="M12 1a11 11 0 1 0 0 22A11 11 0 0 0 12 1zm-1 16v-8l6 4-6 4z" />
          </svg>
        </div>
      </div>
    </div>
  );
};
