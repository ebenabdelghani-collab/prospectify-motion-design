// Full render: node scripts/render.mjs [organic|paid|all]
import {bundle} from '@remotion/bundler';
import {renderMedia, selectComposition} from '@remotion/renderer';
import path from 'node:path';

const BROWSER = '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell';
const which = process.argv[2] ?? 'all';
const jobs = [
	{id: 'ProspectifyAd', variant: 'organic', out: 'renders/prospectify-ad-15s-1080x1920-60fps.mp4'},
	{id: 'ProspectifyAdPaid', variant: 'paid', out: 'renders/prospectify-ad-15s-1080x1920-60fps-paid.mp4'},
].filter((j) => which === 'all' || j.variant === which);

const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts')});
for (const job of jobs) {
	const inputProps = {variant: job.variant, withAudio: true};
	const composition = await selectComposition({serveUrl, id: job.id, inputProps, browserExecutable: BROWSER});
	let last = -1;
	await renderMedia({
		composition,
		serveUrl,
		inputProps,
		codec: 'h264',
		crf: 14,
		x264Preset: 'slow',
		pixelFormat: 'yuv420p',
		colorSpace: 'bt709',
		audioCodec: 'aac',
		audioBitrate: '320k',
		imageFormat: 'png',
		concurrency: 4,
		browserExecutable: BROWSER,
		outputLocation: job.out,
		onProgress: ({progress}) => {
			const p = Math.floor(progress * 10);
			if (p !== last) {
				last = p;
				console.log(job.variant, `${p * 10}%`);
			}
		},
	});
	console.log('done', job.out);
}
