import React from 'react';
import {AbsoluteFill, Audio, staticFile, useCurrentFrame} from 'remotion';
import {COLORS} from '../constants/theme';
import {Hook} from '../scenes/Hook';
import {Chaos} from '../scenes/Chaos';
import {Brand} from '../scenes/Brand';
import {ProspectFlow} from '../scenes/ProspectFlow';
import {Builder} from '../scenes/Builder';
import {Final} from '../scenes/Final';

export type AdProps = {variant: 'organic' | 'paid'; withAudio: boolean};

export const ProspectifyAd: React.FC<AdProps> = ({variant, withAudio}) => {
	const f = useCurrentFrame();
	return (
		<AbsoluteFill style={{background: COLORS.bg, overflow: 'hidden'}}>
			{/* very soft top lift so black never reads as a dead screen */}
			<AbsoluteFill style={{background: `radial-gradient(120% 60% at 50% 0%, ${COLORS.bgLift} 0%, rgba(5,5,5,0) 70%)`}} />
			<Hook f={f} />
			<Chaos f={f} />
			<ProspectFlow f={f} />
			<Builder f={f} />
			<Brand f={f} />
			<Final f={f} variant={variant} />
			{withAudio && <Audio src={staticFile(`audio/mix-${variant}.wav`)} />}
		</AbsoluteFill>
	);
};
