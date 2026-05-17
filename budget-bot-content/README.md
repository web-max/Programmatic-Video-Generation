# Budget Bot Content — Remotion Video

A Remotion project that renders short-form vertical social media videos (1080×1920, 30fps) showing a phone screen with a WhatsApp-style chat experience. The Budget Bot roasts your spending and saves you money, one cringe moment at a time.

## Quick Start

```bash
cd budget-bot-content
npm install
```

### Preview in browser

```bash
npx remotion preview src/index.ts
# Opens http://localhost:3000 — scrub through the timeline
```

### Render to MP4

```bash
npx remotion render src/index.ts BudgetBotVideo --output out/video.mp4
```

Output: `out/video.mp4` — 1080×1920, 45 seconds, ready to post.

---

## Project Structure

```
budget-bot-content/
├── src/
│   ├── compositions/
│   │   └── BudgetBotVideo.tsx   # Main composition, orchestrates all acts
│   ├── components/
│   │   ├── ChatList.tsx          # Act 1: chat list screen with stagger animation
│   │   ├── ChatConversation.tsx  # Act 2: budget bot conversation
│   │   ├── ChatBubble.tsx        # Individual message bubble with spring animation
│   │   ├── TypingIndicator.tsx   # Animated three-dot typing indicator
│   │   ├── PhoneFrame.tsx        # Phone chrome wrapper
│   │   └── StatusBar.tsx         # Time, battery, signal icons
│   ├── data/
│   │   └── scenario.ts           # All copy and timing data for the bottles scenario
│   ├── hooks/
│   │   └── useTextReveal.ts      # Hook for word-by-word and line-by-line text reveal
│   ├── Root.tsx                  # Registers the composition
│   └── index.ts                  # Entry point for Remotion
├── generateScenario.ts           # AI-powered scenario generator (stretch goal)
├── renderVideo.ts                # Convenience render wrapper
├── package.json
├── tsconfig.json
└── tsconfig.scripts.json         # For ts-node scripts
```

---

## Video Structure

| Act | Time | Content |
|-----|------|---------|
| Act 1 | 0–3.5s | Chat list with staggered animation, tap on "Big Mike 🍾" |
| Act 2 | ~3.7s–30s | Budget Bot conversation — user asks about bottles, bot roasts spending history |
| Act 3 | 30s–40s | Back to Big Mike's chat, user declines responsibly, Big Mike says "...bro" |
| Outro | 40s–45s | Fade to black |

---

## Design

- **Background:** `#0a0a0a` (near-black)
- **Sent bubbles:** `#005c4b` (dark green, WhatsApp-accurate)
- **Received bubbles:** `#1f2c34` (dark grey)
- **Font:** `-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif`
- **Status bar:** 9:41 (classic Apple demo time)
- All animations use Remotion's `spring()` and `interpolate()` — no CSS transitions

---

## Generating New Scenarios (AI-Powered)

The `generateScenario.ts` script calls the Claude API to generate a brand-new scenario for any spending topic, then overwrites `src/data/scenario.ts`.

**Requirements:** An Anthropic API key.

```bash
# Install ts-node if not already present (it's in devDependencies)
npm install

# Generate a new scenario
ANTHROPIC_API_KEY=sk-ant-... npx ts-node --project tsconfig.scripts.json generateScenario.ts "sneaker drop"
ANTHROPIC_API_KEY=sk-ant-... npx ts-node --project tsconfig.scripts.json generateScenario.ts "flight to miami"
ANTHROPIC_API_KEY=sk-ant-... npx ts-node --project tsconfig.scripts.json generateScenario.ts "dinner date"

# Then render the new video
npx remotion render src/index.ts BudgetBotVideo --output out/video.mp4
```

**Model override:**
```bash
MODEL=claude-sonnet-4-6 ANTHROPIC_API_KEY=sk-ant-... npx ts-node --project tsconfig.scripts.json generateScenario.ts "concert tickets"
```

---

## Customizing a Scenario Manually

Edit `src/data/scenario.ts` to change the copy, contacts, and timing. The `Scenario` type is fully documented there — swap it in to produce a different video without touching any component code.

---

## Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `remotion` | 4.0.290 | Core rendering engine |
| `@remotion/cli` | 4.0.290 | CLI tools (preview, render) |
| `@remotion/player` | 4.0.290 | Browser player component |
| `react` / `react-dom` | 18.3.1 | Required by Remotion |
| `@anthropic-ai/sdk` | ^0.53.0 | AI scenario generation |
| `typescript` | 5.4.5 | Type safety |
| `ts-node` | ^10.9.2 | Run TypeScript scripts directly |
