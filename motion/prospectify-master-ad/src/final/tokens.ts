import {Easing, staticFile} from 'remotion';
import {loadFont} from '@remotion/fonts';
import gsap from 'gsap';
import {CustomEase} from 'gsap/CustomEase';
import TL from './timeline.json';

/**
 * PROSPECTIFY — production tokens, verified against prospectify.net CSS (motion-source/brand/BRAND_SOURCE.md).
 * Balance: ~82% near-black, ~13% white/grey structure, ~5% accent. The accent only guides attention.
 */
export const C = {
	bg: '#09090b',
	bg2: '#0d0d10',
	surface: '#111114',
	surface2: '#16161a',
	surface3: '#1c1c21',
	line: 'rgba(255,255,255,0.07)',
	lineStrong: 'rgba(255,255,255,0.12)',
	text: '#f5f5f7',
	text2: '#a1a1aa',
	text3: '#71717a',
	accent: '#f42562',
	accentBright: '#ff3b5f',
	accentDeep: '#c41850',
	accent2: '#ff5a45',
	accentSoft: 'rgba(244,37,98,0.12)',
	accentRGB: '244,37,98',
	grad: 'linear-gradient(120deg, #f42562 0%, #ff3b5f 55%, #ff5a45 100%)',
	star: '#F5B400',
	// third-party worlds (Act 1–3) use neutral greys, never the brand accent
	neutralBlue: '#8AB4F8',
} as const;

export const FONT = {
	sans: '"Plus Jakarta Sans", system-ui, sans-serif',
	mono: '"GeistMono", ui-monospace, monospace',
} as const;

let fontsLoaded = false;
export const loadFinalFonts = () => {
	if (fontsLoaded) return;
	fontsLoaded = true;
	loadFont({family: 'Plus Jakarta Sans', url: staticFile('fonts/PlusJakartaSans-Variable.woff2'), weight: '200 800'});
	loadFont({family: 'GeistMono', url: staticFile('fonts/GeistMono-Variable.woff2'), weight: '100 900'});
};

// ── Motion curves ───────────────────────────────────────────────────────────
// Prospectify motion: fast initiation → controlled deceleration → precise lock. Never bouncy.
gsap.registerPlugin(CustomEase);
const lockCurve = CustomEase.create(
	'pfLock',
	// fast attack, decelerates hard, overshoots by 0.6%, settles — a "seated" lock rather than a bounce
	'M0,0 C0.08,0.62 0.16,0.94 0.34,1.006 0.5,1.012 0.7,1.001 1,1',
);
const heavyCurve = CustomEase.create('pfHeavy', 'M0,0 C0.55,0 0.18,0.72 0.42,0.92 0.6,1 0.8,1 1,1');
export const EASE = {
	FAST_LOCK: (t: number) => lockCurve(t),
	UI: Easing.bezier(0.22, 1, 0.36, 1), // the site's own --ease-out
	CAMERA: Easing.bezier(0.6, 0.02, 0.18, 1),
	SOFT: Easing.bezier(0.4, 0, 0.2, 1),
	HEAVY: (t: number) => heavyCurve(t),
	OVERSHOOT: Easing.bezier(0.34, 1.4, 0.5, 1), // the site's own --ease-spring, used once or twice
	EXIT: Easing.bezier(0.7, 0, 0.84, 0),
	LINEAR: (t: number) => t,
};

// ── Timeline (generated from the real voiceover) ───────────────────────────
type VOEntry = {start: number; end: number; text: string; act: string};
export const T = TL as unknown as Record<string, number & number[]> & {
	VO: Record<string, VOEntry>;
	fps: number;
	durationInFrames: number;
	HOOK_PROMPT: string;
	FIND_PROMPT: string;
	CITY: string;
};
export const VO = (id: string) => (TL as unknown as {VO: Record<string, VOEntry>}).VO[id];

// ── Helpers ─────────────────────────────────────────────────────────────────
export const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const ramp = (f: number, start: number, dur: number, ease: (t: number) => number = EASE.UI) =>
	ease(clamp01((f - start) / Math.max(1, dur)));
export const win = (f: number, a: number, b: number, inD = 12, outD = 10, ei = EASE.UI, eo = EASE.EXIT) =>
	f < a ? 0 : f < b ? ramp(f, a, inD, ei) : 1 - ramp(f, b, outD, eo);
export const rand = (seed: number) => {
	const x = Math.sin(seed * 9301.13 + 49297.7) * 233280.5;
	return x - Math.floor(x);
};
export const typed = (text: string, keys: number[], f: number) => text.slice(0, keys.filter((k) => k <= f).length);
/** 1 → 0.95 → 1 press pulse at `at`. */
export const press = (f: number, at: number) =>
	f < at - 3 || f > at + 10 ? 1 : f <= at ? lerp(1, 0.95, (f - (at - 3)) / 3) : lerp(0.95, 1, EASE.UI(clamp01((f - at) / 10)));
/** Light pulse envelope peaking at `at`. */
export const pulse = (f: number, at: number, len = 30) => (f < at - 3 ? 0 : f < at ? (f - (at - 3)) / 3 : Math.max(0, 1 - (f - at) / len));
