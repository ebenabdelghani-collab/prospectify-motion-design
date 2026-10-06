import React from 'react';
import {staticFile} from 'remotion';
import {loadFont} from '@remotion/fonts';
import TL from './timeline.json';
import {C, EASE, FONT, clamp01, lerp, rand, ramp} from '../final/tokens';

/**
 * THE PLAYBOOK — 16:9 motion vocabulary (designed after the founder's reference: a hand-made
 * motion-designer ad). Heavy grotesk type, chromatic split on hits, flying UI chips, 3D card orbits,
 * a liquid splat that turns night into day, warm light, one accent colour.
 */
export const W = 1920;
export const H = 1080;
export const P = TL as unknown as Record<string, number & number[]> & {VO: Record<string, {start: number; end: number; text: string}>; PROMPT: string; QUERY: string; durationInFrames: number};

let italicLoaded = false;
export const loadPlaybookFonts = () => {
	if (italicLoaded) return;
	italicLoaded = true;
	loadFont({family: 'Plus Jakarta Sans', url: staticFile('fonts/PlusJakartaSans-Italic-Variable.woff2'), weight: '200 800', style: 'italic'});
};

export const INK = '#16131a';
export const DAY = '#f7f4ef';

/** Night: near-black with a faint grid, a violet-coral glow in the middle, heavy vignette. */
export const NightBG: React.FC<{f: number; o?: number}> = ({f, o = 1}) => (
	<div style={{position: 'absolute', inset: 0, opacity: o, background: '#09080d', overflow: 'hidden'}}>
		<div style={{position: 'absolute', inset: -80, backgroundImage: 'linear-gradient(rgba(255,255,255,0.045) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.045) 1px, transparent 1px)', backgroundSize: '64px 64px', transform: `translate(${(f * 0.15) % 64}px, ${(f * 0.08) % 64}px)`}} />
		<div style={{position: 'absolute', inset: 0, background: 'radial-gradient(60% 55% at 50% 48%, rgba(96,70,160,0.28) 0%, rgba(244,37,98,0.06) 45%, rgba(9,8,13,0) 75%)'}} />
		<div style={{position: 'absolute', inset: 0, background: 'radial-gradient(120% 90% at 50% 50%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.75) 100%)'}} />
	</div>
);

/** Day: warm paper with a soft coral sun behind the subject. */
export const DayBG: React.FC<{f: number; o?: number; glowX?: number; glowY?: number}> = ({f, o = 1, glowX = 50, glowY = 62}) => (
	<div style={{position: 'absolute', inset: 0, opacity: o, background: DAY, overflow: 'hidden'}}>
		<div style={{position: 'absolute', inset: 0, background: `radial-gradient(45% 55% at ${glowX}% ${glowY + Math.sin(f / 90) * 2}%, rgba(255,140,90,0.30) 0%, rgba(244,37,98,0.10) 40%, rgba(247,244,239,0) 72%)`}} />
		<div style={{position: 'absolute', inset: 0, background: 'radial-gradient(130% 100% at 50% 45%, rgba(0,0,0,0) 60%, rgba(60,30,20,0.10) 100%)'}} />
	</div>
);

/** Big type with an RGB split that spikes on hits (decays over ~10 frames). */
export const Chroma: React.FC<{f: number; hits: number[]; children: React.ReactNode; base?: number; style?: React.CSSProperties}> = ({f, hits, children, base = 0, style}) => {
	const k = Math.max(base, ...hits.map((h) => (f >= h && f < h + 12 ? 1 - (f - h) / 12 : 0)));
	const dx = k * 14;
	const jit = k > 0.2 ? (rand(f * 3.1) - 0.5) * 18 * k : 0;
	return (
		<div style={{position: 'relative', ...style}}>
			{k > 0.02 && (
				<>
					<div style={{position: 'absolute', inset: 0, transform: `translate(${-dx + jit}px, ${jit * 0.3}px)`, color: '#ff2a5a', mixBlendMode: 'screen', opacity: 0.85}}>{children}</div>
					<div style={{position: 'absolute', inset: 0, transform: `translate(${dx - jit}px, ${-jit * 0.3}px)`, color: '#2ad4ff', mixBlendMode: 'screen', opacity: 0.85}}>{children}</div>
				</>
			)}
			<div style={{position: 'relative', transform: k > 0.3 ? `skewX(${(rand(f) - 0.5) * 8 * k}deg)` : undefined}}>{children}</div>
		</div>
	);
};

/** Word(s) in the house style: heavy, tight. `accent` part is italic + coral. */
export const Big: React.FC<{text: string; accent?: string; size: number; color?: string; accentColor?: string; weight?: number; style?: React.CSSProperties}> = ({text, accent, size, color = '#fff', accentColor = C.accent, weight = 800, style}) => (
	<div style={{fontFamily: FONT.sans, fontSize: size, fontWeight: weight, letterSpacing: '-0.055em', lineHeight: 0.95, color, whiteSpace: 'nowrap', ...style}}>
		{text}
		{accent && <span style={{fontStyle: 'italic', fontWeight: 700, color: accentColor, letterSpacing: '-0.04em', marginLeft: size * 0.18}}>{accent}</span>}
	</div>
);

