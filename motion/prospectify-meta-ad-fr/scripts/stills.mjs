// node scripts/stills.mjs <outDir> <frame> [frame…] — images de contrôle (échelle 0,5 ; SCALE=1 pour la pleine résolution)
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';
import fs from 'node:fs';
import path from 'node:path';
import {webpackOverride} from '../webpack-override.mjs';

const BROWSER = process.env.BROWSER || '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell';
const [outDir, ...frames] = process.argv.slice(2);
fs.mkdirSync(outDir, {recursive: true});
const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts'), webpackOverride});
const inputProps = {withAudio: false};
const opts = fs.existsSync(BROWSER) ? {browserExecutable: BROWSER, chromiumOptions: {gl: 'angle'}} : {};
const composition = await selectComposition({serveUrl, id: 'ProspectifyMetaAdFR', inputProps, ...opts});
for (const fr of frames.map(Number)) {
	await renderStill({composition, serveUrl, frame: fr, inputProps, ...opts, output: path.join(outDir, `f${String(fr).padStart(4, '0')}.png`), scale: Number(process.env.SCALE || 0.5)});
}
console.log('stills', frames.length);
