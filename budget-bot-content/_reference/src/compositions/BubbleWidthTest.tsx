import React from 'react';
import { AbsoluteFill } from 'remotion';
import { ChatBubble } from '../components/ChatBubble';

const LONG_TEXT = "you've spent $340 on clubs in the last 30 days alone.";
const SHORT_TEXT = "bro you want to get BOTTLES tonight or not";

// ChatBubble outer wrapper has padding-left: 8px for bot (role="bot") messages.
// Right edge of a ceiling-constrained bubble = 8px left-pad + 918px maxWidth = 926px.
const CEILING_X = 8 + 918;

/**
 * Diagnostic composition that proves WA.bubbleMaxWidth resolves identically
 * in both the Act 2 layout context (flex-column child) and the Act 3 layout
 * context (position:absolute). A red reference line marks x=926 (the expected
 * right edge). Both long-text bubbles should align with the line; the short-text
 * bubble demonstrates content-constrained (sub-ceiling) width.
 */
export const BubbleWidthTest: React.FC = () => (
  <AbsoluteFill style={{ background: '#EFEAE2', fontFamily: '"Roboto", sans-serif' }}>

    {/* Red vertical reference line at the expected maxWidth right-edge */}
    <div style={{
      position: 'absolute', top: 0, left: CEILING_X, width: 3, height: 1920,
      background: 'rgba(210, 0, 0, 0.55)', zIndex: 20,
    }} />
    <div style={{
      position: 'absolute', top: 22, left: CEILING_X + 6,
      fontSize: 26, color: 'rgba(200,0,0,0.8)', zIndex: 21, whiteSpace: 'nowrap',
    }}>
      918 px ceiling (x = {CEILING_X})
    </div>

    {/* Title */}
    <div style={{ position: 'absolute', top: 22, left: 20, fontSize: 34, fontWeight: 'bold', color: '#111', zIndex: 10 }}>
      maxWidth ceiling test
    </div>

    {/* ── ACT 2 CONTEXT ── flex-column wrapper → ChatScreenLayout (flex:1) */}
    <div style={{ position: 'absolute', top: 80, left: 0, width: 1080, height: 420, overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: 6, left: 12, fontSize: 27, color: '#555', zIndex: 5 }}>
        Act 2 context — flex-column child (long text, should hit ceiling)
      </div>
      {/* Mirrors the BudgetBotVideo wrapper for Act 2 */}
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column' }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
          <ChatBubble role="bot" lines={[LONG_TEXT]} startFrame={0} framesPerLine={0} time="10:32 PM" />
        </div>
      </div>
    </div>

    <div style={{ position: 'absolute', top: 506, left: 0, width: 1080, height: 2, background: '#bbb' }} />

    {/* ── ACT 3 CONTEXT ── position:absolute directly (matches Act3Screen → ChatScreenLayout) */}
    <div style={{ position: 'absolute', top: 516, left: 0, width: 1080, height: 640, overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: 6, left: 12, fontSize: 27, color: '#555', zIndex: 5 }}>
        Act 3 context — position:absolute (long + short bubble)
      </div>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', paddingBottom: 16 }}>
        <ChatBubble role="bot" lines={[LONG_TEXT]} startFrame={0} framesPerLine={0} time="10:32 PM" />
        <ChatBubble role="bot" lines={[SHORT_TEXT]} startFrame={0} framesPerLine={0} time="9:15 AM" />
      </div>
    </div>

  </AbsoluteFill>
);
