// Per-frame render cost probe: node scripts/final/timing.mjs <frames…> (writes to renders/_timing.png)
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';
import path from 'node:path';
import {webpackOverride} from '../../webpack-override.mjs';

const BROWSER = '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell';
const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts'), webpackOverride});
const inputProps = {withAudio: false};
const composition = await selectComposition({serveUrl, id: 'ProspectifyFinal', inputProps, browserExecutable: BROWSER, chromiumOptions: {gl: 'angle'}});
const scale = Number(process.env.SCALE ?? 1);
for (const frame of process.argv.slice(2).map(Number)) {
	const t = Date.now();
	await renderStill({composition, serveUrl, frame, inputProps, browserExecutable: BROWSER, chromiumOptions: {gl: 'angle'}, output: 'renders/_timing.png', scale});
	console.log(frame, Date.now() - t, 'ms');
}
