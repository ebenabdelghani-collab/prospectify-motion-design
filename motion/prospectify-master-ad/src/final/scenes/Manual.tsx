import React from 'react';
import {C, EASE, FONT, T, clamp01, lerp, rand, ramp} from '../tokens';
import {Icon, Star} from '../kit/icons';
import {Kinetic, Mono} from '../kit/type';
import {BIZ_PHOTOS, MapView, Photo, Pin} from '../kit/media';

/**
 * 2 · MANUAL PROSPECTING — the viewer's own evening, with real-looking sources: a real Austin map
 * (OpenStreetMap), real photos (CC0), reviews, a social profile, search results, a spreadsheet.
 * Windows pile up in depth: 2 → 4 → 7 → 12 tabs, then other businesses flick past, then: 0 pitches sent.
 * Generic interfaces — no third-party logos. Never the Prospectify accent.
 */
const W = 900;
const H = 640;
const ui = 'Roboto, "Plus Jakarta Sans", system-ui, sans-serif';
const G = {bg: '#ffffff', soft: '#f1f3f4', line: '#e3e5e8', t1: '#202124', t2: '#5f6368', t3: '#80868b', link: '#1a0dab', blue: '#1a73e8', green: '#188038'};

type Biz = {key: string; name: string; kind: string; rating: number; reviews: number; handle: string; posts: string; followers: string};
const BIZ: Record<string, Biz> = {
	bella: {key: 'bella', name: 'Bella Forno Trattoria', kind: 'Italian restaurant · $$', rating: 4.8, reviews: 312, handle: 'bellaforno.atx', posts: '1,204', followers: '8,914'},
	lumen: {key: 'lumen', name: 'Lumen Nail Studio', kind: 'Nail salon', rating: 4.2, reviews: 6, handle: 'lumen.nails', posts: '3', followers: '41'},
	kinfolk: {key: 'kinfolk', name: 'Kinfolk Barbers', kind: 'Barber shop', rating: 4.6, reviews: 54, handle: 'kinfolk.cuts', posts: '86', followers: '1,120'},
	juniper: {key: 'juniper', name: 'Juniper Café', kind: 'Coffee shop', rating: 4.5, reviews: 98, handle: 'junipercafe', posts: '402', followers: '3,310'},
	elsol: {key: 'elsol', name: 'Taquería El Sol', kind: 'Mexican restaurant', rating: 4.7, reviews: 186, handle: 'elsol.tacos', posts: '230', followers: '2,045'},
	southside: {key: 'southside', name: 'Southside Smokehouse', kind: 'Barbecue restaurant', rating: 4.6, reviews: 241, handle: 'southside.bbq', posts: '512', followers: '6,780'},
	noodle: {key: 'noodle', name: 'Noodle Theory', kind: 'Ramen restaurant', rating: 4.4, reviews: 77, handle: 'noodletheory', posts: '97', followers: '880'},
	brunch: {key: 'brunch', name: 'Sunny Side Brunch', kind: 'Breakfast restaurant', rating: 4.5, reviews: 143, handle: 'sunnyside.atx', posts: '330', followers: '4,102'},
	bar: {key: 'bar', name: 'Velvet Room Bar', kind: 'Cocktail bar', rating: 4.3, reviews: 121, handle: 'velvetroom', posts: '610', followers: '5,560'},
	green: {key: 'green', name: 'Green Bowl', kind: 'Salad bar', rating: 4.4, reviews: 65, handle: 'greenbowl.atx', posts: '144', followers: '1,980'},
};
const ph = (b: Biz, i: number) => {
	const p = BIZ_PHOTOS[b.key];
	return p[i % p.length];
};

