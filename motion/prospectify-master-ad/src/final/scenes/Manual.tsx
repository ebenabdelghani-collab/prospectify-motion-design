import React from 'react';
import {C, EASE, FONT, T, clamp01, lerp, rand, ramp} from '../tokens';
import {Icon, Star} from '../kit/icons';
import {Kinetic, Mono} from '../kit/type';

/**
 * 2 · MANUAL PROSPECTING — the viewer's own evening. Browser windows pile up in depth:
 * 2 → 4 → 7 → 12 tabs, then a blur of other businesses, then: 0 pitches sent.
 * Neutral third-party styling (no real product UI or logos), never the brand accent.
 */
const W = 820;
const H = 560;
const ui = FONT.sans;
const G = {bg: '#1a1b1e', panel: '#222326', line: 'rgba(255,255,255,0.08)', t1: '#e8eaed', t2: '#9aa0a6', t3: '#6b7075', link: '#8ab4f8'};

const Bar: React.FC<{w: number | string; h?: number; o?: number; style?: React.CSSProperties}> = ({w, h = 14, o = 0.14, style}) => <div style={{width: w, height: h, borderRadius: h / 2, background: `rgba(255,255,255,${o})`, ...style}} />;
const Stars: React.FC<{n: number; s?: number}> = ({n, s = 20}) => (
	<div style={{display: 'flex', gap: 2}}>
		{[0, 1, 2, 3, 4].map((i) => (
			<div key={i} style={{opacity: i < n ? 1 : 0.22}}>
				<Star size={s} />
			</div>
		))}
	</div>
);

type Kind = 'maps' | 'list' | 'reviews' | 'reviews2' | 'oldsite' | 'social' | 'social2' | 'owner' | 'people' | 'email' | 'contact' | 'sheet';

