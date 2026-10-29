// Visual kit: white line art on the Prospectify dark, one accent gradient used sparingly.
// Every element is driven by the global frame `f` and the cue frames of the voice (timeline.json).
import React from 'react';
import {Easing, interpolate} from 'remotion';

export const BG = '#09090b';
export const INK = '#f5f5f7';
export const DIM = 'rgba(245,245,247,0.38)';
export const FAINT = 'rgba(245,245,247,0.14)';
export const ACC = '#ff3b5f';
export const ACC2 = '#ff5a45';
export const ACC0 = '#f42562';
export const FONT = '"Jakarta", "Plus Jakarta Sans", sans-serif';
export const SW = 3.2; // stroke width of the line art

export const EASE = Easing.bezier(0.22, 1, 0.36, 1); // site's own ease-out
export const SNAP = Easing.bezier(0.16, 1, 0.3, 1);
export const INOUT = Easing.bezier(0.65, 0, 0.35, 1);
export const BACK = Easing.bezier(0.34, 1.45, 0.5, 1); // site's own spring

const CL = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

/** 0→1 between frame t and t+d. */
export const p01 = (f: number, t: number, d = 18, e = EASE) => interpolate(f, [t, t + d], [0, 1], {...CL, easing: e});
export const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
export const ip = (f: number, i: number[], o: number[], e = EASE) => interpolate(f, i, o, {...CL, easing: e});

/** A stroked path drawn on from 0 to 1. */
export const Stroke: React.FC<{d: string; p: number; w?: number; c?: string; o?: number; dash?: string; fill?: string}> = ({d, p, w = SW, c = INK, o = 1, dash, fill = 'none'}) =>
	p <= 0 ? null : (
		<path
			d={d}
			pathLength={1}
			fill={fill}
			stroke={c}
			strokeWidth={w}
			strokeLinecap="round"
			strokeLinejoin="round"
			strokeDasharray={dash ?? '1 1'}
			strokeDashoffset={dash ? 0 : 1 - p}
			opacity={o * (dash ? p : 1)}
		/>
	);

/** Enter: rise + un-blur + scale, the way the reference cards pop. Applies to an SVG group. */
export const Pop: React.FC<{f: number; t: number; x?: number; y?: number; d?: number; s0?: number; dy?: number; out?: number; children: React.ReactNode; origin?: string}> = ({f, t, x = 0, y = 0, d = 20, s0 = 0.86, dy = 14, out, children, origin}) => {
	const k = p01(f, t, d, BACK);
	const a = p01(f, t, d * 0.6);
	const o = out === undefined ? 1 : 1 - p01(f, out, 12);
	if (a <= 0 || o <= 0) return null;
	return (
		<g transform={`translate(${x} ${y + (1 - a) * dy})`} opacity={a * o}>
			<g transform={`scale(${lerp(s0, 1, k)})`} style={{transformOrigin: origin ?? '0px 0px', filter: a < 1 ? `blur(${(1 - a) * 6}px)` : undefined}}>
				{children}
			</g>
		</g>
	);
};

/** Small wide-tracked uppercase label, letters fade in one by one (reference style). */
export const Label: React.FC<{f: number; t: number; x: number; y: number; text: string; size?: number; c?: string; anchor?: 'start' | 'middle' | 'end'; spacing?: number; out?: number; weight?: number}> = ({f, t, x, y, text, size = 22, c = INK, anchor = 'middle', spacing = 0.32, out, weight = 600}) => {
	const o = out === undefined ? 1 : 1 - p01(f, out, 12);
	if (f < t || o <= 0) return null;
	return (
		<text x={x} y={y} textAnchor={anchor} fontFamily={FONT} fontWeight={weight} fontSize={size * 1.22} letterSpacing={`${spacing}em`} fill={c} opacity={o}>
			{text.split('').map((ch, i) => (
				<tspan key={i} opacity={p01(f, t + i * 1.2, 8)}>
					{ch}
				</tspan>
			))}
		</text>
	);
};

