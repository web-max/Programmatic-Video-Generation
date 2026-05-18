import React from "react";

type TabKey = "chats" | "updates" | "communities" | "calls";

export interface WhatsAppBottomTabsProps {
  activeTab?: TabKey;
  chatCount?: number;
  showUpdateDot?: boolean;
  className?: string;
  onTabChange?: (tab: TabKey) => void;
}

const GREEN = "#1dab61";
const DARK = "#111820";
const ACTIVE_BG = "#d9ffd6";

function ChatsIcon({ active = false }: { active?: boolean }) {
  const fill = active ? "#0d6d43" : DARK;

  return (
    <svg width="96" height="76" viewBox="0 0 96 76" aria-hidden="true">
      <path
        d="M22 16h50c8.2 0 14 5.8 14 13v23c0 7.2-5.8 13-14 13H40L24 75V65h-2C13.8 65 8 59.2 8 52V29c0-7.2 5.8-13 14-13Z"
        fill={fill}
      />
      <rect x="25" y="30" width="38" height="7" rx="3.5" fill="white" opacity=".96" />
      <rect x="25" y="45" width="27" height="7" rx="3.5" fill="white" opacity=".96" />
    </svg>
  );
}

function UpdatesIcon() {
  return (
    <svg width="96" height="76" viewBox="0 0 96 76" aria-hidden="true">
      <path
        d="M24 61c-6-6-9.5-14.2-9.5-23 0-18.5 15-33.5 33.5-33.5 9.5 0 18.1 4 24.2 10.4"
        fill="none"
        stroke={DARK}
        strokeWidth="7"
        strokeLinecap="round"
      />
      <path
        d="M72.2 61.1C66 67.5 57.3 71.5 48 71.5c-7.1 0-13.7-2.2-19.1-6l-15.9 4 4-15.4C15 49.4 14 43.8 14.5 38"
        fill="none"
        stroke={DARK}
        strokeWidth="7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="48" cy="38" r="18" fill="white" stroke={DARK} strokeWidth="7" />
    </svg>
  );
}

function CommunitiesIcon() {
  return (
    <svg width="112" height="76" viewBox="0 0 112 76" aria-hidden="true">
      <circle cx="56" cy="17" r="11" fill="none" stroke={DARK} strokeWidth="7" />
      <circle cx="27" cy="27" r="8" fill="none" stroke={DARK} strokeWidth="7" />
      <circle cx="85" cy="27" r="8" fill="none" stroke={DARK} strokeWidth="7" />
      <path
        d="M38 63v-7c0-9.5 7.7-17 18-17s18 7.5 18 17v7H38Z"
        fill="none"
        stroke={DARK}
        strokeWidth="7"
        strokeLinejoin="round"
      />
      <path
        d="M16 63v-5c0-6 4.8-10 11-10h8"
        fill="none"
        stroke={DARK}
        strokeWidth="7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M96 63v-5c0-6-4.8-10-11-10h-8"
        fill="none"
        stroke={DARK}
        strokeWidth="7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CallsIcon() {
  return (
    <svg width="96" height="76" viewBox="0 0 96 76" aria-hidden="true">
      <path
        d="M31 8c-3.8 0-9.5 1.4-10.2 5.8-1.1 7 3.4 21.3 15.9 33.8C49 59.9 63.6 64.4 70.4 63.2c4.4-.8 5.8-6.5 5.8-10.2 0-3-2.1-5.6-5.1-6.2l-12-2.3c-2.7-.5-5.4.8-6.7 3.2l-2.6 4.6c-8.8-4.3-15.3-10.8-19.6-19.6l4.6-2.6c2.4-1.3 3.7-4 3.2-6.7l-2.3-12C35.1 10.1 33.5 8 31 8Z"
        fill="none"
        stroke={DARK}
        strokeWidth="7"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}

const tabs: Array<{ key: TabKey; label: string; icon: (active: boolean) => React.ReactNode }> = [
  { key: "chats", label: "Chats", icon: (active) => <ChatsIcon active={active} /> },
  { key: "updates", label: "Updates", icon: () => <UpdatesIcon /> },
  { key: "communities", label: "Communities", icon: () => <CommunitiesIcon /> },
  { key: "calls", label: "Calls", icon: () => <CallsIcon /> },
];

export default function WhatsAppBottomTabs({
  activeTab = "chats",
  chatCount = 26,
  showUpdateDot = true,
  className = "",
  onTabChange,
}: WhatsAppBottomTabsProps) {
  return (
    <nav
      className={`wa-tabs ${className}`}
      aria-label="WhatsApp tabs"
    >
      {tabs.map((tab) => {
        const active = tab.key === activeTab;

        return (
          <button
            key={tab.key}
            className="wa-tab"
            type="button"
            aria-current={active ? "page" : undefined}
            onClick={() => onTabChange?.(tab.key)}
          >
            <span className={active ? "wa-icon-pill active" : "wa-icon-pill"}>
              {tab.icon(active)}
              {tab.key === "chats" && chatCount > 0 && (
                <span className="wa-count">{chatCount}</span>
              )}
              {tab.key === "updates" && showUpdateDot && (
                <span className="wa-dot" />
              )}
            </span>
            <span className="wa-label">{tab.label}</span>
          </button>
        );
      })}

      <style>{`
        .wa-tabs {
          width: 100%;
          height: 330px;
          box-sizing: border-box;
          display: grid;
          grid-template-columns: 1fr 1fr 1.18fr 1fr;
          align-items: start;
          background: #fff;
          border-top: 2px solid #e6e8e8;
          font-family: Arial, Helvetica, sans-serif;
          overflow: hidden;
        }

        .wa-tab {
          position: relative;
          appearance: none;
          border: 0;
          background: transparent;
          padding: 57px 0 0;
          margin: 0;
          color: ${DARK};
          font: inherit;
          display: flex;
          flex-direction: column;
          align-items: center;
          cursor: pointer;
        }

        .wa-icon-pill {
          position: relative;
          width: 256px;
          height: 128px;
          border-radius: 64px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 30px;
        }

        .wa-icon-pill.active {
          background: ${ACTIVE_BG};
        }

        .wa-label {
          font-size: 56px;
          line-height: 1;
          letter-spacing: -2.4px;
          font-weight: 800;
          white-space: nowrap;
        }

        .wa-count {
          position: absolute;
          top: 4px;
          right: 29px;
          min-width: 84px;
          height: 64px;
          padding: 0 10px;
          box-sizing: border-box;
          border-radius: 34px;
          background: ${GREEN};
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 42px;
          line-height: 1;
          font-weight: 800;
          letter-spacing: .5px;
        }

        .wa-dot {
          position: absolute;
          top: 4px;
          right: 41px;
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: ${GREEN};
        }

        @media (max-width: 768px) {
          .wa-tabs {
            height: auto;
            min-height: 92px;
          }

          .wa-tab {
            padding-top: 16px;
          }

          .wa-icon-pill {
            width: 72px;
            height: 36px;
            border-radius: 18px;
            margin-bottom: 8px;
            transform: scale(.32);
            transform-origin: center top;
          }

          .wa-label {
            font-size: 15px;
            letter-spacing: -.45px;
          }

          .wa-count {
            top: 1px;
            right: 8px;
            min-width: 24px;
            height: 18px;
            border-radius: 9px;
            padding: 0 3px;
            font-size: 12px;
          }

          .wa-dot {
            top: 1px;
            right: 11px;
            width: 14px;
            height: 14px;
          }
        }
      `}</style>
    </nav>
  );
}
