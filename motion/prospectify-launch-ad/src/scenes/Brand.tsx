import React from 'react';
import {COLORS, EASE, FONTS} from '../constants/theme';
import {T} from '../constants/timeline';
import {COPY} from '../constants/copy';
import {Mark, MaskLine} from '../components/primitives';
import {lerp, ramp} from '../motion/anim';

// Lockup states
const BIG = {logo: 240, logoX: 540 - 120, logoY: 600, wordSize: 116, wordX: 540, wordY: 892, wordShift: -50};
const HEADER = {logo: 60, logoX: 90, logoY: 186, wordSize: 46, wordX: 168, wordY: 192, wordShift: 0};
const FINAL = {logo: 190, logoX: 540 - 95, logoY: 420};

export const HEADER_DOCKED = T.LOGO_TO_HEADER + 18;
const TO_FINAL_START = T.FINAL_BRAND - 2;

/**
 * One continuous brand object: reveals big (3.2s), docks into the header and
 * stays present through the product flow, then returns to centre for the end frame.
 */
export const Brand: React.FC<{f: number}> = ({f}) => {
	if (f < T.PROSPECTIFY_REVEAL) return null;

	const reveal = ramp(f, T.PROSPECTIFY_REVEAL, 18, EASE.snap);
	const dock = ramp(f, T.LOGO_TO_HEADER, 18, EASE.glide);
	const toFinal = ramp(f, TO_FINAL_START, 20, EASE.glide);

	let logo = lerp(BIG.logo, HEADER.logo, dock);
	let logoX = lerp(BIG.logoX, HEADER.logoX, dock);
	let logoY = lerp(BIG.logoY, HEADER.logoY, dock);
	if (toFinal > 0) {
		logo = lerp(HEADER.logo, FINAL.logo, toFinal);
		logoX = lerp(HEADER.logoX, FINAL.logoX, toFinal);
		logoY = lerp(HEADER.logoY, FINAL.logoY, toFinal);
	}
	const blur = (1 - reveal) * 22;
	const revealScale = lerp(0.86, 1, reveal);

	const wordOut = ramp(f, T.FINAL_BRAND - 14, 8, EASE.exit);

	// Header recedes slightly while the user is "in" the external builder.
	const inBuilder = ramp(f, T.BUILD_START, 10) * (1 - ramp(f, T.SELL_START, 10));
	const headerOpacity = 1 - inBuilder * 0.55;

	// One rare accent light — the reveal and the end frame only.
	const glow = Math.max(
		ramp(f, T.PROSPECTIFY_REVEAL, 14) * (1 - ramp(f, T.LOGO_TO_HEADER, 14)),
		ramp(f, T.FINAL_BRAND, 30),
	);

	return (
		<>
			<div
				style={{
					position: 'absolute',
					left: logoX + logo / 2 - 420,
					top: logoY + logo / 2 - 420,
					width: 840,
					height: 840,
					background: 'radial-gradient(circle, rgba(230,63,109,0.16) 0%, rgba(230,63,109,0.05) 35%, rgba(5,5,5,0) 65%)',
					opacity: glow,
				}}
			/>
			<div
				style={{
					position: 'absolute',
					left: logoX,
					top: logoY,
					opacity: reveal * (dock > 0 && toFinal === 0 ? headerOpacity : 1),
					transform: `scale(${revealScale})`,
					transformOrigin: '50% 50%',
					filter: blur > 0.3 ? `blur(${blur}px)` : undefined,
				}}
			>
				<Mark size={logo} />
			</div>
			{/* Big wordmark: exits through its mask before the logo travels (no collision). */}
			{f < T.LOGO_TO_HEADER + 10 && (
				<div style={{position: 'absolute', left: BIG.wordX, top: BIG.wordY, transform: 'translateX(-50%)', filter: blur > 0.3 ? `blur(${blur * 0.6}px)` : undefined}}>
					<MaskLine
						f={f}
						inAt={T.PROSPECTIFY_REVEAL + 4}
						outAt={T.LOGO_TO_HEADER - 2}
						text={COPY.wordmark}
						inDur={16}
						outDur={8}
						style={{fontSize: BIG.wordSize, fontWeight: 650, letterSpacing: '-0.045em', color: COLORS.text, lineHeight: 1}}
					/>
				</div>
			)}
			{/* Header wordmark: rises in once the logo has docked; exits before the logo returns to centre. */}
			{f >= HEADER_DOCKED - 6 && wordOut < 1 && (
				<div style={{position: 'absolute', left: HEADER.wordX, top: HEADER.wordY, opacity: headerOpacity}}>
					<MaskLine
						f={f}
						inAt={HEADER_DOCKED - 6}
						outAt={T.FINAL_BRAND - 14}
						text={COPY.wordmark}
						inDur={12}
						outDur={6}
						style={{fontSize: HEADER.wordSize, fontWeight: 650, letterSpacing: '-0.04em', color: COLORS.text, lineHeight: 1}}
					/>
				</div>
			)}
			{f < T.LOGO_TO_HEADER + 12 && (
				<div style={{position: 'absolute', left: 0, right: 0, top: 1030}}>
					<MaskLine
						f={f}
						inAt={T.REVEAL_TAGLINE}
						outAt={T.LOGO_TO_HEADER}
						text={COPY.revealTagline}
						align="center"
						style={{fontFamily: FONTS.sans, fontSize: 76, fontWeight: 600, letterSpacing: '-0.04em', color: COLORS.textDim, lineHeight: 1}}
					/>
				</div>
			)}
		</>
	);
};
