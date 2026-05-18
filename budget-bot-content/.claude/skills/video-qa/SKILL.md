---
name: video-qa
description: Run objective QA checks on a Remotion video scenario — transition leakage, animation jumps, blank frames, missing tap ripples, and typing indicator timing. Use this whenever adding a new scene type (Discord, Telegram, new WhatsApp screen), fixing animation bugs, or validating that a structural UI change didn't introduce visual regressions. Also use it proactively when a user reports something looks wrong visually in a rendered video. Supersedes ui-refine for transition-related and animation integrity issues.
---

# Video QA

Objective-first QA harness for Remotion transition and animation bugs. Deterministic pixel checks run first; model vision is used last and only on frames the checks flag. No human in the loop.

**Scope**: Structural UI work only — new layout types, new screen types, animation fixes. Not for content (`/new-scenario`) or static pixel-matching (`/ui-refine`).

---

## Step 1: Compute the scenario timeline

Read the scenario TypeScript file (`src/data/scenarios/{slug}.ts`) and compute the following JSON. Use the timing algorithm from `src/utils/sceneTiming.ts`:

```
chat-list duration:    scene.duration (user-specified)
quick-reply duration:  scene.duration (user-specified)
conversation duration: cursor = 20
                       for each message:
                         lineCount = non-empty lines in lines[]
                         revealFrames = (role == 'bot') ? 0 : lineCount * 10
                         cursor += delayFrames + revealFrames + 20
                       cursor += 90
```

Each scene's `startFrame` = sum of all previous scene durations.

Build this JSON (compute all fields yourself from the scenario file):

```json
{
  "scenario_id": "LvBag",
  "fps": 30,
  "scenes": [
    {
      "type": "chat-list",
      "start_frame": 0,
      "duration": 105,
      "tap_start_frame": 90
    },
    {
      "type": "conversation",
      "start_frame": 105,
      "duration": 356,
      "typing_offset": 45,
      "typing_duration": 18,
      "max_bot_message_chars": 180
    },
    {
      "type": "quick-reply",
      "start_frame": 461,
      "duration": 440
    }
  ]
}
```

Field notes:
- `tap_start_frame` = `start_frame + duration - 15` (tap animation always starts 15 frames before scene end)
- `max_bot_message_chars` = character count of all non-empty lines concatenated in the longest bot message in that scene
- `typing_duration` = from `typingDuration` field in scenario, default 18 if not set

## Step 2: Identify frames to render

From the timeline, compute which frames need to be rendered:

**For each scene transition** (boundary between scene N and N+1):
- Transition frame T = `scene[N].start_frame + scene[N].duration`
- Render: T−5, T−3, T−1, T, T+1, T+3, T+5

**For each chat-list scene with a tap**:
- Render: `tap_start_frame − 3`, `tap_start_frame`, `tap_start_frame + 5`

Deduplicate the full frame list.

## Step 3: Render all frames in parallel

```bash
mkdir -p out/qa/{ScenarioId}
```

Then render each frame (run as many in parallel as possible — they're independent):

```bash
npx remotion still src/index.ts {ScenarioId} --frame={N} --output=out/qa/{ScenarioId}/f{N}.png 2>&1 | tail -3
```

If any frame fails to render, report the error and stop. Don't run the QA script on incomplete frame sets.

## Step 4: Run objective checks

```bash
python3 .claude/skills/video-qa/scripts/check_transitions.py \
  --frames-dir out/qa/{ScenarioId}/ \
  --scenario-json '{...}'
```

Pass the full JSON from Step 1 as a single-quoted string. The script outputs findings JSON to stdout.

If Pillow is not installed:
```bash
pip3 install Pillow
```

### What the script checks

| Check | What triggers it |
|---|---|
| `blank_frame` | Mean luminance < 15 (black) or > 245 (blown out) |
| `animation_jump` | Mean pixel delta > 35 between adjacent frames |
| `color_leakage` | `#dcf8c6` (sent bubble green) in chat-list frames; `#1dab61` large patch in post-transition conversation frames |
| `missing_tap_ripple` | Fewer than 150 new `#1dab61` pixels during the tap animation window |
| `typing_indicator_too_short` | `typingDuration < max(15, 15 + (chars − 50) / 6)` for the longest bot message |

## Step 5: Vision review (flagged frames only)

For each frame in the script's `findings` array, read the PNG and prompt:

> "This frame should show only a `{expected_scene}` scene at frame `{N}`. From this list only, report what's visually wrong: [wrong scene's elements visible, clipped element, blank area, text overlap, animation artifact, missing element]. Return JSON: `{defects: [string], severity: 'major'|'minor'|'none'}`. No style commentary."

Aggregate results.

## Step 6: Fix → re-check loop

Diagnose from findings, apply fix, re-render only the affected transition's frames, re-run the script. Repeat until `"passed": true`.

**Diagnosis map:**

| Finding | Most likely location |
|---|---|
| Conversation bubbles in chat-list frames (`color_leakage`) | `src/compositions/VideoComposition.tsx` — opacity interpolation in SCENE_OVERLAP window for conversation exit |
| Tap ripple persisting in conversation frames (`color_leakage`) | `src/components/ChatList.tsx` exit animation or `src/utils/animations.ts` makeExitFade |
| `animation_jump` at transition | `interpolate()` call missing a clamp or range too short |
| `blank_frame` at transition | SCENE_OVERLAP window needs to extend further; check scene visibility condition |
| `missing_tap_ripple` | `ChatList.tsx` tap ripple spring — check `tapStartFrame` computation or spring config |
| `typing_indicator_too_short` | Increase `typingDuration` in the scenario file to at least the reported minimum |

## Step 7: Full render

Only after `"passed": true` on all checks:

```bash
npx remotion render src/index.ts {ScenarioId} --output out/{slug}.mp4
```
