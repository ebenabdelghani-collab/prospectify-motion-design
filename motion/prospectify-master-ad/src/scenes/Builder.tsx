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
import {Camera, CamKey, Emoji, Sheen} from '../fx/camera';
import {Phone, SCREEN} from './pain/screens';
import {Laptop3D, Phone3D} from '../fx/devices';

const TILE = 200;
const TILE_TOP = 1080;
const tileX = (i: number) => 90 + i * (TILE + (900 - 4 * TILE) / 3);
const WIN = {x: 90, y: 560, w: 900, h: 860}; // content base
const DESK = {x: 50, y: 590, w: 770, h: 736}; // on-screen desktop rect while building
const PHONE_AT = {x: 700, y: 860, s: 0.5};
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
	const expand = ramp(f, T.BUILD_START, 1, EASE.linear); // the camera dive covers the hand-off
	const toPitch = ramp(f, T.PITCH_IN, 18, EASE.glide);
	const win = {
		x: lerp(lerp(tileX(sel), DESK.x, expand), THUMB.x, toPitch),
		y: lerp(lerp(TILE_TOP, DESK.y, expand), THUMB.y, toPitch),
		w: lerp(lerp(TILE, DESK.w, expand), THUMB.w, toPitch),
		h: lerp(lerp(TILE, DESK.h, expand), THUMB.h, toPitch),
	};
	const readyFlash = f >= T.SITE_READY ? Math.max(0, 1 - (f - T.SITE_READY) / 20) : 0;
	const pitchCollapse = lineScale(f, T.SELL_IN - 8);

	const tc = {x: tileX(sel) + TILE / 2, y: TILE_TOP + TILE / 2};
	const CAM: CamKey[] = [
		[T.PROMPT_COMPRESS, 540, 960, 1.0],
		[T.BUILDER_SELECTED - 2, 540, 1010, 1.06, 0, EASE.linear],
		[T.BUILDER_SELECTED + 3, 520, 1040, 1.1, 0, EASE.exit],
		[T.PROMPT_ARRIVE - 1, tc.x, tc.y, 5.2, 0, EASE.exit],
		[T.BUILD_START, 520, 1010, 1.7],
		[T.BUILD_START + 14, 520, 1010, 1.0, 0, EASE.snap],
		[T.SITE_READY, 540, 1000, 1.06, 0, EASE.linear],
		[T.SITE_READY + 8, 540, 990, 1.1, 0, EASE.exit],
		[T.PITCH_IN + 18, 540, 960, 1.0, 0, EASE.snap],
		[T.PITCH_COPY, 640, 760, 1.18],
		[T.SELL_IN, 540, 960, 1.0],
	];
	const phoneIn = ramp(f, T.BUILD_START + 6, 18, EASE.snap) * (1 - ramp(f, T.PITCH_IN - 4, 12, EASE.exit));

	return (
		<Camera f={f} keys={CAM}>
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
								top: TILE_TOP + (1 - tin) * 60 + (hov ? -14 : 0) + Math.abs(i - 1.5) * 26,
								transform: `perspective(1400px) rotateY(${(1.5 - i) * 14}deg) rotateX(${(1 - tin) * 50}deg) translateZ(${hov || (selected && i === sel) ? 60 : 0}px)`,
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

			{/* During the build: a real laptop, lid opening as we land inside the builder */}
			{f >= T.BUILD_START && f < T.PITCH_IN + 6 && (() => {
				const open = ramp(f, T.BUILD_START, 22, EASE.snap);
				const out = ramp(f, T.PITCH_IN - 4, 10, EASE.exit);
				const scroll = ramp(f, T.BUILD_STEPS[2], T.SITE_READY - T.BUILD_STEPS[2] + 12, EASE.glide) * 330;
				return (
					<div style={{position: 'absolute', left: 40, top: 640, opacity: 1 - out, transform: `scale(${1 - out * 0.15})`, transformOrigin: '400px 300px'}}>
						<Laptop3D w={800} rx={lerp(36, 26, open)} ry={lerp(-30, -14, ramp(f, T.BUILD_START, T.PITCH_IN - T.BUILD_START, EASE.glide))} open={lerp(20, 104, open)}>
							<div style={{width: 900, height: 535, transform: `scale(${(800 - 2 * 800 * 0.022) / 900})`, transformOrigin: '0 0', position: 'relative', overflow: 'hidden', background: COLORS.surface}}>
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
								<div style={{position: 'absolute', left: 0, right: 0, top: 64, height: 860, transform: `translateY(${-scroll}px)`}}>
									<ClientSite f={f} steps={T.BUILD_STEPS} />
								</div>
							</div>
						</Laptop3D>
					</div>
				);
			})()}

			{/* Pitch: the site shrinks into the message as an attachment */}
			{f >= T.PITCH_IN - 2 && (
				<div
					style={{
						opacity: ramp(f, T.PITCH_IN - 2, 6),
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

			{/* the same site, mobile — the thing their old site got wrong */}
			{phoneIn > 0 && (
				<div style={{position: 'absolute', left: PHONE_AT.x, top: PHONE_AT.y + (1 - phoneIn) * 220, transform: `scale(${PHONE_AT.s}) rotate(${(1 - phoneIn) * 8}deg)`, transformOrigin: '0 0', opacity: phoneIn, zIndex: 8}}>
					<Phone3D w={600} h={1240} ry={lerp(-34, -16, phoneIn)} rx={8} rz={-2}>
						<MobileSite f={f} />
					</Phone3D>
				</div>
			)}
		</Camera>
	);
};

const MS = COLORS.site;
const MStep: React.FC<{f: number; at: number; children: React.ReactNode; style?: React.CSSProperties}> = ({f, at, children, style}) => {
	const t = ramp(f, at, 12, EASE.snap);
	return <div style={{opacity: f >= at ? Math.min(1, t * 2) : 0, transform: `translateY(${(1 - t) * -40}px) scale(${1 + (1 - t) * 0.08})`, ...style}}>{children}</div>;
};
const MobileSite: React.FC<{f: number}> = ({f}) => {
	const s = T.BUILD_STEPS;
	return (
		<div style={{position: 'absolute', inset: 0, background: MS.bg, fontFamily: FONTS.sans, color: MS.ink, padding: '70px 34px 0'}}>
			<MStep f={f} at={s[0]} style={{display: 'flex', alignItems: 'center', height: 70}}>
				<svg width={40} height={40} viewBox="0 0 24 24">
					<path d="M12 2.5C9 7 6 10.2 6 14a6 6 0 0 0 12 0c0-3.8-3-7-6-11.5Z" fill={MS.brand} />
				</svg>
				<div style={{marginLeft: 12, fontSize: 32, fontWeight: 750, letterSpacing: '-0.03em'}}>Bellwood</div>
				<div style={{flex: 1}} />
				<svg width={40} height={40} viewBox="0 0 24 24">
					<path d="M4 7h16M4 12h16M4 17h16" stroke={MS.ink} strokeWidth={2.4} strokeLinecap="round" />
				</svg>
			</MStep>
			<MStep f={f} at={s[1]} style={{marginTop: 40}}>
				<div style={{fontSize: 76, fontWeight: 780, letterSpacing: '-0.055em', lineHeight: 0.95}}>
					Austin’s
					<br />
					trusted
					<br />
					plumbers.
				</div>
				<div style={{fontSize: 28, color: MS.inkDim, marginTop: 18}}>4.8★ from 126 neighbors</div>
			</MStep>
			<MStep f={f} at={s[2]} style={{marginTop: 30, height: 260, borderRadius: 26, background: `linear-gradient(120deg, ${MS.brand}, #1C4FB8 50%, ${MS.ink})`, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
				<Emoji c="🔧" size={110} />
			</MStep>
			<MStep f={f} at={s[4]} style={{marginTop: 30, height: 104, borderRadius: 22, background: MS.ink, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, fontWeight: 700}}>
				📞 Call now
			</MStep>
			<MStep f={f} at={s[4] + 3} style={{marginTop: 16, height: 104, borderRadius: 22, border: `3px solid ${MS.ink}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, fontWeight: 700}}>
				Book online
			</MStep>
		</div>
	);
};
