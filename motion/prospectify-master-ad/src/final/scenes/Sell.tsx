import React from 'react';
import {C, EASE, FONT, T, lerp, press, ramp, typed} from '../tokens';
import {Cursor} from '../kit/cursor';
import {Icon} from '../kit/icons';
import {Glow, LockCorners} from '../kit/signal';
import {Kinetic, Mono} from '../kit/type';
import {GradButton, LeadRow, Panel} from '../kit/ui';
import {HERO} from '../data';

/**
 * 11 · SELL — the real "Mark as sold" → "Record a sale" flow (Sale price · Sale date · Website URL).
 * 12 · TRACK — the real analytics tiles (Revenue · Websites sold · Avg. sale · contacted → sold).
 * DEMO DATA: one illustrative sale typed by the user in the film; no outcome is promised.
 */
const STATUSES = ['Contacted', 'Interested', 'Signed', 'Sold'];

const Field: React.FC<{label: string; value: string; caret?: boolean; prefix?: string}> = ({label, value, caret, prefix}) => (
	<div style={{marginTop: 22}}>
		<div style={{fontFamily: FONT.sans, fontSize: 22, fontWeight: 600, color: C.text3}}>{label}</div>
		<div style={{marginTop: 10, height: 72, borderRadius: 16, background: C.surface2, border: `1.5px solid ${caret ? `rgba(${C.accentRGB},0.5)` : C.lineStrong}`, display: 'flex', alignItems: 'center', padding: '0 22px', fontFamily: FONT.sans, fontSize: 30, fontWeight: 650, color: C.text}}>
			{prefix && <span style={{color: C.text3, marginRight: 8}}>{prefix}</span>}
			{value}
			{caret && <span style={{display: 'inline-block', width: 3, height: 34, marginLeft: 3, background: C.text}} />}
		</div>
	</div>
);

const Tile: React.FC<{label: string; value: string; sub: string; t: number; children?: React.ReactNode}> = ({label, value, sub, t, children}) => (
	<div style={{flex: 1, height: 250, borderRadius: 26, background: 'linear-gradient(180deg, #19191d 0%, #141417 100%)', border: `1.5px solid ${C.lineStrong}`, padding: '28px 30px', boxSizing: 'border-box', opacity: t, transform: `translateY(${(1 - t) * 40}px)`, position: 'relative', overflow: 'hidden'}}>
		<div style={{fontFamily: FONT.sans, fontSize: 24, fontWeight: 600, color: C.text3}}>{label}</div>
		<div style={{fontFamily: FONT.sans, fontSize: 72, fontWeight: 800, color: C.text, letterSpacing: '-0.04em', marginTop: 14, fontVariantNumeric: 'tabular-nums'}}>{value}</div>
		<div style={{fontFamily: FONT.sans, fontSize: 22, fontWeight: 500, color: C.text3, marginTop: 6}}>{sub}</div>
		{children}
	</div>
);

