# CLAUDE.md — Project Guide for AI Agents

## What this project is

A Remotion project that renders short-form vertical videos (1080×1920, 30fps) of a phone screen showing WhatsApp-style chats. The "Budget Bot" concept is one scenario — the system is generic and can render any script that fits the scene types below.

## How to add a new video scenario

1. Create `src/data/scenarios/your-slug.ts` — export a `Scenario` object (see `bottles-night.ts` as the reference)
2. Add it to `src/data/scenarios/index.ts` — one line: `import { yourScenario } from './your-slug'; export const scenarios = [..., yourScenario];`
3. That's it. `Root.tsx` auto-registers it as a Remotion composition named `scenario.id`.

**Never touch `VideoComposition.tsx` or `Root.tsx` when writing a new script.** All story content lives in the scenario file.

## The Scenario type

```ts
interface Scenario {
  id: string;          // becomes the Remotion composition ID and render target name
  chatList: ChatListItem[];  // contacts shown on the homescreen
  scenes: Scene[];     // ordered list of scenes — the video plays them in sequence
}
```

`scenes` is a discriminated union. Valid types:

### `chat-list`
Shows the WhatsApp homescreen. Ends with a tap animation on `tapContact`.
```ts
{ type: 'chat-list', tapContact: string, duration: number }
```
`duration` is in frames (30fps). Tap animation starts 15 frames before the end.

### `conversation`
A full animated chat exchange with typing indicator. **Duration is auto-computed from message content** — do not specify it.
```ts
{
  type: 'conversation',
  contactName: string,
  contactAvatarSrc?: string,   // use makeEmojiAvatar() or leave undefined
  messages: Message[],
  typingOffset?: number,       // frames after scene start to show typing indicator (default: 45)
  typingDuration?: number,     // how long the typing indicator shows (default: 18)
}
```
Each `Message`:
```ts
{ role: 'user' | 'bot', lines: string[], delayFrames: number, time?: string }
```
- Use `''` (empty string) in `lines` to add vertical spacing between paragraphs.
- `delayFrames`: gap before this message appears after the previous one (20–60 typical).
- Bot messages reveal instantly; user messages reveal line-by-line (10 frames/line).

### `quick-reply`
A brief 3-message exchange: contact's opener → user replies → contact responds. Good for resolution beats.
```ts
{
  type: 'quick-reply',
  contactName: string,
  contactAvatarSrc?: string,
  previewMessage: string,   // contact's existing message shown at top
  userMessage: string,      // user's reply
  contactResponse: string,  // contact's final response
  duration: number,         // total frames for this scene
  replyOffset?: number,     // frames after scene start for user reply to appear (default: 50)
  responseOffset?: number,  // frames after scene start for contact response (default: 110)
  times?: { preview?: string, reply?: string, response?: string },
}
```

## Scene ordering

Scenes play sequentially. Any order is valid:
```ts
scenes: [
  { type: 'chat-list', tapContact: 'Jake 💸', duration: 105 },
  { type: 'conversation', contactName: '💰 Budget Bot', messages: [...] },
  { type: 'chat-list', tapContact: 'Jake 💸', duration: 60 },  // back to homescreen
  { type: 'quick-reply', contactName: 'Jake 💸', ... },
]
```

## Utilities

### `makeEmojiAvatar(emoji, bgColor)`
Generates a circular avatar image as a data URI. Used for bot and contact avatars.
```ts
import { makeEmojiAvatar } from '../../utils/makeEmojiAvatar';
contactAvatarSrc: makeEmojiAvatar('💰', '#1dab61'),
```

### `computeTotalDuration(scenario)` / `computeSceneDuration(scene)`
In `src/utils/sceneTiming.ts`. Used by `Root.tsx` to auto-calculate `durationInFrames` per composition. Do not call these from scenario files.

## Design system

- Design width: 1536px, scaled to 1080px render width via `SCALE = 1080/1536` (`src/config/constants.ts`)
- WhatsApp colors and spacing live in `src/styles/WhatsAppTheme.ts`
- All animations use Remotion `spring()` and `interpolate()` — no CSS transitions or keyframes

## Render commands

```bash
# Preview all compositions in browser
npx remotion preview src/index.ts

# Render a specific scenario by its id
npx remotion render src/index.ts BottlesNight --output out/bottles-night.mp4

# Render any other scenario
npx remotion render src/index.ts YourScenarioId --output out/your-video.mp4
```

## Dev composition

`BubbleWidthTest` is a diagnostic composition for verifying chat bubble max-width rendering. It is not a real video scenario — ignore it when working with content.

## Files to know

| File | Purpose |
|------|---------|
| `src/data/types.ts` | All shared TypeScript interfaces (`Scenario`, `Scene`, `Message`, etc.) |
| `src/data/scenarios/` | One file per video scenario — **this is where new content goes** |
| `src/compositions/VideoComposition.tsx` | Generic scene runner — reads scenario, computes timeline, renders scenes |
| `src/components/ChatList.tsx` | WhatsApp homescreen building block |
| `src/components/ChatConversation.tsx` | Full animated conversation building block |
| `src/components/QuickReplyScreen.tsx` | Brief 3-message exchange building block |
| `src/utils/sceneTiming.ts` | Frame offset calculations |
| `generateScenario.ts` | AI-powered scenario generator script |
