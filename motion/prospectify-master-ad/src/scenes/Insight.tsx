import React from 'react';
import {COLORS, EASE, FONTS} from '../constants/theme';
import {T} from '../constants/timeline';
import {INSIGHT} from '../constants/demoData';
import {Cursor} from '../components/primitives';
import {Chip, Dot, mono} from '../components/ui';
import {Camera, Sheen, tilt3d} from '../fx/camera';
import {lerp, path, press, ramp, rand} from '../motion/anim';

const A = {x: 90, y: 660, w: 900, h: 290};
const B = {x: 90, y: 990, w: 900, h: 420};
const PIN0: [number, number] = [540, 1150]; // where card B becomes a pin

// 50 pins across the city (deterministic)
const PINS: [number, number][] = [PIN0];
for (let i = 1; i < 50; i++) {
	const a = rand(i * 7.1) * Math.PI * 2;
	const r = 140 + Math.sqrt(rand(i * 3.3)) * 1250;
	PINS.push([PIN0[0] + Math.cos(a) * r * 0.75, PIN0[1] + Math.sin(a) * r]);
}

const CityMap: React.FC = () => (
	<svg width={3600} height={4400} viewBox="0 0 3600 4400" style={{position: 'absolute', left: PIN0[0] - 1800, top: PIN0[1] - 2200}}>
		<rect width={3600} height={4400} fill="#0E1014" />
		{Array.from({length: 46}).map((_, r) =>
			Array.from({length: 40}).map((__, c) => {
				const x = c * 92 + (r % 2) * 20;
				const y = r * 96;
				const park = rand(r * 13 + c * 7) > 0.95;
				return <rect key={`${r}-${c}`} x={x} y={y} width={78} height={80} rx={8} fill={park ? '#132219' : '#15181E'} transform={`rotate(-9 ${x} ${y})`} />;
			}),
		)}
		<path d="M0 2900 C 700 2700, 1300 3100, 2000 2860 S 3100 2700, 3600 2820 L3600 3020 C 3000 2920, 2400 3140, 1800 3080 S 600 2960, 0 3150 Z" fill="#12263A" />
		{[
			'M0 1800 L3600 1100',
			'M0 2300 L3600 1600',
			'M1500 0 L2100 4400',
			'M800 0 L1100 4400',
			'M2600 0 L2900 4400',
		].map((d, i) => (
			<path key={i} d={d} stroke="#262A33" strokeWidth={30} />
		))}
	</svg>
);

