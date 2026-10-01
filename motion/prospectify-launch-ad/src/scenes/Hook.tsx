import React from 'react';
import {COLORS, EASE, FONTS} from '../constants/theme';
import {T} from '../constants/timeline';
import {COPY} from '../constants/copy';
import {Check, MaskLine} from '../components/primitives';
import {lerp, press, ramp, typed} from '../motion/anim';

export const HOOK_BAR = {x: 70, y: 716, w: 940, h: 184};

/**
 * 0.0–2.0s — "Build a website" completes instantly. "Find a client" hesitates and hangs.
 * The same prompt bar is used for both, so the contrast is felt, not explained.
 */
export const Hook: React.FC<{f: number}> = ({f}) => {
	if (f >= T.CHAOS_START) return null;

	const isBuildPhase = f < T.HOOK_CLEAR + 6;
	const buildText = typed(COPY.hookBuild, T.BUILD_KEYS, f, T.BUILD_PREFILLED_CHARS);
	const clientText = typed(COPY.hookClient, T.CLIENT_KEYS, f);
	const text = isBuildPhase ? buildText : clientText;

	// Build text exits upward through the bar's mask at HOOK_CLEAR.
	const clearT = ramp(f, T.HOOK_CLEAR, 6, EASE.exit);
	const textY = isBuildPhase ? -clearT * 120 : 0;

	// Caret: solid while typing, blinks when idle (the stall).
	const lastKey = isBuildPhase ? T.BUILD_KEYS[T.BUILD_KEYS.length - 1] : T.CLIENT_KEYS[T.CLIENT_KEYS.length - 1];
	const idle = f > lastKey + 4;
	const caretOn = !idle || Math.floor((f - lastKey) / 16) % 2 === 1;
	const caretHidden = isBuildPhase && f >= T.BUILD_ENTER;

	// Done state
	const doneT = ramp(f, T.BUILD_DONE, 12, EASE.lock);
	const flash = isBuildPhase ? Math.max(0, 1 - Math.abs(f - T.BUILD_DONE) / 10) * (f >= T.BUILD_DONE ? 1 : 0) : 0;

	// The stall: a slow, uncomfortable push-in during the silence.
	const stallT = ramp(f, T.CLIENT_STALL, T.CHAOS_START - T.CLIENT_STALL, EASE.linear);
	const scale = lerp(1, 1.045, stallT);

	const sendPress = press(f, T.BUILD_ENTER);
	const sendActive = f >= T.BUILD_ENTER - 1 && f < T.HOOK_CLEAR;

	return (
		<div style={{position: 'absolute', inset: 0, transform: `scale(${scale})`, transformOrigin: '540px 808px'}}>
			{/* Prompt bar */}
			<div
				style={{
					position: 'absolute',
					left: HOOK_BAR.x,
					top: HOOK_BAR.y,
					width: HOOK_BAR.w,
					height: HOOK_BAR.h,
					borderRadius: 30,
					background: COLORS.surface,
					border: `2px solid ${flash > 0 ? `rgba(244,244,246,${0.14 + flash * 0.5})` : COLORS.line}`,
					boxShadow: '0 30px 80px rgba(0,0,0,0.5)',
					overflow: 'hidden',
				}}
			>
				<div
					style={{
						position: 'absolute',
						left: 52,
						top: 0,
						height: HOOK_BAR.h,
						display: 'flex',
						alignItems: 'center',
						transform: `translateY(${textY}%)`,
						fontFamily: FONTS.sans,
						fontSize: 84,
						fontWeight: 520,
						letterSpacing: '-0.03em',
						color: COLORS.text,
						whiteSpace: 'pre',
					}}
				>
					{text}
					<span
						style={{
							display: 'inline-block',
							width: 5,
							height: 94,
							marginLeft: 6,
							borderRadius: 2,
							background: COLORS.accent,
							opacity: caretOn && !caretHidden ? 1 : 0,
						}}
					/>
				</div>
				{/* Send button */}
				<div
					style={{
						position: 'absolute',
						right: 24,
						top: 36,
						width: 112,
						height: 112,
						borderRadius: 24,
						background: sendActive ? COLORS.text : COLORS.surfaceHi,
						transform: `scale(${sendPress})`,
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
					}}
				>
					<svg width={48} height={48} viewBox="0 0 24 24">
						<path
							d="M12 19V5M5.5 11.5 12 5l6.5 6.5"
							fill="none"
							stroke={sendActive ? COLORS.bg : COLORS.textMute}
							strokeWidth={2.4}
							strokeLinecap="round"
							strokeLinejoin="round"
						/>
					</svg>
				</div>
			</div>

			{/* DONE. — instant, solved, locked */}
			{f >= T.BUILD_DONE && f < T.HOOK_CLEAR + 12 && (
				<div
					style={{
						position: 'absolute',
						left: HOOK_BAR.x + 4,
						top: HOOK_BAR.y + HOOK_BAR.h + 60,
						display: 'flex',
						alignItems: 'center',
						gap: 28,
					}}
				>
					<div style={{opacity: 1 - ramp(f, T.HOOK_CLEAR, 6, EASE.exit)}}>
						<Check size={128} t={doneT} />
					</div>
					<MaskLine
						f={f}
						inAt={T.BUILD_DONE}
						outAt={T.HOOK_CLEAR}
						inDur={10}
						text={COPY.hookDone}
						style={{fontSize: 190, fontWeight: 700, letterSpacing: '-0.05em', color: COLORS.text, lineHeight: 1}}
					/>
				</div>
			)}
		</div>
	);
};
