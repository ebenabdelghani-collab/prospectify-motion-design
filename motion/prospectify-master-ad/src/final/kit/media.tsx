import React from 'react';
import {Img, staticFile} from 'remotion';

/**
 * Real imagery. Photos: CC0 (public domain) via Openverse — see public/final/photos/CREDITS.json.
 * Map: real OpenStreetMap render of central / East Austin (© OpenStreetMap contributors, ODbL) —
 * public/final/map/east-austin-z16.png, 2048×2560 px at zoom 16.
 */
export const photo = (name: string) => staticFile(`final/photos/${name}.jpg`);

export const Photo: React.FC<{n: string; w: number | string; h: number | string; r?: number; style?: React.CSSProperties; pos?: string}> = ({n, w, h, r = 0, style, pos = '50% 50%'}) => (
	<div style={{width: w, height: h, borderRadius: r, overflow: 'hidden', flexShrink: 0, background: '#ddd', ...style}}>
		<Img src={photo(n)} style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: pos, display: 'block'}} />
	</div>
);

export const BIZ_PHOTOS: Record<string, string[]> = {
	bella: ['pizza_4', 'oven_2', 'pasta_5', 'tiramisu_5', 'wine_0', 'chef_2', 'oven_0', 'pasta_1', 'pizza_5', 'tiramisu_2', 'oven_3', 'bar_2', 'pizza_3', 'pasta_4', 'wine_2'],
	lumen: ['nails_0', 'nails_1', 'nails_2', 'nails_4', 'nails_5', 'nails_3'],
	kinfolk: ['barber_0', 'barber_1', 'barber_2', 'barber_0'],
	juniper: ['cafe_0', 'cafe_1', 'cafe_2', 'cafe_3', 'cafe_5', 'cafe_4'],
	elsol: ['tacos_0', 'tacos_1', 'tacos_2', 'tacos_5'],
	southside: ['bbq_0', 'burger_0', 'bar_1', 'bar_3'],
	noodle: ['noodles_0', 'noodles_5', 'salad_5', 'salad_0'],
	marlow: ['florist_0', 'florist_1', 'florist_3', 'florist_4', 'florist_5', 'flowers_3', 'florist_2'],
	brunch: ['brunch_0', 'brunch_1', 'brunch_3', 'brunch_4', 'brunch_5', 'brunch_2'],
	bar: ['bar_4', 'bar_5', 'bar_2', 'bar_3', 'bar_1', 'bar_0'],
	green: ['salad_1', 'salad_2', 'salad_3', 'salad_4', 'salad_0'],
	misc: ['gym_0', 'dental_3', 'storefront_0', 'storefront_2', 'wine_1', 'wine_3', 'wine_5', 'chef_1', 'chef_3', 'chef_4', 'chef_5', 'pizza_0', 'pizza_2', 'oven_4', 'oven_5', 'pasta_0', 'pasta_2', 'pasta_3', 'tiramisu_1', 'tiramisu_3', 'tiramisu_4'],
};
export const ALL_PHOTOS = Object.values(BIZ_PHOTOS).flat();

/** Real map: (cx, cy) in map pixels sits at the centre of a w×h viewport at `zoom` (1 = native 256 px tiles). */
export const MAP = {src: () => staticFile('final/map/east-austin-z16.png'), w: 2048, h: 2560};
export const MapView: React.FC<{w: number; h: number; cx: number; cy: number; zoom?: number; children?: React.ReactNode; style?: React.CSSProperties}> = ({w, h, cx, cy, zoom = 1, children, style}) => (
	<div style={{position: 'relative', width: w, height: h, overflow: 'hidden', background: '#f2efe9', ...style}}>
		<div style={{position: 'absolute', left: w / 2 - cx * zoom, top: h / 2 - cy * zoom, width: MAP.w * zoom, height: MAP.h * zoom}}>
			<Img src={MAP.src()} style={{width: '100%', height: '100%', display: 'block'}} />
			<div style={{position: 'absolute', inset: 0}}>{children}</div>
		</div>
		<div style={{position: 'absolute', right: 6, bottom: 4, fontFamily: 'sans-serif', fontSize: 11, color: '#555', background: 'rgba(255,255,255,0.75)', padding: '1px 5px', borderRadius: 3}}>© OpenStreetMap contributors</div>
	</div>
);

/** Classic red map pin (generic, no brand). Positioned with its tip at (x, y). */
export const Pin: React.FC<{x: number; y: number; s?: number; color?: string; dot?: string; o?: number; label?: string}> = ({x, y, s = 1, color = '#EA4335', dot = '#B31412', o = 1, label}) => (
	<div style={{position: 'absolute', left: x - 14 * s, top: y - 40 * s, opacity: o, transformOrigin: '50% 100%'}}>
		<svg width={28 * s} height={40 * s} viewBox="0 0 28 40" style={{filter: 'drop-shadow(0 2px 2px rgba(0,0,0,0.35))', display: 'block'}}>
			<path d="M14 0C6.3 0 0 6.2 0 13.9 0 24.3 14 40 14 40s14-15.7 14-26.1C28 6.2 21.7 0 14 0Z" fill={color} />
			<circle cx={14} cy={14} r={5} fill={dot} />
		</svg>
		{label && (
			<div style={{position: 'absolute', left: 30 * s, top: 6 * s, whiteSpace: 'nowrap', fontFamily: 'Roboto, "Plus Jakarta Sans", sans-serif', fontSize: 15 * s, fontWeight: 700, color: '#B31412', textShadow: '0 0 3px #fff, 0 0 3px #fff, 0 0 3px #fff'}}>{label}</div>
		)}
	</div>
);
