import React from 'react';
import {Img, staticFile} from 'remotion';
import {C, EASE, clamp01, lerp, rand, ramp} from '../final/tokens';
import {Logo} from '../final/kit/ui';
import {Icon, Star} from '../final/kit/icons';
import {MapView, Photo, Pin, photo} from '../final/kit/media';
import {TabChip} from '../playbook/fx';
import {BrandBG, Chroma, Clock, COLD, ColdBG, GF, P, W, appear, coldGrade, gone} from './fx';
import {Chrome, Laptop, Phone} from '../versus/devices';
import {MobileSite, PremiumSite, SITE_DW} from '../versus/site';
import {APP_H, APP_W, BUILDERS, Pill, ProspectifyApp} from '../versus/app';

/* ───────────────────────── LEAD CARD (frame 0 = last frame) ───────────────────────── */
const Row: React.FC<{icon: string; label: string; value: React.ReactNode; hot?: boolean}> = ({icon, label, value, hot}) => (
	<div style={{display: 'flex', alignItems: 'center', gap: 16, height: 62, borderTop: `1px solid ${C.line}`, fontSize: 25, color: C.text2}}>
		<Icon n={icon} size={24} color={hot ? C.accentBright : C.text3} sw={2} />
		<span style={{width: 130, color: C.text3}}>{label}</span>
		<span style={{color: hot ? C.accentBright : C.text, fontWeight: hot ? 700 : 500}}>{value}</span>
	</div>
);

/** The circle a hand draws around "Website — None". */
const Scribble: React.FC<{t: number}> = ({t}) => {
	if (t <= 0) return null;
	const d = 'M 30 52 C 40 8, 470 4, 520 40 C 560 70, 470 104, 260 102 C 90 100, 8 88, 22 52 C 30 30, 120 14, 230 12';
	return (
		<svg width={600} height={120} viewBox="0 0 560 120" style={{position: 'absolute', left: -38, top: -30, overflow: 'visible'}}>
			<path d={d} fill="none" stroke={C.accentBright} strokeWidth={5} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - t} style={{filter: `drop-shadow(0 0 12px rgba(${C.accentRGB},0.6))`}} />
		</svg>
	);
};

