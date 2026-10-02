import React from 'react';
import {AbsoluteFill, Audio, Img, staticFile, useCurrentFrame} from 'remotion';
import {CameraMotionBlur} from '@remotion/motion-blur';
import B from './beats.json';
import {COLORS, EASE, FONTS} from '../constants/theme';
import {Grain, Vignette} from '../fx/camera';
import {clamp01, lerp, ramp, rand} from '../motion/anim';

/*
 * PROSPECTIFY — MORPH
 * One object. It never cuts: a prompt bar becomes a switch, the switch becomes light,
 * the light becomes words, the words become a client, the client becomes the brand.
 */

const ACC = COLORS.accent;
const backOut = (c = 1.5) => (t: number) => 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2);
const W = 1080;
const H = 1920;
const CX = W / 2;
const CY = 960;

// ── Motion-blur windows (fast moves only: real multi-sample blur, like a camera shutter) ──
const BLUR: [number, number][] = [
	[B.BAR_IN - 2, B.BAR_IN + 14],
	[B.SEND - 2, B.TOGGLE_READY + 6],
	...B.PILL.map((p) => [p - 2, p + 14] as [number, number]),
	[B.WHIP - 2, B.STREAKS_END],
	...B.WORDS.slice(1).map(([at]) => [(at as number) - 10, (at as number) + 12] as [number, number]),
	[B.SQUASH - 2, B.CARD_POP + 30],
	[B.CARD_COLLAPSE - 2, B.BURST + 40],
	[B.SLIDE - 2, B.SLIDE + 24],
	[B.FADE_BLACK - 4, B.FADE_BLACK + 20],
	[B.WORDMARK - 2, B.WORDMARK + 56],
];
const inBlur = (f: number) => BLUR.some(([a, b]) => f >= a && f <= b);

// ─────────────────────────────── light ───────────────────────────────
const Bloom: React.FC<{x: number; y: number; r: number; o: number; color?: string}> = ({x, y, r, o, color = '230,63,109'}) =>
	o <= 0.002 ? null : (
		<div style={{position: 'absolute', left: x - r, top: y - r, width: r * 2, height: r * 2, borderRadius: '50%', background: `radial-gradient(circle, rgba(${color},${0.55 * o}) 0%, rgba(${color},${0.18 * o}) 32%, rgba(${color},0) 70%)`, mixBlendMode: 'screen', pointerEvents: 'none'}} />
	);

const Ambient: React.FC = () => {
	const f = useCurrentFrame();
	const blackOut = ramp(f, B.FADE_BLACK, 18, EASE.exit) * (1 - ramp(f, B.MARK - 10, 30));
	const send = Math.max(0, 1 - Math.abs(f - (B.SEND + 22)) / 26);
	const word = B.WORDS.reduce((m, [at]) => Math.max(m, Math.max(0, 1 - Math.abs(f - (at as number) - 4) / 22)), 0);
	const cta = f >= B.SLIDE ? (0.55 + 0.25 * Math.sin((f - B.SLIDE) / 14)) * ramp(f, B.SLIDE, 20) : 0;
	const end = ramp(f, B.MARK - 6, 40);
	return (
		<AbsoluteFill style={{opacity: 1 - blackOut}}>
			<AbsoluteFill style={{background: 'radial-gradient(90% 55% at 50% 50%, #0E0D12 0%, #050505 70%)'}} />
			<Bloom x={CX} y={CY} r={760} o={0.22 + send * 0.9} />
			<Bloom x={CX} y={CY} r={520} o={word * 0.8} color="236,90,130" />
			{cta > 0 && f < B.FADE_BLACK + 20 && (
				<>
					<Bloom x={CX + 160 + Math.sin(f / 23) * 120} y={CY - 140 + Math.cos(f / 31) * 90} r={420} o={cta} color="150,40,120" />
					<Bloom x={CX - 120 + Math.cos(f / 27) * 140} y={CY + 170 + Math.sin(f / 19) * 80} r={380} o={cta * 0.9} />
				</>
			)}
			<Bloom x={CX} y={760} r={700} o={end * 0.55} />
		</AbsoluteFill>
	);
};

// ─────────────────────────────── icons ───────────────────────────────
const I = {
	plus: <path d="M12 5v14M5 12h14" />,
	pin: (
		<>
			<path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21Z" />
			<circle cx={12} cy={9.5} r={2.4} />
		</>
	),
	sliders: <path d="M4 7h10M18 7h2M4 17h4M12 17h8M14 4v6M8 14v6" />,
	globe: (
		<>
			<circle cx={12} cy={12} r={8.5} />
			<path d="M3.5 12h17M12 3.5c3 3.2 3 13.8 0 17M12 3.5c-3 3.2-3 13.8 0 17" />
		</>
	),
	mic: <path d="M12 4a3 3 0 0 1 3 3v5a3 3 0 0 1-6 0V7a3 3 0 0 1 3-3ZM6 11a6 6 0 0 0 12 0M12 17v3" />,
	check: <path d="M5 12.5l4.5 4.5L19 7.5" />,
};
const Icon: React.FC<{d: React.ReactNode; s?: number; c?: string; w?: number}> = ({d, s = 34, c = 'rgba(244,244,246,0.62)', w = 1.9}) => (
	<svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round">
		{d}
	</svg>
);