/** Letters that rise, un-blur and settle (per character), and can explode out in 3D. */
export const Letters: React.FC<{f: number; inAt: number; text: string; size: number; color?: string; weight?: number; italic?: boolean; outAt?: number; explode?: boolean; stagger?: number; style?: React.CSSProperties}> = ({f, inAt, text, size, color = '#fff', weight = 800, italic = false, outAt = 1e9, explode = false, stagger = 1.6, style}) => (
	<div style={{display: 'inline-flex', perspective: 900, fontFamily: FONT.sans, fontSize: size, fontWeight: weight, fontStyle: italic ? 'italic' : 'normal', letterSpacing: '-0.05em', lineHeight: 1, color, whiteSpace: 'pre', ...style}}>
		{text.split('').map((ch, i) => {
			const t = ramp(f, inAt + i * stagger, 14, EASE.FAST_LOCK);
			const o = ramp(f, outAt + i * 0.6, explode ? 34 : 10, explode ? EASE.SOFT : EASE.EXIT);
			const sx = (rand(i * 7.1 + text.length) - 0.5) * 2;
			const sy = (rand(i * 3.7) - 0.5) * 2;
			return (
				<span
					key={i}
					style={{
						display: 'inline-block',
						transform: explode
							? `translate3d(${sx * 900 * o}px, ${(1 - t) * size * 0.5 + sy * 600 * o}px, ${o * (300 + rand(i) * 900)}px) rotateX(${o * sx * 540}deg) rotateY(${o * sy * 420}deg) rotateZ(${o * sx * 180}deg)`
							: `translateY(${(1 - t) * size * 0.55 - o * size * 0.4}px)`,
						opacity: (t > 0 ? Math.min(1, t * 1.8) : 0) * (explode ? 1 - clamp01((o - 0.7) / 0.3) : 1 - o),
						filter: (1 - t) > 0.05 || o > 0.05 ? `blur(${Math.max((1 - t) * 10, explode ? o * 3 : o * 8)}px)` : undefined,
						color: explode && o > 0 && i % 3 === 0 ? C.accent : undefined,
					}}
				>
					{ch}
				</span>
			);
		})}
	</div>
);

/** Browser-tab chip (dark glass) — the "14 tabs". */
export const TabChip: React.FC<{label: string; dot: string; scale?: number; style?: React.CSSProperties}> = ({label, dot, scale = 1, style}) => (
	<div style={{display: 'inline-flex', alignItems: 'center', gap: 12 * scale, height: 50 * scale, padding: `0 ${16 * scale}px 0 ${14 * scale}px`, borderRadius: 12 * scale, background: 'rgba(40,36,52,0.92)', border: '1px solid rgba(255,255,255,0.14)', boxShadow: '0 18px 40px rgba(0,0,0,0.5)', fontFamily: FONT.sans, fontSize: 19 * scale, fontWeight: 600, color: '#e9e6f2', whiteSpace: 'nowrap', ...style}}>
		<div style={{width: 14 * scale, height: 14 * scale, borderRadius: 4 * scale, background: dot}} />
		{label}
		<span style={{marginLeft: 8 * scale, color: 'rgba(255,255,255,0.4)', fontSize: 17 * scale}}>✕</span>
	</div>
);

/** Liquid splat transition: a wobbly blob grows from (cx, cy) until it covers the frame. */
export const Splat: React.FC<{f: number; at: number; dur?: number; color: string; cx?: number; cy?: number}> = ({f, at, dur = 26, color, cx = W / 2, cy = H / 2}) => {
	if (f < at) return null;
	const t = EASE.HEAVY(clamp01((f - at) / dur));
	const R = lerp(10, 1500, t);
	const n = 48;
	const pts: string[] = [];
	for (let i = 0; i <= n; i++) {
		const a = (i / n) * Math.PI * 2;
		const wob = 1 + 0.32 * (1 - t) * (Math.sin(a * 5 + 1.3) * 0.6 + Math.sin(a * 9 + f * 0.2) * 0.25 + (rand(i * 1.7) - 0.5) * 0.5);
		pts.push(`${(cx + Math.cos(a) * R * wob).toFixed(1)},${(cy + Math.sin(a) * R * wob * 0.92).toFixed(1)}`);
	}
	return (
		<svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
			<polygon points={pts.join(' ')} fill="rgba(255,255,255,0.35)" transform={`translate(${cx} ${cy}) scale(1.08) translate(${-cx} ${-cy})`} />
			<polygon points={pts.join(' ')} fill={color} />
		</svg>
	);
};

/** Small persistent clock (night act). */
export const clockText = (mins: number) => {
	const h24 = Math.floor(mins / 60) % 24;
	const m = mins % 60;
	const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
	return {hm: `${h12}:${String(m).padStart(2, '0')}`, ap: h24 >= 12 ? 'PM' : 'AM'};
};
