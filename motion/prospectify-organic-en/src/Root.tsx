import React from 'react';
import {Composition, continueRender, delayRender, staticFile} from 'remotion';
import {Film} from './Film';
import TL from './data/timeline.json';

const font = new FontFace('Jakarta', `url(${staticFile('fonts/PlusJakartaSans-Variable.woff2')}) format('woff2')`, {weight: '200 800'});
const h = delayRender('font');
font.load().then((ff) => { document.fonts.add(ff); continueRender(h); });

export const Root: React.FC = () => (
	<Composition id="ProspectifyOrganicEN" component={Film} durationInFrames={TL.durationInFrames} fps={TL.fps} width={1920} height={1080} defaultProps={{withAudio: false}} />
);