const Cursor: React.FC<{x: number; y: number; s?: number; o?: number}> = ({x, y, s = 1, o = 1}) => (
	<svg width={52} height={52} viewBox="0 0 28 28" style={{position: 'absolute', left: x - 6, top: y - 4, transform: `scale(${s})`, transformOrigin: '6px 4px', opacity: o, filter: 'drop-shadow(0 6px 14px rgba(0,0,0,0.6))', zIndex: 40}}>
		<path d="M6 4 L6 22 L10.6 17.8 L13.6 24.4 L16.6 23.1 L13.7 16.7 L19.8 16.7 Z" fill="#F4F4F6" stroke="#050505" strokeWidth={1.4} strokeLinejoin="round" />
	</svg>
);

const press = (f: number, at: number) => (f < at - 3 || f > at + 9 ? 1 : f <= at ? lerp(1, 0.9, (f - (at - 3)) / 3) : lerp(0.9, 1, EASE.snap((f - at) / 9)));

const path2 = (f: number, pts: [number, number, number][]) => {
	if (f <= pts[0][0]) return {x: pts[0][1], y: pts[0][2]};
	for (let i = 0; i < pts.length - 1; i++) {
		const [a, ax, ay] = pts[i];
		const [b, bx, by] = pts[i + 1];
		if (f <= b) {
			const t = EASE.glide(clamp01((f - a) / (b - a)));
			return {x: lerp(ax, bx, t), y: lerp(ay, by, t)};
		}
	}
	const z = pts[pts.length - 1];
	return {x: z[1], y: z[2]};
};

// ─────────────────── 1–2. THE OBJECT: prompt bar → tilt → switch → whip ───────────────────
const BAR = {w: 900, h: 236, r: 38};
const TOG = {w: 760, h: 150, r: 75};
const OPTIONS = ['Dentists', 'Plumbers', 'Roofers'];

