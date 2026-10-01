import React from 'react';
import {Img, staticFile} from 'remotion';
import {COLORS, EASE, FONTS, LAYOUT} from '../constants/theme';
import {T} from '../constants/timeline';
import {COPY} from '../constants/copy';
import {BUILDERS, LEAD} from '../constants/demoData';
import {Check, Cursor, MaskLine} from '../components/primitives';
import {lerp, path, press, ramp} from '../motion/anim';
import {HEADLINE_STYLE, PROMPT_RECT, PromptCard} from './ProspectFlow';

const TILE = 200;
const TILE_TOP = 1060;
const tileX = (i: number) => 90 + i * (TILE + (900 - 4 * TILE) / 3);
const WIN = {x: 90, y: 600, w: 900, h: 860};
const CHROME = 64;
const S = COLORS.site;

const mono: React.CSSProperties = {fontFamily: FONTS.mono, fontSize: 22, letterSpacing: '0.06em', color: COLORS.textDim};

/** Element of the client site that appears with a structural wipe. */
const Build: React.FC<{f: number; at: number; children: React.ReactNode; style?: React.CSSProperties}> = ({f, at, children, style}) => {
	const t = ramp(f, at, 9, EASE.snap);
	return (
		<div style={{position: 'relative', ...style}}>
			{/* wireframe placeholder (structure first) */}
			<div style={{position: 'absolute', inset: 0, borderRadius: 14, border: '2px dashed rgba(16,35,61,0.18)', opacity: 1 - t}} />
			<div style={{clipPath: `inset(0 ${(1 - t) * 100}% 0 0)`, opacity: f >= at ? 1 : 0}}>{children}</div>
		</div>
	);
};

const ClientSite: React.FC<{f: number}> = ({f}) => (
	<div style={{position: 'absolute', inset: 0, background: S.bg, padding: '28px 40px', fontFamily: FONTS.sans, color: S.ink}}>
		<Build f={f} at={T.BUILD_NAV} style={{height: 56}}>
			<div style={{display: 'flex', alignItems: 'center', height: 56}}>
				<svg width={34} height={34} viewBox="0 0 24 24"><path d="M12 2.5C9 7 6 10.2 6 14a6 6 0 0 0 12 0c0-3.8-3-7-6-11.5Z" fill={S.brand} /></svg>
				<div style={{marginLeft: 12, fontSize: 28, fontWeight: 700, letterSpacing: '-0.03em'}}>{LEAD.name}</div>
				<div style={{flex: 1}} />
				<div style={{fontSize: 22, color: S.inkDim, marginRight: 26}}>Services</div>
				<div style={{fontSize: 22, color: S.inkDim, marginRight: 26}}>Reviews</div>
				<div style={{fontSize: 22, fontWeight: 600, color: '#fff', background: S.ink, padding: '10px 18px', borderRadius: 10}}>Call now</div>
			</div>
		</Build>
		<Build f={f} at={T.BUILD_HERO} style={{marginTop: 34, height: 176}}>
			<div style={{fontSize: 74, fontWeight: 750, letterSpacing: '-0.05em', lineHeight: 0.98}}>
				Austin’s trusted
				<br />
				plumbers.
			</div>
			<div style={{fontSize: 26, color: S.inkDim, marginTop: 14}}>Fast repairs, fair prices — rated {LEAD.rating}★ by {LEAD.reviews} neighbors.</div>
		</Build>
		<Build f={f} at={T.BUILD_IMAGE} style={{marginTop: 26, height: 210}}>
			<div style={{height: 210, borderRadius: 20, overflow: 'hidden', position: 'relative', background: `linear-gradient(120deg, ${S.brand} 0%, #1C4FB8 45%, ${S.ink} 100%)`}}>
				<svg width="100%" height="100%" viewBox="0 0 820 210" style={{position: 'absolute', inset: 0}} preserveAspectRatio="none">
					<path d="M-10 150 H260 Q300 150 300 110 V70 Q300 40 330 40 H560 Q590 40 590 70 V160 Q590 180 610 180 H830" fill="none" stroke="rgba(255,255,255,0.22)" strokeWidth={22} strokeLinecap="round" />
					<path d="M-10 150 H260 Q300 150 300 110 V70 Q300 40 330 40 H560 Q590 40 590 70 V160 Q590 180 610 180 H830" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth={4} />
				</svg>
				<div style={{position: 'absolute', right: 22, bottom: 22, background: '#fff', borderRadius: 14, padding: '14px 20px', boxShadow: '0 10px 30px rgba(0,0,0,0.25)'}}>
					<div style={{fontSize: 30, fontWeight: 750, letterSpacing: '-0.03em'}}>{LEAD.rating} ★★★★★</div>
					<div style={{fontSize: 19, color: S.inkDim}}>{LEAD.reviews} reviews</div>
				</div>
			</div>
		</Build>
		<Build f={f} at={T.BUILD_SECTIONS} style={{marginTop: 22, height: 120}}>
			<div style={{display: 'flex', gap: 14}}>
				{['Leak repair', 'Drain cleaning', 'Water heaters'].map((s, i) => (
					<div key={s} style={{flex: 1, height: 120, borderRadius: 16, background: S.card, padding: '18px 18px', boxShadow: '0 2px 0 rgba(16,35,61,0.06)'}}>
						<div style={{width: 34, height: 34, borderRadius: 10, background: i === 0 ? S.brand : 'rgba(47,111,237,0.14)'}} />
						<div style={{fontSize: 23, fontWeight: 650, marginTop: 16, letterSpacing: '-0.02em'}}>{s}</div>
					</div>
				))}
			</div>
		</Build>
		<Build f={f} at={T.BUILD_CTA} style={{marginTop: 22, height: 84}}>
			<div style={{height: 84, borderRadius: 16, background: S.ink, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 30, fontWeight: 650, letterSpacing: '-0.02em'}}>
				Call {LEAD.phone}
			</div>
		</Build>
	</div>
);

