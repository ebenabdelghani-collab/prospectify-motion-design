import React from 'react';
import {COLORS, EASE, FONTS} from '../constants/theme';
import {T} from '../constants/timeline';
import {COPY} from '../constants/copy';
import {Mark, MaskLine} from '../components/primitives';
import {lerp, ramp} from '../motion/anim';

const BIG = {logo: 260, logoX: 540 - 130, logoY: 560, wordSize: 120, wordX: 540, wordY: 870};
const HEADER = {logo: 60, logoX: 90, logoY: 186, wordSize: 46, wordX: 168, wordY: 192};
export const FINAL_LOGO = {logo: 200, logoX: 540 - 100, logoY: 400};

const DOCKED = T.LOGO_TO_HEADER + 18;
const TO_FINAL = T.FINAL_BRAND - 2;

/**
 * One continuous brand object: first appearance at 28s (earned), docks into the header,
 * stays present through the product, returns to centre for the end frame.
 */
export const Brand: React.FC<{f: number}> = ({f}) => {
	if (f < T.REVEAL) return null;

	const reveal = ramp(f, T.REVEAL, 20, EASE.snap);
	const dock = ramp(f, T.LOGO_TO_HEADER, 18, EASE.glide);
	const toFinal = ramp(f, TO_FINAL, 22, EASE.glide);

	let logo = lerp(BIG.logo, HEADER.logo, dock);
	let x = lerp(BIG.logoX, HEADER.logoX, dock);
	let y = lerp(BIG.logoY, HEADER.logoY, dock);
	if (toFinal > 0) {
		logo = lerp(HEADER.logo, FINAL_LOGO.logo, toFinal);
		x = lerp(HEADER.logoX, FINAL_LOGO.logoX, toFinal);
		y = lerp(HEADER.logoY, FINAL_LOGO.logoY, toFinal);
	}
	const blur = (1 - reveal) * 24;

	// Header recedes while the user is inside their external builder, and during the loop.
	const inBuilder = ramp(f, T.BUILD_START, 10) * (1 - ramp(f, T.PITCH_IN, 10));
	const inLoop = ramp(f, T.LOOP_IN, 10) * (1 - ramp(f, TO_FINAL, 6));
	const headerOpacity = 1 - Math.max(inBuilder * 0.6, inLoop * 0.6);
	const docked = dock > 0 && toFinal === 0;

	const glow = Math.max(ramp(f, T.REVEAL, 16) * (1 - ramp(f, T.LOGO_TO_HEADER, 14)), ramp(f, T.FINAL_BRAND, 30));

	return (
		<>
			<div
				style={{
					position: 'absolute',
					left: x + logo / 2 - 440,
					top: y + logo / 2 - 440,
					width: 880,
					height: 880,
					background: 'radial-gradient(circle, rgba(230,63,109,0.16) 0%, rgba(230,63,109,0.05) 35%, rgba(5,5,5,0) 65%)',
					opacity: glow,
				}}
			/>
			<div
				style={{
					position: 'absolute',
					left: x,
					top: y,
					opacity: reveal * (docked ? headerOpacity : 1),
					transform: `scale(${lerp(0.86, 1, reveal) * (1 + 0.05 * ramp(f, T.REVEAL + 20, T.LOGO_TO_HEADER - T.REVEAL - 20, EASE.linear) * (1 - dock))})`,
					filter: blur > 0.3 ? `blur(${blur}px)` : undefined,
				}}
			>
				<Mark size={logo} />
			</div>
			{f < T.LOGO_TO_HEADER + 10 && (
				<>
					<div style={{position: 'absolute', left: BIG.wordX, top: BIG.wordY, transform: 'translateX(-50%)', filter: blur > 0.3 ? `blur(${blur * 0.6}px)` : undefined}}>
						<MaskLine f={f} inAt={T.REVEAL + 5} outAt={T.LOGO_TO_HEADER - 2} text={COPY.wordmark} inDur={16} outDur={8} style={{fontSize: BIG.wordSize, fontWeight: 650, letterSpacing: '-0.045em', color: COLORS.text, lineHeight: 1}} />
					</div>
					<div style={{position: 'absolute', left: 0, right: 0, top: 1030}}>
						<MaskLine f={f} inAt={T.REVEAL_LINE} outAt={T.LOGO_TO_HEADER - 4} text={COPY.revealLine} align="center" style={{fontFamily: FONTS.sans, fontSize: 64, fontWeight: 600, letterSpacing: '-0.035em', color: COLORS.textDim, lineHeight: 1}} />
					</div>
				</>
			)}
			{f >= DOCKED - 6 && f < T.FINAL_BRAND - 4 && (
				<div style={{position: 'absolute', left: HEADER.wordX, top: HEADER.wordY, opacity: headerOpacity}}>
					<MaskLine f={f} inAt={DOCKED - 6} outAt={T.FINAL_BRAND - 14} text={COPY.wordmark} inDur={12} outDur={8} style={{fontSize: HEADER.wordSize, fontWeight: 650, letterSpacing: '-0.04em', color: COLORS.text, lineHeight: 1}} />
				</div>
			)}
		</>
	);
};
