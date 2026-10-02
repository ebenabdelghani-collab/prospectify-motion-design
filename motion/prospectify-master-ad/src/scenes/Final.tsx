import React from 'react';
import {COLORS, EASE, FONTS} from '../constants/theme';
import {T} from '../constants/timeline';
import {COPY} from '../constants/copy';
import {MaskLine} from '../components/primitives';
import {lineScale} from '../components/ui';
import {lerp, ramp} from '../motion/anim';
import {LEAD} from '../constants/demoData';
import {ClientSite} from '../components/ui';
import {Phone} from './pain/screens';
import {MapScreen} from './pain/screens';

/** 56.5–60.5s: the whole loop in four words. Then Repeat. */
export const Loop: React.FC<{f: number}> = ({f}) => {
	if (f < T.LOOP_IN || f > T.LOOP_OUT + 2) return null;
	const out = lineScale(f, T.LOOP_OUT - 8);
	const rep = ramp(f, T.LOOP_REPEAT, 16, EASE.snap);
	const spin = ramp(f, T.LOOP_REPEAT, 40, EASE.glide);
	const active = T.LOOP_WORDS.filter((w) => w <= f).length - 1;
	const word = Math.max(0, active);
	const wStart = T.LOOP_WORDS[word] ?? T.LOOP_IN;
	const punch = ramp(f, wStart, 14, EASE.snap);
	const bgOn = f >= T.LOOP_WORDS[0] && f < T.LOOP_REPEAT + 4;
	const BG = [
		// Find
		<div key="find" style={{position: 'absolute', left: 240, top: 340}}>
			<Phone>
				<MapScreen lf={40} />
			</Phone>
		</div>,
		// Pitch
		<div key="pitch" style={{position: 'absolute', left: 90, top: 640, width: 900, padding: 50, borderRadius: 28, background: COLORS.surface, border: `2px solid ${COLORS.lineHi}`, fontFamily: FONTS.sans, fontSize: 40, lineHeight: 1.4, color: COLORS.text}}>
			{LEAD.outreach}
		</div>,
		// Build
		<div key="build" style={{position: 'absolute', left: 90, top: 520, width: 900, height: 860, borderRadius: 28, overflow: 'hidden'}}>
			<ClientSite f={1e6} steps={[0, 0, 0, 0, 0]} />
		</div>,
		// Sell
		<div key="sell" style={{position: 'absolute', left: 240, top: 820, padding: '20px 60px', border: `14px solid ${COLORS.accent}`, borderRadius: 30, fontFamily: FONTS.sans, fontSize: 200, fontWeight: 800, color: COLORS.accent, transform: 'rotate(-9deg)'}}>SOLD</div>,
	];

	return (
		<>
		{bgOn && (
			<div style={{position: 'absolute', inset: 0, opacity: 0.3 * (1 - ramp(f, T.LOOP_REPEAT, 6)), filter: 'blur(5px)', transform: `scale(${lerp(1.18, 1.04, punch)})`, transformOrigin: '540px 960px'}}>
				{BG[word]}
			</div>
		)}
		{bgOn && <div style={{position: 'absolute', inset: 0, background: 'radial-gradient(70% 50% at 50% 50%, rgba(5,5,5,0.55) 0%, rgba(5,5,5,0.9) 100%)'}} />}
		<div style={{position: 'absolute', left: 0, right: 0, top: 540, transform: `scaleY(${out}) scale(${lerp(1.06, 1, punch)})`, transformOrigin: '50% 420px'}}>
			{COPY.loop.map((w, i) => (
				<div key={w} style={{height: 168}}>
					<MaskLine
						f={f}
						inAt={T.LOOP_WORDS[i]}
						text={w}
						align="center"
						inDur={10}
						style={{fontSize: 156, fontWeight: 700, letterSpacing: '-0.055em', lineHeight: 1.05, color: i === active && f < T.LOOP_REPEAT ? COLORS.text : 'rgba(244,244,246,0.32)'}}
					/>
				</div>
			))}
			<div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 26, marginTop: 30, opacity: rep, transform: `translateY(${(1 - rep) * 30}px)`}}>
				<svg width={110} height={110} viewBox="0 0 24 24" style={{transform: `rotate(${spin * 360}deg)`}}>
					<path d="M20 12a8 8 0 1 1-2.34-5.66" fill="none" stroke={COLORS.accent} strokeWidth={2.6} strokeLinecap="round" />
					<path d="M20 4v5h-5" fill="none" stroke={COLORS.accent} strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" />
				</svg>
				<div style={{fontFamily: FONTS.sans, fontSize: 156, fontWeight: 700, letterSpacing: '-0.055em', color: COLORS.text, lineHeight: 1}}>{COPY.repeat}</div>
			</div>
		</div>
		</>
	);
};

