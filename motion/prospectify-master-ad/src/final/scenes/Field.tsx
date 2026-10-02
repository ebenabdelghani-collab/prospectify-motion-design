import React from 'react';
import {C, EASE, FONT, T, clamp01, lerp, rand, ramp} from '../tokens';
import {Cam, CamKey} from '../kit/camera';
import {Icon} from '../kit/icons';
import {Glow, LockCorners, Scan, SignalLine} from '../kit/signal';
import {Kinetic, Mono} from '../kit/type';
import {Logo} from '../kit/ui';

/**
 * 4 · SCALE + 5 · REVEAL — one world.
 * B becomes one node of fifty; every node is a manual hunt (pin, reviews, site, social, contact) → noise.
 * Freeze. A single coral SIGNAL threads the field, weak opportunities fall away, one remains,
 * SCAN → LOCK → the Prospectify mark resolves inside the lock geometry (the real PNG, revealed — never drawn).
 */
const COLS = 6;
const ROWS = 9;
const NW = 140;
const NH = 100;
const SX = 165;
const SY = 125;
const SURV = {c: 3, r: 4};
const NAMES = ['Kinfolk Barbers', 'Iron Tide Gym', 'Petal & Stem', 'Cielo Tacos', 'Moss Dental', 'Juniper Café', 'Noodle Theory', 'Southside BBQ', 'Lumen Nails', 'El Sol', 'Bright Smile', 'Oak & Iron', 'Fern Yoga', 'Pho Real', 'Velo Bikes', 'Ember Coffee'];
type Node = {c: number; r: number; x: number; y: number; i: number; d: number; p: number};
const NODES: Node[] = [];
{
	const all: Node[] = [];
	for (let r = 0; r < ROWS; r++)
		for (let c = 0; c < COLS; c++) {
			const x = 540 + (c - 2.5) * SX;
			const y = 960 + (r - 4) * SY;
			// signal path progress at this node (serpentine: row 0 → right, row 2 ← left, row 4 → right to the survivor)
			const L = r <= 1 ? x + 80 : r <= 3 ? 1330 + (1000 - x) : 2500 + (x - 80) + (r - 4) * 40;
			all.push({c, r, x, y, i: 0, d: 0, p: L / 3042});
		}
	const sx = 540 + (SURV.c - 2.5) * SX;
	const sy = 960;
	all.forEach((n) => (n.d = Math.hypot(n.x - sx, n.y - sy)));
	// fifty: drop the four farthest corners
	all.sort((a, b) => a.d - b.d);
	all.slice(0, 50).forEach((n, i) => NODES.push({...n, i}));
}
const SURVIVOR = NODES[0];
const SIGNAL_D = `M -80 460 L 1000 460 C 1130 460, 1130 710, 1000 710 L 80 710 C -50 710, -50 960, 80 960 L ${SURVIVOR.x - NW / 2 - 6} 960`;
const CYCLE = ['pin', 'message', 'globe', 'camera', 'user', 'mail', 'sheet'];

