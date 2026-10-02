import React from 'react';
import {COLORS, EASE, FONTS} from '../constants/theme';
import {T} from '../constants/timeline';
import {COPY} from '../constants/copy';
import {Check, MaskLine} from '../components/primitives';
import {BrowserChrome, ClientSite, lineScale} from '../components/ui';
import {lerp, press, ramp, typed} from '../motion/anim';
import {Camera, tilt3d} from '../fx/camera';

const BAR = {x: 70, y: 300, w: 940, h: 160};
const BAR_CENTER_Y = 880;
const WIN = {x: 90, y: 540, w: 900, h: 860};

/** 0–7.7s: building is instant; finding a client stalls; the night disappears. */
export const Hook: React.FC<{f: number}> = ({f}) => {
	if (f >= T.PAIN_START + 2) return null;

	const buildPhase = f < T.HOOK_CLEAR + 6;
	const text = buildPhase ? typed(COPY.buildPrompt, T.BUILD_KEYS, f, T.BUILD_PREFILL) : typed(COPY.findPrompt, T.FIND_KEYS, f);
	const textY = buildPhase ? -ramp(f, T.HOOK_CLEAR, 6, EASE.exit) * 120 : 0;
	const lastKey = buildPhase ? T.BUILD_KEYS[T.BUILD_KEYS.length - 1] : T.FIND_KEYS[T.FIND_KEYS.length - 1];
	const idle = f > lastKey + 4;
	const caretOn = (!idle || Math.floor((f - lastKey) / 16) % 2 === 1) && !(buildPhase && f >= T.BUILD_ENTER);
	const sendActive = f >= T.BUILD_ENTER - 1 && f < T.HOOK_CLEAR;

	// Bar starts centred, lifts as the site builds under it, returns to centre for the stall.
	const lift = ramp(f, T.BUILD_ENTER - 2, 16, EASE.glide) * (1 - ramp(f, T.HOOK_CLEAR, 16, EASE.glide));
	const barY = lerp(BAR_CENTER_Y, BAR.y, lift);

	// The stall: a slow, uncomfortable push-in during the silence.
	const stall = ramp(f, T.STALL, T.CLOCK_IN - T.STALL, EASE.linear);
	const push = lerp(1, 1.05, stall);

	// Bar → line → clock
	const barScale = lineScale(f, T.CLOCK_IN - 8);
	const clockScale = f >= T.CLOCK_IN ? lineScale(f, T.PAIN_START - 10, T.CLOCK_IN) : 0;
	const clockCollapse = f >= T.PAIN_START - 10 ? lineScale(f, T.PAIN_START - 10) : 1;

	// Window: grows from a line on send, collapses on clear
	const winOpen = f >= T.BUILD_ENTER + 2 ? lineScale(f, T.HOOK_CLEAR - 8, T.BUILD_ENTER + 2) : 0;

	// Clock rolls through the night, decelerating onto 2:13 AM
	const ampm = f - T.CLOCK_IN - 4 >= 2 * 10 ? 'AM' : 'PM';

	return (
		<>
			{f < T.CLOCK_IN && (
				<Camera
					f={f}
					keys={[
						[0, 330, BAR_CENTER_Y + 80, 2.7],
						[T.BUILD_KEYS[T.BUILD_KEYS.length - 1] - 2, 470, BAR_CENTER_Y + 80, 1.55, 0],
						[T.BUILD_ENTER + 2, 540, 960, 1.0, 0, EASE.snap],
						[T.HOOK_CLEAR - 6, 540, 900, 1.06, 0, EASE.linear],
						[T.HOOK_CLEAR + 10, 540, 960, 1.0, 0, EASE.glide],
						[T.STALL, 540, 960, 1.04, 0, EASE.linear],
						[T.CLOCK_IN, 470, 960, 1.22, 0, EASE.linear],
					]}
				>
				<div style={{position: 'absolute', inset: 0, transform: `scale(${push})`, transformOrigin: `540px ${barY + BAR.h / 2}px`}}>
					<div
						style={{
							position: 'absolute',
							left: BAR.x,
							top: barY,
							width: BAR.w,
							height: BAR.h,
							borderRadius: 30,
							background: COLORS.surface,
							border: `2px solid ${COLORS.lineHi}`,
							boxShadow: '0 30px 80px rgba(0,0,0,0.5)',
							overflow: 'hidden',
							transform: `scaleY(${barScale})`,
						}}
					>
						<div style={{position: 'absolute', left: 50, top: 0, height: BAR.h, display: 'flex', alignItems: 'center', transform: `translateY(${textY}%)`, fontFamily: FONTS.sans, fontSize: 64, fontWeight: 520, letterSpacing: '-0.03em', color: COLORS.text, whiteSpace: 'pre'}}>
							{text}
							<span style={{display: 'inline-block', width: 5, height: 74, marginLeft: 6, borderRadius: 2, background: COLORS.accent, opacity: caretOn ? 1 : 0}} />
						</div>
						<div
							style={{
								position: 'absolute',
								right: 26,
								top: 26,
								width: 108,
								height: 108,
								borderRadius: 26,
								background: sendActive ? COLORS.text : COLORS.surfaceHi,
								transform: `scale(${press(f, T.BUILD_ENTER)})`,
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
							}}
						>
							<svg width={46} height={46} viewBox="0 0 24 24">
								<path d="M12 19V5M5.5 11.5 12 5l6.5 6.5" fill="none" stroke={sendActive ? COLORS.bg : COLORS.textMute} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" />
							</svg>
						</div>
					</div>

					{winOpen > 0 && f < T.HOOK_CLEAR + 2 && (
						<div style={{position: 'absolute', left: WIN.x, top: WIN.y, width: WIN.w, height: WIN.h, borderRadius: 28, overflow: 'hidden', border: `2px solid ${COLORS.lineHi}`, background: COLORS.surface, boxShadow: '0 40px 140px rgba(0,0,0,0.6)', transform: `${tilt3d(ramp(f, T.BUILD_ENTER + 2, 22, EASE.snap), 32, 0, -200)} scaleY(${winOpen}) scale(${lerp(1, 1.035, ramp(f, T.SITE_STEPS[4], T.HOOK_CLEAR - T.SITE_STEPS[4], EASE.linear))})`}}>
							<BrowserChrome
								label="Preview"
								progress={ramp(f, T.BUILD_ENTER, T.SITE_DONE - T.BUILD_ENTER, EASE.linear)}
								right={
									f < T.SITE_DONE ? (
										<div style={{fontFamily: FONTS.mono, fontSize: 22, color: COLORS.textDim, letterSpacing: '0.04em'}}>
											BUILDING · {Math.round(lerp(0, 40, ramp(f, T.BUILD_ENTER, T.SITE_DONE - T.BUILD_ENTER, EASE.linear)))} MIN
										</div>
									) : f >= T.SITE_DONE ? (
										<div style={{display: 'flex', alignItems: 'center', gap: 10, fontFamily: FONTS.sans, fontSize: 24, fontWeight: 600, color: COLORS.text, opacity: ramp(f, T.SITE_DONE, 8)}}>
											<Check size={30} t={ramp(f, T.SITE_DONE, 14, EASE.lock)} />
											{COPY.builtChip}
										</div>
									) : null
								}
							/>
							<div style={{position: 'absolute', left: 0, right: 0, top: 64, bottom: 0}}>
								<ClientSite f={f} steps={T.SITE_STEPS} />
							</div>
						</div>
					)}
				</div>
				</Camera>
			)}

			{/* The night: a clock that won't stop */}
			{f >= T.CLOCK_IN && (
				<div style={{position: 'absolute', left: 0, right: 0, top: 640, transform: `scaleY(${Math.min(clockScale, clockCollapse)})`, transformOrigin: '50% 160px'}}>
					<div style={{display: 'flex', justifyContent: 'center', alignItems: 'baseline', gap: 26, fontFamily: FONTS.sans, color: COLORS.text}}>
						<Odometer f={f} start={T.CLOCK_IN + 4} />
						<div style={{fontSize: 80, fontWeight: 600, letterSpacing: '-0.03em', color: COLORS.textDim}}>{ampm}</div>
					</div>
					<div style={{marginTop: 70}}>
						<MaskLine f={f} inAt={T.CLOCK_IN + 6} text={COPY.nightCaption} align="center" style={{fontSize: 52, fontWeight: 560, letterSpacing: '-0.03em', color: COLORS.textDim}} />
					</div>
				</div>
			)}
		</>
	);
};

