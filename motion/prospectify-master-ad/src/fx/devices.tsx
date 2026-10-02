import React from 'react';
import {COLORS, EASE, FONTS} from '../constants/theme';
import {clamp01, lerp, rand} from '../motion/anim';
import {Emoji} from './camera';

const P3D: React.CSSProperties = {transformStyle: 'preserve-3d'};

/**
 * A phone with real thickness: front glass, aluminium sides, back. Rotate it and the edges show.
 * Children render on the screen. Size in design units.
 */
export const Phone3D: React.FC<{w: number; h: number; depth?: number; rx?: number; ry?: number; rz?: number; children: React.ReactNode; glow?: number}> = ({
	w,
	h,
	depth = 34,
	rx = 0,
	ry = 0,
	rz = 0,
	children,
	glow = 0,
}) => {
	const r = Math.min(w, h) * 0.15;
	const side = (len: number): React.CSSProperties => ({
		position: 'absolute',
		background: 'linear-gradient(90deg, #3A3B42 0%, #8E9099 22%, #4A4B52 50%, #9A9CA6 78%, #33343A 100%)',
		width: len,
		height: depth,
	});
	return (
		<div style={{position: 'absolute', left: 0, top: 0, width: w, height: h, ...P3D, transform: `perspective(2600px) rotateX(${rx}deg) rotateY(${ry}deg) rotateZ(${rz}deg)`}}>
			{/* back */}
			<div style={{position: 'absolute', inset: 0, borderRadius: r, background: 'linear-gradient(135deg, #2C2D33, #121216)', transform: `translateZ(${-depth / 2}px) rotateY(180deg)`}} />
			{/* sides: thin planes standing perpendicular to the screen */}
			<div style={{...side(w - r * 2), left: r, top: -depth / 2, transform: 'rotateX(90deg)'}} />
			<div style={{...side(w - r * 2), left: r, top: h - depth / 2, transform: 'rotateX(90deg)'}} />
			<div style={{position: 'absolute', left: -depth / 2, top: r, width: depth, height: h - r * 2, background: 'linear-gradient(180deg, #3A3B42 0%, #8E9099 22%, #4A4B52 50%, #9A9CA6 78%, #33343A 100%)', transform: 'rotateY(90deg)'}} />
			<div style={{position: 'absolute', left: w - depth / 2, top: r, width: depth, height: h - r * 2, background: 'linear-gradient(180deg, #3A3B42 0%, #9A9CA6 30%, #4A4B52 60%, #8E9099 85%, #33343A 100%)', transform: 'rotateY(90deg)'}} />
			{/* side buttons */}
			<div style={{position: 'absolute', left: w - 2, top: h * 0.22, width: 6, height: h * 0.12, borderRadius: 3, background: '#7D7F88', transform: `translateZ(0px) rotateY(90deg)`}} />
			{/* front */}
			<div
				style={{
					position: 'absolute',
					inset: 0,
					borderRadius: r,
					background: '#0B0B0E',
					transform: `translateZ(${depth / 2}px)`,
					boxShadow: `0 0 0 2px #2A2A31${glow ? `, 0 0 ${120 * glow}px rgba(160,190,255,${0.15 * glow})` : ''}`,
				}}
			>
				<div style={{position: 'absolute', left: w * 0.035, top: w * 0.035, right: w * 0.035, bottom: w * 0.035, borderRadius: r * 0.78, overflow: 'hidden', background: '#000'}}>{children}</div>
				<div style={{position: 'absolute', left: w / 2 - w * 0.11, top: w * 0.055, width: w * 0.22, height: w * 0.06, borderRadius: w * 0.03, background: '#000'}} />
				{/* glass reflection */}
				<div style={{position: 'absolute', inset: 0, borderRadius: r, background: `linear-gradient(${115 + ry * 2}deg, rgba(255,255,255,0) 35%, rgba(255,255,255,0.07) 48%, rgba(255,255,255,0) 60%)`, pointerEvents: 'none'}} />
			</div>
		</div>
	);
};

/**
 * A laptop: hinged lid (screen) + keyboard deck, in true CSS 3D.
 * w = screen width; the screen is 16:10. `open` is the lid angle in degrees (90 = upright).
 */
export const Laptop3D: React.FC<{w: number; rx?: number; ry?: number; open?: number; children: React.ReactNode}> = ({w, rx = 12, ry = -18, open = 100, children}) => {
	const h = w * 0.625;
	const bez = w * 0.022;
	const deckD = h * 0.72;
	return (
		<div style={{position: 'absolute', left: 0, top: 0, width: w, height: h, ...P3D, transform: `perspective(3000px) rotateX(${rx}deg) rotateY(${ry}deg)`}}>
			{/* lid */}
			<div style={{position: 'absolute', inset: 0, ...P3D, transformOrigin: '50% 100%', transform: `rotateX(${90 - open}deg)`}}>
				<div style={{position: 'absolute', inset: 0, borderRadius: w * 0.025, background: 'linear-gradient(180deg, #1B1C21, #0E0E12)', boxShadow: '0 0 0 2px #34353C'}}>
					<div style={{position: 'absolute', left: bez, top: bez, right: bez, bottom: bez * 1.6, borderRadius: w * 0.008, overflow: 'hidden', background: '#000'}}>{children}</div>
					<div style={{position: 'absolute', inset: 0, borderRadius: w * 0.025, background: `linear-gradient(${120 + ry}deg, rgba(255,255,255,0) 40%, rgba(255,255,255,0.06) 50%, rgba(255,255,255,0) 60%)`, pointerEvents: 'none'}} />
				</div>
				<div style={{position: 'absolute', inset: 0, borderRadius: w * 0.025, background: 'linear-gradient(135deg, #3B3D44, #1C1D22)', transform: 'translateZ(-6px) rotateY(180deg)'}} />
			</div>
			{/* deck */}
			<div
				style={{
					position: 'absolute',
					left: -w * 0.03,
					top: h,
					width: w * 1.06,
					height: deckD,
					transformOrigin: '50% 0%',
					transform: 'rotateX(-90deg)',
					borderRadius: `0 0 ${w * 0.03}px ${w * 0.03}px`,
					background: 'linear-gradient(180deg, #2E3036 0%, #24262B 100%)',
					boxShadow: 'inset 0 0 0 2px #3A3C43',
				}}
			>
				{/* keys */}
				<div style={{position: 'absolute', left: '8%', right: '8%', top: '7%', height: '50%', display: 'grid', gridTemplateColumns: 'repeat(14, 1fr)', gap: w * 0.004}}>
					{Array.from({length: 14 * 5}).map((_, i) => (
						<div key={i} style={{borderRadius: 3, background: '#15161A', boxShadow: 'inset 0 -1px 0 rgba(255,255,255,0.05)'}} />
					))}
				</div>
				<div style={{position: 'absolute', left: '34%', right: '34%', top: '63%', height: '30%', borderRadius: 8, background: '#2A2C32', boxShadow: 'inset 0 0 0 1.5px #3E4047'}} />
			</div>
		</div>
	);
};

