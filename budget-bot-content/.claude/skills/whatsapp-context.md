---
name: whatsapp-context
description: Load all WhatsApp UI component files into context before visual work. Use this at the start of any session involving UI fixes, color or spacing tweaks, pixel-perfect comparisons, debugging a visual glitch, or before /pixel-perfect-ui or /ui-refine. Run it proactively whenever the user mentions how the video looks, references a component by name, or wants to fix anything visual — don't wait for them to explicitly ask.
---

# WhatsApp Context

Reads the six core UI files plus reference screenshots in one parallel pass so visual work can start immediately. Without this, every new context window cold-starts and wastes the first few tool calls re-reading the same files.

## Step 1: Load everything in parallel

Read these files simultaneously — don't do them sequentially:

- `src/components/ChatBubble.tsx`
- `src/components/ChatConversation.tsx`
- `src/components/ChatList.tsx`
- `src/components/ScreenRecordingFrame.tsx`
- `src/styles/WhatsAppTheme.ts`
- `src/config/constants.ts`

Also run in parallel:
```bash
ls screenshots/
```

## Step 2: Confirm and flag

In under 10 lines, confirm what's loaded and flag anything immediately suspicious — hardcoded hex values that don't match the theme, pixel sizes that look like they might be design-space vs. render-space confusion, or any `TODO` comments left in the component files.

Don't summarize every file. The goal is: context loaded + any obvious problems surfaced.

## Step 3: Hand off

If the user said what they want to fix, start on it. If they invoked `/pixel-perfect-ui` or `/ui-refine` next, hand off directly. Otherwise ask what needs fixing.

---

## Design constants (know these cold)

| Constant | Value | Notes |
|---|---|---|
| Design width | 1536px | All component pixel values are written in this space |
| Render width | 1080px | What Remotion outputs |
| Scale factor (`SCALE`) | `0.703125` | Applied at render time — never bake it into component values |
| WhatsApp green | `#1dab61` | Send button, unread badges, checkmarks |
| Platform | Android | Not iOS — different status bar, nav bar, UI chrome |
| Theme | Light mode | Dark mode is no longer the target |

When debugging a sizing or color mismatch, the most common mistake is mixing design-space and render-space values, or using an iOS reference instead of Android.

## Reference screenshots

```
screenshots/
  WhatsApp Image 2026-05-16 at 23.33.54.jpeg   ← chat list (Android light, ground truth)
  WhatsApp Image 2026-05-16 at 23.33.55.jpeg   ← conversation (Android light, ground truth)
```

These are the authoritative reference images. When in doubt about how something should look, check these first.
