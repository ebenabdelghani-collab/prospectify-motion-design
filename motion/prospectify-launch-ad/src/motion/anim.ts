import {EASE} from '../constants/theme';

export const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** 0→1 progress starting at `start` lasting `dur` frames. */
export const ramp = (f: number, start: number, dur: number, ease: (t: number) => number = EASE.snap) =>
	ease(clamp01((f - start) / Math.max(1, dur)));

/** In-hold-out envelope: rises at `inAt`, falls at `outAt`. */
export const window = (
	f: number,
	inAt: number,
	outAt: number,
	inDur = 10,
	outDur = 8,
	easeIn = EASE.snap,
	easeOut = EASE.exit,
) => {
	if (f < inAt) return 0;
	if (f < outAt) return ramp(f, inAt, inDur, easeIn);
	return 1 - ramp(f, outAt, outDur, easeOut);
};

/** Characters visible given key-press frames (one char per key). */
export const typed = (text: string, keys: number[], f: number, prefilled = 0) =>
	text.slice(0, prefilled + keys.filter((k) => k <= f).length);

/** Linear char reveal over a span (for fast machine-written text). */
export const typedSpan = (text: string, f: number, start: number, end: number) =>
	text.slice(0, Math.round(text.length * clamp01((f - start) / Math.max(1, end - start))));

/** Keyframed path: [[frame, x, y], ...] with glide easing between points. */
export const path = (f: number, pts: [number, number, number][], ease = EASE.glide) => {
	if (f <= pts[0][0]) return {x: pts[0][1], y: pts[0][2], v: 0};
	for (let i = 0; i < pts.length - 1; i++) {
		const [f0, x0, y0] = pts[i];
		const [f1, x1, y1] = pts[i + 1];
		if (f <= f1) {
			const t = ease(clamp01((f - f0) / (f1 - f0)));
			const tn = ease(clamp01((f + 1 - f0) / (f1 - f0)));
			const x = lerp(x0, x1, t);
			const y = lerp(y0, y1, t);
			const v = Math.hypot(lerp(x0, x1, tn) - x, lerp(y0, y1, tn) - y);
			return {x, y, v};
		}
	}
	const last = pts[pts.length - 1];
	return {x: last[1], y: last[2], v: 0};
};

/** Deterministic pseudo-random in [0,1). */
export const rand = (seed: number) => {
	const x = Math.sin(seed * 9301.13 + 49297.7) * 233280.5;
	return x - Math.floor(x);
};

/** Short press pulse used for click feedback (1 → 0.94 → 1). */
export const press = (f: number, at: number, down = 3, up = 8) => {
	if (f < at - down || f > at + up) return 1;
	if (f <= at) return lerp(1, 0.94, clamp01((f - (at - down)) / down));
	return lerp(0.94, 1, EASE.snap(clamp01((f - at) / up)));
};
