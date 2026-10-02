import React from 'react';
import {FONTS} from '../../constants/theme';
import {Emoji} from '../../fx/camera';
import {clamp01, lerp, rand} from '../../motion/anim';
import {EASE} from '../../constants/theme';

/** Phone screen size (design units). All five "manual hunt" screens are drawn at this size. */
export const SCREEN = {w: 556, h: 1196};
const ui = FONTS.sans;
const STAR = '#F5B400';

const Stars: React.FC<{n: number; size?: number}> = ({n, size = 20}) => (
	<span style={{color: STAR, fontSize: size, letterSpacing: 1}}>
		{'★'.repeat(n)}
		<span style={{color: 'rgba(255,255,255,0.25)'}}>{'★'.repeat(5 - n)}</span>
	</span>
);

const StatusBar: React.FC<{dark?: boolean}> = ({dark = true}) => (
	<div style={{height: 54, display: 'flex', alignItems: 'center', padding: '0 34px', fontFamily: ui, fontSize: 21, fontWeight: 600, color: dark ? '#fff' : '#111'}}>
		1:47
		<div style={{flex: 1}} />
		<svg width={70} height={16} viewBox="0 0 70 16">
			{[0, 1, 2, 3].map((i) => (
				<rect key={i} x={i * 6} y={12 - i * 3} width={4} height={4 + i * 3} rx={1} fill={dark ? '#fff' : '#111'} />
			))}
			<rect x={36} y={2} width={28} height={12} rx={3.5} fill="none" stroke={dark ? '#fff' : '#111'} strokeWidth={1.5} />
			<rect x={38.5} y={4.5} width={8} height={7} rx={1.5} fill="#E8445F" />
		</svg>
	</div>
);

// ─────────────────────────────── MAPS ───────────────────────────────
const ROADS = [
	{d: 'M-200 420 L1400 180', name: 'E 6th St', w: 18},
	{d: 'M-200 760 L1400 520', name: 'E 11th St', w: 14},
	{d: 'M300 -200 L620 1800', name: 'Congress Ave', w: 18},
	{d: 'M-100 -200 L180 1800', name: 'Lamar Blvd', w: 16},
	{d: 'M820 -200 L1100 1800', name: 'I-35', w: 26},
	{d: 'M-200 1120 L1400 880', name: 'E Cesar Chavez St', w: 14},
];
export const MAP_PINS = [
	[612, 470, 'Bellwood Plumbing'],
	[380, 300, ''],
	[520, 640, ''],
	[760, 380, ''],
	[250, 560, ''],
	[690, 760, ''],
	[430, 860, ''],
	[860, 620, ''],
	[310, 760, ''],
	[560, 250, ''],
	[150, 380, ''],
	[740, 980, ''],
] as [number, number, string][];

