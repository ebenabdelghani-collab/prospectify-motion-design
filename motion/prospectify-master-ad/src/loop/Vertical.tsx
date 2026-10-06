import React from 'react';
import {AbsoluteFill, Audio, Img, staticFile, useCurrentFrame} from 'remotion';
import {CameraMotionBlur} from '@remotion/motion-blur';
import {C, EASE, clamp01, lerp, rand, ramp} from '../final/tokens';
import {Grain} from '../fx/camera';
import {Logo} from '../final/kit/ui';
import {Icon, Star} from '../final/kit/icons';
import {MapView, Photo, Pin, photo} from '../final/kit/media';
import {TabChip} from '../playbook/fx';
import {BrandBG, Chroma, Clock, ColdBG, GF, P, appear, coldGrade, gone, loadGeist} from './fx';
import {Row, STEPS, Scribble, TABS, camAt} from './scenes';
import {Chrome, Laptop, Phone} from '../versus/devices';
import {MobileSite, PremiumSite, SITE_DW} from '../versus/site';
import {APP_H, APP_W, BUILDERS, Pill, ProspectifyApp} from '../versus/app';
import {loadFinalFonts} from '../final/tokens';

loadFinalFonts();
loadGeist();

/**
 * THE LOOP — 9:16 (1080×1920). Same voice, music, timing and captions as the 16:9 cut; every scene
 * recomposed for vertical. Layout contract: visual zone y 120 … 1440 · caption band y 1500 … 1700.
 */
const VW = 1080;

/* ── captions (bigger, own band) ── */
const VCaptions: React.FC<{f: number}> = ({f}) => {
	const cap = P.CAPS.find((c) => f >= c.a && f <= c.b);
	if (!cap) return null;
	const out = ramp(f, cap.b - 5, 5, EASE.EXIT);
	return (
		<div style={{position: 'absolute', left: 40, right: 40, top: 1500, height: 200, display: 'flex', flexWrap: 'wrap', alignItems: 'center', alignContent: 'center', justifyContent: 'center', columnGap: 22, rowGap: 0, fontFamily: GF, opacity: 1 - out}}>
			{cap.words.map((w, i) => {
				const t = ramp(f, w.a - 1, 7, EASE.FAST_LOCK);
				return (
					<span key={i} style={{display: 'inline-block', fontSize: 84, fontWeight: 700, letterSpacing: '-0.035em', lineHeight: 1.1, color: w.accent ? C.accentBright : '#fff', transform: `translateY(${(1 - t) * 20}px) scale(${0.86 + 0.14 * t})`, opacity: f < w.a - 1 ? 0 : clamp01(t * 1.6), textShadow: '0 6px 30px rgba(0,0,0,0.55)'}}>
						{w.w}
					</span>
				);
			})}
		</div>
	);
};

