import React from 'react';
import {COLORS, EASE, FONTS} from '../constants/theme';
import {T} from '../constants/timeline';
import {COPY} from '../constants/copy';
import {lineScale} from '../components/ui';
import {Camera, CamKey, tilt3d} from '../fx/camera';
import {lerp, ramp, rand} from '../motion/anim';
import {DIVE_FOCUS, SCREEN, SCREENS} from './pain/screens';
import {Phone3D, Shatter, TabSwirl} from '../fx/devices';

const PW = SCREEN.w + 44;
const PH = SCREEN.h + 44;
const P0 = {x: 540 - PW / 2, y: 1170 - PH / 2}; // main phone (world)
const HOME: [number, number] = [540, 1010];
const GX = PW + 90;
const GY = PH + 110;
const WALL = [-2, -1, 0, 1, 2].flatMap((c) => [-1, 0, 1].map((r) => [c, r])).filter(([c, r]) => !(c === 0 && r === 0));

const cuts = T.PAIN_CUTS;

function cameraKeys(): CamKey[] {
	const k: CamKey[] = [
		[T.PAIN_START - 2, HOME[0], HOME[1] + 120, 1.9],
		[T.PAIN_START + 18, HOME[0], HOME[1], 1.06, 0, EASE.snap],
	];
	for (let i = 1; i < cuts.length; i++) {
		const c = cuts[i];
		const [fx, fy] = DIVE_FOCUS[i - 1];
		k.push([c - 11, HOME[0], HOME[1] - 10, 1.1]);
		k.push([c - 1, P0.x + 22 + fx, P0.y + 22 + fy, 3.8, 0, EASE.exit]);
		k.push([c, HOME[0], HOME[1], 1.75, 0]);
		k.push([c + 13, HOME[0], HOME[1], 1.06, 0, EASE.snap]);
	}
	// "Is this one even worth pitching?" — pull way back: it's every business, every night.
	k.push([T.WORTH_START - 2, HOME[0], HOME[1] - 10, 1.07]);
	k.push([T.WORTH_START + 34, 540, 1170, 0.36, 0, EASE.glide]);
	k.push([T.ZERO_IN, 540, 1170, 0.3, 0, EASE.linear]);
	return k;
}
const KEYS = cameraKeys();

