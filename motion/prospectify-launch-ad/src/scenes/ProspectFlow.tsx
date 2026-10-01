import React from 'react';
import {COLORS, EASE, FONTS, LAYOUT} from '../constants/theme';
import {T} from '../constants/timeline';
import {COPY} from '../constants/copy';
import {LEAD, PROMPT, RESULTS, SEARCH} from '../constants/demoData';
import {Check, Cursor, MaskLine, Skeleton} from '../components/primitives';
import {lerp, path, press, ramp, typed, typedSpan} from '../motion/anim';

export const HEADLINE_STYLE: React.CSSProperties = {
	fontSize: 92,
	fontWeight: 650,
	letterSpacing: '-0.045em',
	lineHeight: 1.0,
	color: COLORS.text,
};

const BAR = {x: 90, y: 556, w: 900, h: 132};
const LIST_TOP = 724;
const CARD_H = 118;
const CARD_GAP = 14;
const FILE = {x: 90, y: LAYOUT.productTop, w: 900, h: 820};
export const PROMPT_RECT = {x: 90, y: LAYOUT.productTop, w: 900, h: 800};

const mono: React.CSSProperties = {fontFamily: FONTS.mono, fontSize: 22, letterSpacing: '0.06em', color: COLORS.textDim};

const Chip: React.FC<{children: React.ReactNode; accent?: boolean}> = ({children, accent}) => (
	<div
		style={{
			display: 'flex',
			alignItems: 'center',
			gap: 12,
			height: 60,
			padding: '0 24px',
			borderRadius: 14,
			background: accent ? COLORS.accentSoft : 'rgba(244,244,246,0.06)',
			border: `1.5px solid ${accent ? 'rgba(230,63,109,0.45)' : COLORS.line}`,
			fontFamily: FONTS.sans,
			fontSize: 32,
			fontWeight: 520,
			letterSpacing: '-0.015em',
			color: COLORS.text,
			whiteSpace: 'nowrap',
		}}
	>
		{children}
	</div>
);

const Dot: React.FC<{c: string}> = ({c}) => <div style={{width: 12, height: 12, borderRadius: 6, background: c}} />;

/** Row in the prospect file that sits pending, then locks with a check. */
const FileRow: React.FC<{
	f: number;
	top: number;
	label: string;
	lockAt: number;
	right?: React.ReactNode;
	children: React.ReactNode;
	pending: React.ReactNode;
}> = ({f, top, label, lockAt, right, children, pending}) => {
	const locked = f >= lockAt;
	const t = ramp(f, lockAt, 14, EASE.lock);
	return (
		<div style={{position: 'absolute', left: 44, right: 44, top}}>
			<div style={{display: 'flex', alignItems: 'center', gap: 16, height: 40}}>
				{locked ? (
					<Check size={36} t={t} />
				) : (
					<div style={{width: 36, height: 36, borderRadius: 18, border: `2.5px solid ${COLORS.lineHi}`}} />
				)}
				<div style={{...mono, color: locked ? COLORS.text : COLORS.textDim}}>{label}</div>
				<div style={{flex: 1}} />
				{right}
			</div>
			<div style={{marginTop: 22, position: 'relative'}}>
				{locked ? (
					<div style={{clipPath: `inset(0 ${(1 - ramp(f, lockAt, 12, EASE.snap)) * 100}% 0 0)`}}>{children}</div>
				) : (
					pending
				)}
			</div>
		</div>
	);
};

/**
 * 4.0–10.3s — search → businesses → one opportunity → the prospect file assembles
 * (why / contact / outreach) → the file folds into the website prompt.
 */
