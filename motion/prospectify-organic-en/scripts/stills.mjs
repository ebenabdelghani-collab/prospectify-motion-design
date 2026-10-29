// node scripts/stills.mjs <outDir> frame1 frame2 ... | cue names (e.g. nosite+20)
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';
import fs from 'node:fs';
import path from 'node:path';
import {webpackOverride} from '../webpack-override.mjs';

const [outDir, ...specs] = process.argv.slice(2);
const TL = JSON.parse(fs.readFileSync('src/data/timeline.json', 'utf8'));
const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts'), webpackOverride});
const composition = await selectComposition({serveUrl, id: 'ProspectifyOrganicEN', inputProps: {withAudio: false}});
fs.mkdirSync(outDir, {recursive: true});
for (const s of specs) {
	const m = s.match(/^([A-Za-z0-9]+)?([+-]\d+)?$/);
	const frame = /^\d+$/.test(s) ? Number(s) : (TL.cues[m[1]] ?? 0) + Number(m[2] ?? 0);
	await renderStill({composition, serveUrl, frame: Math.max(0, Math.min(composition.durationInFrames - 1, frame)), output: `${outDir}/${s}.png`, inputProps: {withAudio: false}, scale: 0.5});
	console.log(s, frame);
}