export const LeadCard: React.FC<{f: number; noweb: number; score: number; push: number}> = ({f, noweb, score, push}) => (
	<div style={{width: 1260, height: 560, borderRadius: 30, background: 'linear-gradient(180deg,#17171b,#111114)', border: `1.5px solid ${C.lineStrong}`, boxShadow: '0 60px 140px rgba(0,0,0,0.65)', display: 'flex', overflow: 'visible', position: 'relative', fontFamily: GF, transform: `scale(${push})`}}>
		<div style={{width: 520, height: 560, borderRadius: '30px 0 0 30px', overflow: 'hidden', position: 'relative'}}>
			<Img src={photo('pizza_4')} style={{width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${1.06 + 0.04 * Math.sin(f / 90)})`}} />
			<div style={{position: 'absolute', left: 18, bottom: 16, fontSize: 15, color: 'rgba(255,255,255,0.7)'}}>Sample business</div>
		</div>
		<div style={{flex: 1, padding: '40px 46px'}}>
			<div style={{display: 'flex', alignItems: 'center', gap: 10, fontSize: 20, color: C.text3}}>
				<Icon n="pin" size={20} color="#4f8cf7" sw={2.2} /> Maps listing
			</div>
			<div style={{marginTop: 14, fontSize: 64, fontWeight: 650, letterSpacing: '-0.04em', color: C.text}}>Bella Forno</div>
			<div style={{marginTop: 6, fontSize: 25, color: C.text2}}>Pizzeria · East Austin</div>
			<div style={{marginTop: 18, marginBottom: 22, display: 'flex', alignItems: 'center', gap: 6, fontSize: 28, fontWeight: 650, color: C.text}}>
				{[0, 1, 2, 3, 4].map((i) => (
					<Star key={i} size={28} />
				))}
				<span style={{marginLeft: 10}}>4.8</span>
				<span style={{color: C.text2, fontWeight: 500}}>· 312 reviews</span>
			</div>
			<Row icon="pin" label="Address" value="1208 E 6th St" />
			<Row icon="phone" label="Phone" value="(512) 555-0136" />
			<div style={{position: 'relative'}}>
				<Row icon="globe" label="Website" value="None" hot={noweb > 0.5} />
				<div style={{position: 'absolute', left: 0, top: 0}}>
					<Scribble t={noweb} />
				</div>
			</div>
		</div>
		{/* Prospectify score badge */}
		{score > 0 && (
			<div style={{position: 'absolute', right: -36, top: -40, display: 'flex', alignItems: 'center', gap: 16, padding: '16px 24px 16px 18px', borderRadius: 24, background: 'rgba(14,14,17,0.96)', border: `1.5px solid rgba(${C.accentRGB},0.55)`, boxShadow: `0 24px 60px rgba(0,0,0,0.55), 0 0 50px rgba(${C.accentRGB},0.25)`, transform: `scale(${lerp(0.6, 1, EASE.OVERSHOOT(score))}) rotate(${lerp(-6, 2, score)}deg)`, opacity: clamp01(score * 2)}}>
				<Logo size={40} />
				<div>
					<div style={{fontSize: 46, fontWeight: 700, color: C.accentBright, lineHeight: 1}}>
						{Math.round(94 * clamp01(score * 1.3))}
						<span style={{fontSize: 20, color: C.text3, fontWeight: 500}}> /100</span>
					</div>
					<div style={{fontSize: 18, color: C.text2, marginTop: 4}}>High opportunity</div>
				</div>
			</div>
		)}
	</div>
);

/** Hook (frame 0) and loop end: the same card, the same place. */
export const Hook: React.FC<{f: number}> = ({f}) => {
	const loopIn = f >= P.LP_IN ? ramp(f, P.LP_PIZ - 10, 22, EASE.FAST_LOCK) : 0;
	const inHook = f < P.PN_IN + 12;
	if (!inHook && loopIn <= 0) return null;
	const out = inHook ? gone(f, P.PN_IN - 4, 12) : 0;
	const noweb = inHook ? ramp(f, P.HK_NOWEB, 16, EASE.SOFT) : 0;
	const score = inHook ? ramp(f, P.HK_SCORE, 14, EASE.UI) : 0;
	const push = inHook ? lerp(1, 1.035, ramp(f, 0, P.PN_IN, EASE.SOFT)) : lerp(1.12, 1, loopIn);
	const o = inHook ? 1 - out : loopIn;
	return (
		<div style={{position: 'absolute', inset: 0, opacity: o}}>
			<BrandBG f={inHook ? f : 0} glow={0.9} gy={42} />
			<div style={{position: 'absolute', left: (W - 1260) / 2, top: 150, transform: 'scale(1.14)', transformOrigin: '50% 0', filter: o < 1 ? `blur(${(1 - o) * 14}px)` : undefined}}>
				<LeadCard f={inHook ? f : 0} noweb={noweb} score={score} push={push * (inHook ? lerp(1, 0.9, out) : 1)} />
			</div>
		</div>
	);
};

/* ───────────────────────── PAIN: four flashes ───────────────────────── */
const TABS: [string, string][] = [
	['Maps – restaurants near me', '#34a853'], ['Bella Forno – Reviews (312)', '#fbbc04'], ['who owns bella forno?', '#4285f4'], ['prospects_v3.xlsx', '#188038'],
	['bella forno email?', '#4285f4'], ['Reviews – El Sol', '#d32323'], ['search results – page 4', '#0a66c2'], ['Inbox (23)', '#ea4335'], ['Sheet2', '#188038'],
];
export const Pain: React.FC<{f: number}> = ({f}) => {
	if (f < P.PN_IN - 2 || f > P.PN_OUT + 12) return null;
	const fl = P.PN_FLASH as unknown as number[];
	const k = Math.max(0, fl.filter((x) => f >= x).length - 1);
	const t = ramp(f, fl[k], 8, EASE.FAST_LOCK);
	const o = appear(f, P.PN_IN, 6) * (1 - gone(f, P.PN_OUT, 10));
	const z = lerp(1.08, 1, t);
	return (
		<div style={{position: 'absolute', inset: 0, opacity: o}}>
			<ColdBG f={f} />
			<Chroma f={f} hits={fl} amt={0.8}>
				<div style={{position: 'absolute', left: 0, top: 0, width: W, height: 820, transform: `scale(${z})`, ...coldGrade}}>
					{k === 0 &&
						TABS.map(([l, d], i) => (
							<div key={i} style={{position: 'absolute', left: 260 + rand(i * 3.3) * 1000, top: 120 + rand(i * 7.1) * 560, transform: `rotate(${(rand(i * 5.5) - 0.5) * 12}deg) scale(1.5)`, opacity: ramp(f, fl[0] + i, 4)}}>
								<TabChip label={l} dot={d} />
							</div>
						))}
					{k === 1 && (
						<div style={{position: 'absolute', left: 460, top: 110, width: 1000, height: 620, borderRadius: 18, overflow: 'hidden', boxShadow: '0 40px 100px rgba(0,0,0,0.6)'}}>
							<MapView w={1000} h={620} cx={1000} cy={900 + (f - fl[1]) * 9} zoom={1}>
								{Array.from({length: 18}).map((_, i) => (
									<Pin key={i} x={500 + rand(i * 2.7) * 1100} y={500 + rand(i * 5.3) * 1500} s={1.1} />
								))}
							</MapView>
						</div>
					)}
					{k === 2 && (
						<div style={{position: 'absolute', left: (W - 320) / 2, top: 80}}>
							<Phone w={320} time="1:31">
								<div style={{position: 'absolute', inset: 0, background: '#0b141a', fontFamily: GF}}>
									<div style={{height: 116, background: '#1f2c34', display: 'flex', alignItems: 'flex-end', padding: '0 16px 12px', gap: 10}}>
										<Photo n="pizza_4" w={36} h={36} r={18} />
										<div style={{color: '#e9edef', fontSize: 16, fontWeight: 700}}>Bella Forno</div>
									</div>
									<div style={{position: 'absolute', right: 12, top: 150, maxWidth: 230, padding: '10px 12px', borderRadius: 12, background: '#005c4b', color: '#e9edef', fontSize: 15}}>
										Hi, do you need a website?
										<div style={{textAlign: 'right', fontSize: 11, color: '#53bdeb', marginTop: 3}}>Seen ✓✓</div>
									</div>
								</div>
							</Phone>
						</div>
					)}
					{k === 3 && (
						<div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
							<Clock mins={26 * 60 + 7} size={300} />
						</div>
					)}
				</div>
			</Chroma>
		</div>
	);
};

/* ───────────────────────── REVEAL: the numbered open loop ───────────────────────── */
const STEPS = [
	['1', 'Find the client', 'target'],
	['2', 'Write the message', 'message'],
	['3', 'Write the site prompt', 'sparkles'],
];
export const Reveal: React.FC<{f: number}> = ({f}) => {
	if (f < P.RV_IN - 2 || f > P.N1_IN + 14) return null;
	const o = appear(f, P.RV_IN, 12) * (1 - gone(f, P.N1_IN - 4, 12));
	return (
		<div style={{position: 'absolute', inset: 0, opacity: o}}>
			<BrandBG f={f} glow={1.2} gy={45} />
			<div style={{position: 'absolute', left: 0, right: 0, top: 150, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 22, transform: `scale(${lerp(0.9, 1, appear(f, P.RV_IN, 16))})`}}>
				<Logo size={86} />
				<div style={{fontFamily: GF, fontSize: 92, fontWeight: 650, letterSpacing: '-0.05em', color: C.text}}>Prospectify</div>
			</div>
			<div style={{position: 'absolute', left: 0, right: 0, top: 380, display: 'flex', justifyContent: 'center', gap: 34}}>
				{STEPS.map(([n, l, ic], i) => {
					const t = appear(f, P.RV_THREE + i * 6, 14);
					return (
						<div key={n} style={{width: 470, height: 330, borderRadius: 28, background: 'linear-gradient(180deg,#19191d,#121215)', border: `1.5px solid ${C.lineStrong}`, padding: 34, opacity: t, transform: `translateY(${(1 - t) * 60}px) scale(${lerp(0.9, 1, t)})`, filter: t < 1 ? `blur(${(1 - t) * 8}px)` : undefined, fontFamily: GF}}>
							<div style={{fontSize: 150, fontWeight: 700, lineHeight: 1, letterSpacing: '-0.06em', background: C.grad, WebkitBackgroundClip: 'text', color: 'transparent'}}>{n}</div>
							<div style={{marginTop: 30, display: 'flex', alignItems: 'center', gap: 12, fontSize: 32, fontWeight: 600, color: C.text}}>
								<Icon n={ic} size={30} color={C.accent} sw={2.2} />
								{l}
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
};

/* ───────────────────────── 1 · 2 · 3 : the app, then the builder ───────────────────────── */
type Cam = [number, number, number, number];
const camAt = (f: number, keys: Cam[]) => {
	let i = 0;
	while (i < keys.length - 1 && f >= keys[i + 1][0]) i++;
	const a = keys[i];
	const b = keys[Math.min(i + 1, keys.length - 1)];
	const t = b[0] === a[0] ? 1 : EASE.CAMERA(clamp01((f - a[0]) / Math.min(26, b[0] - a[0])));
	return {cx: lerp(a[1], b[1], t), cy: lerp(a[2], b[2], t), s: lerp(a[3], b[3], t)};
};

/** Progress strip — keeps the open loop visible: 1 Find · 2 Message · 3 Prompt. */
const Progress: React.FC<{f: number}> = ({f}) => {
	const act = f >= P.N3_IN ? 2 : f >= P.N2_IN ? 1 : 0;
	return (
		<div style={{position: 'absolute', left: 0, right: 0, top: 30, display: 'flex', justifyContent: 'center', gap: 14, fontFamily: GF}}>
			{STEPS.map(([n, l], i) => {
				const on = i === act;
				const done = i < act;
				return (
					<div key={n} style={{height: 54, padding: '0 22px 0 8px', borderRadius: 980, display: 'flex', alignItems: 'center', gap: 12, background: on ? 'rgba(244,37,98,0.14)' : 'rgba(255,255,255,0.04)', border: `1.5px solid ${on ? `rgba(${C.accentRGB},0.7)` : C.line}`, color: on ? C.text : done ? C.text2 : C.text3, fontSize: 22, fontWeight: 600, transform: `scale(${on ? 1 + 0.06 * (1 - ramp(f, [P.N1_IN, P.N2_IN, P.N3_IN][i], 12)) : 1})`}}>
						<div style={{width: 38, height: 38, borderRadius: 19, display: 'flex', alignItems: 'center', justifyContent: 'center', background: on ? C.grad : done ? 'rgba(52,211,153,0.18)' : 'rgba(255,255,255,0.06)', fontSize: 19, fontWeight: 700, color: done ? '#34D399' : '#fff'}}>{done ? '✓' : n}</div>
						{l}
					</div>
				);
			})}
		</div>
	);
};

export const Steps: React.FC<{f: number}> = ({f}) => {
	if (f < P.N1_IN - 4 || f > P.CTA_IN + 14) return null;
	const o = appear(f, P.N1_IN - 4, 14) * (1 - gone(f, P.CTA_IN - 6, 12));
	const appOut = ramp(f, P.TL_IN - 4, 20, EASE.CAMERA);
	const cam = camAt(f, [
		[P.N1_IN, 800, 500, 0.68],
		[P.F_ROWS, 700, 300, 0.92],
		[P.F_SCORE, 800, 330, 1.02],
		[P.N2_IN, 800, 300, 1.1],
		[P.N3_IN, 800, 300, 1.1],
	]);
	const keys = {
		searchKeys: P.F_KEYS as unknown as number[],
		scan: P.F_SCAN,
		rows: P.F_ROWS_EACH as unknown as number[],
		select: P.F_SCORE,
		panel: P.F_SCORE + 2,
		tab: [P.F_SCORE + 2, P.N2_IN, P.N3_IN] as [number, number, number],
		channel: [P.R_WA, P.R_EMAIL, P.R_PHONE] as [number, number, number],
		copy: P.R_COPY,
		tool: P.P_TOOL,
		promptType: [P.P_TYPE0, P.P_TYPE1] as [number, number],
		ready: P.P_READY,
	};
	const devT = appear(f, P.TL_PASTE - 4, 20);
	const buildB = clamp01((f - P.TL_PASTE) / Math.max(30, P.SITE_END - P.TL_PASTE));
	const lw = 880;
	const sc = (lw - 2 * lw * 0.018) / SITE_DW;
	return (
		<div style={{position: 'absolute', inset: 0, opacity: o}}>
			<BrandBG f={f} gx={50} gy={45} />
			<Progress f={f} />
			{appOut < 1 && (
				<div style={{position: 'absolute', left: 80, top: 110, width: 1760, height: 680, borderRadius: 28, overflow: 'hidden', border: `1.5px solid ${C.lineStrong}`, boxShadow: '0 60px 160px rgba(0,0,0,0.7)', background: '#0a0a0c', opacity: 1 - appOut, transform: `scale(${lerp(1, 0.94, appOut)})`}}>
					<div style={{position: 'absolute', left: 880 - cam.cx, top: 340 - cam.cy, width: APP_W, height: APP_H, transform: `scale(${cam.s})`, transformOrigin: `${cam.cx}px ${cam.cy}px`}}>
						<ProspectifyApp f={f} k={keys} />
					</div>
				</div>
			)}
			{appOut > 0 && (
				<div style={{position: 'absolute', inset: 0}}>
					<div style={{position: 'absolute', left: 0, right: 0, top: 104, display: 'flex', justifyContent: 'center', gap: 16, opacity: appear(f, P.TL_IN, 12)}}>
						{BUILDERS.map((b, i) => {
							const t = appear(f, (P.TL_LOGOS as unknown as number[])[i], 10);
							return (
								<div key={b.n} style={{height: 58, padding: '0 22px', borderRadius: 18, background: C.surface2, border: `1.5px solid ${i === 0 ? C.accent : C.lineStrong}`, display: 'flex', alignItems: 'center', gap: 10, opacity: t, transform: `scale(${lerp(0.8, 1, t)})`}}>
									<Img src={staticFile(b.src)} style={{width: b.w * 1.05, height: b.h * 1.05}} />
									{!b.word && <span style={{fontFamily: GF, fontSize: 23, fontWeight: 650, color: C.text}}>{b.n}</span>}
								</div>
							);
						})}
						<div style={{height: 58, padding: '0 20px', borderRadius: 18, background: C.grad, display: 'flex', alignItems: 'center', fontFamily: GF, fontSize: 22, fontWeight: 650, color: '#fff', opacity: appear(f, P.TL_PASTE - 6, 8), transform: `scale(${f >= P.TL_PASTE && f < P.TL_PASTE + 6 ? 0.92 : 1})`}}>⌘V Paste prompt</div>
					</div>
					<div style={{position: 'absolute', left: 250, top: 196, opacity: devT, transform: `translateY(${(1 - devT) * 60}px)`}}>
						<Laptop w={lw} rotY={7} rotX={4} glare={lerp(0.1, 0.9, (f - P.TL_PASTE) / 160)}>
							<Chrome url="bellaforno.com" h={34}>
								<div style={{transform: `scale(${sc})`, transformOrigin: '0 0'}}>
									<PremiumSite b={buildB} f={f - P.TL_PASTE} scroll={lerp(0, 600, ramp(f, P.TL_PASTE + 70, 80, EASE.SOFT))} />
								</div>
							</Chrome>
						</Laptop>
					</div>
					<div style={{position: 'absolute', left: 1250, top: 176, opacity: devT, transform: `translateY(${(1 - appear(f, P.TL_PASTE + 4, 22)) * 90}px)`}}>
						<Phone w={290} rotY={-14} rotX={4} rotZ={2} time="11:52">
							<div style={{position: 'absolute', inset: 0, overflow: 'hidden'}}>
								<MobileSite b={clamp01((f - P.TL_PASTE - 6) / Math.max(30, P.SITE_END - P.TL_PASTE))} f={f - P.TL_PASTE} scroll={lerp(0, 220, ramp(f, P.TL_PASTE + 70, 60, EASE.SOFT))} />
							</div>
						</Phone>
					</div>
				</div>
			)}
		</div>
	);
};

/* ───────────────────────── CTA ───────────────────────── */
export const CTA: React.FC<{f: number}> = ({f}) => {
	if (f < P.CTA_IN - 4 || f > P.LP_PIZ + 16) return null;
	const t = appear(f, P.CTA_IN, 14);
	const out = gone(f, P.LP_PIZ - 10, 16);
	return (
		<div style={{position: 'absolute', inset: 0, opacity: t * (1 - out)}}>
			<BrandBG f={f} glow={1.2} gy={50} />
			<div style={{position: 'absolute', left: 0, right: 0, top: 150, display: 'flex', flexDirection: 'column', alignItems: 'center', transform: `scale(${lerp(0.94, 1, t) * lerp(1, 0.85, out)})`, filter: out > 0 ? `blur(${out * 12}px)` : undefined}}>
				<div style={{display: 'flex', alignItems: 'center', gap: 22}}>
					<Logo size={84} />
					<div style={{fontFamily: GF, fontSize: 90, fontWeight: 650, letterSpacing: '-0.05em', color: C.text}}>Prospectify</div>
				</div>
				<div style={{marginTop: 60, width: 640}}>
					<Pill h={120} fs={50} sheen={clamp01((f - P.CTA_IN - 10) / 40)} style={{width: '100%'}}>
						Get 10 free leads
					</Pill>
				</div>
				<div style={{marginTop: 34, display: 'flex', gap: 14, opacity: appear(f, P.CTA_NOCARD, 10)}}>
					{['No card required', 'Any country', 'Cancel anytime'].map((x) => (
						<div key={x} style={{height: 56, padding: '0 22px', borderRadius: 16, background: C.surface2, border: `1.5px solid ${C.lineStrong}`, display: 'flex', alignItems: 'center', gap: 10, fontFamily: GF, fontSize: 25, fontWeight: 600, color: C.text}}>
							<Icon n="check" size={22} color={C.accent} sw={2.8} />
							{x}
						</div>
					))}
				</div>
				<div style={{marginTop: 28, fontFamily: GF, fontSize: 36, fontWeight: 650, color: C.text}}>prospectify.net</div>
			</div>
		</div>
	);
};

export const unusedLoop = [COLD];
