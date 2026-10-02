import React from 'react';
import {C, EASE, FONT, clamp01, lerp, ramp} from '../tokens';

/**
 * PROSPECTIFY MOTION GRAMMAR — SIGNAL · SCAN · LOCK · READY
 * One thin coral line finds, a scan reads, four guides lock, an outline resolves to READY.
 */

/** SignalLine: a thin coral line whose head travels along an SVG path (pathLength-normalised). */
export const SignalLine: React.FC<{
	d: string;
	f: number;
	start: number;
	dur: number;
	tail?: number; // fraction of path visible behind the head
	width?: number;
	persist?: boolean; // keep the travelled path drawn (dim) after the head passes
	ease?: (t: number) => number;
	w?: number;
	h?: number;
}> = ({d, f, start, dur, tail = 0.22, width = 3, persist = false, ease = EASE.CAMERA, w = 1080, h = 1920}) => {
	if (f < start) return null;
	const head = ease(clamp01((f - start) / dur));
	const fade = persist ? 1 : 1 - ramp(f, start + dur, 14);
	if (fade <= 0) return null;
	const t0 = Math.max(0, head - tail);
	const seg = Math.max(0.0001, head - t0);
	const common = {d, fill: 'none', pathLength: 1, strokeLinecap: 'round' as const};
	return (
		<svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible', pointerEvents: 'none'}}>
			<defs>
				<filter id="sgGlow" x="-50%" y="-50%" width="200%" height="200%">
					<feGaussianBlur stdDeviation="6" />
				</filter>
			</defs>
			{persist && <path {...common} stroke={`rgba(${C.accentRGB},0.28)`} strokeWidth={width * 0.6} strokeDasharray={`${head} 2`} />}
			<path {...common} stroke={C.accent} strokeWidth={width * 3.4} opacity={0.45 * fade} filter="url(#sgGlow)" strokeDasharray={`${seg} 2`} strokeDashoffset={-t0} />
			<path {...common} stroke={C.accentBright} strokeWidth={width} opacity={fade} strokeDasharray={`${seg} 2`} strokeDashoffset={-t0} />
			<path {...common} stroke="#ffffff" strokeWidth={width * 0.55} opacity={0.9 * fade} strokeDasharray={`${Math.min(seg, 0.02)} 2`} strokeDashoffset={-(head - Math.min(seg, 0.02))} />
		</svg>
	);
};

/** ProspectifyScan: a horizontal read-line passing down a rect, leaving a faint wash. */
export const Scan: React.FC<{f: number; at: number; dur?: number; x: number; y: number; w: number; h: number; r?: number}> = ({f, at, dur = 22, x, y, w, h, r = 18}) => {
	if (f < at || f > at + dur + 14) return null;
	const t = EASE.SOFT(clamp01((f - at) / dur));
	const out = 1 - ramp(f, at + dur, 14);
	const ly = y + t * h;
	return (
		<div style={{position: 'absolute', left: x, top: y, width: w, height: h, borderRadius: r, overflow: 'hidden', pointerEvents: 'none', opacity: out}}>
			<div style={{position: 'absolute', left: 0, right: 0, top: 0, height: ly - y, background: `linear-gradient(180deg, rgba(${C.accentRGB},0) 0%, rgba(${C.accentRGB},0.07) 85%, rgba(${C.accentRGB},0.16) 100%)`}} />
			<div style={{position: 'absolute', left: 0, right: 0, top: ly - y - 1, height: 2, background: C.accentBright, boxShadow: `0 0 18px 2px rgba(${C.accentRGB},0.65)`}} />
		</div>
	);
};

