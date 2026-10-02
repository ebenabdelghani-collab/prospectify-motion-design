import React from 'react';
import {COLORS, EASE, FONTS} from '../constants/theme';
import {T} from '../constants/timeline';
import {LEAD} from '../constants/demoData';
import {Cursor} from '../components/primitives';
import {Card, lineScale, mono} from '../components/ui';
import {lerp, path, press, ramp, typed} from '../motion/anim';
import {Camera, CamKey, Sheen} from '../fx/camera';
import {SphereBurst} from '../three/Burst';

const ROWCARD = {x: 90, y: 600, w: 900, h: 250};
const DIALOG = {x: 130, y: 900, w: 820, h: 560};
const DASH = {x: 90, y: 600, w: 900, h: 800};

const SiteThumb: React.FC = () => (
	<div style={{width: 150, height: 140, borderRadius: 12, background: COLORS.site.bg, padding: 12, overflow: 'hidden'}}>
		<div style={{width: 70, height: 8, borderRadius: 4, background: COLORS.site.ink}} />
		<div style={{width: 110, height: 14, borderRadius: 4, background: COLORS.site.ink, marginTop: 14}} />
		<div style={{width: 80, height: 14, borderRadius: 4, background: COLORS.site.ink, marginTop: 6}} />
		<div style={{height: 44, borderRadius: 6, background: COLORS.site.brand, marginTop: 10}} />
	</div>
);

const Field: React.FC<{label: string; value: string; placeholder?: string; active?: boolean}> = ({label, value, placeholder, active}) => (
	<div style={{marginTop: 26}}>
		<div style={{...mono, fontSize: 20}}>{label}</div>
		<div
			style={{
				height: 72,
				marginTop: 10,
				borderRadius: 14,
				border: `2px solid ${active ? COLORS.lineHi : COLORS.line}`,
				background: '#0C0C10',
				display: 'flex',
				alignItems: 'center',
				padding: '0 24px',
				fontFamily: FONTS.sans,
				fontSize: 32,
				fontWeight: 520,
				color: value ? COLORS.text : COLORS.textMute,
				whiteSpace: 'pre',
			}}
		>
			{value || placeholder}
			{active && <span style={{width: 3, height: 34, background: COLORS.accent, marginLeft: 3}} />}
		</div>
	</div>
);

const Tile: React.FC<{f: number; at: number; label: string; value: number; money?: boolean}> = ({f, at, label, value: target, money}) => {
	const t = ramp(f, at, 14, EASE.snap);
	const n = Math.round(target * ramp(f, at + 2, 22, EASE.snap));
	const value = money ? `$${n.toLocaleString('en-US')}` : String(n);
	return (
		<div style={{flex: 1, height: 200, borderRadius: 20, background: '#0E0E13', border: `2px solid ${COLORS.line}`, padding: '26px 26px', opacity: t, transform: `translateY(${(1 - t) * 24}px)`}}>
			<div style={{...mono, fontSize: 19}}>{label}</div>
			<div style={{fontFamily: FONTS.sans, fontSize: 64, fontWeight: 650, letterSpacing: '-0.04em', color: COLORS.text, marginTop: 30}}>{value}</div>
		</div>
	);
};