export const MapScreen: React.FC<{lf: number}> = ({lf}) => {
	const sheet = EASE.snap(clamp01((lf - 8) / 16));
	const sel = EASE.snap(clamp01((lf - 14) / 12));
	// inner camera: drift toward the chosen pin
	const z = lerp(1, 1.22, EASE.glide(clamp01(lf / 50)));
	return (
		<div style={{position: 'absolute', inset: 0, background: '#1A1D23', overflow: 'hidden', fontFamily: ui}}>
			<div style={{position: 'absolute', left: 0, top: 0, width: 1100, height: 1500, transformOrigin: '612px 470px', transform: `translate(${-330}px, ${-80}px) scale(${z})`}}>
				<svg width={1100} height={1500} style={{position: 'absolute', inset: 0}}>
					<rect width={1100} height={1500} fill="#1A1D23" />
					{/* city blocks */}
					{Array.from({length: 22}).map((_, r) =>
						Array.from({length: 16}).map((__, c) => {
							const x = c * 74 - 40 + (r % 2) * 12;
							const y = r * 70 - 30;
							const park = rand(r * 31 + c) > 0.94;
							return <rect key={`${r}-${c}`} x={x} y={y} width={62} height={58} rx={6} fill={park ? '#1D3227' : '#22262E'} transform={`rotate(-8 ${x} ${y})`} />;
						}),
					)}
					{/* river */}
					<path d="M-100 1260 C 200 1180, 420 1320, 700 1220 S 1100 1150, 1300 1210 L1300 1360 C 1000 1300, 800 1390, 600 1370 S 200 1330, -100 1420 Z" fill="#1B3550" />
					{/* roads */}
					{ROADS.map((r) => (
						<g key={r.name}>
							<path d={r.d} stroke="#3A3F4A" strokeWidth={r.w} strokeLinecap="round" />
							<path d={r.d} stroke="#4A505C" strokeWidth={r.w * 0.35} strokeLinecap="round" />
						</g>
					))}
					{ROADS.map((r, i) => (
						<text key={`t${i}`} fontFamily={ui} fontSize={17} fill="rgba(255,255,255,0.45)" fontWeight={500}>
							<textPath href={`#road${i}`} startOffset="30%">
								{r.name}
							</textPath>
						</text>
					))}
					<defs>
						{ROADS.map((r, i) => (
							<path key={i} id={`road${i}`} d={r.d} />
						))}
					</defs>
					<text x={420} y={1300} fontFamily={ui} fontSize={20} fill="rgba(120,170,230,0.6)" fontStyle="italic">
						Lady Bird Lake
					</text>
				</svg>
				{/* pins drop in */}
				{MAP_PINS.map(([x, y, label], i) => {
					const t = EASE.snap(clamp01((lf - i * 1.2) / 10));
					const chosen = i === 0;
					const s = chosen ? lerp(1, 1.45, sel) : 1;
					return (
						<div key={i} style={{position: 'absolute', left: x - 22, top: y - 56, width: 44, height: 56, opacity: t, transform: `translateY(${(1 - t) * -60}px) scale(${s})`, transformOrigin: '22px 56px'}}>
							<svg width={44} height={56} viewBox="0 0 44 56">
								<path d="M22 55 C 8 36, 2 28, 2 21 A 20 20 0 1 1 42 21 C 42 28, 36 36, 22 55 Z" fill={chosen && sel > 0.1 ? '#E63F6D' : '#F2F2F4'} stroke="rgba(0,0,0,0.35)" strokeWidth={1.5} />
							</svg>
							<div style={{position: 'absolute', left: 0, top: 6, width: 44, textAlign: 'center'}}>
								<Emoji c="🔧" size={20} />
							</div>
							{chosen && sel > 0 && (
								<div style={{position: 'absolute', left: 52, top: 6, whiteSpace: 'nowrap', background: '#fff', color: '#111', fontSize: 17, fontWeight: 700, padding: '6px 10px', borderRadius: 8, opacity: sel, boxShadow: '0 6px 18px rgba(0,0,0,0.4)'}}>
									{label}
								</div>
							)}
						</div>
					);
				})}
			</div>
			<StatusBar />
			{/* search pill */}
			<div style={{position: 'absolute', left: 22, right: 22, top: 66, height: 76, borderRadius: 38, background: '#2A2E36', display: 'flex', alignItems: 'center', padding: '0 26px', gap: 16, boxShadow: '0 8px 24px rgba(0,0,0,0.45)'}}>
				<svg width={26} height={26} viewBox="0 0 24 24">
					<circle cx={10.5} cy={10.5} r={6.5} fill="none" stroke="#bbb" strokeWidth={2.2} />
					<path d="M15.5 15.5 21 21" stroke="#bbb" strokeWidth={2.2} strokeLinecap="round" />
				</svg>
				<div style={{fontSize: 26, color: '#eee', flex: 1}}>plumbers near me</div>
				<div style={{width: 46, height: 46, borderRadius: 23, background: '#5B6CFF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 20}}>J</div>
			</div>
			{/* bottom sheet */}
			<div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: 520, borderRadius: '30px 30px 0 0', background: '#22252C', transform: `translateY(${(1 - sheet) * 520}px)`, padding: '16px 30px', boxShadow: '0 -10px 40px rgba(0,0,0,0.5)'}}>
				<div style={{width: 60, height: 6, borderRadius: 3, background: '#555', margin: '0 auto 22px'}} />
				<div style={{fontSize: 30, fontWeight: 700, color: '#fff'}}>Plumbers · Austin</div>
				{[
					['Bellwood Plumbing', 5, '4.8', '126', '0.8 mi'],
					['Lone Star Drain Co.', 5, '4.7', '88', '1.4 mi'],
					['Capitol City Plumbing', 4, '4.4', '61', '2.1 mi'],
				].map(([n, s, r, c, d], i) => (
					<div key={i} style={{padding: '20px 0', borderBottom: '1px solid rgba(255,255,255,0.08)'}}>
						<div style={{fontSize: 25, fontWeight: 650, color: '#fff'}}>{n as string}</div>
						<div style={{display: 'flex', alignItems: 'center', gap: 8, marginTop: 6, fontSize: 20, color: '#bbb'}}>
							{r as string} <Stars n={s as number} size={18} /> ({c as string}) · Plumber · {d as string}
						</div>
						<div style={{fontSize: 19, marginTop: 4, color: '#81C995'}}>
							Open 24 hours
						</div>
					</div>
				))}
			</div>
		</div>
	);
};

