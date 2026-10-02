import React from 'react';
import {Img, staticFile} from 'remotion';
import {COLORS, EASE, FONTS} from '../constants/theme';
import {T} from '../constants/timeline';
import {COPY} from '../constants/copy';
import {BUILDERS, LEAD} from '../constants/demoData';
import {Cursor} from '../components/primitives';
import {BrowserChrome, ClientSite, lineScale, mono} from '../components/ui';
import {lerp, path, press, ramp} from '../motion/anim';
import {PROMPT_RECT, PromptCard} from './Product';

const TILE = 200;
const TILE_TOP = 1080;
const tileX = (i: number) => 90 + i * (TILE + (900 - 4 * TILE) / 3);
const WIN = {x: 90, y: 560, w: 900, h: 860};
const PITCH = {x: 90, y: 560, w: 900, h: 700};
const THUMB = {x: 90 + 40, y: 560 + 400, w: 220, h: 210};

/** 47–52.5s: choose a builder → prompt flies in → site builds → it becomes the pitch. */
export const Builder: React.FC<{f: number}> = ({f}) => {
	if (f < T.PROMPT_COMPRESS || f > T.SELL_IN + 10) return null;

	const sel = T.BUILDER_INDEX;
	const selC = {x: tileX(sel) + TILE / 2, y: TILE_TOP + TILE / 2};

	// prompt card: compress → hold → fly into the chosen builder (velocity-matched)
	const compress = ramp(f, T.PROMPT_COMPRESS, 18, EASE.glide);
	const send = ramp(f, T.PROMPT_SEND, T.PROMPT_ARRIVE - T.PROMPT_SEND, EASE.exit);
	const homeCx = PROMPT_RECT.x + PROMPT_RECT.w / 2;
	const homeCy = PROMPT_RECT.y + PROMPT_RECT.h / 2;
	const scale = lerp(lerp(1, 0.5, compress), 0.06, send);
	const cx = lerp(homeCx, selC.x, send);
	const cy = lerp(lerp(homeCy, 830, compress), selC.y, send);
	const sendBlur = send > 0 && send < 1 ? Math.sin(send * Math.PI) * 10 : 0;

	const cur = path(f, [
		[T.BUILDER_CURSOR, 760, 1020],
		[T.BUILDER_HOVERS[0], tileX(3) + 110, 1170],
		[T.BUILDER_HOVERS[1], tileX(2) + 110, 1166],
		[T.BUILDER_HOVERS[2], tileX(1) + 110, 1170],
		[T.BUILDER_SELECTED - 2, tileX(0) + 110, 1166],
	]);
	const hoverIdx = f < T.BUILDER_HOVERS[0] - 2 ? -1 : f < T.BUILDER_HOVERS[1] - 2 ? 3 : f < T.BUILDER_HOVERS[2] - 2 ? 2 : f < T.BUILDER_SELECTED - 4 ? 1 : 0;
	const selected = f >= T.BUILDER_SELECTED;
	const tilesOut = ramp(f, T.BUILD_START, 10, EASE.exit);

	// build window grows out of the chosen tile
	const expand = ramp(f, T.BUILD_START, 16, EASE.glide);
	const toPitch = ramp(f, T.PITCH_IN, 18, EASE.glide);
	const win = {
		x: lerp(lerp(tileX(sel), WIN.x, expand), THUMB.x, toPitch),
		y: lerp(lerp(TILE_TOP, WIN.y, expand), THUMB.y, toPitch),
		w: lerp(lerp(TILE, WIN.w, expand), THUMB.w, toPitch),
		h: lerp(lerp(TILE, WIN.h, expand), THUMB.h, toPitch),
	};
	const readyFlash = f >= T.SITE_READY ? Math.max(0, 1 - (f - T.SITE_READY) / 20) : 0;
	const pitchCollapse = lineScale(f, T.SELL_IN - 8);

	return (
		<>
			{/* builder tiles */}
			{f >= T.BUILDER_LOGOS[0] - 2 &&
				tilesOut < 1 &&
				BUILDERS.map((b, i) => {
					const tin = ramp(f, T.BUILDER_LOGOS[i], 14, EASE.snap);
					const isSel = selected && i === sel;
					const hov = hoverIdx === i && !selected;
					return (
						<div
							key={b.id}
							style={{
								position: 'absolute',
								left: tileX(i),
								top: TILE_TOP + (1 - tin) * 36 + (hov ? -8 : 0),
								width: TILE,
								opacity: tin * (selected && i !== sel ? 0.28 : 1) * (i === sel ? (f >= T.BUILD_START ? 0 : 1) : 1 - tilesOut),
							}}
						>
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
									transform: `scale(${isSel ? press(f, T.BUILDER_SELECTED) : 1})`,
									boxShadow: isSel ? '0 0 0 6px rgba(244,244,246,0.06), 0 30px 80px rgba(0,0,0,0.6)' : 'none',
								}}
							>
								<Img src={staticFile(b.src)} style={{width: b.w, height: b.h, objectFit: 'contain'}} />
							</div>
							<div style={{marginTop: 18, textAlign: 'center', fontFamily: FONTS.sans, fontSize: 30, fontWeight: 540, letterSpacing: '-0.015em', color: isSel || hov ? COLORS.text : COLORS.textDim}}>{b.name}</div>
						</div>
					);
				})}

			{f >= T.BUILDER_LOGOS[3] && f < T.BUILD_START + 6 && (
				<div style={{position: 'absolute', left: 0, right: 0, top: 1430, textAlign: 'center', fontFamily: FONTS.sans, fontSize: 21, color: COLORS.textMute, opacity: ramp(f, T.BUILDER_LOGOS[3], 10) * (1 - ramp(f, T.BUILD_START, 6))}}>
					{COPY.builderLegal}
				</div>
			)}

			{f < T.PROMPT_ARRIVE && (
				<PromptCard
					f={f}
					style={{
						transform: `translate(${cx - homeCx}px, ${cy - homeCy}px) scale(${scale})`,
						opacity: 1 - ramp(f, T.PROMPT_ARRIVE - 4, 4),
						filter: sendBlur > 0.3 ? `blur(${sendBlur}px)` : undefined,
					}}
				/>
			)}
			{f >= T.PROMPT_ARRIVE - 2 && f < T.BUILD_START + 3 && <div style={{position: 'absolute', left: tileX(sel), top: TILE_TOP, width: TILE, height: TILE, borderRadius: 30, background: 'rgba(244,244,246,0.14)'}} />}

			{/* The pitch: outreach + the site attached */}
			{f >= T.PITCH_IN && (
				<div
					style={{
						position: 'absolute',
						left: PITCH.x,
						top: PITCH.y,
						width: PITCH.w,
						height: PITCH.h,
						borderRadius: 26,
						background: COLORS.surface,
						border: `2px solid ${COLORS.line}`,
						boxShadow: '0 40px 120px rgba(0,0,0,0.55)',
						opacity: ramp(f, T.PITCH_IN + 4, 12),
						transform: `scaleY(${pitchCollapse})`,
					}}
				>
					<div style={{height: 96, display: 'flex', alignItems: 'center', padding: '0 40px', borderBottom: `2px solid ${COLORS.line}`, gap: 14}}>
						<div style={{...mono, color: COLORS.text}}>OUTREACH</div>
						<div style={{fontFamily: FONTS.sans, fontSize: 26, color: COLORS.textDim}}>· {LEAD.name}</div>
						<div style={{flex: 1}} />
						<div
							style={{
								height: 54,
								padding: '0 24px',
								borderRadius: 14,
								display: 'flex',
								alignItems: 'center',
								background: f >= T.PITCH_CONFIRM ? COLORS.text : 'rgba(244,244,246,0.1)',
								color: f >= T.PITCH_CONFIRM ? COLORS.bg : COLORS.text,
								transform: `scale(${press(f, T.PITCH_COPY)})`,
								fontFamily: FONTS.sans,
								fontSize: 26,
								fontWeight: 620,
							}}
						>
							{f >= T.PITCH_CONFIRM ? 'Copied ✓' : 'Copy'}
						</div>
					</div>
					<div style={{padding: '30px 40px', fontFamily: FONTS.sans, fontSize: 32, lineHeight: 1.38, color: COLORS.text, letterSpacing: '-0.012em', height: 270}}>{LEAD.outreach}</div>
					<div style={{position: 'absolute', left: 300, top: 430, fontFamily: FONTS.sans}}>
						<div style={{fontSize: 30, fontWeight: 620, color: COLORS.text, letterSpacing: '-0.02em'}}>Free preview</div>
						<div style={{fontSize: 25, color: COLORS.textDim, marginTop: 6}}>Built from your prompt</div>
					</div>
				</div>
			)}

			{/* Builder window → site → shrinks into the pitch as an attachment */}
			{f >= T.BUILD_START && (
				<div
					style={{
						position: 'absolute',
						left: win.x,
						top: win.y,
						width: win.w,
						height: win.h,
						borderRadius: lerp(30, 16, toPitch),
						overflow: 'hidden',
						background: COLORS.surface,
						border: `2px solid ${readyFlash > 0 ? `rgba(244,244,246,${0.25 + readyFlash * 0.5})` : COLORS.lineHi}`,
						boxShadow: '0 40px 140px rgba(0,0,0,0.65)',
						zIndex: 5,
						transform: `scaleY(${pitchCollapse})`,
						transformOrigin: `50% ${PITCH.y + PITCH.h / 2 - win.y}px`,
					}}
				>
					<div style={{width: WIN.w, height: WIN.h, transform: `scale(${win.w / WIN.w}, ${win.h / WIN.h})`, transformOrigin: '0 0'}}>
						<BrowserChrome
							label={
								<>
									<Img src={staticFile(BUILDERS[sel].src)} style={{width: 28, height: 28, objectFit: 'contain'}} />
									Your builder · Preview
								</>
							}
							right={<div style={{...mono, fontSize: 18, color: f >= T.SITE_READY ? COLORS.text : COLORS.textDim}}>{f >= T.SITE_READY ? 'READY' : 'BUILDING'}</div>}
							progress={ramp(f, T.BUILD_START, T.SITE_READY - T.BUILD_START, EASE.linear)}
						/>
						<div style={{position: 'absolute', left: 0, right: 0, top: 64, bottom: 0, opacity: ramp(f, T.BUILD_START + 4, 8)}}>
							<ClientSite f={f} steps={T.BUILD_STEPS} />
						</div>
					</div>
				</div>
			)}

			{f >= T.BUILDER_CURSOR && f < T.PROMPT_SEND + 4 && (
				<Cursor x={cur.x} y={cur.y} scale={press(f, T.BUILDER_SELECTED)} opacity={ramp(f, T.BUILDER_CURSOR, 6) * (1 - ramp(f, T.PROMPT_SEND, 4))} blur={Math.min(5, cur.v * 0.1)} />
			)}
			{f >= T.PITCH_COPY - 16 && f < T.PITCH_CONFIRM + 14 && (
				<Cursor
					x={path(f, [[T.PITCH_COPY - 16, 760, 900], [T.PITCH_COPY - 3, 900, 610]]).x}
					y={path(f, [[T.PITCH_COPY - 16, 760, 900], [T.PITCH_COPY - 3, 900, 610]]).y}
					scale={press(f, T.PITCH_COPY)}
					opacity={ramp(f, T.PITCH_COPY - 16, 5) * (1 - ramp(f, T.PITCH_CONFIRM + 6, 8))}
				/>
			)}
		</>
	);
};
