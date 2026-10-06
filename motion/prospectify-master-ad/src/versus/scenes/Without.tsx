import React from 'react';
import {C, EASE, FONT, clamp01, lerp, rand, ramp} from '../../final/tokens';
import {MapView, Photo, Pin} from '../../final/kit/media';
import {Star} from '../../final/kit/icons';
import {Chroma, Clock, COLD, ColdBG, BrandBG, H, Kword, P, SideLabel, W, appear, coldGrade, gone} from '../fx';
import {Chrome, Laptop, Phone} from '../devices';
import {GenericSite, PremiumSite, SITE_DW} from '../site';
import {TabChip} from '../../playbook/fx';

/* ───────────────────────────── HOOK ───────────────────────────── */
export const Hook: React.FC<{f: number}> = ({f}) => {
	if (f > P.W_IN + 14) return null;
	const end = gone(f, P.W_IN - 6, 14);
	const b = clamp01((f - P.H_BUILD) / (P.H_FORTY + 18 - P.H_BUILD));
	const zero = appear(f, P.H_ZERO, 12);
	const lw = 1180;
	const sc = (lw - 2 * lw * 0.018) / SITE_DW;
	const mins = Math.round(40 * EASE.SOFT(clamp01((f - P.H_BUILD) / (P.H_FORTY + 10 - P.H_BUILD))));
	return (
		<div style={{position: 'absolute', inset: 0, opacity: 1 - end}}>
			<BrandBG f={f} glow={0.8} gy={50} />
			<div style={{position: 'absolute', left: (W - lw) / 2, top: 120, transform: `translateY(${zero * 60}px) scale(${lerp(1.02, 0.86, zero)})`, filter: zero > 0 ? `blur(${zero * 6}px) brightness(${1 - zero * 0.55})` : undefined}}>
				<Laptop w={lw} rotX={lerp(14, 4, ramp(f, 0, 90, EASE.SOFT))} glare={lerp(0.1, 0.8, f / 200)}>
					<Chrome url="bellaforno.com" h={40}>
						<div style={{transform: `scale(${sc})`, transformOrigin: '0 0'}}>
							<PremiumSite b={b} f={f} scroll={lerp(0, 160, ramp(f, P.H_FORTY, 60, EASE.SOFT))} />
						</div>
					</Chrome>
				</Laptop>
			</div>
			{/* build timer */}
			<div style={{position: 'absolute', right: 150, top: 92, height: 64, padding: '0 22px', borderRadius: 32, background: 'rgba(255,255,255,0.06)', border: `1.5px solid ${C.lineStrong}`, display: 'flex', alignItems: 'center', gap: 12, fontFamily: FONT.sans, fontWeight: 800, fontSize: 30, color: C.text, opacity: appear(f, P.H_BUILD) * (1 - zero), backdropFilter: 'blur(10px)'}}>
				<div style={{width: 12, height: 12, borderRadius: 6, background: mins >= 40 ? '#34D399' : C.accent}} />
				{mins} min
				{mins >= 40 && <span style={{color: '#34D399'}}>✓</span>}
			</div>
			{zero > 0 && (
				<div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
					<Chroma f={f} hits={[P.H_ZERO, P.H_ZERO + 5]}>
						<div style={{display: 'flex', alignItems: 'baseline', gap: 36, fontFamily: FONT.sans, fontWeight: 800, letterSpacing: '-0.06em', transform: `scale(${lerp(1.4, 1, zero)})`, opacity: zero}}>
							<span style={{fontSize: 330, color: '#fff', lineHeight: 0.9}}>0</span>
							<span style={{fontSize: 150, color: '#fff'}}>clients.</span>
						</div>
					</Chroma>
				</div>
			)}
		</div>
	);
};

