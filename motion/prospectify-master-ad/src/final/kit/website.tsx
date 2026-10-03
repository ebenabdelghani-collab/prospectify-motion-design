import React from 'react';
import {C, EASE, FONT, clamp01, lerp, ramp} from '../tokens';
import {Icon, Star} from './icons';
import {Photo} from './media';

/**
 * WebsiteAssembler — the client's site builds itself region by region.
 * steps: [grid, header, hero copy, CTA, services, imagery, reviews, booking]
 * With `labels`, each prompt section label travels into its region and becomes it.
 * (The client site is deliberately NOT Prospectify-branded: its own warm palette.)
 */
export type SiteTheme = {bg: string; ink: string; dim: string; brand: string; card: string; img: [string, string, string]};
export type SiteContent = {name: string; kicker: string; h1: string; sub: string; cta: string; services: [string, string, string]; rating: string; booking: boolean; hero: string; serviceImgs: [string, string, string]};

export const BELLA_THEME: SiteTheme = {bg: '#F3EDE3', ink: '#221B16', dim: '#7A6E63', brand: '#A9472A', card: '#FBF8F3', img: ['#E8A15A', '#B4532A', '#3A1E14']};
export const BELLA: SiteContent = {
	name: 'BELLA FORNO',
	kicker: 'Trattoria · East Austin',
	h1: 'Wood-fired.\nHand-made.\nEast Austin.',
	sub: 'Neapolitan pizza and fresh pasta, every night from 5 pm.',
	cta: 'Book a table',
	services: ['Wood-fired pizza', 'Fresh pasta', 'Weekend brunch'],
	rating: '4.8 · 312 Google reviews',
	booking: true,
	hero: 'oven_2',
	serviceImgs: ['pizza_4', 'pasta_5', 'brunch_1'],
};
export const HOOK_THEME: SiteTheme = {bg: '#EEF1EC', ink: '#18211C', dim: '#66736A', brand: '#2F5E46', card: '#F8FAF7', img: ['#9CC3A4', '#4F7F61', '#1C3326']};
export const HOOK_SITE: SiteContent = {
	name: 'MARLOW FLORALS',
	kicker: 'Florist · Since 2009',
	h1: 'Flowers for\nevery kind\nof moment.',
	sub: 'Same-day bouquets, weddings and events.',
	cta: 'Order flowers',
	services: ['Same-day bouquets', 'Weddings', 'Events'],
	rating: '4.9 · 128 reviews',
	booking: false,
	hero: 'florist_1',
	serviceImgs: ['florist_0', 'florist_3', 'florist_4'],
};

export const SITE_W = 900;
export const SITE_H = 1040;
// region rects in site coordinates (also used as morph targets for the prompt labels)
export const REGIONS = {
	grid: {x: 0, y: 0, w: 900, h: 1040},
	header: {x: 0, y: 0, w: 900, h: 84},
	hero: {x: 48, y: 128, w: 420, h: 280},
	cta: {x: 48, y: 432, w: 268, h: 70},
	services: {x: 48, y: 552, w: 804, h: 190},
	imagery: {x: 500, y: 118, w: 352, h: 392},
	reviews: {x: 48, y: 776, w: 804, h: 70},
	booking: {x: 48, y: 874, w: 804, h: 120},
};
export const STEP_KEYS = ['grid', 'header', 'hero', 'cta', 'services', 'imagery', 'reviews', 'booking'] as const;

const reveal = (f: number, at: number) => ramp(f, at, 16, EASE.FAST_LOCK);

/** A believable "photograph" without stock imagery: warm light, depth falloff and grain. */
export const FirePhoto: React.FC<{theme: SiteTheme; w: number; h: number; seed?: number; style?: React.CSSProperties}> = ({theme, w, h, seed = 0, style}) => (
	<div
		style={{
			width: w,
			height: h,
			borderRadius: 14,
			overflow: 'hidden',
			position: 'relative',
			background: `radial-gradient(${60 + seed * 8}% ${55 + seed * 6}% at ${30 + seed * 22}% ${70 - seed * 10}%, ${theme.img[0]} 0%, ${theme.img[1]} 38%, ${theme.img[2]} 100%)`,
			...style,
		}}
	>
		<div style={{position: 'absolute', inset: 0, background: `radial-gradient(40% 30% at ${70 - seed * 15}% 25%, rgba(255,240,220,0.35) 0%, rgba(255,240,220,0) 70%)`}} />
		<div style={{position: 'absolute', left: '-10%', right: '-10%', bottom: '-30%', height: '70%', borderRadius: '50%', background: 'radial-gradient(closest-side, rgba(0,0,0,0.0), rgba(0,0,0,0.35))'}} />
	</div>
);

