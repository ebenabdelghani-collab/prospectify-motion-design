import React from 'react';
import {Img, staticFile} from 'remotion';
import {C, EASE, FONT, T, lerp, press, ramp} from '../tokens';
import {Rect, rectLerp} from '../kit/camera';
import {Cursor} from '../kit/cursor';
import {Icon} from '../kit/icons';
import {Glow, LockCorners, ReadyTag, SignalLine} from '../kit/signal';
import {Kinetic, Mono} from '../kit/type';
import {BELLA, BELLA_THEME, MobileSite, REGIONS, SITE_H, SITE_W, STEP_KEYS, Website} from '../kit/website';
import {PROMPT_TEXT} from '../data';
import {PROMPT_BIG} from './Dossier';

/**
 * 9 · YOUR PROMPT, YOUR BUILDER — official marks (motion-source/builders, unmodified) as a choice.
 * 10 · TRANSFER → BUILD → PITCH — the prompt travels along the signal into the chosen builder and the
 * prompt's sections become the website's regions. No hard cuts.
 * Marks are presented as the user's choice only: no partnership or integration is implied.
 */
const BUILDERS = [
	{name: 'Lovable', src: 'final/builders/lovable-logomark-color.svg', w: 102, h: 104},
	{name: 'Claude', src: 'final/builders/claude-spark-clay.svg', w: 104, h: 104},
	{name: 'Bolt', src: 'final/builders/bolt-wordmark-white.svg', w: 212, h: 60},
	{name: 'Base44', src: 'final/builders/base44-icon-site.png', w: 100, h: 100},
];
const TILE = (i: number): Rect => ({x: i % 2 === 0 ? 90 : 555, y: i < 2 ? 930 : 1176, w: 435, h: 226});
const PICK = 0; // Lovable
const OBJ: Rect = {x: 90, y: 470, w: 900, h: 300};
const PILL: Rect = {x: 290, y: 580, w: 500, h: 84};
const WIN: Rect = {x: 60, y: 290, w: 960, h: 1290};
const INPUT_H = 110;
const LABELS = ['Pages', 'Business', 'Offer', 'CTA', 'Services', 'Style', 'Local context', 'Goal'];

