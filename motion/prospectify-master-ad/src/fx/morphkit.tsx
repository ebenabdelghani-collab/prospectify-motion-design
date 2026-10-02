import React from 'react';
import {COLORS, EASE, FONTS} from '../constants/theme';
import {clamp01, lerp, ramp, rand} from '../motion/anim';

/** Reference-level motion vocabulary, shared by the master ad: blooms, streaks, letter flips, bursts. */

const backOut = (c = 1.4) => (t: number) => 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2);

/** Additive light pool. */
export const Bloom: React.FC<{x: number; y: number; r: number; o: number; color?: string}> = ({x, y, r, o, color = '230,63,109'}) =>
	o <= 0.002 ? null : (
		<div style={{position: 'absolute', left: x - r, top: y - r, width: r * 2, height: r * 2, borderRadius: '50%', background: `radial-gradient(circle, rgba(${color},${0.55 * o}) 0%, rgba(${color},${0.18 * o}) 32%, rgba(${color},0) 70%)`, mixBlendMode: 'screen', pointerEvents: 'none'}} />
	);

/** A pulse of bloom centred on a beat: rises fast, decays over `len` frames. */
export const pulse = (f: number, at: number, len = 30) => (f < at - 4 ? 0 : f < at ? (f - (at - 4)) / 4 : Math.max(0, 1 - (f - at) / len));

/** Light streaks: glowing curves whose head and tail travel along the path. */
export const LightStreaks: React.FC<{f: number; start: number; paths: {d: string; w: number; delay?: number}[]; dur?: number; id: string}> = ({f, start, paths, dur = 18, id}) => {
	if (f < start - 1 || f > start + dur + 40) return null;
	return (
		<svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{position: 'absolute', inset: 0, overflow: 'visible', pointerEvents: 'none', mixBlendMode: 'screen'}}>
			<defs>
				<linearGradient id={`sg-${id}`} x1="0" y1="0" x2="1" y2="0">
					<stop offset="0" stopColor="#E63F6D" stopOpacity="0" />
					<stop offset="0.55" stopColor="#E63F6D" />
					<stop offset="1" stopColor="#FFFFFF" />
				</linearGradient>
				<filter id={`gl-${id}`} x="-50%" y="-50%" width="200%" height="200%">
					<feGaussianBlur stdDeviation="9" />
				</filter>
			</defs>
			{paths.map((s, i) => {
				const t0 = start + (s.delay ?? 0);
				const head = EASE.exit(clamp01((f - t0) / dur));
				const tail = EASE.exit(clamp01((f - t0 - 7) / dur));
				if (head <= 0 || tail >= 1) return null;
				const p = {d: s.d, fill: 'none', stroke: `url(#sg-${id})`, strokeLinecap: 'round' as const, pathLength: 1, strokeDasharray: `${Math.max(0.0001, head - tail)} 2`, strokeDashoffset: -tail};
				return (
					<g key={i}>
						<path {...p} strokeWidth={s.w * 3.2} opacity={0.55} filter={`url(#gl-${id})`} />
						<path {...p} strokeWidth={s.w} />
					</g>
				);
			})}
		</svg>
	);
};

/** Letters flip in (and optionally out) one by one in 3D, with blur — the "morphing word". */
export const LetterFlip: React.FC<{
	f: number;
	inAt: number;
	outAt?: number;
	text: string;
	size: number;
	color?: string;
	weight?: number;
	align?: 'left' | 'center';
	stagger?: number;
	glow?: string;
}> = ({f, inAt, outAt = 1e9, text, size, color = COLORS.text, weight = 700, align = 'center', stagger = 1.6, glow}) => (
	<div style={{display: 'flex', justifyContent: align === 'center' ? 'center' : 'flex-start', perspective: 1200, transformStyle: 'preserve-3d'}}>
		{text.split('').map((ch, i) => {
			const tin = ramp(f, inAt + i * stagger, 13, backOut(1.4));
			const tout = ramp(f, outAt + i * 1.1, 11, EASE.exit);
			const seed = i * 7 + text.length * 13;
			const blur = (1 - tin) * 10 + tout * 12;
			return (
				<span
					key={i}
					style={{
						display: 'inline-block',
						whiteSpace: 'pre',
						fontFamily: FONTS.sans,
						fontSize: size,
						fontWeight: weight,
						letterSpacing: '-0.05em',
						lineHeight: 1.05,
						color,
						transform: `translateY(${(1 - tin) * size * 0.42 - tout * size * 0.42}px) rotateX(${(1 - tin) * -95 + tout * 95}deg) rotateZ(${(rand(seed) - 0.5) * 50 * (1 - tin) + (rand(seed + 3) - 0.5) * 60 * tout}deg)`,
						opacity: Math.min(1, tin * 1.6) * (1 - tout),
						filter: blur > 0.4 ? `blur(${blur}px)` : undefined,
						textShadow: glow ? `0 0 50px ${glow}` : undefined,
					}}
				>
					{ch}
				</span>
			);
		})}
	</div>
);

const MINI = [
	<path key="c" d="M5 12.5l4.5 4.5L19 7.5" />,
	<g key="p">
		<path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21Z" />
		<circle cx={12} cy={9.5} r={2.4} />
	</g>,
	<path key="d" d="M12 3v18M16.5 7.5c0-1.9-2-3-4.5-3s-4.5 1.2-4.5 3.2c0 4.6 9 2.4 9 7 0 2-2 3.3-4.5 3.3s-4.5-1.2-4.5-3.1" />,
];

/** Glowing mini-icons burst outward from a point (checks, pins, $). */
export const IconBurst: React.FC<{f: number; at: number; x: number; y: number; n?: number; spread?: number}> = ({f, at, x, y, n = 16, spread = 1}) => {
	if (f < at || f > at + 90) return null;
	return (
		<>
			{Array.from({length: n}).map((_, i) => {
				const a = (i / n) * Math.PI * 2 + rand(i) * 0.3;
				const d = (240 + rand(i * 3) * 320) * spread;
				const t = ramp(f, at + rand(i * 5) * 6, 34, EASE.snap);
				const fade = ramp(f, at + 36 + rand(i * 7) * 30, 22);
				return (
					<div
						key={i}
						style={{
							position: 'absolute',
							left: x - 30 + Math.cos(a) * d * t,
							top: y - 30 + Math.sin(a) * d * t * 1.2,
							width: 60,
							height: 60,
							borderRadius: 30,
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							background: 'rgba(230,63,109,0.16)',
							border: '1.5px solid rgba(230,63,109,0.6)',
							boxShadow: '0 0 24px rgba(230,63,109,0.5)',
							transform: `scale(${lerp(0.2, 0.7 + rand(i * 9) * 0.5, t)}) rotate(${(rand(i) - 0.5) * 60 * t}deg)`,
							opacity: t * (1 - fade),
						}}
					>
						<svg width={30} height={30} viewBox="0 0 24 24" fill="none" stroke="#FFD3DE" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
							{MINI[i % MINI.length]}
						</svg>
					</div>
				);
			})}
		</>
	);
};
