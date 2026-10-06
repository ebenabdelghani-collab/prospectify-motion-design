import React from 'react';
import {Img, staticFile} from 'remotion';
import {C, EASE, FONT, clamp01, lerp, rand, ramp} from '../../final/tokens';
import {Logo} from '../../final/kit/ui';
import {Icon} from '../../final/kit/icons';
import {Photo} from '../../final/kit/media';
import {GF, BrandBG, Chroma, Clock, Kword, P, SideLabel, W, appear, gone} from '../fx';
import {Chrome, Laptop, Phone} from '../devices';
import {MobileSite, PremiumSite, SITE_DW} from '../site';
import {APP_H, APP_W, BUILDERS, MESSAGES, PROMPT, ProspectifyApp} from '../app';

/* ───────────────────────────── TURN: rewind the night ───────────────────────────── */
export const Turn: React.FC<{f: number}> = ({f}) => {
	if (f < P.T_IN - 2 || f > P.F_IN + 20) return null;
	const rw = ramp(f, P.T_IN, P.T_WITH - P.T_IN, EASE.CAMERA); // 2:07 AM → 11:46 PM
	const mins = lerp(26 * 60 + 7, 23 * 60 + 46, rw);
	const flood = ramp(f, P.T_WITH - 6, 16, EASE.FAST_LOCK);
	const out = gone(f, P.F_IN - 8, 14);
	const streak = f < P.T_WITH ? 1 : 1 - flood;
	return (
		<div style={{position: 'absolute', inset: 0, opacity: 1 - out}}>
			<div style={{position: 'absolute', inset: 0, background: '#06080c'}} />
			<BrandBG f={f} o={flood} glow={1.3} />
			{/* rewind streaks */}
			{streak > 0 &&
				Array.from({length: 14}).map((_, i) => (
					<div key={i} style={{position: 'absolute', left: 0, right: 0, top: (rand(i * 3.1 + Math.floor(f / 2)) * 1080) | 0, height: 2 + rand(i) * 4, background: 'rgba(200,215,235,0.18)', opacity: streak * rand(i + f)}} />
				))}
			<div style={{position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
				<div style={{transform: `scale(${lerp(1, 0.55, flood)}) translateY(${flood * -190}px)`, opacity: lerp(1, 0.9, flood)}}>
					<Chroma f={f} hits={[P.T_IN + 2, P.T_IN + 16, P.T_WITH]}>
						<Clock mins={mins} size={250} color={flood > 0.5 ? C.text : '#dfe6ef'} apColor={flood > 0.5 ? C.accent : '#7d8896'} />
					</Chroma>
				</div>
				<div style={{marginTop: -70, opacity: flood, transform: `scale(${lerp(0.8, 1, flood)})`}}>
					<div style={{display: 'flex', alignItems: 'center', gap: 34}}>
						<Logo size={150} />
						<div style={{fontFamily: GF, fontSize: 150, fontWeight: 800, letterSpacing: '-0.05em', color: C.text}}>Prospectify</div>
					</div>
				</div>
				<div style={{marginTop: 26, fontFamily: GF, fontWeight: 800, fontSize: 34, letterSpacing: '0.22em', color: C.text2, opacity: appear(f, P.T_SAME, 12)}}>SAME NIGHT. <span style={{background: C.grad, WebkitBackgroundClip: 'text', color: 'transparent'}}>DIFFERENT TOOL.</span></div>
			</div>
		</div>
	);
};

/* ───────────────────────────── WITH: the mechanism ───────────────────────────── */
// camera over the app (virtual 1600×1000 shown at scale s, centred on (cx, cy) in app px)
type Cam = [number, number, number, number]; // frame, cx, cy, scale
const camAt = (f: number, keys: Cam[]) => {
	let i = 0;
	while (i < keys.length - 1 && f >= keys[i + 1][0]) i++;
	const a = keys[i];
	const b = keys[Math.min(i + 1, keys.length - 1)];
	const t = b[0] === a[0] ? 1 : EASE.CAMERA(clamp01((f - a[0]) / Math.min(30, b[0] - a[0])));
	return {cx: lerp(a[1], b[1], t), cy: lerp(a[2], b[2], t), s: lerp(a[3], b[3], t)};
};

const ProofChip: React.FC<{f: number; at: number; label: string; icon: string}> = ({f, at, label, icon}) => {
	const t = appear(f, at, 14);
	if (t <= 0) return null;
	return (
		<div style={{display: 'flex', alignItems: 'center', gap: 14, height: 76, padding: '0 28px 0 18px', borderRadius: 22, background: 'rgba(22,22,26,0.92)', border: `1.5px solid rgba(${C.accentRGB},0.45)`, boxShadow: `0 20px 50px rgba(0,0,0,0.5), 0 0 40px rgba(${C.accentRGB},0.18)`, fontFamily: GF, fontSize: 32, fontWeight: 800, color: C.text, letterSpacing: '-0.02em', opacity: t, transform: `translateY(${(1 - t) * 30}px) scale(${lerp(0.9, 1, t)})`, backdropFilter: 'blur(14px)'}}>
			<div style={{width: 46, height: 46, borderRadius: 14, background: C.grad, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
				<Icon n={icon} size={26} color="#fff" sw={2.6} />
			</div>
			{label}
		</div>
	);
};

export const With: React.FC<{f: number}> = ({f}) => {
	if (f < P.F_IN - 4 || f > P.RC_IN + 20) return null;
	const inT = appear(f, P.F_IN - 4, 16);
	const appOut = ramp(f, P.TL_IN - 4, 22, EASE.CAMERA);
	const cam = camAt(f, [
		[P.F_IN, 800, 500, 0.98],
		[P.F_ROWS, 760, 380, 1.18],
		[P.F_SCORE, 800, 500, 0.98],
		[P.R_IN, 1290, 420, 1.3],
		[P.P_IN, 1290, 420, 1.3],
		[P.TL_IN, 1290, 420, 1.3],
	]);
	const keys = {
		searchKeys: P.F_KEYS as unknown as number[],
		scan: P.F_SCAN,
		rows: P.F_ROWS_EACH as unknown as number[],
		select: P.F_SCORE,
		panel: P.F_SCORE + 4,
		tab: [P.F_SCORE + 4, P.R_IN, P.P_IN] as [number, number, number],
		channel: [P.R_WA, P.R_EMAIL, P.R_PHONE] as [number, number, number],
		copy: P.R_COPY,
		tool: P.P_TOOL,
		promptType: [P.P_TYPE0, P.P_TYPE1] as [number, number],
		ready: P.P_READY,
	};
	// tools + build
	const tl = appear(f, P.TL_IN, 16);
	const buildB = clamp01((f - P.TL_PASTE) / (P.D_IN + 30 - P.TL_PASTE));
	const devicesT = appear(f, P.TL_PASTE - 4, 22);
	const out = gone(f, P.RC_IN - 6, 14);
	const lw = 1050;
	const sc = (lw - 2 * lw * 0.018) / SITE_DW;
	return (
		<div style={{position: 'absolute', inset: 0, opacity: inT * (1 - out)}}>
			<BrandBG f={f} gx={lerp(50, 62, appOut)} />
			<SideLabel f={f} at={P.TL_IN + 10} out={P.RC_IN} with />
			{/* the app, framed by a camera */}
			{appOut < 1 && (
				<div style={{position: 'absolute', left: 0, top: 0, width: W, height: 1080, overflow: 'hidden', opacity: 1 - appOut}}>
					<div
						style={{
							position: 'absolute',
							left: W / 2 - cam.cx,
							top: 560 - cam.cy,
							width: APP_W,
							height: APP_H,
							transform: `scale(${cam.s * lerp(1, 0.8, appOut)})`,
							transformOrigin: `${cam.cx}px ${cam.cy}px`,
							borderRadius: 26,
							overflow: 'hidden',
							border: `1.5px solid ${C.lineStrong}`,
							boxShadow: '0 60px 160px rgba(0,0,0,0.7)',
						}}
					>
						<ProspectifyApp f={f} k={keys} />
					</div>
				</div>
			)}
			{/* proof chips, bottom-left: the three things it does */}
			<div style={{position: 'absolute', left: 72, bottom: 64, display: 'flex', gap: 18, opacity: 1 - appOut}}>
				<ProofChip f={f} at={P.F_SCORE + 6} label="Client found" icon="target" />
				<ProofChip f={f} at={P.R_IN + 6} label="Outreach written" icon="message" />
				<ProofChip f={f} at={P.P_IN + 6} label="Site prompt ready" icon="sparkles" />
			</div>
			{/* TOOLS: paste into the builder you use → premium site on laptop + phone */}
			{tl > 0 && (
				<div style={{position: 'absolute', inset: 0}}>
					<div style={{position: 'absolute', left: 0, right: 0, top: 70, display: 'flex', justifyContent: 'center', gap: 22, opacity: tl * (1 - appear(f, P.D_IN - 6, 14)), transform: `translateY(${(1 - tl) * -30}px)`}}>
						{BUILDERS.map((b, i) => {
							const t = appear(f, P.TL_IN + (P.TL_LOGOS as unknown as number[])[i] - P.TL_IN, 12);
							return (
								<div key={b.n} style={{height: 84, padding: '0 30px', borderRadius: 24, background: C.surface2, border: `1.5px solid ${i === 0 ? C.accent : C.lineStrong}`, display: 'flex', alignItems: 'center', gap: 14, opacity: t, transform: `scale(${lerp(0.8, 1, t)})`}}>
									<Img src={staticFile(b.src)} style={{width: b.w * 1.4, height: b.h * 1.4}} />
									{!b.word && <span style={{fontFamily: GF, fontSize: 30, fontWeight: 800, color: C.text}}>{b.n}</span>}
								</div>
							);
						})}
						<div style={{height: 84, padding: '0 26px', borderRadius: 24, background: C.grad, display: 'flex', alignItems: 'center', fontFamily: GF, fontSize: 30, fontWeight: 800, color: '#fff', opacity: appear(f, P.TL_PASTE - 8, 10), transform: `scale(${f >= P.TL_PASTE && f < P.TL_PASTE + 6 ? 0.92 : 1})`}}>⌘V Paste prompt</div>
					</div>
					<div style={{position: 'absolute', left: 0, right: 0, top: 168, textAlign: 'center', fontFamily: GF, fontSize: 18, fontWeight: 600, color: C.text3, opacity: tl * (1 - appear(f, P.D_IN - 6, 14))}}>Use the builder you already use · No affiliation implied</div>
					{/* laptop */}
					<div style={{position: 'absolute', left: 170, top: 250, opacity: devicesT, transform: `translateY(${(1 - devicesT) * 80}px) scale(${lerp(0.92, 1, devicesT)})`}}>
						<Laptop w={lw} rotY={8} rotX={4} glare={lerp(0.1, 0.9, (f - P.TL_PASTE) / 200)}>
							<Chrome url="bellaforno.com" h={38}>
								<div style={{transform: `scale(${sc})`, transformOrigin: '0 0'}}>
									<PremiumSite b={buildB} f={f - P.TL_PASTE} scroll={lerp(0, 820, ramp(f, P.D_IN + 10, 90, EASE.SOFT))} />
								</div>
							</Chrome>
						</Laptop>
					</div>
					{/* phone */}
					<div style={{position: 'absolute', left: 1290, top: 200, opacity: devicesT, transform: `translateY(${(1 - appear(f, P.TL_PASTE + 6, 26)) * 120}px)`}}>
						<Phone w={390} rotY={-14} rotX={4} rotZ={2} glare={lerp(0.0, 1.0, (f - P.TL_PASTE) / 160)} time="11:52">
							<div style={{position: 'absolute', inset: 0, overflow: 'hidden'}}>
								{f < P.D_SEND ? (
									<MobileSite b={clamp01((f - P.TL_PASTE - 8) / (P.D_IN + 20 - P.TL_PASTE))} f={f - P.TL_PASTE} scroll={lerp(0, 260, ramp(f, P.D_IN, 60, EASE.SOFT))} />
								) : (
									<WhatsAppSend f={f} />
								)}
							</div>
						</Phone>
					</div>
					{/* DONE: three locks */}
					<div style={{position: 'absolute', left: 0, right: 0, top: 70, display: 'flex', justifyContent: 'center', gap: 22}}>
						<ProofChip f={f} at={P.D_FOUND} label="Client found" icon="check" />
						<ProofChip f={f} at={P.D_READY} label="Message ready" icon="check" />
						<ProofChip f={f} at={P.D_BUILT} label="Site built" icon="check" />
					</div>
				</div>
			)}
		</div>
	);
};

/** Phone: the outreach message goes out with the site preview link. */
const WhatsAppSend: React.FC<{f: number}> = ({f}) => {
	const t = appear(f, P.D_SEND, 14);
	const sent = f >= P.D_SEND + 22;
	return (
		<div style={{position: 'absolute', inset: 0, background: '#0b141a', fontFamily: GF}}>
			<div style={{height: 140, background: '#1f2c34', display: 'flex', alignItems: 'flex-end', padding: '0 18px 14px', gap: 12}}>
				<Photo n="pizza_4" w={44} h={44} r={22} />
				<div style={{color: '#e9edef', fontSize: 19, fontWeight: 700}}>
					Bella Forno
					<div style={{fontSize: 13, color: '#8696a0', fontWeight: 500}}>online</div>
				</div>
			</div>
			<div style={{position: 'absolute', right: 12, top: 170, width: 300, borderRadius: 14, background: '#005c4b', overflow: 'hidden', opacity: t, transform: `translateY(${(1 - t) * 40}px) scale(${lerp(0.9, 1, t)})`, transformOrigin: '100% 100%'}}>
				<div style={{margin: 6, borderRadius: 10, overflow: 'hidden', background: '#0f0b09'}}>
					<Img src={staticFile('final/photos/oven_3.jpg')} style={{width: '100%', height: 120, objectFit: 'cover'}} />
					<div style={{padding: '8px 10px', color: '#f7efe6', fontSize: 14, fontWeight: 800}}>
						Bella Forno — Real fire. Real dough.
						<div style={{fontSize: 12, color: 'rgba(247,239,230,0.6)', fontWeight: 600, marginTop: 2}}>bellaforno.com · preview</div>
					</div>
				</div>
				<div style={{padding: '4px 12px 10px', color: '#e9edef', fontSize: 15, lineHeight: 1.35}}>
					{MESSAGES.whatsapp.slice(0, 118)}…
					<div style={{textAlign: 'right', fontSize: 12, color: sent ? '#53bdeb' : '#8696a0', marginTop: 4}}>11:53 PM {sent ? '✓✓' : '✓'}</div>
				</div>
			</div>
		</div>
	);
};

export const unused = [PROMPT, Kword];