// ─────────────────────────────── REVIEWS ───────────────────────────────
const REVIEWS: [string, string, string, number, string, string][] = [
	['MG', '#E8A33D', 'Maria G.', 5, '2 days ago', 'Fixed our leak in under an hour. Honest pricing, super clean work.'],
	['DR', '#4F8DF7', 'Devon R.', 5, '5 days ago', 'Called at 11pm on a Sunday. They actually showed up.'],
	['PS', '#9B6BDF', 'Priya S.', 5, '1 week ago', 'Water heater replaced the same day. 10/10 would call again.'],
	['TK', '#3DBE8B', 'Tom K.', 4, '2 weeks ago', 'Great plumbers. Their website is impossible to use on my phone though.'],
	['AL', '#E5677D', 'Ana L.', 5, '3 weeks ago', 'Best plumbers in East Austin. Booked them for our whole building.'],
];

export const ReviewsScreen: React.FC<{lf: number}> = ({lf}) => {
	const scroll = EASE.glide(clamp01((lf - 4) / 40)) * 560;
	return (
		<div style={{position: 'absolute', inset: 0, background: '#17191E', overflow: 'hidden', fontFamily: ui, color: '#fff'}}>
			<div style={{transform: `translateY(${-scroll}px)`}}>
				<div style={{height: 330, position: 'relative', background: 'linear-gradient(160deg, #8EB6D9 0%, #5C86B0 45%, #2F4D6E 100%)', overflow: 'hidden'}}>
					<div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: 120, background: 'linear-gradient(180deg, #555B63 0%, #3A3E44 100%)'}} />
					<div style={{position: 'absolute', left: 90, bottom: 70}}>
						<Emoji c="🚐" size={210} />
					</div>
					<div style={{position: 'absolute', right: 70, bottom: 120}}>
						<Emoji c="🏠" size={120} />
					</div>
					<div style={{position: 'absolute', right: 20, bottom: 18, fontSize: 18, background: 'rgba(0,0,0,0.55)', padding: '4px 10px', borderRadius: 8}}>1 / 48</div>
				</div>
				<div style={{padding: '24px 30px 0'}}>
					<div style={{fontSize: 36, fontWeight: 700, letterSpacing: '-0.02em'}}>Bellwood Plumbing</div>
					<div style={{display: 'flex', alignItems: 'center', gap: 8, marginTop: 8, fontSize: 22, color: '#ccc'}}>
						4.8 <Stars n={5} size={22} /> (126) · Plumber
					</div>
					<div style={{fontSize: 21, color: '#81C995', marginTop: 6}}>
						Open 24 hours <span style={{color: '#aaa'}}>· E 6th St, Austin</span>
					</div>
					<div style={{display: 'flex', justifyContent: 'space-between', margin: '26px 0 10px'}}>
						{[
							['📞', 'Call'],
							['🧭', 'Directions'],
							['🌐', 'Website'],
							['🔖', 'Save'],
						].map(([e, l]) => (
							<div key={l} style={{width: 112, textAlign: 'center'}}>
								<div style={{width: 72, height: 72, margin: '0 auto', borderRadius: 36, background: '#2A2E36', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
									<Emoji c={e} size={30} />
								</div>
								<div style={{fontSize: 18, color: '#9EC3FF', marginTop: 8}}>{l}</div>
							</div>
						))}
					</div>
					<div style={{display: 'flex', gap: 34, fontSize: 22, fontWeight: 600, borderBottom: '1px solid rgba(255,255,255,0.1)', marginTop: 18}}>
						<div style={{color: '#888', paddingBottom: 14}}>Overview</div>
						<div style={{paddingBottom: 12, borderBottom: '3px solid #9EC3FF'}}>Reviews</div>
						<div style={{color: '#888'}}>Photos</div>
					</div>
					{REVIEWS.map(([ini, col, name, s, when, text], i) => {
						const hot = i === 3;
						return (
							<div key={name} style={{padding: '24px 0', borderBottom: '1px solid rgba(255,255,255,0.08)'}}>
								<div style={{display: 'flex', alignItems: 'center', gap: 14}}>
									<div style={{width: 50, height: 50, borderRadius: 25, background: col, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 19}}>{ini}</div>
									<div>
										<div style={{fontSize: 22, fontWeight: 650}}>{name}</div>
										<div style={{fontSize: 17, color: '#999'}}>Local Guide · {12 + i * 7} reviews</div>
									</div>
								</div>
								<div style={{display: 'flex', alignItems: 'center', gap: 10, marginTop: 12}}>
									<Stars n={s} size={20} />
									<span style={{fontSize: 18, color: '#999'}}>{when}</span>
								</div>
								<div style={{fontSize: 22, lineHeight: 1.4, marginTop: 8, color: '#ddd'}}>
									{hot ? (
										<>
											Great plumbers.{' '}
											<span style={{background: 'rgba(230,63,109,0.22)', color: '#fff', borderRadius: 4, padding: '0 4px'}}>Their website is impossible to use on my phone</span> though.
										</>
									) : (
										text
									)}
								</div>
							</div>
						);
					})}
				</div>
			</div>
			<div style={{position: 'absolute', left: 0, right: 0, top: 0}}>
				<StatusBar />
			</div>
		</div>
	);
};

