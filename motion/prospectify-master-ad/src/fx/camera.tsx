import React from 'react';
import {Img, staticFile} from 'remotion';
import {EASE} from '../constants/theme';
import {clamp01, lerp, rand} from '../motion/anim';

/**
 * Virtual camera. Keyframes describe which world point sits at the frame centre, at what zoom.
 *   [frame, cx, cy, scale, rotateDeg?, ease?]
 * Velocity drives motion blur, so whips smear and holds stay razor sharp.
 */
export type CamKey = [number, number, number, number, number?, ((t: number) => number)?];

export const camAt = (f: number, keys: CamKey[]) => {
	const at = (fr: number) => {
		if (fr <= keys[0][0]) return {cx: keys[0][1], cy: keys[0][2], s: keys[0][3], r: keys[0][4] ?? 0};
		for (let i = 0; i < keys.length - 1; i++) {
			const a = keys[i];
			const b = keys[i + 1];
			if (fr <= b[0]) {
				const e = b[5] ?? EASE.glide;
				const t = e(clamp01((fr - a[0]) / Math.max(1, b[0] - a[0])));
				// zoom is interpolated geometrically so push-ins feel linear to the eye
				const s = a[3] * Math.pow(b[3] / a[3], t);
				return {cx: lerp(a[1], b[1], t), cy: lerp(a[2], b[2], t), s, r: lerp(a[4] ?? 0, b[4] ?? 0, t)};
			}
		}
		const z = keys[keys.length - 1];
		return {cx: z[1], cy: z[2], s: z[3], r: z[4] ?? 0};
	};
	const c = at(f);
	const n = at(f + 1);
	const v = Math.hypot(n.cx - c.cx, n.cy - c.cy) * c.s + Math.abs(Math.log(n.s / c.s)) * 900;
	return {...c, blur: Math.min(5, Math.max(0, (v - 14) * 0.08))}; // shutter blur (CameraMotionBlur) does the heavy lifting
};

export const Camera: React.FC<{
	f: number;
	keys: CamKey[];
	w?: number;
	h?: number;
	blur?: boolean;
	shake?: number;
	children: React.ReactNode;
	style?: React.CSSProperties;
}> = ({f, keys, w = 1080, h = 1920, blur = true, shake = 0, children, style}) => {
	const c = camAt(f, keys);
	const sx = shake ? (rand(f * 1.7) - 0.5) * shake : 0;
	const sy = shake ? (rand(f * 2.3 + 9) - 0.5) * shake : 0;
	return (
		<div
			style={{
				position: 'absolute',
				left: 0,
				top: 0,
				width: w,
				height: h,
				transformOrigin: '0 0',
				transform: `translate(${w / 2 + sx}px, ${h / 2 + sy}px) rotate(${c.r}deg) scale(${c.s}) translate(${-c.cx}px, ${-c.cy}px)`,
				filter: blur && c.blur > 0.4 ? `blur(${c.blur}px)` : undefined,
				...style,
			}}
		>
			{children}
		</div>
	);
};

/** Film grain + vignette: the difference between "rendered" and "shot". */
export const Grain: React.FC<{f: number; opacity?: number}> = ({f, opacity = 0.055}) => (
	<div
		style={{
			position: 'absolute',
			inset: 0,
			backgroundImage: `url(${staticFile('fx/grain.png')})`,
			backgroundSize: '512px 512px',
			backgroundPosition: `${Math.floor(rand(f) * 512)}px ${Math.floor(rand(f + 77) * 512)}px`,
			mixBlendMode: 'overlay',
			opacity,
			pointerEvents: 'none',
		}}
	/>
);

export const Vignette: React.FC<{strength?: number}> = ({strength = 0.55}) => (
	<div style={{position: 'absolute', inset: 0, background: `radial-gradient(120% 85% at 50% 45%, rgba(0,0,0,0) 55%, rgba(0,0,0,${strength}) 100%)`, pointerEvents: 'none'}} />
);

/** Light sweep across a surface (premium "lock" moment). */
export const Sheen: React.FC<{t: number; width?: number; opacity?: number}> = ({t, width = 260, opacity = 0.16}) =>
	t <= 0 || t >= 1 ? null : (
		<div style={{position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', borderRadius: 'inherit'}}>
			<div
				style={{
					position: 'absolute',
					top: '-20%',
					bottom: '-20%',
					width,
					left: `${lerp(-30, 130, t)}%`,
					background: `linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,${opacity}) 50%, rgba(255,255,255,0) 100%)`,
					transform: 'skewX(-20deg)',
				}}
			/>
		</div>
	);

/** 3D entrance: tilts in from depth and settles flat. */
export const tilt3d = (t: number, rx = 28, ry = 0, z = -260) =>
	`perspective(1800px) translateZ(${lerp(z, 0, t)}px) rotateX(${lerp(rx, 0, t)}deg) rotateY(${lerp(ry, 0, t)}deg)`;

export const EMOJI = '"Noto Color Emoji", sans-serif';
export const Emoji: React.FC<{c: string; size: number; style?: React.CSSProperties}> = ({c, size, style}) => (
	<span style={{fontFamily: EMOJI, fontSize: size, lineHeight: 1, display: 'inline-block', ...style}}>{c}</span>
);

export {Img};
