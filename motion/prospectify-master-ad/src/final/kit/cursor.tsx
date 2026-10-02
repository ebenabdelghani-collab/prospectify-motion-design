import React from 'react';
import {EASE, clamp01, lerp} from '../tokens';

export type CursorKey = [frame: number, x: number, y: number];

/** Position along keyframes; human-like travel = CAMERA ease with a slight arc. */
export const cursorAt = (f: number, keys: CursorKey[]) => {
	if (f <= keys[0][0]) return {x: keys[0][1], y: keys[0][2], v: 0};
	for (let i = 0; i < keys.length - 1; i++) {
		const [f0, x0, y0] = keys[i];
		const [f1, x1, y1] = keys[i + 1];
		if (f <= f1) {
			const t = EASE.CAMERA(clamp01((f - f0) / Math.max(1, f1 - f0)));
			const arc = Math.sin(Math.PI * t) * Math.min(40, Math.hypot(x1 - x0, y1 - y0) * 0.08);
			const tn = EASE.CAMERA(clamp01((f + 1 - f0) / Math.max(1, f1 - f0)));
			return {x: lerp(x0, x1, t) - arc * 0.3, y: lerp(y0, y1, t) - arc, v: Math.hypot(lerp(x0, x1, tn) - lerp(x0, x1, t), lerp(y0, y1, tn) - lerp(y0, y1, t))};
		}
	}
	const z = keys[keys.length - 1];
	return {x: z[1], y: z[2], v: 0};
};

/** TrackedCursor: macOS-style arrow. Clicks press it and emit a small ring. */
export const Cursor: React.FC<{f: number; keys: CursorKey[]; clicks?: number[]; show: [number, number]; scale?: number}> = ({f, keys, clicks = [], show, scale = 1.35}) => {
	if (f < show[0] - 8 || f > show[1] + 8) return null;
	const {x, y} = cursorAt(f, keys);
	const o = clamp01((f - (show[0] - 8)) / 8) * (1 - clamp01((f - show[1]) / 8));
	const c = clicks.find((k) => f >= k - 3 && f <= k + 18);
	const down = c !== undefined && f <= c + 2 ? lerp(1, 0.86, clamp01((f - (c - 3)) / 3)) : c !== undefined ? lerp(0.86, 1, EASE.UI(clamp01((f - c - 2) / 8))) : 1;
	const ring = c !== undefined && f >= c ? clamp01((f - c) / 16) : -1;
	return (
		<div style={{position: 'absolute', left: x, top: y, width: 0, height: 0, opacity: o, zIndex: 50, pointerEvents: 'none'}}>
			{ring >= 0 && (
				<div style={{position: 'absolute', left: -6 - 34 * ring, top: -6 - 34 * ring, width: 12 + 68 * ring, height: 12 + 68 * ring, borderRadius: '50%', border: `2px solid rgba(255,255,255,${0.55 * (1 - ring)})`}} />
			)}
			<svg width={34 * scale} height={34 * scale} viewBox="0 0 24 24" style={{position: 'absolute', left: -3 * scale, top: -2 * scale, transform: `scale(${down})`, transformOrigin: '3px 2px', filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.55))'}}>
				<path d="M4.5 2.5 L4.5 19.2 L8.9 15.1 L11.7 21.4 L14.6 20.1 L11.9 13.9 L18 13.9 Z" fill="#fff" stroke="#111" strokeWidth={1.1} strokeLinejoin="round" />
			</svg>
		</div>
	);
};