/** Glass shatter: shards burst towards camera and fall away. `t` 0→1. */
export const Shatter: React.FC<{t: number; cx?: number; cy?: number; n?: number}> = ({t, cx = 540, cy = 960, n = 26}) => {
	if (t <= 0 || t >= 1) return null;
	return (
		<div style={{position: 'absolute', inset: 0, perspective: 1400, pointerEvents: 'none'}}>
			{Array.from({length: n}).map((_, i) => {
				const a = (i / n) * Math.PI * 2 + rand(i * 3) * 0.4;
				const d = 120 + rand(i * 7) * 520;
				const sz = 90 + rand(i * 11) * 220;
				const e = EASE.snap(t);
				const x = cx + Math.cos(a) * d * e * 2.2;
				const y = cy + Math.sin(a) * d * e * 2.0 + t * t * 900; // gravity
				const z = lerp(0, 300 + rand(i) * 900, e);
				const pts = [0, 1, 2].map((k) => {
					const aa = k * 2.1 + rand(i * 13 + k) * 1.2;
					return `${50 + Math.cos(aa) * 50}% ${50 + Math.sin(aa) * 50}%`;
				});
				return (
					<div
						key={i}
						style={{
							position: 'absolute',
							left: x - sz / 2,
							top: y - sz / 2,
							width: sz,
							height: sz,
							clipPath: `polygon(${pts.join(',')})`,
							background: `linear-gradient(${rand(i) * 360}deg, rgba(200,215,255,0.22), rgba(255,255,255,0.04) 45%, rgba(230,63,109,${0.18 * rand(i * 5)}) 100%)`,
							border: '1px solid rgba(255,255,255,0.35)',
							transform: `translateZ(${z}px) rotate3d(${rand(i)}, ${rand(i + 1)}, ${rand(i + 2)}, ${e * (300 + rand(i * 9) * 400)}deg)`,
							opacity: 1 - clamp01((t - 0.6) / 0.4),
							backdropFilter: 'blur(2px)',
						}}
					/>
				);
			})}
		</div>
	);
};

const TAB_TITLES = [
	['🗺️', 'plumbers near me'],
	['⭐', 'Bellwood · Reviews'],
	['🌐', 'bellwoodplumbing-tx'],
	['📷', '@bellwood.plumbing'],
	['🔎', 'bellwood plumbing email'],
	['📇', 'Local directory'],
	['🗺️', 'Lone Star Drain Co.'],
	['⭐', 'Capitol City Plumbing'],
	['🔎', 'plumber austin website'],
	['📄', 'Contact Us'],
	['🗺️', 'Eastside Pipe & Drain'],
	['📊', 'leads.xlsx'],
];

/** The tabs you opened tonight, orbiting in 3D. `count` tabs visible, `spin` in turns. */
export const TabSwirl: React.FC<{count: number; spin: number; y?: number; opacity?: number}> = ({count, spin, y = 960, opacity = 1}) => (
	<div style={{position: 'absolute', left: 540, top: y, width: 0, height: 0, perspective: 1600, opacity}}>
		<div style={{position: 'absolute', ...P3D, transform: `rotateX(-14deg) rotateY(${spin * 360}deg)`}}>
			{Array.from({length: count}).map((_, i) => {
				const ang = (i / 47) * 360 * 3.1;
				const h = -520 + (i / 47) * 1040;
				const [e, title] = TAB_TITLES[i % TAB_TITLES.length];
				return (
					<div
						key={i}
						style={{
							position: 'absolute',
							left: -170,
							top: h,
							width: 340,
							height: 64,
							borderRadius: '14px 14px 4px 4px',
							background: 'linear-gradient(180deg, #24262D, #17181D)',
							border: '1.5px solid rgba(244,244,246,0.14)',
							display: 'flex',
							alignItems: 'center',
							gap: 12,
							padding: '0 16px',
							fontFamily: FONTS.sans,
							fontSize: 22,
							color: COLORS.textDim,
							whiteSpace: 'nowrap',
							overflow: 'hidden',
							transform: `rotateY(${ang}deg) translateZ(470px)`,
							backfaceVisibility: 'hidden',
						}}
					>
						<Emoji c={e} size={22} />
						{title}
						<div style={{flex: 1}} />
						<span style={{color: COLORS.textMute}}>✕</span>
					</div>
				);
			})}
		</div>
	</div>
);
