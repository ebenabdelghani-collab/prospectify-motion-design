// The organic film: white line art on the Prospectify dark, scenes keyed to the voice (timeline.json).
import React from 'react';
import {AbsoluteFill, Audio, staticFile, useCurrentFrame} from 'remotion';
import TL from './data/timeline.json';
import {BG, Defs, EASE, ip, p01} from './lib/kit';
import {Agencies, City, WebBiz, Why} from './scenes/Market';
import {Balance, Grind, Quit} from './scenes/Clients';
import {Comment, OutThere, Tool} from './scenes/Tool';
import {Street} from './scenes/Street';

const C = TL.cues as Record<string, number>;
const END = TL.durationInFrames;

type SceneFn = React.FC<{f: number; C: Record<string, number>}>;
// [component, starts on cue, ends on cue]; neighbours overlap by a short blur-dissolve.
const SCENES: [SceneFn, string, string | null][] = [
	[Street, 'S1', 'S4'],
	[City, 'S4', 'S5'],
	[WebBiz, 'S5', 'S7'],
	[Agencies, 'S7', 'S8'],
	[Why, 'S8', 'S9'],
	[Balance, 'S9', 'S10'],
	[Grind, 'S10', 'S11'],
	[Quit, 'S11', 'S12'],
	[Tool, 'S12', 'S13'],
	[OutThere, 'S13', 'S14'],
	[Comment, 'S14', null],
];
const IN = 14, OUT = 12;

const Dots: React.FC = () => (
	<svg width={1920} height={1080} style={{position: 'absolute'}}>
		<defs>
			<pattern id="dots" width={40} height={40} patternUnits="userSpaceOnUse">
				<circle cx={20} cy={20} r={1.3} fill="#ffffff" opacity={0.075} />
			</pattern>
			<radialGradient id="vig" cx="50%" cy="50%" r="75%">
				<stop offset="0.55" stopColor={BG} stopOpacity={0} />
				<stop offset="1" stopColor={BG} stopOpacity={0.9} />
			</radialGradient>
		</defs>
		<rect width={1920} height={1080} fill="url(#dots)" />
		<rect width={1920} height={1080} fill="url(#vig)" />
	</svg>
);

export const Film: React.FC<{withAudio?: boolean}> = ({withAudio = true}) => {
	const f = useCurrentFrame();
	return (
		<AbsoluteFill style={{background: BG}}>
			<Dots />
			{SCENES.map(([S, a, b], i) => {
				const t0 = i === 0 ? -100 : C[a] - 4;
				const t1 = b ? C[b] - 2 : END + 100;
				if (f < t0 - 2 || f > t1 + OUT + 2) return null;
				const kin = i === 0 ? 1 : p01(f, t0, IN);
				const kout = b ? p01(f, t1, OUT, EASE) : 0;
				const o = kin * (1 - kout);
				const s = (0.965 + 0.035 * kin) * (1 + 0.06 * kout);
				const blur = (1 - kin) * 10 + kout * 12;
				// slow push-in for the life of the scene (the reference never holds still)
				const push = ip(f, [t0, t1 + OUT], [1, 1.035], (x) => x);
				return (
					<AbsoluteFill key={a} style={{opacity: o, filter: blur > 0.05 ? `blur(${blur}px)` : undefined, scale: String(s * push)}}>
						<svg width={1920} height={1080} viewBox="0 0 1920 1080" style={{filter: 'drop-shadow(0 0 7px rgba(255,255,255,0.28))'}}>
							<Defs />
							<S f={f} C={C} />
						</svg>
					</AbsoluteFill>
				);
			})}
			{withAudio ? <Audio src={staticFile('audio/mix.wav')} /> : null}
		</AbsoluteFill>
	);
};
