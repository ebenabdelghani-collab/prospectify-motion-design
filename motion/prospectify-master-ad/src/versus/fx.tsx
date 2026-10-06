import React from 'react';
import TL from './timeline.json';
import {C, EASE, FONT, clamp01, lerp, rand, ramp} from '../final/tokens';
import {Logo} from '../final/kit/ui';

/**
 * SAME NIGHT — visual vocabulary.
 * WITHOUT world: cold blue-black, desaturated, flicker. WITH world: Prospectify's own dark (#09090b) with the
 * brand gradient as light. No pastel / light pink anywhere: accents are #f42562 → #ff3b5f → #ff5a45 only.
 */
export const W = 1920;
export const H = 1080;
export const P = TL as unknown as Record<string, number & number[]> & {VO: Record<string, {start: number; end: number; text: string}>; durationInFrames: number};

export const COLD = {bg: '#080b10', ink: '#dfe6ef', dim: '#7d8896', line: 'rgba(170,190,215,0.14)'};

export const ColdBG: React.FC<{f: number; o?: number}> = ({f, o = 1}) => (
	<div style={{position: 'absolute', inset: 0, opacity: o, background: COLD.bg, overflow: 'hidden'}}>
		<div style={{position: 'absolute', inset: 0, background: 'radial-gradient(70% 60% at 50% 45%, rgba(70,105,150,0.22) 0%, rgba(8,11,16,0) 70%)', opacity: 0.85 + 0.15 * Math.sin(f * 0.9) * rand(Math.floor(f / 3))}} />
		<div style={{position: 'absolute', inset: 0, background: 'radial-gradient(120% 95% at 50% 50%, rgba(0,0,0,0) 50%, rgba(0,0,0,0.8) 100%)'}} />
	</div>
);

export const BrandBG: React.FC<{f: number; o?: number; gx?: number; gy?: number; glow?: number}> = ({f, o = 1, gx = 50, gy = 55, glow = 1}) => (
	<div style={{position: 'absolute', inset: 0, opacity: o, background: C.bg, overflow: 'hidden'}}>
		<div style={{position: 'absolute', inset: -80, backgroundImage: 'linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px)', backgroundSize: '80px 80px', transform: `translate(${(f * 0.2) % 80}px, ${(f * 0.1) % 80}px)`}} />
		<div style={{position: 'absolute', inset: 0, opacity: glow, background: `radial-gradient(42% 50% at ${gx}% ${gy + Math.sin(f / 70) * 2}%, rgba(244,37,98,0.26) 0%, rgba(255,90,69,0.08) 45%, rgba(9,9,11,0) 75%)`}} />
		<div style={{position: 'absolute', inset: 0, background: 'radial-gradient(120% 95% at 50% 50%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.7) 100%)'}} />
	</div>
);

/** Grade applied over the WITHOUT world's content: cold, low saturation. */
export const coldGrade: React.CSSProperties = {filter: 'saturate(0.38) brightness(0.86) contrast(1.05) hue-rotate(-8deg)'};