const TheObject: React.FC = () => {
	const f = useCurrentFrame();
	if (f < B.BAR_IN || f > B.WHIP + 30) return null;

	const inT = ramp(f, B.BAR_IN, 22, backOut(1.2));
	// tilt away like a page being sent, then the same slab lands as a switch
	const tilt = ramp(f, B.SEND + 2, B.TILT_END - B.SEND - 2, EASE.exit);
	const land = ramp(f, B.TOGGLE_MORPH, B.TOGGLE_READY - B.TOGGLE_MORPH, backOut(1.7));
	const morph = ramp(f, B.TOGGLE_MORPH - 6, 22, EASE.snap);
	const rx = f < B.TOGGLE_MORPH ? tilt * 66 : lerp(66, 0, land);
	const z = f < B.TOGGLE_MORPH ? tilt * 340 : lerp(340, 0, land);
	const lift = f < B.TOGGLE_MORPH ? -tilt * 240 : lerp(-240, 0, land);
	const w = lerp(BAR.w, TOG.w, morph);
	const h = lerp(BAR.h, TOG.h, morph);
	const r = lerp(BAR.r, TOG.r, morph);

	// whip: accelerate right, stretch, vanish into light
	const whip = ramp(f, B.WHIP, 16, EASE.exit);
	const wx = whip * 1500;
	const stretch = 1 + whip * 0.9;

	const typed = B.TYPE_TEXT.slice(0, Math.max(0, Math.min(B.TYPE_TEXT.length, Math.floor((f - B.TYPE_START) / B.TYPE_STEP) + 1)));
	const typing = f >= B.TYPE_START && f < B.TYPE_START + B.TYPE_TEXT.length * B.TYPE_STEP + 6;
	const caret = typing || Math.floor(f / 16) % 2 === 0;
	const barContent = 1 - ramp(f, B.SEND + 10, 14);
	const togContent = ramp(f, B.TOGGLE_MORPH + 6, 14);

	// menu
	const menuOpen = ramp(f, B.CHIP_OPEN, 12, backOut(1.3)) * (1 - ramp(f, B.MENU_SELECT + 8, 9, EASE.exit));
	const hover = f < B.MENU_HOVERS[0] ? -1 : f < B.MENU_HOVERS[1] ? 0 : 1;
	const chosen = f >= B.MENU_SELECT;
	const sendHot = f >= B.SEND - 14;

	// pill
	const pi = B.PILL.filter((p) => f >= p).length - 1;
	const pillFrom = Math.max(0, pi - 1);
	const pillT = pi < 0 ? 0 : pi === 0 ? 1 : ramp(f, B.PILL[pi], 13, backOut(1.1));
	const slot = (k: number) => -TOG.w / 2 + 12 + k * ((TOG.w - 24) / 3);
	const pillX = pi <= 0 ? slot(0) : lerp(slot(pillFrom), slot(pi), pillT);
	const pillIn = ramp(f, B.PILL[0], 14, backOut(1.6));
	const pillStretch = pi > 0 ? 1 + Math.sin(clamp01((f - B.PILL[pi]) / 13) * Math.PI) * 0.35 : 1;

	// cursor
	const cur = path2(f, [
		[B.CHIP_OPEN - 22, 760, 1260],
		[B.CHIP_OPEN - 2, 440, 1012],
		[B.MENU_HOVERS[0], 470, 1137],
		[B.MENU_HOVERS[1], 470, 1203],
		[B.MENU_SELECT, 472, 1205],
		[B.SEND - 4, 921, 1012],
	]);
	const curOn = f >= B.CHIP_OPEN - 22 && f < B.SEND + 10;

	return (
		<AbsoluteFill style={{perspective: 1700, perspectiveOrigin: `${CX}px ${CY - 60}px`}}>
			<div
				style={{
					position: 'absolute',
					left: CX - w / 2,
					top: CY - h / 2,
					width: w,
					height: h,
					transformStyle: 'preserve-3d',
					transform: `translate3d(${wx}px, ${lift + (1 - inT) * 60}px, ${z}px) rotateX(${rx}deg) scale(${lerp(0.9, 1, inT) * stretch}, ${lerp(0.9, 1, inT) / Math.sqrt(stretch)})`,
					opacity: Math.min(1, inT * 1.4) * (1 - ramp(f, B.WHIP + 10, 8)),
					filter: inT < 0.98 ? `blur(${(1 - inT) * 16}px)` : undefined,
				}}
			>
				{/* glass slab */}
				<div
					style={{
						position: 'absolute',
						inset: 0,
						borderRadius: r,
						background: 'linear-gradient(180deg, rgba(44,43,52,0.94) 0%, rgba(22,22,28,0.96) 100%)',
						border: '1.5px solid rgba(255,255,255,0.13)',
						boxShadow: `inset 0 1.5px 0 rgba(255,255,255,0.14), 0 40px 120px rgba(0,0,0,0.65), 0 0 ${60 + tilt * 140}px rgba(230,63,109,${0.12 + tilt * 0.4})`,
						overflow: 'hidden',
					}}
				>
					{/* specular sweep as it tilts */}
					<div style={{position: 'absolute', top: '-40%', bottom: '-40%', width: 260, left: `${lerp(-30, 120, tilt)}%`, background: 'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.16) 50%, rgba(255,255,255,0) 100%)', transform: 'skewX(-22deg)', opacity: tilt > 0 && tilt < 1 ? 1 : 0}} />

					{/* ─ bar content ─ */}
					{barContent > 0 && (
						<div style={{position: 'absolute', inset: 0, opacity: barContent}}>
							<div style={{position: 'absolute', left: 44, top: 40, right: 44, fontFamily: FONTS.sans, fontSize: 44, fontWeight: 480, letterSpacing: '-0.02em', color: f < B.TYPE_START ? 'rgba(244,244,246,0.42)' : COLORS.text, whiteSpace: 'pre', display: 'flex', alignItems: 'center', height: 56}}>
								{f < B.TYPE_START ? 'Ask Prospectify…' : typed}
								{f >= B.TYPE_START && <span style={{display: 'inline-block', width: 4, height: 48, marginLeft: 4, borderRadius: 2, background: ACC, opacity: caret ? 1 : 0}} />}
							</div>
							<div style={{position: 'absolute', left: 36, right: 30, bottom: 30, height: 78, display: 'flex', alignItems: 'center', gap: 26}}>
								<Icon d={I.plus} />
								<Icon d={I.globe} />
								<Icon d={I.sliders} />
								{/* niche chip (this is the "model picker") */}
								<div
									style={{
										display: 'flex',
										alignItems: 'center',
										gap: 10,
										height: 58,
										padding: '0 20px',
										borderRadius: 29,
										background: menuOpen > 0.05 ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.06)',
										border: '1.5px solid rgba(255,255,255,0.10)',
										fontFamily: FONTS.sans,
										fontSize: 28,
										fontWeight: 560,
										color: COLORS.text,
										transform: `scale(${press(f, B.CHIP_OPEN)})`,
									}}
								>
									<Icon d={I.pin} s={26} c={ACC} w={2.2} />
									Austin · {chosen ? 'Plumbers' : 'Niche'}
									<span style={{color: 'rgba(244,244,246,0.5)', fontSize: 22}}>▾</span>
								</div>
								<div style={{flex: 1}} />
								<Icon d={I.mic} />
								<div
									style={{
										width: 78,
										height: 78,
										borderRadius: 39,
										background: sendHot ? COLORS.text : 'rgba(255,255,255,0.14)',
										display: 'flex',
										alignItems: 'center',
										justifyContent: 'center',
										transform: `scale(${press(f, B.SEND)})`,
										boxShadow: sendHot ? `0 0 ${30 + Math.max(0, 1 - Math.abs(f - B.SEND) / 12) * 50}px rgba(230,63,109,0.55)` : 'none',
									}}
								>
									<svg width={36} height={36} viewBox="0 0 24 24">
										<path d="M12 19V5M5.5 11.5 12 5l6.5 6.5" fill="none" stroke={sendHot ? '#050505' : 'rgba(244,244,246,0.5)'} strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" />
									</svg>
								</div>
							</div>
						</div>
					)}

					{/* ─ switch content ─ */}
					{togContent > 0 && (
						<div style={{position: 'absolute', inset: 0, opacity: togContent}}>
							<div
								style={{
									position: 'absolute',
									left: TOG.w / 2 + pillX - (pillStretch - 1) * 60,
									top: 12,
									width: ((TOG.w - 24) / 3) * pillStretch,
									height: TOG.h - 24,
									borderRadius: (TOG.h - 24) / 2,
									background: 'linear-gradient(180deg, #F6F6F8 0%, #DADAE0 100%)',
									boxShadow: '0 8px 30px rgba(0,0,0,0.35), 0 0 40px rgba(230,63,109,0.35)',
									transform: `scale(${pillIn})`,
								}}
							/>
							{['Find', 'Pitch', 'Build'].map((l, k) => (
								<div key={l} style={{position: 'absolute', left: TOG.w / 2 + slot(k), top: 0, width: (TOG.w - 24) / 3, height: TOG.h, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONTS.sans, fontSize: 44, fontWeight: 640, letterSpacing: '-0.03em', color: k === pi && pillT > 0.5 ? '#0B0B0E' : 'rgba(244,244,246,0.55)', zIndex: 2}}>
									{l}
								</div>
							))}
						</div>
					)}
				</div>

				{/* niche menu (drops from the chip) */}
				{menuOpen > 0.01 && (
					<div
						style={{
							position: 'absolute',
							left: 236,
							top: BAR.h + 14,
							width: 330,
							borderRadius: 24,
							padding: 10,
							background: 'linear-gradient(180deg, rgba(48,47,56,0.97), rgba(28,28,34,0.97))',
							border: '1.5px solid rgba(255,255,255,0.12)',
							boxShadow: '0 30px 80px rgba(0,0,0,0.6)',
							transformOrigin: '50% 0%',
							transform: `scaleY(${menuOpen}) scaleX(${lerp(0.9, 1, menuOpen)})`,
							opacity: Math.min(1, menuOpen * 1.5),
						}}
					>
						{OPTIONS.map((o, k) => (
							<div key={o} style={{height: 66, borderRadius: 16, display: 'flex', alignItems: 'center', padding: '0 20px', gap: 14, fontFamily: FONTS.sans, fontSize: 31, fontWeight: 540, color: COLORS.text, background: (!chosen && hover === k) || (chosen && k === 1) ? 'rgba(255,255,255,0.12)' : 'transparent'}}>
								{o}
								<div style={{flex: 1}} />
								{chosen && k === 1 && <Icon d={I.check} s={28} c={ACC} w={2.6} />}
							</div>
						))}
					</div>
				)}
			</div>
			{curOn && <Cursor x={cur.x} y={cur.y} s={press(f, B.CHIP_OPEN) * press(f, B.MENU_SELECT) * press(f, B.SEND)} o={ramp(f, B.CHIP_OPEN - 22, 6) * (1 - ramp(f, B.SEND + 2, 6))} />}
		</AbsoluteFill>
	);
};

