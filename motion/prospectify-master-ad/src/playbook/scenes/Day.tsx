import React from 'react';
import {Img, staticFile} from 'remotion';
import {C, EASE, FONT, clamp01, lerp, press, rand, ramp} from '../../final/tokens';
import {Icon} from '../../final/kit/icons';
import {MapView, Pin} from '../../final/kit/media';
import {GradButton, LeadRow, Logo} from '../../final/kit/ui';
import {BELLA, BELLA_THEME, BrowserFrame, MobileSite, SITE_H, SITE_W, Website} from '../../final/kit/website';
import {RANKED, OUTREACH_MESSAGE} from '../../final/data';
import {Big, Chroma, DayBG, H, INK, Letters, P, TabChip, W} from '../fx';

/**
 * ACT 2 — DAY. The playbook (the subject). Prospectify lives *inside* steps 1 and 2 and is only named
 * once the viewer has recognised the process: "You already knew 3 and 4. 1 and 2? That's where your nights go."
 */
const STEPS = ['Find a business that already has customers.', 'Know exactly what to say.', 'Build their site with AI.', 'Send it.'];
const STAGE = {x: 820, y: 170, w: 980, h: 760};
const BUILDERS = [
	{n: 'Lovable', src: 'final/builders/lovable-logomark-color.svg', w: 54, h: 55},
	{n: 'Claude', src: 'final/builders/claude-spark-clay.svg', w: 56, h: 56},
	{n: 'Bolt', src: 'final/builders/bolt-wordmark-white.svg', w: 110, h: 31, dark: true},
	{n: 'Base44', src: 'final/builders/base44-icon-site.png', w: 54, h: 54},
];
const PINS: [number, number][] = [
	[1180, 1260], [1010, 1120], [1340, 1180], [1250, 1420], [930, 1330], [1420, 1330], [1100, 1500], [1300, 1040], [880, 1180], [1520, 1240], [1150, 1680], [1380, 1560],
];

const StageCard: React.FC<{children: React.ReactNode; t: number; out: number; style?: React.CSSProperties}> = ({children, t, out, style}) =>
	t <= 0 || out >= 1 ? null : (
		<div
			style={{
				position: 'absolute',
				left: STAGE.x,
				top: STAGE.y,
				width: STAGE.w,
				height: STAGE.h,
				opacity: Math.min(1, t * 1.6) * (1 - out),
				transform: `perspective(2200px) translateY(${(1 - t) * 90 - out * 60}px) rotateX(${(1 - t) * 10}deg) scale(${lerp(0.94, 1, t) * lerp(1, 0.96, out)})`,
				filter: t < 1 ? `blur(${(1 - t) * 10}px)` : out > 0.02 ? `blur(${out * 10}px)` : undefined,
				...style,
			}}
		>
			{children}
		</div>
	);

const ProspectifyHeader: React.FC<{dim?: number}> = ({dim = 1}) => (
	<div style={{display: 'flex', alignItems: 'center', gap: 12, opacity: dim}}>
		<Logo size={30} />
		<div style={{fontFamily: FONT.sans, fontSize: 22, fontWeight: 760, color: '#fff', letterSpacing: '-0.03em'}}>Prospectify</div>
	</div>
);

