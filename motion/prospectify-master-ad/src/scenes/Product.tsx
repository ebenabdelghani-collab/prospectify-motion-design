import React from 'react';
import {COLORS, EASE, FONTS} from '../constants/theme';
import {T} from '../constants/timeline';
import {LEAD, PROMPT, RESULTS, SEARCH} from '../constants/demoData';
import {Check, Cursor, Skeleton} from '../components/primitives';
import {Chip, Dot, lineScale, mono} from '../components/ui';
import {lerp, path, press, ramp, typed, typedSpan} from '../motion/anim';
import {Camera, CamKey, Sheen, tilt3d} from '../fx/camera';

const BAR = {x: 90, y: 556, w: 900, h: 132};
const LIST_TOP = 724;
const CARD_H = 118;
const GAP = 14;
const FILE = {x: 90, y: 540, w: 900, h: 960};
export const PROMPT_RECT = {x: 90, y: 600, w: 900, h: 820};

/** Row in the prospect file: pending skeleton → locks with a check. */
const Row: React.FC<{f: number; top: number; label: string; lockAt: number; right?: React.ReactNode; pending: React.ReactNode; children: React.ReactNode}> = ({
	f,
	top,
	label,
	lockAt,
	right,
	pending,
	children,
}) => {
	const locked = f >= lockAt;
	return (
		<div style={{position: 'absolute', left: 44, right: 44, top}}>
			<div style={{display: 'flex', alignItems: 'center', gap: 16, height: 40}}>
				{locked ? <Check size={36} t={ramp(f, lockAt, 14, EASE.lock)} /> : <div style={{width: 36, height: 36, borderRadius: 18, border: `2.5px solid ${COLORS.lineHi}`}} />}
				<div style={{...mono, color: locked ? COLORS.text : COLORS.textDim}}>{label}</div>
				<div style={{flex: 1}} />
				{right}
			</div>
			<div style={{marginTop: 16}}>{locked ? <div style={{clipPath: `inset(0 ${(1 - ramp(f, lockAt, 12, EASE.snap)) * 100}% 0 0)`}}>{children}</div> : pending}</div>
		</div>
	);
};

const msgBox: React.CSSProperties = {
	height: 150,
	borderRadius: 18,
	background: '#0C0C10',
	border: `1.5px solid ${COLORS.line}`,
	padding: '20px 26px',
	fontFamily: FONTS.sans,
	fontSize: 27,
	lineHeight: 1.36,
	color: COLORS.text,
	letterSpacing: '-0.01em',
};

const lineY = (i: number) => (i < 2 ? PROMPT_RECT.y + 130 + i * 50 + 25 : PROMPT_RECT.y + 254 + (i - 2) * 70 + 35);
const S = EASE.snap;
const X = EASE.exit;
const LIN = EASE.linear;
// Follow-focus camera: it rides to whatever is happening, then breathes back out.
const CAM: CamKey[] = [
	[T.SEARCH_IN, 540, 960, 1.0],
	[T.CITY_KEYS[0], 420, 760, 1.32],
	[T.NICHE_KEYS[0], 640, 760, 1.32],
	[T.SEARCH_HOVER, 760, 760, 1.3],
	[T.SEARCH_CLICK + 2, 780, 720, 1.42, 0, X],
	[T.RESULTS + 10, 540, 1010, 1.0, 0, S],
	[T.LEAD_HOVER, 540, 1030, 1.07, 0, LIN],
	[T.LEAD_SELECTED + 4, 560, 800, 1.32, 0, X],
	[T.FILE_OPEN + 4, 540, 1010, 1.0, 0, S],
	[T.WHY_READY - 4, 540, 1000, 1.02, 0, LIN],
	[T.WHY_READY + 8, 540, 860, 1.22],
	[T.CONTACT_READY - 2, 540, 880, 1.22, 0, LIN],
	[T.CONTACT_READY + 10, 540, 1000, 1.24],
	[T.ANGLE_READY + 10, 540, 1110, 1.26],
	[T.OUTREACH_TYPE[0] + 10, 530, 1270, 1.26],
	[T.COPY_CLICK, 600, 1240, 1.27, 0, LIN],
	[T.PROMPT_HOVER, 640, 1390, 1.26],
	[T.PROMPT_CLICK + 3, 760, 1440, 1.9, 0, X],
	[T.PROMPT_FOLD + 10, 540, 1010, 1.0, 0, S],
	...T.PROMPT_LINES.map((l, i) => [l + 8, 540, lineY(i) + 60, 1.24] as CamKey),
	[T.PROMPT_READY - 2, 540, lineY(7) + 120, 1.26, 0, LIN],
	[T.PROMPT_READY + 12, 540, 1010, 1.0, 0, S],
];