// ─────────────────────────────── OLD WEBSITE (on mobile) ───────────────────────────────
export const OldSiteScreen: React.FC<{lf: number}> = ({lf}) => {
	const pinch = EASE.glide(clamp01((lf - 8) / 26));
	const z = lerp(0.5, 1.15, pinch);
	const shake = lf > 34 && lf < 44 ? (rand(lf) - 0.5) * 10 : 0;
	const serif = '"Liberation Serif", "Times New Roman", serif';
	return (
		<div style={{position: 'absolute', inset: 0, background: '#fff', overflow: 'hidden'}}>
			<div style={{background: '#F1F1F3'}}>
				<StatusBar dark={false} />
				<div style={{margin: '0 18px 14px', height: 58, borderRadius: 16, background: '#E2E2E6', display: 'flex', alignItems: 'center', padding: '0 20px', gap: 10, fontFamily: ui, fontSize: 21, color: '#444'}}>
					<span style={{fontSize: 16}}>⚠</span> Not secure — bellwoodplumbing-tx.biz
				</div>
			</div>
			{/* the desktop-only page, crammed into a phone */}
			<div style={{position: 'absolute', left: 0, top: 126, width: 1080, transformOrigin: '0 0', transform: `translate(${-pinch * 200 + shake}px, ${-pinch * 60}px) scale(${z})`, fontFamily: serif}}>
				<div style={{background: '#0B2A6B', padding: '18px 24px', display: 'flex', alignItems: 'center', gap: 20}}>
					<Emoji c="🔧" size={58} />
					<div style={{fontFamily: '"Liberation Sans", Arial, sans-serif', fontSize: 50, fontWeight: 700, color: '#FFE135', textShadow: '3px 3px 0 #C0392B', letterSpacing: 1}}>Welcome to Bellwood Plumbing!!!</div>
				</div>
				<div style={{background: '#C0C0C0', padding: '8px 24px', fontSize: 24, display: 'flex', gap: 30}}>
					{['Home', 'About Us', 'Services', 'Coupons', 'Guestbook', 'Contact'].map((l) => (
						<span key={l} style={{color: '#0000EE', textDecoration: 'underline'}}>
							{l}
						</span>
					))}
				</div>
				<div style={{display: 'flex', background: '#F5F0DC', padding: 24, gap: 26}}>
					<div style={{width: 250, background: '#E4DCC0', padding: 16, fontSize: 22, lineHeight: 1.6}}>
						<b>Our Services:</b>
						<br />• Drains
						<br />• Toilets
						<br />• Water Heaters
						<br />• Gas Lines
						<div style={{marginTop: 20, background: '#000', color: '#0F0', fontFamily: 'monospace', fontSize: 22, padding: '6px 10px', textAlign: 'center'}}>
							Visitors: 000412
						</div>
					</div>
					<div style={{flex: 1}}>
						<div style={{display: 'flex', gap: 22}}>
							<div style={{width: 300, height: 220, border: '2px inset #999', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, color: '#777', fontFamily: 'sans-serif'}}>
								<span style={{border: '1px solid #aaa', padding: '2px 6px', marginRight: 8, color: '#c00'}}>✕</span> plumber_team.jpg
							</div>
							<div style={{flex: 1, fontSize: 26, lineHeight: 1.45}}>
								<b>Family owned since 1998!</b> We do all kinds of plumbing jobs big and small. Call us today for a FREE estimate!!!
								<div style={{marginTop: 14, color: '#C0392B', fontWeight: 700}}>
									<Emoji c="🚧" size={30} /> Online booking — UNDER CONSTRUCTION <Emoji c="🚧" size={30} />
								</div>
							</div>
						</div>
						<div style={{marginTop: 20, border: '2px dashed #999', padding: 18, fontSize: 22, color: '#555', fontFamily: 'sans-serif', textAlign: 'center'}}>
							⚠ This content requires a plugin that is no longer supported.
						</div>
					</div>
				</div>
				<div style={{background: '#0B2A6B', color: '#fff', fontSize: 18, padding: '10px 24px'}}>© 2009 Bellwood Plumbing · Best viewed in Internet Explorer at 1024×768</div>
			</div>
			{/* horizontal scrollbar: the page doesn't fit */}
			<div style={{position: 'absolute', left: 30, right: 30, bottom: 30, height: 8, borderRadius: 4, background: 'rgba(0,0,0,0.08)'}}>
				<div style={{width: '38%', height: 8, borderRadius: 4, background: 'rgba(0,0,0,0.35)', marginLeft: `${pinch * 40}%`}} />
			</div>
		</div>
	);
};

