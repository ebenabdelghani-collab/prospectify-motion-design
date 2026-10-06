import React from 'react';
import {AbsoluteFill, Audio, staticFile, useCurrentFrame} from 'remotion';
import {CameraMotionBlur} from '@remotion/motion-blur';
import {loadFinalFonts} from '../final/tokens';
import {Grain} from '../fx/camera';
import {Captions, P, loadGeist} from './fx';
import {CTA, Hook, Pain, Reveal, Steps} from './scenes';

loadFinalFonts();
loadGeist();

/**
 * THE LOOP — 16:9 retention cut (~35 s). Proof on frame 0, pain in four flashes, a numbered open loop
 * (1 find · 2 message · 3 prompt), word-by-word captions, and a last frame identical to frame 0.
 */
const BLUR: [number, number][] = [
	[P.PN_IN - 4, P.PN_IN + 12],
	[P.RV_IN - 4, P.RV_IN + 14],
	[P.N1_IN - 4, P.N1_IN + 16],
	[P.TL_IN - 4, P.TL_IN + 18],
	[P.CTA_IN - 4, P.CTA_IN + 14],
];
const inBlur = (f: number) => BLUR.some(([a, b]) => f >= a && f <= b);

const Scenes: React.FC = () => {
	const f = useCurrentFrame();
	return (
		<AbsoluteFill>
			<Hook f={f} />
			<Pain f={f} />
			<Reveal f={f} />
			<Steps f={f} />
			<CTA f={f} />
		</AbsoluteFill>
	);
};

export const Loop: React.FC<{withAudio: boolean}> = ({withAudio}) => {
	const f = useCurrentFrame();
	return (
		<AbsoluteFill style={{background: '#09090b', overflow: 'hidden'}}>
			{inBlur(f) ? (
				<CameraMotionBlur shutterAngle={180} samples={4}>
					<Scenes />
				</CameraMotionBlur>
			) : (
				<Scenes />
			)}
			<Captions f={f} />
			<Grain f={f} opacity={0.04} />
			{withAudio && <Audio src={staticFile('loop/audio/loop-mix.wav')} />}
		</AbsoluteFill>
	);
};

export const LOOP_DURATION = P.durationInFrames;