/** 17.8–28.5s: the insight, then the scale problem — told on a map. */
export const Insight: React.FC<{f: number}> = ({f}) => {
	if (f < T.INSIGHT_Q || f > T.BLACK + 2) return null;

	const aIn = ramp(f, T.CARD_A_IN, 18, EASE.snap);
	const bIn = ramp(f, T.CARD_B_IN, 18, EASE.snap);
	const picked = f >= T.PICK_B;
	const pickT = ramp(f, T.PICK_B, 14, EASE.lock);
	const demandOn = f >= T.DEMAND_SIGNALS;
	const problemOn = f >= T.WEBPROBLEM_SIGNALS;

	// B → pin
	const toPin = ramp(f, T.FIFTY_IN, 16, EASE.exit);
	const cardsGone = f >= T.FIFTY_IN + 16;
	const mapIn = ramp(f, T.FIFTY_IN + 8, 14);
	const implode = ramp(f, T.SCALE_COLLAPSE, 11, EASE.exit);

	const cam = [
		[T.INSIGHT_Q, 540, 1040, 1.0],
		[T.PICK_B, 540, 1040, 1.03, 0, EASE.linear],
		[T.PICK_B + 16, 540, 1150, 1.12, 0, EASE.glide],
		[T.DEMAND_SIGNALS - 4, 540, 1160, 1.14, 0, EASE.linear],
		[T.DEMAND_SIGNALS + 14, 420, 1170, 1.34],
		[T.WEBPROBLEM_SIGNALS - 2, 430, 1180, 1.36, 0, EASE.linear],
		[T.WEBPROBLEM_SIGNALS + 14, 440, 1290, 1.36],
		[T.FIFTY_IN, 480, 1270, 1.38, 0, EASE.linear],
		[T.FIFTY_IN + 16, PIN0[0], PIN0[1] - 40, 2.1, 0, EASE.glide],
		[T.TIME_LINE - 4, PIN0[0], PIN0[1] - 60, 0.62, 0, EASE.glide],
		[T.SCALE_COLLAPSE, PIN0[0], PIN0[1] - 60, 0.5, -4, EASE.linear],
		[T.BLACK, PIN0[0], PIN0[1] - 60, 0.46, -5, EASE.linear],
	] as [number, number, number, number, number?, ((t: number) => number)?][];

	const cur = path(f, [
		[T.PICK_HOVER - 14, 760, 1560],
		[T.PICK_HOVER, 700, 1120],
		[T.PICK_B + 10, 700, 1130],
	]);

	const flickIdx = T.TIME_FLICKS.filter((k) => k <= f).length;
	const timeT = ramp(f, T.TIME_LINE - 6, T.SCALE_COLLAPSE - T.TIME_LINE + 6, EASE.linear);
	const checked = Math.min(3, 1 + Math.floor(timeT * 3));
	const mins = Math.round(lerp(42, 186, timeT));

	return (
		<>
			<Camera f={f} keys={cam}>
				{/* the city — appears as we pull back */}
				{mapIn > 0 && (
					<div style={{position: 'absolute', left: 0, top: 0, opacity: mapIn * (1 - implode)}}>
						<CityMap />
					</div>
				)}
				{f >= T.FIFTY_IN + 4 &&
					PINS.map(([x, y], i) => {
						const at = T.FIFTY_FILL[i];
						const t = ramp(f, at, 10, EASE.snap);
						if (t <= 0) return null;
						const px = lerp(x, PIN0[0], implode);
						const py = lerp(y, PIN0[1], implode);
						const lit = flickIdx > 0 && Math.floor(rand(flickIdx * 5.1) * 50) === i;
						const first = i === 0;
						return (
							<div key={i} style={{position: 'absolute', left: px - 30, top: py - 74, width: 60, height: 74, opacity: t * (1 - implode * 0.6), transform: `translateY(${(1 - t) * -50}px) scale(${(first ? 1.25 : 1) * lerp(1, 0.3, implode)})`, transformOrigin: '30px 74px'}}>
								<svg width={60} height={74} viewBox="0 0 44 56">
									<path d="M22 55 C 8 36, 2 28, 2 21 A 20 20 0 1 1 42 21 C 42 28, 36 36, 22 55 Z" fill={first ? COLORS.accent : lit ? '#FFFFFF' : '#C9CBD2'} />
								</svg>
								<div style={{position: 'absolute', left: 0, top: 8, width: 60, textAlign: 'center', fontFamily: FONTS.sans, fontSize: 30, fontWeight: 800, color: first ? '#fff' : '#15181E'}}>{first ? 'B' : '?'}</div>
							</div>
						);
					})}

				{/* the A / B cards */}
				{!cardsGone && (
					<>
						<div
							style={{
								position: 'absolute',
								left: A.x,
								top: A.y,
								width: A.w,
								height: A.h,
								borderRadius: 26,
								background: COLORS.surface,
								border: `2px solid ${COLORS.line}`,
								padding: 40,
								opacity: aIn * (picked ? lerp(1, 0.35, pickT) : 1) * (1 - toPin),
								transform: tilt3d(aIn, 0, -32, -220),
								filter: picked ? `blur(${pickT * 5}px)` : undefined,
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
						<div
							style={{
								position: 'absolute',
								left: B.x,
								top: B.y,
								width: B.w,
								height: B.h,
								borderRadius: 26,
								background: COLORS.surface,
								border: `2px solid ${picked ? `rgba(230,63,109,${lerp(0.25, 0.8, pickT)})` : COLORS.line}`,
								boxShadow: picked ? `0 0 0 ${10 * pickT}px rgba(230,63,109,0.08), 0 50px 140px rgba(0,0,0,0.7)` : '0 40px 120px rgba(0,0,0,0.6)',
								padding: 40,
								opacity: bIn,
								transform: `${tilt3d(bIn, 0, 32, -220)} translate(${(PIN0[0] - (B.x + B.w / 2)) * toPin}px, ${(PIN0[1] - 40 - (B.y + B.h / 2)) * toPin}px) scale(${lerp(1, 0.05, toPin) * press(f, T.PICK_B)})`,
								overflow: 'hidden',
							}}
						>
							<Sheen t={ramp(f, T.PICK_B + 2, 22, EASE.glide)} />
							<Sheen t={ramp(f, T.WEBPROBLEM_SIGNALS, 22, EASE.glide)} opacity={0.12} />
							<div style={{display: 'flex', alignItems: 'center', gap: 22}}>
								<Badge l="B" on={picked} />
								<div style={{fontFamily: FONTS.sans, fontSize: 44, fontWeight: 620, letterSpacing: '-0.03em', color: COLORS.text}}>{INSIGHT.b.label}</div>
								<div style={{flex: 1}} />
								<div style={{fontFamily: FONTS.sans, fontSize: 34, color: '#F5B400'}}>★ <span style={{color: COLORS.text}}>4.8</span></div>
							</div>
							<div style={{marginTop: 34}}>
								<div style={{...mono, color: demandOn ? COLORS.text : COLORS.textDim, marginBottom: 14}}>DEMAND</div>
								<div style={{display: 'flex', gap: 14}}>
									{INSIGHT.b.demand.map((s, i) => (
										<Chip key={s} size={30} tone={demandOn ? 'bright' : 'plain'} style={{transform: `scale(${demandOn ? lerp(1.12, 1, ramp(f, T.DEMAND_SIGNALS + i * 4, 14, EASE.snap)) : 1})`}}>
											{s}
										</Chip>
									))}
								</div>
								<div style={{...mono, color: problemOn ? COLORS.text : COLORS.textDim, margin: '28px 0 14px'}}>WEBSITE PROBLEM</div>
								<div style={{display: 'flex', gap: 14}}>
									{INSIGHT.b.problem.map((s, i) => (
										<Chip key={s} size={30} tone={problemOn ? 'accent' : 'plain'} style={{transform: `scale(${problemOn ? lerp(1.12, 1, ramp(f, T.WEBPROBLEM_SIGNALS + i * 4, 14, EASE.snap)) : 1})`}}>
											{problemOn && <Dot c={COLORS.accent} s={10} />}
											{s}
										</Chip>
									))}
								</div>
							</div>
						</div>
					</>
				)}
				{f >= T.PICK_HOVER - 14 && f < T.PICK_B + 16 && <Cursor x={cur.x} y={cur.y} scale={press(f, T.PICK_B)} opacity={ramp(f, T.PICK_HOVER - 14, 6) * (1 - ramp(f, T.PICK_B + 8, 8))} />}
			</Camera>

			{/* time disappearing */}
			{f >= T.TIME_LINE - 6 && f < T.SCALE_COLLAPSE + 6 && (
				<div style={{position: 'absolute', left: 0, right: 0, top: 1430, display: 'flex', justifyContent: 'center', gap: 40, fontFamily: FONTS.mono, fontSize: 32, letterSpacing: '0.04em', color: COLORS.textDim, opacity: ramp(f, T.TIME_LINE - 6, 8) * (1 - ramp(f, T.SCALE_COLLAPSE, 6))}}>
					<span style={{background: 'rgba(5,5,5,0.75)', padding: '10px 18px', borderRadius: 12}}>
						CHECKED <span style={{color: COLORS.text}}>{checked}</span> / 50 · <span style={{color: COLORS.text}}>{Math.floor(mins / 60)}h {String(mins % 60).padStart(2, '0')}m</span>
					</span>
				</div>
			)}
			{/* the implosion flash, where the logo will be born */}
			{f >= T.SCALE_COLLAPSE + 6 && f < T.BLACK + 2 && (
				<div style={{position: 'absolute', left: 540 - 60, top: 960 - 60, width: 120, height: 120, borderRadius: 60, background: 'radial-gradient(circle, rgba(255,255,255,0.9) 0%, rgba(230,63,109,0.5) 35%, rgba(5,5,5,0) 70%)', opacity: 1 - ramp(f, T.SCALE_COLLAPSE + 6, 8), transform: `scale(${lerp(0.4, 2.2, ramp(f, T.SCALE_COLLAPSE + 6, 8, EASE.snap))})`}} />
			)}
		</>
	);
};

const Badge: React.FC<{l: string; on?: boolean}> = ({l, on}) => (
	<div style={{width: 64, height: 64, borderRadius: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONTS.sans, fontSize: 34, fontWeight: 700, color: on ? '#fff' : COLORS.text, background: on ? COLORS.accent : 'rgba(244,244,246,0.08)'}}>{l}</div>
);
