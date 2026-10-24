import React from 'react';
import {Composition} from 'remotion';
import {MetaAd} from './compositions/MetaAd';
import TL from './data/timeline.json';

export const Root: React.FC = () => (
	<Composition id="ProspectifyMetaAdFR" component={MetaAd} durationInFrames={TL.durationInFrames} fps={TL.fps} width={1080} height={1920} defaultProps={{withAudio: true}} />
);
