---
name: render-preview
description: Render a Remotion scenario and display key frames inline without leaving the IDE. Use this whenever the user wants to preview a video, check how a scenario looks, says "render it", "show me a frame", "how does it look", "preview this", or immediately after /new-scenario completes. Proactively offer to run this after any scenario file is created or edited — don't make the user ask.
---

# Render Preview

Renders three key frames (start, middle, end) of a scenario and displays them inline so you can spot problems before doing a full video render.

## Step 1: Determine the target

**Composition ID** — take from the user's invocation if provided (e.g., `/render-preview BottlesNight`). If not provided, find the most recently touched scenario:

```bash
git diff --name-only HEAD 2>/dev/null | grep 'src/data/scenarios/' | head -1
# fallback:
ls -t src/data/scenarios/*.ts | grep -v index | head -1
```

Infer the composition ID from the exported `id` field in that file.

**Frame numbers** — take from the user's invocation if provided. Otherwise default to `0`, `50`, `130`. These cover the chat-list scene, mid-conversation, and the quick-reply resolution — the three visually distinct moments in any standard scenario.

## Step 2: TypeScript check

```bash
npx tsc --noEmit 2>&1
```

Stop and report errors if any. Rendering broken code wastes 30+ seconds and produces a useless error. Fix first.

## Step 3: Render frames

Create the output directory if needed, then render all three frames in parallel — they're independent:

```bash
mkdir -p out
npx remotion still src/index.ts {CompositionId} --frame=0 --output=out/preview-0.png 2>&1 | tail -5
npx remotion still src/index.ts {CompositionId} --frame=50 --output=out/preview-50.png 2>&1 | tail -5
npx remotion still src/index.ts {CompositionId} --frame=130 --output=out/preview-130.png 2>&1 | tail -5
```

Substitute the actual composition ID and frame numbers.

## Step 4: Display the frames

Read each PNG and show it inline. For each frame, state the frame number and whether it rendered cleanly.

## Step 5: Diagnose issues

Common problems and where to look:

| Symptom | Likely cause |
|---|---|
| Black/blank frame | Scene doesn't start until a later frame — try frame 10, 60, 140 |
| Avatar missing or wrong emoji | `tapContact` doesn't match any `chatList[].name` exactly |
| Render error in stderr | TypeScript runtime error — show the full stderr, not just tail |
| Composition not found | ID doesn't match — run `npx remotion compositions src/index.ts` to list all |
| Chat list looks empty | `chatList` array may be malformed |

## Step 6: Offer next steps

- If proportions or colors look off vs. the real WhatsApp: suggest `/whatsapp-context` then `/pixel-perfect-ui`
- If everything looks right: give the full render command — `npx remotion render src/index.ts {CompositionId} --output out/{slug}.mp4`
- If the user wants to inspect a specific scene: suggest which frame numbers correspond to which scene based on the scenario's `duration` values