/** Section label, top-left. */
export const SideLabel: React.FC<{f: number; at: number; out?: number; with?: boolean}> = ({f, at, out = 1e9, with: w}) => {
	const t = ramp(f, at, 16, EASE.FAST_LOCK) * (1 - ramp(f, out, 10, EASE.EXIT));
	if (t <= 0) return null;
	return (
		<div style={{position: 'absolute', left: 72, top: 60, display: 'flex', alignItems: 'center', gap: 16, opacity: t, transform: `translateX(${(1 - t) * -30}px)`}}>
			{w ? <Logo size={40} /> : <div style={{width: 40, height: 40, borderRadius: 12, border: `2px solid ${COLD.dim}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT.sans, fontWeight: 800, fontSize: 22, color: COLD.dim}}>✕</div>}
			<div style={{fontFamily: FONT.sans, fontWeight: 800, fontSize: 26, letterSpacing: '0.2em', color: w ? C.text : COLD.dim}}>
				{w ? 'WITH ' : 'WITHOUT '}
				<span style={w ? {background: C.grad, WebkitBackgroundClip: 'text', color: 'transparent'} : {}}>PROSPECTIFY</span>
			</div>
		</div>
	);
};

/** RGB split + skew spike on hits. */
export const Chroma: React.FC<{f: number; hits: number[]; children: React.ReactNode; amt?: number; style?: React.CSSProperties}> = ({f, hits, children, amt = 1, style}) => {
	const k = Math.max(0, ...hits.map((h) => (f >= h && f < h + 12 ? 1 - (f - h) / 12 : 0))) * amt;
	const dx = k * 16;
	const jit = k > 0.2 ? (rand(f * 3.1) - 0.5) * 20 * k : 0;
	return (
		<div style={{position: 'relative', ...style}}>
			{k > 0.02 && (
				<>
					<div style={{position: 'absolute', inset: 0, transform: `translate(${-dx + jit}px, ${jit * 0.3}px)`, mixBlendMode: 'screen', opacity: 0.8, filter: 'drop-shadow(0 0 0 #f00) sepia(1) saturate(8) hue-rotate(-50deg)'}}>{children}</div>
					<div style={{position: 'absolute', inset: 0, transform: `translate(${dx - jit}px, ${-jit * 0.3}px)`, mixBlendMode: 'screen', opacity: 0.8, filter: 'sepia(1) saturate(8) hue-rotate(160deg)'}}>{children}</div>
				</>
			)}
			<div style={{position: 'relative', transform: k > 0.3 ? `skewX(${(rand(f) - 0.5) * 8 * k}deg)` : undefined}}>{children}</div>
		</div>
	);
};

/** Kinetic word(s): per-letter rise + unblur; `grad` paints the brand gradient. */
export const Kword: React.FC<{f: number; at: number; text: string; size: number; color?: string; grad?: boolean; out?: number; weight?: number; stagger?: number; style?: React.CSSProperties}> = ({f, at, text, size, color = '#fff', grad = false, out = 1e9, weight = 800, stagger = 1.2, style}) => {
	const o = ramp(f, out, 10, EASE.EXIT);
	if (f < at || o >= 1) return null;
	return (
		<div style={{display: 'inline-flex', fontFamily: FONT.sans, fontSize: size, fontWeight: weight, letterSpacing: '-0.05em', lineHeight: 1, whiteSpace: 'pre', opacity: 1 - o, transform: `translateY(${-o * 30}px)`, ...style}}>
			{text.split('').map((ch, i) => {
				const t = ramp(f, at + i * stagger, 14, EASE.FAST_LOCK);
				return (
					<span
						key={i}
						style={{
							display: 'inline-block',
							transform: `translateY(${(1 - t) * size * 0.5}px) scale(${lerp(1.25, 1, t)})`,
							opacity: Math.min(1, t * 1.8),
							filter: t < 0.95 ? `blur(${(1 - t) * 12}px)` : undefined,
							...(grad ? {background: C.grad, WebkitBackgroundClip: 'text', color: 'transparent', paddingRight: '0.04em'} : {color}),
						}}
					>
						{ch}
					</span>
				);
			})}
		</div>
	);
};

/** Clock that rolls between minute values. */
export const clockStr = (mins: number) => {
	const m = ((Math.round(mins) % 1440) + 1440) % 1440;
	const h24 = Math.floor(m / 60);
	const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
	return {hm: `${h12}:${String(m % 60).padStart(2, '0')}`, ap: h24 >= 12 ? 'PM' : 'AM'};
};

export const Clock: React.FC<{mins: number; size: number; color?: string; apColor?: string; style?: React.CSSProperties}> = ({mins, size, color = COLD.ink, apColor = COLD.dim, style}) => {
	const c = clockStr(mins);
	return (
		<div style={{fontFamily: FONT.sans, fontWeight: 800, fontSize: size, letterSpacing: '-0.04em', color, lineHeight: 1, fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap', ...style}}>
			{c.hm}
			<span style={{fontSize: size * 0.34, marginLeft: size * 0.1, color: apColor, letterSpacing: '0.04em'}}>{c.ap}</span>
		</div>
	);
};

export const appear = (f: number, a: number, d = 14) => ramp(f, a, d, EASE.FAST_LOCK);
export const gone = (f: number, a: number, d = 10) => ramp(f, a, d, EASE.EXIT);
export const vis = (f: number, a: number, b: number) => (f >= a - 2 && f <= b + 12 ? clamp01(appear(f, a)) * (1 - gone(f, b)) : 0);
