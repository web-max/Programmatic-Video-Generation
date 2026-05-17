import { useCurrentFrame } from 'remotion';

export function useTextReveal(
  text: string,
  startFrame: number,
  framesPerWord: number = 3
): string {
  const frame = useCurrentFrame();
  const elapsed = Math.max(0, frame - startFrame);
  const words = text.split(' ');
  const wordsVisible = Math.floor(elapsed / framesPerWord) + 1;
  return words.slice(0, wordsVisible).join(' ');
}

export function useLineReveal(
  lines: string[],
  startFrame: number,
  framesPerLine: number = 12
): number {
  const frame = useCurrentFrame();
  const elapsed = Math.max(0, frame - startFrame);
  return Math.min(lines.length, Math.floor(elapsed / framesPerLine) + 1);
}