// ─────────────────────────────── 3. LIGHT STREAKS ───────────────────────────────
const STREAKS = [
	{d: 'M 300 960 C 700 950, 980 900, 1400 640', w: 10, delay: 0},
	{d: 'M 260 1000 C 680 1000, 1000 1020, 1420 1180', w: 7, delay: 2},
	{d: 'M 340 930 C 760 880, 1040 760, 1380 420', w: 4, delay: 4},
	// returning — converge on the centre where the words are born
	{d: 'M -340 520 C 0 700, 300 940, 540 960', w: 8, delay: 20},
	{d: 'M -360 1460 C 0 1200, 320 980, 540 960', w: 6, delay: 23},
	{d: 'M 1440 1500 C 1100 1240, 800 990, 540 960', w: 5, delay: 26},
];
const Streaks: React.FC = () => {
	const f = useCurrentFrame();
	if (f < B.WHIP || f > B.STREAKS_END + 4) return null;
	return (
		<AbsoluteFill style={{pointerEvents: 'none', mixBlendMode: 'screen'}}>
			<svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
				<defs>
					<linearGradient id="sg" x1="0" y1="0" x2="1" y2="0">
						<stop offset="0" stopColor="#E63F6D" stopOpacity="0" />
						<stop offset="0.55" stopColor="#E63F6D" />
						<stop offset="1" stopColor="#FFFFFF" />
					</linearGradient>
					<filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
						<feGaussianBlur stdDeviation="9" />
					</filter>
				</defs>
				{STREAKS.map((s, i) => {
					const t0 = B.WHIP + s.delay;
					const head = EASE.exit(clamp01((f - t0) / 18));
					const tail = EASE.exit(clamp01((f - t0 - 7) / 18));
					if (head <= 0 || tail >= 1) return null;
					const len = Math.max(0.0001, head - tail);
					const props = {d: s.d, fill: 'none', stroke: 'url(#sg)', strokeLinecap: 'round' as const, pathLength: 1, strokeDasharray: `${len} 2`, strokeDashoffset: -tail};
					return (
						<g key={i}>
							<path {...props} strokeWidth={s.w * 3.2} opacity={0.55} filter="url(#glow)" />
							<path {...props} strokeWidth={s.w} />
						</g>
					);
				})}
			</svg>
			{/* convergence flash */}
			{(() => {
				const fl = Math.max(0, 1 - Math.abs(f - (B.WORDS[0][0] as number) + 2) / 10);
				return fl > 0 ? <div style={{position: 'absolute', left: CX - 160, top: CY - 160, width: 320, height: 320, borderRadius: '50%', background: `radial-gradient(circle, rgba(255,255,255,${0.95 * fl}) 0%, rgba(230,63,109,${0.5 * fl}) 30%, rgba(230,63,109,0) 70%)`, transform: `scale(${0.6 + fl})`}} /> : null;
			})()}
		</AbsoluteFill>
	);
};

