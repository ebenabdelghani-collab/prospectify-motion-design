import React from 'react';
import {Img, staticFile} from 'remotion';
import {COLORS, EASE, FONTS} from '../constants/theme';
import {clamp01, lerp, ramp} from '../motion/anim';

/** The official Prospectify mark — transparent cut of the supplied asset, never redrawn. */
export const Mark: React.FC<{size: number; style?: React.CSSProperties}> = ({size, style}) => (
	<Img
		src={staticFile('prospectify/prospectify-mark.png')}
		style={{width: size, height: size * (469 / 465), display: 'block', ...style}}
	/>
);

/** Precise arrow cursor. */
export const Cursor: React.FC<{x: number; y: number; scale?: number; opacity?: number; blur?: number}> = ({
	x,
	y,
	scale = 1,
	opacity = 1,
	blur = 0,
}) => (
	<svg
		width={56}
		height={56}
		viewBox="0 0 28 28"
		style={{
			position: 'absolute',
			left: x - 6,
			top: y - 4,
			transform: `scale(${scale})`,
			transformOrigin: '6px 4px',
			opacity,
			filter: `drop-shadow(0 6px 14px rgba(0,0,0,0.55))${blur > 0.2 ? ` blur(${blur}px)` : ''}`,
			zIndex: 50,
		}}
	>
		<path
			d="M6 4 L6 22 L10.6 17.8 L13.6 24.4 L16.6 23.1 L13.7 16.7 L19.8 16.7 Z"
			fill="#F4F4F6"
			stroke="#050505"
			strokeWidth={1.4}
			strokeLinejoin="round"
		/>
	</svg>
);

/** Check that draws itself and locks. `t` 0→1. */
export const Check: React.FC<{size: number; t: number; color?: string; filled?: boolean}> = ({
	size,
	t,
	color = COLORS.accent,
	filled = true,
}) => {
	const ring = EASE.snap(clamp01(t * 1.6));
	const tick = EASE.lock(clamp01((t - 0.25) / 0.75));
	return (
		<svg width={size} height={size} viewBox="0 0 40 40" style={{display: 'block', flexShrink: 0}}>
			<circle
				cx={20}
				cy={20}
				r={18}
				fill={filled ? color : 'none'}
				stroke={color}
				strokeWidth={filled ? 0 : 2.5}
				style={{transform: `scale(${lerp(0.6, 1, ring)})`, transformOrigin: '20px 20px', opacity: ring}}
			/>
			<path
				d="M12 20.5 L17.6 26 L28.5 14.5"
				fill="none"
				stroke={filled ? '#FFFFFF' : color}
				strokeWidth={3.6}
				strokeLinecap="round"
				strokeLinejoin="round"
				pathLength={1}
				strokeDasharray={1}
				strokeDashoffset={1 - tick}
			/>
		</svg>
	);
};

/**
 * A single line of type revealed through a mask (rises in, rises out).
 * Words arrive with a micro-stagger so lines feel set, not faded.
 */
export const MaskLine: React.FC<{
	f: number;
	inAt: number;
	outAt?: number;
	text: string;
	style?: React.CSSProperties;
	inDur?: number;
	outDur?: number;
	stagger?: number;
	align?: 'left' | 'center';
}> = ({f, inAt, outAt = 1e9, text, style, inDur = 14, outDur = 9, stagger = 2.5, align = 'left'}) => {
	const words = text.split(' ');
	return (
		<div
			style={{
				display: 'flex',
				flexWrap: 'nowrap',
				justifyContent: align === 'center' ? 'center' : 'flex-start',
				overflow: 'hidden',
				paddingBottom: '0.12em',
				marginBottom: '-0.12em',
				fontFamily: FONTS.sans,
				...style,
			}}
		>
			{words.map((raw, i) => {
				const tin = ramp(f, inAt + i * stagger, inDur, EASE.snap);
				const tout = ramp(f, outAt + i * (stagger * 0.6), outDur, EASE.exit);
				const y = (1 - tin) * 105 - tout * 105;
				// *word* → italic serif accent, **word** → italic serif in the brand accent
				const hot = raw.startsWith('**');
				const ital = raw.startsWith('*');
				const w = raw.replace(/\*/g, '');
				return (
					<span
						key={i}
						style={{
							display: 'inline-block',
							transform: `translateY(${y}%)${ital ? ` rotate(${(1 - tin) * -6}deg)` : ''}`,
							whiteSpace: 'pre',
							...(ital
								? {fontFamily: FONTS.serif, fontStyle: 'italic', fontWeight: 400, letterSpacing: '-0.02em', fontSize: '1.12em', lineHeight: 0.9, color: hot ? COLORS.accent : undefined}
								: {}),
						}}
					>
						{w}
						{i < words.length - 1 ? ' ' : ''}
					</span>
				);
			})}
		</div>
	);
};

export const Abs: React.FC<{style?: React.CSSProperties; children?: React.ReactNode}> = ({style, children}) => (
	<div style={{position: 'absolute', ...style}}>{children}</div>
);

/** Skeleton shimmer bar (pending state). */
export const Skeleton: React.FC<{w: number | string; h: number; f: number; seed?: number; style?: React.CSSProperties}> = ({
	w,
	h,
	f,
	seed = 0,
	style,
}) => {
	const phase = ((f + seed * 7) % 40) / 40;
	return (
		<div
			style={{
				width: w,
				height: h,
				borderRadius: h / 2,
				background: `linear-gradient(90deg, rgba(244,244,246,0.06) ${phase * 100 - 30}%, rgba(244,244,246,0.13) ${
					phase * 100
				}%, rgba(244,244,246,0.06) ${phase * 100 + 30}%)`,
				...style,
			}}
		/>
	);
};
