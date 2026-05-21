import * as React from "react";
import { CameraIconComposer as CameraIcon, StickerIcon, PaperclipIcon, MicIcon } from "./icons/Icons";

type WhatsAppComposerProps = {
  placeholder?: string;
  className?: string;
  style?: React.CSSProperties;
  onMicClick?: () => void;
  onAttachClick?: () => void;
  onCameraClick?: () => void;
};

export function WhatsAppComposer({
  placeholder = "Message",
  className,
  style,
  onMicClick,
  onAttachClick,
  onCameraClick,
}: WhatsAppComposerProps) {
  return (
    <div className={["waComposer", className].filter(Boolean).join(" ")} style={style}>
      <div className="waComposer__field">
        <StickerIcon className="waComposer__sticker" />
        <span className="waComposer__cursor" />
        <span className="waComposer__placeholder">{placeholder}</span>
        <button className="waComposer__iconButton waComposer__attach" type="button" aria-label="Attach" onClick={onAttachClick}>
          <PaperclipIcon />
        </button>
        <button className="waComposer__iconButton waComposer__camera" type="button" aria-label="Camera" onClick={onCameraClick}>
          <CameraIcon />
        </button>
      </div>
      <button className="waComposer__mic" type="button" aria-label="Voice message" onClick={onMicClick}>
        <MicIcon />
      </button>

      <style>{`
        .waComposer {
          --wa-green: #1dab61;
          --wa-gray: #586069;
          --wa-bg-line: rgba(198, 184, 162, 0.26);
          width: 100%;
          max-width: 1536px;
          aspect-ratio: 1536 / 239;
          position: relative;
          display: flex;
          align-items: center;
          gap: 25px;
          box-sizing: border-box;
          padding: 30px 18px 20px 20px;
          background-color: #f4f0e8;
          overflow: hidden;
          font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        }
        .waComposer::before {
          content: "";
          position: absolute;
          inset: 0;
          opacity: 0.72;
          background-image:
            radial-gradient(circle at 8% 20%, transparent 0 18px, var(--wa-bg-line) 19px 21px, transparent 22px),
            radial-gradient(circle at 91% 25%, transparent 0 18px, var(--wa-bg-line) 19px 21px, transparent 22px),
            radial-gradient(circle at 70% 84%, transparent 0 20px, var(--wa-bg-line) 21px 23px, transparent 24px),
            linear-gradient(34deg, transparent 0 46%, var(--wa-bg-line) 47% 49%, transparent 50%),
            linear-gradient(148deg, transparent 0 45%, var(--wa-bg-line) 46% 48%, transparent 49%);
          background-size: 178px 130px, 202px 142px, 222px 160px, 160px 120px, 190px 132px;
          background-position: 16px 2px, 44px 12px, 0 80px, 14px 4px, 2px 16px;
        }
        .waComposer__field {
          position: relative;
          z-index: 1;
          flex: 1 1 auto;
          height: 185px;
          min-width: 0;
          display: flex;
          align-items: center;
          box-sizing: border-box;
          padding: 0 44px 0 50px;
          border-radius: 90px;
          background: #fff;
          box-shadow: 0 3px 9px rgba(0,0,0,0.17);
          color: var(--wa-gray);
        }
        .waComposer__sticker { width: 83px; height: 83px; flex: 0 0 auto; color: #586069; transform: translateY(-1px); }
        .waComposer__cursor { width: 7px; height: 97px; margin-left: 46px; background: var(--wa-green); border-radius: 1px; flex: 0 0 auto; }
        .waComposer__placeholder { margin-left: 0; font-size: 70px; line-height: 1; font-weight: 400; letter-spacing: -1.6px; color: #596169; transform: translateY(-4px); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .waComposer__iconButton { appearance: none; border: 0; padding: 0; margin: 0; background: transparent; color: #586069; cursor: pointer; flex: 0 0 auto; display: grid; place-items: center; }
        .waComposer__attach { margin-left: auto; width: 73px; height: 83px; }
        .waComposer__camera { margin-left: 64px; width: 86px; height: 83px; }
        .waComposer__iconButton svg { width: 100%; height: 100%; display: block; }
        .waComposer__mic { position: relative; z-index: 1; flex: 0 0 auto; width: 172px; height: 172px; border: 0; border-radius: 999px; background: var(--wa-green); color: #fff; display: grid; place-items: center; box-shadow: 0 5px 8px rgba(0,0,0,0.16); cursor: pointer; }
        .waComposer__mic svg { width: 82px; height: 82px; transform: translateY(2px); }
        @media (max-width: 700px) {
          .waComposer { gap: 1.6vw; padding: 2vw 1.2vw 1.3vw 1.3vw; }
          .waComposer__field { height: 12.04vw; padding-left: 3.25vw; padding-right: 2.86vw; border-radius: 5.86vw; }
          .waComposer__sticker { width: 5.4vw; height: 5.4vw; }
          .waComposer__cursor { height: 6.32vw; width: .46vw; margin-left: 3vw; }
          .waComposer__placeholder { font-size: 4.56vw; letter-spacing: -.1vw; }
          .waComposer__attach { width: 4.75vw; height: 5.4vw; }
          .waComposer__camera { margin-left: 4.17vw; width: 5.6vw; height: 5.4vw; }
          .waComposer__mic { width: 12.57vw; height: 12.57vw; }
          .waComposer__mic svg { width: 6vw; height: 6vw; }
        }
      `}</style>
    </div>
  );
}

export default WhatsAppComposer;