export const ProspectFlow: React.FC<{f: number}> = ({f}) => {
	if (f < T.SEARCH_BAR_IN - 2 || f >= T.PROMPT_COMPRESS) return null;

	// ── Search bar: grows out of a line (transition family) ─────────────
	const barW = ramp(f, T.SEARCH_BAR_IN, 12, EASE.snap);
	const barH = ramp(f, T.SEARCH_BAR_IN + 8, 12, EASE.snap);
	const barContent = ramp(f, T.SEARCH_BAR_IN + 12, 10);
	const searchOut = ramp(f, T.LEAD_SELECTED, 12, EASE.exit);
	const niche = typed(SEARCH.niche, T.NICHE_KEYS, f);
	const city = typed(SEARCH.city, T.CITY_KEYS, f);
	const btnPress = press(f, T.SEARCH_CLICK);
	const btnHover = f >= T.SEARCH_HOVER && f < T.SEARCH_CLICK + 10;
	const scan = ramp(f, T.SEARCH_CLICK, T.SCAN_END - T.SEARCH_CLICK, EASE.glide);

	// ── Results → file expansion ─────────────────────────────────────────
	const expand = ramp(f, T.LEAD_SELECTED, T.FILE_EXPAND_END - T.LEAD_SELECTED, EASE.glide);
	const card0 = {x: 90, y: LIST_TOP, w: 900, h: CARD_H};
	const fileRect = {
		x: lerp(card0.x, FILE.x, expand),
		y: lerp(card0.y, FILE.y, expand),
		w: lerp(card0.w, FILE.w, expand),
		h: lerp(card0.h, FILE.h, expand),
	};
	const hover0 = f >= T.LEAD_HOVER;
	const selPress = press(f, T.LEAD_SELECTED, 3, 10);

	// ── Fold: file → line → prompt card ─────────────────────────────────
	const fold = ramp(f, T.PROMPT_FOLD, 9, EASE.exit);
	const unfold = ramp(f, T.PROMPT_FOLD + 9, 13, EASE.snap);
	const showPrompt = f >= T.PROMPT_FOLD + 9;

	// ── Cursor choreography ──────────────────────────────────────────────
	const cur = path(f, [
		[T.SEARCH_HOVER - 14, 820, 1120],
		[T.SEARCH_HOVER, 878, 630],
		[T.CURSOR_TO_LEAD, 878, 640],
		[T.LEAD_HOVER, 700, 790],
		[T.LEAD_SELECTED + 16, 700, 820],
		[T.COPY_HOVER, 905, 1172],
	]);
	const cursorOn = f >= T.SEARCH_HOVER - 14 && f < T.PROMPT_FOLD;
	const cursorScale = press(f, T.SEARCH_CLICK) * press(f, T.LEAD_SELECTED) * press(f, T.COPY_CLICK);

	// ── Headline B (ready chain) ─────────────────────────────────────────
	const lockFrames = [T.WHY_READY, T.CONTACT_READY, T.OUTREACH_READY];
	const lastLock = [...lockFrames].reverse().find((l) => f >= l) ?? T.WHY_READY;

	return (
		<>
			{/* Headline A */}
			{f < T.FILE_EXPAND_END && (
				<div style={{position: 'absolute', left: 90, top: LAYOUT.headlineY}}>
					<MaskLine f={f} inAt={T.SEARCH_BAR_IN + 14} outAt={T.LEAD_SELECTED} text={COPY.findHeadline[0]} style={HEADLINE_STYLE} />
					<MaskLine f={f} inAt={T.SEARCH_BAR_IN + 18} outAt={T.LEAD_SELECTED + 2} text={COPY.findHeadline[1]} style={{...HEADLINE_STYLE, color: COLORS.textDim}} />
				</div>
			)}

			{/* Headline B: "<Why them / Contact / Outreach>.  Ready." */}
			{f >= T.FILE_EXPAND_END - 4 && f < T.PROMPT_FOLD + 12 && (
				<div style={{position: 'absolute', left: 90, top: LAYOUT.headlineY}}>
					<div style={{position: 'relative', height: 96}}>
						{COPY.readyWords.map((w, i) => {
							const inAt = i === 0 ? T.FILE_EXPAND_END - 2 : lockFrames[i] - 4;
							const outAt = i < 2 ? lockFrames[i + 1] - 6 : T.PROMPT_FOLD;
							return (
								<div key={w} style={{position: 'absolute', left: 0, top: 0}}>
									<MaskLine f={f} inAt={inAt} outAt={outAt} text={w} style={HEADLINE_STYLE} inDur={10} outDur={6} />
								</div>
							);
						})}
					</div>
					<div style={{display: 'flex', alignItems: 'center', gap: 22, marginTop: 4, opacity: f >= T.WHY_READY ? 1 : 0}}>
						<MaskLine f={f} inAt={T.WHY_READY} outAt={T.PROMPT_FOLD + 2} text={COPY.ready} style={{...HEADLINE_STYLE, color: COLORS.textDim}} />
						<div style={{opacity: 1 - ramp(f, T.PROMPT_FOLD, 6, EASE.exit)}}>
							<Check size={72} t={ramp(f, lastLock, 14, EASE.lock)} />
						</div>
					</div>
				</div>
			)}

			{/* Search bar */}
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
					<div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', padding: '0 18px 0 40px', gap: 30, opacity: barContent}}>
						{[
							['NICHE', niche, T.NICHE_KEYS],
							['LOCATION', city, T.CITY_KEYS],
						].map(([label, val, keys], i) => {
							const k = keys as number[];
							const typing = f >= k[0] - 2 && f <= k[k.length - 1] + 6;
							return (
								<React.Fragment key={label as string}>
									{i === 1 && <div style={{width: 2, height: 64, background: COLORS.line}} />}
									<div style={{width: 280}}>
										<div style={{...mono, fontSize: 20}}>{label as string}</div>
										<div style={{display: 'flex', alignItems: 'center', fontFamily: FONTS.sans, fontSize: 42, fontWeight: 560, letterSpacing: '-0.025em', color: COLORS.text, height: 52, marginTop: 6, whiteSpace: 'pre'}}>
											{val as string}
											{typing && <span style={{width: 4, height: 44, marginLeft: 4, background: COLORS.accent, borderRadius: 2}} />}
										</div>
									</div>
								</React.Fragment>
							);
						})}
						<div style={{flex: 1}} />
						<div
							style={{
								width: 196,
								height: 96,
								borderRadius: 20,
								background: btnHover ? '#FFFFFF' : COLORS.text,
								transform: `scale(${btnPress})`,
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
								fontFamily: FONTS.sans,
								fontSize: 34,
								fontWeight: 620,
								letterSpacing: '-0.02em',
								color: COLORS.bg,
							}}
						>
							Search
						</div>
					</div>
					{/* scan line */}
					{f >= T.SEARCH_CLICK && f < T.SCAN_END + 6 && (
						<div style={{position: 'absolute', left: 0, bottom: 0, height: 3, width: `${scan * 100}%`, background: COLORS.accent, opacity: 1 - ramp(f, T.SCAN_END, 6)}} />
					)}
				</div>
			)}

			{/* Result list (cards 1..4), then they fall away when the lead is chosen */}
			{f >= T.RESULTS_REVEAL &&
				f < T.FILE_EXPAND_END &&
				RESULTS.map((r, i) => {
					if (i === 0) return null;
					const tin = ramp(f, T.RESULT_CARDS[i], 14, EASE.snap);
					const out = ramp(f, T.LEAD_SELECTED + (4 - i) * 1.5, 12, EASE.exit);
					const top = LIST_TOP + i * (CARD_H + CARD_GAP);
					return (
						<div
							key={r.name}
							style={{
								position: 'absolute',
								left: 90,
								top: top + (1 - tin) * 40 + out * 60,
								width: 900,
								height: CARD_H,
								borderRadius: 22,
								background: COLORS.surface,
								border: `2px solid ${COLORS.line}`,
								opacity: tin * (1 - out) * (r.status === 'ok' ? 0.42 : 1),
								display: 'flex',
								alignItems: 'center',
								padding: '0 36px',
							}}
						>
							<div>
								<div style={{fontFamily: FONTS.sans, fontSize: 38, fontWeight: 600, letterSpacing: '-0.025em', color: COLORS.text}}>{r.name}</div>
								<div style={{fontFamily: FONTS.sans, fontSize: 26, color: COLORS.textDim, marginTop: 6}}>Plumber · {SEARCH.city}</div>
							</div>
							<div style={{flex: 1}} />
							<div style={{display: 'flex', alignItems: 'center', gap: 12, fontFamily: FONTS.sans, fontSize: 28, fontWeight: 520, color: r.status === 'ok' ? COLORS.textDim : COLORS.text}}>
								<Dot c={r.status === 'none' ? COLORS.accent : r.status === 'ok' ? COLORS.textMute : 'rgba(244,244,246,0.6)'} />
								{r.label}
							</div>
						</div>
					);
				})}

			{/* The lead card → prospect file (one continuous object) */}
			{f >= T.RESULTS_REVEAL && !showPrompt && (
				<div
					style={{
						position: 'absolute',
						left: fileRect.x,
						top: fileRect.y + (1 - ramp(f, T.RESULT_CARDS[0], 14, EASE.snap)) * 40,
						width: fileRect.w,
						height: fileRect.h,
						borderRadius: 24,
						background: COLORS.surface,
						border: `2px solid ${hover0 ? COLORS.lineHi : COLORS.line}`,
						boxShadow: expand > 0 ? `0 40px 120px rgba(0,0,0,${0.6 * expand})` : 'none',
						opacity: ramp(f, T.RESULT_CARDS[0], 14, EASE.snap),
						transform: `scale(${selPress}, ${lerp(selPress, 1, 0) * lerp(1, 0.004, fold)})`,
						transformOrigin: '50% 50%',
						overflow: 'hidden',
					}}
				>
					{/* list-item face */}
					<div style={{position: 'absolute', left: 36, right: 36, top: 0, height: CARD_H, display: 'flex', alignItems: 'center', opacity: 1 - ramp(f, T.LEAD_SELECTED + 2, 8)}}>
						<div>
							<div style={{fontFamily: FONTS.sans, fontSize: 38, fontWeight: 600, letterSpacing: '-0.025em', color: COLORS.text}}>{LEAD.name}</div>
							<div style={{fontFamily: FONTS.sans, fontSize: 26, color: COLORS.textDim, marginTop: 6}}>
								Plumber · {SEARCH.city} · {LEAD.rating}★ ({LEAD.reviews})
							</div>
						</div>
						<div style={{flex: 1}} />
						<div style={{display: 'flex', alignItems: 'center', gap: 12, fontFamily: FONTS.sans, fontSize: 28, fontWeight: 520, color: COLORS.text}}>
							<Dot c={COLORS.accent} />
							No website
						</div>
					</div>

					{/* file face */}
					{f >= T.LEAD_SELECTED + 6 && (
						<div style={{position: 'absolute', left: 0, top: 0, width: FILE.w, height: FILE.h, opacity: ramp(f, T.LEAD_SELECTED + 8, 12)}}>
							<div style={{position: 'absolute', left: 44, top: 40, right: 44, display: 'flex', alignItems: 'flex-start'}}>
								<div>
									<div style={{fontFamily: FONTS.sans, fontSize: 54, fontWeight: 650, letterSpacing: '-0.035em', color: COLORS.text}}>{LEAD.name}</div>
									<div style={{fontFamily: FONTS.sans, fontSize: 30, color: COLORS.textDim, marginTop: 8}}>
										{LEAD.category} · {LEAD.city}
									</div>
								</div>
								<div style={{flex: 1}} />
								<div style={{...mono, fontSize: 20, padding: '12px 16px', borderRadius: 12, border: `1.5px solid ${COLORS.line}`}}>PROSPECT</div>
							</div>
							<div style={{position: 'absolute', left: 44, right: 44, top: 172, height: 2, background: COLORS.line}} />

							<FileRow
								f={f}
								top={206}
								label="WHY THEM"
								lockAt={T.WHY_READY}
								pending={<div style={{display: 'flex', gap: 16}}><Skeleton w={220} h={60} f={f} /><Skeleton w={320} h={60} f={f} seed={2} /></div>}
							>
								<div style={{display: 'flex', gap: 16}}>
									<Chip accent>{LEAD.why[0]}</Chip>
									<Chip>{LEAD.why[1]}</Chip>
								</div>
							</FileRow>

							<FileRow
								f={f}
								top={366}
								label="CONTACT"
								lockAt={T.CONTACT_READY}
								pending={<div style={{display: 'flex', gap: 16}}><Skeleton w={300} h={60} f={f} seed={3} /><Skeleton w={300} h={60} f={f} seed={4} /></div>}
							>
								<div style={{display: 'flex', gap: 16}}>
									<Chip>
										<svg width={28} height={28} viewBox="0 0 24 24"><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2" fill="none" stroke={COLORS.textDim} strokeWidth={2} strokeLinejoin="round" /></svg>
										{LEAD.phone}
									</Chip>
									<Chip>
										<svg width={28} height={28} viewBox="0 0 24 24"><path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21Z" fill="none" stroke={COLORS.textDim} strokeWidth={2} /><circle cx={12} cy={9.5} r={2.5} fill={COLORS.textDim} /></svg>
										E 6th St, Austin
									</Chip>
								</div>
							</FileRow>

							<FileRow
								f={f}
								top={526}
								label="OUTREACH"
								lockAt={T.OUTREACH_READY}
								right={
									f >= T.OUTREACH_READY ? (
										<div
											style={{
												display: 'flex',
												alignItems: 'center',
												gap: 10,
												height: 52,
												padding: '0 22px',
												borderRadius: 14,
												background: f >= T.COPY_CONFIRM ? COLORS.text : f >= T.COPY_HOVER ? 'rgba(244,244,246,0.14)' : 'rgba(244,244,246,0.07)',
												transform: `scale(${press(f, T.COPY_CLICK)})`,
												fontFamily: FONTS.sans,
												fontSize: 26,
												fontWeight: 600,
												color: f >= T.COPY_CONFIRM ? COLORS.bg : COLORS.text,
												opacity: ramp(f, T.OUTREACH_READY, 8),
											}}
										>
											{f >= T.COPY_CONFIRM ? 'Copied ✓' : 'Copy'}
										</div>
									) : null
								}
								pending={
									<div style={{height: 196, borderRadius: 18, background: '#0C0C10', border: `1.5px solid ${COLORS.line}`, padding: '24px 28px', fontFamily: FONTS.sans, fontSize: 31, lineHeight: 1.36, color: COLORS.text, letterSpacing: '-0.01em'}}>
										{f >= T.OUTREACH_TYPE_START ? (
											<>
												{typedSpan(LEAD.outreach, f, T.OUTREACH_TYPE_START, T.OUTREACH_TYPE_END)}
												<span style={{display: 'inline-block', width: 3, height: 32, background: COLORS.accent, marginLeft: 3, verticalAlign: -5}} />
											</>
										) : (
											<div style={{display: 'flex', flexDirection: 'column', gap: 14}}>
												<Skeleton w="90%" h={22} f={f} seed={5} />
												<Skeleton w="75%" h={22} f={f} seed={6} />
												<Skeleton w="55%" h={22} f={f} seed={7} />
											</div>
										)}
									</div>
								}
							>
								<div style={{height: 196, borderRadius: 18, background: '#0C0C10', border: `1.5px solid ${f >= T.COPY_CONFIRM ? 'rgba(244,244,246,0.3)' : COLORS.line}`, padding: '24px 28px', fontFamily: FONTS.sans, fontSize: 31, lineHeight: 1.36, color: COLORS.text, letterSpacing: '-0.01em'}}>
									{LEAD.outreach}
								</div>
							</FileRow>
						</div>
					)}
				</div>
			)}

			{/* Headline C + prompt card */}
			{f >= T.PROMPT_HEADLINE - 2 && (
				<div style={{position: 'absolute', left: 90, top: LAYOUT.headlineY}}>
					<MaskLine f={f} inAt={T.PROMPT_HEADLINE} outAt={T.PROMPT_COMPRESS - 2} text={COPY.promptHeadline[0]} style={{...HEADLINE_STYLE, color: COLORS.textDim}} />
					<div style={{display: 'flex', alignItems: 'center', gap: 22}}>
						<MaskLine f={f} inAt={T.PROMPT_HEADLINE + 4} outAt={T.PROMPT_COMPRESS} text={COPY.promptHeadline[1]} style={HEADLINE_STYLE} />
						{f >= T.PROMPT_READY && <Check size={72} t={ramp(f, T.PROMPT_READY, 14, EASE.lock)} />}
					</div>
				</div>
			)}
			{showPrompt && <PromptCard f={f} scaleY={lerp(0.004, 1, unfold)} />}

			{cursorOn && <Cursor x={cur.x} y={cur.y} scale={cursorScale} opacity={ramp(f, T.SEARCH_HOVER - 14, 6)} blur={Math.min(6, cur.v * 0.12)} />}
		</>
	);
};

