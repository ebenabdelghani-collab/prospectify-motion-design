import React from 'react';
import {AbsoluteFill, Audio, Img, staticFile, useCurrentFrame} from 'remotion';
import {C, EASE, clamp01, lerp, loadFinalFonts, ramp} from '../final/tokens';
import {Grain} from '../fx/camera';
import {Logo} from '../final/kit/ui';
import {Icon, Star} from '../final/kit/icons';
import {photo} from '../final/kit/media';
import {GF, loadGeist} from '../versus/fx';
import {Phone} from '../versus/devices';
import {MobileSite} from '../versus/site';
import {APP_H, APP_W, MESSAGES, PROMPT, Pill, ProspectifyApp} from '../versus/app';
import TL from './timeline.json';

loadFinalFonts();
loadGeist();

/**
 * PROSPECTIFY — Instagram ad (1080×1920, ~18 s). Voice: ElevenLabs (natural, warm, unhurried).
 * Look modelled on the founder's reference ad: deep black with soft coloured gradient blooms that
 * drift, one piece of real product UI floating in the centre, word-by-word captions underneath.
 * Layout contract: visual zone y 180…1340 · caption band y 1400…1640.
 */
const P = TL as unknown as Record<string, number & number[]> & {CAPS: {words: {w: string; a: number; b: number; accent: boolean}[]; a: number; b: number}[]; durationInFrames: number};
const VW = 1080;
const app = (f: number) => clamp01(ramp(f, 0, 1, EASE.LINEAR));

/* ── background: drifting colour blooms on black ── */
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
		<div style={{position: 'absolute', inset: 0, background: '#050507', overflow: 'hidden'}}>
			<div style={b(0, 24, 20, 95, 'rgba(244,37,98,0.42)', 95)} />
			<div style={b(1, 78, 34, 85, 'rgba(255,90,69,0.34)', 120)} />
			<div style={b(2, 50, 72, 105, 'rgba(160,40,140,0.30)', 140)} />
			<div style={b(3, 14, 62, 70, 'rgba(255,59,95,0.26)', 110)} />
			<div style={{position: 'absolute', inset: 0, background: 'radial-gradient(120% 70% at 50% 42%, rgba(0,0,0,0) 30%, rgba(5,5,7,0.82) 100%)'}} />
		</div>
	);
};

/* ── captions ── */
const Captions: React.FC<{f: number}> = ({f}) => {
	const cap = P.CAPS.find((c) => f >= c.a && f <= c.b);
	if (!cap) return null;
	const out = ramp(f, cap.b - 4, 4, EASE.EXIT);
	return (
		<div style={{position: 'absolute', left: 60, right: 60, top: 1400, height: 240, display: 'flex', flexWrap: 'wrap', alignItems: 'center', alignContent: 'center', justifyContent: 'center', columnGap: 24, fontFamily: GF, opacity: 1 - out}}>
			{cap.words.map((w, i) => {
				const t = ramp(f, w.a, 6, EASE.FAST_LOCK);
				return (
					<span key={i} style={{display: 'inline-block', fontSize: 88, fontWeight: 700, letterSpacing: '-0.035em', lineHeight: 1.12, color: w.accent ? C.accentBright : '#fff', transform: `translateY(${(1 - t) * 16}px) scale(${0.88 + 0.12 * t})`, opacity: f < w.a ? 0 : clamp01(t * 1.7), textShadow: '0 8px 40px rgba(0,0,0,0.7)'}}>
						{w.w}
					</span>
				);
			})}
		</div>
	);
};

