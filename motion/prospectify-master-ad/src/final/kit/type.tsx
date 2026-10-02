import React from 'react';
import {C, EASE, FONT, clamp01, lerp, ramp} from '../tokens';

/**
 * KineticHeadline — typography as motion material. Words rise out of a mask, staggered, with a short
 * vertical motion-blur smear while moving; they leave by compressing upward. (A frame-accurate,
 * deterministic equivalent of a GSAP SplitText words timeline.)
 */
export const Kinetic: React.FC<{
	f: number;
	inAt: number;
	outAt?: number;
	text: string;
	size: number;
	weight?: number;
	color?: string;
	accent?: string[]; // words drawn in the accent
	accentColor?: string;
	align?: 'left' | 'center';
	stagger?: number;
	lineHeight?: number;
	tracking?: string;
	style?: React.CSSProperties;
	dur?: number;
}> = ({f, inAt, outAt = 1e9, text, size, weight = 760, color = C.text, accent = [], accentColor = C.accent, align = 'left', stagger = 3, lineHeight = 1.02, tracking = '-0.045em', style, dur = 18}) => {
	const lines = text.split('\n');
	let wi = 0;
	return (
		<div style={{fontFamily: FONT.sans, fontSize: size, fontWeight: weight, letterSpacing: tracking, lineHeight, color, textAlign: align, ...style}}>
			{lines.map((line, li) => (
				<div key={li} style={{display: 'flex', flexWrap: 'wrap', justifyContent: align === 'center' ? 'center' : 'flex-start', columnGap: size * 0.24}}>
					{line.split(' ').map((w, i) => {
						const k = wi++;
						const tin = ramp(f, inAt + k * stagger, dur, EASE.FAST_LOCK);
						const tout = ramp(f, outAt + k * 1.5, 12, EASE.EXIT);
						const v = tin < 1 ? 1 - tin : 0;
						const isAcc = accent.includes(w.replace(/[.,?!]/g, ''));
						return (
							<span key={i} style={{display: 'inline-block', overflow: 'hidden', paddingBottom: size * 0.12, marginBottom: -size * 0.12, verticalAlign: 'top'}}>
								<span
									style={{
										display: 'inline-block',
										transform: `translateY(${v * 105 - tout * 60}%) scaleY(${1 + v * 0.18})`,
										transformOrigin: '50% 100%',
										opacity: (tin > 0 ? 1 : 0) * (1 - tout),
										filter: v > 0.06 || tout > 0.05 ? `blur(${Math.max(v * 7, tout * 8)}px)` : undefined,
										color: isAcc ? accentColor : undefined,
									}}
								>
									{w}
								</span>
							</span>
						);
					})}
				</div>
			))}
		</div>
	);
};

/** Small tracked mono label — the "data layer" voice (Linear-style restraint, used sparingly). */
export const Mono: React.FC<{children: React.ReactNode; size?: number; color?: string; style?: React.CSSProperties}> = ({children, size = 20, color = C.text3, style}) => (
	<div style={{fontFamily: FONT.mono, fontSize: size, letterSpacing: '0.16em', color, textTransform: 'uppercase', whiteSpace: 'nowrap', ...style}}>{children}</div>
);

/** Typewriter caret blink (0/1) — 1 Hz like a real caret. */
export const caretOn = (f: number, from = 0) => (f < from ? true : Math.floor((f - from) / 30) % 2 === 0);

/** Machine-written text reveal across a span. */
export const reveal = (text: string, f: number, a: number, b: number) => text.slice(0, Math.round(text.length * clamp01((f - a) / Math.max(1, b - a))));

export const mix = lerp;