/** Big number that rolls to its value. */
export const Count: React.FC<{f: number; t: number; d?: number; from?: number; to: number; x: number; y: number; size?: number; prefix?: string; suffix?: string; c?: string; anchor?: 'start' | 'middle' | 'end'; weight?: number}> = ({f, t, d = 40, from = 0, to, x, y, size = 84, prefix = '', suffix = '', c = INK, anchor = 'middle', weight = 700}) => {
	if (f < t) return null;
	const v = Math.round(lerp(from, to, p01(f, t, d, SNAP)));
	return (
		<text x={x} y={y} textAnchor={anchor} fontFamily={FONT} fontWeight={weight} fontSize={size} letterSpacing="-0.02em" fill={c} opacity={p01(f, t, 8)} style={{fontVariantNumeric: 'tabular-nums'}}>
			{prefix}
			{v.toLocaleString('en-US')}
			{suffix}
		</text>
	);
};

/** Typewriter text. */
export const Type: React.FC<{f: number; t: number; text: string; cps?: number; x: number; y: number; size?: number; c?: string; anchor?: 'start' | 'middle' | 'end'; caret?: boolean; weight?: number; spacing?: string}> = ({f, t, text, cps = 22, x, y, size = 30, c = INK, anchor = 'start', caret = true, weight = 500, spacing = '0'}) => {
	if (f < t) return null;
	const n = Math.min(text.length, Math.floor(((f - t) / 60) * cps));
	const blink = Math.floor((f - t) / 18) % 2 === 0 || n < text.length;
	return (
		<text x={x} y={y} textAnchor={anchor} fontFamily={FONT} fontWeight={weight} fontSize={size} fill={c} letterSpacing={spacing}>
			{text.slice(0, n)}
			{caret && blink ? <tspan fill={ACC}>|</tspan> : null}
		</text>
	);
};

export const Defs: React.FC = () => (
	<defs>
		<linearGradient id="grad" x1="0" y1="1" x2="1" y2="0">
			<stop offset="0" stopColor={ACC0} />
			<stop offset="0.55" stopColor={ACC} />
			<stop offset="1" stopColor={ACC2} />
		</linearGradient>
		<radialGradient id="spot">
			<stop offset="0" stopColor="#ffffff" stopOpacity="0.16" />
			<stop offset="0.45" stopColor="#ffffff" stopOpacity="0.05" />
			<stop offset="1" stopColor="#ffffff" stopOpacity="0" />
		</radialGradient>
		<radialGradient id="spotAcc">
			<stop offset="0" stopColor={ACC} stopOpacity="0.30" />
			<stop offset="0.5" stopColor={ACC0} stopOpacity="0.08" />
			<stop offset="1" stopColor={ACC0} stopOpacity="0" />
		</radialGradient>
	</defs>
);

/** Soft light pool behind the focal object. */
export const Spot: React.FC<{x: number; y: number; r: number; o?: number; acc?: boolean}> = ({x, y, r, o = 1, acc}) => (o <= 0 ? null : <circle cx={x} cy={y} r={r} fill={`url(#${acc ? 'spotAcc' : 'spot'})`} opacity={o} />);

// ───────────────────────── pictograms (origin = bottom centre unless noted) ─────────────────────────

/** Filled person, like the reference. */
export const Person: React.FC<{s?: number; c?: string; o?: number}> = ({s = 1, c = INK, o = 1}) => (
	<g transform={`scale(${s})`} opacity={o}>
		<circle cx={0} cy={-104} r={21} fill={c} />
		<path d="M -36 0 V -50 Q -36 -76 0 -76 Q 36 -76 36 -50 V 0 Z" fill={c} />
	</g>
);