export const Sell: React.FC<{f: number}> = ({f}) => {
	if (f < T.SELL_IN - 2 || f > T.LOOP_IN + 24) return null;
	const inS = ramp(f, T.SELL_IN, 24, EASE.FAST_LOCK);
	const status = T.SELL_STATUS as unknown as number[];
	const stage = status.filter((s) => f >= s).length - 1; // 0..2
	const sold = f >= T.SOLD;
	const modal = ramp(f, T.MODAL_IN, 18, EASE.FAST_LOCK) * (1 - ramp(f, T.SOLD - 2, 14, EASE.EXIT));
	const amount = typed('750', T.AMOUNT_KEYS as unknown as number[], f);
	const track = ramp(f, T.TRACK_IN, 26, EASE.CAMERA);
	const out = ramp(f, T.LOOP_IN, 18, EASE.EXIT);
	const tiles = T.TRACK_TILES as unknown as number[];
	const cnt = (i: number, to: number) => Math.round(to * ramp(f, tiles[i] + 2, 26, EASE.SOFT));
	const toast = ramp(f, T.SOLD + 2, 16, EASE.FAST_LOCK) * (1 - ramp(f, T.TRACK_IN + 4, 12, EASE.EXIT));
	return (
		<div style={{position: 'absolute', inset: 0, opacity: inS * (1 - out)}}>
			{/* pipeline */}
			<div style={{position: 'absolute', inset: 0, opacity: 1 - track, transform: `translateY(${-track * 120}px) scale(${lerp(1, 0.94, track)})`, filter: track > 0.02 ? `blur(${track * 6}px)` : undefined}}>
				<div style={{position: 'absolute', left: 90, top: 290}}>
					<Mono size={20} color={C.text2}>Your pipeline</Mono>
				</div>
				<div style={{position: 'absolute', left: 90, top: 340, width: 900}}>
					<LeadRow lead={HERO} selected={sold ? 1 : 0.4} />
				</div>
				<div style={{position: 'absolute', left: 90, top: 500, width: 900, display: 'flex', gap: 12}}>
					{STATUSES.map((s, i) => {
						const on = i <= stage || (sold && i === 3);
						const cur = sold ? i === 3 : i === stage;
						return (
							<div key={s} style={{flex: 1, height: 70, borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, fontFamily: FONT.sans, fontSize: 25, fontWeight: 700, color: cur ? '#fff' : on ? C.text2 : C.text3, background: cur ? (i === 3 ? C.grad : 'rgba(255,255,255,0.08)') : 'transparent', border: `1.5px solid ${cur ? 'transparent' : C.lineStrong}`}}>
								{on && !cur && <Icon n="check" size={20} color={C.text2} sw={2.6} />}
								{s}
							</div>
						);
					})}
				</div>
				<div style={{position: 'absolute', left: 90, top: 610, width: 900, opacity: sold ? 0.0 : 1}}>
					<GradButton label="Mark as sold" icon="dollar" style={{transform: `scale(${press(f, T.MARK_CLICK)})`}} />
				</div>
				<LockCorners f={f} at={T.SOLD + 2} x={90} y={340} w={900} h={232} spread={40} len={36} stroke={3.5} hold={30} />
				{toast > 0 && (
					<div style={{position: 'absolute', left: 90, top: 640, width: 900, height: 110, borderRadius: 24, background: 'rgba(34,197,94,0.08)', border: '1.5px solid rgba(34,197,94,0.35)', display: 'flex', alignItems: 'center', gap: 18, padding: '0 30px', boxSizing: 'border-box', opacity: toast, transform: `translateY(${(1 - toast) * 20}px)`}}>
						<div style={{width: 46, height: 46, borderRadius: 23, background: '#22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
							<Icon n="check" size={26} color="#fff" sw={3} />
						</div>
						<div style={{fontFamily: FONT.sans, fontSize: 32, fontWeight: 720, color: C.text}}>Congratulations — client signed!</div>
					</div>
				)}
				{/* Record a sale */}
				{modal > 0 && (
					<>
						<div style={{position: 'absolute', inset: 0, background: `rgba(9,9,11,${0.6 * modal})`}} />
						<Panel style={{left: 90, top: 700, width: 900, height: 700, opacity: modal, transform: `translateY(${(1 - modal) * 60}px) scale(${lerp(0.97, 1, modal)})`}}>
							<div style={{position: 'absolute', left: 44, top: 40, right: 44}}>
								<div style={{fontFamily: FONT.sans, fontSize: 44, fontWeight: 780, color: C.text, letterSpacing: '-0.03em'}}>Record a sale</div>
								<Field label="Sale price" prefix="$" value={amount} caret={f < T.CONFIRM_CLICK - 6} />
								<Field label="Sale date" value="Oct 2, 2026" />
								<Field label="Website URL" value="bellaforno-austin.com" />
								<div style={{display: 'flex', gap: 16, marginTop: 34}}>
									<div style={{flex: 1, height: 84, borderRadius: 22, border: `1.5px solid ${C.lineStrong}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT.sans, fontSize: 28, fontWeight: 650, color: C.text2}}>Cancel</div>
									<div style={{flex: 1.4}}>
										<GradButton label="Mark as sold" h={84} fs={28} style={{transform: `scale(${press(f, T.CONFIRM_CLICK)})`}} />
									</div>
								</div>
							</div>
						</Panel>
					</>
				)}
			</div>
			<Glow x={540} y={460} r={600} o={ramp(f, T.SOLD, 4) * (1 - ramp(f, T.SOLD + 4, 40)) * 0.6} />
			{/* TRACK — analytics */}
			{track > 0 && (
				<div style={{position: 'absolute', inset: 0, opacity: track}}>
					<div style={{position: 'absolute', left: 90, top: 290}}>
						<Kinetic f={f} inAt={T.TRACK_IN} text="Analytics" size={64} weight={780} stagger={2} />
					</div>
					<div style={{position: 'absolute', left: 90, top: 420, width: 900, display: 'flex', flexDirection: 'column', gap: 20}}>
						<div style={{display: 'flex', gap: 20}}>
							<Tile label="Revenue" value={`$${cnt(0, 750)}`} sub="all time" t={ramp(f, tiles[0], 18, EASE.FAST_LOCK)}>
								<svg width={300} height={90} style={{position: 'absolute', right: 20, bottom: 24}}>
									<path d="M 0 80 L 120 80 L 150 20 L 300 20" fill="none" stroke={C.accent} strokeWidth={3} pathLength={1} strokeDasharray={`${ramp(f, tiles[0] + 6, 30, EASE.SOFT)} 2`} />
								</svg>
							</Tile>
							<Tile label="Websites sold" value={`${cnt(1, 1)}`} sub="closed deals" t={ramp(f, tiles[1], 18, EASE.FAST_LOCK)} />
						</div>
						<div style={{display: 'flex', gap: 20}}>
							<Tile label="Avg. sale" value={`$${cnt(2, 750)}`} sub="per website" t={ramp(f, tiles[2], 18, EASE.FAST_LOCK)} />
							<Tile label="contacted → sold" value={`${cnt(3, 1)} / 6`} sub="this month" t={ramp(f, tiles[3], 18, EASE.FAST_LOCK)} />
						</div>
						<div style={{height: 120, borderRadius: 24, border: `1.5px solid ${C.lineStrong}`, display: 'flex', alignItems: 'center', gap: 20, padding: '0 30px', opacity: ramp(f, tiles[3] + 10, 14)}}>
							<Mono size={18} color={C.text3}>Recent websites sold</Mono>
							<div style={{flex: 1}} />
							<div style={{fontFamily: FONT.sans, fontSize: 28, fontWeight: 650, color: C.text}}>Bella Forno Trattoria</div>
							<div style={{fontFamily: FONT.sans, fontSize: 28, fontWeight: 650, color: C.text2}}>· $750</div>
						</div>
					</div>
				</div>
			)}
			<Cursor
				f={f}
				show={[T.MARK_HOVER - 16, T.CONFIRM_CLICK + 10]}
				keys={[
					[T.MARK_HOVER - 24, 1000, 1640],
					[T.MARK_HOVER, 640, 660],
					[T.MARK_CLICK, 630, 656],
					[T.CONFIRM_CLICK - 14, 780, 1300],
					[T.CONFIRM_CLICK, 770, 1296],
					[T.CONFIRM_CLICK + 10, 980, 1640],
				]}
				clicks={[T.MARK_CLICK, T.CONFIRM_CLICK]}
			/>
		</div>
	);
};
