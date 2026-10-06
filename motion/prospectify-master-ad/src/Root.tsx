import React from 'react';
import {Composition, staticFile} from 'remotion';
import {loadFont} from '@remotion/fonts';
import {MasterAd} from './composition/MasterAd';
import {Morph} from './morph/Morph';
import {StackCheck} from './stack-check/StackCheck';
import {Film, FILM_DURATION} from './final/Film';
import {Playbook, PLAYBOOK_DURATION} from './playbook/Playbook';
import {Versus, VERSUS_DURATION} from './versus/Versus';
import {Loop, LOOP_DURATION} from './loop/Loop';
import MB from './morph/beats.json';
import {DURATION, FPS, HEIGHT, WIDTH} from './constants/timeline';

loadFont({family: 'Geist', url: staticFile('fonts/Geist-Variable.woff2'), weight: '100 900'});
loadFont({family: 'InstrumentSerif', url: staticFile('fonts/InstrumentSerif-Italic.woff2'), style: 'italic', weight: '400'});
loadFont({family: 'GeistMono', url: staticFile('fonts/GeistMono-Variable.woff2'), weight: '100 900'});

// Designed on a 1080×1920 grid; the master is rendered at scale 2 → 2160×3840 (true vector 4K, not upscaled).
export const Root: React.FC = () => (
	<>
		<Composition id="ProspectifyMaster" component={MasterAd} durationInFrames={DURATION} fps={FPS} width={WIDTH} height={HEIGHT} defaultProps={{variant: 'organic' as const, withAudio: true}} />
		<Composition id="ProspectifyMasterPaid" component={MasterAd} durationInFrames={DURATION} fps={FPS} width={WIDTH} height={HEIGHT} defaultProps={{variant: 'paid' as const, withAudio: true}} />
		<Composition id="ProspectifyMorph" component={Morph} durationInFrames={MB.durationInFrames} fps={60} width={1080} height={1920} defaultProps={{variant: 'organic' as const, withAudio: true}} />
		<Composition id="ProspectifyMorphPaid" component={Morph} durationInFrames={MB.durationInFrames} fps={60} width={1080} height={1920} defaultProps={{variant: 'paid' as const, withAudio: true}} />
		<Composition id="ProspectifyFinal" component={Film} durationInFrames={FILM_DURATION} fps={60} width={1080} height={1920} defaultProps={{withAudio: true}} />
		<Composition id="ProspectifyLoop" component={Loop} durationInFrames={LOOP_DURATION} fps={60} width={1920} height={1080} defaultProps={{withAudio: false}} />
		<Composition id="ProspectifyVersus" component={Versus} durationInFrames={VERSUS_DURATION} fps={60} width={1920} height={1080} defaultProps={{withAudio: false}} />
		<Composition id="ProspectifyPlaybook" component={Playbook} durationInFrames={PLAYBOOK_DURATION} fps={60} width={1920} height={1080} defaultProps={{withAudio: true}} />
		<Composition id="StackCheck" component={StackCheck} durationInFrames={105} fps={60} width={1080} height={1920} />
	</>
);
