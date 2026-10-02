import React from 'react';
import {C, EASE, FONT, T, lerp, press, ramp} from '../tokens';
import {Cursor} from '../kit/cursor';
import {Icon} from '../kit/icons';
import {Rect, rectLerp} from '../kit/camera';
import {Glow, ReadyOutline, ReadyTag, SignalLine} from '../kit/signal';
import {Mono, reveal} from '../kit/type';
import {GradButton, LeadRow} from '../kit/ui';
import {HERO, OUTREACH_MESSAGE, PHONE, PROMPT_FIELDS, PROMPT_TEXT} from '../data';
import {HERO_CARD} from './Search';

/**
 * 7 · DOSSIER (CONTACT · ANGLE · OUTREACH → READY) and 8 · BUILD PROMPT (the second reveal).
 * The signal travels down a rail from the lead's identity into each module; each one resolves to READY.
 * Then everything recedes, one module remains, and the business itself flows into the prompt.
 */
const M = {
	contact: {x: 90, y: 548, w: 900, h: 162},
	angle: {x: 90, y: 730, w: 900, h: 170},
	outreach: {x: 90, y: 920, w: 900, h: 392},
	prompt: {x: 90, y: 1332, w: 900, h: 126},
};
export const PROMPT_BIG: Rect = {x: 60, y: 290, w: 960, h: 1260};
const RAIL = 58;

const ModuleShell: React.FC<{r: Rect; label: string; icon: string; on: number; readyAt: number; f: number; children?: React.ReactNode; style?: React.CSSProperties}> = ({r, label, icon, on, readyAt, f, children, style}) => (
	<div style={{position: 'absolute', left: r.x, top: r.y, width: r.w, height: r.h, borderRadius: 26, background: 'linear-gradient(180deg, #17171b 0%, #141417 100%)', border: `1.5px solid ${C.lineStrong}`, opacity: lerp(0.4, 1, on), ...style}}>
		<ReadyOutline f={f} at={readyAt} w={r.w} h={r.h} r={26} />
		<div style={{position: 'absolute', left: 30, top: 24, display: 'flex', alignItems: 'center', gap: 12}}>
			<Icon n={icon} size={24} color={on > 0.5 ? C.accent : C.text3} sw={2.2} />
			<Mono size={19} color={on > 0.5 ? C.text2 : C.text3}>{label}</Mono>
		</div>
		<div style={{position: 'absolute', right: 26, top: 18}}>
			<ReadyTag f={f} at={readyAt} />
		</div>
		{children}
	</div>
);

