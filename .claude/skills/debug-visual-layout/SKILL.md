---
name: debug-visual-layout
description: Full diagnostic flow for visual layout bugs in rendered images. Renders key frames, measures pixel widths (using the measure-rendered-pixels skill), diagnoses CSS root cause (inline-block shrink-to-content vs maxWidth ceiling, flex/grid context, data-driven vs CSS-driven width), applies the fix, and re-verifies. Use when a UI element renders at the wrong width and the cause is not immediately obvious.
---

# Debug Visual Layout

End-to-end flow for diagnosing and fixing layout bugs in rendered output. Combines pixel measurement (see `measure-rendered-pixels` skill) with systematic CSS diagnosis.

## When to use

- An element renders narrower or wider than expected
- Two "identical" screens have visually different element sizes
- A refactor changed layout but you're not sure why
- You need to prove a fix worked with objective pixel measurements

## Workflow

Make a todo list for all the tasks in this workflow and work on them one after another.

---

### 1. Render key frames

Identify the frame(s) where the bug is visible and render them to PNG:

```bash
# Remotion example
npx remotion still src/index.ts MyComposition --frame=500 --output=out/debug-before.png

# Playwright/Puppeteer example
# (screenshot already saved to file by your test)
```

If comparing two contexts (e.g. Act 2 vs Act 3, mobile vs desktop), render one image per context.

---

### 2. Measure actual pixel widths

Use the **`measure-rendered-pixels`** skill to scan the rendered image.

Key questions to answer:
- What is the measured width of the element?
- What is the expected width (from CSS `maxWidth`, design spec, or comparison context)?
- Are the two contexts (if any) measuring differently?

Record the numbers. Example:
```
Context A (Act 2): bubble width = 599px   ← problem
Context B (Act 3): bubble width = 918px   ← expected
```

---

### 3. Diagnose the root cause

Work through this decision tree:

#### Is the difference between two contexts?

**Yes → check if the containing block width differs.**

The most common causes of two "same" components rendering at different widths:

| Cause | How to identify | Fix |
|---|---|---|
| Different containing block width | Measure the parent container width in each context | Normalize the parent to the same explicit width |
| `maxWidth` as `%` resolves differently | `maxWidth: '85%'` → depends on parent width | Change to an absolute px value |
| One context adds extra padding/margin that shrinks content area | Inspect outer wrapper padding | Remove or normalize the extra spacing |
| CSS `transform: scale()` on a parent | Transforms don't affect layout but can confuse visual inspection | Measure after accounting for scale |

**No (single context) → check if the element is content-driven or ceiling-constrained.**

- **Content-driven** (width < maxWidth): the element shrinks to fit its content.
- **Ceiling-constrained** (width = maxWidth): the element hits its max and content wraps.

If content-driven when it should be ceiling-constrained, continue to step 3a.
If ceiling-constrained when it should be content-driven, continue to step 3b.

#### 3a. Content-driven but should be ceiling-constrained

The element is smaller than its `maxWidth`. Common causes:

**`display: inline-block` with short block-level children**
```
Symptom: element has multiple lines; each line is a block <div>;
         bubble width = widest individual line, not combined text width.
Root cause: inline-block shrinks to max-content width of its children.
           Block children each contribute their own natural text width.
Fix A (data): join short line fragments into longer natural sentences —
              the combined line will exceed maxWidth and force wrapping.
Fix B (CSS):  for multi-paragraph content, use width: <maxWidth> explicitly
              instead of relying on inline-block shrink behavior.
```

**Text content is genuinely shorter than maxWidth**
```
Symptom: single-line element with short text + meta-spacer < maxWidth.
Root cause: correct behavior — no bug.
Fix: none needed. Content-driven width IS correct for short text.
```

**maxWidth defined but not applied**
```
Symptom: element is much wider than maxWidth.
Root cause: maxWidth set on wrong element, or overridden by specificity.
Fix: inspect the DOM element directly; confirm maxWidth is on the sizing element.
```

#### 3b. Ceiling-constrained but should be content-driven

The element is always at maxWidth even for very short content. Common causes:

**Explicit `width` instead of `maxWidth`**
```
Root cause: width: 918px forces the element to be exactly 918px always.
Fix: change width → maxWidth so the element can shrink for short content.
```

**`align-self: stretch` in a flex container**
```
Root cause: flex stretch makes the element fill the cross-axis.
Fix: add align-self: flex-start (or equivalent) to opt out of stretch.
```

---

### 4. Apply the fix

Based on diagnosis, apply the minimal targeted fix:

| Root cause | Fix location | Change |
|---|---|---|
| `maxWidth: '%'` with varying parent | CSS / theme constants | Change to absolute px |
| Inline-block + short line fragments | Data / content | Join fragments into full sentences |
| Inline-block + multi-line content always too narrow | CSS | Add `width: <maxWidth>` for multi-line case |
| `width` instead of `maxWidth` | CSS | Swap `width` → `maxWidth` |
| Flex `stretch` | CSS | Add `align-self: flex-start` |

Keep the fix minimal — change only what the diagnosis identified.

---

### 5. Verify the fix

Re-render the same frame(s) and re-run `measure-rendered-pixels`:

```bash
npx remotion still src/index.ts MyComposition --frame=500 --output=out/debug-after.png
```

Check:
1. **Target element** now measures the expected width.
2. **Other elements in the same render** have NOT changed width (no regression).
3. **TypeScript / lint** passes clean.

If regression detected (other element changed unexpectedly), re-diagnose — the fix was too broad.

---

### 6. Confirm and commit

Once measurements match expectations across all contexts:

```bash
# Type check
npx tsc --noEmit     # or your equivalent

# Commit with diagnosis in the message
git add <changed files>
git commit -m "Fix <element> width: <one-line root cause summary>"
```

## Reference: CSS width model quick card

```
display: inline-block + maxWidth
  → width = min(max-content width of children, maxWidth)
  → if children are block <div>s: max-content = widest individual div
  → if content is a single flowing text: max-content = text width (wraps at maxWidth)

display: block + maxWidth (in a block/flex context)
  → width = min(available width, maxWidth)
  → available width = flex container width (via align-items: stretch)
  → or: containing block width for block elements

maxWidth: '85%'
  → resolves relative to the CONTAINING BLOCK's width
  → containing block = nearest block/flex ancestor with explicit width
  → BUG: if two contexts have different containing block widths, '85%' resolves differently

CSS transform: scale(N) on a parent
  → does NOT affect layout dimensions
  → the scaled element still occupies its PRE-SCALE layout size
  → visual appearance is smaller/larger, but pixel measurements on the canvas
     will reflect the POST-SCALE visual, not the CSS layout size
```