/** Storefront, drawn on with p (0..1). */
export const Store: React.FC<{p: number; s?: number; sign?: string; signOn?: number; lit?: number; c?: string}> = ({p, s = 1, sign = 'OPEN', signOn = 1, lit = 0, c = INK}) => {
	const q = (a: number, b: number) => Math.max(0, Math.min(1, (p - a) / (b - a)));
	return (
		<g transform={`scale(${s})`}>
			{lit > 0 ? <rect x={-150} y={-230} width={300} height={230} fill="#ffffff" opacity={0.05 * lit} /> : null}
			<Stroke d="M -170 -236 V 0 H 170 V -236" p={q(0, 0.35)} c={c} />
			<Stroke d="M -196 -236 L -178 -300 H 178 L 196 -236 Z" p={q(0.2, 0.55)} c={c} />
			{[-118, -59, 0, 59, 118].map((x, i) => (
				<Stroke key={x} d={`M ${x} -300 L ${x * 1.1} -236`} p={q(0.45 + i * 0.04, 0.62 + i * 0.04)} c={c} w={SW * 0.85} />
			))}
			<Stroke d="M -126 0 V -150 H -46 V 0" p={q(0.55, 0.8)} c={c} />
			{p > 0.8 ? <circle cx={-60} cy={-72} r={4} fill={c} opacity={q(0.8, 0.9)} /> : null}
			<Stroke d="M 6 -182 H 134 V -108 H 6 Z" p={q(0.65, 0.95)} c={c} />
			{p > 0.9 ? (
				<text x={70} y={-138} textAnchor="middle" fontFamily={FONT} fontWeight={700} fontSize={19} letterSpacing="0.22em" fill={c} opacity={q(0.9, 1) * signOn}>
					{sign}
				</text>
			) : null}
		</g>
	);
};

/** Tiny store for the city grid. */
export const MiniStore: React.FC<{lit: number; c?: string}> = ({lit, c = INK}) => (
	<g>
		<rect x={-26} y={-34} width={52} height={34} fill="#fff" opacity={0.06 + 0.1 * lit} />
		<path d="M -26 -34 V 0 H 26 V -34 M -30 -34 L -27 -46 H 27 L 30 -34 Z M -16 0 V -18 H -4 V 0" fill="none" stroke={c} strokeWidth={2} strokeLinejoin="round" opacity={0.35 + 0.65 * lit} />
	</g>
);

export const STAR = 'M 0 -26 L 7.6 -8.3 L 26 -8 L 12 4.3 L 16.2 22 L 0 12.4 L -16.2 22 L -12 4.3 L -26 -8 L -7.6 -8.3 Z';

/** Browser window (origin top-left). */
export const Browser: React.FC<{p: number; w: number; h: number; url?: string; c?: string; fillO?: number}> = ({p, w, h, url, c = INK, fillO = 0.6}) => {
	const q = (a: number, b: number) => Math.max(0, Math.min(1, (p - a) / (b - a)));
	const r = 18;
	return (
		<g>
			<rect x={0} y={0} width={w} height={h} rx={r} fill={BG} opacity={fillO * q(0.2, 0.6)} />
			<Stroke d={`M ${r} 0 H ${w - r} Q ${w} 0 ${w} ${r} V ${h - r} Q ${w} ${h} ${w - r} ${h} H ${r} Q 0 ${h} 0 ${h - r} V ${r} Q 0 0 ${r} 0 Z`} p={q(0, 0.6)} c={c} />
			<Stroke d={`M 0 58 H ${w}`} p={q(0.3, 0.7)} c={c} w={SW * 0.8} />
			{[0, 1, 2].map((i) => (
				<circle key={i} cx={30 + i * 22} cy={29} r={5.5} fill={c} opacity={q(0.5 + i * 0.05, 0.65 + i * 0.05)} />
			))}
			{url ? (
				<g opacity={q(0.55, 0.8)}>
					<rect x={w / 2 - 150} y={15} width={300} height={28} rx={14} fill="none" stroke={c} strokeWidth={2} opacity={0.7} />
					<text x={w / 2} y={35} textAnchor="middle" fontFamily={FONT} fontWeight={600} fontSize={14} letterSpacing="0.24em" fill={c}>
						{url}
					</text>
				</g>
			) : null}
		</g>
	);
};

