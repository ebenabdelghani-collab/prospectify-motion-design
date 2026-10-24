import React from 'react';
import {AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {lerp, ramp} from '../animations/ease';
import {AnimatedText} from '../components/AnimatedText';
import {Background} from '../components/Basics';
import {SubtitleRenderer} from '../components/SubtitleRenderer';
import {CTAEndCard, DemoScene, HookScene, MORPH, ProblemScene, SearchAnimation} from '../scenes/Scenes';
import {TL, loadFonts} from '../styles/tokens';

loadFonts();

/**
 * PROSPECTIFY — publicité Meta FR (1080 × 1920, 30 fps, ~29,5 s).
 * Tous les repères viennent de la voix réelle (src/data/timeline.json) : l'image suit la voix.
 * Les scènes reçoivent l'image globale ; les <Sequence> ne servent qu'à monter/démonter chaque scène.
 */
export const MetaAd: React.FC<{withAudio: boolean}> = ({withAudio}) => {
	const f = useCurrentFrame();
	const D = TL.durationInFrames;
	const heat = lerp(0.85, 1.25, ramp(f, TL.DIX - 6, 20));
	return (
		<AbsoluteFill style={{overflow: 'hidden'}}>
			<Background f={f} heat={heat} />
			<Sequence from={0} durationInFrames={TL.PROB + 8} layout="none">
				<HookScene f={f} />
			</Sequence>
			<Sequence from={TL.PROB - 4} durationInFrames={TL.REGARDE - TL.PROB + 12} layout="none">
				<ProblemScene f={f} />
			</Sequence>
			<Sequence from={TL.REGARDE - 4} durationInFrames={MORPH - TL.REGARDE + 16} layout="none">
				<SearchAnimation f={f} />
			</Sequence>
			<Sequence from={MORPH} durationInFrames={TL.TROUVE - MORPH + 12} layout="none">
				<DemoScene f={f} />
			</Sequence>
			<Sequence from={TL.TROUVE - 6} durationInFrames={D - TL.TROUVE + 6} layout="none">
				<CTAEndCard f={f} />
			</Sequence>
			<AnimatedText f={f} />
			<SubtitleRenderer f={f} />
			{withAudio && <Audio src={staticFile('audio/mix.wav')} />}
		</AbsoluteFill>
	);
};