/** ProspectifyLock: four corner guides contract from `spread` onto the rect and seat with FAST_LOCK. */
export const LockCorners: React.FC<{
	f: number;
	at: number;
	x: number;
	y: number;
	w: number;
	h: number;
	spread?: number;
	len?: number;
	stroke?: number;
	color?: string;
	hold?: number; // frames the guides stay after locking (Infinity = forever)
	dur?: number;
}> = ({f, at, x, y, w, h, spread = 60, len = 34, stroke = 3, color = C.accentBright, hold = 26, dur = 16}) => {
	if (f < at - dur) return null;
	const t = EASE.FAST_LOCK(clamp01((f - (at - dur)) / dur));
	const fade = 1 - ramp(f, at + hold, 12);
	if (fade <= 0) return null;
	const s = lerp(spread, 0, t);
	const op = Math.min(1, t * 2.5) * fade;
	const corner = (cx: number, cy: number, sx: number, sy: number, k: number) => (
		<path key={k} d={`M ${cx} ${cy + sy * len} L ${cx} ${cy} L ${cx + sx * len} ${cy}`} fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="square" />
	);
	return (
		<svg width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible', pointerEvents: 'none', opacity: op, filter: `drop-shadow(0 0 8px rgba(${C.accentRGB},0.6))`}}>
			{corner(x - s, y - s, 1, 1, 0)}
			{corner(x + w + s, y - s, -1, 1, 1)}
			{corner(x - s, y + h + s, 1, -1, 2)}
			{corner(x + w + s, y + h + s, -1, -1, 3)}
		</svg>
	);
};

/** READY treatment: the module outline draws coral → settles white-ish, plus a tiny READY tag. */
export const ReadyOutline: React.FC<{f: number; at: number; w: number; h: number; r?: number; dur?: number}> = ({f, at, w, h, r = 22, dur = 18}) => {
	if (f < at - dur) return null;
	const t = EASE.SOFT(clamp01((f - (at - dur)) / dur));
	const settle = ramp(f, at, 24, EASE.SOFT);
	const flash = f >= at ? Math.max(0, 1 - (f - at) / 18) : 0;
	const stroke = settle < 1 ? `rgba(${lerp(244, 255, settle)},${lerp(37, 255, settle * 0.45)},${lerp(98, 255, settle * 0.45)},${lerp(1, 0.5, settle)})` : 'rgba(255,170,190,0.5)';
	return (
		<svg width={w} height={h} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible', pointerEvents: 'none'}}>
			<rect x={1} y={1} width={w - 2} height={h - 2} rx={r} ry={r} fill="none" pathLength={1} stroke={stroke} strokeWidth={2} strokeDasharray={`${t} 2`} />
			{flash > 0 && <rect x={1} y={1} width={w - 2} height={h - 2} rx={r} ry={r} fill={`rgba(${C.accentRGB},${0.07 * flash})`} stroke="none" />}
		</svg>
	);
};

export const ReadyTag: React.FC<{f: number; at: number; label?: string; style?: React.CSSProperties}> = ({f, at, label = 'READY', style}) => {
	const t = ramp(f, at, 14, EASE.FAST_LOCK);
	if (t <= 0) return null;
	return (
		<div style={{display: 'inline-flex', alignItems: 'center', gap: 10, height: 34, padding: '0 14px 0 12px', borderRadius: 999, background: `rgba(${C.accentRGB},${0.12 * t})`, border: `1.5px solid rgba(${C.accentRGB},${0.55 * t})`, opacity: t, transform: `translateX(${(1 - t) * 14}px)`, ...style}}>
			<svg width={14} height={14} viewBox="0 0 14 14">
				<circle cx={7} cy={7} r={5.5} fill="none" stroke={C.accentBright} strokeWidth={1.6} />
				<circle cx={7} cy={7} r={2.4 * t} fill={C.accentBright} />
			</svg>
			<span style={{fontFamily: FONT.mono, fontSize: 17, fontWeight: 600, letterSpacing: '0.16em', color: '#ffd0da'}}>{label}</span>
		</div>
	);
};

/** Bloom: additive light pool for payoff beats (kept rare). */
export const Glow: React.FC<{x: number; y: number; r: number; o: number; rgb?: string}> = ({x, y, r, o, rgb = C.accentRGB}) =>
	o <= 0.003 ? null : (
		<div style={{position: 'absolute', left: x - r, top: y - r, width: r * 2, height: r * 2, borderRadius: '50%', background: `radial-gradient(circle, rgba(${rgb},${0.34 * o}) 0%, rgba(${rgb},${0.1 * o}) 38%, rgba(${rgb},0) 70%)`, pointerEvents: 'none'}} />
	);