// ─────────────────────────────── SOCIAL PROFILE ───────────────────────────────
const POSTS: {bg: string; e?: string; t?: string; sub?: string; ink?: string; split?: boolean}[] = [
	{bg: 'linear-gradient(135deg,#7A4B2A,#3E2614)', e: '🚿', split: true},
	{bg: '#FFD34D', t: '★★★★★', sub: '“Saved our weekend.”', ink: '#1A1A1A'},
	{bg: 'linear-gradient(180deg,#9CC8EE,#4F7FB3)', e: '🚐', sub: 'On our way!'},
	{bg: '#D7263D', t: '24/7', sub: 'EMERGENCY', ink: '#fff'},
	{bg: 'linear-gradient(135deg,#F6C28B,#E58F65)', e: '👷', sub: 'Meet the crew'},
	{bg: '#0E7C86', t: 'LEAK?', e: '💧', ink: '#fff'},
	{bg: 'linear-gradient(135deg,#F28C28,#A13D10)', e: '🔥', sub: 'New heater, same day'},
	{bg: '#14213D', t: 'WE’RE', sub: 'HIRING', ink: '#FCA311'},
	{bg: '#F7D6E0', e: '🛁', sub: 'Bathroom refresh', ink: '#5A2236'},
	{bg: '#2F6FED', t: 'FREE', sub: 'QUOTE', ink: '#fff'},
	{bg: 'linear-gradient(135deg,#2B2B2B,#0D0D0D)', e: '🏆', sub: 'Best of East Austin', ink: '#F5D06F'},
	{bg: 'linear-gradient(135deg,#B08968,#7F5539)', e: '🧰'},
];

const Post: React.FC<{p: (typeof POSTS)[number]}> = ({p}) => (
	<div style={{position: 'relative', aspectRatio: '1', background: p.bg, overflow: 'hidden', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: ui, color: p.ink ?? '#fff', textAlign: 'center'}}>
		{p.split ? (
			<>
				<div style={{position: 'absolute', left: '50%', top: 0, bottom: 0, right: 0, background: 'linear-gradient(135deg,#BFE6FF,#6FB6E8)'}} />
				<div style={{position: 'absolute', left: 8, top: 8, fontSize: 13, fontWeight: 800, color: '#fff'}}>BEFORE</div>
				<div style={{position: 'absolute', right: 8, top: 8, fontSize: 13, fontWeight: 800, color: '#0B3B5C'}}>AFTER</div>
				<Emoji c={p.e!} size={70} style={{position: 'relative'}} />
			</>
		) : (
			<>
				{p.e && <Emoji c={p.e} size={p.t ? 46 : 74} />}
				{p.t && <div style={{fontSize: p.t.length > 5 ? 30 : 42, fontWeight: 900, letterSpacing: '-0.02em', lineHeight: 1}}>{p.t}</div>}
				{p.sub && <div style={{fontSize: 15, fontWeight: 800, marginTop: 6, padding: '0 8px', letterSpacing: '0.02em'}}>{p.sub}</div>}
			</>
		)}
	</div>
);

