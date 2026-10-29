// node scripts/preview.mjs <out.mp4> [scale] — silent preview (no audio mux)
import {bundle} from '@remotion/bundler';
import {renderMedia, selectComposition} from '@remotion/renderer';
import os from 'node:os';
import path from 'node:path';
import {webpackOverride} from '../webpack-override.mjs';

const [out, scale = '0.5'] = process.argv.slice(2);
const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts'), webpackOverride});
const inputProps = {withAudio: false};
const composition = await selectComposition({serveUrl, id: 'ProspectifyOrganicEN', inputProps});
let last = -1;
await renderMedia({composition, serveUrl, inputProps, codec: 'h264', crf: 23, scale: Number(scale), muted: true, imageFormat: 'jpeg',
	concurrency: Math.min(6, os.cpus().length), outputLocation: out,
	onProgress: ({progress}) => { const p = Math.floor(progress * 10); if (p !== last) { last = p; console.log(p * 10 + '%'); } }});
