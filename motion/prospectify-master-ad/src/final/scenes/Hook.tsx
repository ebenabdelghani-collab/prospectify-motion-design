import React from 'react';
import {C, EASE, FONT, T, clamp01, lerp, press, ramp, typed} from '../tokens';
import {Icon} from '../kit/icons';
import {LockCorners} from '../kit/signal';
import {caretOn, Kinetic, Mono} from '../kit/type';
import {BrowserFrame, HOOK_SITE, HOOK_THEME, SITE_H, SITE_W, Website} from '../kit/website';

/** 1 · HOOK — building is fast; finding someone worth pitching is not. Neutral world, no brand colour yet. */
const PromptBox: React.FC<{text: string; caret: boolean; sendP: number; placeholder?: string; style?: React.CSSProperties}> = ({text, caret, sendP, placeholder, style}) => (
	<div style={{position: 'absolute', width: 900, height: 168, borderRadius: 34, background: '#141416', border: '1.5px solid rgba(255,255,255,0.11)', boxShadow: '0 40px 120px rgba(0,0,0,0.6)', ...style}}>
		<div style={{position: 'absolute', left: 38, top: 36, right: 140, fontFamily: FONT.sans, fontSize: 40, fontWeight: 500, color: text ? C.text : C.text3, letterSpacing: '-0.015em', lineHeight: 1.25}}>
			{text || placeholder}
			{caret && <span style={{display: 'inline-block', width: 3, height: 44, marginLeft: 4, background: C.text, verticalAlign: '-6px'}} />}
		</div>
		<div style={{position: 'absolute', right: 30, bottom: 30, width: 76, height: 76, borderRadius: 38, background: text ? '#f5f5f7' : '#2a2a2e', transform: `scale(${sendP})`, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
			<svg width={34} height={34} viewBox="0 0 24 24" fill="none" stroke={text ? '#09090b' : '#5a5a60'} strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round">
				<path d="M12 19V5" />
				<path d="m5 12 7-7 7 7" />
			</svg>
		</div>
	</div>
);

const clock = (p: number) => {
	// 9:42 PM → 1:58 AM
	const start = 21 * 60 + 42;
	const mins = Math.round(start + p * (4 * 60 + 16));
	const h24 = Math.floor(mins / 60) % 24;
	const m = mins % 60;
	const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
	return {t: `${h12}:${String(m).padStart(2, '0')}`, ap: h24 >= 12 ? 'PM' : 'AM'};
};

export const Hook: React.FC<{f: number}> = ({f}) => {
	if (f > T.MAN_IN + 24) return null;
	const sendAt = T.HOOK_SEND;
	const built = f >= sendAt;
	const findMode = f >= T.FIND_IN;
	// prompt box: centre → top while the site builds → back to centre, empty, for the second ask
	const up = ramp(f, sendAt - 2, 16, EASE.CAMERA) * (1 - ramp(f, T.FIND_IN, 26, EASE.CAMERA));
	const boxY = lerp(876, 196, up);
	const boxScale = lerp(1, 0.8, up);
	const text1 = typed(T.HOOK_PROMPT, T.HOOK_KEYS, f);
	const text2 = typed(T.FIND_PROMPT, T.FIND_KEYS, f);
	const text = findMode ? text2 : built ? '' : text1;
	const intro = ramp(f, T.PROMPT_IN, 22, EASE.UI);
	const out = ramp(f, T.MAN_IN - 6, 22, EASE.EXIT);
	// site: rises into frame under the prompt, builds, locks, then recedes for the "find" beat
	const siteIn = ramp(f, sendAt + 10, 22, EASE.FAST_LOCK);
	const siteBack = ramp(f, T.FIND_IN - 6, 34, EASE.CAMERA);
	const steps = T.HOOK_SITE_STEPS as unknown as number[];
	const s8 = [steps[0], steps[1], steps[2], steps[3], steps[3] + 5, steps[4], steps[5], steps[6]];
	const siteScale = 0.92 * lerp(lerp(0.9, 1, siteIn), 0.74, siteBack);
	const siteY = lerp(lerp(560, 360, siteIn), 820, siteBack);
	const stalled = f >= T.STALL;
	const night = ramp(f, T.NIGHT_IN, 70, EASE.SOFT);
	const nightIn = ramp(f, T.NIGHT_IN - 4, 14, EASE.UI);
	const c = clock(night);
	return (
		<div style={{position: 'absolute', inset: 0, opacity: 1 - out, filter: out > 0.02 ? `blur(${out * 10}px)` : undefined, transform: `scale(${1 + out * 0.06})`}}>
			{/* site */}
			{f >= sendAt + 9 && (
				<div style={{position: 'absolute', left: 540 - (SITE_W * siteScale) / 2, top: siteY, width: SITE_W, height: SITE_H + 58, transform: `scale(${siteScale})`, transformOrigin: '0 0', opacity: Math.min(1, siteIn * 1.5) * lerp(1, 0.07, siteBack), filter: siteBack > 0.05 ? `blur(${siteBack * 5}px) saturate(${1 - siteBack * 0.8})` : undefined}}>
					<BrowserFrame w={SITE_W} h={SITE_H + 58} url="marlowflorals.com" style={{left: 0, top: 0}}>
						<Website f={f} steps={s8} theme={HOOK_THEME} c={HOOK_SITE} />
					</BrowserFrame>
				</div>
			)}
			{/* the site locks: a neutral (white) lock — the brand colour has not arrived yet */}
			<LockCorners f={f} at={T.HOOK_SITE_LOCK} x={540 - (SITE_W * 0.92) / 2} y={360} w={SITE_W * 0.92} h={(SITE_H + 58) * 0.92} spread={44} color="rgba(255,255,255,0.9)" hold={18} />
			{/* prompt */}
			<div style={{position: 'absolute', left: 90, top: boxY, width: 900, height: 168, transform: `scale(${boxScale * lerp(0.94, 1, intro)})`, transformOrigin: '50% 0%', opacity: intro}}>
				<PromptBox text={text} caret={(!built || findMode) && caretOn(f, stalled ? T.STALL : 1e9) && f > T.PROMPT_IN + 4} sendP={built && !findMode ? 1 : press(f, sendAt)} placeholder={findMode ? 'Ask anything' : 'Describe the website you want'} style={{left: 0, top: 0}} />
			</div>
			{/* headline: muted-viewing support for the first idea */}
			{!findMode && (
				<div style={{position: 'absolute', left: 90, top: 1490, width: 900, opacity: 1 - ramp(f, T.FIND_IN - 14, 10)}}>
					<Kinetic f={f} inAt={T.VO.v_build.start + 4} text="Building the site: 40 minutes." size={52} weight={700} color={C.text2} accent={['40', 'minutes.']} accentColor={C.text} stagger={2} />
				</div>
			)}
			{/* the stall: nothing moves but the caret… then the night goes */}
			{f >= T.NIGHT_IN - 4 && (
				<div style={{position: 'absolute', left: 0, right: 0, top: 470, textAlign: 'center', opacity: nightIn}}>
					<div style={{fontFamily: FONT.sans, fontSize: 168, fontWeight: 700, letterSpacing: '-0.05em', color: C.text, fontVariantNumeric: 'tabular-nums', lineHeight: 1}}>
						{c.t}
						<span style={{fontSize: 64, color: C.text3, marginLeft: 18, letterSpacing: '-0.02em'}}>{c.ap}</span>
					</div>
					<Mono size={22} style={{marginTop: 26}}>
						<span style={{display: 'inline-flex', alignItems: 'center', gap: 12}}>
							<Icon n="search" size={20} color={C.text3} />
							still looking · {Math.round(lerp(1, 23, night))} businesses checked
						</span>
					</Mono>
				</div>
			)}
			{/* a single quiet line of light under the empty field, so the silence reads as waiting */}
			{findMode && stalled && <div style={{position: 'absolute', left: 90, top: 876 + 190, width: 900 * clamp01((f - T.STALL) / 140), height: 1, background: 'rgba(255,255,255,0.12)'}} />}
		</div>
	);
};