export const Field: React.FC<{f: number}> = ({f}) => {
	if (f < T.FIFTY_IN - 4 || f > T.LOGO_TO_HEADER + 40) return null;
	const frozen = f >= T.FREEZE;
	const ff = frozen ? T.FREEZE : f;
	const noise = clamp01((ff - T.TIME_IN) / Math.max(1, T.NOISE_PEAK - T.TIME_IN));
	const fills = T.FIFTY_FILL as unknown as number[];
	const SIG_DUR = T.SIGNAL_SWEEP_END - T.SIGNAL_IN;
	const keys: CamKey[] = [
		[T.FIFTY_IN, SURVIVOR.x, SURVIVOR.y, 2.6, 0, 0],
		[T.VO.v_time.start, 540, 960, 0.9, 0, 0, EASE.CAMERA],
		[T.FREEZE, 540, 1000, 0.98, 24, 0, EASE.SOFT],
		[T.SIGNAL_IN + 4, 540, 980, 0.94, 10, 0, EASE.CAMERA],
		[T.SURVIVOR_PUSH, 540, 960, 0.96, 0, 0, EASE.CAMERA],
		[T.SCAN - 2, SURVIVOR.x, SURVIVOR.y, 2.4, 0, 0, EASE.HEAVY],
	];
	const resolve = ramp(f, T.LOGO_RESOLVE, 26, EASE.FAST_LOCK);
	const fieldOut = ramp(f, T.LOCK + 2, 24, EASE.SOFT);
	const toHeader = ramp(f, T.LOGO_TO_HEADER, 30, EASE.CAMERA);
	// logo geometry (screen space): centre → header
	const L0 = {x: 540, y: 900, s: 230};
	const L1 = {x: 90 + 22, y: 150 + 22, s: 44};
	const lx = lerp(L0.x, L1.x, toHeader);
	const ly = lerp(L0.y, L1.y, toHeader);
	const ls = lerp(L0.s, L1.s, toHeader);
	const lockRect = {x: 540 - (NW * 2.4) / 2, y: 960 - (NH * 2.4) / 2, w: NW * 2.4, h: NH * 2.4};
	const handOff = ramp(f, T.LOGO_TO_HEADER + 26, 8); // the persistent header takes over
	return (
		<div style={{position: 'absolute', inset: 0}}>
			<div style={{position: 'absolute', inset: 0, opacity: 1 - fieldOut}}>
				<Cam f={f} keys={keys} persp={2200}>
					{NODES.map((n) => {
						const at = fills[Math.min(fills.length - 1, n.i)];
						if (ff < at - 1) return null;
						const t = ramp(ff, at, 14, EASE.FAST_LOCK);
						const isS = n === SURVIVOR;
						// dim when the signal passes (everything except the survivor)
						const passAt = T.SIGNAL_IN + n.p * SIG_DUR * 0.98;
						const dim = isS ? 0 : ramp(f, passAt, 16, EASE.SOFT);
						const speed = 1 + noise * 3;
						const ic = CYCLE[Math.floor((ff * 0.12 * speed + n.i * 3.7) % CYCLE.length)];
						const jx = !frozen && noise > 0 ? (rand(ff * 1.3 + n.i) - 0.5) * 6 * noise : 0;
						const jy = !frozen && noise > 0 ? (rand(ff * 2.1 + n.i * 5) - 0.5) * 6 * noise : 0;
						const prog = (ff * 0.008 * speed + rand(n.i)) % 1;
						const sel = isS ? ramp(f, T.SCAN, 10) : 0;
						return (
							<div
								key={n.i}
								style={{
									position: 'absolute',
									left: n.x - NW / 2 + jx,
									top: n.y - NH / 2 + jy,
									width: NW,
									height: NH,
									borderRadius: 16,
									background: '#141416',
									border: `1.5px solid ${sel > 0 ? `rgba(${C.accentRGB},${0.25 + 0.5 * sel})` : `rgba(255,255,255,${0.1 + noise * 0.06})`}`,
									opacity: t * lerp(1, 0.07, dim),
									transform: `scale(${lerp(0.6, 1, t) * lerp(1, 0.86, dim)})`,
									filter: dim > 0.05 ? `blur(${dim * 2}px)` : undefined,
									padding: '12px 14px',
									boxSizing: 'border-box',
								}}
							>
								<div style={{display: 'flex', alignItems: 'center', gap: 8}}>
									<Icon n={isS && f >= T.FREEZE ? 'utensils' : ic} size={18} color={isS && sel > 0 ? C.accent : C.text2} sw={2} />
									<div style={{fontFamily: FONT.sans, fontSize: 13.5, fontWeight: 650, color: C.text2, whiteSpace: 'nowrap', overflow: 'hidden'}}>{isS ? 'Bella Forno' : NAMES[n.i % NAMES.length]}</div>
								</div>
								<div style={{marginTop: 14, height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.07)', overflow: 'hidden'}}>
									<div style={{width: `${(isS && f >= T.FREEZE ? 1 : prog) * 100}%`, height: '100%', background: isS && sel > 0 ? C.grad : 'rgba(255,255,255,0.32)'}} />
								</div>
								<div style={{marginTop: 10, display: 'flex', gap: 5}}>
									{[0, 1, 2, 3].map((k) => (
										<div key={k} style={{flex: 1, height: 5, borderRadius: 3, background: `rgba(255,255,255,${k <= Math.floor(prog * 4) ? 0.22 : 0.06})`}} />
									))}
								</div>
							</div>
						);
					})}
					<SignalLine d={SIGNAL_D} f={f} start={T.SIGNAL_IN} dur={SIG_DUR} tail={0.16} width={3.2} persist ease={EASE.SOFT} />
				</Cam>
			</div>
			{/* scale headline + counters (sound-off support) */}
			{f < T.FREEZE + 8 && (
				<>
				<div style={{position: 'absolute', left: 0, top: 0, width: 1080, height: 560, background: `linear-gradient(180deg, ${C.bg} 0%, rgba(9,9,11,0.94) 62%, rgba(9,9,11,0) 100%)`, opacity: ramp(f, T.FIFTY_IN, 10) * (1 - ramp(f, T.FREEZE, 8, EASE.EXIT))}} />
				<div style={{position: 'absolute', left: 90, top: 230, width: 900, opacity: 1 - ramp(f, T.FREEZE, 8, EASE.EXIT)}}>
					<Kinetic f={f} inAt={T.FIFTY_IN + 2} text={'Now find 50 of those.'} size={84} weight={780} stagger={3} />
					<Mono size={22} color={C.text2} style={{marginTop: 26, opacity: ramp(f, T.TIME_IN, 12)}}>
						{`${2 + Math.floor(noise * 2)}:${String(Math.floor(13 + noise * 44)).padStart(2, '0')} AM · 50 to check · 0 pitched`}
					</Mono>
				</div>
				</>
			)}
			{/* SCAN → LOCK (screen space, on the survivor) */}
			<Scan f={f} at={T.SCAN} dur={20} x={lockRect.x} y={lockRect.y} w={lockRect.w} h={lockRect.h} r={36} />
			<LockCorners f={f} at={T.LOCK} x={lockRect.x} y={lockRect.y} w={lockRect.w} h={lockRect.h} spread={70} len={44} stroke={4} hold={14} />
			{/* the lock resolves into the brand: corners re-seat on the square, the real mark is revealed inside */}
			<LockCorners f={f} at={T.LOGO_RESOLVE + 14} x={540 - 170} y={900 - 170} w={340} h={340} spread={-40} len={48} stroke={4} hold={20} dur={14} />
			<Glow x={540} y={900} r={560} o={ramp(f, T.LOGO_RESOLVE, 10) * (1 - ramp(f, T.LOGO_RESOLVE + 30, 60)) * 0.9} />
			{f >= T.LOGO_RESOLVE && handOff < 1 && (
				<div
					style={{
						position: 'absolute',
						left: lx - ls / 2,
						top: ly - ls / 2,
						width: ls,
						height: ls,
						opacity: 1 - handOff,
						clipPath: `inset(${(1 - resolve) * 50}% ${(1 - resolve) * 50}% ${(1 - resolve) * 50}% ${(1 - resolve) * 50}% round ${(1 - resolve) * 20}px)`,
					}}
				>
					<Logo size={ls} />
				</div>
			)}
			{f >= T.WORDMARK_IN && handOff < 1 && (
				<div style={{position: 'absolute', left: 0, top: 1090, width: 1080, opacity: 1 - clamp01(toHeader * 1.8), transform: `translateY(${-toHeader * 60}px) scale(${lerp(1, 0.8, toHeader)})`, filter: toHeader > 0.02 ? `blur(${toHeader * 8}px)` : undefined}}>
					<Kinetic f={f} inAt={T.WORDMARK_IN} text="Prospectify" size={96} weight={780} align="center" tracking="-0.04em" />
				</div>
			)}
		</div>
	);
};
