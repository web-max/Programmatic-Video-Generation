/**
 * Render script — called via: npx ts-node renderVideo.ts
 * Or simply use: npx remotion render src/index.ts BudgetBotVideo --output out/video.mp4
 */
import { execSync } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';

const outDir = path.join(__dirname, 'out');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

const cmd = [
  'npx remotion render',
  'src/index.ts',
  'BudgetBotVideo',
  '--output out/video.mp4',
].join(' ');

console.log(`Running: ${cmd}`);
execSync(cmd, { stdio: 'inherit', cwd: __dirname });
console.log('\nDone! Video saved to out/video.mp4');
