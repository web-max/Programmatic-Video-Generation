/** Ratio to scale 1536px-wide design templates down to the 1080px render width. */
export const SCALE = 1080 / 1536;

/** Full design width used by all WhatsApp UI components before scaling. */
export const DESIGN_WIDTH = 1536;

/** Height of the WhatsApp chat header at full design width (before SCALE). */
export const HEADER_DESIGN_HEIGHT = 231;

/** Rendered pixel height of the composer wrapper after scale is applied. */
export const COMPOSER_RENDERED_HEIGHT = 168;

/** Duration in frames for the standard exit-fade transition (used by all scenes). */
export const EXIT_FADE_FRAMES = 12;

/**
 * framesPerLine controls the speed of line-by-line text reveal in ChatBubble.
 * INSTANT = 0  → all lines appear at once (bot messages in Act 2)
 * USER    = 10 → natural typing pace for user messages in conversation
 * SCENE   = 8  → slightly faster for brief resolution scenes (Act 3)
 * DEFAULT = 12 → fallback when no override is supplied
 */
export const FRAMES_PER_LINE_INSTANT = 0;
export const FRAMES_PER_LINE_USER    = 10;
export const FRAMES_PER_LINE_SCENE   = 8;
export const FRAMES_PER_LINE_DEFAULT = 12;
