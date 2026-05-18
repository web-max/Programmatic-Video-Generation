# /render-check — Render the Remotion video and extract comparison frames

Renders the current state of the Remotion project, then extracts key frames so you can immediately inspect and compare them against a reference.

## Usage
```
/render-check                   # full render + extract standard frame set
/render-check fast              # skip render, just re-extract from existing out/video.mp4
/render-check <timestamp>       # render + extract one specific frame
```

## Step-by-step execution

### 1. Render the video
```bash
cd /home/user/Programmatic-Video-Generation/budget-bot-content && npm run render 2>&1
```
If render fails, stop and report the exact error. Do not proceed to frame extraction.

### 2. Extract the standard comparison frame set
Run all extractions in parallel (one ffmpeg call per frame):
```bash
for T in 0.5 1.5 3.5 4.5 8.0 15.0 30.0; do
  ffmpeg -accurate_seek -ss $T -i out/video.mp4 -vframes 1 -q:v 1 /tmp/rendered_${T//./_}s.png -y 2>/dev/null
done
echo "Frames extracted"
```

### 3. Read each frame
Use the Read tool to view each extracted frame image. Look for:
- **Status bar**: clock, battery, signal icons — too clean? misaligned?
- **Header**: avatar size, title gap, icon spacing
- **Search bar**: height, corner radius, gray tone
- **Chat rows**: name weight, preview text, timestamp position, unread badge color
- **Bottom tabs**: icon/label proportions, even-spacing problem

### 4. If a reference video path is known
Extract matching frames from the reference and compare:
```bash
for T in 0.5 1.5 3.5 4.5 8.0; do
  ffmpeg -accurate_seek -ss $T -i <REF_VIDEO_PATH> -vframes 1 -q:v 1 /tmp/ref_${T//./_}s.png -y 2>/dev/null
done
```
Then for each timestamp pair, run the comparison script:
```bash
python3 /home/user/Programmatic-Video-Generation/.claude/scripts/compare_frames.py \
  compare /tmp/ref_<T>s.png /tmp/rendered_<T>s.png \
  --diff-output /tmp/diff_<T>s.png \
  --regions status_bar,0,0,1080,80 header,0,80,1080,130 search_bar,20,220,1040,80 \
            chat_rows,0,310,1080,650 bottom_tabs,0,1750,1080,170 \
            bubble,560,700,480,200 composer,0,1630,1080,120
```
Read each diff image — bright red/pink areas = highest pixel error.

### 5. Produce a render report
After inspecting all frames, output a structured report:
```
RENDER REPORT — <timestamp>
Frame: <T>s
  Status: PASS / FAIL / WARN
  Worst region: <name> (MAE: <value>)
  Key findings: <bullet list>
```

## Performance notes
- Full render takes ~2–4 minutes for the 45s video at 1080×1920 30fps
- Use `fast` mode during rapid iteration to skip re-render
- Remotion also supports still-frame render for faster iteration:
  ```bash
  cd budget-bot-content && npx remotion still src/index.ts BudgetBotVideo --frame=<N> --output /tmp/still_frame<N>.png
  ```
  Frame N = timestamp_seconds × 30 (e.g., 4.5s = frame 135)
  This is MUCH faster than a full render — use it during the fix loop.