/**
 * 10.3–13.6s — the prompt becomes a portable object: choose a builder, it flies in,
 * the site assembles, it gets sold.
 */
export const Builder: React.FC<{f: number}> = ({f}) => {
	if (f < T.PROMPT_COMPRESS || f >= T.FINAL_BRAND + 2) return null;

	const sel = T.BUILDER_SELECTED_INDEX;
	const selTileCenter = {x: tileX(sel) + TILE / 2, y: TILE_TOP + TILE / 2};

	// prompt card: compress → hold → fly into the builder
	const compress = ramp(f, T.PROMPT_COMPRESS, 18, EASE.glide);
	const send = ramp(f, T.PROMPT_SEND, T.PROMPT_ARRIVE - T.PROMPT_SEND, EASE.exit);
	const cardScale = lerp(lerp(1, 0.5, compress), 0.06, send);
	const homeCx = PROMPT_RECT.x + PROMPT_RECT.w / 2;
	const homeCy = PROMPT_RECT.y + PROMPT_RECT.h / 2;
	const cx = lerp(homeCx, lerp(homeCx, selTileCenter.x, send), 1);
	const cy = lerp(lerp(homeCy, 810, compress), selTileCenter.y, send);
	const sendBlur = send > 0 && send < 1 ? Math.sin(send * Math.PI) * 10 : 0;

	// builder tiles
	const tilesOut = ramp(f, T.BUILD_START, 10, EASE.exit);
	const expand = ramp(f, T.BUILD_START, 16, EASE.glide);

	const cur = path(f, [
		[T.BUILDER_CURSOR_START, 760, 1000],
		[T.BUILDER_HOVERS[0], tileX(3) + 110, 1170],
		[T.BUILDER_HOVERS[1], tileX(2) + 110, 1166],
		[T.BUILDER_HOVERS[2], tileX(1) + 110, 1170],
		[T.BUILDER_SELECTED - 2, tileX(0) + 110, 1166],
	]);
	const hoverIdx =
		f < T.BUILDER_HOVERS[0] - 2 ? -1 : f < T.BUILDER_HOVERS[1] - 2 ? 3 : f < T.BUILDER_HOVERS[2] - 2 ? 2 : f < T.BUILDER_SELECTED - 4 ? 1 : 0;
	const selected = f >= T.BUILDER_SELECTED;

	// build window
	const win = {
		x: lerp(tileX(sel), WIN.x, expand),
		y: lerp(TILE_TOP, WIN.y, expand),
		w: lerp(TILE, WIN.w, expand),
		h: lerp(TILE, WIN.h, expand),
	};
	const siteReadyFlash = f >= T.SITE_READY ? Math.max(0, 1 - (f - T.SITE_READY) / 20) : 0;

	// sell
	const sell = ramp(f, T.SELL_START, 16, EASE.glide);
	const thumb = {x: 130, y: 830, w: 172, h: 164};
	const winFinal = {
		x: lerp(win.x, thumb.x, sell),
		y: lerp(win.y, thumb.y, sell),
		w: lerp(win.w, thumb.w, sell),
		h: lerp(win.h, thumb.h, sell),
	};
	const sold = f >= T.SOLD;
	const soldT = ramp(f, T.SOLD, 14, EASE.lock);
	const collapse = ramp(f, T.FINAL_BRAND - 10, 9, EASE.exit);
	const sellCursor = path(f, [
		[T.MARK_SOLD_HOVER - 12, 700, 1280],
		[T.MARK_SOLD_HOVER, 452, 978],
	]);

	return (
		<>
			{/* Headline D — "Your prompt. Your builder." */}
			{f < T.BUILD_START + 10 && (
				<div style={{position: 'absolute', left: 90, top: LAYOUT.headlineY}}>
					<MaskLine f={f} inAt={T.BUILDER_HEADLINE} outAt={T.BUILD_START} text={COPY.builderHeadline[0]} style={{...HEADLINE_STYLE, color: COLORS.textDim}} />
					<MaskLine f={f} inAt={T.BUILDER_HEADLINE + 4} outAt={T.BUILD_START + 2} text={COPY.builderHeadline[1]} style={HEADLINE_STYLE} />
					<div style={{marginTop: 26}}>
						<MaskLine f={f} inAt={T.BUILDER_HEADLINE + 10} outAt={T.BUILD_START} text={COPY.builderSub} style={{fontSize: 38, fontWeight: 480, letterSpacing: '-0.02em', color: COLORS.textDim}} />
					</div>
				</div>
			)}

			{/* Headline E — Building… → Website ready. → Ready to sell. → Sold. */}
			{f >= T.BUILD_START && f < T.FINAL_BRAND && (
				<div style={{position: 'absolute', left: 90, top: LAYOUT.headlineY, height: 200}}>
					<div style={{position: 'absolute', left: 0, top: 0}}>
						<MaskLine f={f} inAt={T.BUILD_START + 4} outAt={T.SITE_READY - 6} text={COPY.building} style={{...HEADLINE_STYLE, color: COLORS.textDim}} inDur={10} outDur={6} />
					</div>
					<div style={{position: 'absolute', left: 0, top: 0, display: 'flex', alignItems: 'center', gap: 22}}>
						<MaskLine f={f} inAt={T.SITE_READY - 2} outAt={T.SELL_START} text={COPY.siteReady} style={HEADLINE_STYLE} inDur={10} outDur={6} />
						{f >= T.SITE_READY && f < T.SELL_START + 6 && (
							<div style={{opacity: 1 - ramp(f, T.SELL_START, 6, EASE.exit)}}>
								<Check size={72} t={ramp(f, T.SITE_READY, 14, EASE.lock)} />
							</div>
						)}
					</div>
					<div style={{position: 'absolute', left: 0, top: 0}}>
						<MaskLine f={f} inAt={T.SELL_START + 4} outAt={T.SOLD - 5} text={COPY.readyToSell} style={{...HEADLINE_STYLE, color: COLORS.textDim}} inDur={10} outDur={5} />
					</div>
					<div style={{position: 'absolute', left: 0, top: 0, display: 'flex', alignItems: 'center', gap: 22}}>
						<MaskLine f={f} inAt={T.SOLD} outAt={T.FINAL_BRAND - 10} text={COPY.sold} style={{...HEADLINE_STYLE, fontSize: 132}} inDur={9} outDur={7} />
						{sold && (
							<div style={{opacity: 1 - ramp(f, T.FINAL_BRAND - 10, 6, EASE.exit)}}>
								<Check size={96} t={soldT} />
							</div>
						)}
					</div>
				</div>
			)}

			{/* Builder tiles */}
			{f >= T.BUILDER_LOGOS[0] - 2 && tilesOut < 1 &&
				BUILDERS.map((b, i) => {
					const tin = ramp(f, T.BUILDER_LOGOS[i], 14, EASE.snap);
					const isSel = selected && i === sel;
					const hov = hoverIdx === i && !selected;
					const dim = selected && i !== sel ? 0.28 : 1;
					const lift = hov ? -8 : 0;
					const hideSel = i === sel && f >= T.BUILD_START;
					return (
						<div key={b.id} style={{position: 'absolute', left: tileX(i), top: TILE_TOP + (1 - tin) * 36 + lift, width: TILE, opacity: tin * dim * (i === sel ? 1 : 1 - tilesOut) * (hideSel ? 0 : 1)}}>
							<div
								style={{
									width: TILE,
									height: TILE,
									borderRadius: 30,
									background: COLORS.surface,
									border: `2px solid ${isSel ? COLORS.text : hov ? COLORS.lineHi : COLORS.line}`,
									display: 'flex',
									alignItems: 'center',
									justifyContent: 'center',
									transform: `scale(${press(f, T.BUILDER_SELECTED) * (f >= T.PROMPT_ARRIVE ? 1 : 1)})`,
									boxShadow: isSel ? '0 0 0 6px rgba(244,244,246,0.06), 0 30px 80px rgba(0,0,0,0.6)' : 'none',
								}}
							>
								<Img src={staticFile(b.src)} style={{width: b.w, height: b.h, objectFit: 'contain'}} />
							</div>
							<div style={{marginTop: 18, textAlign: 'center', fontFamily: FONTS.sans, fontSize: 30, fontWeight: 540, letterSpacing: '-0.015em', color: isSel || hov ? COLORS.text : COLORS.textDim}}>{b.name}</div>
						</div>
					);
				})}

			{/* Legal note while third-party marks are on screen */}
			{f >= T.BUILDER_LOGOS[0] && f < T.BUILD_START + 6 && (
				<div style={{position: 'absolute', left: 0, right: 0, top: 1420, textAlign: 'center', fontFamily: FONTS.sans, fontSize: 20, color: COLORS.textMute, opacity: ramp(f, T.BUILDER_LOGOS[3], 10) * (1 - ramp(f, T.BUILD_START, 6))}}>
					{COPY.builderLegal}
				</div>
			)}

			{/* The prompt card as a portable object */}
			{f < T.PROMPT_ARRIVE && (
				<PromptCard
					f={f}
					style={{
						transform: `translate(${cx - homeCx}px, ${cy - homeCy}px) scale(${cardScale})`,
						opacity: 1 - ramp(f, T.PROMPT_ARRIVE - 4, 4),
						filter: sendBlur > 0.3 ? `blur(${sendBlur}px)` : undefined,
					}}
				/>
			)}

			{/* Builder window → site build → shrinks into the sold row */}
			{f >= T.BUILD_START && f < T.FINAL_BRAND && (
				<div
					style={{
						position: 'absolute',
						left: winFinal.x,
						top: winFinal.y,
						width: winFinal.w,
						height: winFinal.h,
						borderRadius: lerp(30, 14, sell),
						overflow: 'hidden',
						background: COLORS.surface,
						border: `2px solid ${siteReadyFlash > 0 ? `rgba(244,244,246,${0.25 + siteReadyFlash * 0.5})` : COLORS.lineHi}`,
						boxShadow: '0 40px 140px rgba(0,0,0,0.65)',
						zIndex: 5,
						transform: `scaleY(${lerp(1, 0.004, collapse)})`,
						opacity: 1 - collapse,
					}}
				>
					<div style={{width: WIN.w, height: WIN.h, transform: `scale(${winFinal.w / WIN.w}, ${winFinal.h / WIN.h})`, transformOrigin: '0 0'}}>
						<div style={{height: CHROME, display: 'flex', alignItems: 'center', gap: 14, padding: '0 26px', background: '#0D0D11', borderBottom: `2px solid ${COLORS.line}`, position: 'relative'}}>
							<Img src={staticFile(BUILDERS[sel].src)} style={{width: 30, height: 30, objectFit: 'contain'}} />
							<div style={{fontFamily: FONTS.sans, fontSize: 24, color: COLORS.textDim}}>{BUILDERS[sel].name} · Preview</div>
							<div style={{flex: 1}} />
							<div style={{...mono, fontSize: 18, color: f >= T.SITE_READY ? COLORS.text : COLORS.textDim}}>{f >= T.SITE_READY ? 'READY' : 'BUILDING'}</div>
							<div style={{position: 'absolute', left: 0, bottom: -2, height: 3, width: `${ramp(f, T.BUILD_START, T.SITE_READY - T.BUILD_START, EASE.linear) * 100}%`, background: COLORS.text, opacity: 1 - ramp(f, T.SITE_READY + 4, 10)}} />
						</div>
						<div style={{position: 'absolute', left: 0, right: 0, top: CHROME, bottom: 0, opacity: ramp(f, T.BUILD_START + 4, 8)}}>
							<ClientSite f={f} />
						</div>
					</div>
				</div>
			)}
			{/* Selected tile flashes when the prompt lands (hand-off to the expanding window) */}
			{f >= T.PROMPT_ARRIVE - 2 && f < T.BUILD_START + 2 && (
				<div style={{position: 'absolute', left: tileX(sel), top: TILE_TOP, width: TILE, height: TILE, borderRadius: 30, background: 'rgba(244,244,246,0.12)'}} />
			)}

			{/* Prospectify pipeline: mark as sold */}
			{f >= T.SELL_START && f < T.FINAL_BRAND && (
				<div
					style={{
						position: 'absolute',
						left: 90,
						top: 680,
						width: 900,
						height: 520,
						borderRadius: 26,
						background: COLORS.surface,
						border: `2px solid ${COLORS.line}`,
						opacity: sell * (1 - collapse),
						transform: `scaleY(${lerp(1, 0.004, collapse)})`,
					}}
				>
					<div style={{height: 104, display: 'flex', alignItems: 'center', padding: '0 40px', borderBottom: `2px solid ${COLORS.line}`}}>
						<div style={{fontFamily: FONTS.sans, fontSize: 34, fontWeight: 620, letterSpacing: '-0.025em', color: COLORS.text}}>Your clients</div>
						<div style={{flex: 1}} />
						<div style={{...mono, marginRight: 16}}>WEBSITES SOLD</div>
						<div style={{position: 'relative', height: 50, width: 40, overflow: 'hidden', fontFamily: FONTS.sans, fontSize: 44, fontWeight: 650, color: COLORS.text}}>
							<div style={{position: 'absolute', top: -soldT * 50, lineHeight: '50px'}}>
								<div>1</div>
								<div>2</div>
							</div>
						</div>
					</div>
					<div style={{position: 'absolute', left: 230, top: 150, right: 40}}>
						<div style={{fontFamily: FONTS.sans, fontSize: 40, fontWeight: 620, letterSpacing: '-0.025em', color: COLORS.text}}>{LEAD.name}</div>
						<div style={{fontFamily: FONTS.sans, fontSize: 26, color: COLORS.textDim, marginTop: 6}}>{LEAD.category} · {LEAD.city}</div>
					</div>
					<div
						style={{
							position: 'absolute',
							left: 230,
							top: 270,
							height: 64,
							padding: '0 28px',
							borderRadius: 16,
							display: 'flex',
							alignItems: 'center',
							gap: 12,
							background: sold ? COLORS.accent : f >= T.MARK_SOLD_HOVER ? 'rgba(244,244,246,0.16)' : 'rgba(244,244,246,0.08)',
							border: `1.5px solid ${sold ? COLORS.accent : COLORS.lineHi}`,
							transform: `scale(${press(f, T.MARK_SOLD_CLICK)})`,
							fontFamily: FONTS.sans,
							fontSize: 28,
							fontWeight: 620,
							color: COLORS.text,
						}}
					>
						{sold ? (
							<>
								<svg width={26} height={26} viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="#fff" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" /></svg>
								Sold
							</>
						) : (
							'Mark as sold'
						)}
					</div>
					<div style={{position: 'absolute', left: 40, right: 40, top: 390, height: 2, background: COLORS.line}} />
					<div style={{position: 'absolute', left: 40, right: 40, top: 420, display: 'flex', alignItems: 'center', opacity: 0.55}}>
						<div style={{width: 64, height: 64, borderRadius: 12, background: 'rgba(244,244,246,0.08)'}} />
						<div style={{marginLeft: 26, fontFamily: FONTS.sans, fontSize: 32, fontWeight: 600, color: COLORS.text}}>Lone Star Drain Co.</div>
						<div style={{flex: 1}} />
						<div style={{fontFamily: FONTS.sans, fontSize: 26, fontWeight: 600, color: COLORS.text, padding: '10px 20px', borderRadius: 12, border: `1.5px solid rgba(230,63,109,0.6)`}}>Sold</div>
					</div>
				</div>
			)}

			{/* Cursors */}
			{f >= T.BUILDER_CURSOR_START && f < T.PROMPT_SEND + 4 && (
				<Cursor x={cur.x} y={cur.y} scale={press(f, T.BUILDER_SELECTED)} opacity={ramp(f, T.BUILDER_CURSOR_START, 6) * (1 - ramp(f, T.PROMPT_SEND, 4))} blur={Math.min(5, cur.v * 0.1)} />
			)}
			{f >= T.MARK_SOLD_HOVER - 12 && f < T.SOLD + 10 && (
				<Cursor x={sellCursor.x} y={sellCursor.y} scale={press(f, T.MARK_SOLD_CLICK)} opacity={ramp(f, T.MARK_SOLD_HOVER - 12, 5) * (1 - ramp(f, T.SOLD + 4, 6))} />
			)}
		</>
	);
};
