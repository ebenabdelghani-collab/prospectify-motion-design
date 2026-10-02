import React from 'react';
import {AbsoluteFill, Audio, staticFile, useCurrentFrame} from 'remotion';
import {CameraMotionBlur} from '@remotion/motion-blur';
import {COLORS} from '../constants/theme';
import {HeadlineTrack} from '../components/ui';
import {Hook} from '../scenes/Hook';
import {Pain} from '../scenes/Pain';
import {Insight} from '../scenes/Insight';
import {Brand} from '../scenes/Brand';
import {Product} from '../scenes/Product';
import {Builder} from '../scenes/Builder';
import {Sell} from '../scenes/Sell';
import {Final, Loop} from '../scenes/Final';
import {Grain, Vignette} from '../fx/camera';
import {Bloom, LightStreaks, pulse} from '../fx/morphkit';
import {T} from '../constants/timeline';
import {ramp} from '../motion/anim';

export type AdProps = {variant: 'organic' | 'paid'; withAudio: boolean};

// Real multi-sample (shutter) motion blur on every fast move. 3D WebGL windows are excluded.
const W = (a: number, b: number): [number, number] => [a, b];
const BLUR: [number, number][] = [
	W(T.BUILD_ENTER - 12, T.BUILD_ENTER + 20),
	W(T.HOOK_CLEAR - 14, T.HOOK_CLEAR + 10),
	W(T.CLOCK_IN - 8, T.CLOCK_IN + 14),
	W(T.PAIN_START - 2, T.PAIN_START + 20),
	...T.PAIN_CUTS.slice(1).map((c) => W(c - 12, c + 14)),
	W(T.WORTH_START - 2, T.WORTH_START + 36),
	W(T.ZERO_IN - 10, T.ZERO_IN + 8),
	W(T.PICK_B - 4, T.PICK_B + 18),
	W(T.LEAD_SELECTED - 4, T.FILE_OPEN + 6),
	W(T.NEXT_HEADLINE - 10, T.NEXT_HEADLINE + 14),
	W(T.CONTACT_READY - 8, T.CONTACT_READY + 4),
	W(T.ANGLE_READY - 8, T.ANGLE_READY + 4),
	W(T.OUTREACH_TYPE[0] - 12, T.OUTREACH_TYPE[0] + 10),
	W(T.PROMPT_CLICK - 4, T.PROMPT_FOLD + 24),
	W(T.PROMPT_READY - 2, T.PROMPT_READY + 14),
	W(T.PROMPT_COMPRESS - 2, T.PROMPT_COMPRESS + 20),
	W(T.BUILDER_SELECTED - 4, T.BUILD_START + 18),
	W(T.PITCH_IN - 6, T.PITCH_IN + 22),
	W(T.SELL_IN - 2, T.SELL_IN + 16),
	W(T.SAVE_CLICK - 4, T.SOLD - 1),
	...T.LOOP_WORDS.map((w) => W(w - 2, w + 16)),
	W(T.LOOP_REPEAT - 2, T.LOOP_REPEAT + 16),
	W(T.LOOP_OUT - 10, T.FINAL_BRAND + 26),
	W(T.FINAL_LINE_2 - 2, T.FINAL_LINE_2 + 40),
	W(T.FINAL_CTA - 2, T.FINAL_CTA + 34),
];
const NO_BLUR: [number, number][] = [
	[T.FIFTY_IN, T.REVEAL + 4],
	[T.SOLD, T.SOLD + 60],
];
const inBlur = (f: number) => BLUR.some(([a, b]) => f >= a && f <= b) && !NO_BLUR.some(([a, b]) => f >= a && f <= b);

const PROMPT_TO_BUILDER = [
	{d: 'M 540 830 C 460 950, 300 1050, 190 1180', w: 9},
	{d: 'M 600 860 C 520 1000, 360 1120, 210 1170', w: 6, delay: 2},
	{d: 'M 480 800 C 380 900, 260 1020, 175 1190', w: 4, delay: 4},
];
const INTO_LOGO = [
	{d: 'M -200 1500 C 100 1100, 350 700, 540 500', w: 8},
	{d: 'M 1280 1450 C 980 1050, 720 700, 540 500', w: 7, delay: 3},
	{d: 'M 1300 200 C 1000 350, 760 450, 540 500', w: 5, delay: 6},
	{d: 'M -220 260 C 100 360, 330 460, 540 500', w: 4, delay: 8},
];

const Scenes: React.FC<{variant: 'organic' | 'paid'}> = ({variant}) => {
	const f = useCurrentFrame();
	return (
		<AbsoluteFill>
			<AbsoluteFill style={{background: `radial-gradient(120% 60% at 50% 0%, ${COLORS.bgLift} 0%, rgba(5,5,5,0) 70%)`}} />
			{/* light: breathes on every payoff beat */}
			<Bloom x={540} y={1010} r={700} o={pulse(f, T.PROMPT_READY, 50) * 0.75} />
			<Bloom x={190} y={1180} r={420} o={pulse(f, T.BUILDER_SELECTED, 30) * 0.8} />
			<Bloom x={540} y={1000} r={600} o={pulse(f, T.SITE_READY, 40) * 0.5} color="120,160,255" />
			<Bloom x={540} y={960} r={640} o={pulse(f, T.LOOP_REPEAT, 50) * 0.7} />
			<Hook f={f} />
			<Pain f={f} />
			<Insight f={f} />
			<Product f={f} />
			<Builder f={f} />
			<Sell f={f} />
			<Loop f={f} />
			<LightStreaks f={f} start={T.PROMPT_SEND - 2} paths={PROMPT_TO_BUILDER} dur={14} id="p2b" />
			<LightStreaks f={f} start={T.FINAL_BRAND - 18} paths={INTO_LOGO} dur={20} id="logo" />
			<Bloom x={540} y={500} r={520} o={pulse(f, T.FINAL_BRAND + 4, 40) * 0.9} />
			{/* caption backdrop: zoomed content never fights the headline */}
			<AbsoluteFill style={{background: `linear-gradient(180deg, ${COLORS.bg} 0%, rgba(5,5,5,0.97) 25%, rgba(5,5,5,0.6) 31%, rgba(5,5,5,0) 37%)`, opacity: ramp(f, T.INSIGHT_Q, 10) * (1 - ramp(f, T.LOOP_IN, 10)) * (1 - ramp(f, T.SCALE_COLLAPSE, 8) * (1 - ramp(f, T.SEARCH_IN, 10))), pointerEvents: 'none'}} />
			<HeadlineTrack f={f} />
			<Brand f={f} />
			<Final f={f} variant={variant} />
		</AbsoluteFill>
	);
};

export const MasterAd: React.FC<AdProps> = ({variant, withAudio}) => {
	const f = useCurrentFrame();
	return (
		<AbsoluteFill style={{background: COLORS.bg, overflow: 'hidden'}}>
			{inBlur(f) ? (
				<CameraMotionBlur shutterAngle={180} samples={6}>
					<Scenes variant={variant} />
				</CameraMotionBlur>
			) : (
				<Scenes variant={variant} />
			)}
			<Vignette strength={0.5} />
			<Grain f={f} />
			{withAudio && <Audio src={staticFile(`audio/mix-${variant}.wav`)} />}
		</AbsoluteFill>
	);
};
