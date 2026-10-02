import React from 'react';
import {COLORS, EASE, FONTS} from '../constants/theme';
import {T} from '../constants/timeline';
import {INSIGHT} from '../constants/demoData';
import {Cursor} from '../components/primitives';
import {Chip, Dot, lineScale, mono} from '../components/ui';
import {lerp, path, press, ramp, rand} from '../motion/anim';

const A = {x: 90, y: 660, w: 900, h: 290};
const B = {x: 90, y: 990, w: 900, h: 420};
const GRID = {x: 90, y: 640, w: 900, h: 760, cols: 5, rows: 10, gx: 14, gy: 12};
const cellW = (GRID.w - (GRID.cols - 1) * GRID.gx) / GRID.cols;
const cellH = (GRID.h - (GRID.rows - 1) * GRID.gy) / GRID.rows;
const cell = (i: number) => ({
	x: GRID.x + (i % GRID.cols) * (cellW + GRID.gx),
	y: GRID.y + Math.floor(i / GRID.cols) * (cellH + GRID.gy),
});

const Badge: React.FC<{l: string; on?: boolean}> = ({l, on}) => (
	<div
		style={{
			width: 64,
			height: 64,
			borderRadius: 18,
			display: 'flex',
			alignItems: 'center',
			justifyContent: 'center',
			fontFamily: FONTS.sans,
			fontSize: 34,
			fontWeight: 700,
			color: on ? '#fff' : COLORS.text,
			background: on ? COLORS.accent : 'rgba(244,244,246,0.08)',
		}}
	>
		{l}
	</div>
);

