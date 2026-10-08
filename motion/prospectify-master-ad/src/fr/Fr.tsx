import React from 'react';
import {AbsoluteFill, Audio, Img, staticFile, useCurrentFrame} from 'remotion';
import {C, EASE, clamp01, lerp, loadFinalFonts, ramp} from '../final/tokens';
import {Grain} from '../fx/camera';
import {Logo} from '../final/kit/ui';
import {Icon, Star} from '../final/kit/icons';
import {MapView, Photo, photo} from '../final/kit/media';
import {GF, loadGeist} from '../versus/fx';
import {Chrome, Phone} from '../versus/devices';
import {MobileSite} from '../versus/site';
import {APP_H, APP_W, MESSAGES, PROMPT, Pill, ProspectifyApp} from '../versus/app';
import TL from './timeline.json';

loadFinalFonts();
loadGeist();

/**
 * PROSPECTIFY — publicité française (1080×1920, 30 fps, ~44,7 s). Voix : ElevenLabs (femme, FR,
 * chuchotement réel). Arc visuel : CHAOS → CONTRÔLE → CLARTÉ → OPPORTUNITÉ → ACTION.
 * Contrat de mise en page : zone visuelle y 150…1330 · bande de sous-titres y 1390…1650.
 * Les sous-titres ne passent jamais par-dessus un visuel.
 */
const P = TL as unknown as Record<string, number & number[]> & {CAPS: {words: {w: string; a: number; b: number; accent: boolean}[]; a: number; b: number}[]; durationInFrames: number};
const VW = 1080;
const BG = '#050505';
const PANEL = 'rgba(18,18,24,0.86)';

/* ── fond : blooms de couleur qui dérivent sur du noir ── */
const Mesh: React.FC<{f: number; heat?: number}> = ({f, heat = 1}) => {
	const b = (i: number, x: number, y: number, r: number, col: string, sp: number) => ({
		position: 'absolute' as const,
		left: `${x + Math.sin(f / sp + i) * 5}%`,
		top: `${y + Math.cos(f / (sp * 1.3) + i) * 4}%`,
		width: `${r}%`,
		height: `${r * 0.62}%`,
		marginLeft: `${-r / 2}%`,
		borderRadius: '50%',
		background: col,
		filter: `blur(${110 + 18 * Math.sin(f / 70 + i)}px)`,
		opacity: heat,
	});
	return (
		<div style={{position: 'absolute', inset: 0, background: BG, overflow: 'hidden'}}>
			<div style={b(0, 24, 20, 95, 'rgba(244,37,98,0.40)', 95)} />
			<div style={b(1, 78, 34, 85, 'rgba(255,90,69,0.32)', 120)} />
			<div style={b(2, 50, 74, 100, 'rgba(244,37,98,0.22)', 140)} />
			<div style={b(3, 14, 62, 70, 'rgba(255,59,95,0.24)', 110)} />
			<div style={{position: 'absolute', inset: 0, background: 'radial-gradient(120% 70% at 50% 42%, rgba(0,0,0,0) 28%, rgba(5,5,5,0.86) 100%)'}} />
		</div>
	);
};

/* ── sous-titres mot à mot, dans leur propre bande ── */
const Captions: React.FC<{f: number}> = ({f}) => {
	if (f >= P.OUT1 - 8 && f < P.CTA_IN - 6) return null; // l'outro porte son texte en grand
	const cap = P.CAPS.find((c) => f >= c.a && f <= c.b);
	if (!cap) return null;
	const out = ramp(f, cap.b - 4, 4, EASE.EXIT);
	const wh = f >= P.WH_IN - 6 && f < P.WH_OUT;
	return (
		<div style={{position: 'absolute', left: 60, right: 60, top: 1390, height: 260, display: 'flex', flexWrap: 'wrap', alignItems: 'center', alignContent: 'center', justifyContent: 'center', columnGap: wh ? 20 : 24, fontFamily: GF, opacity: 1 - out}}>
			{cap.words.map((w, i) => {
				const t = ramp(f, w.a, 5, EASE.FAST_LOCK);
				return (
					<span key={i} style={{display: 'inline-block', fontSize: wh ? 64 : 86, fontWeight: wh ? 500 : 700, letterSpacing: wh ? '0.04em' : '-0.035em', lineHeight: 1.12, color: w.accent ? C.accentBright : '#F4F4F6', transform: `translateY(${(1 - t) * 14}px) scale(${0.9 + 0.1 * t})`, opacity: (f < w.a ? 0 : clamp01(t * 1.7)) * (wh ? 0.72 : 1), textShadow: '0 8px 40px rgba(0,0,0,0.75)'}}>
						{w.w}
					</span>
				);
			})}
		</div>
	);
};

