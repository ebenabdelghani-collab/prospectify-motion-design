import React from 'react';
import {AbsoluteFill, Audio, staticFile, useCurrentFrame} from 'remotion';
import {CameraMotionBlur} from '@remotion/motion-blur';
import {loadFinalFonts} from '../final/tokens';
import {Grain} from '../fx/camera';
import {P, loadGeist} from './fx';
import {Hook, Without} from './scenes/Without';
import {Turn, With} from './scenes/With';
import {CTA, Recap} from './scenes/End';

loadFinalFonts();
loadGeist();

/** SAME NIGHT — 16:9 acquisition film: the viewer's night without Prospectify, then the same night with it. */
const BLUR: [number, number][] = [
	[P.H_ZERO - 2, P.H_ZERO + 14],
	[P.W_MAPS - 6, P.W_MAPS + 12],
	[P.T_WITH - 6, P.T_WITH + 18],
	[P.F_IN - 4, P.F_IN + 18],
	[P.R_IN - 2, P.R_IN + 22],
	[P.TL_IN - 4, P.TL_IN + 22],
	[P.RC_IN, P.RC_IN + 22],
];
const inBlur = (f: number) => BLUR.some(([a, b]) => f >= a && f <= b);

const Scenes: React.FC = () => {
	const f = useCurrentFrame();
	return (
		<AbsoluteFill>
			<Hook f={f} />
			<Without f={f} />
			<Turn f={f} />
			<With f={f} />
			<Recap f={f} />
			<CTA f={f} />
		</AbsoluteFill>
	);
};

export const Versus: React.FC<{withAudio: boolean}> = ({withAudio}) => {
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
			<Grain f={f} opacity={0.045} />
			{withAudio && <Audio src={staticFile('versus/audio/versus-mix.wav')} />}
		</AbsoluteFill>
	);
};

export const VERSUS_DURATION = P.durationInFrames;