const Region: React.FC<{t: number; r: {x: number; y: number; w: number; h: number}; children: React.ReactNode; style?: React.CSSProperties}> = ({t, r, children, style}) =>
	t <= 0 ? null : (
		<div
			style={{
				position: 'absolute',
				left: r.x,
				top: r.y,
				width: r.w,
				height: r.h,
				clipPath: `inset(0 ${(1 - t) * 100}% 0 0 round 10px)`,
				transform: `translateY(${(1 - t) * 16}px)`,
				opacity: Math.min(1, t * 1.6),
				...style,
			}}
		>
			{children}
		</div>
	);

export const Website: React.FC<{f: number; steps: number[]; theme: SiteTheme; c: SiteContent}> = ({f, steps, theme, c}) => {
	const R = REGIONS;
	const tGrid = reveal(f, steps[0]);
	const done = ramp(f, steps[7] + 8, 20);
	const t = (i: number) => reveal(f, steps[i]);
	const sans = FONT.sans;
	return (
		<div style={{position: 'absolute', left: 0, top: 0, width: SITE_W, height: SITE_H, overflow: 'hidden', fontFamily: sans, color: theme.ink}}>
			<div style={{position: 'absolute', inset: 0, background: theme.bg, opacity: tGrid, clipPath: `inset(0 0 ${(1 - tGrid) * 100}% 0)`}} />
			{/* grid: the page structure appears first, then hands over to content */}
			<svg width={SITE_W} height={SITE_H} style={{position: 'absolute', inset: 0, opacity: tGrid * (1 - done) * 0.9}}>
				{Array.from({length: 13}).map((_, i) => (
					<line key={i} x1={48 + i * 67} x2={48 + i * 67} y1={0} y2={SITE_H * tGrid} stroke={theme.dim} strokeOpacity={0.16} strokeWidth={1} />
				))}
				{Object.entries(R)
					.filter(([k]) => k !== 'grid')
					.map(([k, r], i) => (
						<rect key={k} x={r.x} y={r.y} width={r.w * clamp01(tGrid * 1.4 - i * 0.06)} height={r.h} rx={10} fill="none" stroke={theme.brand} strokeOpacity={0.35} strokeDasharray="6 6" strokeWidth={1.5} />
					))}
			</svg>
			<Region t={t(1)} r={R.header}>
				<div style={{height: '100%', display: 'flex', alignItems: 'center', padding: '0 48px', borderBottom: `1px solid ${theme.dim}33`}}>
					<div style={{fontSize: 24, fontWeight: 800, letterSpacing: '0.18em'}}>{c.name}</div>
					<div style={{flex: 1}} />
					{['Menu', 'About', 'Contact'].map((l) => (
						<div key={l} style={{fontSize: 18, fontWeight: 600, color: theme.dim, marginLeft: 30}}>
							{l}
						</div>
					))}
					<div style={{marginLeft: 30, height: 42, padding: '0 18px', borderRadius: 21, background: theme.ink, color: theme.bg, fontSize: 16, fontWeight: 700, display: 'flex', alignItems: 'center'}}>{c.cta}</div>
				</div>
			</Region>
			<Region t={t(2)} r={R.hero}>
				<div style={{fontSize: 17, fontWeight: 700, letterSpacing: '0.16em', color: theme.brand, textTransform: 'uppercase'}}>{c.kicker}</div>
				<div style={{fontSize: 60, fontWeight: 800, letterSpacing: '-0.045em', lineHeight: 0.98, marginTop: 14, whiteSpace: 'pre-line'}}>{c.h1}</div>
				<div style={{fontSize: 20, fontWeight: 500, color: theme.dim, marginTop: 18, lineHeight: 1.35, width: 380}}>{c.sub}</div>
			</Region>
			<Region t={t(3)} r={R.cta}>
				<div style={{height: '100%', borderRadius: 35, background: theme.brand, color: '#fff', fontSize: 22, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, boxShadow: `0 12px 30px ${theme.brand}55`}}>
					{c.cta}
					<Icon n="arrowRight" size={22} color="#fff" sw={2.4} />
				</div>
			</Region>
			<Region t={t(5)} r={R.imagery}>
				<Photo n={c.hero} w={R.imagery.w} h={R.imagery.h} r={14} />
			</Region>
			<Region t={t(4)} r={R.services}>
				<div style={{display: 'flex', gap: 24, height: '100%'}}>
					{c.services.map((s, i) => (
						<div key={s} style={{flex: 1, borderRadius: 14, background: theme.card, border: `1px solid ${theme.dim}22`, overflow: 'hidden', display: 'flex', flexDirection: 'column'}}>
							<div style={{height: 108, opacity: t(5)}}>
								<Photo n={c.serviceImgs[i]} w={252} h={108} />
							</div>
							<div style={{padding: '16px 18px', fontSize: 21, fontWeight: 700, letterSpacing: '-0.01em'}}>{s}</div>
						</div>
					))}
				</div>
			</Region>
			<Region t={t(6)} r={R.reviews}>
				<div style={{height: '100%', borderRadius: 14, background: theme.card, border: `1px solid ${theme.dim}22`, display: 'flex', alignItems: 'center', gap: 12, padding: '0 24px', fontSize: 21, fontWeight: 700}}>
					{[0, 1, 2, 3, 4].map((i) => (
						<Star key={i} size={24} />
					))}
					<span style={{marginLeft: 6}}>{c.rating}</span>
				</div>
			</Region>
			<Region t={t(7)} r={R.booking}>
				<div style={{height: '100%', borderRadius: 16, background: theme.ink, color: theme.bg, display: 'flex', alignItems: 'center', gap: 16, padding: '0 22px'}}>
					{(c.booking ? [['calendar', 'Fri, Oct 10'], ['clock', '7:30 pm'], ['user', '2 guests']] : [['pin', 'Deliver to'], ['calendar', 'Today'], ['clock', 'by 6 pm']]).map(([ic, l]) => (
						<div key={l} style={{flex: 1, height: 70, borderRadius: 12, border: `1px solid ${theme.bg}33`, display: 'flex', alignItems: 'center', gap: 10, padding: '0 16px', fontSize: 19, fontWeight: 600}}>
							<Icon n={ic} size={22} color={theme.bg} sw={2} />
							{l}
						</div>
					))}
					<div style={{height: 70, padding: '0 26px', borderRadius: 12, background: theme.brand, display: 'flex', alignItems: 'center', fontSize: 20, fontWeight: 800, color: '#fff'}}>{c.booking ? 'Reserve' : 'Order'}</div>
				</div>
			</Region>
		</div>
	);
};