export const Day: React.FC<{f: number}> = ({f}) => {
	if (f < P.SPLAT) return null;
	const titleIn = ramp(f, P.PB_TITLE, 18, EASE.FAST_LOCK);
	const toCol = ramp(f, P.PB_STEPS[0] - 4, 30, EASE.CAMERA);
	const stepsT = (P.PB_STEPS as unknown as number[]).map((s) => ramp(f, s, 18, EASE.FAST_LOCK));
	const stepAt = [P.STEP1, P.STEP2, P.STEP3, P.STEP4];
	const active = stepAt.filter((s) => f >= s).length - 1;
	const playOut = ramp(f, P.KNEW - 4, 12, EASE.EXIT); // step stages end
	const knew = (P.KNEW_CHECKS as unknown as number[]).map((k) => ramp(f, k, 12, EASE.FAST_LOCK));
	const nights = ramp(f, P.NIGHTS_HIT, 10, EASE.FAST_LOCK);
	const merge = ramp(f, P.MERGE, 26, EASE.CAMERA);
	const logoT = ramp(f, P.LOGO, 22, EASE.FAST_LOCK);
	const listOut = ramp(f, P.TAG1 - 14, 18, EASE.EXIT);
	const tag = f >= P.TAG1 - 4;
	const ctaT = ramp(f, P.CTA, 18, EASE.FAST_LOCK);
	const tagOut = ramp(f, P.CTA - 6, 14, EASE.EXIT);
	const s = (i: number) => ramp(f, stepAt[i], 22, EASE.FAST_LOCK);
	const so = (i: number) => (i < 3 ? ramp(f, stepAt[i + 1] - 4, 14, EASE.EXIT) : playOut);
	return (
		<div style={{position: 'absolute', inset: 0}}>
			<DayBG f={f} glowX={tag ? 50 : 66} glowY={tag ? 50 : 58} />
			{/* TITLE → column header */}
			<div style={{position: 'absolute', left: lerp(W / 2, 120, toCol), top: lerp(H / 2 - 110, 120, toCol), transform: `translateX(${lerp(-50, 0, toCol)}%) scale(${lerp(1, 0.42, toCol)})`, transformOrigin: '0 0', opacity: titleIn * (1 - listOut)}}>
				<Big text="The" accent="playbook." size={200} color={INK} />
			</div>
			{/* STEP LIST (the process the viewer already half-knows) */}
			<div style={{position: 'absolute', left: 120, top: 260, width: 660, opacity: 1 - listOut}}>
				{STEPS.map((txt, i) => {
					const t = stepsT[i];
					const isActive = active === i && f < P.KNEW;
					const merged = i < 2 ? merge : 0;
					const hot = i < 2 ? nights : 0;
					const checked = i >= 2 ? knew[i - 2] : 0;
					return (
						<div key={i} style={{position: 'absolute', left: 0, top: i * 150, width: 660, height: 128, opacity: t * (i < 2 ? 1 - merged : 1), transform: `translateX(${(1 - t) * -60}px) scale(${isActive ? 1.03 : 1}) translateX(${hot > 0 && hot < 1 ? (rand(f) - 0.5) * 10 : 0}px)`, transformOrigin: '0 50%'}}>
							<div style={{position: 'absolute', inset: 0, borderRadius: 26, background: hot > 0 ? `rgba(244,37,98,${0.1 * hot})` : isActive ? '#ffffff' : 'rgba(255,255,255,0.55)', border: `2px solid ${hot > 0 ? `rgba(244,37,98,${0.6 * hot})` : isActive ? INK : 'rgba(22,19,26,0.08)'}`, boxShadow: isActive ? '0 24px 60px rgba(60,30,20,0.16)' : 'none'}} />
							<div style={{position: 'absolute', left: 26, top: 24, width: 80, height: 80, borderRadius: 40, background: checked > 0.5 ? INK : hot > 0.5 ? C.accent : isActive ? INK : 'transparent', border: `3px solid ${hot > 0.5 ? C.accent : INK}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT.sans, fontSize: 40, fontWeight: 800, color: checked > 0.5 || isActive || hot > 0.5 ? '#fff' : INK}}>
								{checked > 0.5 ? <Icon n="check" size={42} color="#fff" sw={3.4} /> : i + 1}
							</div>
							<div style={{position: 'absolute', left: 130, right: 24, top: 0, bottom: 0, display: 'flex', alignItems: 'center', fontFamily: FONT.sans, fontSize: 34, fontWeight: 700, letterSpacing: '-0.025em', lineHeight: 1.15, color: hot > 0.5 ? C.accentDeep : INK}}>{txt}</div>
							{hot > 0 && i < 2 && merge < 0.05 && (
								<div style={{position: 'absolute', right: -40, top: -26, transform: `rotate(${i ? 6 : -5}deg) scale(${hot})`, display: 'flex', gap: 10}}>
									<TabChip label={i ? '11:46 PM' : '14 tabs'} dot={C.accent} scale={0.85} />
								</div>
							)}
						</div>
					);
				})}
				{/* steps 1 + 2 → one Prospectify search */}
				{merge > 0 && (
					<div style={{position: 'absolute', left: 0, top: 0, width: 660, height: 278, borderRadius: 30, background: '#0f0e13', boxShadow: '0 30px 80px rgba(20,10,20,0.35)', opacity: merge, transform: `scale(${lerp(0.9, 1, merge)})`, transformOrigin: '0 0', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 40px', boxSizing: 'border-box'}}>
						<div style={{display: 'flex', alignItems: 'center', gap: 18}}>
							<Logo size={64} />
							<div style={{fontFamily: FONT.sans, fontSize: 56, fontWeight: 800, color: '#fff', letterSpacing: '-0.045em'}}>Prospectify</div>
						</div>
						<div style={{display: 'flex', alignItems: 'center', gap: 14, marginTop: 22, fontFamily: FONT.sans, fontSize: 30, fontWeight: 650, color: 'rgba(255,255,255,0.75)'}}>
							<Icon n="search" size={30} color={C.accent} /> Steps 1 + 2 · <span style={{color: '#fff', fontStyle: 'italic'}}>one search.</span>
						</div>
					</div>
				)}
			</div>

			{/* ── STAGE 1: the real map → ranked opportunities ── */}
			<StageCard t={s(0)} out={so(0)}>
				<div style={{position: 'absolute', inset: 0, borderRadius: 30, overflow: 'hidden', boxShadow: '0 40px 100px rgba(60,30,20,0.25)'}}>
					<MapView w={STAGE.w} h={STAGE.h} cx={1220 + ramp(f, P.ONE_MAP, 120, EASE.SOFT) * 60} cy={1330} zoom={lerp(1.0, 1.3, ramp(f, P.ONE_MAP, 120, EASE.SOFT))}>
						{PINS.map(([x, y], i) => {
							const at = (P.ONE_PINS as unknown as number[])[i];
							const t = ramp(f, at, 12, EASE.OVERSHOOT);
							return t > 0 ? <Pin key={i} x={x} y={y - (1 - t) * 40} s={0.95} o={Math.min(1, t * 2)} /> : null;
						})}
					</MapView>
				</div>
				<div style={{position: 'absolute', right: -40, top: 110, width: 620, borderRadius: 26, background: '#111114', border: '1.5px solid rgba(255,255,255,0.12)', boxShadow: '0 40px 100px rgba(0,0,0,0.45)', padding: '22px 22px 10px', opacity: ramp(f, P.ONE_CARD, 14), transform: `translateX(${(1 - ramp(f, P.ONE_CARD, 22, EASE.FAST_LOCK)) * 120}px)`}}>
					<div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14}}>
						<ProspectifyHeader />
						<div style={{fontFamily: FONT.sans, fontSize: 18, fontWeight: 600, color: 'rgba(255,255,255,0.55)'}}>Austin · Restaurants</div>
					</div>
					{RANKED.slice(0, 3).map((lead, i) => {
						const t = ramp(f, P.ONE_RANK + i * 6, 16, EASE.FAST_LOCK);
						return (
							<div key={lead.name} style={{width: 900, transform: `scale(0.64) translateY(${(1 - t) * 30}px)`, transformOrigin: '0 0', height: 96, opacity: t}}>
								<LeadRow lead={{...lead, score: lead.score * ramp(f, P.ONE_RANK + i * 6, 30, EASE.SOFT)}} selected={i === 0 ? 1 : 0} />
							</div>
						);
					})}
				</div>
			</StageCard>

			{/* ── STAGE 2: what to say ── */}
			<StageCard t={s(1)} out={so(1)}>
				<div style={{position: 'absolute', left: 60, top: 70, width: 860, borderRadius: 30, background: '#111114', border: '1.5px solid rgba(255,255,255,0.12)', boxShadow: '0 40px 100px rgba(40,20,20,0.35)', padding: '30px 36px 32px'}}>
					<div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
						<ProspectifyHeader />
						<div style={{display: 'flex', alignItems: 'center', gap: 10, fontFamily: FONT.sans, fontSize: 20, fontWeight: 600, color: 'rgba(255,255,255,0.6)'}}>
							<Icon n="message" size={22} color={C.accent} /> WhatsApp · Friendly
						</div>
					</div>
					<div style={{marginTop: 26, fontFamily: FONT.sans, fontSize: 34, fontWeight: 500, lineHeight: 1.45, color: 'rgba(255,255,255,0.78)'}}>
						{(() => {
							const full = OUTREACH_MESSAGE.map((x) => x.t).join('');
							const [a, b] = P.TWO_TYPE as unknown as number[];
							const n = Math.round(full.length * clamp01((f - a) / Math.max(1, b - a)));
							let acc = 0;
							return OUTREACH_MESSAGE.map((seg, i) => {
								const st = acc;
								acc += seg.t.length;
								const vis = Math.max(0, Math.min(seg.t.length, n - st));
								if (!vis) return null;
								return (
									<span key={i} style={seg.k ? {color: '#fff', fontWeight: 700, background: 'rgba(244,37,98,0.2)', borderRadius: 8, padding: '0 5px', boxShadow: 'inset 0 -3px 0 rgba(244,37,98,0.8)'} : undefined}>
										{seg.t.slice(0, vis)}
									</span>
								);
							});
						})()}
					</div>
					<div style={{display: 'flex', justifyContent: 'flex-end', marginTop: 24, opacity: ramp(f, P.TWO_COPY - 12, 10)}}>
						<GradButton label={f >= P.TWO_COPY ? '✓ Copied' : 'Copy WhatsApp'} h={68} fs={28} style={{transform: `scale(${press(f, P.TWO_COPY)})`}} />
					</div>
				</div>
			</StageCard>

			{/* ── STAGE 3: build it with AI (the viewer's own tool) ── */}
			<StageCard t={s(2)} out={so(2)}>
				<div style={{position: 'absolute', left: 0, top: 0, display: 'flex', gap: 16}}>
					{BUILDERS.map((b, i) => {
						const pick = i === 0 ? ramp(f, P.THREE_PICK, 10, EASE.FAST_LOCK) : 0;
						return (
							<div key={b.n} style={{width: 230, height: 96, borderRadius: 22, background: b.dark ? '#16131a' : '#ffffff', border: `2.5px solid ${pick > 0.5 ? C.accent : 'rgba(22,19,26,0.08)'}`, boxShadow: '0 14px 30px rgba(60,30,20,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14, opacity: ramp(f, P.STEP3 + 4 + i * 3, 12), transform: `scale(${press(f, i === 0 ? P.THREE_PICK : -99)})`}}>
								<Img src={staticFile(b.src)} style={{width: b.w, height: b.h, objectFit: 'contain'}} />
								{!b.dark && <div style={{fontFamily: FONT.sans, fontSize: 26, fontWeight: 700, color: INK}}>{b.n}</div>}
							</div>
						);
					})}
				</div>
				<div style={{position: 'absolute', left: 0, top: 128, fontFamily: FONT.sans, fontSize: 15, color: 'rgba(22,19,26,0.45)'}}>Trademarks belong to their owners. No affiliation implied.</div>
				<div style={{position: 'absolute', left: 30, top: 170, width: SITE_W, height: SITE_H + 58, transform: 'scale(0.62)', transformOrigin: '0 0'}}>
					<BrowserFrame w={SITE_W} h={SITE_H + 58} url="bellaforno-austin.com" style={{left: 0, top: 0}}>
						<Website f={f} steps={P.THREE_STEPS as unknown as number[]} theme={BELLA_THEME} c={BELLA} />
					</BrowserFrame>
				</div>
				<div style={{position: 'absolute', left: 640, top: 250, width: 300, height: 600, borderRadius: 44, background: '#0b0b0d', boxShadow: '0 0 0 2px #2a2a31, 0 40px 90px rgba(0,0,0,0.4)', opacity: ramp(f, (P.THREE_STEPS as unknown as number[])[7], 14), transform: `translateY(${(1 - ramp(f, (P.THREE_STEPS as unknown as number[])[7], 20, EASE.FAST_LOCK)) * 80}px)`}}>
					<div style={{position: 'absolute', left: 10, top: 10, width: 380, height: 796, transform: 'scale(0.737)', transformOrigin: '0 0', borderRadius: 46, overflow: 'hidden'}}>
						<MobileSite theme={BELLA_THEME} c={BELLA} />
					</div>
				</div>
			</StageCard>

			{/* ── STAGE 4: send it ── */}
			<StageCard t={s(3)} out={so(3)}>
				<div style={{position: 'absolute', left: 300, top: 0, width: 380, height: 760, borderRadius: 56, background: '#0b0b0d', boxShadow: '0 0 0 3px #2a2a31, 0 50px 120px rgba(40,20,20,0.35)'}}>
					<div style={{position: 'absolute', left: 14, top: 14, right: 14, bottom: 14, borderRadius: 44, overflow: 'hidden', background: '#ece5dd'}}>
						<div style={{height: 90, background: '#1f2c34', display: 'flex', alignItems: 'flex-end', padding: '0 20px 14px', gap: 12}}>
							<div style={{width: 40, height: 40, borderRadius: 20, background: '#b4532a', color: '#fff', fontFamily: FONT.sans, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>B</div>
							<div style={{fontFamily: FONT.sans, fontSize: 20, fontWeight: 700, color: '#fff'}}>Bella Forno</div>
						</div>
						<div style={{position: 'absolute', right: 14, top: 120, width: 290, borderRadius: '18px 18px 4px 18px', background: '#d9fdd3', padding: 10, boxShadow: '0 2px 2px rgba(0,0,0,0.08)', transform: `translateY(${(1 - ramp(f, P.STEP4 + 10, 18, EASE.FAST_LOCK)) * 60}px)`, opacity: ramp(f, P.STEP4 + 10, 10)}}>
							<div style={{width: 270, height: 170, borderRadius: 12, overflow: 'hidden', position: 'relative'}}>
								<div style={{position: 'absolute', left: 0, top: 0, width: SITE_W, height: SITE_H, transform: 'scale(0.3)', transformOrigin: '0 0'}}>
									<Website f={1e6} steps={[0, 0, 0, 0, 0, 0, 0, 0]} theme={BELLA_THEME} c={BELLA} />
								</div>
							</div>
							<div style={{fontFamily: FONT.sans, fontSize: 15, fontWeight: 700, color: '#111', marginTop: 8}}>bellaforno-preview.site</div>
							<div style={{fontFamily: FONT.sans, fontSize: 16, color: '#222', marginTop: 4, lineHeight: 1.35}}>Hi! I made you a quick preview — mobile-first, with online booking.</div>
							<div style={{textAlign: 'right', fontFamily: FONT.sans, fontSize: 13, color: f >= P.FOUR_SENT ? '#34b7f1' : '#888', marginTop: 4}}>11:52 PM ✓✓</div>
						</div>
					</div>
				</div>
				<div style={{position: 'absolute', left: 720, top: 300, opacity: ramp(f, P.FOUR_SENT, 10), transform: `scale(${ramp(f, P.FOUR_SENT, 14, EASE.OVERSHOOT)}) rotate(-6deg)`}}>
					<Big text="Sent." size={110} color={INK} />
				</div>
			</StageCard>

			{/* ── CONTRAST: 3 & 4 take minutes, 1 & 2 take all night ── */}
			{f >= P.KNEW && f < P.LOGO + 6 && (
				<div style={{position: 'absolute', left: STAGE.x, top: STAGE.y + 120, width: STAGE.w, opacity: 1 - ramp(f, P.MERGE - 6, 12, EASE.EXIT)}}>
					<div style={{opacity: ramp(f, P.KNEW + 8, 12) * lerp(1, 0.35, nights), transform: `translateY(${(1 - ramp(f, P.KNEW + 8, 18, EASE.FAST_LOCK)) * 40}px)`}}>
						<div style={{fontFamily: FONT.sans, fontSize: 40, fontWeight: 700, color: 'rgba(22,19,26,0.55)'}}>Steps 3 + 4</div>
						<Big text="40" accent="minutes." size={170} color={INK} accentColor={INK} />
					</div>
					{nights > 0 && (
						<div style={{marginTop: 50, opacity: nights, transform: `translateY(${(1 - nights) * 40}px)`}}>
							<div style={{fontFamily: FONT.sans, fontSize: 40, fontWeight: 700, color: C.accentDeep}}>Steps 1 + 2</div>
							<Chroma f={f} hits={[P.NIGHTS_HIT]}>
								<Big text="all" accent="night." size={170} color={INK} />
							</Chroma>
						</div>
					)}
				</div>
			)}

			{/* ── BRAND: the missing piece ── */}
			{logoT > 0 && f < P.TAG1 + 4 && (
				<div style={{position: 'absolute', left: STAGE.x, top: STAGE.y, width: STAGE.w, height: STAGE.h, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: logoT * (1 - ramp(f, P.TAG1 - 10, 10))}}>
					<div style={{transform: `scale(${lerp(0.7, 1, logoT)})`, clipPath: `inset(${(1 - logoT) * 50}% round 30px)`}}>
						<Logo size={220} />
					</div>
					<div style={{marginTop: 30}}>
						<Letters f={f} inAt={P.LOGO + 6} text="Prospectify" size={110} color={INK} stagger={1.3} />
					</div>
					<div style={{marginTop: 22, fontFamily: FONT.sans, fontSize: 40, fontWeight: 650, color: 'rgba(22,19,26,0.7)', opacity: ramp(f, P.ONE_SEARCH, 12)}}>
						Steps 1 + 2. <span style={{fontStyle: 'italic', color: C.accent, fontWeight: 750}}>In one search.</span>
					</div>
				</div>
			)}

			{/* ── TAGLINE ── */}
			{tag && tagOut < 1 && (
				<div style={{position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: 1 - tagOut, transform: `scale(${lerp(1, 1.04, ramp(f, P.TAG1, 100, EASE.SOFT))})`}}>
					{Array.from({length: 9}).map((_, i) => {
						const t = ramp(f, P.TAG1 + i * 2, 50, EASE.SOFT);
						return (
							<div key={i} style={{position: 'absolute', left: 300 + rand(i * 4.4) * 1300, top: 160 + rand(i * 2.2) * 760, transform: `translateY(${t * 500}px) rotate(${(rand(i) - 0.5) * 40 * t}deg)`, opacity: 1 - t, filter: `blur(${t * 6}px)`}}>
								<TabChip label={['Maps – restaurants', 'Reviews (312)', 'who owns…?', 'email?', 'prospects_v3.xlsx', 'Instagram', 'Yelp', 'Sheet2', 'LinkedIn'][i]} dot={['#34a853', '#fbbc04', '#4285f4', '#4285f4', '#188038', '#e1306c', '#d32323', '#188038', '#0a66c2'][i]} />
							</div>
						);
					})}
					<Chroma f={f} hits={[P.TAG1]}>
						<Letters f={f} inAt={P.TAG1} text="Fewer tabs." size={200} color={INK} stagger={1.4} />
					</Chroma>
					<div style={{marginTop: 10}}>
						<Letters f={f} inAt={P.TAG2} text="More clients." size={200} color={C.accent} italic weight={760} stagger={1.4} />
					</div>
				</div>
			)}

			{/* ── CTA ── */}
			{ctaT > 0 && (
				<div style={{position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', transform: `scale(${lerp(1, 1.07, ramp(f, P.CTA, P.durationInFrames - P.CTA, EASE.SOFT))})`}}>
					<div style={{display: 'flex', alignItems: 'center', gap: 24, opacity: ctaT, transform: `translateY(${(1 - ctaT) * 30}px)`}}>
						<Logo size={110} />
						<div style={{fontFamily: FONT.sans, fontSize: 120, fontWeight: 800, letterSpacing: '-0.05em', color: INK}}>Prospectify</div>
					</div>
					<div style={{position: 'relative', marginTop: 50, width: 560, opacity: ramp(f, P.CTA + 6, 14), transform: `scale(${lerp(0.94, 1, ramp(f, P.CTA + 6, 18, EASE.FAST_LOCK))})`}}>
						<div style={{transform: `scale(${1 - 0.05 * Math.sin(Math.PI * clamp01((f - P.URL - 34) / 10))})`, boxShadow: `0 0 0 ${ramp(f, P.URL + 38, 30) * 60}px rgba(244,37,98,${0.25 * (1 - ramp(f, P.URL + 38, 30))})`, borderRadius: 999}}>
							<GradButton label="Start free" h={110} fs={46} sheen={clamp01((f - P.CTA - 24) / 40)} />
						</div>
						{/* the viewer's cursor arrives and clicks */}
						{f > P.URL + 6 && (
							<svg width={54} height={54} viewBox="0 0 24 24" style={{position: 'absolute', left: lerp(900, 340, ramp(f, P.URL + 6, 28, EASE.CAMERA)), top: lerp(520, 70, ramp(f, P.URL + 6, 28, EASE.CAMERA)), transform: `scale(${1 - 0.15 * Math.sin(Math.PI * clamp01((f - P.URL - 34) / 10))})`, filter: 'drop-shadow(0 6px 10px rgba(0,0,0,0.3))'}}>
								<path d="M4 2 L4 19 L8.5 14.8 L11.5 21.5 L14.3 20.3 L11.3 13.7 L17.5 13.7 Z" fill="#16131a" stroke="#fff" strokeWidth={1.4} strokeLinejoin="round" />
							</svg>
						)}
					</div>
					<div style={{marginTop: 26, fontFamily: FONT.sans, fontSize: 30, fontWeight: 600, color: 'rgba(22,19,26,0.65)', opacity: ramp(f, P.CTA_SUB, 14)}}>3 real leads free · No card required</div>
					<div style={{marginTop: 10, fontFamily: FONT.sans, fontSize: 34, fontWeight: 750, color: INK, opacity: ramp(f, P.URL, 14)}}>prospectify.net</div>
				</div>
			)}
		</div>
	);
};