const Content: React.FC<{k: Kind; name: string; seed: number}> = ({k, name, seed}) => {
	switch (k) {
		case 'maps':
		case 'list':
			return (
				<div style={{position: 'absolute', inset: 0, background: '#24272b'}}>
					<svg width={W} height={H - 50} style={{position: 'absolute', inset: 0}}>
						{[
							'M-20 120 L840 40',
							'M-20 300 L840 210',
							'M120 -20 L260 560',
							'M520 -20 L640 560',
							'M-20 470 L840 380',
						].map((d, i) => (
							<path key={i} d={d} stroke="#3a3e44" strokeWidth={i === 3 ? 16 : 10} fill="none" />
						))}
						{Array.from({length: 14}).map((_, i) => (
							<g key={i} transform={`translate(${60 + rand(i + seed) * 700}, ${40 + rand(i * 3 + seed) * 420})`}>
								<path d="M0 -26 C-12 -26 -18 -16 -18 -8 C-18 6 0 18 0 18 C0 18 18 6 18 -8 C18 -16 12 -26 0 -26Z" fill={i === 4 ? '#e8eaed' : '#9aa0a6'} opacity={i === 4 ? 1 : 0.55} />
							</g>
						))}
					</svg>
					{k === 'list' && (
						<div style={{position: 'absolute', left: 0, top: 0, bottom: 0, width: 360, background: G.bg, borderRight: `1px solid ${G.line}`, padding: 22}}>
							{[0, 1, 2, 3].map((i) => (
								<div key={i} style={{padding: '14px 0', borderBottom: `1px solid ${G.line}`}}>
									<div style={{fontFamily: ui, fontSize: 21, fontWeight: 600, color: G.t1}}>{['Bella Forno Trattoria', 'Lumen Nail Studio', 'Taquería El Sol', 'Juniper Café'][i]}</div>
									<div style={{display: 'flex', alignItems: 'center', gap: 8, marginTop: 6, fontFamily: ui, fontSize: 16, color: G.t2}}>
										{['4.8', '4.2', '4.7', '4.5'][i]} <Stars n={[5, 4, 5, 4][i]} s={14} /> ({['312', '6', '186', '98'][i]})
									</div>
								</div>
							))}
						</div>
					)}
					{k === 'maps' && (
						<div style={{position: 'absolute', left: 24, bottom: 24, width: 440, borderRadius: 16, background: G.bg, padding: 22, boxShadow: '0 20px 40px rgba(0,0,0,0.5)'}}>
							<div style={{fontFamily: ui, fontSize: 26, fontWeight: 700, color: G.t1}}>{name}</div>
							<div style={{display: 'flex', alignItems: 'center', gap: 8, marginTop: 8, fontFamily: ui, fontSize: 18, color: G.t2}}>
								4.8 <Stars n={5} s={16} /> (312) · Italian
							</div>
							<div style={{display: 'flex', gap: 10, marginTop: 16}}>
								{['Directions', 'Website', 'Call'].map((b) => (
									<div key={b} style={{height: 38, padding: '0 16px', borderRadius: 19, border: `1px solid ${G.line}`, fontFamily: ui, fontSize: 16, color: G.link, display: 'flex', alignItems: 'center'}}>
										{b}
									</div>
								))}
							</div>
						</div>
					)}
				</div>
			);
		case 'reviews':
		case 'reviews2':
			return (
				<div style={{position: 'absolute', inset: 0, background: G.bg, padding: '26px 34px'}}>
					<div style={{fontFamily: ui, fontSize: 26, fontWeight: 700, color: G.t1}}>{name} · Reviews</div>
					{[0, 1, 2].map((i) => (
						<div key={i} style={{display: 'flex', gap: 16, marginTop: 24}}>
							<div style={{width: 46, height: 46, borderRadius: 23, background: `hsl(${(seed * 47 + i * 80) % 360} 18% 38%)`}} />
							<div style={{flex: 1}}>
								<div style={{display: 'flex', alignItems: 'center', gap: 12}}>
									<Bar w={120} h={13} o={0.25} />
									<Stars n={k === 'reviews' ? 5 : 3 + (i % 2)} s={16} />
									<span style={{fontFamily: ui, fontSize: 15, color: G.t3}}>{['2 days ago', 'a week ago', '3 weeks ago'][i]}</span>
								</div>
								<Bar w="92%" h={12} o={0.12} style={{marginTop: 12}} />
								<Bar w="70%" h={12} o={0.12} style={{marginTop: 9}} />
							</div>
						</div>
					))}
				</div>
			);
		case 'oldsite':
			return (
				<div style={{position: 'absolute', inset: 0, background: '#f1ece2', fontFamily: 'Times New Roman, serif', color: '#5a2a1a', padding: '20px 30px'}}>
					<div style={{textAlign: 'center', fontSize: 34, fontWeight: 700}}>~ Welcome to {name} ~</div>
					<div style={{display: 'flex', justifyContent: 'center', gap: 22, marginTop: 10, fontSize: 17, color: '#1a3fa0', textDecoration: 'underline'}}>
						{['Home', 'Menu (PDF)', 'Directions', 'Guestbook'].map((l) => (
							<span key={l}>{l}</span>
						))}
					</div>
					<div style={{display: 'flex', gap: 20, marginTop: 20}}>
						<div style={{width: 260, height: 190, background: 'repeating-linear-gradient(45deg, #d8cfbf 0 12px, #cfc5b3 12px 24px)', border: '3px ridge #a88'}} />
						<div style={{flex: 1, fontSize: 17, lineHeight: 1.5}}>
							Call us to make a reservation! We are open Tuesday to Sunday. Please download our menu (PDF, 8.4 MB).
							<div style={{marginTop: 14, fontSize: 14, color: '#8a6a5a'}}>Best viewed on desktop · Last updated 2017</div>
						</div>
					</div>
					<div style={{position: 'absolute', right: 18, top: 16, height: 30, padding: '0 12px', borderRadius: 6, background: '#3a3a3a', color: '#fff', fontFamily: ui, fontSize: 14, display: 'flex', alignItems: 'center', gap: 6}}>
						<Icon n="smartphone" size={16} color="#fff" /> Not mobile-friendly
					</div>
				</div>
			);
		case 'social':
		case 'social2':
			return (
				<div style={{position: 'absolute', inset: 0, background: '#000', padding: '22px 30px'}}>
					<div style={{display: 'flex', alignItems: 'center', gap: 22}}>
						<div style={{width: 92, height: 92, borderRadius: 46, background: 'radial-gradient(circle at 40% 35%, #e8a15a, #8a3a1a)'}} />
						<div>
							<div style={{fontFamily: ui, fontSize: 24, fontWeight: 700, color: G.t1}}>{k === 'social' ? '@bellaforno.atx' : `@${name.toLowerCase().replace(/[^a-z]/g, '').slice(0, 12)}`}</div>
							<div style={{display: 'flex', gap: 26, marginTop: 10, fontFamily: ui, fontSize: 17, color: G.t2}}>
								<span>
									<b style={{color: G.t1}}>{k === 'social' ? '1,204' : '38'}</b> posts
								</span>
								<span>
									<b style={{color: G.t1}}>{k === 'social' ? '8.9k' : '212'}</b> followers
								</span>
							</div>
						</div>
					</div>
					<div style={{display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 4, marginTop: 22}}>
						{Array.from({length: 8}).map((_, i) => (
							<div key={i} style={{height: 150, background: `radial-gradient(circle at ${30 + rand(i + seed) * 40}% ${40 + rand(i * 5) * 30}%, hsl(${20 + rand(i * 7 + seed) * 25} 60% ${42 + rand(i) * 15}%), hsl(15 40% 14%))`}} />
						))}
					</div>
				</div>
			);
		case 'owner':
		case 'people':
		case 'email':
			return (
				<div style={{position: 'absolute', inset: 0, background: G.bg, padding: '24px 34px'}}>
					<div style={{height: 52, borderRadius: 26, border: `1px solid ${G.line}`, background: G.panel, display: 'flex', alignItems: 'center', gap: 14, padding: '0 22px', fontFamily: ui, fontSize: 21, color: G.t1}}>
						<Icon n="search" size={22} color={G.t2} />
						{k === 'owner' ? `${name.toLowerCase()} owner` : k === 'people' ? `${name.toLowerCase()} manager name` : `${name.toLowerCase()} email`}
					</div>
					{[0, 1, 2, 3].map((i) => (
						<div key={i} style={{marginTop: 22}}>
							<Bar w={[220, 180, 260, 200][i]} h={11} o={0.14} />
							<div style={{fontFamily: ui, fontSize: 21, color: G.link, marginTop: 8}}>
								{k === 'email' ? ['Contact — no email listed', 'Facebook · Page transparency', 'Yelp · Bella Forno', 'Reddit · best pizza east austin'][i] : ['Yelp · Bella Forno Trattoria', 'Austin Business Journal (2016)', 'LinkedIn · results for “Bella Forno”', 'Facebook · About'][i]}
							</div>
							<Bar w="88%" h={10} o={0.09} style={{marginTop: 9}} />
						</div>
					))}
				</div>
			);
		case 'contact':
			return (
				<div style={{position: 'absolute', inset: 0, background: '#f1ece2', fontFamily: 'Times New Roman, serif', color: '#5a2a1a', padding: '34px 40px'}}>
					<div style={{fontSize: 32, fontWeight: 700}}>Contact us</div>
					<div style={{marginTop: 18, fontSize: 20, lineHeight: 1.6}}>
						Phone: (512) 555-0147
						<br />
						Address: East Austin, TX
						<br />
						Email: <span style={{color: '#999'}}>—</span>
					</div>
					<div style={{marginTop: 22, width: 420, height: 130, border: '2px inset #bbb', background: '#fff', fontFamily: ui, fontSize: 15, color: '#999', padding: 12}}>Contact form temporarily unavailable</div>
				</div>
			);
		case 'sheet':
			return (
				<div style={{position: 'absolute', inset: 0, background: '#f8f9fa', fontFamily: ui}}>
					<div style={{display: 'grid', gridTemplateColumns: '40px 230px 110px 110px 150px 150px', fontSize: 16}}>
						{['', 'Business', 'Reviews', 'Site?', 'Contact?', 'Worth it?'].map((h, i) => (
							<div key={i} style={{height: 40, background: '#e8eaed', borderRight: '1px solid #d0d3d6', borderBottom: '1px solid #d0d3d6', fontWeight: 700, color: '#3c4043', display: 'flex', alignItems: 'center', padding: '0 10px'}}>
								{h}
							</div>
						))}
						{Array.from({length: 11}).map((_, r) =>
							[String(r + 2), ['Bella Forno', 'Lumen Nail', 'Taquería El Sol', 'Juniper Café', 'Noodle Theory', 'Southside BBQ', 'Kinfolk Barbers', 'Iron Tide Gym', 'Petal & Stem', 'Cielo Tacos', 'Moss Dental'][r], ['312', '6', '186', '98', '77', '241', '54', '120', '33', '15', '89'][r], ['old', 'none', 'none', 'weak', 'none', 'IG', '?', 'old', '?', 'none', 'ok'][r], ['phone', '?', '?', 'email?', '?', 'DM', '?', '?', '?', '?', 'phone'][r], ['?', 'no?', '?', '?', '?', '?', '?', '?', '?', '?', '?'][r]].map((v, c) => (
								<div key={`${r}-${c}`} style={{height: 40, borderRight: '1px solid #e0e3e6', borderBottom: '1px solid #e0e3e6', color: v === '?' ? '#c5221f' : '#3c4043', display: 'flex', alignItems: 'center', padding: '0 10px', fontWeight: v === '?' ? 700 : 400}}>
									{v}
								</div>
							)),
						)}
					</div>
				</div>
			);
	}
	return null;
};