/* ── 1 · l'accroche : le site existe, l'acheteur manque ── */
const Hook: React.FC<{f: number}> = ({f}) => {
	const inT = ramp(f, 0, 10, EASE.FAST_LOCK);
	const out = ramp(f, P.WH_IN - 10, 10, EASE.EXIT);
	if (out >= 1) return null;
	const shift = ramp(f, P.HOOK_B, 20, EASE.SOFT);
	const ask = ramp(f, P.HOOK_B + 6, 18, EASE.FAST_LOCK);
	const shake = f >= P.HOOK_C && f < P.HOOK_C + 26 ? Math.sin((f - P.HOOK_C) * 1.5) * (1 - (f - P.HOOK_C) / 26) * 7 : 0;
	return (
		<div style={{position: 'absolute', inset: 0, opacity: inT * (1 - out)}}>
			<div style={{position: 'absolute', left: lerp(300, 86, shift), top: 300, transform: `scale(${lerp(1.1, 1, inT) * lerp(1, 0.9, shift)}) rotate(${lerp(0, -4, shift)}deg)`}}>
				<Phone w={500} rotY={lerp(0, -10, shift)} rotX={3} time="23:41" glare={0.5}>
					<div style={{position: 'absolute', inset: 0, overflow: 'hidden'}}>
						<div style={{width: 390, transform: `scale(${(500 * 0.912) / 390})`, transformOrigin: '0 0'}}>
							<MobileSite b={1} f={f} scroll={lerp(0, 120, ramp(f, 0, 160, EASE.LINEAR))} />
						</div>
					</div>
				</Phone>
			</div>
			{ask > 0 && (
				<div style={{position: 'absolute', right: 70, top: 380, width: 400, display: 'flex', flexDirection: 'column', gap: 26, opacity: ask, transform: `translateX(${(1 - ask) * 60}px) rotate(${shake * 0.3}deg)`}}>
					{[0, 1, 2, 3].map((i) => {
						const t = ramp(f, P.HOOK_B + 6 + i * 5, 14, EASE.FAST_LOCK);
						const dead = ramp(f, P.HOOK_C, 16, EASE.SOFT);
						return (
							<div key={i} style={{height: 150, borderRadius: 30, background: PANEL, border: `1.5px solid ${dead > 0.3 ? `rgba(${C.accentRGB},0.5)` : 'rgba(255,255,255,0.12)'}`, backdropFilter: 'blur(24px)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 18, opacity: t, transform: `translateY(${(1 - t) * 30}px) translateX(${shake * (i % 2 ? 1 : -1)}px)`}}>
								<div style={{width: 74, height: 74, borderRadius: 22, background: 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
									<Icon n="user" size={38} color="rgba(255,255,255,0.3)" sw={2} />
								</div>
								<div style={{fontFamily: GF, fontSize: 72, fontWeight: 700, color: dead > 0.3 ? C.accentBright : 'rgba(255,255,255,0.22)'}}>?</div>
							</div>
						);
					})}
				</div>
			)}
		</div>
	);
};

/* ── 2 · le chuchotement : tout se referme ── */
const Whisper: React.FC<{f: number}> = ({f}) => {
	const t = ramp(f, P.WH_IN - 8, 14, EASE.SOFT);
	const out = ramp(f, P.WH_OUT - 10, 10, EASE.EXIT);
	if (f < P.WH_IN - 10 || out >= 1) return null;
	const o = t * (1 - out);
	const br = 0.5 + 0.5 * Math.sin((f - P.WH_IN) / 9);
	return (
		<div style={{position: 'absolute', inset: 0, opacity: o}}>
			<div style={{position: 'absolute', inset: 0, background: `radial-gradient(70% 42% at 50% 46%, rgba(0,0,0,0) 0%, rgba(0,0,0,0.93) 70%)`}} />
			<div style={{position: 'absolute', left: 0, right: 0, top: 700, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 46}}>
				<div style={{display: 'flex', gap: 16, alignItems: 'center'}}>
					{[0, 1, 2, 3, 4, 5, 6].map((i) => (
						<div key={i} style={{width: 10, height: lerp(14, 74, Math.abs(Math.sin((f - P.WH_IN) / 7 + i * 0.8))) * lerp(0.5, 1, br), borderRadius: 6, background: C.accentBright, opacity: 0.42 + 0.3 * br}} />
					))}
				</div>
				<div style={{width: lerp(120, 560, t), height: 2, background: `linear-gradient(90deg, rgba(244,37,98,0) 0%, rgba(${C.accentRGB},0.8) 50%, rgba(244,37,98,0) 100%)`}} />
			</div>
		</div>
	);
};

/* ── 3 · le chaos : six fragments réels qui s'empilent, puis × chaque entreprise ── */
const Frag: React.FC<{i: number; f: number; children: React.ReactNode; w: number; h: number; x: number; y: number; rot: number}> = ({i, f, children, w, h, x, y, rot}) => {
	const t = ramp(f, P.CHAOS[i], 9, EASE.FAST_LOCK);
	if (t <= 0) return null;
	return (
		<div style={{position: 'absolute', left: x, top: y, width: w, height: h, borderRadius: 28, overflow: 'hidden', background: '#121218', border: '1.5px solid rgba(255,255,255,0.13)', boxShadow: '0 40px 110px rgba(0,0,0,0.75)', transform: `rotate(${rot}deg) scale(${lerp(1.16, 1, t)}) translateY(${(1 - t) * 46}px)`, opacity: clamp01(t * 1.5), zIndex: 10 + i}}>
			{children}
		</div>
	);
};

const FragLabel: React.FC<{s: string}> = ({s}) => (
	<div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: 72, background: 'linear-gradient(0deg, rgba(5,5,5,0.95), rgba(5,5,5,0))', display: 'flex', alignItems: 'flex-end', padding: '0 24px 16px', fontFamily: GF, fontSize: 30, fontWeight: 650, color: '#F4F4F6', letterSpacing: '-0.02em'}}>{s}</div>
);

const Chaos: React.FC<{f: number}> = ({f}) => {
	const out = ramp(f, P.BARS - 12, 12, EASE.EXIT);
	if (f < P.CHAOS[0] - 2 || out >= 1) return null;
	const rep = ramp(f, P.REPEAT, 26, EASE.SOFT);
	const pile = (
		<>
			<Frag i={0} f={f} w={600} h={420} x={60} y={150} rot={-3}>
				<MapView w={600} h={420} cx={980} cy={1180} zoom={1.15}>
					{[[300, 240], [430, 330], [220, 420], [520, 500], [360, 560]].map(([mx, my], k) => (
						<div key={k} style={{position: 'absolute', left: mx, top: my, width: 44, height: 44, marginLeft: -22, marginTop: -44, borderRadius: '50% 50% 50% 0', background: C.accent, transform: 'rotate(-45deg)', boxShadow: '0 8px 22px rgba(0,0,0,0.4)'}} />
					))}
				</MapView>
				<FragLabel s="Google Maps" />
			</Frag>
			<Frag i={1} f={f} w={470} h={330} x={560} y={380} rot={4}>
				<div style={{padding: '26px 28px', fontFamily: GF}}>
					{[['4,8', '312'], ['4,6', '184'], ['4,9', '96']].map(([r, n], k) => (
						<div key={k} style={{display: 'flex', alignItems: 'center', gap: 12, padding: '16px 0', borderBottom: '1px solid rgba(255,255,255,0.08)'}}>
							{[0, 1, 2, 3, 4].map((s) => <Star key={s} size={26} />)}
							<span style={{fontSize: 30, fontWeight: 650, color: '#F4F4F6', marginLeft: 6}}>{r}</span>
							<span style={{fontSize: 24, color: 'rgba(255,255,255,0.45)'}}>· {n} avis</span>
						</div>
					))}
				</div>
				<FragLabel s="Les avis" />
			</Frag>
			<Frag i={2} f={f} w={560} h={400} x={80} y={560} rot={-5}>
				<Chrome url="pizzeria-roma.fr" h={44}>
					<div style={{flex: 1, position: 'relative', overflow: 'hidden', background: '#fff'}}>
						<Photo n="pasta_5" w={560} h={360} />
						<div style={{position: 'absolute', left: 24, bottom: 24, fontFamily: 'Arial, sans-serif', fontSize: 34, fontWeight: 700, color: '#fff', textShadow: '0 4px 20px rgba(0,0,0,0.6)'}}>Trattoria</div>
					</div>
				</Chrome>
				<FragLabel s="Les sites" />
			</Frag>
			<Frag i={3} f={f} w={430} h={430} x={580} y={740} rot={3}>
				<div style={{display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 4, padding: 4}}>
					{['pizza_4', 'oven_2', 'tiramisu_5', 'wine_0', 'chef_2', 'pasta_1', 'bar_4', 'salad_1', 'cafe_0'].map((n) => (
						<Photo key={n} n={n} w={138} h={138} />
					))}
				</div>
				<FragLabel s="Instagram" />
			</Frag>
			<Frag i={4} f={f} w={520} h={300} x={70} y={930} rot={-2}>
				<div style={{padding: '24px 28px', fontFamily: GF}}>
					{[['Téléphone', '+33 1 48 •• •• ••'], ['E-mail', 'contact@•••.fr'], ['Contact', 'Responsable ?']].map(([k, v]) => (
						<div key={k} style={{display: 'flex', alignItems: 'center', gap: 16, padding: '18px 0'}}>
							<Icon n={k === 'Téléphone' ? 'phone' : k === 'E-mail' ? 'mail' : 'user'} size={28} color={C.accentBright} sw={2} />
							<span style={{fontSize: 25, color: 'rgba(255,255,255,0.5)', width: 160}}>{k}</span>
							<span style={{fontSize: 27, fontWeight: 600, color: '#F4F4F6'}}>{v}</span>
						</div>
					))}
				</div>
				<FragLabel s="Les contacts" />
			</Frag>
			<Frag i={5} f={f} w={500} h={290} x={520} y={1030} rot={5}>
				<div style={{padding: '26px 26px 0', fontFamily: GF, display: 'flex', flexDirection: 'column', gap: 14}}>
					<div style={{alignSelf: 'flex-end', maxWidth: 380, padding: '16px 22px', borderRadius: '22px 22px 6px 22px', background: C.grad, fontSize: 25, color: '#fff'}}>Bonjour, je…</div>
					<div style={{alignSelf: 'flex-start', width: 230, height: 54, borderRadius: '22px 22px 22px 6px', background: 'rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', padding: '0 22px', gap: 10}}>
						{[0, 1, 2].map((d) => (
							<div key={d} style={{width: 12, height: 12, borderRadius: 6, background: 'rgba(255,255,255,0.35)', opacity: 0.4 + 0.6 * Math.abs(Math.sin(f / 9 + d))}} />
						))}
					</div>
				</div>
				<FragLabel s="Les messages" />
			</Frag>
		</>
	);
	return (
		<div style={{position: 'absolute', inset: 0, opacity: 1 - out}}>
			{/* au mot « recommences », la pile se démultiplie */}
			{rep > 0.02 ? (
				<div style={{position: 'absolute', inset: 0}}>
					{[0, 1, 2, 3, 4, 5].map((k) => {
						const t = ramp(f, P.REPEAT + k * 3, 14, EASE.FAST_LOCK);
						const col = k % 3;
						const row = Math.floor(k / 3);
						return (
							<div key={k} style={{position: 'absolute', left: 0, top: 0, width: VW, height: 1920, transform: `scale(${lerp(1, 0.33, rep)}) translate(${lerp(0, (col - 1) * 1060, rep)}px, ${lerp(0, (row - 0.5) * 1520, rep)}px)`, transformOrigin: '540px 760px', opacity: k === 0 ? 1 : t * rep, filter: k === 0 ? undefined : 'saturate(0.8)'}}>
								{pile}
							</div>
						);
					})}
					<div style={{position: 'absolute', inset: 0, background: 'radial-gradient(90% 55% at 50% 44%, rgba(0,0,0,0) 20%, rgba(5,5,5,0.78) 100%)', opacity: rep}} />
				</div>
			) : (
				pile
			)}
		</div>
	);
};

/* ── « tu passes plus de temps à chercher qu'à construire » ── */
const Bars: React.FC<{f: number}> = ({f}) => {
	const t = ramp(f, P.BARS - 6, 16, EASE.FAST_LOCK);
	const out = ramp(f, P.DECLIC - 10, 12, EASE.EXIT);
	if (f < P.BARS - 8 || out >= 1) return null;
	const rows: [string, number, number, string][] = [
		['CHERCHER', 0.86, P.BARS, C.accentBright],
		['CONSTRUIRE', 0.14, P.BARS + 26, 'rgba(255,255,255,0.3)'],
	];
	return (
		<div style={{position: 'absolute', left: 90, right: 90, top: 520, opacity: t * (1 - out), transform: `translateY(${(1 - t) * 40}px) scale(${lerp(1, 0.96, out)})`}}>
			{rows.map(([label, frac, at, col], i) => {
				const g = ramp(f, at, 30, EASE.SOFT);
				return (
					<div key={i} style={{marginBottom: 66, fontFamily: GF}}>
						<div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 20}}>
							<span style={{fontSize: 52, fontWeight: 700, letterSpacing: '-0.03em', color: i === 0 ? '#F4F4F6' : 'rgba(255,255,255,0.45)'}}>{label}</span>
							<span style={{fontSize: 44, fontWeight: 700, color: col}}>{Math.round(frac * 100 * g)}%</span>
						</div>
						<div style={{height: 54, borderRadius: 27, background: 'rgba(255,255,255,0.06)', overflow: 'hidden'}}>
							<div style={{width: `${frac * 100 * g}%`, height: '100%', borderRadius: 27, background: i === 0 ? C.grad : 'rgba(255,255,255,0.22)', boxShadow: i === 0 ? `0 0 50px rgba(${C.accentRGB},0.5)` : undefined}} />
						</div>
					</div>
				);
			})}
		</div>
	);
};

