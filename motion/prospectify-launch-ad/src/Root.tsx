import React from 'react';
import {Composition, staticFile} from 'remotion';
import {loadFont} from '@remotion/fonts';
import {ProspectifyAd} from './compositions/ProspectifyAd';
import {DURATION, FPS, HEIGHT, WIDTH} from './constants/timeline';

loadFont({family: 'Geist', url: staticFile('fonts/Geist-Variable.woff2'), weight: '100 900'});
loadFont({family: 'GeistMono', url: staticFile('fonts/GeistMono-Variable.woff2'), weight: '100 900'});

export const Root: React.FC = () => (
	<>
		<Composition
			id="ProspectifyAd"
			component={ProspectifyAd}
			durationInFrames={DURATION}
			fps={FPS}
			width={WIDTH}
			height={HEIGHT}
			defaultProps={{variant: 'organic' as const, withAudio: true}}
		/>
		<Composition
			id="ProspectifyAdPaid"
			component={ProspectifyAd}
			durationInFrames={DURATION}
			fps={FPS}
			width={WIDTH}
			height={HEIGHT}
			defaultProps={{variant: 'paid' as const, withAudio: true}}
		/>
	</>
);
