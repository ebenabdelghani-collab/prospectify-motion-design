// node scripts/final/render.mjs <scale 1|2> <out.mp4> [crf] [preset]
// Final film: picture rendered by Remotion (vector, frame-accurate) at 60 fps, then muxed with the
// mastered 48 kHz mix. scale 2 → 2160×3840 true 4K (re-rendered, not upscaled).
import {bundle} from '@remotion/bundler';
import {renderMedia, selectComposition} from '@remotion/renderer';
import {execFileSync} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import {webpackOverride} from '../../webpack-override.mjs';

const BROWSER = '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell';
const [scaleArg = '1', out = 'renders/final-draft.mp4', crfArg = '16', preset = 'medium'] = process.argv.slice(2);
const scale = Number(scaleArg);
const tmp = `${out}.video-only.mp4`;
const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts'), webpackOverride});
const inputProps = {withAudio: false};
const composition = await selectComposition({serveUrl, id: process.env.COMP || 'ProspectifyFinal', inputProps, browserExecutable: BROWSER, chromiumOptions: {gl: 'angle'}});
let last = -1;
const t0 = Date.now();
await renderMedia({
	composition,
	serveUrl,
	inputProps,
	codec: 'h264',
	crf: Number(crfArg),
	x264Preset: preset,
	pixelFormat: 'yuv420p',
	colorSpace: 'bt709',
	scale,
	imageFormat: 'jpeg',
	jpegQuality: 96,
	concurrency: Number(process.env.CONC || 4),
	timeoutInMilliseconds: 120000,
	muted: true,
	browserExecutable: BROWSER,
	chromiumOptions: {gl: 'angle'},
	outputLocation: tmp,
	onProgress: ({progress}) => {
		const p = Math.floor(progress * 50);
		if (p !== last) {
			last = p;
			console.log(`x${scale} ${p * 2}%  ${((Date.now() - t0) / 1000).toFixed(0)}s`);
		}
	},
});
const dur = (composition.durationInFrames / composition.fps).toFixed(6);
execFileSync('ffmpeg', ['-y', '-v', 'error', '-i', tmp, '-i', process.env.AUDIO || 'public/final/audio/prospectify-final-mix.wav', '-map', '0:v', '-map', '1:a', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '320k', '-ar', '48000', '-t', dur, '-movflags', '+faststart', out]);
fs.rmSync(tmp);
console.log('done', out, `${((Date.now() - t0) / 1000).toFixed(0)}s`);
