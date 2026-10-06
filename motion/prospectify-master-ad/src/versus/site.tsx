import React from 'react';
import {Img} from 'remotion';
import {EASE, FONT, clamp01, lerp} from '../final/tokens';
import {photo} from '../final/kit/media';
import {Star} from '../final/kit/icons';

/**
 * The client site Prospectify's prompt produces (DEMO business "Bella Forno"). Studio-grade: dark warm
 * palette, full-bleed fire photography (CC0), heavy grotesk type, booking widget. The client's colours are
 * its own (ember + charcoal) — never the Prospectify accent.
 *
 * `b` = build progress 0..1 (sections assemble in order), `scroll` = page scroll in site px.
 */
const S = {bg: '#0f0b09', bg2: '#17110d', ink: '#f7efe6', dim: 'rgba(247,239,230,0.62)', ember: '#ff6b2c', ember2: '#ffb347', line: 'rgba(247,239,230,0.12)'};
export const SITE_DW = 1440;

const piece = (b: number, a: number, d = 0.14) => EASE.FAST_LOCK(clamp01((b - a) / d));
const rise = (t: number, px = 40): React.CSSProperties => ({opacity: t, transform: `translateY(${(1 - t) * px}px)`, filter: t < 1 ? `blur(${(1 - t) * 8}px)` : undefined});

const Wordmark: React.FC<{size: number}> = ({size}) => (
	<div style={{display: 'flex', alignItems: 'center', gap: size * 0.45}}>
		<div style={{width: size * 1.1, height: size * 1.1, borderRadius: '50%', background: `conic-gradient(from 200deg, ${S.ember}, ${S.ember2}, ${S.ember})`, boxShadow: `0 0 ${size}px rgba(255,107,44,0.5)`}} />
		<div style={{fontFamily: FONT.sans, fontWeight: 800, fontSize: size, letterSpacing: '0.18em', color: S.ink}}>BELLA FORNO</div>
	</div>
);

const MENU = [
	{n: 'Margherita DOP', d: 'San Marzano, fior di latte, basil', p: '$16', img: 'pizza_3'},
	{n: 'Diavola', d: 'Spicy salami, chili honey', p: '$19', img: 'pizza_5'},
	{n: 'Cacio e Pepe', d: 'Fresh tonnarelli, pecorino', p: '$18', img: 'pasta_5'},
	{n: 'Tiramisù', d: 'Mascarpone, espresso, cocoa', p: '$11', img: 'tiramisu_5'},
];