// ─────────────────────────────── 4. WORD MORPH ───────────────────────────────
const WordMorph: React.FC = () => {
	const f = useCurrentFrame();
	const first = B.WORDS[0][0] as number;
	if (f < first - 2 || f > B.CARD_POP + 4) return null;
	const squash = ramp(f, B.SQUASH, 14, EASE.exit);
	return (
		<AbsoluteFill style={{perspective: 1200}}>
			{/* tiny label for meaning */}
			<div style={{position: 'absolute', left: 0, right: 0, top: CY - 210, textAlign: 'center', fontFamily: FONTS.mono, fontSize: 26, letterSpacing: '0.22em', color: 'rgba(244,244,246,0.5)', opacity: ramp(f, first + 6, 14) * (1 - ramp(f, B.SQUASH - 10, 8))}}>
				AUSTIN, TX · WHO NEEDS A WEBSITE
			</div>
			{B.WORDS.map(([at, word], wi) => {
				const start = at as number;
				const next = (B.WORDS[wi + 1]?.[0] as number) ?? B.SQUASH;
				const isLast = wi === B.WORDS.length - 1;
				if (f < start - 1 || (!isLast && f > next + 14)) return null;
				const letters = (word as string).split('');
				return (
					<div
						key={wi}
						style={{
							position: 'absolute',
							left: 0,
							right: 0,
							top: CY - 110,
							height: 220,
							display: 'flex',
							justifyContent: 'center',
							alignItems: 'center',
							transformStyle: 'preserve-3d',
							transform: isLast ? `scale(${lerp(1, 1.9, squash)}, ${lerp(1, 0.02, squash)})` : undefined,
						}}
					>
						{letters.map((ch, li) => {
							const inT = ramp(f, start + li * 1.6, 13, backOut(1.4));
							const outT = isLast ? 0 : ramp(f, next - 8 + li * 1.2, 11, EASE.exit);
							const seed = wi * 31 + li * 7;
							const rx = (1 - inT) * -95 + outT * 95;
							const dy = (1 - inT) * 70 - outT * 70;
							const blur = (1 - inT) * 10 + outT * 12;
							const spin = (rand(seed) - 0.5) * 50 * (1 - inT) + (rand(seed + 3) - 0.5) * 60 * outT;
							return (
								<span
									key={li}
									style={{
										display: 'inline-block',
										fontFamily: FONTS.sans,
										fontSize: isLast ? 196 : 168,
										fontWeight: 760,
										letterSpacing: '-0.055em',
										color: isLast ? ACC : COLORS.text,
										whiteSpace: 'pre',
										transform: `translateY(${dy}px) rotateX(${rx}deg) rotateZ(${spin}deg)`,
										opacity: Math.min(1, inT * 1.6) * (1 - outT),
										filter: blur > 0.4 ? `blur(${blur}px)` : undefined,
										textShadow: isLast ? '0 0 60px rgba(230,63,109,0.55)' : '0 0 40px rgba(255,255,255,0.18)',
									}}
								>
									{ch}
								</span>
							);
						})}
					</div>
				);
			})}
			{/* the line it collapses into */}
			{f >= B.SQUASH + 8 && <div style={{position: 'absolute', left: CX - 410, top: CY - 3, width: 820, height: 6, borderRadius: 3, background: ACC, boxShadow: '0 0 40px rgba(230,63,109,0.9), 0 0 120px rgba(230,63,109,0.6)', opacity: 1 - ramp(f, B.CARD_POP, 6)}} />}
		</AbsoluteFill>
	);
};