/* ── 4 · le déclic : la marque atterrit ── */
const Declic: React.FC<{f: number}> = ({f}) => {
	const t = ramp(f, P.DECLIC, 14, EASE.FAST_LOCK);
	const out = ramp(f, P.PR_IN - 16, 14, EASE.EXIT);
	if (f < P.DECLIC || out >= 1) return null;
	const b = EASE.OVERSHOOT(ramp(f, P.BRAND, 16));
	const hit = f >= P.BRAND && f < P.BRAND + 10 ? 1 - (f - P.BRAND) / 10 : 0;
	return (
		<div style={{position: 'absolute', inset: 0, opacity: t * (1 - out)}}>
			<div style={{position: 'absolute', left: 0, right: 0, top: 640, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 34, transform: `scale(${lerp(0.8, 1, b) * lerp(1, 1.1, out)})`}}>
				<div style={{position: 'relative'}}>
					<Logo size={210} />
					{hit > 0 && (
						<div style={{position: 'absolute', inset: -40, borderRadius: '50%', border: `4px solid rgba(${C.accentRGB},${hit * 0.8})`, transform: `scale(${1 + (1 - hit) * 1.4})`}} />
					)}
				</div>
				<div style={{fontFamily: GF, fontSize: 118, fontWeight: 650, letterSpacing: '-0.05em', color: '#F4F4F6', opacity: b}}>Prospectify</div>
			</div>
		</div>
	);
};