/** 30.3–47s: search → opportunities → prospect file → the website prompt. */
export const Product: React.FC<{f: number}> = ({f}) => {
	if (f < T.SEARCH_IN - 2 || f >= T.PROMPT_COMPRESS) return null;

	// Search bar grows out of a line
	const barW = ramp(f, T.SEARCH_IN, 12, EASE.snap);
	const barH = ramp(f, T.SEARCH_IN + 8, 12, EASE.snap);
	const searchOut = ramp(f, T.LEAD_SELECTED, 12, EASE.exit);
	const scan = ramp(f, T.SEARCH_CLICK, T.RESULTS - T.SEARCH_CLICK, EASE.glide);
	const pulse = f >= T.SIGNAL_PULSE ? Math.max(0, 1 - (f - T.SIGNAL_PULSE) / 30) : 0;

	// Lead card → prospect file
	const expand = ramp(f, T.LEAD_SELECTED, T.FILE_OPEN - T.LEAD_SELECTED, EASE.glide);
	const rect = {
		x: lerp(90, FILE.x, expand),
		y: lerp(LIST_TOP, FILE.y, expand),
		w: lerp(900, FILE.w, expand),
		h: lerp(CARD_H, FILE.h, expand),
	};
	const fileIn = ramp(f, T.RESULT_CARDS[0], 14, EASE.snap);
	const fold = lineScale(f, T.PROMPT_FOLD);
	const showPrompt = f >= T.PROMPT_FOLD + 8;

	const cur = path(f, [
		[T.SEARCH_HOVER - 14, 820, 1140],
		[T.SEARCH_HOVER, 878, 628],
		[T.RESULTS + 12, 878, 640],
		[T.LEAD_HOVER, 700, 788],
		[T.LEAD_SELECTED + 18, 700, 800],
		[T.COPY_HOVER, 884, 1192],
		[T.COPY_CLICK + 6, 884, 1194],
		[T.PROMPT_HOVER, 846, 1442],
	]);
	const cursorScale = press(f, T.SEARCH_CLICK) * press(f, T.LEAD_SELECTED) * press(f, T.COPY_CLICK) * press(f, T.PROMPT_CLICK);

	return (
		<Camera f={f} keys={CAM}>
			{/* Search */}
			{searchOut < 1 && (
				<div
					style={{
						position: 'absolute',
						left: BAR.x + (BAR.w * (1 - barW)) / 2,
						top: BAR.y + (BAR.h * (1 - lerp(0.03, 1, barH))) / 2 - searchOut * 40,
						width: BAR.w * barW,
						height: BAR.h * lerp(0.03, 1, barH),
						borderRadius: lerp(2, 26, barH),
						background: COLORS.surface,
						border: `2px solid ${COLORS.line}`,
						overflow: 'hidden',
						opacity: 1 - searchOut,
					}}
				>
					<div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', padding: '0 18px 0 40px', gap: 30, opacity: ramp(f, T.SEARCH_IN + 12, 10)}}>
						{(
							[
								['CITY', typed(SEARCH.city, T.CITY_KEYS, f), T.CITY_KEYS],
								['NICHE', typed(SEARCH.niche, T.NICHE_KEYS, f), T.NICHE_KEYS],
							] as [string, string, number[]][]
						).map(([label, val, k], i) => {
							const typing = f >= k[0] - 3 && f <= k[k.length - 1] + 6;
							return (
								<React.Fragment key={label}>
									{i === 1 && <div style={{width: 2, height: 64, background: COLORS.line}} />}
									<div style={{width: 280}}>
										<div style={{...mono, fontSize: 20, color: typing ? COLORS.text : COLORS.textDim}}>{label}</div>
										<div style={{display: 'flex', alignItems: 'center', fontFamily: FONTS.sans, fontSize: 42, fontWeight: 560, letterSpacing: '-0.025em', color: COLORS.text, height: 52, marginTop: 6, whiteSpace: 'pre'}}>
											{val}
											{typing && <span style={{width: 4, height: 44, marginLeft: 4, background: COLORS.accent, borderRadius: 2}} />}
										</div>
									</div>
								</React.Fragment>
							);
						})}
						<div style={{flex: 1}} />
						<div style={{width: 196, height: 96, borderRadius: 20, background: COLORS.text, transform: `scale(${press(f, T.SEARCH_CLICK)})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONTS.sans, fontSize: 34, fontWeight: 620, color: COLORS.bg}}>
							Search
						</div>
					</div>
					{f >= T.SEARCH_CLICK && f < T.RESULTS + 6 && <div style={{position: 'absolute', left: 0, bottom: 0, height: 3, width: `${scan * 100}%`, background: COLORS.accent, opacity: 1 - ramp(f, T.RESULTS, 6)}} />}
				</div>
			)}

			{/* Opportunities (cards 2–5) */}
			{f >= T.RESULTS &&
				f < T.FILE_OPEN &&
				RESULTS.map((r, i) => {
					if (i === 0) return null;
					const tin = ramp(f, T.RESULT_CARDS[i], 14, EASE.snap);
					const out = ramp(f, T.LEAD_SELECTED + (4 - i) * 1.5, 12, EASE.exit);
					const top = LIST_TOP + i * (CARD_H + GAP);
					return (
						<div
							key={r.name}
							style={{
								position: 'absolute',
								left: 90,
								top: top + (1 - tin) * 40 + out * 60,
								transform: tilt3d(tin, 55, 0, -320),
								width: 900,
								height: CARD_H,
								borderRadius: 22,
								background: COLORS.surface,
								border: `2px solid ${COLORS.line}`,
								opacity: tin * (1 - out) * (r.strength === 'low' ? 0.4 : 1),
								display: 'flex',
								alignItems: 'center',
								padding: '0 34px',
							}}
						>
							<div>
								<div style={{fontFamily: FONTS.sans, fontSize: 36, fontWeight: 600, letterSpacing: '-0.025em', color: COLORS.text}}>{r.name}</div>
								<div style={{fontFamily: FONTS.sans, fontSize: 25, color: COLORS.textDim, marginTop: 6}}>Plumber · {SEARCH.city}</div>
							</div>
							<div style={{flex: 1}} />
							<div style={{textAlign: 'right', fontFamily: FONTS.sans, fontSize: 25, fontWeight: 520}}>
								<div style={{color: COLORS.text}}>{r.demand}</div>
								<div style={{display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 10, marginTop: 6, color: r.strength === 'low' ? COLORS.textDim : COLORS.text}}>
									<Dot c={r.strength === 'low' ? COLORS.textMute : r.strength === 'high' ? COLORS.accent : 'rgba(230,63,109,0.55)'} s={11 + pulse * 3 * (r.strength === 'high' ? 1 : 0)} />
									{r.problem}
								</div>
							</div>
						</div>
					);
				})}

			{/* The lead → prospect file */}
			{f >= T.RESULTS && !showPrompt && (
				<div
					style={{
						position: 'absolute',
						left: rect.x,
						top: rect.y + (1 - fileIn) * 40,
						width: rect.w,
						height: rect.h,
						borderRadius: 24,
						background: COLORS.surface,
						border: `2px solid ${f >= T.LEAD_HOVER ? COLORS.lineHi : COLORS.line}`,
						boxShadow: `0 40px 120px rgba(0,0,0,${0.6 * expand})`,
						opacity: fileIn,
						transform: `scale(${press(f, T.LEAD_SELECTED, 3, 10)}) scaleY(${fold})`,
						overflow: 'hidden',
					}}
				>
					<div style={{position: 'absolute', left: 34, right: 34, top: 0, height: CARD_H, display: 'flex', alignItems: 'center', opacity: 1 - ramp(f, T.LEAD_SELECTED + 2, 8)}}>
						<div>
							<div style={{fontFamily: FONTS.sans, fontSize: 36, fontWeight: 600, letterSpacing: '-0.025em', color: COLORS.text}}>{RESULTS[0].name}</div>
							<div style={{fontFamily: FONTS.sans, fontSize: 25, color: COLORS.textDim, marginTop: 6}}>Plumber · {SEARCH.city}</div>
						</div>
						<div style={{flex: 1}} />
						<div style={{textAlign: 'right', fontFamily: FONTS.sans, fontSize: 25, fontWeight: 520, color: COLORS.text}}>
							<div>{RESULTS[0].demand}</div>
							<div style={{display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 10, marginTop: 6}}>
								<Dot c={COLORS.accent} s={11 + pulse * 3} />
								{RESULTS[0].problem}
							</div>
						</div>
					</div>

					{f >= T.LEAD_SELECTED + 6 && (
						<div style={{position: 'absolute', left: 0, top: 0, width: FILE.w, height: FILE.h, opacity: ramp(f, T.LEAD_SELECTED + 8, 12)}}>
							<div style={{position: 'absolute', left: 44, top: 34, right: 44, display: 'flex', alignItems: 'flex-start'}}>
								<div>
									<div style={{fontFamily: FONTS.sans, fontSize: 52, fontWeight: 650, letterSpacing: '-0.035em', color: COLORS.text}}>{LEAD.name}</div>
									<div style={{fontFamily: FONTS.sans, fontSize: 28, color: COLORS.textDim, marginTop: 6}}>
										{LEAD.category} · {LEAD.city} · {LEAD.rating}★ ({LEAD.reviews})
									</div>
								</div>
								<div style={{flex: 1}} />
								<div style={{...mono, fontSize: 19, padding: '12px 16px', borderRadius: 12, border: `1.5px solid ${COLORS.line}`}}>OPPORTUNITY</div>
							</div>
							<div style={{position: 'absolute', left: 44, right: 44, top: 140, height: 2, background: COLORS.line}} />

							<Row f={f} top={164} label="WHY THEM" lockAt={T.WHY_READY} pending={<div style={{display: 'flex', gap: 14}}><Skeleton w={260} h={52} f={f} /><Skeleton w={300} h={52} f={f} seed={2} /></div>}>
								<div style={{display: 'flex', gap: 12}}>
									{LEAD.why.demand.map((s) => (
										<Chip key={s} size={26} tone="bright">
											{s}
										</Chip>
									))}
								</div>
								<div style={{display: 'flex', gap: 12, marginTop: 10}}>
									{LEAD.why.problem.map((s) => (
										<Chip key={s} size={26} tone="accent">
											<Dot c={COLORS.accent} s={10} />
											{s}
										</Chip>
									))}
								</div>
							</Row>

							<Row f={f} top={384} label="CONTACT" lockAt={T.CONTACT_READY} pending={<div style={{display: 'flex', gap: 14}}><Skeleton w={300} h={52} f={f} seed={3} /><Skeleton w={300} h={52} f={f} seed={4} /></div>}>
								<div style={{display: 'flex', gap: 12}}>
									<Chip size={26}>
										<svg width={26} height={26} viewBox="0 0 24 24"><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2" fill="none" stroke={COLORS.textDim} strokeWidth={2} strokeLinejoin="round" /></svg>
										{LEAD.phone}
									</Chip>
									<Chip size={26}>
										<svg width={26} height={26} viewBox="0 0 24 24"><path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21Z" fill="none" stroke={COLORS.textDim} strokeWidth={2} /><circle cx={12} cy={9.5} r={2.5} fill={COLORS.textDim} /></svg>
										{LEAD.address}
									</Chip>
								</div>
							</Row>

							<Row f={f} top={520} label="ANGLE" lockAt={T.ANGLE_READY} pending={<div style={{display: 'flex', flexDirection: 'column', gap: 12}}><Skeleton w="85%" h={22} f={f} seed={5} /><Skeleton w="55%" h={22} f={f} seed={6} /></div>}>
								<div style={{fontFamily: FONTS.sans, fontSize: 31, fontWeight: 560, letterSpacing: '-0.02em', color: COLORS.text, lineHeight: 1.25, whiteSpace: 'nowrap'}}>{LEAD.angle}</div>
							</Row>

							<Row
								f={f}
								top={636}
								label="OUTREACH"
								lockAt={T.OUTREACH_READY}
								right={
									f >= T.OUTREACH_READY ? (
										<div
											style={{
												height: 50,
												padding: '0 22px',
												borderRadius: 14,
												display: 'flex',
												alignItems: 'center',
												background: f >= T.COPY_CONFIRM ? COLORS.text : f >= T.COPY_HOVER ? 'rgba(244,244,246,0.16)' : 'rgba(244,244,246,0.08)',
												transform: `scale(${press(f, T.COPY_CLICK)})`,
												fontFamily: FONTS.sans,
												fontSize: 25,
												fontWeight: 620,
												color: f >= T.COPY_CONFIRM ? COLORS.bg : COLORS.text,
											}}
										>
											{f >= T.COPY_CONFIRM ? 'Copied ✓' : 'Copy'}
										</div>
									) : null
								}
								pending={
									<div style={msgBox}>
										{f >= T.OUTREACH_TYPE[0] ? (
											<>
												{typedSpan(LEAD.outreach, f, T.OUTREACH_TYPE[0], T.OUTREACH_TYPE[1])}
												<span style={{display: 'inline-block', width: 3, height: 28, background: COLORS.accent, marginLeft: 3, verticalAlign: -4}} />
											</>
										) : (
											<div style={{display: 'flex', flexDirection: 'column', gap: 14}}>
												<Skeleton w="92%" h={20} f={f} seed={7} />
												<Skeleton w="80%" h={20} f={f} seed={8} />
												<Skeleton w="50%" h={20} f={f} seed={9} />
											</div>
										)}
									</div>
								}
							>
								<div style={{...msgBox, borderColor: f >= T.COPY_CONFIRM ? 'rgba(244,244,246,0.32)' : COLORS.line}}>{LEAD.outreach}</div>
							</Row>

							{/* The last module: BUILD PROMPT */}
							<div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: 108, borderTop: `2px solid ${COLORS.line}`, background: '#0E0E13', display: 'flex', alignItems: 'center', padding: '0 44px', gap: 16}}>
								<svg width={32} height={32} viewBox="0 0 24 24">
									<path d="M12 2.5l1.9 5.6 5.6 1.9-5.6 1.9L12 17.5l-1.9-5.6L4.5 10l5.6-1.9Z" fill={f >= T.PROMPT_HOVER ? COLORS.text : COLORS.textDim} />
								</svg>
								<div style={{...mono, color: COLORS.text}}>BUILD PROMPT</div>
								<div style={{flex: 1}} />
								<div
									style={{
										height: 64,
										padding: '0 28px',
										borderRadius: 16,
										display: 'flex',
										alignItems: 'center',
										background: f >= T.PROMPT_HOVER ? COLORS.text : 'rgba(244,244,246,0.1)',
										color: f >= T.PROMPT_HOVER ? COLORS.bg : COLORS.text,
										transform: `scale(${press(f, T.PROMPT_CLICK)})`,
										fontFamily: FONTS.sans,
										fontSize: 28,
										fontWeight: 620,
									}}
								>
									Generate →
								</div>
							</div>
						</div>
					)}
				</div>
			)}

			{showPrompt && <PromptCard f={f} scaleY={lineScale(f, 1e9, T.PROMPT_FOLD + 8)} />}

			{f >= T.SEARCH_HOVER - 14 && f < T.PROMPT_FOLD + 4 && (
				<Cursor x={cur.x} y={cur.y} scale={cursorScale} opacity={ramp(f, T.SEARCH_HOVER - 14, 6) * (1 - ramp(f, T.PROMPT_FOLD, 4))} blur={Math.min(6, cur.v * 0.12)} />
			)}
		</Camera>
	);
};

/** The hero object: a website prompt written for THIS business. */
export const PromptCard: React.FC<{f: number; scaleY?: number; style?: React.CSSProperties}> = ({f, scaleY = 1, style}) => {
	const readyT = ramp(f, T.PROMPT_READY, 16, EASE.lock);
	const flash = f >= T.PROMPT_READY ? Math.max(0, 1 - (f - T.PROMPT_READY) / 28) : 0;
	const L = T.PROMPT_LINES;
	return (
		<div
			style={{
				position: 'absolute',
				left: PROMPT_RECT.x,
				top: PROMPT_RECT.y,
				width: PROMPT_RECT.w,
				height: PROMPT_RECT.h,
				borderRadius: 26,
				background: COLORS.surface,
				border: `2px solid ${f >= T.PROMPT_READY ? `rgba(230,63,109,${0.32 + flash * 0.5})` : COLORS.lineHi}`,
				boxShadow: `0 40px 140px rgba(0,0,0,0.65)${flash > 0 ? `, 0 0 ${90 * flash}px rgba(230,63,109,${0.22 * flash})` : ''}`,
				transform: `scaleY(${scaleY})`,
				overflow: 'hidden',
				...style,
			}}
		>
			<Sheen t={ramp(f, T.PROMPT_READY, 26, EASE.glide)} width={320} opacity={0.14} />
			<div style={{height: 96, display: 'flex', alignItems: 'center', padding: '0 40px', borderBottom: `2px solid ${COLORS.line}`, gap: 16}}>
				<svg width={30} height={30} viewBox="0 0 24 24">
					<path d="M12 2.5l1.9 5.6 5.6 1.9-5.6 1.9L12 17.5l-1.9-5.6L4.5 10l5.6-1.9Z" fill={COLORS.text} />
				</svg>
				<div style={{...mono, color: COLORS.text}}>WEBSITE PROMPT</div>
				<div style={{fontFamily: FONTS.sans, fontSize: 26, color: COLORS.textDim}}>· {LEAD.name}</div>
			</div>
			<div style={{padding: '34px 40px 0'}}>
				{PROMPT.intro.map((line, i) => (
					<div key={i} style={{fontFamily: FONTS.sans, fontSize: 37, fontWeight: 600, letterSpacing: '-0.025em', color: i === 0 ? COLORS.text : COLORS.textDim, height: 50, whiteSpace: 'pre'}}>
						{typedSpan(line, f, L[i], L[i] + 10)}
					</div>
				))}
				<div style={{height: 24}} />
				{PROMPT.fields.map(([k, v], i) => {
					const at = L[i + 2];
					return (
						<div key={k} style={{display: 'flex', alignItems: 'center', height: 70, borderTop: `1.5px solid ${COLORS.line}`, opacity: f >= at ? 1 : 0}}>
							<div style={{...mono, width: 190, fontSize: 21}}>{k.toUpperCase()}</div>
							<div style={{fontFamily: FONTS.sans, fontSize: 30, fontWeight: 500, color: COLORS.text, letterSpacing: '-0.015em', whiteSpace: 'pre'}}>{typedSpan(v, f, at, at + 9)}</div>
						</div>
					);
				})}
			</div>
			<div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: 104, display: 'flex', alignItems: 'center', gap: 18, padding: '0 40px', borderTop: `2px solid ${COLORS.line}`, background: '#0E0E13'}}>
				{f >= T.PROMPT_READY ? (
					<>
						<Check size={48} t={readyT} />
						<div style={{fontFamily: FONTS.sans, fontSize: 36, fontWeight: 650, letterSpacing: '-0.025em', color: COLORS.text, clipPath: `inset(0 ${(1 - readyT) * 100}% 0 0)`}}>Ready to build</div>
						<div style={{flex: 1}} />
						<div style={{...mono, opacity: readyT}}>COPY PROMPT</div>
					</>
				) : (
					<>
						<div style={mono}>WRITING</div>
						<div style={{flex: 1, height: 3, background: COLORS.line, borderRadius: 2, overflow: 'hidden'}}>
							<div style={{height: '100%', width: `${ramp(f, L[0], T.PROMPT_READY - L[0], EASE.linear) * 100}%`, background: COLORS.text}} />
						</div>
					</>
				)}
			</div>
		</div>
	);
};
