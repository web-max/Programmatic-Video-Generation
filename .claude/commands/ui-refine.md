# /ui-refine — Iterative UI refinement loop

The main fix loop: render a still frame → measure pixel-level differences against the reference → edit the component → re-render → repeat until the delta is below threshold.

## Usage
```
/ui-refine <component> <frame_seconds> [ref_image_path]
/ui-refine header 0.5 /tmp/ref_frame.png
/ui-refine bubble 8.0
/ui-refine all 4.5
```

Components: `header`, `search-bar`, `chat-row`, `bubble`, `bottom-tabs`, `status-bar`, `composer`, `wallpaper`, `all`

## The loop

Repeat the following cycle until MAE for the target component's region drops below **8.0** (visually transparent) or the user is satisfied:

---

### STEP 1 — Render a still frame (fast, no full video render)
```bash
cd /home/user/Programmatic-Video-Generation/budget-bot-content
FRAME=$(echo "<seconds> * 30" | bc | cut -d. -f1)
npx remotion still src/index.ts BudgetBotVideo --frame=$FRAME --output /tmp/current_still.png 2>&1 | tail -5
```
Read `/tmp/current_still.png` with the Read tool to visually inspect.

---

### STEP 2 — Measure the target region
Use the region coordinates from the table below. Run `/pixel-measure` or directly:

**Full region comparison (JSON output, sorted by MAE):**
```bash
python3 /home/user/Programmatic-Video-Generation/.claude/scripts/compare_frames.py \
  compare <ref_image> /tmp/current_still.png \
  --diff-output /tmp/region_diff.png \
  --regions <label>,<x>,<y>,<w>,<h>
```
Read `/tmp/region_diff.png`.

**Sample exact pixel colors:**
```bash
python3 /home/user/Programmatic-Video-Generation/.claude/scripts/compare_frames.py \
  sample /tmp/current_still.png <x>,<y> <x2>,<y2>
```

**Find where a specific color lives (e.g., to locate the WhatsApp green):**
```bash
python3 /home/user/Programmatic-Video-Generation/.claude/scripts/compare_frames.py \
  find-color /tmp/current_still.png '#25D366' --tolerance 20
```

Also sample specific key pixels:
```bash
python3 /home/user/Programmatic-Video-Generation/.claude/scripts/measure_regions.py \
  /tmp/current_still.png --component <component>
```

---

### STEP 3 — Diagnose the delta
Map measurement results to code locations:

| Symptom | File to edit |
|---------|--------------|
| Header avatar too small / wrong gap | `src/components/WhatsAppChatHeader.tsx` |
| Header icon spacing too even | `src/components/WhatsAppChatHeader.tsx` |
| Search bar too tall / too round / too gray | `src/components/WhatsAppChatsTop.tsx` |
| Chat row name weight / spacing | `src/components/WhatsAppChatList.tsx` or `ChatList.tsx` |
| Bottom tab balance too perfect | `src/components/WhatsAppBottomTabs.tsx` |
| Bubble padding / tail / corner radius | `src/components/ChatBubble.tsx` |
| Green color too saturated | `src/styles/WhatsAppTheme.ts` |
| Status bar icons too clean | `src/components/StatusBar.tsx` |
| Composer icon spacing | `src/components/WhatsAppComposer.tsx` |
| Wallpaper contrast / pattern | `src/compositions/BudgetBotVideo.tsx` |

---

### STEP 4 — Edit the component
Make the minimal targeted change. Refer to measured pixel deltas, not guesses:
- If avg green in ref = `#128C7E` and current = `#25D366`, change the color constant in `WhatsAppTheme.ts`
- If header avatar measured 36px but ref shows ~42px, find the width/height style and adjust
- If search bar height measured 72px but ref shows ~60px, find the input container height

After editing, DO NOT render the full video yet — proceed to Step 1 of the next loop iteration.

---

### STEP 5 — Re-render the still and re-measure
Repeat Step 1 and Step 2. Compare the new MAE to the previous iteration.

Report progress:
```
ITERATION <N>
  Component: <name>
  Previous MAE: <old>
  Current MAE: <new>
  Delta: <improvement or regression>
  Remaining issues: <list>
```

If MAE improved: continue to next issue on the same component, or move to next component.
If MAE regressed: revert the change and try a different approach.

---

### STEP 6 — Full video render (only when component passes)
Once a component's MAE < 8.0 across its key frames, do a full render:
```bash
cd /home/user/Programmatic-Video-Generation/budget-bot-content && npm run render 2>&1 | tail -10
```
Then extract and inspect the animation sequence (3 consecutive frames) to check timing:
```bash
for F in 130 131 132 133 134 135; do
  ffmpeg -i out/video.mp4 -vf "select=eq(n\,$F)" -vframes 1 /tmp/anim_f$F.png -y 2>/dev/null
done
```

---

## Component region coordinates (1080×1920 canvas)

| Component        | x    | y    | w    | h   |
|------------------|------|------|------|-----|
| `status-bar`     | 0    | 0    | 1080 | 80  |
| `header`         | 0    | 80   | 1080 | 130 |
| `search-bar`     | 20   | 220  | 1040 | 80  |
| `chat-row`       | 0    | 310  | 1080 | 130 |
| `bottom-tabs`    | 0    | 1750 | 1080 | 170 |
| `bubble`         | 560  | 700  | 480  | 200 |
| `composer`       | 0    | 1630 | 1080 | 120 |
| `wallpaper`      | 0    | 420  | 1080 | 1300 |

---

## MAE thresholds
| MAE range | Meaning |
|-----------|---------|
| 0–5       | Excellent match, imperceptible |
| 5–10      | Good match, subtle difference |
| 10–20     | Noticeable, investigate |
| 20–40     | Clear mismatch, priority fix |
| 40+       | Major structural problem |

---

## Animation timing check (after full render)
Real WhatsApp has micro-stutter and non-linear easing. Check by extracting 5 consecutive frames during a bubble appear animation and measuring the Y-position or opacity shift between frames. If the delta is perfectly linear across frames, the easing curve needs adjustment in the Remotion spring/interpolate call.

## Notes
- Prefer `remotion still` over full render during iteration — it's ~10x faster
- The `/frame-extract` skill handles video frame extraction from reference recordings
- The `/sample-rendered-colors` skill (built-in) handles color verification
- The `/measure-rendered-pixels` skill (built-in) handles spatial measurement
- For tools not available in this environment, the user has local machine access — request the measurement you need and they'll run it