export const Dossier: React.FC<{f: number}> = ({f}) => {
	if (f < T.DOSSIER_IN - 2 || f > T.BUILDER_IN + 2) return null;
	const inD = ramp(f, T.DOSSIER_IN, 24, EASE.FAST_LOCK);
	const onC = ramp(f, T.CONTACT_SIGNAL + 14, 10);
	const onA = ramp(f, T.ANGLE_SIGNAL + 14, 10);
	const onO = ramp(f, T.OUTREACH_SIGNAL + 14, 10);
	const focus = ramp(f, T.PROMPT_FOCUS, 24, EASE.CAMERA);
	const expand = ramp(f, T.PROMPT_EXPAND, 30, EASE.HEAVY);
	const [oa, ob] = T.OUTREACH_ASSEMBLE as unknown as number[];
	const copied = f >= T.COPIED;
	const readyCount = [T.CONTACT_READY, T.ANGLE_READY, T.OUTREACH_READY].filter((a) => f >= a).length + (f >= T.PROMPT_READY ? 1 : 0);
	const big = rectLerp(M.prompt, PROMPT_BIG, expand);
	const labels = T.PROMPT_LABELS as unknown as number[];
	const organize = ramp(f, T.PROMPT_ORGANIZE, 22, EASE.FAST_LOCK);
	const pReady = f >= T.PROMPT_READY;
	const recede = focus * (1 - 0) + expand * 0;
	// message assembly: total chars across fragments; fragment words highlight as they land
	const full = OUTREACH_MESSAGE.map((s) => s.t).join('');
	const shown = reveal(full, f, oa, ob).length;
	let acc = 0;
	return (
		<div style={{position: 'absolute', inset: 0, opacity: inD}}>
			{/* identity card (continues from search) */}
			<div style={{position: 'absolute', left: HERO_CARD.x, top: HERO_CARD.y, width: HERO_CARD.w, opacity: 1 - ramp(f, T.PROMPT_EXPAND, 16), transform: `scale(${lerp(1, 0.97, focus)})`}}>
				<LeadRow lead={HERO} selected={1} />
			</div>
			{/* tabs (real) + ready counter */}
			<div style={{position: 'absolute', left: 90, top: 460, width: 900, display: 'flex', alignItems: 'center', gap: 12, opacity: inD * (1 - focus)}}>
				{['Analysis', 'Outreach', 'AI Prompt'].map((t, i) => (
					<div key={t} style={{height: 54, padding: '0 22px', borderRadius: 14, display: 'flex', alignItems: 'center', fontFamily: FONT.sans, fontSize: 24, fontWeight: 650, color: i === 0 ? C.text : C.text3, background: i === 0 ? 'rgba(255,255,255,0.06)' : 'transparent', border: `1.5px solid ${i === 0 ? C.lineStrong : 'transparent'}`}}>
						{t}
					</div>
				))}
				<div style={{flex: 1}} />
				<Mono size={20} color={readyCount ? C.accentBright : C.text3}>{readyCount} / 4 ready</Mono>
			</div>
			{/* signal rail: identity → contact → angle → outreach */}
			<div style={{position: 'absolute', inset: 0, opacity: 1 - focus}}>
				<SignalLine d={`M ${RAIL} ${HERO_CARD.y + 66} L ${RAIL} ${M.contact.y + 60} L ${M.contact.x + 14} ${M.contact.y + 60}`} f={f} start={T.CONTACT_SIGNAL} dur={16} tail={0.5} width={2.6} persist />
				<SignalLine d={`M ${RAIL} ${M.contact.y + 60} L ${RAIL} ${M.angle.y + 60} L ${M.angle.x + 14} ${M.angle.y + 60}`} f={f} start={T.ANGLE_SIGNAL} dur={14} tail={0.6} width={2.6} persist />
				<SignalLine d={`M ${RAIL} ${M.angle.y + 60} L ${RAIL} ${M.outreach.y + 60} L ${M.outreach.x + 14} ${M.outreach.y + 60}`} f={f} start={T.OUTREACH_SIGNAL} dur={14} tail={0.6} width={2.6} persist />
			</div>
			{/* modules 1–3 recede when the prompt takes the stage */}
			<div style={{position: 'absolute', inset: 0, opacity: lerp(1, 0.18, recede) * (1 - expand), filter: recede > 0.02 ? `blur(${recede * 4}px)` : undefined, transform: `scale(${lerp(1, 0.97, recede)})`, transformOrigin: '540px 900px'}}>
				<ModuleShell f={f} r={M.contact} label="Contact" icon="phone" on={onC} readyAt={T.CONTACT_READY}>
					<div style={{position: 'absolute', left: 30, top: 72, display: 'flex', alignItems: 'center', gap: 18, opacity: onC}}>
						<div style={{fontFamily: FONT.sans, fontSize: 40, fontWeight: 720, color: C.text, letterSpacing: '-0.015em', fontVariantNumeric: 'tabular-nums'}}>{reveal(PHONE, f, T.CONTACT_SIGNAL + 12, T.CONTACT_READY - 6)}</div>
					</div>
					<div style={{position: 'absolute', right: 26, bottom: 22, display: 'flex', gap: 10, opacity: ramp(f, T.CONTACT_READY - 4, 10)}}>
						{['Copy number', 'WhatsApp ready to paste'].map((b) => (
							<div key={b} style={{height: 44, padding: '0 16px', borderRadius: 12, border: `1.5px solid ${C.lineStrong}`, fontFamily: FONT.sans, fontSize: 20, fontWeight: 600, color: C.text2, display: 'flex', alignItems: 'center'}}>
								{b}
							</div>
						))}
					</div>
				</ModuleShell>
				<ModuleShell f={f} r={M.angle} label="Why them" icon="target" on={onA} readyAt={T.ANGLE_READY}>
					<div style={{position: 'absolute', left: 30, top: 70, right: 30, opacity: onA}}>
						<div style={{display: 'flex', alignItems: 'center', gap: 14}}>
							<div style={{width: 14, height: 14, borderRadius: 7, background: '#22c55e'}} />
							<div style={{fontFamily: FONT.sans, fontSize: 34, fontWeight: 720, color: C.text, letterSpacing: '-0.015em'}}>{reveal('Strong need + solid reputation', f, T.ANGLE_SIGNAL + 12, T.ANGLE_READY - 4)}</div>
						</div>
						<div style={{fontFamily: FONT.sans, fontSize: 25, fontWeight: 500, color: C.text2, marginTop: 12, opacity: ramp(f, T.ANGLE_READY - 6, 10)}}>Weak site vs. excellent Google reputation</div>
					</div>
				</ModuleShell>
				<ModuleShell f={f} r={M.outreach} label="Outreach · WhatsApp message" icon="message" on={onO} readyAt={T.OUTREACH_READY}>
					<div style={{position: 'absolute', left: 30, top: 70, width: 840, fontFamily: FONT.sans, fontSize: 29, fontWeight: 500, lineHeight: 1.42, color: C.text2, letterSpacing: '-0.005em'}}>
						{OUTREACH_MESSAGE.map((s, i) => {
							const a = acc;
							acc += s.t.length;
							const vis = Math.max(0, Math.min(s.t.length, shown - a));
							if (vis <= 0) return null;
							const land = s.k ? ramp(f, oa + (a / full.length) * (ob - oa), 10, EASE.FAST_LOCK) : 1;
							return (
								<span key={i} style={s.k ? {color: C.text, fontWeight: 680, background: `rgba(${C.accentRGB},${0.16 * land})`, borderRadius: 8, padding: '1px 4px', boxShadow: `inset 0 -2px 0 rgba(${C.accentRGB},${0.7 * land})`} : undefined}>
									{s.t.slice(0, vis)}
								</span>
							);
						})}
					</div>
					<div style={{position: 'absolute', left: 30, bottom: 24, display: 'flex', gap: 10, opacity: ramp(f, oa, 10)}}>
						<div style={{height: 44, padding: '0 16px', borderRadius: 12, background: C.accentSoft, border: `1.5px solid rgba(${C.accentRGB},0.35)`, fontFamily: FONT.sans, fontSize: 20, fontWeight: 650, color: '#ffd0da', display: 'flex', alignItems: 'center'}}>Tone · Friendly</div>
					</div>
					<div style={{position: 'absolute', right: 26, bottom: 20, transform: `scale(${press(f, T.COPY_CLICK)})`, opacity: ramp(f, ob - 6, 10)}}>
						<GradButton label={copied ? '✓ Copied!' : 'Copy WhatsApp'} icon={copied ? undefined : 'copy'} h={60} fs={24} style={{padding: '0 24px'}} />
					</div>
				</ModuleShell>
			</div>
			{/* 8 · BUILD PROMPT */}
			<div
				style={{
					position: 'absolute',
					left: big.x,
					top: big.y,
					width: big.w,
					height: big.h,
					borderRadius: lerp(26, 36, expand),
					background: 'linear-gradient(180deg, #19191d 0%, #141417 100%)',
					border: `1.5px solid ${focus > 0 ? `rgba(${C.accentRGB},${0.15 + 0.3 * focus * (1 - (pReady ? 1 : 0))})` : C.lineStrong}`,
					boxShadow: expand > 0 ? `0 60px 140px rgba(0,0,0,0.6)` : undefined,
					opacity: lerp(0.4, 1, Math.max(onO * 0.6, focus)),
					overflow: 'hidden',
				}}
			>
				{pReady && <ReadyOutline f={f} at={T.PROMPT_READY} w={big.w} h={big.h} r={36} />}
				<div style={{position: 'absolute', left: 30, top: 24, display: 'flex', alignItems: 'center', gap: 12}}>
					<Icon n="sparkles" size={lerp(24, 30, expand)} color={C.accent} sw={2.1} />
					<Mono size={lerp(19, 22, expand)} color={C.text2}>{expand > 0.5 ? 'AI Prompt · website build' : 'AI Prompt'}</Mono>
				</div>
				<div style={{position: 'absolute', right: 26, top: 18}}>
					<ReadyTag f={f} at={T.PROMPT_READY} />
				</div>
				{/* collapsed state */}
				<div style={{position: 'absolute', right: 26, bottom: 18, opacity: 1 - ramp(f, T.PROMPT_CLICK + 2, 8), transform: `scale(${press(f, T.PROMPT_CLICK)})`}}>
					<GradButton label="Generate the AI prompt" icon="sparkles" h={60} fs={24} style={{padding: '0 24px'}} />
				</div>
				<div style={{position: 'absolute', left: 30, bottom: 30, fontFamily: FONT.sans, fontSize: 24, fontWeight: 500, color: C.text3, opacity: 1 - expand}}>Not generated yet</div>
				{/* expanded: the business flows into the prompt */}
				{expand > 0.02 && (
					<div style={{position: 'absolute', left: 0, top: 0, width: PROMPT_BIG.w, height: PROMPT_BIG.h, opacity: ramp(f, T.PROMPT_EXPAND + 12, 12)}}>
						<div style={{position: 'absolute', left: 40, top: 78, fontFamily: FONT.sans, fontSize: 50, fontWeight: 780, letterSpacing: '-0.035em', color: C.text}}>Website prompt</div>
						<div style={{position: 'absolute', left: 40, top: 146, display: 'flex', alignItems: 'center', gap: 12}}>
							<div style={{height: 46, padding: '0 16px', borderRadius: 12, background: C.surface3, border: `1.5px solid ${C.lineStrong}`, display: 'flex', alignItems: 'center', gap: 10, fontFamily: FONT.sans, fontSize: 22, fontWeight: 650, color: C.text}}>
								<Icon n="utensils" size={20} color={C.accent} />
								Bella Forno Trattoria
								<span style={{color: C.accent, fontWeight: 800}}>94</span>
							</div>
							<Mono size={18} color={C.text3}>This prompt includes</Mono>
						</div>
						{PROMPT_FIELDS.map(([k, v], i) => {
							const at = labels[i];
							const fly = ramp(f, at, 18, EASE.CAMERA);
							if (f < at) return null;
							const rowH = lerp(60, 46, organize);
							const ty = 222 + i * rowH;
							const sx = 300;
							const sy = 168;
							const x = lerp(sx, 40, fly);
							const y = lerp(sy, ty, fly) - Math.sin(Math.PI * fly) * 40;
							const landed = fly >= 1;
							const val = reveal(v, f, at + 14, at + 30);
							return (
								<div key={k} style={{position: 'absolute', left: 0, top: 0, width: '100%'}}>
									<div
										style={{
											position: 'absolute',
											left: x,
											top: y,
											height: lerp(38, 34, organize),
											padding: '0 12px',
											borderRadius: 9,
											display: 'flex',
											alignItems: 'center',
											fontFamily: FONT.mono,
											fontSize: lerp(17, 15, organize),
											letterSpacing: '0.12em',
											textTransform: 'uppercase',
											color: landed ? C.text3 : '#ffd0da',
											background: landed ? 'transparent' : `rgba(${C.accentRGB},0.14)`,
											border: `1.5px solid ${landed ? 'transparent' : `rgba(${C.accentRGB},0.6)`}`,
											whiteSpace: 'nowrap',
										}}
									>
										{k}
									</div>
									<div style={{position: 'absolute', left: 310, top: ty + 2, fontFamily: FONT.sans, fontSize: lerp(29, 25, organize), fontWeight: 620, color: C.text, letterSpacing: '-0.01em', whiteSpace: 'nowrap'}}>{val}</div>
								</div>
							);
						})}
						{/* prompt body resolves */}
						<div style={{position: 'absolute', left: 40, right: 40, top: 222 + 11 * 46 + 26, opacity: organize, transform: `translateY(${(1 - organize) * 30}px)`}}>
							<div style={{height: 1, background: C.line, marginBottom: 24}} />
							<div style={{fontFamily: FONT.sans, fontSize: 29, fontWeight: 500, lineHeight: 1.45, color: C.text2}}>{reveal(PROMPT_TEXT, f, T.PROMPT_ORGANIZE + 4, T.PROMPT_READY - 4)}</div>
						</div>
						<div style={{position: 'absolute', left: 40, bottom: 34, display: 'flex', alignItems: 'center', gap: 14, opacity: ramp(f, T.PROMPT_READY, 12)}}>
							<Icon n="check" size={28} color="#22c55e" sw={3} />
							<div style={{fontFamily: FONT.sans, fontSize: 28, fontWeight: 700, color: C.text}}>Ready to paste</div>
							<Mono size={18} color={C.text3} style={{marginLeft: 8}}>optimised for your tool</Mono>
						</div>
					</div>
				)}
			</div>
			<Glow x={540} y={900} r={700} o={ramp(f, T.PROMPT_READY, 6) * (1 - ramp(f, T.PROMPT_READY + 6, 40)) * 0.7} />
			<Cursor
				f={f}
				show={[T.COPY_HOVER - 16, T.PROMPT_CLICK + 14]}
				keys={[
					[T.COPY_HOVER - 24, 1000, 1640],
					[T.COPY_HOVER, 860, M.outreach.y + M.outreach.h - 50],
					[T.COPY_CLICK, 850, M.outreach.y + M.outreach.h - 48],
					[T.PROMPT_HOVER, 820, M.prompt.y + 92],
					[T.PROMPT_CLICK, 812, M.prompt.y + 94],
					[T.PROMPT_CLICK + 14, 1000, 1700],
				]}
				clicks={[T.COPY_CLICK, T.PROMPT_CLICK]}
			/>
		</div>
	);
};
