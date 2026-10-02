import React from 'react';
import {AbsoluteFill, Audio, staticFile, useCurrentFrame} from 'remotion';
import {CameraMotionBlur} from '@remotion/motion-blur';
import {C, T, loadFinalFonts, ramp, win} from './tokens';
import {Grain, Vignette} from '../fx/camera';
import {AppHeader, DemoTag} from './kit/ui';
import {Hook} from './scenes/Hook';
import {Manual} from './scenes/Manual';
import {Insight} from './scenes/Insight';
import {Field} from './scenes/Field';
import {Search} from './scenes/Search';
import {Dossier} from './scenes/Dossier';
import {Builder} from './scenes/Builder';
import {Sell} from './scenes/Sell';
import {CTA, Loop} from './scenes/Finale';

loadFinalFonts();

export type FilmProps = {withAudio: boolean};

/** Shutter blur only where something genuinely moves fast; never on reading holds. */
const n = (k: string) => T[k] as unknown as number;
const arr = (k: string) => T[k] as unknown as number[];
const BLUR: [number, number][] = [
	[n('HOOK_SEND'), n('HOOK_SEND') + 24],
	[n('FIND_IN') - 6, n('FIND_IN') + 32],
	[n('MAN_IN') - 6, n('MAN_IN') + 14],
	// manual-hunt windows carry their own cheap per-element blur (Manual.tsx) — 12 heavy 3D layers
	[n('ZERO_OUT'), n('ZERO_OUT') + 22],
	[n('B_CENTER'), n('B_CENTER') + 30],
	[n('FIFTY_IN'), n('FIFTY_IN') + 40],
	[n('SURVIVOR_PUSH'), n('SCAN')],
	[n('LOGO_TO_HEADER'), n('LOGO_TO_HEADER') + 30],
	[n('RESULTS_SORT'), n('RESULTS_SORT') + 24],
	[n('LEAD_SELECT'), n('LEAD_SELECT') + 32],
	[n('PROMPT_EXPAND'), n('PROMPT_EXPAND') + 28],
	[n('BUILDER_IN'), n('BUILDER_IN') + 24],
	[n('TRANSFER_START'), n('TRANSFER_ARRIVE') + 24],
	[n('PITCH_IN'), n('PITCH_IN') + 32],
	[n('TRACK_IN'), n('TRACK_IN') + 24],
	[n('LOOP_OUT'), n('LOOP_OUT') + 22],
];
const inBlur = (f: number) => BLUR.some(([a, b]) => f >= a && f <= b);

const Scenes: React.FC = () => {
	const f = useCurrentFrame();
	const header = win(f, n('LOGO_TO_HEADER') + 24, n('LOOP_IN'), 6, 14);
	const demo = win(f, n('SEARCH_IN') + 20, n('LOOP_IN'), 12, 14);
	return (
		<AbsoluteFill>
			{/* the frame warms very slightly once Prospectify is on screen */}
			<AbsoluteFill style={{background: `radial-gradient(110% 60% at 50% 0%, rgba(255,255,255,0.035) 0%, rgba(255,255,255,0) 60%)`}} />
			<AbsoluteFill style={{background: `radial-gradient(90% 50% at 50% 110%, rgba(${C.accentRGB},0.07) 0%, rgba(${C.accentRGB},0) 70%)`, opacity: ramp(f, n('LOGO_RESOLVE'), 40) * (1 - ramp(f, n('LOOP_IN'), 30)) * 0.9}} />
			<Hook f={f} />
			<Manual f={f} />
			<Insight f={f} />
			<Field f={f} />
			<Search f={f} />
			<Dossier f={f} />
			<Builder f={f} />
			<Sell f={f} />
			<Loop f={f} />
			<CTA f={f} />
			<AppHeader o={header} />
			<DemoTag o={demo} />
		</AbsoluteFill>
	);
};

export const Film: React.FC<FilmProps> = ({withAudio}) => {
	const f = useCurrentFrame();
	return (
		<AbsoluteFill style={{background: C.bg, overflow: 'hidden'}}>
			{inBlur(f) ? (
				<CameraMotionBlur shutterAngle={180} samples={5}>
					<Scenes />
				</CameraMotionBlur>
			) : (
				<Scenes />
			)}
			<Vignette strength={0.42} />
			<Grain f={f} opacity={0.04} />
			{withAudio && <Audio src={staticFile('final/audio/prospectify-final-mix.wav')} />}
		</AbsoluteFill>
	);
};

export const FILM_DURATION = n('durationInFrames');