/* ── 5 + 6 · le produit réel, filmé à la caméra ── */
type Cam = [number, number, number, number];
const camAt = (f: number, keys: Cam[]) => {
	let i = 0;
	while (i < keys.length - 1 && f >= keys[i + 1][0]) i++;
	const a = keys[i];
	const b = keys[Math.min(i + 1, keys.length - 1)];
	const t = b[0] === a[0] ? 1 : EASE.CAMERA(clamp01((f - a[0]) / Math.min(26, b[0] - a[0])));
	return {cx: lerp(a[1], b[1], t), cy: lerp(a[2], b[2], t), s: lerp(a[3], b[3], t)};
};

const AppShot: React.FC<{f: number}> = ({f}) => {
	const inT = ramp(f, P.PR_IN - 14, 16, EASE.FAST_LOCK);
	const out = ramp(f, P.PASTE - 10, 12, EASE.EXIT);
	if (f < P.PR_IN - 16 || out >= 1) return null;
	const cam = camAt(f, [
		[P.PR_IN - 14, 620, 430, 0.62],
		[P.PR_IN + 16, 560, 430, 0.95],
		[P.SCORE, 700, 430, 1.2],
		[P.MSG_IN, 1310, 430, 1.5],
		[P.SEND, 1310, 470, 1.5],
		[P.PROMPT_IN, 1310, 430, 1.45],
	]);
	const keys = {
		searchKeys: [P.PR_IN - 14, P.PR_IN - 11, P.PR_IN - 8, P.PR_IN - 5, P.PR_IN - 3, P.PR_IN - 1],
		scan: P.PR_IN + 2,
		rows: [P.PR_IN + 10, P.PR_IN + 14, P.PR_IN + 18, P.PR_IN + 22, P.PR_IN + 26, P.PR_IN + 30],
		select: P.SCORE - 8,
		panel: P.SCORE - 2,
		tab: [P.SCORE - 2, P.MSG_IN - 6, P.PROMPT_IN - 26] as [number, number, number],
		channel: [P.SEND - 4, 1e9, 1e9] as [number, number, number],
		copy: P.PASTE - 14,
		tool: P.PROMPT_IN - 18,
		promptType: [P.PROMPT_IN - 22, P.PASTE - 16] as [number, number],
		ready: P.PASTE - 12,
	};
	return (
		<div style={{position: 'absolute', left: 50, top: 250, width: 980, height: 1060, borderRadius: 38, overflow: 'hidden', border: '1.5px solid rgba(255,255,255,0.14)', boxShadow: '0 60px 160px rgba(0,0,0,0.75)', background: '#0a0a0c', opacity: inT * (1 - out), transform: `scale(${lerp(0.94, 1, inT) * lerp(1, 0.93, out)}) translateY(${out * -30}px)`, filter: out > 0 ? `blur(${out * 14}px)` : undefined}}>
			<div style={{position: 'absolute', left: 490 - cam.cx, top: 530 - cam.cy, width: APP_W, height: APP_H, transform: `scale(${cam.s})`, transformOrigin: `${cam.cx}px ${cam.cy}px`}}>
				<ProspectifyApp f={f} k={keys} />
			</div>
		</div>
	);
};

