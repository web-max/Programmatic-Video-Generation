# Budget Bot Content — Remotion Video

A Remotion project that renders short-form vertical social media videos (1080×1920, 30fps) of a phone screen showing WhatsApp-style chat interactions. Scripts are data — no component code changes needed to create a new video.

## Quick Start

```bash
npm install

# Preview all scenarios in browser
npx remotion preview src/index.ts

# Render a specific scenario
npx remotion render src/index.ts BottlesNight --output out/bottles-night.mp4
```

## Adding a new scenario

See `CLAUDE.md` for the full guide. Short version:

1. Create `src/data/scenarios/your-slug.ts` — copy `bottles-night.ts` as a template
2. Add it to `src/data/scenarios/index.ts`
3. Render: `npx remotion render src/index.ts YourScenarioId --output out/your-video.mp4`

## AI-powered scenario generation

```bash
ANTHROPIC_API_KEY=sk-ant-... npx ts-node --project tsconfig.scripts.json generateScenario.ts "sneaker drop"
ANTHROPIC_API_KEY=sk-ant-... npx ts-node --project tsconfig.scripts.json generateScenario.ts "flight to miami"
```

Generates a new scenario file in `src/data/scenarios/` and registers it automatically.

## Project Structure

```
src/
  compositions/
    VideoComposition.tsx    # Generic scene runner — not story-specific
  components/
    ChatList.tsx            # WhatsApp homescreen building block
    ChatConversation.tsx    # Full animated chat building block
    QuickReplyScreen.tsx    # Brief 3-message exchange building block
    ChatBubble.tsx          # Individual message bubble
    TypingIndicator.tsx     # Three-dot typing indicator
  data/
    types.ts                # Shared interfaces (Scenario, Scene, Message, ...)
    scenarios/
      bottles-night.ts      # "Should I get bottles?" scenario
      index.ts              # Register scenarios here
  utils/
    sceneTiming.ts          # Auto-computes frame durations from scene content
    makeEmojiAvatar.ts      # Generates circular emoji avatar images
  styles/
    WhatsAppTheme.ts        # Colors, spacing constants
  config/
    constants.ts            # Scale factor, frame timing constants
  Root.tsx                  # Auto-registers one Remotion composition per scenario
  index.ts                  # Remotion entry point
generateScenario.ts         # AI scenario generator script
```

## Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `remotion` | 4.0.290 | Core rendering engine |
| `@remotion/cli` | 4.0.290 | CLI tools (preview, render) |
| `react` / `react-dom` | 18.3.1 | Required by Remotion |
| `@anthropic-ai/sdk` | ^0.53.0 | AI scenario generation |
| `typescript` | 5.4.5 | Type safety |
| `ts-node` | ^10.9.2 | Run generator script directly |