/** 17.5–28s: the insight (demand first), then the scale problem (now find fifty). */
export const Insight: React.FC<{f: number}> = ({f}) => {
	if (f < T.INSIGHT_Q || f > T.BLACK) return null;

	const aIn = ramp(f, T.CARD_A_IN, 16, EASE.snap);
	const bIn = ramp(f, T.CARD_B_IN, 16, EASE.snap);
	const picked = f >= T.PICK_B;
	const pickT = ramp(f, T.PICK_B, 14, EASE.lock);
	const demandOn = f >= T.DEMAND_SIGNALS;
	const problemOn = f >= T.WEBPROBLEM_SIGNALS;

	// B shrinks into grid cell 0; A leaves.
	const toGrid = ramp(f, T.FIFTY_IN, 18, EASE.glide);
	const c0 = cell(0);
	const bx = lerp(B.x, c0.x, toGrid);
	const by = lerp(B.y, c0.y, toGrid);
	const bs = lerp(1, cellW / B.w, toGrid);
	const aOut = ramp(f, T.FIFTY_IN - 4, 10, EASE.exit);
	const gridScale = lineScale(f, T.SCALE_COLLAPSE);

	const cur = path(f, [
		[T.PICK_HOVER - 14, 760, 1560],
		[T.PICK_HOVER, 700, 1120],
		[T.PICK_B + 10, 700, 1130],
	]);

	// time cost meter during "that's where your time goes"
	const timeT = ramp(f, T.TIME_LINE - 6, T.SCALE_COLLAPSE - T.TIME_LINE + 6, EASE.linear);
	const checked = Math.min(3, 1 + Math.floor(timeT * 3));
	const mins = Math.round(lerp(42, 186, timeT));

	return (
		<div style={{position: 'absolute', inset: 0, transform: `scaleY(${gridScale}) scale(${1 + 0.035 * ramp(f, T.CARD_B_IN + 20, T.FIFTY_IN - T.CARD_B_IN - 20, EASE.linear) * (1 - ramp(f, T.FIFTY_IN - 6, 22, EASE.glide))})`, transformOrigin: `540px ${GRID.y + GRID.h / 2}px`}}>
			{/* Card A — no website, no demand */}
			{aOut < 1 && (
				<div
					style={{
						position: 'absolute',
						left: A.x,
						top: A.y + (1 - aIn) * 40,
						width: A.w,
						height: A.h,
						borderRadius: 26,
						background: COLORS.surface,
						border: `2px solid ${COLORS.line}`,
						opacity: aIn * (picked ? lerp(1, 0.32, pickT) : 1) * (1 - aOut),
						padding: 40,
					}}
				>
					<div style={{display: 'flex', alignItems: 'center', gap: 22}}>
						<Badge l="A" />
						<div style={{fontFamily: FONTS.sans, fontSize: 44, fontWeight: 620, letterSpacing: '-0.03em', color: COLORS.text}}>{INSIGHT.a.label}</div>
						<div style={{flex: 1}} />
						<div style={{fontFamily: FONTS.sans, fontSize: 34, color: COLORS.textDim}}>{INSIGHT.a.rating}</div>
					</div>
					<div style={{display: 'flex', flexWrap: 'wrap', gap: 14, marginTop: 34}}>
						{INSIGHT.a.signals.map((s) => (
							<Chip key={s} size={28}>
								{s}
							</Chip>
						))}
					</div>
				</div>
			)}

			{/* Card B — real demand + fixable web problem */}
			<div
				style={{
					position: 'absolute',
					left: bx,
					top: by + (1 - bIn) * 40,
					width: B.w,
					height: B.h,
					borderRadius: lerp(26, 60, toGrid),
					background: COLORS.surface,
					border: `${lerp(2, 8, toGrid)}px solid ${picked ? `rgba(230,63,109,${lerp(0.25, 0.75, pickT)})` : COLORS.line}`,
					boxShadow: picked ? `0 0 0 ${8 * pickT}px rgba(230,63,109,0.08), 0 40px 120px rgba(0,0,0,0.6)` : '0 40px 120px rgba(0,0,0,0.6)',
					opacity: bIn,
					transform: `scale(${bs * press(f, T.PICK_B)})`,
					transformOrigin: '0 0',
					padding: 40,
				}}
			>
				<div style={{display: 'flex', alignItems: 'center', gap: 22, opacity: 1 - toGrid}}>
					<Badge l="B" on={picked} />
					<div style={{fontFamily: FONTS.sans, fontSize: 44, fontWeight: 620, letterSpacing: '-0.03em', color: COLORS.text}}>{INSIGHT.b.label}</div>
					<div style={{flex: 1}} />
					<div style={{fontFamily: FONTS.sans, fontSize: 34, color: COLORS.text}}>{INSIGHT.b.rating}</div>
				</div>
				<div style={{marginTop: 34, opacity: 1 - toGrid}}>
					<div style={{...mono, color: demandOn ? COLORS.text : COLORS.textDim, marginBottom: 14}}>DEMAND</div>
					<div style={{display: 'flex', gap: 14}}>
						{INSIGHT.b.demand.map((s, i) => (
							<Chip key={s} size={30} tone={demandOn ? 'bright' : 'plain'} style={{transform: `scale(${demandOn ? lerp(1.06, 1, ramp(f, T.DEMAND_SIGNALS + i * 4, 12)) : 1})`}}>
								{s}
							</Chip>
						))}
					</div>
					<div style={{...mono, color: problemOn ? COLORS.text : COLORS.textDim, margin: '28px 0 14px'}}>WEBSITE PROBLEM</div>
					<div style={{display: 'flex', gap: 14}}>
						{INSIGHT.b.problem.map((s, i) => (
							<Chip key={s} size={30} tone={problemOn ? 'accent' : 'plain'} style={{transform: `scale(${problemOn ? lerp(1.06, 1, ramp(f, T.WEBPROBLEM_SIGNALS + i * 4, 12)) : 1})`}}>
								{problemOn && <Dot c={COLORS.accent} s={10} />}
								{s}
							</Chip>
						))}
					</div>
				</div>
			</div>

			{/* Fifty of them */}
			{f >= T.FIFTY_IN + 4 &&
				T.FIFTY_FILL.map((at, i) => {
					if (i === 0) return null;
					const t = ramp(f, at, 10, EASE.snap);
					const c = cell(i);
					const flickIdx = T.TIME_FLICKS.filter((k) => k <= f).length;
					const lit = flickIdx > 0 && Math.floor(rand(flickIdx * 7.3) * 50) === i;
					return (
						<div
							key={i}
							style={{
								position: 'absolute',
								left: c.x,
								top: c.y,
								width: cellW,
								height: cellH,
								borderRadius: 14,
								background: lit ? 'rgba(244,244,246,0.14)' : COLORS.surface,
								border: `2px solid ${lit ? COLORS.lineHi : COLORS.line}`,
								opacity: t,
								transform: `scale(${lerp(0.7, 1, t)})`,
								display: 'flex',
								alignItems: 'center',
								gap: 10,
								padding: '0 16px',
							}}
						>
							<div style={{width: 22, height: 22, borderRadius: 11, border: `2px solid ${COLORS.lineHi}`}} />
							<div style={{flex: 1, height: 10, borderRadius: 5, background: 'rgba(244,244,246,0.1)'}} />
							<div style={{fontFamily: FONTS.sans, fontSize: 26, fontWeight: 600, color: COLORS.textMute}}>?</div>
						</div>
					);
				})}

			{f >= T.TIME_LINE - 6 && (
				<div style={{position: 'absolute', left: 0, right: 0, top: GRID.y + GRID.h + 40, display: 'flex', justifyContent: 'center', gap: 40, fontFamily: FONTS.mono, fontSize: 30, letterSpacing: '0.04em', color: COLORS.textDim, opacity: ramp(f, T.TIME_LINE - 6, 8)}}>
					<span>
						CHECKED <span style={{color: COLORS.text}}>{checked}</span> / 50
					</span>
					<span>
						<span style={{color: COLORS.text}}>
							{Math.floor(mins / 60)}h {String(mins % 60).padStart(2, '0')}m
						</span>
					</span>
				</div>
			)}

			{f >= T.PICK_HOVER - 14 && f < T.PICK_B + 16 && <Cursor x={cur.x} y={cur.y} scale={press(f, T.PICK_B)} opacity={ramp(f, T.PICK_HOVER - 14, 6) * (1 - ramp(f, T.PICK_B + 8, 8))} />}
		</div>
	);
};
