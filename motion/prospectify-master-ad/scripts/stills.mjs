// Render inspection stills: node scripts/stills.mjs 0 20 120 ...
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';
import path from 'node:path';

const BROWSER = '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell';
const frames = process.argv.slice(2).map(Number);
const outDir = process.env.OUT ?? 'renders/stills';
const id = process.env.COMP ?? 'ProspectifyMaster';
const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts')});
const inputProps = {variant: id === 'ProspectifyMasterPaid' ? 'paid' : 'organic', withAudio: false};
const composition = await selectComposition({serveUrl, id, inputProps, browserExecutable: BROWSER});
for (const frame of frames) {
	await renderStill({composition, serveUrl, frame, inputProps, browserExecutable: BROWSER, output: `${outDir}/f${String(frame).padStart(3, '0')}.png`, scale: 0.5});
	console.log('frame', frame);
}