export const Builder: React.FC<{f: number}> = ({f}) => {
	if (f < T.BUILDER_IN - 2 || f > T.SELL_IN + 30) return null;
	const inB = ramp(f, T.BUILDER_IN, 26, EASE.CAMERA);
	const tiles = T.BUILDER_TILES as unknown as number[];
	const hovers = T.BUILDER_HOVERS as unknown as number[];
	const picked = ramp(f, T.BUILDER_CLICK, 10, EASE.FAST_LOCK);
	const compress = ramp(f, T.TRANSFER_START, 12, EASE.FAST_LOCK);
	const travel = ramp(f, T.TRANSFER_START + 8, T.TRANSFER_ARRIVE - T.TRANSFER_START - 8, EASE.CAMERA);
	const arrived = f >= T.TRANSFER_ARRIVE;
	const open = ramp(f, T.TRANSFER_ARRIVE - 2, 26, EASE.HEAVY);
	const steps = T.WEB_STEPS as unknown as number[];
	const mobile = ramp(f, T.WEB_MOBILE, 24, EASE.FAST_LOCK);
	const pitch = ramp(f, T.PITCH_IN, 34, EASE.CAMERA);
	const sent = f >= T.PITCH_SENT;
	const out = ramp(f, T.SELL_IN, 20, EASE.EXIT);
	const choiceOut = ramp(f, T.TRANSFER_ARRIVE - 4, 16, EASE.EXIT);
	// prompt object: expanded prompt (from the dossier) → compact object → pill → travels to the tile
	const objR = f < T.TRANSFER_START ? rectLerp(PROMPT_BIG, OBJ, inB) : rectLerp(OBJ, PILL, compress);
	const tile = TILE(PICK);
	const pathD = `M ${PILL.x + PILL.w / 2} ${PILL.y + PILL.h / 2} C ${PILL.x + PILL.w / 2} ${PILL.y + 300}, ${tile.x + tile.w / 2 + 80} ${tile.y - 80}, ${tile.x + tile.w / 2} ${tile.y + tile.h / 2}`;
	const px = lerp(PILL.x + PILL.w / 2, tile.x + tile.w / 2, travel) + Math.sin(Math.PI * travel) * 60;
	const py = lerp(PILL.y + PILL.h / 2, tile.y + tile.h / 2, EASE.SOFT(travel));
	// builder window grows out of the chosen tile
	const winR = rectLerp(tile, WIN, open);
	const pasteAt = T.VO.v_paste.start;
	const pasted = ramp(f, pasteAt - 2, 8, EASE.FAST_LOCK);
	const enter = steps[0] - 8;
	const canvasScale = (WIN.w - 40) / SITE_W;
	return (
		<div style={{position: 'absolute', inset: 0, opacity: 1 - out}}>
			{/* headline + selector */}
			<div style={{position: 'absolute', inset: 0, opacity: (1 - choiceOut) * inB}}>
				<div style={{position: 'absolute', left: 90, top: 250, width: 900}}>
					<Kinetic f={f} inAt={T.BUILDER_IN + 6} text={'Your prompt.\nYour builder.'} size={84} weight={780} accent={['builder.']} accentColor={C.text} stagger={4} />
				</div>
				<div style={{position: 'absolute', left: 90, top: 862, opacity: ramp(f, tiles[0] - 6, 12)}}>
					<Mono size={20} color={C.text2}>Select your AI tool</Mono>
				</div>
				{BUILDERS.map((b, i) => {
					const r = TILE(i);
					const t = ramp(f, tiles[i], 18, EASE.FAST_LOCK);
					const hv = i === 1 ? hovers[0] : i === 2 ? hovers[1] : i === 0 ? hovers[2] : -1;
					const hover = hv > 0 ? ramp(f, hv, 6) * (i === PICK ? 1 : 1 - ramp(f, hovers[Math.min(2, hovers.indexOf(hv) + 1)], 6)) : 0;
					const sel = i === PICK ? picked : 0;
					const isPick = i === PICK;
					return (
						<div
							key={b.name}
							style={{
								position: 'absolute',
								left: r.x,
								top: r.y,
								width: r.w,
								height: r.h,
								borderRadius: 28,
								background: isPick && sel > 0 ? `linear-gradient(180deg, rgba(${C.accentRGB},${0.08 * sel}) 0%, rgba(${C.accentRGB},0.02) 100%), #151518` : '#151518',
								border: `${1.5 + sel}px solid ${sel > 0 ? `rgba(${C.accentRGB},${0.3 + 0.5 * sel})` : `rgba(255,255,255,${0.1 + hover * 0.16})`}`,
								opacity: t * (isPick ? 1 : 1 - picked * 0.55),
								transform: `translateY(${(1 - t) * 50 - hover * 6}px) scale(${press(f, isPick ? T.BUILDER_CLICK : -99)})`,
								display: 'flex',
								flexDirection: 'column',
								alignItems: 'center',
								justifyContent: 'center',
								gap: 18,
							}}
						>
							<Img src={staticFile(b.src)} style={{width: b.w, height: b.h, objectFit: 'contain'}} />
							<div style={{fontFamily: FONT.sans, fontSize: 25, fontWeight: 600, color: C.text2}}>{b.name}</div>
							{isPick && sel > 0 && (
								<div style={{position: 'absolute', right: 20, top: 20, width: 40, height: 40, borderRadius: 20, background: C.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${sel})`}}>
									<Icon n="check" size={24} color="#fff" sw={3} />
								</div>
							)}
						</div>
					);
				})}
				<div style={{position: 'absolute', left: 90, top: 1440, width: 900, fontFamily: FONT.sans, fontSize: 19, fontWeight: 500, color: C.text3, opacity: ramp(f, tiles[3], 14)}}>Trademarks belong to their owners. No affiliation implied.</div>
			</div>
			{/* the prompt object */}
			{!arrived && (
				<div
					style={{
						position: 'absolute',
						left: f >= T.TRANSFER_START + 8 ? px - (PILL.w * lerp(1, 0.45, travel)) / 2 : objR.x,
						top: f >= T.TRANSFER_START + 8 ? py - (PILL.h * lerp(1, 0.45, travel)) / 2 : objR.y,
						width: f >= T.TRANSFER_START + 8 ? PILL.w * lerp(1, 0.45, travel) : objR.w,
						height: f >= T.TRANSFER_START + 8 ? PILL.h * lerp(1, 0.45, travel) : objR.h,
						borderRadius: lerp(lerp(36, 28, inB), 42, compress),
						background: 'linear-gradient(180deg, #1a1a1e 0%, #141417 100%)',
						border: `1.5px solid rgba(${C.accentRGB},${0.35 + 0.4 * compress})`,
						boxShadow: `0 40px 100px rgba(0,0,0,0.6), 0 0 ${40 * compress}px rgba(${C.accentRGB},${0.35 * compress})`,
						overflow: 'hidden',
					}}
				>
					<div style={{position: 'absolute', inset: 0, opacity: 1 - compress}}>
						<div style={{position: 'absolute', left: 34, top: 28, display: 'flex', alignItems: 'center', gap: 12}}>
							<Icon n="sparkles" size={26} color={C.accent} />
							<Mono size={20} color={C.text2}>Website prompt · Bella Forno Trattoria</Mono>
						</div>
						<div style={{position: 'absolute', right: 26, top: 20}}>
							<ReadyTag f={f} at={T.BUILDER_IN - 30} />
						</div>
						<div style={{position: 'absolute', left: 34, right: 34, top: 88, fontFamily: FONT.sans, fontSize: 28, fontWeight: 500, lineHeight: 1.42, color: C.text2, height: 160, overflow: 'hidden', maskImage: 'linear-gradient(180deg, #000 55%, transparent)'}}>{PROMPT_TEXT}</div>
					</div>
					<div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14, opacity: compress, fontFamily: FONT.sans, fontSize: 28, fontWeight: 700, color: C.text}}>
						<Icon n="sparkles" size={28} color={C.accent} />
						Prompt · ready to paste
					</div>
				</div>
			)}
			<SignalLine d={pathD} f={f} start={T.TRANSFER_START + 8} dur={T.TRANSFER_ARRIVE - T.TRANSFER_START - 8} tail={0.45} width={3.2} />
			{/* builder window (neutral) */}
			{f >= T.TRANSFER_ARRIVE - 2 && (() => {
				const thumb: Rect = {x: 196, y: 1012, w: 560, h: 330};
				const canvas: Rect = {x: winR.x + 20, y: winR.y + 74, w: winR.w - 40, h: winR.h - 74 - INPUT_H};
				const live = rectLerp(canvas, thumb, pitch);
				const sc = live.w / SITE_W;
				return (
					<>
						<div style={{position: 'absolute', left: winR.x, top: winR.y, width: winR.w, height: winR.h, borderRadius: lerp(28, 30, open), background: '#121214', border: `1.5px solid ${C.lineStrong}`, boxShadow: '0 60px 140px rgba(0,0,0,0.6)', opacity: 1 - pitch, overflow: 'hidden'}}>
							<div style={{height: 74, display: 'flex', alignItems: 'center', gap: 14, padding: '0 26px', borderBottom: `1px solid ${C.line}`, opacity: open}}>
								<Img src={staticFile(BUILDERS[PICK].src)} style={{width: 32, height: 33}} />
								<div style={{fontFamily: FONT.sans, fontSize: 24, fontWeight: 650, color: C.text}}>{BUILDERS[PICK].name}</div>
								<Mono size={16} color={C.text3} style={{marginLeft: 6}}>your builder</Mono>
								<div style={{flex: 1}} />
								<Mono size={16} color={f >= steps[0] ? C.text2 : C.text3}>{f >= steps[7] + 10 ? 'preview ready' : f >= steps[0] ? 'building…' : 'new project'}</Mono>
							</div>
							{/* input with the pasted prompt */}
							<div style={{position: 'absolute', left: 20, right: 20, bottom: 20, height: INPUT_H - 30, borderRadius: 20, background: '#1a1a1e', border: `1.5px solid ${pasted > 0 && f < enter ? `rgba(${C.accentRGB},0.5)` : C.lineStrong}`, display: 'flex', alignItems: 'center', gap: 14, padding: '0 22px', opacity: open}}>
								<div style={{flex: 1, fontFamily: FONT.sans, fontSize: 24, fontWeight: 500, color: f < enter ? C.text : C.text3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{f < enter ? (pasted > 0 ? PROMPT_TEXT : 'Ask your builder to create…') : 'Ask for changes…'}</div>
								<div style={{width: 48, height: 48, borderRadius: 24, background: f < enter && pasted > 0 ? C.text : '#2a2a2e', display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${press(f, enter)})`}}>
									<Icon n="arrowRight" size={24} color={f < enter && pasted > 0 ? '#09090b' : '#5a5a60'} sw={2.6} style={{transform: 'rotate(-90deg)'}} />
								</div>
							</div>
						</div>
						{/* PITCH: the site becomes the link preview in the message */}
						{pitch > 0 && (
							<div style={{position: 'absolute', inset: 0, opacity: pitch}}>
								<div style={{position: 'absolute', left: 90, top: 300}}>
									<Kinetic f={f} inAt={T.PITCH_IN + 4} text="Pitch." size={112} weight={800} />
								</div>
								<div style={{position: 'absolute', left: 170, top: 760, width: 820, borderRadius: '30px 30px 8px 30px', background: '#1c1c21', border: `1.5px solid ${C.lineStrong}`, padding: '28px 26px 26px', boxSizing: 'border-box', height: 680}}>
									<div style={{fontFamily: FONT.sans, fontSize: 28, fontWeight: 500, lineHeight: 1.4, color: C.text, width: 760}}>Hi Bella Forno team — I made you a quick preview: mobile-first, with online booking.</div>
								</div>
								<div style={{position: 'absolute', left: 196, top: 1012 + 336, width: 560, fontFamily: FONT.sans, fontSize: 22, fontWeight: 600, color: C.text2}}>bellaforno-preview.site</div>
								<div style={{position: 'absolute', right: 96, top: 1452, display: 'flex', alignItems: 'center', gap: 8, fontFamily: FONT.sans, fontSize: 22, fontWeight: 600, color: sent ? C.text2 : C.text3}}>
									{sent ? 'Sent' : 'Sending…'}
									<Icon n="check" size={22} color={sent ? '#8ab4f8' : C.text3} sw={2.6} />
								</div>
							</div>
						)}
						{/* the site: lives in the canvas, then becomes the pitch's link preview */}
						<div style={{position: 'absolute', left: live.x, top: live.y, width: live.w, height: live.h, borderRadius: 16, overflow: 'hidden', opacity: open}}>
							<div style={{position: 'absolute', left: 0, top: 0, width: SITE_W, height: SITE_H, transform: `scale(${sc})`, transformOrigin: '0 0'}}>
								<Website f={f} steps={steps} theme={BELLA_THEME} c={BELLA} />
							</div>
						</div>
						{/* prompt sections fly from the input into the regions they become */}
						{f < steps[7] + 20 &&
							STEP_KEYS.map((k, i) => {
								const at = steps[i];
								const t = ramp(f, at - 14, 16, EASE.CAMERA);
								if (f < at - 14 || f > at + 8) return null;
								const r = REGIONS[k];
								const tx = canvas.x + (r.x + r.w / 2) * canvasScale;
								const ty = canvas.y + (r.y + Math.min(r.h, 120) / 2) * canvasScale;
								const sx = canvas.x + 120 + i * 30;
								const sy = winR.y + winR.h - INPUT_H / 2;
								return (
									<div key={k} style={{position: 'absolute', left: lerp(sx, tx, t), top: lerp(sy, ty, t) - Math.sin(Math.PI * t) * 60, transform: `translate(-50%, -50%) scale(${lerp(1, 1.25, t)})`, opacity: 1 - ramp(f, at, 8), height: 40, padding: '0 14px', borderRadius: 10, background: `rgba(${C.accentRGB},0.16)`, border: `1.5px solid rgba(${C.accentRGB},0.7)`, display: 'flex', alignItems: 'center', fontFamily: FONT.mono, fontSize: 17, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#ffd0da', whiteSpace: 'nowrap'}}>
										{LABELS[i]}
									</div>
								);
							})}
						{/* responsive state */}
						{mobile > 0 && (
							<div style={{position: 'absolute', left: lerp(1100, 640, mobile), top: 780, width: 404, height: 820, borderRadius: 60, background: '#0b0b0d', boxShadow: '0 0 0 2px #2a2a31, 0 50px 120px rgba(0,0,0,0.7)', transform: `perspective(1600px) rotateY(${lerp(-24, -10, mobile)}deg)`, opacity: mobile * (1 - pitch)}}>
								<div style={{position: 'absolute', left: 12, top: 12, right: 12, bottom: 12, borderRadius: 48, overflow: 'hidden'}}>
									<div style={{position: 'absolute', left: 0, top: 0, width: 380, height: 796}}>
										<MobileSite theme={BELLA_THEME} c={BELLA} />
									</div>
								</div>
							</div>
						)}
						<LockCorners f={f} at={T.WEB_LOCK} x={WIN.x} y={WIN.y} w={WIN.w} h={WIN.h - INPUT_H} spread={50} len={46} stroke={4} hold={12} />
						<Glow x={540} y={900} r={700} o={ramp(f, T.WEB_LOCK, 6) * (1 - ramp(f, T.WEB_LOCK + 6, 30)) * 0.5} />
					</>
				);
			})()}
			<Cursor
				f={f}
				show={[hovers[0] - 14, T.BUILDER_CLICK + 12]}
				keys={[
					[hovers[0] - 22, 1010, 1650],
					[hovers[0], TILE(1).x + 250, TILE(1).y + 130],
					[hovers[1], TILE(2).x + 230, TILE(2).y + 130],
					[hovers[2], TILE(0).x + 260, TILE(0).y + 120],
					[T.BUILDER_CLICK, TILE(0).x + 250, TILE(0).y + 118],
					[T.BUILDER_CLICK + 12, 980, 1660],
				]}
				clicks={[T.BUILDER_CLICK]}
			/>
		</div>
	);
};
