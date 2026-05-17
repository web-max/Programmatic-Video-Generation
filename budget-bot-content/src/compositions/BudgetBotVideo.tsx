import React from 'react';
import { useCurrentFrame, interpolate, AbsoluteFill } from 'remotion';
import { ScreenRecordingFrame } from '../components/ScreenRecordingFrame';
import { ChatList } from '../components/ChatList';
import { ChatConversation } from '../components/ChatConversation';
import { Act3Screen } from '../components/Act3Screen';
import { scenario } from '../data/scenario';

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

  const bigMikePreview =
    scenario.chatList.find((c) => c.name === scenario.resolution.replyTo)?.preview ?? '';

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
            contactName={scenario.resolution.replyTo}
            avatarSrc={scenario.resolution.avatarSrc}
            contactPreviewMessage={bigMikePreview}
            userMessage={scenario.resolution.userMessage}
            contactResponse={scenario.resolution.theirResponse}
            previewTime="9:15 AM"
            replyTime="9:41 AM"
            responseTime="9:41 AM"
          />
        )}
      </ScreenRecordingFrame>
    </AbsoluteFill>
  );
};
