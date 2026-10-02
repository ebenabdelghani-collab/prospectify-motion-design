import React from 'react';
import {AbsoluteFill, Audio, staticFile, useCurrentFrame} from 'remotion';
import {COLORS} from '../constants/theme';
import {HeadlineTrack} from '../components/ui';
import {Hook} from '../scenes/Hook';
import {Pain} from '../scenes/Pain';
import {Insight} from '../scenes/Insight';
import {Brand} from '../scenes/Brand';
import {Product} from '../scenes/Product';
import {Builder} from '../scenes/Builder';
import {Sell} from '../scenes/Sell';
import {Final, Loop} from '../scenes/Final';
import {Grain, Vignette} from '../fx/camera';
import {T} from '../constants/timeline';
import {ramp} from '../motion/anim';

export type AdProps = {variant: 'organic' | 'paid'; withAudio: boolean};

export const MasterAd: React.FC<AdProps> = ({variant, withAudio}) => {
	const f = useCurrentFrame();
	return (
		<AbsoluteFill style={{background: COLORS.bg, overflow: 'hidden'}}>
			<AbsoluteFill style={{background: `radial-gradient(120% 60% at 50% 0%, ${COLORS.bgLift} 0%, rgba(5,5,5,0) 70%)`}} />
			<Hook f={f} />
			<Pain f={f} />
			<Insight f={f} />
			<Product f={f} />
			<Builder f={f} />
			<Sell f={f} />
			<Loop f={f} />
			{/* caption backdrop: zoomed content never fights the headline */}
			<AbsoluteFill style={{background: `linear-gradient(180deg, ${COLORS.bg} 0%, rgba(5,5,5,0.97) 25%, rgba(5,5,5,0.6) 31%, rgba(5,5,5,0) 37%)`, opacity: ramp(f, T.INSIGHT_Q, 10) * (1 - ramp(f, T.LOOP_IN, 10)) * (1 - ramp(f, T.SCALE_COLLAPSE, 8) * (1 - ramp(f, T.SEARCH_IN, 10))), pointerEvents: 'none'}} />
			<HeadlineTrack f={f} />
			<Brand f={f} />
			<Final f={f} variant={variant} />
			<Vignette strength={0.5} />
			<Grain f={f} />
			{withAudio && <Audio src={staticFile(`audio/mix-${variant}.wav`)} />}
		</AbsoluteFill>
	);
};
