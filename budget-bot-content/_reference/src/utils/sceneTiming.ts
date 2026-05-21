import { Scene, Scenario } from '../data/types';
import { FRAMES_PER_LINE_INSTANT, FRAMES_PER_LINE_USER } from '../config/constants';

export function computeSceneDuration(scene: Scene): number {
  if (scene.type === 'chat-list') return scene.duration;
  if (scene.type === 'quick-reply') return scene.duration;

  // conversation: sum message delays + reveal times + inter-message gaps + hold padding
  let cursor = 20;
  for (const msg of scene.messages) {
    const linesCount = msg.lines.filter((l) => l !== '').length;
    const revealFrames = msg.role === 'bot' ? FRAMES_PER_LINE_INSTANT : linesCount * FRAMES_PER_LINE_USER;
    cursor += msg.delayFrames + revealFrames + 20;
  }
  return cursor + 90;
}

export function computeTimeline(scenario: Scenario): Array<{ startFrame: number; duration: number }> {
  const timeline: Array<{ startFrame: number; duration: number }> = [];
  let cursor = 0;
  for (const scene of scenario.scenes) {
    const duration = computeSceneDuration(scene);
    timeline.push({ startFrame: cursor, duration });
    cursor += duration;
  }
  return timeline;
}

export function computeTotalDuration(scenario: Scenario): number {
  return scenario.scenes.reduce((sum, scene) => sum + computeSceneDuration(scene), 0) + 50;
}