const TITLES: Record<Kind, (n: string) => string> = {
	maps: (n) => `${n} – Maps`,
	list: () => 'restaurants near East Austin',
	reviews: (n) => `${n} – Reviews`,
	reviews2: (n) => `${n} – Reviews`,
	oldsite: (n) => `${n} | Home`,
	social: () => '@bellaforno.atx',
	social2: (n) => `${n} (@…)`,
	owner: (n) => `${n.toLowerCase()} owner – Search`,
	people: () => 'manager name – Search',
	email: (n) => `${n.toLowerCase()} email – Search`,
	contact: () => 'Contact us',
	sheet: () => 'prospects_FINAL_v3.xlsx',
};

const Window: React.FC<{k: Kind; name: string; seed: number; style?: React.CSSProperties; dim?: number}> = ({k, name, seed, style, dim = 0}) => (
	<div style={{position: 'absolute', width: W, height: H, borderRadius: 20, overflow: 'hidden', background: G.bg, border: '1px solid rgba(255,255,255,0.12)', boxShadow: '0 40px 90px rgba(0,0,0,0.65)', ...style}}>
		<div style={{height: 50, background: '#121315', display: 'flex', alignItems: 'center', gap: 9, padding: '0 16px', borderBottom: `1px solid ${G.line}`}}>
			{[0, 1, 2].map((i) => (
				<div key={i} style={{width: 12, height: 12, borderRadius: 6, background: '#3c3d41'}} />
			))}
			<div style={{marginLeft: 14, height: 34, maxWidth: 520, padding: '0 16px', borderRadius: '10px 10px 0 0', background: G.bg, display: 'flex', alignItems: 'center', fontFamily: ui, fontSize: 19, fontWeight: 500, color: G.t1, whiteSpace: 'nowrap', overflow: 'hidden'}}>{TITLES[k](name)}</div>
		</div>
		<div style={{position: 'absolute', left: 0, top: 50, right: 0, bottom: 0, overflow: 'hidden'}}>
			<Content k={k} name={name} seed={seed} />
		</div>
		{dim > 0 && <div style={{position: 'absolute', inset: 0, background: `rgba(9,9,11,${dim})`}} />}
	</div>
);

