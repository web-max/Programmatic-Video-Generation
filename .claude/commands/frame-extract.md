# /frame-extract — Extract frames from video at precise timestamps

Extract one or more frames from a reference video or rendered output for side-by-side visual inspection.

## Usage
```
/frame-extract <video_path> <timestamp_seconds> [label]
/frame-extract ref 2.5          # extract frame at 2.5s from reference video
/frame-extract out 2.5          # extract matching frame from rendered output
/frame-extract both 2.5         # extract from both and compare
```

## What to do when invoked

1. **Parse arguments.** If the user types `ref`, expand to the most recently mentioned reference video path. If `out`, expand to `budget-bot-content/out/video.mp4`. If `both`, do both.

2. **Extract the frame with ffmpeg** (exact timestamp, no seek inaccuracy):
```bash
ffmpeg -accurate_seek -ss <timestamp> -i <video_path> -vframes 1 -q:v 1 /tmp/frame_<label>_<timestamp>.png -y 2>&1
```

3. **Read the extracted image** using the Read tool so you can see it visually.

4. **If extracting both**, also generate a pixel diff:
```bash
python3 /home/user/Programmatic-Video-Generation/.claude/scripts/compare_frames.py \
  compare /tmp/frame_ref_<t>.png /tmp/frame_out_<t>.png \
  --diff-output /tmp/diff_<t>.png \
  --regions status_bar,0,0,1080,80 header,0,80,1080,130 search_bar,20,220,1040,80 \
            chat_rows,0,310,1080,650 bottom_tabs,0,1750,1080,170
```
Then Read the diff image.

5. **Report**:
   - Frame dimensions
   - Timestamp extracted
   - If both: overall MAE score and top-3 regions with highest pixel error

## Key timestamps for WhatsApp recreation (30fps, 45s total)
- `0.5` — chat list fully visible (Act 1 start)
- `1.5` — chat list with tap highlight
- `3.5` — transition to chat conversation
- `4.5` — first bubble appeared (Act 2)
- `8.0` — mid-conversation with multiple bubbles
- `15.0` — typing indicator moment
- `30.0` — Act 3 resolution start

## Notes
- Always use `-accurate_seek` before `-i` to get the exact frame (not nearest keyframe)
- Output frames go to `/tmp/` — clean up with `rm /tmp/frame_*.png /tmp/diff_*.png` when done
- For animation analysis, extract a sequence: use timestamps `t`, `t+0.033`, `t+0.066` (consecutive 30fps frames)
