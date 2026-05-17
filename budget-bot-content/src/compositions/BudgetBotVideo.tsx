import React from 'react';
import { useCurrentFrame, interpolate, AbsoluteFill, staticFile } from 'remotion';
import { ScreenRecordingFrame } from '../components/ScreenRecordingFrame';
import { ChatList } from '../components/ChatList';
import { ChatConversation } from '../components/ChatConversation';
import { ChatBubble } from '../components/ChatBubble';
import { WhatsAppComposer } from '../components/WhatsAppComposer';
import WhatsAppChatHeader from '../components/WhatsAppChatHeader';
import { scenario } from '../data/scenario';
import { WA } from '../styles/WhatsAppTheme';

const SCALE = 1080 / 1536;

// Frame timing (30fps)
const ACT1_START = 0;
const ACT1_TAP_FRAME = 90;
const ACT1_EXIT = 105;

const ACT2_START = 110;
const ACT2_TYPING_FRAME = 155;
const ACT2_TYPING_DURATION = 18;
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
              contactName={scenario.contactName}
              avatarSrc={scenario.contactAvatarSrc}
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
      {/* Header */}
      <div style={{ height: Math.round(231 * SCALE), overflow: 'hidden', flexShrink: 0 }}>
        <div style={{ transformOrigin: 'left top', transform: `scale(${SCALE})` }}>
          <WhatsAppChatHeader name={scenario.resolution.replyTo} avatarSrc={scenario.resolution.avatarSrc} />
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
      <div style={{ background: '#f4f0e8', paddingBottom: 36 }}>
        <div style={{ height: 168, overflow: 'hidden' }}>
          <WhatsAppComposer
            style={{
              width: 1536,
              maxWidth: 'none',
              transformOrigin: 'left top',
              transform: `scale(${1080 / 1536})`,
            }}
          />
        </div>
      </div>
    </div>
  );
};