/* ── 6 bis · le prompt collé dans Lovable → le site sort sur le téléphone ── */
const Build: React.FC<{f: number}> = ({f}) => {
	const inT = ramp(f, P.PASTE - 8, 14, EASE.FAST_LOCK);
	const out = ramp(f, P.CTA_IN - 14, 12, EASE.EXIT);
	if (f < P.PASTE - 10 || out >= 1) return null;
	const b = clamp01((f - P.PASTE) / 70);
	const small = ramp(f, P.OUT1 - 6, 20, EASE.SOFT); // laisse la place au texte de l'outro
	return (
		<div style={{position: 'absolute', inset: 0, opacity: inT * (1 - out)}}>
			<div style={{position: 'absolute', left: 0, right: 0, top: lerp(210, 120, small), display: 'flex', justifyContent: 'center', gap: 14, opacity: ramp(f, P.PASTE - 6, 10) * (1 - small * 0.85)}}>
				<div style={{height: 78, padding: '0 28px', borderRadius: 22, background: 'rgba(22,22,26,0.9)', border: `1.5px solid rgba(${C.accentRGB},0.6)`, display: 'flex', alignItems: 'center', gap: 14, backdropFilter: 'blur(20px)'}}>
					<Img src={staticFile('final/builders/lovable-logomark-color.svg')} style={{width: 40, height: 41}} />
					<span style={{fontFamily: GF, fontSize: 32, fontWeight: 650, color: '#F4F4F6'}}>Lovable</span>
				</div>
				<div style={{height: 78, padding: '0 26px', borderRadius: 22, background: C.grad, display: 'flex', alignItems: 'center', fontFamily: GF, fontSize: 30, fontWeight: 650, color: '#fff', transform: `scale(${f >= P.PASTE && f < P.PASTE + 7 ? 0.9 : 1})`, boxShadow: `0 16px 50px rgba(${C.accentRGB},0.4)`}}>⌘V Coller</div>
			</div>
			<div style={{position: 'absolute', left: 0, right: 0, top: lerp(330, 150, small), display: 'flex', justifyContent: 'center', transform: `translateY(${(1 - ramp(f, P.PASTE + 2, 20, EASE.FAST_LOCK)) * 70}px) scale(${lerp(1, 0.66, small)})`}}>
				<Phone w={520} rotY={-6} rotX={3} time="23:52" glare={lerp(0.1, 0.9, (f - P.PASTE) / 110)}>
					<div style={{position: 'absolute', inset: 0, overflow: 'hidden'}}>
						<div style={{width: 390, transform: `scale(${(520 * 0.912) / 390})`, transformOrigin: '0 0'}}>
							<MobileSite b={b} f={f - P.PASTE} scroll={lerp(0, 230, ramp(f, P.PASTE + 40, 64, EASE.SOFT))} />
						</div>
					</div>
				</Phone>
			</div>
		</div>
	);
};

