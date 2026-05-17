// Archived: not currently used in any active composition.
import React from "react";

export interface ChatPreview {
  id: string;
  name: string;
  message: string;
  time: string;
  avatarSrc?: string;
  avatarInitial?: string;
  avatarBg?: string;
  avatarColor?: string;
  pinned?: boolean;
  unreadCount?: number;
  unreadDot?: boolean;
  isYou?: boolean;
  sentStatus?: "none" | "sent" | "delivered" | "read";
  attachmentType?: "photo" | "none";
}

export interface WhatsAppChatListProps {
  className?: string;
  chats?: ChatPreview[];
}

const DARK = "#111820";
const MUTED = "#646b72";
const GREEN = "#25d366";
const BLUE = "#0b91e6";
const PIN = "#90989e";

function PinIcon() {
  return (
    <svg width="54" height="76" viewBox="0 0 54 76" aria-hidden="true">
      <path
        d="M13 3h28v13l-7 6v19l11 9v7H30v15h-6V57H9v-7l11-9V22l-7-6V3Z"
        fill={PIN}
      />
    </svg>
  );
}

function ImageIcon() {
  return (
    <svg width="49" height="49" viewBox="0 0 49 49" aria-hidden="true">
      <rect x="3" y="3" width="43" height="43" rx="5" fill="#8d969b" />
      <circle cx="35" cy="16" r="5" fill="#fff" opacity=".92" />
      <path d="M10 38l10-12 7 8 5-6 8 10H10Z" fill="#fff" opacity=".92" />
    </svg>
  );
}