/* ───────────────────────────── WITHOUT ───────────────────────────── */
const TABS: [string, string][] = [
	['Maps – restaurants near me', '#34a853'], ['Bella Forno – Reviews (312)', '#fbbc04'], ['@bellaforno.atx', '#e1306c'], ['who owns bella forno?', '#4285f4'],
	['bella forno email contact', '#4285f4'], ['prospects_v3.xlsx', '#188038'], ['Reviews – El Sol', '#d32323'], ['Bella Forno | Home (2017)', '#a8744f'],
	['Maps – barbers near me', '#34a853'], ['Juniper Café – Reviews', '#fbbc04'], ['search results – page 4', '#0a66c2'], ['Inbox (23)', '#ea4335'],
	['Business page', '#1877f2'], ['Sheet2', '#188038'],
];
const TPOS = TABS.map((_, i) => ({x: 110 + rand(i * 3.3) * 1250, y: 150 + rand(i * 7.1) * 780, r: (rand(i * 5.5) - 0.5) * 12, s: 1.25 + rand(i * 2.2) * 0.45}));
const GUESS = [
	{n: 'Bella Forno', p: 'pizza_4', q: 'Website?'},
	{n: 'Juniper Café', p: 'cafe_1', q: 'Owner?'},
	{n: 'El Sol Taquería', p: 'tacos_0', q: 'Email?'},
];
const PINS = Array.from({length: 26}).map((_, i) => ({x: 300 + rand(i * 2.7) * 1400, y: 300 + rand(i * 5.3) * 1900}));

const Card: React.FC<{c: (typeof GUESS)[number]; w: number}> = ({c, w}) => (
	<div style={{width: w, borderRadius: 22, overflow: 'hidden', background: '#fff', boxShadow: '0 30px 70px rgba(0,0,0,0.5)'}}>
		<Photo n={c.p} w={w} h={w * 0.62} />
		<div style={{padding: '16px 20px 20px', fontFamily: FONT.sans}}>
			<div style={{fontSize: 26, fontWeight: 800, color: '#1d1d1f'}}>{c.n}</div>
			<div style={{display: 'flex', alignItems: 'center', gap: 6, marginTop: 6, fontSize: 18, color: '#666', fontWeight: 600}}>
				<Star size={18} /> 4.7 · Restaurant
			</div>
		</div>
	</div>
);