/** End frame: positioning line, CTA, URL. The logo is the Brand object returning to centre. */
export const Final: React.FC<{f: number; variant: 'organic' | 'paid'}> = ({f, variant}) => {
	if (f < T.FINAL_BRAND) return null;
	const cta = ramp(f, T.FINAL_CTA, 16, EASE.snap);
	const sheen = ramp(f, T.FINAL_CTA + 12, 30, EASE.glide);
	const paid = variant === 'paid';
	return (
		<>
			<div style={{position: 'absolute', left: 0, right: 0, top: 690}}>
				<MaskLine f={f} inAt={T.FINAL_LINE_1} align="center" text={COPY.finalLine1} style={{fontSize: 68, fontWeight: 560, letterSpacing: '-0.035em', color: COLORS.textDim, lineHeight: 1.05}} />
				<div style={{height: 24}} />
				<MaskLine f={f} inAt={T.FINAL_LINE_2} align="center" text={COPY.finalLine2[0]} style={{fontSize: 100, fontWeight: 680, letterSpacing: '-0.05em', color: COLORS.text, lineHeight: 1.0}} />
				<MaskLine f={f} inAt={T.FINAL_LINE_2 + 5} align="center" text={COPY.finalLine2[1]} style={{fontSize: 100, fontWeight: 680, letterSpacing: '-0.05em', color: COLORS.text, lineHeight: 1.0}} />
			</div>
			<div
				style={{
					position: 'absolute',
					left: 540 - 300,
					top: 1130 + (1 - cta) * 40,
					width: 600,
					height: 140,
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
				<div style={{position: 'absolute', top: 0, bottom: 0, width: 140, left: lerp(-200, 660, sheen), background: 'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.28) 50%, rgba(255,255,255,0) 100%)', transform: 'skewX(-18deg)'}} />
				<div style={{fontFamily: FONTS.sans, fontSize: 56, fontWeight: 660, letterSpacing: '-0.035em', color: '#FFFFFF'}}>{COPY.cta}</div>
				<svg width={46} height={46} viewBox="0 0 24 24">
					<path d="M5 12h14M13 6l6 6-6 6" fill="none" stroke="#fff" strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" />
				</svg>
			</div>
			{paid && (
				<div style={{position: 'absolute', left: 0, right: 0, top: 1300}}>
					<MaskLine f={f} inAt={T.FINAL_CTA + 8} align="center" text={COPY.paidOffer} style={{fontSize: 38, fontWeight: 560, letterSpacing: '-0.02em', color: COLORS.text, lineHeight: 1.1}} />
				</div>
			)}
			<div style={{position: 'absolute', left: 0, right: 0, top: paid ? 1364 : 1316}}>
				<MaskLine f={f} inAt={T.FINAL_URL} align="center" text={COPY.url} style={{fontFamily: FONTS.sans, fontSize: 42, fontWeight: 500, letterSpacing: '-0.01em', color: COLORS.textDim, lineHeight: 1.1}} />
			</div>
		</>
	);
};