/** The hero object: a website prompt written for THIS business. Reused by the builder scene. */
export const PromptCard: React.FC<{f: number; scaleY?: number; style?: React.CSSProperties}> = ({f, scaleY = 1, style}) => {
	const readyT = ramp(f, T.PROMPT_READY, 16, EASE.lock);
	const readyFlash = f >= T.PROMPT_READY ? Math.max(0, 1 - (f - T.PROMPT_READY) / 24) : 0;
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
				border: `2px solid ${f >= T.PROMPT_READY ? `rgba(230,63,109,${0.32 + readyFlash * 0.5})` : COLORS.lineHi}`,
				boxShadow: `0 40px 140px rgba(0,0,0,0.65)${readyFlash > 0 ? `, 0 0 ${80 * readyFlash}px rgba(230,63,109,${0.25 * readyFlash})` : ''}`,
				transform: `scaleY(${scaleY})`,
				transformOrigin: '50% 50%',
				overflow: 'hidden',
				...style,
			}}
		>
			{/* title bar */}
			<div style={{height: 96, display: 'flex', alignItems: 'center', padding: '0 40px', borderBottom: `2px solid ${COLORS.line}`, gap: 16}}>
				<svg width={30} height={30} viewBox="0 0 24 24">
					<path d="M12 2.5l1.9 5.6 5.6 1.9-5.6 1.9L12 17.5l-1.9-5.6L4.5 10l5.6-1.9Z" fill={COLORS.text} />
				</svg>
				<div style={{...mono, color: COLORS.text}}>WEBSITE PROMPT</div>
				<div style={{fontFamily: FONTS.sans, fontSize: 26, color: COLORS.textDim}}>· {LEAD.name}</div>
			</div>
			<div style={{padding: '36px 40px 0'}}>
				{PROMPT.intro.map((line, i) => (
					<div key={i} style={{fontFamily: FONTS.sans, fontSize: 38, fontWeight: 600, letterSpacing: '-0.025em', color: i === 0 ? COLORS.text : COLORS.textDim, height: 50, whiteSpace: 'pre'}}>
						{typedSpan(line, f, L[i], L[i] + 9)}
					</div>
				))}
				<div style={{height: 26}} />
				{PROMPT.fields.map(([k, v], i) => {
					const at = L[i + 2];
					const on = f >= at;
					return (
						<div key={k} style={{display: 'flex', alignItems: 'center', height: 66, borderTop: `1.5px solid ${COLORS.line}`, opacity: on ? 1 : 0}}>
							<div style={{...mono, width: 210, fontSize: 21}}>{k.toUpperCase()}</div>
							<div style={{fontFamily: FONTS.sans, fontSize: 31, fontWeight: 500, color: COLORS.text, letterSpacing: '-0.015em', whiteSpace: 'pre'}}>{typedSpan(v, f, at, at + 8)}</div>
						</div>
					);
				})}
			</div>
			{/* READY strip */}
			<div
				style={{
					position: 'absolute',
					left: 0,
					right: 0,
					bottom: 0,
					height: 104,
					display: 'flex',
					alignItems: 'center',
					gap: 18,
					padding: '0 40px',
					borderTop: `2px solid ${COLORS.line}`,
					background: '#0E0E13',
				}}
			>
				{f >= T.PROMPT_READY ? (
					<>
						<Check size={48} t={readyT} />
						<div style={{fontFamily: FONTS.sans, fontSize: 36, fontWeight: 650, letterSpacing: '-0.025em', color: COLORS.text, clipPath: `inset(0 ${(1 - readyT) * 100}% 0 0)`}}>
							Ready to build
						</div>
						<div style={{flex: 1}} />
						<div style={{...mono, color: COLORS.textDim, opacity: readyT}}>COPY PROMPT</div>
					</>
				) : (
					<>
						<div style={{...mono}}>WRITING</div>
						<div style={{flex: 1, height: 3, background: COLORS.line, borderRadius: 2, overflow: 'hidden'}}>
							<div style={{height: '100%', width: `${ramp(f, L[0], T.PROMPT_READY - L[0], EASE.linear) * 100}%`, background: COLORS.text}} />
						</div>
					</>
				)}
			</div>
		</div>
	);
};
