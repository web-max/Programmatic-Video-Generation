import React from 'react';
import { staticFile } from 'remotion';
import WhatsAppChatHeader from './WhatsAppChatHeader';
import { WhatsAppComposer } from './WhatsAppComposer';
import { WA } from '../styles/WhatsAppTheme';
import { SCALE, HEADER_DESIGN_HEIGHT, COMPOSER_RENDERED_HEIGHT, DESIGN_WIDTH } from '../config/constants';

export interface ChatScreenLayoutProps {
  /** Rendered in WhatsAppChatHeader. */
  contactName: string;
  /** Optional avatar data-URI or static file path. */
  avatarSrc?: string;

  /**
   * Override the entire header section with custom JSX.
   * When provided, contactName and avatarSrc are ignored.
   */
  headerContent?: React.ReactNode;

  /** Chat bubbles, typing indicator, and any other message-area content. */
  children: React.ReactNode;

  /**
   * CSS url() value for the messages area background texture.
   * Defaults to the standard WhatsApp light chat wallpaper.
   * Pass an empty string to use a plain backgroundColor instead.
   */
  backgroundImage?: string;

  /**
   * translateY offset in px applied inside the messages area for scroll animation.
   * Frame-driven from the parent; defaults to 0.
   */
  scrollOffset?: number;

  /** Whether to render the WhatsApp composer bar at the bottom. Defaults to true. */
  showComposer?: boolean;

  /**
   * Style overrides applied to the outermost container div.
   * Use for opacity, transform (slide-in), position: absolute, inset, etc.
   */
  style?: React.CSSProperties;

  /** Background color of the conversation area. Defaults to WA.bgConversation. */
  backgroundColor?: string;
}

/**
 * Reusable WhatsApp chat screen structure: header + scrollable messages + composer.
 * Used by ChatConversation (Act 2) and Act3Screen (Act 3).
 * Animation state (opacity, translateX, scrollOffset) flows in as props from the parent.
 */
export const ChatScreenLayout: React.FC<ChatScreenLayoutProps> = ({
  contactName,
  avatarSrc,
  headerContent,
  children,
  backgroundImage = `url(${staticFile('wa-bg-light.png')})`,
  scrollOffset = 0,
  showComposer = true,
  style,
  backgroundColor = WA.bgConversation,
}) => (
  <div
    style={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      background: backgroundColor,
      overflow: 'hidden',
      ...style,
    }}
  >
    {/* Header */}
    <div style={{ height: Math.round(HEADER_DESIGN_HEIGHT * SCALE), overflow: 'hidden', flexShrink: 0 }}>
      {headerContent ?? (
        <div style={{ transformOrigin: 'left top', transform: `scale(${SCALE})` }}>
          <WhatsAppChatHeader name={contactName} avatarSrc={avatarSrc} />
        </div>
      )}
    </div>

    {/* Messages area */}
    <div
      style={{
        flex: 1,
        overflowY: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        padding: '12px 0',
        ...(backgroundImage
          ? { backgroundImage, backgroundSize: 'cover', backgroundPosition: 'center' }
          : {}),
      }}
    >
      <div style={{ transform: `translateY(-${scrollOffset}px)` }}>
        {children}
      </div>
    </div>

    {/* Composer bar */}
    {showComposer && (
      <div style={{ background: '#f4f0e8', paddingBottom: 36 }}>
        <div style={{ height: COMPOSER_RENDERED_HEIGHT, overflow: 'hidden' }}>
          <WhatsAppComposer
            style={{
              width: DESIGN_WIDTH,
              maxWidth: 'none',
              transformOrigin: 'left top',
              transform: `scale(${SCALE})`,
            }}
          />
        </div>
      </div>
    )}
  </div>
);