/** 52–56.5s: mark as sold → the dashboard. */
export const Sell: React.FC<{f: number}> = ({f}) => {
	if (f < T.SELL_IN || f > T.LOOP_IN + 2) return null;

	const rowOpen = lineScale(f, T.TRACK_IN - 8, T.SELL_IN);
	const sold = f >= T.SOLD;
	const dialogT = ramp(f, T.SOLD_DIALOG, 14, EASE.snap);
	const dialogOut = ramp(f, T.SOLD, 9, EASE.exit);
	const amount = typed(LEAD.sale.amount.replace(',', ''), T.AMOUNT_KEYS, f);
	const amountFmt = amount.length === 4 ? `$ ${amount[0]},${amount.slice(1)}` : amount ? `$ ${amount}` : '';
	const dashOpen = f >= T.TRACK_IN ? lineScale(f, T.LOOP_IN - 8, T.TRACK_IN) : 0;

	const cur = path(f, [
		[T.SELL_IN + 4, 760, 1300],
		[T.MARK_SOLD_CLICK - 2, 800, 790],
		[T.MARK_SOLD_CLICK + 20, 640, 1240],
		[T.SAVE_CLICK - 3, 760, 1388],
	]);

	const CAM: CamKey[] = [
		[T.SELL_IN, 540, 960, 1.0],
		[T.MARK_SOLD_CLICK, 700, 800, 1.28],
		[T.SOLD_DIALOG + 10, 540, 1150, 1.08],
		[T.SAVE_CLICK, 580, 1290, 1.14],
		[T.SOLD + 1, 560, 760, 1.38, 0, EASE.exit],
		[T.SOLD + 18, 540, 860, 1.12, 0, EASE.snap],
		[T.TRACK_IN, 540, 960, 1.0],
		[T.TRACK_TILES[0] + 6, 540, 880, 1.14],
		[T.TRACK_ROW + 24, 540, 1000, 1.04],
	];
	const stamp = ramp(f, T.SOLD, 9, EASE.snap);
	const shake = f >= T.SOLD && f < T.SOLD + 10 ? (1 - (f - T.SOLD) / 10) * 16 : 0;

	return (
		<>
		<Camera f={f} keys={CAM} shake={shake}>
			{f < T.TRACK_IN + 2 && (
				<>
					<Card style={{left: ROWCARD.x, top: ROWCARD.y, width: ROWCARD.w, height: ROWCARD.h, transform: `scaleY(${rowOpen})`}}>
						<div style={{position: 'absolute', left: 40, top: 54}}>
							<SiteThumb />
						</div>
						<div style={{position: 'absolute', left: 224, top: 66, fontFamily: FONTS.sans}}>
							<div style={{fontSize: 42, fontWeight: 650, letterSpacing: '-0.03em', color: COLORS.text}}>{LEAD.name}</div>
							<div style={{fontSize: 27, color: COLORS.textDim, marginTop: 8}}>
								{LEAD.category} · {LEAD.city}
							</div>
						</div>
						<div
							style={{
								position: 'absolute',
								right: 40,
								top: 158,
								height: 62,
								padding: '0 26px',
								borderRadius: 16,
								display: 'flex',
								alignItems: 'center',
								gap: 10,
								background: sold ? COLORS.accent : f >= T.MARK_SOLD_CLICK - 8 ? 'rgba(244,244,246,0.16)' : 'rgba(244,244,246,0.08)',
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
									<svg width={26} height={26} viewBox="0 0 24 24">
										<path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="#fff" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
									</svg>
									Sold · $ {LEAD.sale.amount}
								</>
							) : (
								'Mark as sold'
							)}
						</div>
					</Card>

					{f >= T.SOLD_DIALOG && dialogOut < 1 && (
						<Card
							style={{
								left: DIALOG.x,
								top: DIALOG.y + (1 - dialogT) * 50 - dialogOut * 120,
								width: DIALOG.w,
								height: DIALOG.h,
								opacity: dialogT * (1 - dialogOut),
								transform: `scale(${lerp(0.96, 1, dialogT) * lerp(1, 0.8, dialogOut)})`,
								padding: '34px 40px',
								background: COLORS.surfaceHi,
								border: `2px solid ${COLORS.lineHi}`,
							}}
						>
							<div style={{fontFamily: FONTS.sans, fontSize: 40, fontWeight: 650, letterSpacing: '-0.03em', color: COLORS.text}}>Mark as sold</div>
							<Field label="SALE AMOUNT" value={amountFmt} placeholder="$" active={f >= T.AMOUNT_KEYS[0] - 4 && f < T.SAVE_CLICK} />
							<Field label="DATE" value={LEAD.sale.date} />
							<Field label="WEBSITE URL · OPTIONAL" value="" placeholder="https://" />
							<div style={{position: 'absolute', right: 40, bottom: 34, height: 66, padding: '0 34px', borderRadius: 16, background: COLORS.text, color: COLORS.bg, display: 'flex', alignItems: 'center', fontFamily: FONTS.sans, fontSize: 30, fontWeight: 650, transform: `scale(${press(f, T.SAVE_CLICK)})`}}>
								Save sale
							</div>
						</Card>
					)}
				</>
			)}

			{/* Track */}
			{f >= T.TRACK_IN && (
				<Card style={{left: DASH.x, top: DASH.y, width: DASH.w, height: DASH.h, transform: `scaleY(${dashOpen})`, padding: 40}}>
					<div style={{display: 'flex', alignItems: 'center'}}>
						<div style={{fontFamily: FONTS.sans, fontSize: 40, fontWeight: 650, letterSpacing: '-0.03em', color: COLORS.text}}>Sales</div>
						<div style={{flex: 1}} />
						<div style={{...mono, fontSize: 18, padding: '10px 14px', borderRadius: 10, border: `1.5px solid ${COLORS.line}`}}>DEMO ACCOUNT</div>
					</div>
					<div style={{display: 'flex', gap: 18, marginTop: 34}}>
						<Tile f={f} at={T.TRACK_TILES[0]} label="WEBSITES SOLD" value={1} />
						<Tile f={f} at={T.TRACK_TILES[1]} label="REVENUE" value={1500} money />
						<Tile f={f} at={T.TRACK_TILES[2]} label="AVG. SALE" value={1500} money />
					</div>
					<div style={{...mono, marginTop: 44}}>RECENT SALES</div>
					<div style={{display: 'flex', alignItems: 'center', gap: 22, marginTop: 18, padding: '22px 0', borderTop: `2px solid ${COLORS.line}`, borderBottom: `2px solid ${COLORS.line}`, opacity: ramp(f, T.TRACK_ROW, 12), transform: `translateY(${(1 - ramp(f, T.TRACK_ROW, 14, EASE.snap)) * 20}px)`}}>
						<div style={{transform: 'scale(0.6)', transformOrigin: '0 50%', width: 90}}>
							<SiteThumb />
						</div>
						<div style={{fontFamily: FONTS.sans}}>
							<div style={{fontSize: 34, fontWeight: 620, color: COLORS.text, letterSpacing: '-0.02em'}}>{LEAD.name}</div>
							<div style={{fontSize: 25, color: COLORS.textDim, marginTop: 4}}>{LEAD.sale.date}</div>
						</div>
						<div style={{flex: 1}} />
						<div style={{fontFamily: FONTS.sans, fontSize: 36, fontWeight: 650, color: COLORS.text}}>$ {LEAD.sale.amount}</div>
					</div>
				</Card>
			)}

			{f >= T.SELL_IN + 4 && f < T.SOLD + 10 && <Cursor x={cur.x} y={cur.y} scale={press(f, T.MARK_SOLD_CLICK) * press(f, T.SAVE_CLICK)} opacity={ramp(f, T.SELL_IN + 4, 6) * (1 - ramp(f, T.SOLD + 2, 8))} blur={Math.min(5, cur.v * 0.1)} />}
			{/* SOLD stamp */}
			{f >= T.SOLD && f < T.TRACK_IN && (
				<div
					style={{
						position: 'absolute',
						left: 560,
						top: 610,
						padding: '10px 30px',
						border: `8px solid ${COLORS.accent}`,
						borderRadius: 18,
						fontFamily: FONTS.sans,
						fontSize: 92,
						fontWeight: 800,
						letterSpacing: '0.04em',
						color: COLORS.accent,
						transform: `rotate(-9deg) scale(${lerp(2.6, 1, stamp)})`,
						opacity: Math.min(1, stamp * 1.4) * (1 - ramp(f, T.TRACK_IN - 8, 8)),
						filter: stamp < 0.95 ? `blur(${(1 - stamp) * 10}px)` : undefined,
						background: 'rgba(5,5,5,0.88)',
						boxShadow: `0 0 ${60 * (1 - stamp) + 20}px rgba(230,63,109,0.35)`,
						zIndex: 20,
					}}
				>
					SOLD
				</div>
			)}
		</Camera>
		<SphereBurst t={(f - T.SOLD) / 60} />
		</>
	);
};
