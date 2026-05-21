import React from "react";
import { WA } from "../styles/WhatsAppTheme";
import { CameraIconHeader as CameraIcon, MoreIcon, SearchIcon } from "./icons/Icons";

export interface WhatsAppChatsTopProps {
  unreadCount?: number;
  groupCount?: number;
  activeFilter?: "all" | "unread" | "favorites" | "groups" | "custom";
  customFilterLabel?: string;
  className?: string;
}

const LIGHT_BG = "#f5f5f4";
const BORDER = "#d8dada";
const ACTIVE_BG = "#d9ffd6";
const ACTIVE_BORDER = "#b8daba";

function FilterChip({
  children,
  active = false,
}: {
  children: React.ReactNode;
  active?: boolean;
}) {
  return (
    <button className={active ? "wa-chip active" : "wa-chip"} type="button">
      {children}
    </button>
  );
}

export default function WhatsAppChatsTop({
  unreadCount = 26,
  groupCount = 11,
  activeFilter = "all",
  customFilterLabel = "Road",
  className = "",
}: WhatsAppChatsTopProps) {
  return (
    <section className={`wa-chat-top ${className}`}>
      <header className="wa-header">
        <h1>WhatsApp</h1>
        <div className="wa-actions">
          <CameraIcon />
          <MoreIcon />
        </div>
      </header>

      <div className="wa-search" role="search">
        <SearchIcon />
        <span>Ask Meta AI or Search</span>
      </div>

      <div className="wa-filters" aria-label="Chat filters">
        <FilterChip active={activeFilter === "all"}>All</FilterChip>
        <FilterChip active={activeFilter === "unread"}>
          Unread <span className="wa-number">{unreadCount}</span>
        </FilterChip>
        <FilterChip active={activeFilter === "favorites"}>Favorites</FilterChip>
        <FilterChip active={activeFilter === "groups"}>
          Groups <span className="wa-number">{groupCount}</span>
        </FilterChip>
        <FilterChip active={activeFilter === "custom"}>{customFilterLabel}</FilterChip>
      </div>

      <style>{`
        .wa-chat-top {
          width: 1536px;
          height: 726px;
          box-sizing: border-box;
          background: #fff;
          overflow: hidden;
          font-family: Arial, Helvetica, sans-serif;
          color: ${WA.textListPrimary};
          padding-top: 64px;
        }

        .wa-header {
          height: 112px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 54px 0 63px;
          box-sizing: border-box;
        }

        .wa-header h1 {
          margin: 0;
          color: ${WA.green};
          font-size: 88px;
          line-height: 1;
          font-weight: 800;
          letter-spacing: -4.8px;
        }

        .wa-actions {
          display: flex;
          align-items: center;
          gap: 54px;
        }

        .wa-search {
          margin: 64px 48px 0;
          height: 170px;
          border-radius: 78px;
          background: ${LIGHT_BG};
          display: flex;
          align-items: center;
          padding-left: 56px;
          box-sizing: border-box;
          gap: 34px;
        }

        .wa-search span {
          color: ${WA.textListMuted};
          font-size: 64px;
          line-height: 1;
          font-weight: 400;
          letter-spacing: -2.8px;
          transform: translateY(2px);
        }

        .wa-filters {
          margin-top: 99px;
          margin-left: 66px;
          display: flex;
          align-items: center;
          gap: 29px;
          white-space: nowrap;
        }

        .wa-chip {
          height: 120px;
          border-radius: 60px;
          border: 4px solid ${BORDER};
          background: #fff;
          color: ${WA.textListMuted};
          padding: 0 42px;
          font-family: inherit;
          font-size: 56px;
          line-height: 1;
          font-weight: 800;
          letter-spacing: -2.2px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 24px;
          box-sizing: border-box;
        }

        .wa-chip.active {
          color: #0d6d43;
          background: ${ACTIVE_BG};
          border-color: ${ACTIVE_BORDER};
          padding-left: 48px;
          padding-right: 48px;
        }

        .wa-number {
          font-weight: 700;
          letter-spacing: -1.2px;
          margin-left: 4px;
        }

        @media (max-width: 768px) {
          .wa-chat-top {
            width: 100%;
            height: auto;
            padding-top: 24px;
            padding-bottom: 24px;
          }

          .wa-header {
            height: 48px;
            padding: 0 18px;
          }

          .wa-header h1 {
            font-size: 36px;
            letter-spacing: -1.6px;
          }

          .wa-actions {
            gap: 18px;
            transform: scale(.45);
            transform-origin: right center;
          }

          .wa-search {
            margin: 24px 16px 0;
            height: 56px;
            border-radius: 28px;
            padding-left: 20px;
            gap: 12px;
          }

          .wa-search svg {
            width: 30px;
            height: 30px;
          }

          .wa-search span {
            font-size: 21px;
            letter-spacing: -.8px;
          }

          .wa-filters {
            margin: 32px 0 0 18px;
            gap: 10px;
            overflow: hidden;
          }

          .wa-chip {
            height: 43px;
            border-radius: 22px;
            border-width: 1.5px;
            padding: 0 15px;
            font-size: 20px;
            letter-spacing: -.7px;
            gap: 8px;
          }

          .wa-chip.active {
            padding-left: 17px;
            padding-right: 17px;
          }
        }
      `}</style>
    </section>
  );
}
