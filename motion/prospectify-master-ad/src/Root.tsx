import React from 'react';
import {Composition, staticFile} from 'remotion';
import {loadFont} from '@remotion/fonts';
import {MasterAd} from './composition/MasterAd';
import {DURATION, FPS, HEIGHT, WIDTH} from './constants/timeline';

loadFont({family: 'Geist', url: staticFile('fonts/Geist-Variable.woff2'), weight: '100 900'});
loadFont({family: 'GeistMono', url: staticFile('fonts/GeistMono-Variable.woff2'), weight: '100 900'});

// Designed on a 1080×1920 grid; the master is rendered at scale 2 → 2160×3840 (true vector 4K, not upscaled).
export const Root: React.FC = () => (
	<>
		<Composition id="ProspectifyMaster" component={MasterAd} durationInFrames={DURATION} fps={FPS} width={WIDTH} height={HEIGHT} defaultProps={{variant: 'organic' as const, withAudio: true}} />
		<Composition id="ProspectifyMasterPaid" component={MasterAd} durationInFrames={DURATION} fps={FPS} width={WIDTH} height={HEIGHT} defaultProps={{variant: 'paid' as const, withAudio: true}} />
	</>
);
