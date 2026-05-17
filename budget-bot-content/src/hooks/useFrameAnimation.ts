import { useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { ENTER_SPRING } from '../utils/animations';

interface EnterAnimationResult {
  /** Pop-in scale: animates from 0.88 → 1. */
  scale: number;
  /** Fade-in opacity: animates from 0 → 1. */
  opacity: number;
  /** Horizontal slide-in offset in px, animating from slideX → 0. */
  translateX: number;
}

/**
 * Spring-based enter animation starting at startFrame.
 * Uses the shared ENTER_SPRING config so all scenes feel consistent.
 *
 * @param startFrame - frame at which the animation begins
 * @param slideX - initial horizontal offset in px (positive = slides in from right)
 */
export function useEnterAnimation(
  startFrame: number,
  slideX: number = 0,
): EnterAnimationResult {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = spring({
    frame: frame - startFrame,
    fps,
    config: ENTER_SPRING,
  });

  return {
    scale:      interpolate(progress, [0, 1], [0.88, 1]),
    opacity:    interpolate(progress, [0, 1], [0, 1]),
    translateX: interpolate(progress, [0, 1], [slideX, 0]),
  };
}