/** Rounded rectangle outline drawn on (origin top-left). */
export const RRect: React.FC<{p: number; w: number; h: number; r?: number; c?: string; sw?: number; fill?: string; fillO?: number}> = ({p, w, h, r = 16, c = INK, sw = SW, fill, fillO = 1}) => (
	<g>
		{fill ? <rect x={0} y={0} width={w} height={h} rx={r} fill={fill} opacity={fillO * Math.min(1, p * 2)} /> : null}
		<Stroke d={`M ${r} 0 H ${w - r} Q ${w} 0 ${w} ${r} V ${h - r} Q ${w} ${h} ${w - r} ${h} H ${r} Q 0 ${h} 0 ${h - r} V ${r} Q 0 0 ${r} 0 Z`} p={p} c={c} w={sw} />
	</g>
);

/** Map pin (origin at the tip). */
export const Pin: React.FC<{c?: string; s?: number; filled?: boolean}> = ({c = INK, s = 1, filled}) => (
	<g transform={`scale(${s})`}>
		<path d="M 0 0 C -6 -14 -22 -26 -22 -42 A 22 22 0 0 1 22 -42 C 22 -26 6 -14 0 0 Z" fill={filled ? c : BG} stroke={c} strokeWidth={2.6} strokeLinejoin="round" />
		<circle cx={0} cy={-42} r={7.5} fill={filled ? BG : c} />
	</g>
);

/** Magnifier (origin centre). */
export const Magnifier: React.FC<{c?: string; s?: number}> = ({c = INK, s = 1}) => (
	<g transform={`scale(${s})`} fill="none" stroke={c} strokeWidth={3} strokeLinecap="round">
		<circle cx={-3} cy={-3} r={10} />
		<path d="M 5 5 L 13 13" />
	</g>
);

/** Corner brackets (focus frame) around a box centred on 0,0. */
export const Brackets: React.FC<{w: number; h: number; p: number; c?: string; len?: number}> = ({w, h, p, c = INK, len = 34}) => {
	const x = w / 2, y = h / 2;
	const ds = [
		`M ${-x} ${-y + len} V ${-y} H ${-x + len}`,
		`M ${x - len} ${-y} H ${x} V ${-y + len}`,
		`M ${x} ${y - len} V ${y} H ${x - len}`,
		`M ${-x + len} ${y} H ${-x} V ${y - len}`,
	];
	return (
		<g>
			{ds.map((d) => (
				<Stroke key={d} d={d} p={p} c={c} w={2.4} />
			))}
		</g>
	);
};

/** Check mark inside a small box (origin centre). */
export const CheckBox: React.FC<{p: number; on: number; c?: string; s?: number}> = ({p, on, c = INK, s = 1}) => (
	<g transform={`scale(${s})`}>
		<Stroke d="M -13 -13 H 13 V 13 H -13 Z" p={p} c={c} w={2.4} />
		<Stroke d="M -7 0 L -2 6 L 8 -6" p={on} c={c} w={3} />
	</g>
);

/** Pill chip with text (origin centre). */
export const Chip: React.FC<{text: string; w?: number; h?: number; c?: string; filled?: boolean; size?: number; acc?: boolean}> = ({text, w = 200, h = 40, c = INK, filled, size = 16, acc}) => (
	<g>
		<rect x={-w / 2} y={-h / 2} width={w} height={h} rx={h / 2} fill={acc ? 'url(#grad)' : filled ? c : BG} stroke={acc ? 'none' : c} strokeWidth={2} />
		<text x={0} y={size * 0.36} textAnchor="middle" fontFamily={FONT} fontWeight={700} fontSize={size} letterSpacing="0.2em" fill={filled ? BG : acc ? '#fff' : c}>
			{text}
		</text>
	</g>
);