const KINDS: Kind[] = ['maps', 'list', 'reviews', 'reviews2', 'oldsite', 'social', 'social2', 'owner', 'people', 'email', 'contact', 'sheet'];
const NAMES = ['Bella Forno Trattoria', 'Bella Forno Trattoria', 'Bella Forno Trattoria', 'Lumen Nail Studio', 'Bella Forno Trattoria', 'Bella Forno', 'Kinfolk Barbers', 'Bella Forno', 'Bella Forno', 'Bella Forno', 'Bella Forno', ''];
// resting slots (front window ends near centre; older ones fan out behind)
const SLOT = (age: number, i: number) => {
	const side = i % 2 === 0 ? -1 : 1;
	return {
		x: 540 - W / 2 + side * (40 + age * 34) + (rand(i * 3.1) - 0.5) * 60,
		y: 700 - age * 46 + (rand(i * 7.7) - 0.5) * 80,
		z: -age * 150,
		ry: side * Math.min(18, age * 3),
		rz: (rand(i * 2.3) - 0.5) * 6,
	};
};
const FLICK_NAMES = ['Kinfolk Barbers', 'Iron Tide Gym', 'Petal & Stem', 'Cielo Tacos', 'Moss Dental', 'Juniper Café', 'Noodle Theory', 'Southside BBQ', 'Lumen Nail Studio', 'Taquería El Sol', 'Bright Smile Dental', 'Oak & Iron Barbers'];