/* ── 1 · hook card, stacked (frame 0 = last frame) ── */
const VLeadCard: React.FC<{f: number; noweb: number; score: number}> = ({f, noweb, score}) => (
	<div style={{width: 960, borderRadius: 34, background: 'linear-gradient(180deg,#17171b,#111114)', border: `1.5px solid ${C.lineStrong}`, boxShadow: '0 60px 140px rgba(0,0,0,0.65)', position: 'relative', fontFamily: GF}}>
		<div style={{height: 560, borderRadius: '34px 34px 0 0', overflow: 'hidden', position: 'relative'}}>
			<Img src={photo('pizza_4')} style={{width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${1.06 + 0.04 * Math.sin(f / 90)})`}} />
			<div style={{position: 'absolute', left: 20, bottom: 16, fontSize: 18, color: 'rgba(255,255,255,0.75)'}}>Sample business</div>
		</div>
		<div style={{padding: '34px 44px 26px'}}>
			<div style={{display: 'flex', alignItems: 'center', gap: 10, fontSize: 24, color: C.text3}}>
				<Icon n="pin" size={24} color="#4f8cf7" sw={2.2} /> Maps listing
			</div>
			<div style={{marginTop: 10, fontSize: 76, fontWeight: 650, letterSpacing: '-0.04em', color: C.text}}>Bella Forno</div>
			<div style={{marginTop: 4, fontSize: 30, color: C.text2}}>Pizzeria · East Austin</div>
			<div style={{marginTop: 16, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 6, fontSize: 32, fontWeight: 650, color: C.text}}>
				{[0, 1, 2, 3, 4].map((i) => (
					<Star key={i} size={32} />
				))}
				<span style={{marginLeft: 10}}>4.8</span>
				<span style={{color: C.text2, fontWeight: 500}}>· 312 reviews</span>
			</div>
			<div style={{fontSize: 30}}>
				<Row icon="pin" label="Address" value="1208 E 6th St" />
				<Row icon="phone" label="Phone" value="(512) 555-0136" />
				<div style={{position: 'relative'}}>
					<Row icon="globe" label="Website" value="None" hot={noweb > 0.5} />
					<div style={{position: 'absolute', left: 0, top: 0}}>
						<Scribble t={noweb} />
					</div>
				</div>
			</div>
		</div>
		{score > 0 && (
			<div style={{position: 'absolute', right: -14, top: 470, display: 'flex', alignItems: 'center', gap: 16, padding: '18px 26px 18px 20px', borderRadius: 26, background: 'rgba(14,14,17,0.96)', border: `1.5px solid rgba(${C.accentRGB},0.55)`, boxShadow: `0 24px 60px rgba(0,0,0,0.55), 0 0 50px rgba(${C.accentRGB},0.25)`, transform: `scale(${lerp(0.6, 1, EASE.OVERSHOOT(score))}) rotate(${lerp(-6, 2, score)}deg)`, opacity: clamp01(score * 2)}}>
				<Logo size={46} />
				<div>
					<div style={{fontSize: 54, fontWeight: 700, color: C.accentBright, lineHeight: 1}}>
						{Math.round(94 * clamp01(score * 1.3))}
						<span style={{fontSize: 22, color: C.text3, fontWeight: 500}}> /100</span>
					</div>
					<div style={{fontSize: 20, color: C.text2, marginTop: 4}}>High opportunity</div>
				</div>
			</div>
		)}
	</div>
);

const VHook: React.FC<{f: number}> = ({f}) => {
	const loopIn = f >= P.LP_IN ? ramp(f, P.LP_PIZ - 10, 22, EASE.FAST_LOCK) : 0;
	const inHook = f < P.PN_IN + 12;
	if (!inHook && loopIn <= 0) return null;
	const out = inHook ? gone(f, P.PN_IN - 4, 12) : 0;
	const noweb = inHook ? ramp(f, P.HK_NOWEB, 16, EASE.SOFT) : 0;
	const score = inHook ? ramp(f, P.HK_SCORE, 14, EASE.UI) : 0;
	const push = inHook ? lerp(1, 1.03, ramp(f, 0, P.PN_IN, EASE.SOFT)) * lerp(1, 0.9, out) : lerp(1.12, 1, loopIn);
	const o = inHook ? 1 - out : loopIn;
	return (
		<div style={{position: 'absolute', inset: 0, opacity: o}}>
			<BrandBG f={inHook ? f : 0} glow={0.9} gy={38} />
			<div style={{position: 'absolute', left: (VW - 960) / 2, top: 150, transform: `scale(${push})`, transformOrigin: '50% 40%', filter: o < 1 ? `blur(${(1 - o) * 14}px)` : undefined}}>
				<VLeadCard f={inHook ? f : 0} noweb={noweb} score={score} />
			</div>
		</div>
	);
};

/* ── 2 · pain flashes ── */
const VPain: React.FC<{f: number}> = ({f}) => {
	if (f < P.PN_IN - 2 || f > P.PN_OUT + 12) return null;
	const fl = P.PN_FLASH as unknown as number[];
	const k = Math.max(0, fl.filter((x) => f >= x).length - 1);
	const t = ramp(f, fl[k], 8, EASE.FAST_LOCK);
	const o = appear(f, P.PN_IN, 6) * (1 - gone(f, P.PN_OUT, 10));
	return (
		<div style={{position: 'absolute', inset: 0, opacity: o}}>
			<ColdBG f={f} />
			<Chroma f={f} hits={fl} amt={0.8}>
				<div style={{position: 'absolute', left: 0, top: 0, width: VW, height: 1460, transform: `scale(${lerp(1.08, 1, t)})`, ...coldGrade}}>
					{k === 0 &&
						TABS.map(([l, d], i) => (
							<div key={i} style={{position: 'absolute', left: 60 + rand(i * 3.3) * 500, top: 220 + i * 120 + rand(i * 7.1) * 40, transform: `rotate(${(rand(i * 5.5) - 0.5) * 12}deg) scale(1.55)`, transformOrigin: '0 50%', opacity: ramp(f, fl[0] + i, 4)}}>
								<TabChip label={l} dot={d} />
							</div>
						))}
					{k === 1 && (
						<div style={{position: 'absolute', left: 60, top: 220, width: 960, height: 1100, borderRadius: 22, overflow: 'hidden', boxShadow: '0 40px 100px rgba(0,0,0,0.6)'}}>
							<MapView w={960} h={1100} cx={1000} cy={900 + (f - fl[1]) * 9} zoom={1}>
								{Array.from({length: 22}).map((_, i) => (
									<Pin key={i} x={500 + rand(i * 2.7) * 1000} y={400 + rand(i * 5.3) * 1700} s={1.3} />
								))}
							</MapView>
						</div>
					)}
					{k === 2 && (
						<div style={{position: 'absolute', left: (VW - 520) / 2, top: 170}}>
							<Phone w={520} time="1:31">
								<div style={{position: 'absolute', inset: 0, background: '#0b141a', fontFamily: GF}}>
									<div style={{height: 180, background: '#1f2c34', display: 'flex', alignItems: 'flex-end', padding: '0 24px 18px', gap: 14}}>
										<Photo n="pizza_4" w={56} h={56} r={28} />
										<div style={{color: '#e9edef', fontSize: 26, fontWeight: 700}}>Bella Forno</div>
									</div>
									<div style={{position: 'absolute', right: 18, top: 240, maxWidth: 360, padding: '14px 18px', borderRadius: 16, background: '#005c4b', color: '#e9edef', fontSize: 24}}>
										Hi, do you need a website?
										<div style={{textAlign: 'right', fontSize: 17, color: '#53bdeb', marginTop: 4}}>Seen ✓✓</div>
									</div>
								</div>
							</Phone>
						</div>
					)}
					{k === 3 && (
						<div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
							<Clock mins={26 * 60 + 7} size={250} />
						</div>
					)}
				</div>
			</Chroma>
		</div>
	);
};

/* ── 3 · reveal: three numbered cards, stacked ── */
const VReveal: React.FC<{f: number}> = ({f}) => {
	if (f < P.RV_IN - 2 || f > P.N1_IN + 14) return null;
	const o = appear(f, P.RV_IN, 12) * (1 - gone(f, P.N1_IN - 4, 12));
	return (
		<div style={{position: 'absolute', inset: 0, opacity: o}}>
			<BrandBG f={f} glow={1.2} gy={42} />
			<div style={{position: 'absolute', left: 0, right: 0, top: 200, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 20, transform: `scale(${lerp(0.9, 1, appear(f, P.RV_IN, 16))})`}}>
				<Logo size={86} />
				<div style={{fontFamily: GF, fontSize: 92, fontWeight: 650, letterSpacing: '-0.05em', color: C.text}}>Prospectify</div>
			</div>
			<div style={{position: 'absolute', left: 60, right: 60, top: 400, display: 'flex', flexDirection: 'column', gap: 30}}>
				{STEPS.map(([n, l, ic], i) => {
					const t = appear(f, P.RV_THREE + i * 6, 14);
					return (
						<div key={n} style={{height: 290, borderRadius: 30, background: 'linear-gradient(180deg,#19191d,#121215)', border: `1.5px solid ${C.lineStrong}`, padding: '0 44px', display: 'flex', alignItems: 'center', gap: 40, opacity: t, transform: `translateX(${(1 - t) * 120}px)`, filter: t < 1 ? `blur(${(1 - t) * 8}px)` : undefined, fontFamily: GF}}>
							<div style={{fontSize: 190, fontWeight: 700, lineHeight: 1, letterSpacing: '-0.06em', background: C.grad, WebkitBackgroundClip: 'text', color: 'transparent', width: 130}}>{n}</div>
							<div style={{display: 'flex', alignItems: 'center', gap: 16, fontSize: 46, fontWeight: 600, color: C.text}}>
								<Icon n={ic} size={44} color={C.accent} sw={2.2} />
								{l}
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
};

/* ── 4 · steps: app in a tall window, then builder + phone ── */
const VProgress: React.FC<{f: number}> = ({f}) => {
	const act = f >= P.N3_IN ? 2 : f >= P.N2_IN ? 1 : 0;
	return (
		<div style={{position: 'absolute', left: 0, right: 0, top: 70, display: 'flex', justifyContent: 'center', gap: 12, fontFamily: GF}}>
			{['Find', 'Message', 'Prompt'].map((l, i) => {
				const on = i === act;
				const done = i < act;
				return (
					<div key={l} style={{height: 64, padding: '0 26px 0 10px', borderRadius: 980, display: 'flex', alignItems: 'center', gap: 12, background: on ? 'rgba(244,37,98,0.14)' : 'rgba(255,255,255,0.04)', border: `1.5px solid ${on ? `rgba(${C.accentRGB},0.7)` : C.line}`, color: on ? C.text : done ? C.text2 : C.text3, fontSize: 28, fontWeight: 600, transform: `scale(${on ? 1 + 0.06 * (1 - ramp(f, [P.N1_IN, P.N2_IN, P.N3_IN][i], 12)) : 1})`}}>
						<div style={{width: 46, height: 46, borderRadius: 23, display: 'flex', alignItems: 'center', justifyContent: 'center', background: on ? C.grad : done ? 'rgba(52,211,153,0.18)' : 'rgba(255,255,255,0.06)', fontSize: 23, fontWeight: 700, color: done ? '#34D399' : '#fff'}}>{done ? '✓' : i + 1}</div>
						{l}
					</div>
				);
			})}
		</div>
	);
};

const VSteps: React.FC<{f: number}> = ({f}) => {
	if (f < P.N1_IN - 4 || f > P.CTA_IN + 14) return null;
	const o = appear(f, P.N1_IN - 4, 14) * (1 - gone(f, P.CTA_IN - 6, 12));
	const appOut = ramp(f, P.TL_IN - 4, 20, EASE.CAMERA);
	// window 1000 × 1240 (centre 500, 620). The list fills it, then the lead panel fills it.
	const cam = camAt(f, [
		[P.N1_IN, 620, 500, 0.62],
		[P.F_ROWS, 560, 470, 1.0],
		[P.F_SCORE, 1310, 400, 1.55],
		[P.N2_IN, 1310, 383, 1.62],
		[P.N3_IN, 1310, 383, 1.62],
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
	const lw = 900;
	const sc = (lw - 2 * lw * 0.018) / SITE_DW;
	return (
		<div style={{position: 'absolute', inset: 0, opacity: o}}>
			<BrandBG f={f} gx={50} gy={45} />
			<VProgress f={f} />
			{appOut < 1 && (
				<div style={{position: 'absolute', left: 40, top: 180, width: 1000, height: 1240, borderRadius: 34, overflow: 'hidden', border: `1.5px solid ${C.lineStrong}`, boxShadow: '0 60px 160px rgba(0,0,0,0.7)', background: '#0a0a0c', opacity: 1 - appOut, transform: `scale(${lerp(1, 0.94, appOut)})`}}>
					<div style={{position: 'absolute', left: 500 - cam.cx, top: 620 - cam.cy, width: APP_W, height: APP_H, transform: `scale(${cam.s})`, transformOrigin: `${cam.cx}px ${cam.cy}px`}}>
						<ProspectifyApp f={f} k={keys} />
					</div>
				</div>
			)}
			{appOut > 0 && (
				<div style={{position: 'absolute', inset: 0}}>
					<div style={{position: 'absolute', left: 40, right: 40, top: 170, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 14, opacity: appear(f, P.TL_IN, 12)}}>
						{BUILDERS.map((b, i) => {
							const t = appear(f, (P.TL_LOGOS as unknown as number[])[i], 10);
							return (
								<div key={b.n} style={{height: 70, padding: '0 24px', borderRadius: 20, background: C.surface2, border: `1.5px solid ${i === 0 ? C.accent : C.lineStrong}`, display: 'flex', alignItems: 'center', gap: 12, opacity: t, transform: `scale(${lerp(0.8, 1, t)})`}}>
									<Img src={staticFile(b.src)} style={{width: b.w * 1.25, height: b.h * 1.25}} />
									{!b.word && <span style={{fontFamily: GF, fontSize: 28, fontWeight: 650, color: C.text}}>{b.n}</span>}
								</div>
							);
						})}
						<div style={{height: 70, padding: '0 24px', borderRadius: 20, background: C.grad, display: 'flex', alignItems: 'center', fontFamily: GF, fontSize: 27, fontWeight: 650, color: '#fff', opacity: appear(f, P.TL_PASTE - 6, 8), transform: `scale(${f >= P.TL_PASTE && f < P.TL_PASTE + 6 ? 0.92 : 1})`}}>⌘V Paste prompt</div>
					</div>
					<div style={{position: 'absolute', left: 90, top: 300, opacity: devT, transform: `translateY(${(1 - devT) * 60}px)`}}>
						<Laptop w={lw} rotX={4}>
							<Chrome url="bellaforno.com" h={34}>
								<div style={{transform: `scale(${sc})`, transformOrigin: '0 0'}}>
									<PremiumSite b={buildB} f={f - P.TL_PASTE} scroll={lerp(0, 600, ramp(f, P.TL_PASTE + 70, 80, EASE.SOFT))} />
								</div>
							</Chrome>
						</Laptop>
					</div>
					<div style={{position: 'absolute', left: (VW - 440) / 2 + 150, top: 640, opacity: devT, transform: `translateY(${(1 - appear(f, P.TL_PASTE + 4, 22)) * 120}px)`}}>
						<Phone w={360} rotY={-10} rotX={3} rotZ={2} time="11:52">
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

/* ── 5 · CTA ── */
const VCTA: React.FC<{f: number}> = ({f}) => {
	if (f < P.CTA_IN - 4 || f > P.LP_PIZ + 16) return null;
	const t = appear(f, P.CTA_IN, 14);
	const out = gone(f, P.LP_PIZ - 10, 16);
	return (
		<div style={{position: 'absolute', inset: 0, opacity: t * (1 - out)}}>
			<BrandBG f={f} glow={1.2} gy={42} />
			<div style={{position: 'absolute', left: 0, right: 0, top: 380, display: 'flex', flexDirection: 'column', alignItems: 'center', transform: `scale(${lerp(0.94, 1, t) * lerp(1, 0.85, out)})`, filter: out > 0 ? `blur(${out * 12}px)` : undefined}}>
				<Logo size={150} />
				<div style={{marginTop: 26, fontFamily: GF, fontSize: 112, fontWeight: 650, letterSpacing: '-0.05em', color: C.text}}>Prospectify</div>
				<div style={{marginTop: 70, width: 860}}>
					<Pill h={140} fs={58} sheen={clamp01((f - P.CTA_IN - 10) / 40)} style={{width: '100%'}}>
						Get 10 free leads
					</Pill>
				</div>
				<div style={{marginTop: 40, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, opacity: appear(f, P.CTA_NOCARD, 10)}}>
					{['No card required', 'Any country', 'Cancel anytime'].map((x) => (
						<div key={x} style={{height: 66, padding: '0 28px', borderRadius: 18, background: C.surface2, border: `1.5px solid ${C.lineStrong}`, display: 'flex', alignItems: 'center', gap: 12, fontFamily: GF, fontSize: 30, fontWeight: 600, color: C.text}}>
							<Icon n="check" size={26} color={C.accent} sw={2.8} />
							{x}
						</div>
					))}
				</div>
				<div style={{marginTop: 36, fontFamily: GF, fontSize: 44, fontWeight: 650, color: C.text}}>prospectify.net</div>
			</div>
		</div>
	);
};

const BLUR: [number, number][] = [
	[P.PN_IN - 4, P.PN_IN + 12],
	[P.RV_IN - 4, P.RV_IN + 14],
	[P.N1_IN - 4, P.N1_IN + 16],
	[P.TL_IN - 4, P.TL_IN + 18],
	[P.CTA_IN - 4, P.CTA_IN + 14],
];
const inBlur = (f: number) => BLUR.some(([a, b]) => f >= a && f <= b);

const Scenes: React.FC = () => {
	const f = useCurrentFrame();
	return (
		<AbsoluteFill>
			<VHook f={f} />
			<VPain f={f} />
			<VReveal f={f} />
			<VSteps f={f} />
			<VCTA f={f} />
		</AbsoluteFill>
	);
};

export const LoopVertical: React.FC<{withAudio: boolean}> = ({withAudio}) => {
	const f = useCurrentFrame();
	return (
		<AbsoluteFill style={{background: '#09090b', overflow: 'hidden'}}>
			{inBlur(f) ? (
				<CameraMotionBlur shutterAngle={180} samples={4}>
					<Scenes />
				</CameraMotionBlur>
			) : (
				<Scenes />
			)}
			<VCaptions f={f} />
			<Grain f={f} opacity={0.04} />
			{withAudio && <Audio src={staticFile('loop/audio/loop-mix.wav')} />}
		</AbsoluteFill>
	);
};