const Stars: React.FC<{v: number; s?: number}> = ({v, s = 18}) => (
	<div style={{display: 'flex', gap: 1}}>
		{[0, 1, 2, 3, 4].map((i) => (
			<div key={i} style={{opacity: i < Math.round(v) ? 1 : 0.25}}>
				<Star size={s} color="#FBBC04" />
			</div>
		))}
	</div>
);
const Txt: React.FC<{s: number; w?: number; c?: string; children: React.ReactNode; style?: React.CSSProperties}> = ({s, w = 400, c = G.t1, children, style}) => (
	<div style={{fontFamily: ui, fontSize: s, fontWeight: w, color: c, lineHeight: 1.3, ...style}}>{children}</div>
);

// pins on the real map (map pixels)
const PINS: [number, number][] = [
	[1180, 1260], [1010, 1120], [1340, 1180], [1250, 1420], [930, 1330], [1420, 1330], [1100, 1500], [1300, 1040], [880, 1180], [1520, 1240], [1150, 1680], [1380, 1560], [980, 1580], [1600, 1460],
];

type Kind = 'maps' | 'list' | 'reviews' | 'oldsite' | 'social' | 'owner' | 'email' | 'contact' | 'sheet';

const Content: React.FC<{k: Kind; b: Biz; seed: number}> = ({k, b, seed}) => {
	switch (k) {
		case 'maps':
			return (
				<div style={{position: 'absolute', inset: 0}}>
					<MapView w={W} h={H - 46} cx={1180 + seed * 30} cy={1300} zoom={1.15}>
						{PINS.map(([x, y], i) => (
							<Pin key={i} x={x} y={y} s={i === 0 ? 1.25 : 0.9} label={i === 0 ? b.name : undefined} />
						))}
					</MapView>
					<div style={{position: 'absolute', left: 18, top: 18, width: 380, height: 46, borderRadius: 23, background: '#fff', boxShadow: '0 2px 6px rgba(0,0,0,0.25)', display: 'flex', alignItems: 'center', gap: 12, padding: '0 18px'}}>
						<Icon n="search" size={20} color={G.t2} />
						<Txt s={17} c={G.t1}>restaurants near East Austin</Txt>
					</div>
					<div style={{position: 'absolute', left: 18, bottom: 18, width: 470, borderRadius: 18, background: '#fff', boxShadow: '0 6px 24px rgba(0,0,0,0.3)', overflow: 'hidden'}}>
						<div style={{display: 'flex', gap: 3, height: 128}}>
							{[0, 1, 2].map((i) => (
								<Photo key={i} n={ph(b, i)} w={i === 0 ? 220 : 124} h={128} />
							))}
						</div>
						<div style={{padding: '14px 18px 16px'}}>
							<Txt s={22} w={600}>{b.name}</Txt>
							<div style={{display: 'flex', alignItems: 'center', gap: 6, marginTop: 4}}>
								<Txt s={15} c={G.t2}>{b.rating}</Txt>
								<Stars v={b.rating} s={15} />
								<Txt s={15} c={G.t2}>({b.reviews}) · {b.kind}</Txt>
							</div>
							<div style={{display: 'flex', gap: 8, marginTop: 12}}>
								{['Directions', 'Website', 'Call', 'Save'].map((x, i) => (
									<div key={x} style={{height: 34, padding: '0 14px', borderRadius: 17, background: i === 0 ? G.blue : '#e8f0fe', color: i === 0 ? '#fff' : '#0b57d0', fontFamily: ui, fontSize: 14, fontWeight: 600, display: 'flex', alignItems: 'center'}}>
										{x}
									</div>
								))}
							</div>
						</div>
					</div>
				</div>
			);
		case 'list':
			return (
				<div style={{position: 'absolute', inset: 0, display: 'flex'}}>
					<div style={{width: 400, height: '100%', background: '#fff', borderRight: `1px solid ${G.line}`, overflow: 'hidden'}}>
						{(['bella', 'lumen', 'elsol', 'juniper', 'southside'] as const).map((key, i) => {
							const x = BIZ[key];
							return (
								<div key={key} style={{display: 'flex', gap: 14, padding: '14px 16px', borderBottom: `1px solid ${G.line}`}}>
									<div style={{flex: 1}}>
										<Txt s={18} w={600}>{x.name}</Txt>
										<div style={{display: 'flex', alignItems: 'center', gap: 5, marginTop: 3}}>
											<Txt s={14} c={G.t2}>{x.rating}</Txt>
											<Stars v={x.rating} s={13} />
											<Txt s={14} c={G.t2}>({x.reviews})</Txt>
										</div>
										<Txt s={14} c={G.t2} style={{marginTop: 2}}>{x.kind}</Txt>
										<Txt s={13} c={i % 2 ? '#d93025' : G.green} style={{marginTop: 2}}>{i % 2 ? 'Closed · Opens 5 PM' : 'Open · Closes 10 PM'}</Txt>
									</div>
									<Photo n={ph(x, i)} w={92} h={92} r={10} />
								</div>
							);
						})}
					</div>
					<MapView w={W - 400} h={H - 46} cx={1240} cy={1330} zoom={1}>
						{PINS.map(([x, y], i) => (
							<Pin key={i} x={x} y={y} s={0.85} />
						))}
					</MapView>
				</div>
			);
		case 'reviews':
			return (
				<div style={{position: 'absolute', inset: 0, background: '#fff', padding: '22px 30px'}}>
					<div style={{display: 'flex', gap: 22, alignItems: 'center'}}>
						<Photo n={ph(b, 0)} w={96} h={96} r={12} />
						<div>
							<Txt s={24} w={600}>{b.name}</Txt>
							<div style={{display: 'flex', alignItems: 'center', gap: 8, marginTop: 6}}>
								<Txt s={34} w={500}>{b.rating}</Txt>
								<Stars v={b.rating} s={22} />
								<Txt s={16} c={G.t2}>{b.reviews} reviews</Txt>
							</div>
						</div>
					</div>
					{[0, 1, 2].map((i) => (
						<div key={i} style={{display: 'flex', gap: 14, marginTop: 20}}>
							<div style={{width: 42, height: 42, borderRadius: 21, background: ['#7cb342', '#f4511e', '#8e24aa', '#039be5'][(i + seed) % 4], color: '#fff', fontFamily: ui, fontSize: 19, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0}}>{'MJRAKT'[(i + seed) % 6]}</div>
							<div style={{flex: 1}}>
								<div style={{display: 'flex', alignItems: 'center', gap: 10}}>
									<Txt s={16} w={600}>{['Maria J.', 'Ryan K.', 'Alex T.', 'Jordan P.'][(i + seed) % 4]}</Txt>
									<Stars v={b.rating > 4.5 ? 5 : 3 + (i % 2)} s={14} />
									<Txt s={13} c={G.t3}>{b.reviews > 50 ? ['2 days ago', 'a week ago', '3 weeks ago'][i] : ['14 months ago', '2 years ago', '2 years ago'][i]}</Txt>
								</div>
								<Txt s={15} c={G.t2} style={{marginTop: 4}}>
									{b.reviews > 50
										? ['Best wood-fired pizza in East Austin. Booking was a pain though, had to call twice.', 'Packed every Friday. Tried to check the menu on my phone and gave up.', 'Amazing tiramisu. Their website needs some love!'][i]
										: ['Nice people, quiet place.', 'Ok.', 'Good'][i]}
								</Txt>
								{b.reviews > 50 && i === 0 && (
									<div style={{display: 'flex', gap: 6, marginTop: 8}}>
										{[3, 4, 5].map((j) => (
											<Photo key={j} n={ph(b, j)} w={74} h={74} r={8} />
										))}
									</div>
								)}
							</div>
						</div>
					))}
				</div>
			);
		case 'oldsite':
			return (
				<div style={{position: 'absolute', inset: 0, background: '#f1ece2', fontFamily: 'Times New Roman, serif', color: '#5a2a1a', padding: '18px 30px'}}>
					<div style={{textAlign: 'center', fontSize: 34, fontWeight: 700}}>~ Welcome to {b.name} ~</div>
					<div style={{display: 'flex', justifyContent: 'center', gap: 22, marginTop: 8, fontSize: 17, color: '#1a3fa0', textDecoration: 'underline'}}>
						{['Home', 'Menu (PDF)', 'Directions', 'Guestbook'].map((l) => (
							<span key={l}>{l}</span>
						))}
					</div>
					<div style={{display: 'flex', gap: 20, marginTop: 18}}>
						<Photo n={ph(b, 1)} w={300} h={220} style={{border: '4px ridge #a88', imageRendering: 'pixelated', filter: 'saturate(0.6) contrast(0.85) blur(0.6px)'}} />
						<div style={{flex: 1, fontSize: 18, lineHeight: 1.5}}>
							Call us to make a reservation! We are open Tuesday to Sunday. Please download our menu (PDF, 8.4 MB).
							<div style={{marginTop: 14, fontSize: 14, color: '#8a6a5a'}}>Best viewed on desktop · © 2017</div>
						</div>
					</div>
					<div style={{position: 'absolute', right: 18, top: 14, height: 30, padding: '0 12px', borderRadius: 6, background: '#d93025', color: '#fff', fontFamily: ui, fontSize: 14, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6}}>
						<Icon n="smartphone" size={16} color="#fff" /> Not mobile-friendly
					</div>
				</div>
			);
		case 'social':
			return (
				<div style={{position: 'absolute', inset: 0, background: '#fff', padding: '20px 34px'}}>
					<div style={{display: 'flex', alignItems: 'center', gap: 34}}>
						<div style={{padding: 4, borderRadius: '50%', background: 'linear-gradient(45deg, #f9ce34, #ee2a7b, #6228d7)'}}>
							<Photo n={ph(b, 0)} w={104} h={104} r={52} style={{border: '4px solid #fff'}} />
						</div>
						<div>
							<div style={{display: 'flex', alignItems: 'center', gap: 14}}>
								<Txt s={22} w={500}>{b.handle}</Txt>
								<div style={{height: 32, padding: '0 16px', borderRadius: 8, background: '#0095f6', color: '#fff', fontFamily: ui, fontSize: 15, fontWeight: 600, display: 'flex', alignItems: 'center'}}>Follow</div>
								<div style={{height: 32, padding: '0 16px', borderRadius: 8, background: '#efefef', fontFamily: ui, fontSize: 15, fontWeight: 600, display: 'flex', alignItems: 'center'}}>Message</div>
							</div>
							<div style={{display: 'flex', gap: 26, marginTop: 10}}>
								<Txt s={16}><b>{b.posts}</b> posts</Txt>
								<Txt s={16}><b>{b.followers}</b> followers</Txt>
							</div>
							<Txt s={15} w={600} style={{marginTop: 6}}>{b.name}</Txt>
							<Txt s={14} c={G.t2}>{b.kind} · East Austin · DM to book</Txt>
						</div>
					</div>
					<div style={{display: 'flex', gap: 22, marginTop: 14}}>
						{[0, 1, 2, 3, 4].map((i) => (
							<div key={i} style={{textAlign: 'center'}}>
								<div style={{padding: 2, borderRadius: '50%', border: '1.5px solid #dbdbdb'}}>
									<Photo n={ph(b, i + 5)} w={56} h={56} r={28} />
								</div>
								<Txt s={11} c={G.t1} style={{marginTop: 3}}>{['Menu', 'Pizza', 'Team', 'Events', 'Brunch'][i]}</Txt>
							</div>
						))}
					</div>
					<div style={{display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 3, marginTop: 14}}>
						{Array.from({length: 8}).map((_, i) => (
							<Photo key={i} n={ph(b, i + 2)} w="100%" h={150} />
						))}
					</div>
				</div>
			);
		case 'owner':
		case 'email':
			return (
				<div style={{position: 'absolute', inset: 0, background: '#fff', padding: '22px 34px'}}>
					<div style={{height: 50, borderRadius: 25, border: `1px solid ${G.line}`, boxShadow: '0 1px 6px rgba(32,33,36,0.18)', display: 'flex', alignItems: 'center', gap: 14, padding: '0 22px'}}>
						<Icon n="search" size={20} color={G.t2} />
						<Txt s={19}>{k === 'owner' ? `who owns ${b.name.toLowerCase()} austin` : `${b.name.toLowerCase()} email contact`}</Txt>
					</div>
					<Txt s={13} c={G.t3} style={{marginTop: 12}}>About {k === 'owner' ? '1,240' : '386'} results (0.41 seconds)</Txt>
					{(k === 'owner'
						? [['yelp.com', `${b.name} - Updated 2026 - Yelp`, 'Owner hasn’t claimed this business. 312 reviews of Bella Forno…'], ['linkedin.com', 'Results for “Bella Forno” | LinkedIn', 'No exact match found. See people named…'], ['austinbusinessjournal.com', 'East Austin restaurant openings (2016)', '…the family-run trattoria opened on East 6th…'], ['facebook.com', `${b.name} | Facebook`, 'Page transparency · Page created March 2015']]
						: [['bellaforno-austin.com', 'Contact – Bella Forno', 'Call us to make a reservation. Phone: (512) 555-0147'], ['yelp.com', `${b.name} – Yelp`, 'Phone number · Directions · No email listed'], ['facebook.com', `${b.name} | Facebook`, 'Send message · Usually replies within a few days'], ['reddit.com', 'best pizza east austin? : r/Austin', '“Bella Forno, but good luck booking a table…”']]
					).map(([d, t, sn], i) => (
						<div key={i} style={{marginTop: 18}}>
							<Txt s={13} c={G.t2}>{d}</Txt>
							<Txt s={20} c={G.link} style={{marginTop: 2}}>{t}</Txt>
							<Txt s={14} c={G.t2} style={{marginTop: 3}}>{sn}</Txt>
						</div>
					))}
				</div>
			);
		case 'contact':
			return (
				<div style={{position: 'absolute', inset: 0, background: '#f1ece2', fontFamily: 'Times New Roman, serif', color: '#5a2a1a', padding: '30px 40px'}}>
					<div style={{fontSize: 32, fontWeight: 700}}>Contact us</div>
					<div style={{display: 'flex', gap: 24, marginTop: 14}}>
						<div style={{fontSize: 20, lineHeight: 1.6}}>
							Phone: (512) 555-0147
							<br />
							Address: East Austin, TX
							<br />
							Email: <span style={{color: '#999'}}>—</span>
						</div>
						<Photo n={ph(b, 6)} w={260} h={170} style={{border: '4px ridge #a88', filter: 'saturate(0.6)'}} />
					</div>
					<div style={{marginTop: 22, width: 460, height: 140, border: '2px inset #bbb', background: '#fff', fontFamily: ui, fontSize: 15, color: '#999', padding: 12}}>Contact form temporarily unavailable</div>
				</div>
			);
		case 'sheet':
			return (
				<div style={{position: 'absolute', inset: 0, background: '#fff', fontFamily: ui}}>
					<div style={{height: 36, background: '#f8f9fa', borderBottom: '1px solid #e0e3e6', display: 'flex', alignItems: 'center', padding: '0 12px', gap: 10}}>
						<div style={{width: 18, height: 18, borderRadius: 3, background: '#188038'}} />
						<Txt s={14} c={G.t1}>prospects_FINAL_v3</Txt>
					</div>
					<div style={{display: 'grid', gridTemplateColumns: '40px 220px 100px 110px 150px 150px', fontSize: 15}}>
						{['', 'Business', 'Reviews', 'Site?', 'Contact?', 'Worth it?'].map((h, i) => (
							<div key={i} style={{height: 38, background: '#f1f3f4', borderRight: '1px solid #e0e3e6', borderBottom: '1px solid #e0e3e6', fontWeight: 700, color: '#3c4043', display: 'flex', alignItems: 'center', padding: '0 10px'}}>
								{h}
							</div>
						))}
						{Array.from({length: 13}).map((_, r) =>
							[String(r + 2), ['Bella Forno', 'Lumen Nail', 'Taquería El Sol', 'Juniper Café', 'Noodle Theory', 'Southside BBQ', 'Kinfolk Barbers', 'Iron Tide Gym', 'Petal & Stem', 'Cielo Tacos', 'Moss Dental', 'Green Bowl', 'Velvet Room'][r], ['312', '6', '186', '98', '77', '241', '54', '120', '33', '15', '89', '65', '121'][r], ['old', 'none', 'none', 'weak', 'none', 'IG', '?', 'old', '?', 'none', 'ok', '?', 'weak'][r], ['phone', '?', '?', 'email?', '?', 'DM', '?', '?', '?', '?', 'phone', '?', '?'][r], ['?', 'no?', '?', '?', '?', '?', '?', '?', '?', '?', '?', '?', '?'][r]].map((v, c) => (
								<div key={`${r}-${c}`} style={{height: 38, borderRight: '1px solid #e0e3e6', borderBottom: '1px solid #e0e3e6', color: v === '?' ? '#d93025' : '#3c4043', background: v === '?' ? '#fce8e6' : r % 2 ? '#fff' : '#fafafa', display: 'flex', alignItems: 'center', padding: '0 10px', fontWeight: v === '?' ? 700 : 400}}>
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

const TITLES: Record<Kind, (b: Biz) => string> = {
	maps: (b) => `${b.name} – Maps`,
	list: () => 'restaurants near East Austin – Maps',
	reviews: (b) => `${b.name} – Reviews`,
	oldsite: (b) => `${b.name} | Home`,
	social: (b) => `@${b.handle}`,
	owner: () => 'who owns… – Search',
	email: () => 'email contact – Search',
	contact: () => 'Contact us',
	sheet: () => 'prospects_FINAL_v3 – Sheets',
};

const Window: React.FC<{k: Kind; b: Biz; seed: number; style?: React.CSSProperties; dim?: number}> = ({k, b, seed, style, dim = 0}) => (
	<div style={{position: 'absolute', width: W, height: H, borderRadius: 18, overflow: 'hidden', background: '#fff', border: '1px solid rgba(255,255,255,0.25)', boxShadow: '0 40px 100px rgba(0,0,0,0.6)', ...style}}>
		<div style={{height: 46, background: '#dee1e6', display: 'flex', alignItems: 'flex-end', gap: 8, padding: '0 14px'}}>
			<div style={{display: 'flex', gap: 8, alignSelf: 'center'}}>
				{['#ff5f57', '#febc2e', '#28c840'].map((c) => (
					<div key={c} style={{width: 13, height: 13, borderRadius: 7, background: c}} />
				))}
			</div>
			<div style={{marginLeft: 12, height: 36, maxWidth: 560, padding: '0 18px', borderRadius: '10px 10px 0 0', background: '#fff', display: 'flex', alignItems: 'center', fontFamily: ui, fontSize: 16, fontWeight: 500, color: G.t1, whiteSpace: 'nowrap', overflow: 'hidden'}}>{TITLES[k](b)}</div>
			<div style={{height: 36, padding: '0 14px', display: 'flex', alignItems: 'center', fontFamily: ui, fontSize: 15, color: G.t2, whiteSpace: 'nowrap'}}>+</div>
		</div>
		<div style={{position: 'absolute', left: 0, top: 46, right: 0, bottom: 0, overflow: 'hidden'}}>
			<Content k={k} b={b} seed={seed} />
		</div>
		{dim > 0 && <div style={{position: 'absolute', inset: 0, background: `rgba(9,9,11,${dim})`}} />}
	</div>
);

const KINDS: Kind[] = ['maps', 'list', 'reviews', 'reviews', 'oldsite', 'social', 'social', 'owner', 'owner', 'email', 'contact', 'sheet'];
const WBIZ = ['bella', 'bella', 'bella', 'lumen', 'bella', 'bella', 'juniper', 'bella', 'bella', 'bella', 'bella', 'bella'];
const ACTIONS = ['Maps', 'Maps', 'Reviews', 'Reviews', 'Website', 'Instagram', 'Instagram', 'Owner?', 'Owner?', 'Email?', 'Email?', 'Worth it?'];
// resting slots (front window ends near centre; older ones fan out behind)
const SLOT = (age: number, i: number) => {
	const side = i % 2 === 0 ? -1 : 1;
	return {
		x: 540 - W / 2 + side * age * 26 + (rand(i * 3.1) - 0.5) * 16,
		y: 760 - age * 44 + (rand(i * 7.7) - 0.5) * 70,
		z: -age * 150,
		ry: side * Math.min(18, age * 3),
		rz: (rand(i * 2.3) - 0.5) * 5,
	};
};
const FLICKS: [Kind, string][] = [['social', 'juniper'], ['maps', 'elsol'], ['reviews', 'kinfolk'], ['social', 'southside'], ['maps', 'noodle'], ['social', 'brunch'], ['reviews', 'juniper'], ['social', 'bar'], ['maps', 'green'], ['social', 'elsol'], ['reviews', 'southside'], ['social', 'noodle']];

export const Manual: React.FC<{f: number}> = ({f}) => {
	if (f < T.MAN_IN - 2 || f > T.ZERO_OUT + 30) return null;
	const opens = T.WIN_OPEN as unknown as number[];
	const opened = opens.filter((o) => o <= f).length;
	const freeze = ramp(f, T.FREEZE_ZERO, 10, EASE.UI);
	const ff = f < T.FREEZE_ZERO ? f : T.FREEZE_ZERO; // time stops at the freeze
	// camera: drifts in and rotates as the pile grows; jolts slightly per beat
	const grow = clamp01((ff - T.MAN_IN) / (T.FREEZE_ZERO - T.MAN_IN));
	const camS = lerp(1.14, 1.26, EASE.SOFT(grow));
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
								<Window k={KINDS[i]} b={BIZ[WBIZ[i]]} seed={i} dim={Math.min(0.55, age * 0.06)} />
							</div>
						);
					})}
					{/* "is this one even worth it?" — other businesses flick past, faster and faster */}
					{flickIdx >= 0 && ff < T.FREEZE_ZERO + 1 && (
						<div style={{position: 'absolute', left: 0, top: 0, transform: `translate3d(${540 - W / 2 + (rand(flickIdx) - 0.5) * 160}px, ${640 + (rand(flickIdx + 9) - 0.5) * 220}px, ${120}px) rotateZ(${(rand(flickIdx * 3) - 0.5) * 8}deg)`, filter: ff - flicks[flickIdx] < 3 ? `blur(${(3 - (ff - flicks[flickIdx])) * 3}px)` : undefined}}>
							<Window k={FLICKS[flickIdx % FLICKS.length][0]} b={BIZ[FLICKS[flickIdx % FLICKS.length][1]]} seed={flickIdx + 20} />
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
			{/* the current action, big — the hunt reads without sound */}
			{f < T.FREEZE_ZERO && opened > 0 && (
				<div style={{position: 'absolute', left: 90, top: 1560, width: 900, opacity: ramp(f, T.MAN_IN, 8) * (1 - freeze)}}>
					<Kinetic key={flickIdx >= 0 ? 'worth' : ACTIONS[opened - 1]} f={f} inAt={flickIdx >= 0 ? flicks[0] : opens[opened - 1]} text={flickIdx >= 0 ? 'Worth it? Next. Next.' : ACTIONS[opened - 1]} size={92} weight={800} stagger={2} dur={10} />
				</div>
			)}
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
