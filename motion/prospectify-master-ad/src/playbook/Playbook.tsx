import React from 'react';
import {AbsoluteFill, Audio, staticFile, useCurrentFrame} from 'remotion';
import {CameraMotionBlur} from '@remotion/motion-blur';
import {loadFinalFonts} from '../final/tokens';
import {Grain} from '../fx/camera';
import {P, loadPlaybookFonts} from './fx';
import {Night} from './scenes/Night';
import {Day} from './scenes/Day';

loadFinalFonts();
loadPlaybookFonts();

/** THE PLAYBOOK — 16:9 acquisition film (1920×1080 @ 60 fps; 4K via scale 2). */
const BLUR: [number, number][] = [
	[P.BUILD_IN, P.BUILD_IN + 26],
	[P.SEARCH_IN, P.SEARCH_IN + 22],
	[P.TABS_OUT, P.TABS_OUT + 18],
	[P.SPLAT, P.SPLAT + 26],
	[P.PB_STEPS[0] - 4, P.PB_STEPS[0] + 26],
	[P.STEP2 - 4, P.STEP2 + 20],
	[P.STEP3 - 4, P.STEP3 + 20],
	[P.STEP4 - 4, P.STEP4 + 20],
	[P.MERGE, P.MERGE + 26],
	[P.TAG1, P.TAG1 + 30],
];
const inBlur = (f: number) => BLUR.some(([a, b]) => f >= a && f <= b);

const Scenes: React.FC = () => {
	const f = useCurrentFrame();
	return (
		<AbsoluteFill>
			<Night f={f} />
			<Day f={f} />
		</AbsoluteFill>
	);
};

export const Playbook: React.FC<{withAudio: boolean}> = ({withAudio}) => {
	const f = useCurrentFrame();
	return (
		<AbsoluteFill style={{background: '#09080d', overflow: 'hidden'}}>
			{inBlur(f) ? (
				<CameraMotionBlur shutterAngle={180} samples={5}>
					<Scenes />
				</CameraMotionBlur>
			) : (
				<Scenes />
			)}
			<Grain f={f} opacity={0.05} />
			{withAudio && <Audio src={staticFile('playbook/audio/playbook-mix.wav')} />}
		</AbsoluteFill>
	);
};

export const PLAYBOOK_DURATION = P.durationInFrames;
