---
name: new-scenario
description: Create a new Budget Bot video scenario TypeScript file from a concept or idea. Use this whenever the user describes a new video idea, says "new scenario", "let's do one about X", "make a video where", names a concept like "sneaker drop" or "crypto bro", or just describes a funny financial situation — even if they don't explicitly say "scenario". If the user describes any temptation/budgeting situation that could make a good short-form video, offer to run this. Always use this skill to create scenario files rather than doing it ad hoc.
---

# New Scenario

Takes a concept and produces a complete, compiled `Scenario` TypeScript file ready to render.

## Step 1: Gather the concept

If the user hasn't described the scenario yet, ask ONE question:

> "What's the concept? Give me the situation, the contact who tempts the user, and the punchline Budget Bot delivers."

Wait for their answer. If they gave enough detail already, proceed directly to Step 2.

## Step 2: Design before writing

Think through the full scenario structure before touching any code. Rushing to write leads to mismatched `tapContact` names and weak punchlines.

- **The hook**: What does the user ask Budget Bot? It should be something embarrassingly relatable.
- **The temptation contact**: Who's pulling them toward a bad financial decision? Give them a name + emoji that telegraphs their personality (e.g., `Big Mike 🍾`, `Chad Crypto 🚀`).
- **The data roast**: Budget Bot's power is citing specific, plausible-sounding data. Invent numbers that feel real: dollar amounts spent, a goal they stated, a humiliating behavioral detail from "the data".
- **The resolution**: A `quick-reply` scene where the user caves to Budget Bot and declines the temptation — this is the emotional payoff.
- **The chat list**: 7–8 contacts that set the scene. First two pinned (Mom + a finance/hustle-culture type). Include the temptation contact with `unread: 1`. Make all preview messages thematically funny.

## Step 3: Write the scenario file

### Naming

- File: `src/data/scenarios/{kebab-slug}.ts`
- Export name: camelCase of the slug (e.g., `sneakerDrop`)
- `id`: PascalCase — this becomes the Remotion composition ID and the render target

### Structure

```ts
import { Scenario } from '../types';
import { makeEmojiAvatar } from '../../utils/makeEmojiAvatar';

export const yourScenario: Scenario = {
  id: 'YourScenarioId',
  chatList: [
    { name: 'Mom',             avatar: 'M', preview: '...', time: '9:38', unread: 3, pinned: true },
    { name: 'Finance Bro 📈',  avatar: 'F', preview: '...', time: '9:35', pinned: true },
    { name: 'Temptation 🎯',   avatar: 'T', preview: '...', time: '9:15', unread: 1 },
    // 4–5 more contacts with funny, thematically relevant previews
  ],
  scenes: [
    {
      type: 'chat-list',
      tapContact: 'Temptation 🎯',  // must exactly match a chatList[].name
      duration: 105,
    },
    {
      type: 'conversation',
      contactName: '💰 Budget Bot',
      contactAvatarSrc: makeEmojiAvatar('💰', '#1dab61'),
      typingOffset: 45,
      typingDuration: 18,
      messages: [
        {
          role: 'user',
          lines: ['the question they ask Budget Bot'],
          delayFrames: 20,
          time: '10:32 PM',
        },
        {
          role: 'bot',
          lines: [
            'opening hook — react to the question, not a lecture',
            '',
            'specific financial data point (invented but plausible dollar amounts)',
            '',
            "reference their stated goal — make it feel like Budget Bot knows them",
            '',
            'the roast / punchline — the embarrassing behavioral observation',
            '',
            'mic drop closer or a rhetorical question',
          ],
          delayFrames: 45,
          time: '10:32 PM',
        },
        {
          role: 'user',
          lines: ['capitulation — short, defeated, with emoji'],
          delayFrames: 30,
          time: '10:33 PM',
        },
        {
          role: 'bot',
          lines: ['encouraging closer that includes a number (savings, timeline, etc.)'],
          delayFrames: 25,
          time: '10:33 PM',
        },
      ],
    },
    {
      type: 'quick-reply',
      contactName: 'Temptation 🎯',
      contactAvatarSrc: makeEmojiAvatar('🎯', '#e74c3c'),
      previewMessage: 'their original temptation message from the chat list',
      userMessage: 'short decline with emoji',
      contactResponse: 'brief funny reaction to being rejected',
      duration: 440,
      replyOffset: 50,
      responseOffset: 110,
      times: { preview: '9:15 AM', reply: '9:41 AM', response: '9:41 AM' },
    },
  ],
};
```

### Key rules (and why they matter)

- **`tapContact` must exactly match a `chatList[].name`** — the tap animation looks up the contact by this string at runtime. A mismatch causes a silent visual glitch.
- **Use `''` in `lines[]` for vertical spacing** — bot messages reveal line-by-line. Empty strings create breathing room between paragraphs so the punchlines land with timing.
- **`delayFrames`: user 20–30, bot 40–60** — bot messages need more pre-delay because the typing indicator runs first. Too little delay makes the chat feel choppy.
- **`typingOffset: 45, typingDuration: 18`** — these are defaults that work. Only change them if the pacing feels wrong after a preview.
- **`quick-reply` duration: 440** — gives enough time for all three messages plus reading time. Don't shorten it.

## Step 4: Register in the index

Add one import and extend the array in `src/data/scenarios/index.ts`. Don't restructure the existing imports — just append:

```ts
import { yourScenario } from './your-slug';
export const scenarios: Scenario[] = [bottlesNight, lvBag, yourScenario];
```

## Step 5: Validate

```bash
npx tsc --noEmit 2>&1
```

Fix any errors before continuing. The most common are:
- `tapContact` string doesn't match a `chatList` name (case-sensitive)
- Wrong import path for `makeEmojiAvatar`
- Missing required field on a scene type (check `src/data/types.ts`)

## Step 6: Hand off

Tell the user:
- The scenario ID
- Render command: `npx remotion render src/index.ts {ScenarioId} --output out/{slug}.mp4`
- Suggest `/render-preview {ScenarioId}` to check frames before committing to a full render
