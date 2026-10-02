import React from 'react';
import {EASE, clamp01, lerp} from '../tokens';

/**
 * SpatialCamera. Keys: [frame, cx, cy, scale, rotateX?, rotateY?, ease?]
 * The world point (cx, cy) sits at frame centre. Zoom interpolates geometrically so push-ins read linear.
 */
export type CamKey = [number, number, number, number, number?, number?, ((t: number) => number)?];

export const camAt = (f: number, keys: CamKey[]) => {
	if (f <= keys[0][0]) return {cx: keys[0][1], cy: keys[0][2], s: keys[0][3], rx: keys[0][4] ?? 0, ry: keys[0][5] ?? 0};
	for (let i = 0; i < keys.length - 1; i++) {
		const a = keys[i];
		const b = keys[i + 1];
		if (f <= b[0]) {
			const e = b[6] ?? EASE.CAMERA;
			const t = e(clamp01((f - a[0]) / Math.max(1, b[0] - a[0])));
			return {cx: lerp(a[1], b[1], t), cy: lerp(a[2], b[2], t), s: a[3] * Math.pow(b[3] / a[3], t), rx: lerp(a[4] ?? 0, b[4] ?? 0, t), ry: lerp(a[5] ?? 0, b[5] ?? 0, t)};
		}
	}
	const z = keys[keys.length - 1];
	return {cx: z[1], cy: z[2], s: z[3], rx: z[4] ?? 0, ry: z[5] ?? 0};
};

export const Cam: React.FC<{f: number; keys: CamKey[]; children: React.ReactNode; persp?: number; style?: React.CSSProperties}> = ({f, keys, children, persp = 2400, style}) => {
	const c = camAt(f, keys);
	return (
		<div style={{position: 'absolute', inset: 0, perspective: persp, perspectiveOrigin: '540px 960px', ...style}}>
			<div
				style={{
					position: 'absolute',
					left: 0,
					top: 0,
					width: 1080,
					height: 1920,
					transformOrigin: '0 0',
					transformStyle: 'preserve-3d',
					transform: `translate(540px, 960px) rotateX(${c.rx}deg) rotateY(${c.ry}deg) scale(${c.s}) translate(${-c.cx}px, ${-c.cy}px)`,
				}}
			>
				{children}
			</div>
		</div>
	);
};

/** Rect interpolation for FLIP-style continuity between two layouts. */
export type Rect = {x: number; y: number; w: number; h: number};
export const rectLerp = (a: Rect, b: Rect, t: number): Rect => ({x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t), w: lerp(a.w, b.w, t), h: lerp(a.h, b.h, t)});
