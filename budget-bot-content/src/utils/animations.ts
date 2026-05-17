import { interpolate } from 'remotion';
import { EXIT_FADE_FRAMES } from '../config/constants';

/**
 * Single shared spring config for all enter animations
 * (bubble pop-in, screen slide-in, list item stagger).
 */
export const ENTER_SPRING = { damping: 20, stiffness: 200, mass: 0.8 } as const;

/**
 * Returns a 0→1 progress value representing how far into an exit fade we are.
 * 0 = fade not started; 1 = fully faded out.
 * Combine with interpolate(result, [0,1], [1,0]) to get a visible-opacity value.
 */
export function makeExitFade(
  frame: number,
  exitFrame: number,
  fadeDuration: number = EXIT_FADE_FRAMES,
): number {
  return interpolate(frame, [exitFrame, exitFrame + fadeDuration], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
}