export const SocialScreen: React.FC<{lf: number}> = ({lf}) => {
	const scroll = EASE.glide(clamp01((lf - 6) / 40)) * 380;
	return (
		<div style={{position: 'absolute', inset: 0, background: '#000', overflow: 'hidden', fontFamily: ui, color: '#fff'}}>
			<StatusBar />
			<div style={{display: 'flex', alignItems: 'center', padding: '6px 26px 16px', gap: 10}}>
				<div style={{fontSize: 30, fontWeight: 700}}>bellwood.plumbing</div>
				<div style={{fontSize: 18, color: '#bbb'}}>⌄</div>
				<div style={{flex: 1}} />
				<svg width={34} height={34} viewBox="0 0 24 24">
					<rect x={3} y={3} width={18} height={18} rx={5} fill="none" stroke="#fff" strokeWidth={2} />
					<path d="M12 8v8M8 12h8" stroke="#fff" strokeWidth={2} strokeLinecap="round" />
				</svg>
				<svg width={34} height={34} viewBox="0 0 24 24">
					<path d="M4 7h16M4 12h16M4 17h16" stroke="#fff" strokeWidth={2} strokeLinecap="round" />
				</svg>
			</div>
			<div style={{transform: `translateY(${-scroll}px)`}}>
				<div style={{display: 'flex', alignItems: 'center', padding: '0 26px', gap: 30}}>
					<div style={{width: 160, height: 160, borderRadius: 80, padding: 6, background: 'conic-gradient(from 200deg, #FEDA75, #FA7E1E, #D62976, #FA7E1E, #FEDA75)'}}>
						<div style={{width: '100%', height: '100%', borderRadius: '50%', border: '5px solid #000', background: '#0B2A6B', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
							<Emoji c="🔧" size={64} />
						</div>
					</div>
					<div style={{display: 'flex', flex: 1, justifyContent: 'space-around', textAlign: 'center'}}>
						{[
							['214', 'posts'],
							['1,284', 'followers'],
							['312', 'following'],
						].map(([n, l]) => (
							<div key={l}>
								<div style={{fontSize: 30, fontWeight: 700}}>{n}</div>
								<div style={{fontSize: 20, color: '#ddd'}}>{l}</div>
							</div>
						))}
					</div>
				</div>
				<div style={{padding: '18px 26px 0', fontSize: 22, lineHeight: 1.42}}>
					<div style={{fontWeight: 700}}>Bellwood Plumbing</div>
					<div style={{color: '#999'}}>Plumbing service</div>
					<div>Family plumbers in Austin since 1998 🔧</div>
					<div>24/7 emergencies — DM us 💬</div>
					<div>📍 East Austin, TX</div>
					<div style={{color: '#E0F1FF'}}>🔗 link in bio (coming soon)</div>
				</div>
				<div style={{display: 'flex', gap: 10, padding: '18px 26px'}}>
					{['Follow', 'Message', 'Call'].map((b, i) => (
						<div key={b} style={{flex: 1, height: 56, borderRadius: 12, background: i === 0 ? '#3D7BFF' : '#262626', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 21, fontWeight: 650}}>
							{b}
						</div>
					))}
				</div>
				<div style={{display: 'flex', gap: 22, padding: '4px 26px 20px'}}>
					{[
						['⭐', 'Reviews'],
						['🔁', 'Before/After'],
						['👷', 'Team'],
						['🚐', 'Van'],
					].map(([e, l]) => (
						<div key={l} style={{width: 100, textAlign: 'center'}}>
							<div style={{width: 92, height: 92, margin: '0 auto', borderRadius: 46, border: '2px solid #444', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#111'}}>
								<Emoji c={e} size={40} />
							</div>
							<div style={{fontSize: 16, marginTop: 6}}>{l}</div>
						</div>
					))}
				</div>
				<div style={{display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 3}}>
					{POSTS.map((p, i) => (
						<Post key={i} p={p} />
					))}
				</div>
			</div>
		</div>
	);
};

// ─────────────────────────────── EMAIL HUNT ───────────────────────────────
const QUERY = 'bellwood plumbing email';
export const EmailScreen: React.FC<{lf: number}> = ({lf}) => {
	const q = QUERY.slice(0, Math.round(QUERY.length * clamp01(lf / 16)));
	const res = (i: number) => EASE.snap(clamp01((lf - 16 - i * 5) / 12));
	const results: [string, string, string, string][] = [
		['bellwoodplumbing-tx.biz › contact', 'Contact Us – Bellwood Plumbing', 'Call us or use the form below. We answer every message!', 'Email: not listed'],
		['local business directory', 'Bellwood Plumbing · Austin, TX', 'Plumber · 4.8★ (126) · Open 24 hours · Phone (512) 555-0148', 'Email: not provided'],
		['social profile', 'Bellwood Plumbing (@bellwood.plumbing)', '1,284 followers · 214 posts · “DM us for quotes”', 'No email'],
	];
	return (
		<div style={{position: 'absolute', inset: 0, background: '#16181D', overflow: 'hidden', fontFamily: ui, color: '#fff'}}>
			<StatusBar />
			<div style={{margin: '10px 22px 26px', height: 76, borderRadius: 38, background: '#2A2E36', display: 'flex', alignItems: 'center', padding: '0 26px', gap: 14, fontSize: 26}}>
				<svg width={26} height={26} viewBox="0 0 24 24">
					<circle cx={10.5} cy={10.5} r={6.5} fill="none" stroke="#bbb" strokeWidth={2.2} />
					<path d="M15.5 15.5 21 21" stroke="#bbb" strokeWidth={2.2} strokeLinecap="round" />
				</svg>
				{q}
				{lf < 22 && <span style={{width: 3, height: 30, background: '#E63F6D'}} />}
			</div>
			{results.map(([src, title, snip, miss], i) => (
				<div key={i} style={{padding: '0 30px 34px', opacity: res(i), transform: `translateY(${(1 - res(i)) * 30}px)`}}>
					<div style={{fontSize: 18, color: '#999'}}>{src}</div>
					<div style={{fontSize: 27, color: '#9EC3FF', marginTop: 6, fontWeight: 500}}>{title}</div>
					<div style={{fontSize: 21, color: '#ccc', marginTop: 8, lineHeight: 1.4}}>{snip}</div>
					<div style={{display: 'inline-block', marginTop: 10, fontSize: 21, fontWeight: 700, color: '#FF8FA8', background: 'rgba(230,63,109,0.16)', padding: '4px 12px', borderRadius: 8}}>{miss}</div>
				</div>
			))}
		</div>
	);
};

export const SCREENS = [MapScreen, ReviewsScreen, OldSiteScreen, SocialScreen, EmailScreen];

/** Focus point (in screen coords) the camera dives into before cutting to the next screen. */
export const DIVE_FOCUS: [number, number][] = [
	[282, 420], // Bellwood pin
	[278, 330], // "Website" … (dive toward the hot review)
	[300, 520], // broken image
	[280, 560], // "Message" / bio
	[180, 640], // email: not listed
];

export const Phone: React.FC<{children: React.ReactNode; glow?: number}> = ({children, glow = 0}) => (
	<div style={{position: 'absolute', left: 0, top: 0, width: SCREEN.w + 44, height: SCREEN.h + 44, borderRadius: 86, background: '#0B0B0E', boxShadow: `0 0 0 2px #2A2A31, 0 60px 160px rgba(0,0,0,0.75)${glow ? `, 0 0 ${120 * glow}px rgba(160,190,255,${0.12 * glow})` : ''}`}}>
		<div style={{position: 'absolute', left: 22, top: 22, width: SCREEN.w, height: SCREEN.h, borderRadius: 66, overflow: 'hidden', background: '#000'}}>{children}</div>
		<div style={{position: 'absolute', left: (SCREEN.w + 44) / 2 - 64, top: 36, width: 128, height: 36, borderRadius: 18, background: '#000', zIndex: 3}} />
	</div>
);