/* ── 7 a · l'outro cinétique ── */
const Outro: React.FC<{f: number}> = ({f}) => {
	const out = ramp(f, P.CTA_IN - 12, 12, EASE.EXIT);
	if (f < P.OUT1 - 4 || out >= 1) return null;
	const lines: [string, string, number][] = [
		['Moins', 'de recherche.', P.OUT1],
		['Plus', 'de prospection.', P.OUT2],
		['Plus', 'de création.', P.OUT3],
	];
	return (
		<div style={{position: 'absolute', left: 80, right: 80, top: 880, opacity: 1 - out}}>
			{lines.map(([a, b, at], i) => {
				const t = ramp(f, at, 10, EASE.FAST_LOCK);
				return (
					<div key={i} style={{fontFamily: GF, fontSize: 104, fontWeight: 700, letterSpacing: '-0.045em', lineHeight: 1.1, marginBottom: 22, opacity: clamp01(t * 1.6) * lerp(0.42, 1, t), transform: `translateX(${(1 - t) * 40}px)`}}>
						<span style={{color: C.accentBright}}>{a} </span>
						<span style={{color: '#F4F4F6'}}>{b}</span>
					</div>
				);
			})}
		</div>
	);
};

/* ── 7 b · l'offre ── */
const CTA: React.FC<{f: number}> = ({f}) => {
	const t = ramp(f, P.CTA_IN - 8, 16, EASE.FAST_LOCK);
	if (f < P.CTA_IN - 10) return null;
	return (
		<div style={{position: 'absolute', inset: 0, opacity: t}}>
			<div style={{position: 'absolute', left: 0, right: 0, top: 440, display: 'flex', flexDirection: 'column', alignItems: 'center', transform: `scale(${lerp(0.9, 1, t) * lerp(1, 1.03, ramp(f, P.CTA_IN, 140, EASE.SOFT))})`}}>
				<Logo size={176} />
				<div style={{marginTop: 30, fontFamily: GF, fontSize: 112, fontWeight: 650, letterSpacing: '-0.05em', color: '#F4F4F6'}}>Prospectify</div>
				<div style={{marginTop: 24, fontFamily: GF, fontSize: 40, fontWeight: 600, color: 'rgba(244,244,246,0.6)', letterSpacing: '-0.01em', textAlign: 'center'}}>
					Tu construis le site. Prospectify trouve le client.
				</div>
				<div style={{marginTop: 58, width: 860, transform: `scale(${1 - 0.04 * Math.sin(Math.PI * clamp01((f - P.CTA_FREE) / 12))})`}}>
					<Pill h={150} fs={58} sheen={clamp01((f - P.CTA_IN) / 40)} style={{width: '100%', boxShadow: `0 24px 80px rgba(${C.accentRGB},0.45)`}}>
						10 prospects gratuits
					</Pill>
				</div>
				<div style={{marginTop: 34, display: 'flex', gap: 14, opacity: ramp(f, P.CTA_CARD - 6, 12)}}>
					{['Sans carte bancaire', 'Résiliable à tout moment'].map((x) => (
						<div key={x} style={{height: 70, padding: '0 26px', borderRadius: 20, background: 'rgba(255,255,255,0.07)', border: '1.5px solid rgba(255,255,255,0.14)', display: 'flex', alignItems: 'center', gap: 10, fontFamily: GF, fontSize: 30, fontWeight: 600, color: '#F4F4F6', backdropFilter: 'blur(16px)'}}>
							<Icon n="check" size={24} color={C.accentBright} sw={2.8} />
							{x}
						</div>
					))}
				</div>
				<div style={{marginTop: 36, fontFamily: GF, fontSize: 46, fontWeight: 650, color: 'rgba(244,244,246,0.9)'}}>prospectify.net</div>
			</div>
		</div>
	);
};

export const Fr: React.FC<{withAudio: boolean}> = ({withAudio}) => {
	const f = useCurrentFrame();
	const heat = lerp(0.8, 1.15, ramp(f, P.DECLIC, 60, EASE.SOFT)) * lerp(1, 0.4, ramp(f, P.WH_IN - 8, 14, EASE.SOFT)) * lerp(0.4, 1, ramp(f, P.WH_OUT - 10, 14, EASE.SOFT));
	return (
		<AbsoluteFill style={{background: BG, overflow: 'hidden'}}>
			<Mesh f={f} heat={heat} />
			<Hook f={f} />
			<Chaos f={f} />
			<Bars f={f} />
			<Declic f={f} />
			<AppShot f={f} />
			<Build f={f} />
			<Outro f={f} />
			<CTA f={f} />
			<Whisper f={f} />
			<Captions f={f} />
			<Grain f={f} opacity={0.035} />
			{withAudio && <Audio src={staticFile('fr/audio/fr-mix.wav')} />}
		</AbsoluteFill>
	);
};

export const FR_DURATION = P.durationInFrames;
export const unusedFr = [MESSAGES, PROMPT, photo];
