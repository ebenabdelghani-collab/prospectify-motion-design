import React from 'react';
import {COLORS, EASE, FONTS} from '../constants/theme';
import {T} from '../constants/timeline';
import {COPY} from '../constants/copy';
import {MaskLine} from '../components/primitives';
import {lerp, ramp} from '../motion/anim';

/** 13.6–15.0s — positioning line, CTA, URL. The logo itself is the Brand object returning to centre. */
export const Final: React.FC<{f: number; variant: 'organic' | 'paid'}> = ({f, variant}) => {
	if (f < T.FINAL_BRAND) return null;
	const cta = ramp(f, T.FINAL_CTA, 16, EASE.snap);
	const sheen = ramp(f, T.FINAL_CTA + 10, 26, EASE.glide);
	const paid = variant === 'paid';
	return (
		<>
			<div style={{position: 'absolute', left: 0, right: 0, top: 610}}>
				<MaskLine f={f} inAt={T.FINAL_LINE_1} align="center" text={COPY.finalLine1} style={{fontSize: 66, fontWeight: 560, letterSpacing: '-0.035em', color: COLORS.textDim, lineHeight: 1.05}} />
				<div style={{height: 22}} />
				<MaskLine f={f} inAt={T.FINAL_LINE_2} align="center" text={COPY.finalLine2[0]} style={{fontSize: 96, fontWeight: 680, letterSpacing: '-0.05em', color: COLORS.text, lineHeight: 1.0}} />
				<MaskLine f={f} inAt={T.FINAL_LINE_2 + 4} align="center" text={COPY.finalLine2[1]} style={{fontSize: 96, fontWeight: 680, letterSpacing: '-0.05em', color: COLORS.text, lineHeight: 1.0}} />
			</div>
			<div
				style={{
					position: 'absolute',
					left: 540 - 290,
					top: 1040 + (1 - cta) * 40,
					width: 580,
					height: 136,
					borderRadius: 26,
					background: COLORS.logoGradient,
					opacity: cta,
					transform: `scale(${lerp(0.94, 1, cta)})`,
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					gap: 20,
					overflow: 'hidden',
					boxShadow: `0 24px 80px rgba(230,63,109,${0.28 * cta})`,
				}}
			>
				<div style={{position: 'absolute', top: 0, bottom: 0, width: 140, left: lerp(-200, 640, sheen), background: 'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.28) 50%, rgba(255,255,255,0) 100%)', transform: 'skewX(-18deg)'}} />
				<div style={{fontFamily: FONTS.sans, fontSize: 54, fontWeight: 660, letterSpacing: '-0.035em', color: '#FFFFFF'}}>{COPY.cta}</div>
				<svg width={44} height={44} viewBox="0 0 24 24">
					<path d="M5 12h14M13 6l6 6-6 6" fill="none" stroke="#fff" strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" />
				</svg>
			</div>
			{paid && (
				<div style={{position: 'absolute', left: 0, right: 0, top: 1206}}>
					<MaskLine f={f} inAt={T.FINAL_CTA + 6} align="center" text={COPY.paidOffer} style={{fontSize: 36, fontWeight: 560, letterSpacing: '-0.02em', color: COLORS.text, lineHeight: 1.1}} />
				</div>
			)}
			<div style={{position: 'absolute', left: 0, right: 0, top: paid ? 1268 : 1222}}>
				<MaskLine f={f} inAt={T.FINAL_URL} align="center" text={COPY.url} style={{fontFamily: FONTS.sans, fontSize: 40, fontWeight: 500, letterSpacing: '-0.01em', color: COLORS.textDim, lineHeight: 1.1}} />
			</div>
		</>
	);
};
