// node scripts/render.mjs <organic|paid> <scale 1|2> <out.mp4> [crf]
// Renders picture with Remotion (vector, frame-accurate), then muxes the mastered 48 kHz WAV.
import {bundle} from '@remotion/bundler';
import {renderMedia, selectComposition} from '@remotion/renderer';
import {execFileSync} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const BROWSER = '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell';
const [variant = 'organic', scaleArg = '2', out = 'renders/prospectify-master-4k60.mp4', crfArg = '12'] = process.argv.slice(2);
const scale = Number(scaleArg);
const id = variant === 'paid' ? 'ProspectifyMasterPaid' : 'ProspectifyMaster';
const tmp = `renders/_video-${variant}-${scale}.mp4`;

const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts')});
const inputProps = {variant, withAudio: false};
const composition = await selectComposition({serveUrl, id, inputProps, browserExecutable: BROWSER, chromiumOptions: {gl: 'angle'}});
let last = -1;
const t0 = Date.now();
await renderMedia({
	composition,
	serveUrl,
	inputProps,
	codec: 'h264',
	crf: Number(crfArg),
	x264Preset: scale > 1 ? 'medium' : 'slow',
	pixelFormat: 'yuv420p',
	colorSpace: 'bt709',
	scale,
	imageFormat: 'jpeg',
	jpegQuality: 98,
	concurrency: 4,
	muted: true,
	browserExecutable: BROWSER,
	chromiumOptions: {gl: 'angle'},
	outputLocation: tmp,
	onProgress: ({progress}) => {
		const p = Math.floor(progress * 20);
		if (p !== last) {
			last = p;
			console.log(`${variant} x${scale} ${p * 5}%  ${((Date.now() - t0) / 1000).toFixed(0)}s`);
		}
	},
});
const dur = (composition.durationInFrames / composition.fps).toFixed(6);
execFileSync('ffmpeg', ['-y', '-v', 'error', '-i', tmp, '-i', `public/audio/mix-${variant}.wav`, '-map', '0:v', '-map', '1:a', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '320k', '-ar', '48000', '-t', dur, '-movflags', '+faststart', out]);
fs.rmSync(tmp);
console.log('done', out);