export const Manual: React.FC<{f: number}> = ({f}) => {
	if (f < T.MAN_IN - 2 || f > T.ZERO_OUT + 30) return null;
	const opens = T.WIN_OPEN as unknown as number[];
	const opened = opens.filter((o) => o <= f).length;
	const freeze = ramp(f, T.FREEZE_ZERO, 10, EASE.UI);
	const ff = f < T.FREEZE_ZERO ? f : T.FREEZE_ZERO; // time stops at the freeze
	// camera: drifts in and rotates as the pile grows; jolts slightly per beat
	const grow = clamp01((ff - T.MAN_IN) / (T.FREEZE_ZERO - T.MAN_IN));
	const camS = lerp(1.0, 1.12, EASE.SOFT(grow));
	const camR = lerp(0, -5, EASE.SOFT(grow));
	const flicks = T.WORTH_FLICKS as unknown as number[];
	const flickIdx = flicks.filter((k) => k <= ff).length - 1;
	const zeroT = ramp(f, T.ZERO_IN, 18, EASE.FAST_LOCK);
	const zeroOut = ramp(f, T.ZERO_OUT, 22, EASE.EXIT);
	const tabs = opened + Math.max(0, flickIdx + 1) * 2;
	const hrs = 1 * 60 + 58 + Math.round(grow * 36);
	return (
		<div style={{position: 'absolute', inset: 0}}>
			<div style={{position: 'absolute', inset: 0, perspective: 1800, perspectiveOrigin: '540px 900px', opacity: 1 - freeze * 0.82, filter: freeze > 0.02 ? `blur(${freeze * 9}px) saturate(${1 - freeze})` : undefined}}>
				<div style={{position: 'absolute', inset: 0, transformStyle: 'preserve-3d', transform: `translateZ(0) scale(${camS}) rotateZ(${camR * 0.3}deg) rotateY(${camR}deg)`, transformOrigin: '540px 900px'}}>
					{opens.map((at, i) => {
						if (ff < at) return null;
						const age = opened - 1 - i;
						const t = ramp(ff, at, 16, EASE.FAST_LOCK);
						const s = SLOT(age, i);
						const fromZ = 500;
						return (
							<div key={i} style={{position: 'absolute', left: 0, top: 0, transformStyle: 'preserve-3d', transform: `translate3d(${s.x}px, ${lerp(s.y + 260, s.y, t)}px, ${lerp(fromZ, s.z, t)}px) rotateY(${s.ry}deg) rotateZ(${s.rz}deg)`, opacity: Math.min(1, t * 2), filter: t < 0.9 ? `blur(${(1 - t) * 7}px)` : undefined}}>
								<Window k={KINDS[i]} name={NAMES[i]} seed={i} dim={Math.min(0.55, age * 0.06)} />
							</div>
						);
					})}
					{/* "is this one even worth it?" — other businesses flick past, faster and faster */}
					{flickIdx >= 0 && ff < T.FREEZE_ZERO + 1 && (
						<div style={{position: 'absolute', left: 0, top: 0, transform: `translate3d(${540 - W / 2 + (rand(flickIdx) - 0.5) * 160}px, ${640 + (rand(flickIdx + 9) - 0.5) * 220}px, ${120}px) rotateZ(${(rand(flickIdx * 3) - 0.5) * 8}deg)`, filter: ff - flicks[flickIdx] < 3 ? `blur(${(3 - (ff - flicks[flickIdx])) * 3}px)` : undefined}}>
							<Window k={KINDS[(flickIdx * 5) % 11]} name={FLICK_NAMES[flickIdx % FLICK_NAMES.length]} seed={flickIdx + 20} />
						</div>
					)}
				</div>
			</div>
			{/* counters */}
			<div style={{position: 'absolute', left: 90, right: 90, top: 210, display: 'flex', justifyContent: 'space-between', opacity: ramp(f, T.MAN_IN + 10, 12) * (1 - freeze)}}>
				<Mono size={22} color={C.text2}>{tabs} tabs open</Mono>
				<Mono size={22} color={C.text2}>
					{Math.floor(hrs / 60)}:{String(hrs % 60).padStart(2, '0')} AM
				</Mono>
			</div>
			{/* 0 pitches sent */}
			{f >= T.ZERO_IN && (
				<div style={{position: 'absolute', left: 0, right: 0, top: 640, textAlign: 'center', opacity: zeroT * (1 - zeroOut), transform: `scale(${lerp(1.08, 1, zeroT) * lerp(1, 0.9, zeroOut)})`}}>
					<div style={{fontFamily: FONT.sans, fontSize: 400, fontWeight: 800, letterSpacing: '-0.06em', color: C.text, lineHeight: 0.9}}>0</div>
					<div style={{marginTop: 30}}>
						<Kinetic f={f} inAt={T.ZERO_IN + 6} text="pitches sent." size={84} weight={700} color={C.text2} align="center" stagger={4} />
					</div>
				</div>
			)}
		</div>
	);
};