function CheckMarks({ status = "read" }: { status?: ChatPreview["sentStatus"] }) {
  if (status === "none") return null;
  const color = status === "read" ? BLUE : "#8b949b";

  return (
    <svg width="72" height="38" viewBox="0 0 72 38" aria-hidden="true">
      <path
        d="M4 20l10 10L37 6"
        fill="none"
        stroke={color}
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M29 20l10 10L67 5"
        fill="none"
        stroke={color}
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function DefaultAvatar({
  initial,
  bg = "#fde0d8",
  color = "#b64a2e",
}: {
  initial?: string;
  bg?: string;
  color?: string;
}) {
  return (
    <div className="wa-avatar-fallback" style={{ background: bg, color }}>
      {initial}
    </div>
  );
}

function Avatar({ chat }: { chat: ChatPreview }) {
  return (
    <div className="wa-avatar">
      {chat.avatarSrc ? (
        <img src={chat.avatarSrc} alt="" />
      ) : (
        <DefaultAvatar
          initial={chat.avatarInitial ?? chat.name.slice(0, 1)}
          bg={chat.avatarBg}
          color={chat.avatarColor}
        />
      )}
    </div>
  );
}

const defaultChats: ChatPreview[] = [
  {
    id: "1",
    name: "Justin Jay Pete's Friend",
    message: "Hahaha thanks man!",
    time: "5/9/26",
    avatarSrc:
      "data:image/svg+xml;utf8," +
      encodeURIComponent(`
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 188 188">
          <defs>
            <clipPath id="c"><circle cx="94" cy="94" r="94"/></clipPath>
            <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stop-color="#72a8d6"/>
              <stop offset=".45" stop-color="#cddae1"/>
              <stop offset=".46" stop-color="#74624d"/>
              <stop offset="1" stop-color="#b79d73"/>
            </linearGradient>
          </defs>
          <g clip-path="url(#c)">
            <rect width="188" height="188" fill="url(#sky)"/>
            <rect x="42" y="45" width="82" height="92" rx="5" fill="#7c7e79" transform="skewY(-7)"/>
            <rect x="62" y="76" width="63" height="48" rx="3" fill="#cf191f"/>
            <rect x="73" y="85" width="29" height="21" rx="3" fill="#e8eeee"/>
            <rect x="102" y="78" width="21" height="48" rx="2" fill="#15191b"/>
            <rect x="35" y="128" width="112" height="24" fill="#d2c29b"/>
            <circle cx="58" cy="142" r="16" fill="#171a1b"/>
            <circle cx="124" cy="142" r="16" fill="#171a1b"/>
            <rect x="135" y="0" width="53" height="188" fill="#d5d7d3" opacity=".72"/>
          </g>
        </svg>
      `),
    pinned: true,
    unreadCount: 1,
  },
  {
    id: "2",
    name: "Ben",
    message: "Yeah he is fucking hilarious",
    time: "Yesterday",
    avatarInitial: "B",
    avatarBg: "#ffe1d9",
    avatarColor: "#b84a2f",
    pinned: true,
    unreadDot: true,
  },
  {
    id: "3",
    name: "MY US NUMBER (You)",
    message: "Photo",
    time: "2:03 AM",
    avatarSrc:
      "data:image/svg+xml;utf8," +
      encodeURIComponent(`
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 188 188">
          <defs>
            <clipPath id="c"><circle cx="94" cy="94" r="94"/></clipPath>
            <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stop-color="#4e743e"/>
              <stop offset=".48" stop-color="#9fc17d"/>
              <stop offset=".49" stop-color="#efece0"/>
              <stop offset="1" stop-color="#d7d6d0"/>
            </linearGradient>
          </defs>
          <g clip-path="url(#c)">
            <rect width="188" height="188" fill="url(#g)"/>
            <circle cx="94" cy="78" r="42" fill="#d7b18f"/>
            <path d="M42 188c8-47 28-78 54-78s46 31 54 78" fill="#f4f6f7"/>
            <path d="M51 53c15-29 71-36 93 0-25-13-65-12-93 0Z" fill="#6b412b"/>
            <rect x="50" y="71" width="86" height="25" rx="12" fill="#1e2525"/>
            <rect x="62" y="75" width="33" height="16" rx="8" fill="#2d95a7"/>
            <rect x="98" y="75" width="32" height="16" rx="8" fill="#2d95a7"/>
            <path d="M40 93c20 17 71 18 106-3" stroke="#739652" stroke-width="7" fill="none"/>
          </g>
        </svg>
      `),
    isYou: true,
    sentStatus: "read",
    attachmentType: "photo",
  },
];

export default function WhatsAppChatList({
  chats = defaultChats,
  className = "",
}: WhatsAppChatListProps) {
  return (
    <div className={`wa-chat-list ${className}`}>
      {chats.map((chat) => (
        <article className="wa-row" key={chat.id}>
          <Avatar chat={chat} />

          <div className="wa-main">
            <div className="wa-title-line">
              <h2>{chat.name}</h2>
              <time className={chat.unreadCount || chat.unreadDot ? "wa-time unread" : "wa-time"}>
                {chat.time}
              </time>
            </div>

            <div className="wa-sub-line">
              <div className="wa-message">
                {chat.isYou && <CheckMarks status={chat.sentStatus ?? "read"} />}
                {chat.attachmentType === "photo" && <ImageIcon />}
                <span>{chat.message}</span>
              </div>

              <div className="wa-meta">
                {chat.pinned && <PinIcon />}
                {chat.unreadCount ? (
                  <span className="wa-badge">{chat.unreadCount}</span>
                ) : chat.unreadDot ? (
                  <span className="wa-unread-dot" />
                ) : null}
              </div>
            </div>
          </div>
        </article>
      ))}

      <style>{`
        .wa-chat-list {
          width: 1536px;
          height: 949px;
          box-sizing: border-box;
          background: #fff;
          overflow: hidden;
          font-family: Arial, Helvetica, sans-serif;
          color: ${DARK};
          padding-top: 58px;
        }

        .wa-row {
          height: 303px;
          display: grid;
          grid-template-columns: 240px 1fr;
          box-sizing: border-box;
        }

        .wa-avatar {
          width: 188px;
          height: 188px;
          border-radius: 50%;
          overflow: hidden;
          margin-left: 48px;
          margin-top: 18px;
          background: #f1f1f1;
        }

        .wa-avatar img,
        .wa-avatar-fallback {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 88px;
          font-weight: 500;
          line-height: 1;
          object-fit: cover;
        }

        .wa-main {
          padding-top: 34px;
          padding-right: 63px;
          min-width: 0;
        }

        .wa-title-line {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 24px;
          min-width: 0;
        }

        .wa-title-line h2 {
          margin: 0;
          min-width: 0;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          color: ${DARK};
          font-size: 64px;
          line-height: 1.08;
          letter-spacing: -2.7px;
          font-weight: 500;
        }

        .wa-time {
          color: ${MUTED};
          font-size: 48px;
          line-height: 1.1;
          letter-spacing: -1.5px;
          font-weight: 400;
          white-space: nowrap;
          padding-top: 7px;
        }

        .wa-time.unread {
          color: ${GREEN};
          font-weight: 700;
        }

        .wa-sub-line {
          margin-top: 28px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 22px;
          min-width: 0;
        }

        .wa-message {
          min-width: 0;
          display: flex;
          align-items: center;
          gap: 22px;
          color: ${MUTED};
          font-size: 58px;
          line-height: 1.08;
          letter-spacing: -2.2px;
          font-weight: 400;
        }

        .wa-message span {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .wa-meta {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 35px;
          min-width: 160px;
        }

        .wa-badge {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background: ${GREEN};
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 54px;
          line-height: 1;
          font-weight: 600;
          letter-spacing: -1px;
        }

        .wa-unread-dot {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background: ${GREEN};
          display: inline-block;
        }

        @media (max-width: 768px) {
          .wa-chat-list {
            width: 100%;
            height: auto;
            padding-top: 18px;
          }

          .wa-row {
            height: 105px;
            grid-template-columns: 82px 1fr;
          }

          .wa-avatar {
            width: 62px;
            height: 62px;
            margin-left: 16px;
            margin-top: 6px;
          }

          .wa-avatar-fallback {
            font-size: 30px;
          }

          .wa-main {
            padding-top: 12px;
            padding-right: 18px;
          }

          .wa-title-line h2 {
            font-size: 23px;
            letter-spacing: -.8px;
          }

          .wa-time {
            font-size: 17px;
            letter-spacing: -.45px;
            padding-top: 2px;
          }

          .wa-sub-line {
            margin-top: 8px;
            gap: 8px;
          }

          .wa-message {
            gap: 7px;
            font-size: 21px;
            letter-spacing: -.7px;
          }

          .wa-message svg {
            transform: scale(.42);
            margin-left: -18px;
            margin-right: -17px;
          }

          .wa-meta {
            min-width: 58px;
            gap: 11px;
          }

          .wa-meta svg {
            transform: scale(.42);
            margin-left: -17px;
            margin-right: -17px;
          }

          .wa-badge,
          .wa-unread-dot {
            width: 28px;
            height: 28px;
            font-size: 19px;
          }
        }
      `}</style>
    </div>
  );
}