/** Mechanical clock: the night jumps forward in readable steps; only the digits that change roll. */
const DIGIT_H = 260;
const TIMES: [number, number, number][] = [
	[0, 4, 8], // 11:48 (hour index, tens, ones) — hours: 11, 12, 1, 2
	[0, 5, 2],
	[1, 0, 7],
	[1, 3, 1],
	[1, 5, 8],
	[2, 2, 4],
	[2, 4, 7],
	[3, 1, 3], // 2:13
];
export const CLOCK_STEP = 10;
const Strip: React.FC<{from: number; to: number; r: number; labels: string[]; w: number; align?: 'right' | 'center'}> = ({from, to, r, labels, w, align = 'center'}) => {
	const n = labels.length;
	const delta = (to - from + n) % n;
	const pos = from + delta * r;
	const list = [...labels, ...labels];
	return (
		<div style={{height: DIGIT_H, width: w, overflow: 'hidden', position: 'relative'}}>
			<div style={{position: 'absolute', left: 0, right: 0, top: -pos * DIGIT_H, textAlign: align}}>
				{list.map((l, i) => (
					<div key={i} style={{height: DIGIT_H, lineHeight: `${DIGIT_H}px`}}>
						{l}
					</div>
				))}
			</div>
		</div>
	);
};
const Odometer: React.FC<{f: number; start: number}> = ({f, start}) => {
	const k = Math.max(0, Math.min(TIMES.length - 1, Math.floor((f - start) / CLOCK_STEP)));
	const prev = TIMES[Math.max(0, k - 1)];
	const cur = TIMES[k];
	const r = k === 0 ? 1 : EASE.snap(Math.min(1, (f - start - k * CLOCK_STEP) / 7));
	const mask = 'linear-gradient(180deg, transparent 0%, #000 24%, #000 76%, transparent 100%)';
	return (
		<div style={{display: 'flex', alignItems: 'center', fontSize: 260, fontWeight: 650, letterSpacing: '-0.06em', fontVariantNumeric: 'tabular-nums', lineHeight: 1, maskImage: mask, WebkitMaskImage: mask}}>
			<Strip from={prev[0]} to={cur[0]} r={r} labels={['11', '12', '1', '2']} w={290} align="right" />
			<div style={{height: DIGIT_H, lineHeight: `${DIGIT_H - 20}px`, margin: '0 4px'}}>:</div>
			<Strip from={prev[1]} to={cur[1]} r={r} labels={['0', '1', '2', '3', '4', '5']} w={150} />
			<Strip from={prev[2]} to={cur[2]} r={r} labels={['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']} w={150} />
		</div>
	);
};