/* ── 1 · the lead card (the proof, on frame 0) ── */
const Card: React.FC<{f: number}> = ({f}) => {
	const noweb = ramp(f, P.HK_NOWEB, 14, EASE.SOFT);
	const score = ramp(f, P.HK_SCORE, 14, EASE.UI);
	const inT = ramp(f, 0, 11, EASE.FAST_LOCK);
	const out = ramp(f, P.PR_IN - 14, 14, EASE.EXIT);
	if (out >= 1) return null;
	const circle = 'M 28 50 C 36 10, 440 6, 486 38 C 524 64, 440 98, 244 96 C 86 94, 8 84, 20 50 C 28 30, 112 14, 214 12';
	return (
		<div style={{position: 'absolute', left: (VW - 900) / 2, top: 300, opacity: inT * (1 - out), transform: `scale(${lerp(1.14, 1, inT) * lerp(1, 1.06, ramp(f, 0, P.PR_IN, EASE.SOFT)) * lerp(1, 0.92, out)}) translateY(${out * -40}px)`, filter: out > 0 ? `blur(${out * 16}px)` : undefined}}>
			<div style={{width: 900, borderRadius: 40, background: 'rgba(18,18,22,0.84)', border: '1.5px solid rgba(255,255,255,0.14)', boxShadow: '0 60px 160px rgba(0,0,0,0.7)', backdropFilter: 'blur(30px)', overflow: 'hidden', fontFamily: GF, position: 'relative'}}>
				<div style={{height: 480, overflow: 'hidden', position: 'relative'}}>
					<Img src={photo('oven_0')} style={{width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${1.05 + 0.05 * ramp(f, 0, 400, EASE.LINEAR)})`}} />
					<div style={{position: 'absolute', inset: 0, background: 'linear-gradient(0deg, rgba(18,18,22,0.9) 0%, rgba(18,18,22,0) 45%)'}} />
					<div style={{position: 'absolute', left: 22, bottom: 14, fontSize: 19, color: 'rgba(255,255,255,0.7)'}}>Sample business</div>
				</div>
				<div style={{padding: '26px 46px 40px'}}>
					<div style={{fontSize: 70, fontWeight: 650, letterSpacing: '-0.04em', color: '#fff'}}>Bella Forno</div>
					<div style={{marginTop: 14, display: 'flex', alignItems: 'center', gap: 8, fontSize: 32, fontWeight: 600, color: '#fff'}}>
						{[0, 1, 2, 3, 4].map((i) => (
							<Star key={i} size={32} />
						))}
						<span style={{marginLeft: 8}}>4.8</span>
						<span style={{color: 'rgba(255,255,255,0.55)', fontWeight: 500}}>· 312 reviews</span>
					</div>
					<div style={{marginTop: 26, position: 'relative', display: 'flex', alignItems: 'center', gap: 18, height: 76, borderTop: '1px solid rgba(255,255,255,0.1)', fontSize: 32}}>
						<Icon n="globe" size={30} color={noweb > 0.4 ? C.accentBright : 'rgba(255,255,255,0.4)'} sw={2} />
						<span style={{color: 'rgba(255,255,255,0.5)', width: 150}}>Website</span>
						<span style={{color: noweb > 0.4 ? C.accentBright : '#fff', fontWeight: noweb > 0.4 ? 700 : 500}}>None</span>
						{noweb > 0 && (
							<svg width={560} height={120} viewBox="0 0 520 110" style={{position: 'absolute', left: -34, top: -22, overflow: 'visible'}}>
								<path d={circle} fill="none" stroke={C.accentBright} strokeWidth={5} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - noweb} style={{filter: `drop-shadow(0 0 14px rgba(${C.accentRGB},0.7))`}} />
							</svg>
						)}
					</div>
				</div>
				{score > 0 && (
					<div style={{position: 'absolute', right: 26, top: 400, display: 'flex', alignItems: 'center', gap: 16, padding: '18px 28px 18px 20px', borderRadius: 26, background: 'rgba(10,10,13,0.95)', border: `1.5px solid rgba(${C.accentRGB},0.6)`, boxShadow: `0 0 60px rgba(${C.accentRGB},0.35)`, transform: `scale(${lerp(0.5, 1, EASE.OVERSHOOT(score))}) rotate(${lerp(-8, -2, score)}deg)`, opacity: clamp01(score * 2)}}>
						<Logo size={46} />
						<div>
							<div style={{fontSize: 56, fontWeight: 700, color: C.accentBright, lineHeight: 1}}>
								{Math.round(94 * clamp01(score * 1.3))}
								<span style={{fontSize: 22, color: 'rgba(255,255,255,0.4)', fontWeight: 500}}> /100</span>
							</div>
							<div style={{fontSize: 20, color: 'rgba(255,255,255,0.6)', marginTop: 4}}>High opportunity</div>
						</div>
					</div>
				)}
			</div>
		</div>
	);
};

/* ── 2 · the real Prospectify app, floating ── */
type Cam = [number, number, number, number];
const camAt = (f: number, keys: Cam[]) => {
	let i = 0;
	while (i < keys.length - 1 && f >= keys[i + 1][0]) i++;
	const a = keys[i];
	const b = keys[Math.min(i + 1, keys.length - 1)];
	const t = b[0] === a[0] ? 1 : EASE.CAMERA(clamp01((f - a[0]) / Math.min(24, b[0] - a[0])));
	return {cx: lerp(a[1], b[1], t), cy: lerp(a[2], b[2], t), s: lerp(a[3], b[3], t)};
};

const AppShot: React.FC<{f: number}> = ({f}) => {
	const inT = ramp(f, P.PR_IN - 6, 16, EASE.FAST_LOCK);
	const out = ramp(f, P.PASTE - 12, 14, EASE.EXIT);
	if (f < P.PR_IN - 8 || out >= 1) return null;
	const cam = camAt(f, [
		[P.PR_IN, 620, 440, 0.6],
		[P.ROWS[2], 560, 430, 0.95],
		[P.MSG_IN - 20, 1310, 420, 1.5],
		[P.PROMPT_IN, 1310, 420, 1.5],
	]);
	const keys = {
		searchKeys: [P.PR_IN - 6, P.PR_IN - 4, P.PR_IN - 2, P.PR_IN, P.PR_IN + 2, P.PR_IN + 4],
		scan: P.PR_IN + 6,
		rows: P.ROWS as unknown as number[],
		select: P.ROWS[5] + 8,
		panel: P.MSG_IN - 26,
		tab: [P.MSG_IN - 26, P.MSG_IN, P.PROMPT_IN] as [number, number, number],
		channel: [P.MSG_IN + 4, 1e9, 1e9] as [number, number, number],
		copy: P.PROMPT_IN - 10,
		tool: P.PROMPT_IN + 4,
		promptType: [P.PROMPT_IN + 8, P.PASTE - 16] as [number, number],
		ready: P.PASTE - 12,
	};
	return (
		<div style={{position: 'absolute', left: 50, top: 280, width: 980, height: 1060, borderRadius: 38, overflow: 'hidden', border: '1.5px solid rgba(255,255,255,0.14)', boxShadow: '0 60px 160px rgba(0,0,0,0.75)', background: '#0a0a0c', opacity: inT * (1 - out), transform: `scale(${lerp(0.94, 1, inT) * lerp(1, 0.93, out)}) translateY(${out * -30}px)`, filter: out > 0 ? `blur(${out * 14}px)` : undefined}}>
			<div style={{position: 'absolute', left: 490 - cam.cx, top: 530 - cam.cy, width: APP_W, height: APP_H, transform: `scale(${cam.s})`, transformOrigin: `${cam.cx}px ${cam.cy}px`}}>
				<ProspectifyApp f={f} k={keys} />
			</div>
		</div>
	);
};

/* ── 3 · paste into Lovable → the site appears on a phone ── */
const Build: React.FC<{f: number}> = ({f}) => {
	const inT = ramp(f, P.PASTE - 8, 16, EASE.FAST_LOCK);
	const out = ramp(f, P.CTA_IN - 12, 14, EASE.EXIT);
	if (f < P.PASTE - 10 || out >= 1) return null;
	const b = clamp01((f - P.PASTE) / Math.max(26, P.CTA_IN - 16 - P.PASTE));
	return (
		<div style={{position: 'absolute', inset: 0, opacity: inT * (1 - out)}}>
			<div style={{position: 'absolute', left: 0, right: 0, top: 240, display: 'flex', justifyContent: 'center', gap: 14, opacity: ramp(f, P.PASTE - 6, 10)}}>
				<div style={{height: 78, padding: '0 28px', borderRadius: 22, background: 'rgba(22,22,26,0.9)', border: `1.5px solid rgba(${C.accentRGB},0.6)`, display: 'flex', alignItems: 'center', gap: 14, backdropFilter: 'blur(20px)'}}>
					<Img src={staticFile('final/builders/lovable-logomark-color.svg')} style={{width: 40, height: 41}} />
					<span style={{fontFamily: GF, fontSize: 32, fontWeight: 650, color: '#fff'}}>Lovable</span>
				</div>
				<div style={{height: 78, padding: '0 26px', borderRadius: 22, background: C.grad, display: 'flex', alignItems: 'center', fontFamily: GF, fontSize: 30, fontWeight: 650, color: '#fff', transform: `scale(${f >= P.PASTE && f < P.PASTE + 7 ? 0.9 : 1})`, boxShadow: `0 16px 50px rgba(${C.accentRGB},0.4)`}}>⌘V Paste</div>
			</div>
			<div style={{position: 'absolute', left: (VW - 520) / 2, top: 380, transform: `translateY(${(1 - ramp(f, P.PASTE + 4, 22, EASE.FAST_LOCK)) * 80}px)`}}>
				<Phone w={520} rotY={-6} rotX={3} time="11:52" glare={lerp(0.1, 0.9, (f - P.PASTE) / 120)}>
					<div style={{position: 'absolute', inset: 0, overflow: 'hidden'}}>
						<div style={{width: 390, transform: `scale(${(520 * 0.912) / 390})`, transformOrigin: '0 0'}}>
							<MobileSite b={b} f={f - P.PASTE} scroll={lerp(0, 230, ramp(f, P.PASTE + 46, 70, EASE.SOFT))} />
						</div>
					</div>
				</Phone>
			</div>
		</div>
	);
};

/* ── 4 · the offer ── */
const CTA: React.FC<{f: number}> = ({f}) => {
	const t = ramp(f, P.CTA_IN - 6, 16, EASE.FAST_LOCK);
	if (f < P.CTA_IN - 8) return null;
	const click = 1 - 0.05 * Math.sin(Math.PI * clamp01((f - P.CTA_CLICK) / 10));
	return (
		<div style={{position: 'absolute', inset: 0, opacity: t}}>
			<div style={{position: 'absolute', left: 0, right: 0, top: 430, display: 'flex', flexDirection: 'column', alignItems: 'center', transform: `scale(${lerp(0.9, 1, t) * lerp(1, 1.04, ramp(f, P.CTA_IN, 200, EASE.SOFT))})`}}>
				<Logo size={170} />
				<div style={{marginTop: 30, fontFamily: GF, fontSize: 112, fontWeight: 650, letterSpacing: '-0.05em', color: '#fff'}}>Prospectify</div>
				<div style={{marginTop: 64, width: 840, transform: `scale(${click})`}}>
					<Pill h={148} fs={60} sheen={clamp01((f - P.CTA_IN) / 44)} style={{width: '100%', boxShadow: `0 24px 80px rgba(${C.accentRGB},0.45)`}}>
						Get 10 free leads
					</Pill>
				</div>
				<div style={{marginTop: 34, display: 'flex', gap: 14, opacity: ramp(f, P.CTA_FREE, 12)}}>
					{['No card', 'Any country', 'Cancel anytime'].map((x) => (
						<div key={x} style={{height: 68, padding: '0 24px', borderRadius: 20, background: 'rgba(255,255,255,0.07)', border: '1.5px solid rgba(255,255,255,0.14)', display: 'flex', alignItems: 'center', gap: 10, fontFamily: GF, fontSize: 29, fontWeight: 600, color: '#fff', backdropFilter: 'blur(16px)'}}>
							<Icon n="check" size={24} color={C.accentBright} sw={2.8} />
							{x}
						</div>
					))}
				</div>
				<div style={{marginTop: 34, fontFamily: GF, fontSize: 44, fontWeight: 650, color: 'rgba(255,255,255,0.85)'}}>prospectify.net</div>
			</div>
		</div>
	);
};

export const Ad: React.FC<{withAudio: boolean}> = ({withAudio}) => {
	const f = useCurrentFrame();
	return (
		<AbsoluteFill style={{background: '#050507', overflow: 'hidden'}}>
			<Mesh f={f} heat={lerp(0.85, 1.15, ramp(f, P.CTA_IN - 20, 40, EASE.SOFT)) * app(f)} />
			<Card f={f} />
			<AppShot f={f} />
			<Build f={f} />
			<CTA f={f} />
			<Captions f={f} />
			<Grain f={f} opacity={0.035} />
			{withAudio && <Audio src={staticFile('ad/audio/ad-mix.wav')} />}
		</AbsoluteFill>
	);
};

export const AD_DURATION = P.durationInFrames;
export const unusedAd = [MESSAGES, PROMPT];