// ─────────────────────────────── 5. THE CLIENT (card) ───────────────────────────────
const ROWS: [string, string][] = [
	['Why them', 'Busy · site breaks on mobile'],
	['Contact', '(512) 555-0148'],
	['Outreach', 'Written'],
	['Build prompt', 'Ready'],
];
const CARD = {w: 860, h: 700};

const ClientCard: React.FC = () => {
	const f = useCurrentFrame();
	if (f < B.CARD_POP - 2 || f > B.ICON + 4) return null;
	const open = ramp(f, B.CARD_POP, 22, backOut(1.15));
	const col = ramp(f, B.CARD_COLLAPSE, 22, EASE.exit);
	const w = lerp(lerp(820, CARD.w, open), 220, col);
	const h = lerp(lerp(6, CARD.h, open), 220, col);
	const r = lerp(lerp(3, 40, open), 110, col);
	const content = ramp(f, B.CARD_POP + 14, 12) * (1 - ramp(f, B.CARD_COLLAPSE, 8));
	const sway = Math.sin((f - B.CARD_POP) / 40) * 7 * (1 - col);
	return (
		<AbsoluteFill style={{perspective: 2000}}>
			<div
				style={{
					position: 'absolute',
					left: CX - w / 2,
					top: CY - h / 2,
					width: w,
					height: h,
					borderRadius: r,
					background: col > 0.5 ? `linear-gradient(135deg, #E8445F, #E63F6D 55%, #C8285A)` : 'linear-gradient(180deg, rgba(40,39,48,0.96), rgba(20,20,26,0.97))',
					border: '1.5px solid rgba(255,255,255,0.13)',
					boxShadow: `inset 0 1.5px 0 rgba(255,255,255,0.14), 0 50px 140px rgba(0,0,0,0.7), 0 0 ${80 + col * 100}px rgba(230,63,109,${0.25 + col * 0.4})`,
					transform: `rotateY(${sway}deg) rotateX(${-sway * 0.4}deg)`,
					overflow: 'hidden',
				}}
			>
				{content > 0 && (
					<div style={{position: 'absolute', left: 0, top: 0, width: CARD.w, height: CARD.h, opacity: content, padding: '52px 56px', fontFamily: FONTS.sans}}>
						<div style={{display: 'flex', alignItems: 'center'}}>
							<div style={{fontFamily: FONTS.mono, fontSize: 22, letterSpacing: '0.18em', color: ACC}}>OPPORTUNITY FOUND</div>
							<div style={{flex: 1}} />
							<div style={{fontFamily: FONTS.mono, fontSize: 22, color: 'rgba(244,244,246,0.5)'}}>1 / 38</div>
						</div>
						<div style={{fontSize: 70, fontWeight: 700, letterSpacing: '-0.045em', color: COLORS.text, marginTop: 22}}>Bellwood Plumbing</div>
						<div style={{fontSize: 32, color: 'rgba(244,244,246,0.6)', marginTop: 8}}>
							Austin, TX · <span style={{color: '#F5B400'}}>★</span> 4.8 (126)
						</div>
						<div style={{height: 2, background: 'rgba(255,255,255,0.1)', margin: '34px 0 10px'}} />
						{ROWS.map(([k, v], i) => {
							const at = B.CARD_ROWS[i];
							const t = ramp(f, at, 12, backOut(1.6));
							const done = f >= at;
							return (
								<div key={k} style={{display: 'flex', alignItems: 'center', height: 92, borderBottom: i < 3 ? '1.5px solid rgba(255,255,255,0.07)' : 'none'}}>
									<div style={{width: 46, height: 46, borderRadius: 23, marginRight: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', background: done ? ACC : 'transparent', border: done ? 'none' : '2.5px solid rgba(255,255,255,0.2)', transform: `scale(${done ? t : 1})`, boxShadow: done ? `0 0 ${24 * (1 - clamp01((f - at) / 20)) + 6}px rgba(230,63,109,0.7)` : 'none'}}>
										{done && (
											<svg width={28} height={28} viewBox="0 0 24 24">
												<path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="#fff" strokeWidth={3.2} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - clamp01((f - at) / 9)} />
											</svg>
										)}
									</div>
									<div style={{fontSize: 36, fontWeight: 600, color: done ? COLORS.text : 'rgba(244,244,246,0.4)', letterSpacing: '-0.02em'}}>{k}</div>
									<div style={{flex: 1}} />
									<div style={{fontSize: 30, color: 'rgba(244,244,246,0.72)', clipPath: `inset(0 ${(1 - ramp(f, at + 2, 12, EASE.snap)) * 100}% 0 0)`}}>{v}</div>
								</div>
							);
						})}
					</div>
				)}
			</div>
		</AbsoluteFill>
	);
};

// ─────────────────────────────── 6. MARK + BURST + CTA ───────────────────────────────
const MiniIcon: React.FC<{k: number}> = ({k}) => {
	const kinds = [I.check, I.pin, I.check, I.globe];
	return (
		<div style={{width: 64, height: 64, borderRadius: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(230,63,109,0.16)', border: '1.5px solid rgba(230,63,109,0.6)', boxShadow: '0 0 24px rgba(230,63,109,0.5)'}}>
			<Icon d={kinds[k % kinds.length]} s={32} c="#FFD3DE" w={2.4} />
		</div>
	);
};

const Finale: React.FC<{variant: 'organic' | 'paid'}> = ({variant}) => {
	const f = useCurrentFrame();
	if (f < B.ICON - 2 || f > B.FADE_BLACK + 24) return null;
	const pop = ramp(f, B.ICON, 16, backOut(2.2));
	const slide = ramp(f, B.SLIDE, 22, EASE.glide);
	const out = ramp(f, B.FADE_BLACK, 18, EASE.exit);
	const ix = lerp(CX, 250, slide);
	const ring = clamp01((f - B.ICON) / 30);
	const click = Math.max(0, 1 - Math.abs(f - B.CTA_CLICK) / 14);
	return (
		<AbsoluteFill style={{opacity: 1 - out, transform: `scale(${1 - out * 0.12})`, filter: out > 0.05 ? `blur(${out * 14}px)` : undefined}}>
			{/* burst */}
			{f >= B.BURST &&
				Array.from({length: 16}).map((_, i) => {
					const a = (i / 16) * Math.PI * 2 + rand(i) * 0.3;
					const d = 260 + rand(i * 3) * 330;
					const t = ramp(f, B.BURST + rand(i * 5) * 6, 34, EASE.snap);
					const fade = ramp(f, B.BURST + 40 + rand(i * 7) * 30, 22);
					return (
						<div key={i} style={{position: 'absolute', left: CX - 32 + Math.cos(a) * d * t, top: CY - 32 + Math.sin(a) * d * t * 1.2, transform: `scale(${lerp(0.2, 0.7 + rand(i * 9) * 0.5, t)}) rotate(${(rand(i) - 0.5) * 60 * t}deg)`, opacity: t * (1 - fade)}}>
							<MiniIcon k={i} />
						</div>
					);
				})}
			{/* ring pulse */}
			{ring < 1 && <div style={{position: 'absolute', left: ix - 110, top: CY - 110, width: 220, height: 220, borderRadius: 110, border: `4px solid rgba(255,255,255,${0.8 * (1 - ring)})`, transform: `scale(${1 + ring * 1.6})`}} />}
			{click > 0 && <div style={{position: 'absolute', left: ix - 110, top: CY - 110, width: 220, height: 220, borderRadius: 110, border: `4px solid rgba(230,63,109,${click})`, transform: `scale(${1 + (1 - click) * 1.2})`}} />}
			{/* the mark */}
			<div
				style={{
					position: 'absolute',
					left: ix - 110,
					top: CY - 110,
					width: 220,
					height: 220,
					borderRadius: 110,
					background: 'radial-gradient(circle at 35% 30%, #2A2930, #0E0E12 70%)',
					border: '2px solid rgba(255,255,255,0.16)',
					boxShadow: `0 0 0 10px rgba(230,63,109,0.10), 0 0 90px rgba(230,63,109,${0.45 + click * 0.4})`,
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					transform: `scale(${pop * press(f, B.CTA_CLICK)})`,
				}}
			>
				<Img src={staticFile('prospectify/prospectify-mark.png')} style={{width: 118, height: 119}} />
			</div>
			{/* CTA */}
			{f >= B.CTA_IN && (
				<div style={{position: 'absolute', left: 400, top: CY - 70, height: 140, display: 'flex', flexDirection: 'column', justifyContent: 'center', overflow: 'hidden'}}>
					<div style={{display: 'flex'}}>
						{'START FREE'.split('').map((ch, i) => {
							const t = ramp(f, B.CTA_IN + i * 1.5, 14, backOut(1.3));
							return (
								<span key={i} style={{display: 'inline-block', whiteSpace: 'pre', fontFamily: FONTS.sans, fontSize: 92, fontWeight: 760, letterSpacing: '0.02em', color: COLORS.text, transform: `translateY(${(1 - t) * 110}%)`, opacity: t}}>
									{ch}
								</span>
							);
						})}
					</div>
					<div style={{fontFamily: FONTS.mono, fontSize: 24, letterSpacing: '0.12em', color: 'rgba(244,244,246,0.6)', marginTop: 6, opacity: ramp(f, B.CTA_IN + 16, 14)}}>
						{variant === 'paid' ? '3 REAL LEADS · NO CARD' : 'PROSPECTIFY.NET'}
					</div>
				</div>
			)}
			{f >= B.CTA_CLICK - 20 && f < B.CTA_CLICK + 16 && (() => {
				const c = path2(f, [
					[B.CTA_CLICK - 20, 820, 1240],
					[B.CTA_CLICK - 2, ix + 40, CY + 50],
				]);
				return <Cursor x={c.x} y={c.y} s={press(f, B.CTA_CLICK)} o={ramp(f, B.CTA_CLICK - 20, 5) * (1 - ramp(f, B.CTA_CLICK + 8, 8))} />;
			})()}
		</AbsoluteFill>
	);
};

// ─────────────────────────────── 7. WORDMARK ───────────────────────────────
const Wordmark: React.FC = () => {
	const f = useCurrentFrame();
	if (f < B.WORDMARK) return null;
	const letters = 'Prospectify'.split('');
	const mark = ramp(f, B.MARK, 24, backOut(1.6));
	return (
		<AbsoluteFill>
			<div style={{position: 'absolute', left: CX - 90, top: 640, width: 180, height: 182, transform: `scale(${mark}) translateY(${(1 - mark) * 30}px)`, opacity: Math.min(1, mark * 1.4), filter: `drop-shadow(0 0 ${40 + (1 - mark) * 60}px rgba(230,63,109,0.5))`}}>
				<Img src={staticFile('prospectify/prospectify-mark.png')} style={{width: 180, height: 182}} />
			</div>
			<div style={{position: 'absolute', left: 0, right: 0, top: 880, display: 'flex', justifyContent: 'center'}}>
				{letters.map((ch, i) => {
					const seed = i * 13 + 5;
					const t = ramp(f, B.WORDMARK + rand(seed) * 26, 30, EASE.snap);
					const dx = (rand(seed + 1) - 0.5) * 900 * (1 - t);
					const dy = (rand(seed + 2) - 0.5) * 700 * (1 - t);
					const rot = (rand(seed + 3) - 0.5) * 220 * (1 - t);
					const sc = lerp(2.6 * rand(seed + 4) + 0.4, 1, t);
					const ca = (1 - t) * 14;
					return (
						<span key={i} style={{position: 'relative', display: 'inline-block', fontFamily: FONTS.sans, fontSize: 132, fontWeight: 700, letterSpacing: '-0.05em', color: COLORS.text, transform: `translate(${dx}px, ${dy}px) rotate(${rot}deg) scale(${sc})`, opacity: Math.min(1, t * 2), filter: t < 0.98 ? `blur(${(1 - t) * 8}px)` : undefined, textShadow: ca > 0.3 ? `${ca}px 0 0 rgba(230,63,109,0.85), ${-ca}px 0 0 rgba(120,200,255,0.6)` : 'none'}}>
							{ch}
						</span>
					);
				})}
			</div>
			<div style={{position: 'absolute', left: 0, right: 0, top: 1060, textAlign: 'center', fontFamily: FONTS.sans, fontSize: 46, fontWeight: 520, letterSpacing: '-0.025em', color: 'rgba(244,244,246,0.7)', opacity: ramp(f, B.TAGLINE, 16), transform: `translateY(${(1 - ramp(f, B.TAGLINE, 18, EASE.snap)) * 30}px)`}}>
				You build the website. <span style={{color: COLORS.text, fontWeight: 680}}>We find the client.</span>
			</div>
			<div style={{position: 'absolute', left: 0, right: 0, top: 1170, textAlign: 'center', fontFamily: FONTS.mono, fontSize: 30, letterSpacing: '0.14em', color: ACC, opacity: ramp(f, B.URL, 14)}}>
				PROSPECTIFY.NET
			</div>
		</AbsoluteFill>
	);
};

// ─────────────────────────────── stage ───────────────────────────────
const Stage: React.FC<{variant: 'organic' | 'paid'}> = ({variant}) => {
	const f = useCurrentFrame();
	// a slow, constant camera breath so nothing is ever perfectly static
	const breath = 1 + 0.025 * Math.sin(f / 90) + 0.03 * ramp(f, B.WORDMARK, B.durationInFrames - B.WORDMARK, EASE.linear);
	return (
		<AbsoluteFill style={{transform: `scale(${breath})`}}>
			<Ambient />
			<TheObject />
			<Streaks />
			<WordMorph />
			<ClientCard />
			<Finale variant={variant} />
			<Wordmark />
		</AbsoluteFill>
	);
};

export const Morph: React.FC<{variant: 'organic' | 'paid'; withAudio: boolean}> = ({variant, withAudio}) => {
	const f = useCurrentFrame();
	return (
		<AbsoluteFill style={{background: '#050505', overflow: 'hidden'}}>
			{inBlur(f) ? (
				<CameraMotionBlur shutterAngle={200} samples={8}>
					<Stage variant={variant} />
				</CameraMotionBlur>
			) : (
				<Stage variant={variant} />
			)}
			<Vignette strength={0.55} />
			<Grain f={f} opacity={0.06} />
			{withAudio && <Audio src={staticFile(`audio/morph-${variant}.wav`)} />}
		</AbsoluteFill>
	);
};
