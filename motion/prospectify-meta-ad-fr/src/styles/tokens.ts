import {loadFont} from '@remotion/fonts';
import {staticFile} from 'remotion';
import TLjson from '../data/timeline.json';

/** Couleurs de production Prospectify (logo + site prospectify.net) — pas de violet, pas de rose pâle. */
export const C = {
	bg: '#09090b',
	surface: '#121218',
	surface2: '#17171e',
	line: 'rgba(255,255,255,0.09)',
	lineStrong: 'rgba(255,255,255,0.16)',
	white: '#F6F6F8',
	grey: '#A1A1AA',
	grey2: '#71717A',
	accent: '#f42562',
	accentBright: '#ff3b5f',
	accent2: '#ff5a45',
	accentRGB: '244,37,98',
	grad: 'linear-gradient(120deg, #f42562 0%, #ff3b5f 55%, #ff5a45 100%)',
	star: '#F5B400',
} as const;

export const FONT = '"Geist", system-ui, -apple-system, sans-serif';
let loaded = false;
export const loadFonts = () => {
	if (loaded) return;
	loaded = true;
	loadFont({family: 'Geist', url: staticFile('fonts/Geist-Variable.woff2'), weight: '100 900'});
};

/**
 * Zones (1080 × 1920). Tout ce qui compte reste dans la zone sûre des Reels :
 * 14 % en haut (~270 px) et 35 % en bas (~670 px) laissés à l'interface Instagram, 6 % sur les côtés.
 * Les titres, les visuels et les sous-titres ont chacun leur bande : le texte ne passe jamais sur un visuel.
 */
export const Z = {
	side: 70,
	headTop: 290,
	headH: 180,
	visTop: 500,
	visBottom: 1080,
	subTop: 1100,
	subH: 140,
} as const;

export type Head = {a: number; b: number; lines: string[]; accent: string[]};
export type Cap = {text: string; words: {w: string; accent: boolean}[]; a: number; b: number};
export const TL = TLjson as unknown as Record<string, number> & {HEAD: Head[]; CAPS: Cap[]; durationInFrames: number; fps: number};
