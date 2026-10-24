import {Easing, interpolate, spring} from 'remotion';

const CL = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

/** Courbes maison : entrée rapide qui se pose, sortie nette. Très peu de rebond. */
export const OUT = Easing.bezier(0.22, 1, 0.36, 1);
export const IN_OUT = Easing.bezier(0.65, 0, 0.35, 1);
export const EXIT = Easing.bezier(0.55, 0, 0.75, 0.2);

/** 0 → 1 entre l'image `a` et `a + d`. */
export const ramp = (f: number, a: number, d = 8, easing = OUT) => interpolate(f, [a, a + Math.max(1, d)], [0, 1], {...CL, easing});

/** Visible de `a` à `b`, avec une entrée et une sortie courtes. */
export const win = (f: number, a: number, b: number, i = 7, o = 6) => Math.min(ramp(f, a, i), 1 - ramp(f, b - o, o, EXIT));

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

/** Ressort maîtrisé (amorti fort) — pour les éléments qui doivent « se poser ». */
export const settle = (f: number, a: number, fps: number, damping = 18) => spring({frame: f - a, fps, config: {damping, stiffness: 180, mass: 0.7}});

/** Interpolation par images-clés, avec une courbe douce entre chaque clé. */
export const keyed = (f: number, keys: [number, number][], easing = IN_OUT) => {
	if (f <= keys[0][0]) return keys[0][1];
	for (let i = 0; i < keys.length - 1; i++) {
		const [fa, va] = keys[i];
		const [fb, vb] = keys[i + 1];
		if (f <= fb) return lerp(va, vb, easing(clamp01((f - fa) / Math.max(1, fb - fa))));
	}
	return keys[keys.length - 1][1];
};
