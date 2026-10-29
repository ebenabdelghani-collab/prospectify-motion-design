// node scripts/render.mjs <out.mp4> [scale] [crf]
// Image : Remotion (vectoriel, déterministe) en H.264, puis multiplexage avec le mix 48 kHz en AAC.
import {bundle} from '@remotion/bundler';
import {renderMedia, selectComposition} from '@remotion/renderer';
import {execFileSync} from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {webpackOverride} from '../webpack-override.mjs';

const BROWSER = process.env.BROWSER || '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell';
const [out = 'exports/prospectify_organic_en_v1.mp4', scaleArg = '1', crf = '16'] = process.argv.slice(2);
const tmp = `${out}.video-only.mp4`;
const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts'), webpackOverride});
const inputProps = {withAudio: false};
const opts = fs.existsSync(BROWSER) ? {browserExecutable: BROWSER, chromiumOptions: {gl: 'angle'}} : {};
const composition = await selectComposition({serveUrl, id: 'ProspectifyOrganicEN', inputProps, ...opts});
const t0 = Date.now();
let last = -1;
await renderMedia({
	composition, serveUrl, inputProps, ...opts,
	codec: 'h264', crf: Number(crf), x264Preset: 'medium', pixelFormat: 'yuv420p', colorSpace: 'bt709',
	scale: Number(scaleArg), imageFormat: 'jpeg', jpegQuality: 96, muted: true,
	concurrency: Math.min(4, os.cpus().length), timeoutInMilliseconds: 120000, outputLocation: tmp,
	onProgress: ({progress}) => {
		const p = Math.floor(progress * 20);
		if (p !== last) { last = p; console.log(`${p * 5}%  ${((Date.now() - t0) / 1000).toFixed(0)}s`); }
	},
});
const dur = (composition.durationInFrames / composition.fps).toFixed(6);
execFileSync('ffmpeg', ['-y', '-v', 'error', '-i', tmp, '-i', 'public/audio/mix.wav', '-map', '0:v', '-map', '1:a', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '256k', '-ar', '48000', '-t', dur, '-movflags', '+faststart', out]);
fs.rmSync(tmp);
console.log('done', out, `${((Date.now() - t0) / 1000).toFixed(0)}s`);