/** 7.5–17.8s: the manual hunt, on a phone at 1:47 AM. */
export const Pain: React.FC<{f: number}> = ({f}) => {
	if (f < T.PAIN_START - 2 || f > T.PAIN_END + 2) return null;

	const idx = Math.max(0, cuts.filter((c) => c <= f).length - 1);
	const start = idx === 0 ? T.PAIN_START : cuts[idx];
	const Screen = SCREENS[idx];
	const enter = ramp(f, T.PAIN_START, 20, EASE.snap);
	const implode = ramp(f, T.ZERO_IN - 8, 9, EASE.exit);
	const wallIn = (i: number) => ramp(f, T.WORTH_START + 6 + i * 1.3, 14, EASE.snap);
	const flickIdx = T.WORTH_FLICKS.filter((k) => k <= f).length;
	const lit = flickIdx > 0 ? Math.floor(rand(flickIdx * 3.7) * WALL.length) : -1;

	const zeroOut = lineScale(f, T.PAIN_END - 8);

	return (
		<>
			{f < T.ZERO_IN + 2 && (
				<Camera f={f} keys={KEYS}>
					{/* the wall: same hunt, a dozen times over */}
					{f >= T.WORTH_START &&
						WALL.map(([c, r], i) => {
							const t = wallIn(i) * (1 - implode);
							if (t <= 0) return null;
							const W = SCREENS[(i + 1) % 5];
							return (
								<div
									key={i}
									style={{
										position: 'absolute',
										left: P0.x + c * GX,
										top: P0.y + r * GY,
										width: PW,
										height: PH,
										opacity: t,
										transform: `translate(${-c * GX * implode}px, ${-r * GY * implode}px) scale(${lerp(0.82, 1, t)})`,
									}}
								>
									<Phone3D w={PW} h={PH} ry={-c * 16} rx={r * -6} glow={i === lit ? 1 : 0}>
										<W lf={18 + ((i * 7) % 20)} />
									</Phone3D>
									{i === lit && <div style={{position: 'absolute', inset: -10, borderRadius: 96, border: '6px solid rgba(244,244,246,0.5)'}} />}
								</div>
							);
						})}
					{/* the phone in your hand */}
					<div
						style={{
							position: 'absolute',
							left: P0.x,
							top: P0.y,
							width: PW,
							height: PH,
							transform: `${tilt3d(enter, 38, -10, -300)} scale(${1 - implode})`,
							opacity: Math.min(1, enter * 1.5),
						}}
					>
						<Phone3D w={PW} h={PH} ry={Math.sin(f / 34) * 9 * (1 - ramp(f, T.WORTH_START, 20))} rx={4 + Math.sin(f / 51) * 3} rz={Math.sin(f / 60) * 1.2}>
							<Screen lf={f - start} />
						</Phone3D>
					</div>
				</Camera>
			)}

			{/* keep the caption legible over a full-bleed phone */}
			<div style={{position: 'absolute', left: 0, right: 0, top: 0, height: 640, background: `linear-gradient(180deg, ${COLORS.bg} 0%, rgba(5,5,5,0.92) 55%, rgba(5,5,5,0) 100%)`, opacity: ramp(f, T.PAIN_START, 10) * (1 - ramp(f, T.ZERO_IN, 8))}} />

			<Shatter t={(f - (T.ZERO_IN - 6)) / 34} cx={540} cy={1000} />
			{f >= T.ZERO_IN && <TabSwirl count={Math.round(lerp(23, 47, ramp(f, T.ZERO_IN, T.PAIN_END - T.ZERO_IN - 10, EASE.glide)))} spin={(f - T.ZERO_IN) / 260} y={1000} opacity={0.55 * ramp(f, T.ZERO_IN, 14) * (1 - ramp(f, T.PAIN_END - 10, 8))} />}
			{/* 47 tabs. 0 pitches. */}
			{f >= T.ZERO_IN && (
				<div style={{position: 'absolute', left: 0, right: 0, top: 440, textAlign: 'center', fontFamily: FONTS.sans, transform: `scaleY(${zeroOut}) scale(${lerp(1, 1.04, ramp(f, T.ZERO_IN, T.PAIN_END - T.ZERO_IN, EASE.linear))})`, transformOrigin: '50% 400px'}}>
					<div style={{display: 'flex', justifyContent: 'center', gap: 18, alignItems: 'baseline', fontFamily: FONTS.mono, fontSize: 34, letterSpacing: '0.06em', color: COLORS.textDim, marginBottom: 70, opacity: ramp(f, T.ZERO_IN + 2, 10)}}>
						TABS OPENED
						<span style={{fontFamily: FONTS.sans, fontSize: 64, fontWeight: 650, letterSpacing: '-0.03em', color: COLORS.text, fontVariantNumeric: 'tabular-nums', minWidth: 80, textAlign: 'left'}}>
							{Math.round(lerp(23, 47, ramp(f, T.ZERO_IN, T.PAIN_END - T.ZERO_IN - 10, EASE.glide)))}
						</span>
					</div>
					<div style={{fontSize: 48, fontWeight: 560, letterSpacing: '-0.025em', color: COLORS.textDim, opacity: ramp(f, T.ZERO_IN, 10)}}>{COPY.zeroLabel}</div>
					<div
						style={{
							fontSize: 520,
							fontWeight: 700,
							letterSpacing: '-0.06em',
							lineHeight: 1,
							color: COLORS.text,
							marginTop: 10,
							opacity: ramp(f, T.ZERO_IN + 4, 8),
							transform: `scale(${lerp(1.6, 1, ramp(f, T.ZERO_IN + 4, 14, EASE.snap))})`,
							filter: `blur(${(1 - ramp(f, T.ZERO_IN + 4, 10)) * 18}px)`,
						}}
					>
						0
					</div>
				</div>
			)}
		</>
	);
};
