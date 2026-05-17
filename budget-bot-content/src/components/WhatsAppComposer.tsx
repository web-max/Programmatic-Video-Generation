import * as React from "react";

type WhatsAppComposerProps = {
  placeholder?: string;
  className?: string;
  style?: React.CSSProperties;
  onMicClick?: () => void;
  onAttachClick?: () => void;
  onCameraClick?: () => void;
};

function StickerIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 534 536" aria-hidden="true" {...props}>
      <path d="M 141.0 19.0 L 140.0 21.0 L 137.0 21.0 L 135.0 23.0 L 132.0 23.0 L 128.0 26.0 L 124.0 26.0 L 122.0 28.0 L 116.0 30.0 L 114.0 32.0 L 95.0 42.0 L 93.0 45.0 L 84.0 50.0 L 80.0 55.0 L 78.0 55.0 L 75.0 59.0 L 71.0 61.0 L 69.0 64.0 L 59.0 73.0 L 59.0 75.0 L 57.0 76.0 L 49.0 85.0 L 35.0 106.0 L 32.0 112.0 L 32.0 115.0 L 31.0 117.0 L 29.0 118.0 L 29.0 121.0 L 25.0 126.0 L 25.0 130.0 L 22.0 133.0 L 22.0 137.0 L 20.0 138.0 L 20.0 141.0 L 18.0 144.0 L 17.0 156.0 L 15.0 160.0 L 15.0 169.0 L 13.0 174.0 L 13.0 190.0 L 12.0 191.0 L 12.0 353.0 L 13.0 354.0 L 13.0 364.0 L 15.0 371.0 L 15.0 378.0 L 16.0 379.0 L 18.0 390.0 L 20.0 394.0 L 20.0 397.0 L 25.0 407.0 L 25.0 411.0 L 32.0 422.0 L 32.0 424.0 L 34.0 426.0 L 35.0 430.0 L 38.0 433.0 L 47.0 448.0 L 53.0 454.0 L 54.0 457.0 L 76.0 479.0 L 83.0 485.0 L 85.0 485.0 L 86.0 487.0 L 99.0 494.0 L 111.0 502.0 L 113.0 502.0 L 131.0 511.0 L 134.0 511.0 L 137.0 513.0 L 143.0 514.0 L 145.0 516.0 L 149.0 516.0 L 150.0 517.0 L 158.0 518.0 L 159.0 519.0 L 164.0 519.0 L 165.0 520.0 L 170.0 520.0 L 171.0 521.0 L 183.0 521.0 L 184.0 522.0 L 191.0 522.0 L 192.0 523.0 L 256.0 523.0 L 257.0 522.0 L 282.0 521.0 L 283.0 520.0 L 291.0 520.0 L 298.0 518.0 L 304.0 518.0 L 309.0 516.0 L 313.0 516.0 L 325.0 511.0 L 328.0 511.0 L 330.0 509.0 L 334.0 508.0 L 336.0 506.0 L 338.0 506.0 L 344.0 502.0 L 348.0 501.0 L 350.0 499.0 L 352.0 499.0 L 357.0 495.0 L 368.0 489.0 L 380.0 480.0 L 381.0 478.0 L 388.0 473.0 L 392.0 468.0 L 404.0 458.0 L 404.0 457.0 L 416.0 446.0 L 420.0 440.0 L 422.0 439.0 L 429.0 431.0 L 438.0 424.0 L 438.0 423.0 L 455.0 407.0 L 465.0 395.0 L 474.0 387.0 L 484.0 375.0 L 487.0 369.0 L 491.0 365.0 L 491.0 363.0 L 498.0 354.0 L 498.0 352.0 L 500.0 350.0 L 501.0 346.0 L 503.0 345.0 L 503.0 342.0 L 505.0 340.0 L 506.0 335.0 L 510.0 327.0 L 510.0 324.0 L 513.0 318.0 L 513.0 315.0 L 515.0 311.0 L 515.0 307.0 L 517.0 303.0 L 518.0 289.0 L 519.0 288.0 L 519.0 279.0 L 520.0 278.0 L 520.0 253.0 L 521.0 252.0 L 521.0 198.0 L 520.0 197.0 L 520.0 180.0 L 519.0 179.0 L 518.0 164.0 L 517.0 163.0 L 517.0 157.0 L 516.0 156.0 L 515.0 147.0 L 513.0 144.0 L 513.0 141.0 L 510.0 132.0 L 508.0 130.0 L 507.0 125.0 L 501.0 113.0 L 499.0 112.0 L 499.0 109.0 L 496.0 105.0 L 496.0 103.0 L 492.0 99.0 L 489.0 92.0 L 487.0 91.0 L 484.0 85.0 L 477.0 77.0 L 475.0 76.0 L 468.0 68.0 L 466.0 68.0 L 464.0 64.0 L 461.0 62.0 L 460.0 60.0 L 457.0 60.0 L 456.0 57.0 L 451.0 53.0 L 449.0 50.0 L 436.0 41.0 L 430.0 40.0 L 426.0 35.0 L 423.0 35.0 L 422.0 33.0 L 416.0 33.0 L 414.0 31.0 L 414.0 29.0 L 412.0 28.0 L 409.0 29.0 L 407.0 28.0 L 406.0 26.0 L 402.0 26.0 L 400.0 23.0 L 389.0 22.0 L 384.0 19.0 L 373.0 19.0 L 372.0 18.0 L 369.0 18.0 L 367.0 14.0 L 365.0 16.0 L 363.0 16.0 L 362.0 14.0 L 327.0 13.0 L 326.0 12.0 L 323.0 13.0 L 199.0 13.0 L 198.0 12.0 L 188.0 13.0 L 185.0 12.0 L 181.0 14.0 L 165.0 14.0 L 165.0 17.0 L 164.0 18.0 L 160.0 18.0 L 159.0 16.0 L 155.0 16.0 L 155.0 18.0 L 153.0 20.0 Z M 410.0 82.0 L 423.0 92.0 L 431.0 101.0 L 438.0 107.0 L 443.0 114.0 L 445.0 115.0 L 456.0 131.0 L 460.0 139.0 L 460.0 141.0 L 464.0 147.0 L 464.0 150.0 L 469.0 165.0 L 469.0 169.0 L 471.0 173.0 L 472.0 200.0 L 473.0 201.0 L 473.0 241.0 L 472.0 242.0 L 472.0 251.0 L 470.0 256.0 L 466.0 260.0 L 465.0 263.0 L 459.0 268.0 L 449.0 269.0 L 448.0 270.0 L 428.0 270.0 L 427.0 271.0 L 414.0 271.0 L 413.0 272.0 L 407.0 272.0 L 406.0 270.0 L 402.0 270.0 L 401.0 272.0 L 396.0 272.0 L 395.0 270.0 L 394.0 270.0 L 393.0 272.0 L 373.0 272.0 L 372.0 273.0 L 370.0 273.0 L 369.0 271.0 L 365.0 271.0 L 364.0 273.0 L 357.0 273.0 L 355.0 274.0 L 354.0 276.0 L 348.0 276.0 L 347.0 278.0 L 338.0 280.0 L 327.0 287.0 L 323.0 288.0 L 308.0 300.0 L 244.0 301.0 L 243.0 302.0 L 160.0 301.0 L 151.0 304.0 L 151.0 308.0 L 150.0 310.0 L 147.0 312.0 L 147.0 317.0 L 149.0 321.0 L 149.0 325.0 L 164.0 344.0 L 181.0 359.0 L 184.0 360.0 L 193.0 367.0 L 195.0 367.0 L 202.0 372.0 L 208.0 375.0 L 210.0 375.0 L 216.0 379.0 L 219.0 379.0 L 222.0 381.0 L 229.0 382.0 L 233.0 384.0 L 237.0 384.0 L 241.0 386.0 L 254.0 387.0 L 255.0 388.0 L 265.0 388.0 L 267.0 390.0 L 267.0 398.0 L 268.0 399.0 L 268.0 446.0 L 267.0 447.0 L 267.0 457.0 L 265.0 460.0 L 265.0 462.0 L 260.0 466.0 L 259.0 469.0 L 255.0 473.0 L 247.0 473.0 L 246.0 474.0 L 239.0 474.0 L 238.0 475.0 L 231.0 475.0 L 230.0 474.0 L 227.0 474.0 L 226.0 475.0 L 223.0 475.0 L 222.0 474.0 L 213.0 475.0 L 212.0 474.0 L 200.0 474.0 L 199.0 473.0 L 186.0 474.0 L 182.0 472.0 L 180.0 473.0 L 171.0 473.0 L 170.0 471.0 L 167.0 471.0 L 166.0 472.0 L 159.0 471.0 L 156.0 469.0 L 156.0 467.0 L 151.0 467.0 L 141.0 461.0 L 129.0 457.0 L 126.0 453.0 L 124.0 453.0 L 122.0 451.0 L 118.0 450.0 L 116.0 447.0 L 111.0 444.0 L 107.0 439.0 L 103.0 437.0 L 102.0 435.0 L 100.0 434.0 L 100.0 432.0 L 87.0 420.0 L 76.0 404.0 L 68.0 387.0 L 68.0 384.0 L 66.0 381.0 L 66.0 378.0 L 64.0 374.0 L 63.0 364.0 L 61.0 359.0 L 61.0 348.0 L 60.0 347.0 L 60.0 340.0 L 59.0 339.0 L 59.0 215.0 L 60.0 214.0 L 61.0 182.0 L 62.0 181.0 L 62.0 175.0 L 63.0 174.0 L 65.0 158.0 L 68.0 152.0 L 68.0 149.0 L 76.0 132.0 L 88.0 114.0 L 96.0 105.0 L 113.0 89.0 L 134.0 75.0 L 138.0 74.0 L 145.0 70.0 L 148.0 70.0 L 155.0 67.0 L 160.0 67.0 L 163.0 65.0 L 175.0 64.0 L 181.0 62.0 L 225.0 61.0 L 226.0 60.0 L 329.0 60.0 L 330.0 61.0 L 355.0 62.0 L 356.0 63.0 L 362.0 63.0 L 367.0 65.0 L 372.0 65.0 L 375.0 67.0 L 379.0 67.0 L 391.0 73.0 L 396.0 74.0 L 403.0 79.0 Z M 459.0 319.0 L 460.0 320.0 L 459.0 326.0 L 450.0 340.0 L 445.0 345.0 L 443.0 349.0 L 440.0 351.0 L 439.0 354.0 L 425.0 367.0 L 417.0 377.0 L 412.0 380.0 L 412.0 382.0 L 409.0 384.0 L 408.0 386.0 L 404.0 388.0 L 404.0 389.0 L 385.0 407.0 L 385.0 409.0 L 377.0 415.0 L 377.0 417.0 L 374.0 419.0 L 363.0 431.0 L 358.0 434.0 L 356.0 437.0 L 356.0 439.0 L 355.0 440.0 L 352.0 440.0 L 348.0 446.0 L 344.0 446.0 L 341.0 449.0 L 340.0 452.0 L 334.0 453.0 L 333.0 455.0 L 323.0 461.0 L 319.0 461.0 L 317.0 459.0 L 317.0 456.0 L 316.0 455.0 L 316.0 388.0 L 318.0 382.0 L 318.0 374.0 L 321.0 367.0 L 321.0 364.0 L 328.0 350.0 L 330.0 349.0 L 332.0 345.0 L 349.0 329.0 L 363.0 322.0 L 366.0 322.0 L 375.0 319.0 L 402.0 319.0 L 403.0 318.0 L 447.0 318.0 L 448.0 319.0 Z M 160.0 150.0 L 154.0 156.0 L 149.0 159.0 L 149.0 161.0 L 147.0 162.0 L 145.0 165.0 L 144.0 170.0 L 142.0 171.0 L 142.0 177.0 L 140.0 178.0 L 140.0 188.0 L 142.0 191.0 L 143.0 199.0 L 148.0 206.0 L 148.0 208.0 L 150.0 211.0 L 159.0 218.0 L 163.0 219.0 L 164.0 221.0 L 173.0 222.0 L 174.0 221.0 L 188.0 220.0 L 197.0 215.0 L 205.0 207.0 L 210.0 199.0 L 210.0 197.0 L 212.0 195.0 L 213.0 178.0 L 210.0 171.0 L 210.0 168.0 L 204.0 159.0 L 199.0 156.0 L 194.0 151.0 L 190.0 151.0 L 188.0 149.0 L 168.0 149.0 L 167.0 148.0 L 163.0 150.0 Z M 345.0 148.0 L 343.0 150.0 L 341.0 150.0 L 340.0 152.0 L 335.0 153.0 L 335.0 155.0 L 332.0 156.0 L 329.0 160.0 L 327.0 161.0 L 327.0 163.0 L 325.0 165.0 L 320.0 176.0 L 320.0 192.0 L 323.0 198.0 L 323.0 201.0 L 325.0 202.0 L 325.0 204.0 L 330.0 211.0 L 338.0 218.0 L 345.0 220.0 L 349.0 220.0 L 350.0 221.0 L 365.0 221.0 L 372.0 217.0 L 376.0 216.0 L 383.0 209.0 L 388.0 202.0 L 388.0 200.0 L 390.0 199.0 L 390.0 196.0 L 392.0 193.0 L 392.0 189.0 L 393.0 188.0 L 392.0 176.0 L 390.0 172.0 L 390.0 169.0 L 384.0 160.0 L 373.0 151.0 Z" fill="currentColor" fillRule="evenodd" />
    </svg>
  );
}

function PaperclipIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true" {...props}>
      <path d="M24 35.6V16.2c0-7.2 5.4-12.8 12.2-12.8 6.9 0 12.3 5.6 12.3 12.8v26.3c0 10.3-7.7 18.1-17.1 18.1-9.5 0-17.2-7.8-17.2-18.1V18.9c0-2.2 1.6-3.8 3.7-3.8s3.7 1.6 3.7 3.8v23.6c0 5.9 4.3 10.2 9.8 10.2 5.4 0 9.7-4.3 9.7-10.2V16.2c0-2.8-2.1-5-4.9-5-2.7 0-4.8 2.2-4.8 5v19.4c0 2.2-1.6 3.8-3.7 3.8s-3.7-1.6-3.7-3.8Z" fill="currentColor" />
    </svg>
  );
}

function CameraIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 72 64" aria-hidden="true" {...props}>
      <path d="M24.5 5.5h23l5.2 7.2h9.8c4.3 0 7.7 3.4 7.7 7.7v34.4c0 4.3-3.4 7.7-7.7 7.7H9.5c-4.3 0-7.7-3.4-7.7-7.7V20.4c0-4.3 3.4-7.7 7.7-7.7h9.8l5.2-7.2Zm3.9 7.5-5.1 7.1H9.5v34.8h53V20.1H48.7L43.6 13H28.4Zm7.6 10.8c8.2 0 14.8 6.6 14.8 14.8S44.2 53.4 36 53.4 21.2 46.8 21.2 38.6 27.8 23.8 36 23.8Zm0 7.5a7.3 7.3 0 1 0 0 14.6 7.3 7.3 0 0 0 0-14.6Z" fill="currentColor" />
    </svg>
  );
}

function MicIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 72 72" aria-hidden="true" {...props}>
      <path d="M36 6.5c6.4 0 11.6 5.2 11.6 11.6v18.6c0 6.4-5.2 11.6-11.6 11.6s-11.6-5.2-11.6-11.6V18.1C24.4 11.7 29.6 6.5 36 6.5Zm0 7.8c-2.1 0-3.8 1.7-3.8 3.8v18.6c0 2.1 1.7 3.8 3.8 3.8s3.8-1.7 3.8-3.8V18.1c0-2.1-1.7-3.8-3.8-3.8ZM16.6 31.6c2.2 0 3.9 1.8 3.9 3.9 0 8.5 6.9 15.5 15.5 15.5s15.5-7 15.5-15.5c0-2.1 1.7-3.9 3.9-3.9s3.9 1.8 3.9 3.9c0 11.5-8.4 21.1-19.4 22.9v3.2h7.8c2.1 0 3.9 1.8 3.9 3.9s-1.8 3.9-3.9 3.9H24.3c-2.1 0-3.9-1.8-3.9-3.9s1.8-3.9 3.9-3.9h7.8v-3.2c-11-1.8-19.4-11.4-19.4-22.9 0-2.1 1.7-3.9 3.9-3.9Z" fill="currentColor" />
    </svg>
  );
}

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
          --wa-green: #25d366;
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
        .waComposer__mic { position: relative; z-index: 1; flex: 0 0 auto; width: 193px; height: 193px; border: 0; border-radius: 999px; background: var(--wa-green); color: #fff; display: grid; place-items: center; box-shadow: 0 7px 10px rgba(0,0,0,0.18); cursor: pointer; }
        .waComposer__mic svg { width: 92px; height: 92px; transform: translateY(2px); }
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
