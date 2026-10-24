import React from 'react';
import {useVideoConfig} from 'remotion';
import {IN_OUT, clamp01, lerp, ramp, settle} from '../animations/ease';
import {Check, Logo} from '../components/Basics';
import {CursorAnimation} from '../components/CursorAnimation';
import {LeadCard} from '../components/LeadCard';
import {SearchInterface, SearchKeys, WIN, cardRect} from '../components/SearchInterface';
import {HookSite, WebsiteMockup} from '../components/WebsiteMockup';
import {LEADS} from '../data/leads';
import {C, FONT, TL} from '../styles/tokens';

const P = TL;
/** Début du morphing carte → navigateur : juste avant « démo ». */
export const MORPH = P.DEMO - 8;
const DEMO_RECT = {x: 110, y: 500, w: 860, h: 580};

export const searchKeys: SearchKeys = {
	city: P.VILLE,
	category: P.COMMERCE,
	click: P.RECHERCHE,
	results: P.RESULTS,
	status: P.SANS,
	score: P.SCORE,
	select: P.JEPEUX,
	hideFirst: MORPH,
};

/* ── SCÈNE 1 · HOOK — le site est fait, le compteur de clients est à zéro ── */
export const HookScene: React.FC<{f: number}> = ({f}) => {
	const {fps} = useVideoConfig();
	const out = ramp(f, P.PROB - 1, 7);
	if (out >= 1) return null;
	const zoom = 1 + 0.04 * ramp(f, 25, 30, IN_OUT);
	const z = ramp(f, P.ZERO, 8);
	const s = settle(f, P.ZERO, fps);
	return (
		<div style={{position: 'absolute', inset: 0, opacity: 1 - out}}>
			<div style={{position: 'absolute', left: 140, top: 520, width: 800, height: 540, borderRadius: 30, overflow: 'hidden', border: `1.5px solid ${C.lineStrong}`, boxShadow: '0 60px 140px rgba(0,0,0,0.7)', transform: `scale(${zoom * lerp(1, 0.92, z)})`, opacity: lerp(1, 0.32, z), filter: z > 0 ? `blur(${z * 3}px)` : undefined}}>
				<HookSite w={800} h={540} />
			</div>
			{z > 0 && (
				<div style={{position: 'absolute', left: 260, top: 610, width: 560, height: 360, borderRadius: 40, background: 'rgba(18,18,24,0.92)', border: `1.5px solid rgba(${C.accentRGB},0.55)`, boxShadow: `0 40px 120px rgba(0,0,0,0.7), 0 0 80px rgba(${C.accentRGB},0.18)`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: FONT, opacity: z, transform: `scale(${lerp(1.1, 1, s)})`}}>
					<div style={{fontSize: 34, fontWeight: 700, letterSpacing: '0.2em', color: C.grey}}>CLIENTS</div>
					<div style={{marginTop: 6, fontSize: 210, fontWeight: 850, lineHeight: 1, letterSpacing: '-0.06em', background: C.grad, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent'}}>0</div>
				</div>
			)}
		</div>
	);
};

/* ── SCÈNE 2 · LE DÉCLIC — le site glisse à gauche, à droite la place vide des clients ── */
export const ProblemScene: React.FC<{f: number}> = ({f}) => {
	const {fps} = useVideoConfig();
	const inT = ramp(f, P.PROB - 2, 8);
	const out = ramp(f, P.REGARDE - 2, 7);
	if (f < P.PROB - 3 || out >= 1) return null;
	const slot = ramp(f, P.PROB + 4, 8);
	const hot = ramp(f, P.TROUVER, 8);
	const s = settle(f, P.TROUVER, fps, 14);
	return (
		<div style={{position: 'absolute', inset: 0, opacity: inT * (1 - out), transform: `scale(${lerp(1, 0.96, out)})`, fontFamily: FONT}}>
			<div style={{position: 'absolute', left: 70, top: 600, width: 440, height: 340, borderRadius: 26, overflow: 'hidden', border: `1.5px solid ${C.lineStrong}`, boxShadow: '0 40px 100px rgba(0,0,0,0.6)', transform: `translateX(${(1 - inT) * 240}px) scale(${lerp(1.5, 1, inT)})`, transformOrigin: 'left top'}}>
				<div style={{width: 800, height: 540, transform: `scale(${440 / 800})`, transformOrigin: '0 0'}}>
					<HookSite w={800} h={540} />
				</div>
			</div>
			<div style={{position: 'absolute', left: 90, top: 960, height: 52, padding: '0 20px', borderRadius: 14, background: 'rgba(255,255,255,0.07)', border: `1px solid ${C.line}`, display: 'flex', alignItems: 'center', gap: 10, fontSize: 24, fontWeight: 650, color: C.white, opacity: ramp(f, P.PROB + 6, 7)}}>
				<div style={{width: 30, height: 30, borderRadius: 15, background: 'rgba(255,255,255,0.14)', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
					<Check size={18} />
				</div>
				Site en ligne
			</div>
			<div style={{position: 'absolute', left: 570, top: 600, width: 440, height: 340, borderRadius: 26, border: `2px dashed ${hot > 0 ? `rgba(${C.accentRGB},${0.4 + 0.5 * hot})` : 'rgba(255,255,255,0.22)'}`, background: `rgba(${C.accentRGB},${0.05 * hot})`, boxShadow: hot > 0 ? `0 0 ${70 * hot}px rgba(${C.accentRGB},${0.22 * hot})` : undefined, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 26, opacity: slot, transform: `translateY(${(1 - slot) * 20}px) scale(${lerp(1, 1.03, hot) * lerp(0.97, 1, s)})`}}>
				<div style={{display: 'flex', gap: 18}}>
					{[0, 1, 2].map((i) => (
						<div key={i} style={{width: 78, height: 78, borderRadius: 39, border: '2px dashed rgba(255,255,255,0.28)'}} />
					))}
				</div>
				<div style={{fontSize: 34, fontWeight: 750, letterSpacing: '0.18em', color: hot > 0.5 ? C.accentBright : C.grey}}>CLIENTS</div>
			</div>
		</div>
	);
};

/* ── SCÈNES 3 · 4 · 5 · RECHERCHE → RÉSULTATS → FOCUS ── */
export const SearchAnimation: React.FC<{f: number}> = ({f}) => {
	const inT = ramp(f, P.REGARDE - 2, 9);
	const out = ramp(f, MORPH, 10);
	if (f < P.REGARDE - 3 || out >= 1) return null;
	const cur = {
		keys: [
			[P.REGARDE + 12, 900, 1160],
			[P.VILLE - 3, 430, 754],
			[P.COMMERCE - 4, 450, 890],
			[P.RECHERCHE - 4, 570, 1002],
			[P.RESULTS + 6, 640, 1050],
		] as [number, number, number][],
		clicks: [P.VILLE, P.COMMERCE, P.RECHERCHE],
	};
	return (
		<>
			<div style={{position: 'absolute', left: WIN.x, top: WIN.y, opacity: inT * (1 - out), transform: `translateY(${(1 - inT) * 140}px) scale(${lerp(0.96, 1, inT)})`}}>
				<SearchInterface f={f} k={searchKeys} />
			</div>
			<CursorAnimation f={f} keys={cur.keys} clicks={cur.clicks} show={[P.REGARDE + 12, P.RESULTS + 6]} />
		</>
	);
};

/* ── SCÈNE 6 · PROJECTION — la carte A devient une fenêtre de navigateur ── */
export const DemoScene: React.FC<{f: number}> = ({f}) => {
	if (f < MORPH || f > P.TROUVE + 10) return null;
	const m = ramp(f, MORPH, 15, IN_OUT);
	const a = cardRect(0);
	const r = {x: lerp(a.x, DEMO_RECT.x, m), y: lerp(a.y, DEMO_RECT.y, m), w: lerp(a.w, DEMO_RECT.w, m), h: lerp(a.h, DEMO_RECT.h, m)};
	const shrink = ramp(f, P.ARRETE, 18, IN_OUT);
	const gone = ramp(f, P.TROUVE - 2, 10);
	const scroll = lerp(0, 150, ramp(f, MORPH + 26, P.ARRETE - MORPH - 26, IN_OUT));
	const site = clamp01((m - 0.25) / 0.5);
	return (
		<div style={{position: 'absolute', left: r.x, top: r.y, width: r.w, height: r.h, borderRadius: lerp(22, 30, m), overflow: 'hidden', border: `1.5px solid ${m < 0.6 ? `rgba(${C.accentRGB},0.85)` : C.lineStrong}`, boxShadow: '0 60px 140px rgba(0,0,0,0.7)', background: C.surface2, transform: `scale(${lerp(1, 0.74, shrink)}) translateY(${shrink * 40}px)`, opacity: lerp(1, 0.3, shrink) * (1 - gone), filter: shrink > 0 ? `blur(${shrink * 2.5}px)` : undefined}}>
			<div style={{position: 'absolute', left: 0, top: 0, opacity: 1 - site}}>
				<LeadCard lead={LEADS[0]} w={a.w} selected={1} />
			</div>
			<div style={{position: 'absolute', left: 0, top: 0, width: DEMO_RECT.w, height: DEMO_RECT.h, transform: `scale(${r.w / DEMO_RECT.w})`, transformOrigin: '0 0', opacity: site}}>
				<WebsiteMockup w={DEMO_RECT.w} h={DEMO_RECT.h} scroll={scroll} />
			</div>
		</div>
	);
};

/* ── SCÈNE 7 · CTA — le logo, puis l'offre au premier plan ── */
export const CTAEndCard: React.FC<{f: number}> = ({f}) => {
	const {fps} = useVideoConfig();
	if (f < P.TROUVE - 4) return null;
	const bg = ramp(f, P.TROUVE - 4, 12);
	const logoIn = ramp(f, P.TROUVE + 4, 10);
	const offer = ramp(f, P.DIX - 2, 8);
	const s = settle(f, P.DIX - 2, fps, 20);
	const lift = ramp(f, P.DIX - 4, 12, IN_OUT);
	const frozen = P.RESULTS + 40;
	return (
		<div style={{position: 'absolute', inset: 0, fontFamily: FONT}}>
			{/* l'interface illustrative revient en arrière-plan */}
			<div style={{position: 'absolute', left: WIN.x, top: WIN.y, opacity: 0.16 * bg, filter: 'blur(5px)', transform: `scale(${lerp(1.1, 1.04, bg)})`}}>
				<SearchInterface f={frozen} k={{...searchKeys, status: 1e9, score: 1e9, select: 1e9, hideFirst: 1e9}} />
			</div>
			<div style={{position: 'absolute', left: 0, right: 0, top: lerp(700, 320, lift), display: 'flex', justifyContent: 'center', opacity: logoIn, transform: `scale(${lerp(0.9, 1, logoIn) * lerp(1.35, 1, lift)})`}}>
				<Logo size={110} />
			</div>
			{offer > 0 && (
				<div style={{position: 'absolute', left: 0, right: 0, top: 470, display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: offer, transform: `translateY(${(1 - offer) * 12}px) scale(${lerp(1.04, 1, s)})`}}>
					<div style={{fontSize: 118, fontWeight: 850, letterSpacing: '-0.045em', lineHeight: 1, color: C.white}}>10 PROSPECTS</div>
					<div style={{marginTop: 8, fontSize: 118, fontWeight: 850, letterSpacing: '-0.045em', lineHeight: 1, background: C.grad, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent'}}>GRATUITS</div>
					<div style={{marginTop: 30, fontSize: 40, fontWeight: 600, color: C.grey, letterSpacing: '-0.01em', opacity: ramp(f, P.DIX + 6, 8)}}>Teste Prospectify dans ta ville.</div>
					<div style={{marginTop: 40, width: 660, height: 110, borderRadius: 980, background: C.grad, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, fontSize: 44, fontWeight: 750, color: '#fff', boxShadow: `0 24px 70px rgba(${C.accentRGB},0.45), inset 0 1px 0 rgba(255,255,255,0.25)`, opacity: ramp(f, P.GRATUITS - 4, 8), transform: `translateY(${(1 - ramp(f, P.GRATUITS - 4, 8)) * 12}px)`, position: 'relative', overflow: 'hidden'}}>
						<div style={{position: 'absolute', top: 0, bottom: 0, width: '40%', left: `${lerp(-50, 130, clamp01((f - P.GRATUITS) / 30))}%`, background: 'linear-gradient(105deg, rgba(255,255,255,0) 20%, rgba(255,255,255,0.28) 50%, rgba(255,255,255,0) 80%)'}} />
						<span style={{position: 'relative'}}>Essayer gratuitement</span>
						<svg width={36} height={36} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" style={{position: 'relative'}}>
							<path d="M5 12h14" />
							<path d="m12 5 7 7-7 7" />
						</svg>
					</div>
					<div style={{marginTop: 34, fontSize: 50, fontWeight: 750, color: C.white, letterSpacing: '-0.02em', opacity: ramp(f, P.GRATUITS, 8)}}>prospectify.net</div>
				</div>
			)}
		</div>
	);
};