export const PremiumSite: React.FC<{b: number; scroll?: number; f: number}> = ({b, scroll = 0, f}) => {
	const nav = piece(b, 0.0);
	const hero = piece(b, 0.08, 0.2);
	const h1 = piece(b, 0.2);
	const cta = piece(b, 0.32);
	const menu = [0, 1, 2, 3].map((i) => piece(b, 0.42 + i * 0.07));
	const rev = piece(b, 0.72);
	const book = piece(b, 0.82);
	const zoom = 1.08 - 0.06 * clamp01(f / 600);
	return (
		<div style={{width: SITE_DW, background: S.bg, fontFamily: FONT.sans, color: S.ink, transform: `translateY(${-scroll}px)`}}>
			{/* HERO */}
			<div style={{position: 'relative', height: 900, overflow: 'hidden'}}>
				<div style={{position: 'absolute', inset: 0, opacity: hero, transform: `scale(${zoom + (1 - hero) * 0.08})`}}>
					<Img src={photo('oven_3')} style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: '50% 60%'}} />
				</div>
				<div style={{position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(15,11,9,0.92) 0%, rgba(15,11,9,0.65) 42%, rgba(15,11,9,0.05) 75%), linear-gradient(0deg, rgba(15,11,9,1) 0%, rgba(15,11,9,0) 30%)'}} />
				{/* nav */}
				<div style={{position: 'absolute', left: 0, right: 0, top: 0, height: 110, display: 'flex', alignItems: 'center', padding: '0 80px', gap: 52, ...rise(nav, -20)}}>
					<Wordmark size={22} />
					<div style={{flex: 1}} />
					{['Menu', 'Our fire', 'Private dining', 'Visit'].map((l) => (
						<div key={l} style={{fontSize: 19, fontWeight: 600, color: S.dim}}>
							{l}
						</div>
					))}
					<div style={{height: 52, padding: '0 26px', borderRadius: 26, background: S.ink, color: S.bg, fontSize: 18, fontWeight: 800, display: 'flex', alignItems: 'center'}}>Book a table</div>
				</div>
				<div style={{position: 'absolute', left: 80, top: 250, width: 760}}>
					<div style={{display: 'flex', alignItems: 'center', gap: 14, fontSize: 18, fontWeight: 700, letterSpacing: '0.22em', color: S.ember2, ...rise(h1)}}>
						<div style={{width: 40, height: 2, background: S.ember2}} />
						WOOD-FIRED · EAST AUSTIN
					</div>
					<div style={{marginTop: 26, fontSize: 112, fontWeight: 800, lineHeight: 0.94, letterSpacing: '-0.045em', ...rise(h1, 60)}}>
						Real fire.
						<br />
						<span style={{background: `linear-gradient(100deg, ${S.ember} 0%, ${S.ember2} 100%)`, WebkitBackgroundClip: 'text', color: 'transparent'}}>Real dough.</span>
					</div>
					<div style={{marginTop: 28, fontSize: 24, lineHeight: 1.45, color: S.dim, width: 560, ...rise(h1, 30)}}>Neapolitan pies from a 900° oak oven, 90 seconds each. Book tonight — walk-ins welcome till 11.</div>
					<div style={{marginTop: 42, display: 'flex', gap: 18, ...rise(cta, 30)}}>
						<div style={{height: 70, padding: '0 38px', borderRadius: 35, background: `linear-gradient(100deg, ${S.ember}, ${S.ember2})`, color: '#1a0d05', fontSize: 22, fontWeight: 800, display: 'flex', alignItems: 'center', boxShadow: '0 20px 50px rgba(255,107,44,0.35)'}}>Book a table</div>
						<div style={{height: 70, padding: '0 38px', borderRadius: 35, border: `1.5px solid ${S.line}`, color: S.ink, fontSize: 22, fontWeight: 700, display: 'flex', alignItems: 'center', backdropFilter: 'blur(8px)', background: 'rgba(255,255,255,0.04)'}}>See the menu</div>
					</div>
					<div style={{marginTop: 44, display: 'flex', alignItems: 'center', gap: 12, fontSize: 20, fontWeight: 700, ...rise(cta, 20)}}>
						{[0, 1, 2, 3, 4].map((i) => (
							<Star key={i} size={22} />
						))}
						<span>4.8</span>
						<span style={{color: S.dim, fontWeight: 600}}>· 312 reviews</span>
					</div>
				</div>
			</div>
			{/* MENU */}
			<div style={{padding: '70px 80px 40px', background: S.bg}}>
				<div style={{display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', ...rise(menu[0])}}>
					<div style={{fontSize: 64, fontWeight: 800, letterSpacing: '-0.04em'}}>Signature pies</div>
					<div style={{fontSize: 20, fontWeight: 700, color: S.ember2}}>Full menu →</div>
				</div>
				<div style={{display: 'flex', gap: 24, marginTop: 36}}>
					{MENU.map((m, i) => (
						<div key={m.n} style={{flex: 1, borderRadius: 26, overflow: 'hidden', background: S.bg2, border: `1px solid ${S.line}`, ...rise(menu[i], 60)}}>
							<div style={{height: 230, overflow: 'hidden'}}>
								<Img src={photo(m.img)} style={{width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${1.12 - 0.12 * menu[i]})`}} />
							</div>
							<div style={{padding: '22px 24px 26px'}}>
								<div style={{display: 'flex', justifyContent: 'space-between', fontSize: 25, fontWeight: 800, letterSpacing: '-0.02em'}}>
									<span>{m.n}</span>
									<span style={{color: S.ember2}}>{m.p}</span>
								</div>
								<div style={{marginTop: 8, fontSize: 17, color: S.dim}}>{m.d}</div>
							</div>
						</div>
					))}
				</div>
			</div>
			{/* REVIEWS + BOOKING */}
			<div style={{display: 'flex', gap: 24, padding: '30px 80px 90px'}}>
				<div style={{flex: 1.3, borderRadius: 28, padding: '44px 48px', background: `linear-gradient(135deg, #24160e, ${S.bg2})`, border: `1px solid ${S.line}`, ...rise(rev, 50)}}>
					<div style={{display: 'flex', gap: 6}}>
						{[0, 1, 2, 3, 4].map((i) => (
							<Star key={i} size={26} />
						))}
					</div>
					<div style={{marginTop: 22, fontSize: 38, fontWeight: 750, lineHeight: 1.2, letterSpacing: '-0.025em'}}>“The crust alone is worth the drive. Best pizza in East Austin.”</div>
					<div style={{marginTop: 20, fontSize: 18, color: S.dim, fontWeight: 600}}>Demo review · Bella Forno</div>
				</div>
				<div style={{flex: 1, borderRadius: 28, padding: '40px 44px', background: S.ink, color: S.bg, ...rise(book, 50)}}>
					<div style={{fontSize: 34, fontWeight: 800, letterSpacing: '-0.03em'}}>Book tonight</div>
					<div style={{marginTop: 8, fontSize: 18, fontWeight: 600, opacity: 0.6}}>Table for 2 · Today</div>
					<div style={{display: 'flex', gap: 12, marginTop: 26, flexWrap: 'wrap'}}>
						{['6:30', '7:00', '7:30', '8:15', '9:00'].map((t, i) => (
							<div key={t} style={{height: 54, padding: '0 22px', borderRadius: 16, display: 'flex', alignItems: 'center', fontSize: 20, fontWeight: 800, background: i === 2 ? S.ember : 'rgba(15,11,9,0.06)', color: i === 2 ? '#1a0d05' : S.bg}}>
								{t}
							</div>
						))}
					</div>
					<div style={{marginTop: 26, height: 64, borderRadius: 18, background: S.bg, color: S.ink, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 21, fontWeight: 800}}>Confirm 7:30 PM</div>
				</div>
			</div>
		</div>
	);
};

/** Mobile version for the phone (screen width 390 virtual px). */
export const MobileSite: React.FC<{b: number; scroll?: number; f: number}> = ({b, scroll = 0, f}) => {
	const hero = piece(b, 0.0, 0.25);
	const h1 = piece(b, 0.15);
	const cards = [0, 1, 2].map((i) => piece(b, 0.4 + i * 0.12));
	return (
		<div style={{width: 390, background: S.bg, fontFamily: FONT.sans, color: S.ink, transform: `translateY(${-scroll}px)`}}>
			<div style={{position: 'relative', height: 560, overflow: 'hidden'}}>
				<div style={{position: 'absolute', inset: 0, opacity: hero, transform: `scale(${1.1 - 0.05 * clamp01(f / 500)})`}}>
					<Img src={photo('oven_0')} style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: '45% 50%'}} />
				</div>
				<div style={{position: 'absolute', inset: 0, background: 'linear-gradient(0deg, rgba(15,11,9,1) 8%, rgba(15,11,9,0.25) 60%, rgba(15,11,9,0.55) 100%)'}} />
				<div style={{position: 'absolute', left: 24, right: 24, top: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between', ...rise(hero, -10)}}>
					<Wordmark size={13} />
					<div style={{width: 34, height: 34, borderRadius: 17, background: 'rgba(255,255,255,0.1)', display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'center', justifyContent: 'center'}}>
						<div style={{width: 14, height: 2, background: S.ink}} />
						<div style={{width: 14, height: 2, background: S.ink}} />
					</div>
				</div>
				<div style={{position: 'absolute', left: 24, right: 24, bottom: 34}}>
					<div style={{fontSize: 12, fontWeight: 800, letterSpacing: '0.22em', color: S.ember2, ...rise(h1)}}>WOOD-FIRED · EAST AUSTIN</div>
					<div style={{marginTop: 10, fontSize: 52, fontWeight: 800, lineHeight: 0.95, letterSpacing: '-0.045em', ...rise(h1, 40)}}>
						Real fire.
						<br />
						<span style={{background: `linear-gradient(100deg, ${S.ember}, ${S.ember2})`, WebkitBackgroundClip: 'text', color: 'transparent'}}>Real dough.</span>
					</div>
					<div style={{marginTop: 20, height: 54, borderRadius: 27, background: `linear-gradient(100deg, ${S.ember}, ${S.ember2})`, color: '#1a0d05', fontSize: 17, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', ...rise(h1, 20)}}>Book a table</div>
				</div>
			</div>
			<div style={{padding: '18px 24px 30px'}}>
				<div style={{fontSize: 26, fontWeight: 800, letterSpacing: '-0.03em', ...rise(cards[0])}}>Signature pies</div>
				{MENU.slice(0, 3).map((m, i) => (
					<div key={m.n} style={{marginTop: 14, display: 'flex', gap: 14, alignItems: 'center', borderRadius: 20, padding: 10, background: S.bg2, border: `1px solid ${S.line}`, ...rise(cards[i], 30)}}>
						<Img src={photo(m.img)} style={{width: 74, height: 74, borderRadius: 14, objectFit: 'cover'}} />
						<div style={{flex: 1}}>
							<div style={{fontSize: 17, fontWeight: 800}}>{m.n}</div>
							<div style={{fontSize: 12, color: S.dim, marginTop: 3}}>{m.d}</div>
						</div>
						<div style={{fontSize: 17, fontWeight: 800, color: S.ember2, marginRight: 6}}>{m.p}</div>
					</div>
				))}
			</div>
		</div>
	);
};

/** WITHOUT: what a generic one-line prompt gives — a bland template. Colourful, but obviously default. */
export const GenericSite: React.FC<{b: number}> = ({b}) => {
	const t = (a: number) => clamp01((b - a) / 0.2);
	return (
		<div style={{width: SITE_DW, height: 900, background: '#ffffff', fontFamily: 'Arial, Helvetica, sans-serif', color: '#333'}}>
			<div style={{height: 90, background: '#2f6fdf', display: 'flex', alignItems: 'center', padding: '0 60px', gap: 40, color: '#fff', fontSize: 22, opacity: t(0)}}>
				<b style={{fontSize: 28}}>Restaurant</b>
				<div style={{flex: 1}} />
				<span>Home</span>
				<span>About</span>
				<span>Menu</span>
				<span>Contact</span>
			</div>
			<div style={{textAlign: 'center', paddingTop: 110, opacity: t(0.2)}}>
				<div style={{fontSize: 64, fontWeight: 700, color: '#222'}}>Welcome to Our Restaurant</div>
				<div style={{fontSize: 26, color: '#777', marginTop: 20}}>We serve the best food in town. Lorem ipsum dolor sit amet.</div>
				<div style={{display: 'inline-block', marginTop: 40, padding: '18px 40px', background: '#2f6fdf', color: '#fff', fontSize: 24, borderRadius: 4}}>Learn More</div>
			</div>
			<div style={{display: 'flex', gap: 30, padding: '80px 120px', opacity: t(0.45)}}>
				{['Our Food', 'Our Team', 'Contact Us'].map((x, i) => (
					<div key={x} style={{flex: 1, textAlign: 'center'}}>
						<div style={{height: 150, background: ['#f4c27a', '#9fd3a8', '#a9c4f2'][i], borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 60}}></div>
						<div style={{fontSize: 26, fontWeight: 700, marginTop: 18}}>{x}</div>
						<div style={{fontSize: 18, color: '#888', marginTop: 8}}>Lorem ipsum dolor sit amet.</div>
					</div>
				))}
			</div>
		</div>
	);
};

export const siteLerp = lerp;