/** Mobile layout of the same site (responsive state). */
export const MobileSite: React.FC<{theme: SiteTheme; c: SiteContent}> = ({theme, c}) => (
	<div style={{position: 'absolute', inset: 0, background: theme.bg, fontFamily: FONT.sans, color: theme.ink, overflow: 'hidden'}}>
		<div style={{height: 64, display: 'flex', alignItems: 'center', padding: '0 22px', borderBottom: `1px solid ${theme.dim}33`}}>
			<div style={{fontSize: 17, fontWeight: 800, letterSpacing: '0.16em'}}>{c.name}</div>
			<div style={{flex: 1}} />
			<div style={{width: 22, height: 14, borderTop: `2.5px solid ${theme.ink}`, borderBottom: `2.5px solid ${theme.ink}`}} />
		</div>
		<Photo n={c.hero} w={344} h={190} r={14} style={{margin: '18px 18px 0'}} />
		<div style={{padding: '18px 22px 0'}}>
			<div style={{fontSize: 13, fontWeight: 700, letterSpacing: '0.16em', color: theme.brand, textTransform: 'uppercase'}}>{c.kicker}</div>
			<div style={{fontSize: 40, fontWeight: 800, letterSpacing: '-0.045em', lineHeight: 0.98, marginTop: 10, whiteSpace: 'pre-line'}}>{c.h1}</div>
			<div style={{marginTop: 18, height: 54, borderRadius: 27, background: theme.brand, color: '#fff', fontSize: 18, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>{c.cta}</div>
			<div style={{marginTop: 14, display: 'flex', alignItems: 'center', gap: 6, fontSize: 15, fontWeight: 700}}>
				<Star size={18} /> {c.rating}
			</div>
		</div>
	</div>
);

/** Browser frame used around the client site (neutral, no third-party branding). */
export const BrowserFrame: React.FC<{w: number; h: number; url: string; children: React.ReactNode; left?: React.ReactNode; style?: React.CSSProperties}> = ({w, h, url, children, left, style}) => (
	<div style={{position: 'absolute', width: w, height: h, borderRadius: 26, overflow: 'hidden', background: '#17171a', border: `1.5px solid ${C.lineStrong}`, boxShadow: '0 60px 140px rgba(0,0,0,0.6)', ...style}}>
		<div style={{height: 58, display: 'flex', alignItems: 'center', gap: 10, padding: '0 22px', borderBottom: `1px solid ${C.line}`}}>
			{['#4a4a52', '#4a4a52', '#4a4a52'].map((c, i) => (
				<div key={i} style={{width: 13, height: 13, borderRadius: 7, background: c}} />
			))}
			{left}
			<div style={{marginLeft: 18, flex: 1, height: 34, borderRadius: 10, background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', padding: '0 14px', fontFamily: FONT.sans, fontSize: 18, fontWeight: 500, color: C.text3}}>{url}</div>
		</div>
		<div style={{position: 'absolute', left: 0, top: 58, right: 0, bottom: 0, overflow: 'hidden'}}>{children}</div>
	</div>
);

export const lerpN = lerp;