export const Without: React.FC<{f: number}> = ({f}) => {
	if (f < P.W_IN - 2 || f > P.T_IN + 40) return null;
	const inT = appear(f, P.W_IN, 10);
	// clock: 11:46 PM → 2:07 AM across the act, jumping on each beat
	const beats = [P.W_IN, P.W_MAPS, P.W_TABS, P.W_GUESS, P.W_COLD, P.W_SEEN, P.W_GENERIC, P.W_LATE];
	const minsAt = [23 * 60 + 46, 23 * 60 + 58, 24 * 60 + 21, 24 * 60 + 44, 25 * 60 + 9, 25 * 60 + 31, 25 * 60 + 52, 26 * 60 + 7];
	let bi = beats.filter((b) => f >= b).length - 1;
	bi = Math.max(0, bi);
	const roll = ramp(f, beats[bi], 10, EASE.FAST_LOCK);
	const mins = lerp(bi > 0 ? minsAt[bi - 1] : minsAt[0], minsAt[bi], roll);
	const turn = ramp(f, P.T_IN, 30, EASE.CAMERA); // rewind handled in With scene; here fade the cold world
	const sec = (a: number, b: number) => (f >= a - 2 && f < b + 10 ? appear(f, a, 10) * (1 - gone(f, b - 2, 10)) : 0);
	const sMaps = sec(P.W_MAPS - 6, P.W_TABS - 8);
	const sTabs = sec(P.W_TABS - 14, P.W_GUESS);
	const sGuess = sec(P.W_GUESS, P.W_COLD);
	const sCold = sec(P.W_COLD, P.W_SEEN);
	const sSeen = sec(P.W_SEEN, P.W_GENERIC);
	const sGen = sec(P.W_GENERIC, P.W_LATE);
	const sLate = f >= P.W_LATE ? appear(f, P.W_LATE, 12) : 0;
	return (
		<div style={{position: 'absolute', inset: 0, opacity: inT * (1 - turn)}}>
			<ColdBG f={f} />
			<SideLabel f={f} at={P.W_IN} out={P.T_IN} />
			{/* small clock, top-right (big one at the end) */}
			<div style={{position: 'absolute', right: 80, top: 50, opacity: 1 - sLate}}>
				<Chroma f={f} hits={beats.slice(1)} amt={0.6}>
					<Clock mins={mins} size={64} />
				</Chroma>
			</div>
			{/* intro beat: "your night" — monitor glow, person-less desk feel: big clock */}
			{f < P.W_MAPS + 6 && (
				<div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: appear(f, P.W_IN, 12) * (1 - sMaps)}}>
					<Chroma f={f} hits={[P.W_IN + 2]}>
						<Clock mins={mins} size={260} />
					</Chroma>
				</div>
			)}
			<div style={{position: 'absolute', inset: 0, ...coldGrade}}>
				{/* MAPS: endless scrolling */}
				{sMaps > 0 && (
					<div style={{position: 'absolute', left: 260, top: 150, width: 1400, height: 800, borderRadius: 18, overflow: 'hidden', boxShadow: '0 40px 100px rgba(0,0,0,0.6)', opacity: sMaps, transform: `scale(${lerp(0.94, 1, sMaps)})`}}>
						<Chrome url="maps · restaurants near me" h={46} dark={false}>
							<div style={{display: 'flex', width: '100%', height: '100%'}}>
								<div style={{width: 380, background: '#fff', padding: 16, overflow: 'hidden'}}>
									<div style={{transform: `translateY(${-((f - P.W_MAPS) * 9) % 900}px)`}}>
										{Array.from({length: 14}).map((_, i) => (
											<div key={i} style={{display: 'flex', gap: 12, padding: '12px 0', borderBottom: '1px solid #eee', fontFamily: FONT.sans}}>
												<Photo n={['pizza_4', 'cafe_1', 'tacos_0', 'barber_0', 'bbq_0', 'noodles_0', 'brunch_1'][i % 7]} w={84} h={70} r={10} />
												<div>
													<div style={{fontSize: 18, fontWeight: 700, color: '#222'}}>{['Bella Forno', 'Juniper Café', 'El Sol Taquería', 'Kinfolk Barbers', 'Southside BBQ', 'Noodle Theory', 'Sunny Side'][i % 7]}</div>
													<div style={{fontSize: 14, color: '#777', marginTop: 4}}>★ 4.{(i * 3) % 9} · Open until 11 PM</div>
												</div>
											</div>
										))}
									</div>
								</div>
								<div style={{flex: 1, position: 'relative'}}>
									<MapView w={1020} h={760} cx={1000 + Math.sin((f - P.W_MAPS) / 14) * 260} cy={900 + ((f - P.W_MAPS) * 6) % 900} zoom={1}>
										{PINS.map((p, i) => (
											<Pin key={i} x={p.x} y={p.y} s={1.1} />
										))}
									</MapView>
								</div>
							</div>
						</Chrome>
					</div>
				)}
				{/* TABS */}
				{sTabs > 0 &&
					TABS.map(([l, dot], i) => {
						const at = P.W_TABS - 14 + i * 2;
						const t = ramp(f, at, 12, EASE.FAST_LOCK);
						if (t <= 0) return null;
						const p = TPOS[i];
						return (
							<div key={i} style={{position: 'absolute', left: p.x, top: p.y, opacity: t * sTabs, transform: `translateY(${(1 - t) * 60}px) rotate(${p.r}deg) scale(${p.s})`, filter: t < 1 ? `blur(${(1 - t) * 8}px)` : undefined}}>
								<TabChip label={l} dot={dot} scale={1.2} />
							</div>
						);
					})}
				{/* GUESS */}
				{sGuess > 0 && (
					<div style={{position: 'absolute', left: 0, right: 0, top: 230, display: 'flex', justifyContent: 'center', gap: 60, opacity: sGuess}}>
						{GUESS.map((c, i) => {
							const t = ramp(f, P.W_GUESS + i * 5, 14, EASE.FAST_LOCK);
							const q = ramp(f, P.W_GUESS + 12 + i * 6, 10, EASE.OVERSHOOT);
							return (
								<div key={c.n} style={{position: 'relative', transform: `translateY(${(1 - t) * 80}px) rotate(${(i - 1) * 4}deg)`, opacity: t}}>
									<Card c={c} w={400} />
									<div style={{position: 'absolute', right: -24, top: -26, height: 64, padding: '0 22px', borderRadius: 18, background: '#ffcc00', color: '#1d1d1f', fontFamily: FONT.sans, fontWeight: 800, fontSize: 30, display: 'flex', alignItems: 'center', transform: `scale(${q}) rotate(6deg)`, boxShadow: '0 12px 30px rgba(0,0,0,0.4)'}}>{c.q}</div>
								</div>
							);
						})}
					</div>
				)}
				{/* COLD MESSAGE: same text, copy-paste, again and again */}
				{sCold > 0 && (
					<div style={{position: 'absolute', inset: 0, opacity: sCold}}>
						{[0, 1, 2, 3].map((i) => {
							const at = P.W_COLD + i * 10;
							const t = ramp(f, at, 12, EASE.FAST_LOCK);
							if (t <= 0) return null;
							return (
								<div key={i} style={{position: 'absolute', left: 430 + i * 70, top: 170 + i * 60, width: 980, borderRadius: 18, background: '#fff', boxShadow: '0 30px 80px rgba(0,0,0,0.55)', overflow: 'hidden', fontFamily: FONT.sans, opacity: t, transform: `translateY(${(1 - t) * 50}px)`}}>
									<div style={{height: 54, background: '#f2f2f5', display: 'flex', alignItems: 'center', padding: '0 22px', fontSize: 20, fontWeight: 700, color: '#333'}}>New message</div>
									<div style={{padding: '14px 24px', fontSize: 20, color: '#666', borderBottom: '1px solid #eee'}}>To: {['info@bellaforno.com', 'hello@junipercafe.co', 'elsol.taqueria@gmail.com', 'contact@kinfolk.com'][i]}</div>
									<div style={{padding: '14px 24px', fontSize: 20, color: '#666', borderBottom: '1px solid #eee'}}>Subject: Website?</div>
									<div style={{padding: '22px 24px', fontSize: 28, color: '#222', height: 150}}>Hi, do you need a website?</div>
									<div style={{position: 'absolute', right: 24, bottom: 22, height: 50, padding: '0 26px', borderRadius: 25, background: '#3d6fd8', color: '#fff', fontSize: 20, fontWeight: 700, display: 'flex', alignItems: 'center'}}>Send</div>
								</div>
							);
						})}
						{/* ⌘C ⌘V keycaps */}
						<div style={{position: 'absolute', left: 140, top: 640, display: 'flex', gap: 18}}>
							{['⌘C', '⌘V', '⌘V', '⌘V'].map((k, i) => {
								const at = P.W_COLD + i * 10 - 2;
								const press = f >= at && f < at + 6;
								return (
									<div key={i} style={{width: 120, height: 120, borderRadius: 24, background: press ? '#dfe6ef' : '#1a2029', border: '2px solid rgba(255,255,255,0.15)', color: press ? '#111' : COLD.ink, fontFamily: FONT.sans, fontWeight: 800, fontSize: 38, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: ramp(f, at - 4, 6), transform: `translateY(${press ? 6 : 0}px)`, boxShadow: press ? 'none' : '0 6px 0 rgba(0,0,0,0.6)'}}>
										{k}
									</div>
								);
							})}
						</div>
					</div>
				)}
				{/* SEEN */}
				{sSeen > 0 && (
					<div style={{position: 'absolute', left: (W - 430) / 2, top: 60, opacity: sSeen, transform: `translateY(${(1 - sSeen) * 80}px)`}}>
						<Phone w={430} time="1:31" rotY={-6}>
							<div style={{position: 'absolute', inset: 0, background: '#0b141a', fontFamily: FONT.sans}}>
								<div style={{height: 150, background: '#1f2c34', display: 'flex', alignItems: 'flex-end', padding: '0 20px 16px', gap: 12}}>
									<Photo n="pizza_4" w={46} h={46} r={23} />
									<div style={{color: '#e9edef', fontSize: 20, fontWeight: 700}}>
										Bella Forno
										<div style={{fontSize: 14, color: '#8696a0', fontWeight: 500}}>{f > P.W_SEEN_TYPING && f < P.W_SEEN_STOP ? 'typing…' : 'last seen just now'}</div>
									</div>
								</div>
								<div style={{position: 'absolute', right: 16, top: 190, maxWidth: 300, padding: '12px 14px', borderRadius: 14, background: '#005c4b', color: '#e9edef', fontSize: 19, lineHeight: 1.35}}>
									Hi, do you need a website?
									<div style={{textAlign: 'right', fontSize: 13, color: f >= P.W_SEEN ? '#53bdeb' : '#8696a0', marginTop: 4}}>11:58 PM ✓✓</div>
								</div>
								{f > P.W_SEEN_TYPING && f < P.W_SEEN_STOP && (
									<div style={{position: 'absolute', left: 16, top: 290, padding: '14px 18px', borderRadius: 14, background: '#202c33', display: 'flex', gap: 6}}>
										{[0, 1, 2].map((i) => (
											<div key={i} style={{width: 10, height: 10, borderRadius: 5, background: '#8696a0', opacity: 0.4 + 0.6 * Math.abs(Math.sin((f + i * 6) / 6))}} />
										))}
									</div>
								)}
							</div>
						</Phone>
					</div>
				)}
				{/* GENERIC */}
				{sGen > 0 && (
					<div style={{position: 'absolute', left: 0, right: 0, top: 110, display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: sGen}}>
						<div style={{width: 900, height: 76, borderRadius: 20, background: '#1a2029', border: `1.5px solid ${COLD.line}`, display: 'flex', alignItems: 'center', padding: '0 26px', fontFamily: FONT.sans, fontSize: 30, color: COLD.ink, fontWeight: 600}}>
							› {'make a restaurant website'.slice(0, Math.round(25 * clamp01((f - P.W_GENERIC) / 22)))}
						</div>
						<div style={{marginTop: 30, opacity: appear(f, P.W_GSITE, 14), transform: `translateY(${(1 - appear(f, P.W_GSITE, 14)) * 40}px)`}}>
							<Laptop w={900} rotX={6}>
								<div style={{transform: `scale(${(900 - 2 * 900 * 0.018) / SITE_DW})`, transformOrigin: '0 0'}}>
									<GenericSite b={clamp01((f - P.W_GSITE) / 30)} />
								</div>
							</Laptop>
						</div>
					</div>
				)}
			</div>
			{/* kinetic captions — the pain, one word per beat */}
			<div style={{position: 'absolute', left: 0, right: 0, bottom: 70, display: 'flex', justifyContent: 'center'}}>
				{f >= P.W_MAPS && f < P.W_TABS - 8 && <Kword f={f} at={P.W_MAPS} text="Hours." size={130} color={COLD.ink} out={P.W_TABS - 12} />}
				{f >= P.W_TABS && f < P.W_GUESS && (
					<Chroma f={f} hits={[P.W_TABS + 2]}>
						<Kword f={f} at={P.W_TABS} text="14 tabs." size={150} color="#fff" out={P.W_GUESS - 4} />
					</Chroma>
				)}
				{f >= P.W_COLD && f < P.W_SEEN && <Kword f={f} at={W_COLD_WORD()} text="Same message." size={120} color={COLD.ink} out={P.W_SEEN - 4} />}
				{f >= P.W_SEEN && f < P.W_GENERIC && (
					<Chroma f={f} hits={[P.W_NOREPLY]}>
						<Kword f={f} at={P.W_NOREPLY} text="No reply." size={150} color="#fff" out={P.W_GENERIC - 4} />
					</Chroma>
				)}
				{f >= P.W_GSITE && f < P.W_LATE && <Kword f={f} at={P.W_GSITE} text="Generic." size={130} color={COLD.ink} out={P.W_LATE - 4} />}
			</div>
			{/* LATE: 2:07 AM, zero */}
			{sLate > 0 && (
				<div style={{position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: `rgba(4,6,9,${0.75 * sLate})`}}>
					<div style={{opacity: sLate, transform: `scale(${lerp(1.15, 1, sLate)})`}}>
						<Chroma f={f} hits={[P.W_LATE + 1]}>
							<Clock mins={mins} size={250} />
						</Chroma>
					</div>
					<div style={{marginTop: 30}}>
						<Chroma f={f} hits={[P.W_ZERO]}>
							<Kword f={f} at={P.W_ZERO} text="0 clients." size={140} color="#fff" />
						</Chroma>
					</div>
				</div>
			)}
		</div>
	);
};

const W_COLD_WORD = () => P.W_COLD + 12;
export const HH = H;
