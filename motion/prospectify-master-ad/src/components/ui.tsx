import React from 'react';
import {COLORS, EASE, FONTS, LAYOUT} from '../constants/theme';
import {HEADLINES} from '../constants/copy';
import {LEAD} from '../constants/demoData';
import {Check, MaskLine} from './primitives';
import {clamp01, lerp, ramp} from '../motion/anim';

export const HEADLINE_STYLE: React.CSSProperties = {
	fontSize: 92,
	fontWeight: 650,
	letterSpacing: '-0.045em',
	lineHeight: 1.02,
	color: COLORS.text,
};

export const mono: React.CSSProperties = {fontFamily: FONTS.mono, fontSize: 22, letterSpacing: '0.06em', color: COLORS.textDim};

/** One headline system for the whole film: masks in, holds, masks out as the next arrives. */
export const HeadlineTrack: React.FC<{f: number}> = ({f}) => {
	return (
		<>
			{HEADLINES.map((h, i) => {
				const next = HEADLINES[i + 1];
				const outAt = next ? next.at - 7 : 1e9;
				if (f < h.at - 1 || f > outAt + 12 || h.lines.length === 0) return null;
				const size = h.size ?? 92;
				return (
					<div key={i} style={{position: 'absolute', left: LAYOUT.headlineX, top: LAYOUT.headlineY}}>
						{h.lines.map((line, j) => {
							const last = j === h.lines.length - 1;
							return (
								<div key={j} style={{display: 'flex', alignItems: 'center', gap: 22}}>
									<MaskLine
										f={f}
										inAt={h.at + j * 4}
										outAt={outAt + j * 1.5}
										inDur={12}
										outDur={7}
										text={line}
										style={{...HEADLINE_STYLE, fontSize: size, color: h.dim?.includes(j) ? COLORS.textDim : COLORS.text}}
									/>
									{last && h.checkAt !== undefined && f >= h.checkAt && (
										<div style={{opacity: 1 - ramp(f, outAt, 6, EASE.exit)}}>
											<Check size={Math.round(size * 0.78)} t={ramp(f, h.checkAt, 14, EASE.lock)} />
										</div>
									)}
								</div>
							);
						})}
						{h.sub && (
							<div style={{marginTop: 24}}>
								<MaskLine f={f} inAt={h.at + 10} outAt={outAt} text={h.sub} style={{fontSize: 38, fontWeight: 480, letterSpacing: '-0.02em', color: COLORS.textDim}} />
							</div>
						)}
					</div>
				);
			})}
		</>
	);
};

/** "The line": the film's transition family — objects resolve into a hairline and re-expand. */
export const lineScale = (f: number, collapseAt: number, expandAt?: number) => {
	const c = ramp(f, collapseAt, 8, EASE.exit);
	if (expandAt !== undefined && f >= expandAt) return lerp(0.004, 1, ramp(f, expandAt, 13, EASE.snap));
	return lerp(1, 0.004, c);
};

export const Chip: React.FC<{children: React.ReactNode; tone?: 'accent' | 'bright' | 'plain'; size?: number; style?: React.CSSProperties}> = ({
	children,
	tone = 'plain',
	size = 30,
	style,
}) => (
	<div
		style={{
			display: 'flex',
			alignItems: 'center',
			gap: 12,
			height: size * 1.9,
			padding: `0 ${size * 0.72}px`,
			borderRadius: 14,
			background: tone === 'accent' ? COLORS.accentSoft : tone === 'bright' ? 'rgba(244,244,246,0.12)' : 'rgba(244,244,246,0.06)',
			border: `1.5px solid ${tone === 'accent' ? 'rgba(230,63,109,0.5)' : tone === 'bright' ? 'rgba(244,244,246,0.35)' : COLORS.line}`,
			fontFamily: FONTS.sans,
			fontSize: size,
			fontWeight: 520,
			letterSpacing: '-0.015em',
			color: COLORS.text,
			whiteSpace: 'nowrap',
			...style,
		}}
	>
		{children}
	</div>
);

export const Dot: React.FC<{c: string; s?: number}> = ({c, s = 12}) => <div style={{width: s, height: s, borderRadius: s / 2, background: c, flexShrink: 0}} />;

export const Card: React.FC<{style?: React.CSSProperties; children?: React.ReactNode}> = ({style, children}) => (
	<div
		style={{
			position: 'absolute',
			borderRadius: 26,
			background: COLORS.surface,
			border: `2px solid ${COLORS.line}`,
			boxShadow: '0 40px 120px rgba(0,0,0,0.55)',
			overflow: 'hidden',
			...style,
		}}
	>
		{children}
	</div>
);

// ── The client website (built by the user's AI builder, not by Prospectify) ──
const S = COLORS.site;

export const BuildStep: React.FC<{f: number; at: number; children: React.ReactNode; style?: React.CSSProperties}> = ({f, at, children, style}) => {
	const t = ramp(f, at, 9, EASE.snap);
	return (
		<div style={{position: 'relative', ...style}}>
			<div style={{position: 'absolute', inset: 0, borderRadius: 14, border: '2px dashed rgba(16,35,61,0.18)', opacity: 1 - t}} />
			<div style={{clipPath: `inset(0 ${(1 - t) * 100}% 0 0)`, opacity: f >= at ? 1 : 0}}>{children}</div>
		</div>
	);
};

export const ClientSite: React.FC<{f: number; steps: number[]}> = ({f, steps}) => (
	<div style={{position: 'absolute', inset: 0, background: S.bg, padding: '28px 40px', fontFamily: FONTS.sans, color: S.ink}}>
		<BuildStep f={f} at={steps[0]} style={{height: 56}}>
			<div style={{display: 'flex', alignItems: 'center', height: 56}}>
				<svg width={34} height={34} viewBox="0 0 24 24">
					<path d="M12 2.5C9 7 6 10.2 6 14a6 6 0 0 0 12 0c0-3.8-3-7-6-11.5Z" fill={S.brand} />
				</svg>
				<div style={{marginLeft: 12, fontSize: 28, fontWeight: 700, letterSpacing: '-0.03em'}}>{LEAD.name}</div>
				<div style={{flex: 1}} />
				<div style={{fontSize: 22, color: S.inkDim, marginRight: 26}}>Services</div>
				<div style={{fontSize: 22, color: S.inkDim, marginRight: 26}}>Reviews</div>
				<div style={{fontSize: 22, fontWeight: 600, color: '#fff', background: S.ink, padding: '10px 18px', borderRadius: 10}}>Book online</div>
			</div>
		</BuildStep>
		<BuildStep f={f} at={steps[1]} style={{marginTop: 34, height: 176}}>
			<div style={{fontSize: 74, fontWeight: 750, letterSpacing: '-0.05em', lineHeight: 0.98}}>
				Austin’s trusted
				<br />
				plumbers.
			</div>
			<div style={{fontSize: 26, color: S.inkDim, marginTop: 14}}>
				Fast repairs, fair prices — rated {LEAD.rating}★ by {LEAD.reviews} neighbors.
			</div>
		</BuildStep>
		<BuildStep f={f} at={steps[2]} style={{marginTop: 26, height: 210}}>
			<div style={{height: 210, borderRadius: 20, overflow: 'hidden', position: 'relative', background: `linear-gradient(120deg, ${S.brand} 0%, #1C4FB8 45%, ${S.ink} 100%)`}}>
				<svg width="100%" height="100%" viewBox="0 0 820 210" style={{position: 'absolute', inset: 0}} preserveAspectRatio="none">
					<path d="M-10 150 H260 Q300 150 300 110 V70 Q300 40 330 40 H560 Q590 40 590 70 V160 Q590 180 610 180 H830" fill="none" stroke="rgba(255,255,255,0.22)" strokeWidth={22} strokeLinecap="round" />
					<path d="M-10 150 H260 Q300 150 300 110 V70 Q300 40 330 40 H560 Q590 40 590 70 V160 Q590 180 610 180 H830" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth={4} />
				</svg>
				<div style={{position: 'absolute', right: 22, bottom: 22, background: '#fff', borderRadius: 14, padding: '14px 20px', boxShadow: '0 10px 30px rgba(0,0,0,0.25)'}}>
					<div style={{fontSize: 30, fontWeight: 750, letterSpacing: '-0.03em'}}>{LEAD.rating} ★★★★★</div>
					<div style={{fontSize: 19, color: S.inkDim}}>{LEAD.reviews} reviews</div>
				</div>
			</div>
		</BuildStep>
		<BuildStep f={f} at={steps[3]} style={{marginTop: 22, height: 120}}>
			<div style={{display: 'flex', gap: 14}}>
				{['Leak repair', 'Drain cleaning', 'Water heaters'].map((s, i) => (
					<div key={s} style={{flex: 1, height: 120, borderRadius: 16, background: S.card, padding: '18px 18px', boxShadow: '0 2px 0 rgba(16,35,61,0.06)'}}>
						<div style={{width: 34, height: 34, borderRadius: 10, background: i === 0 ? S.brand : 'rgba(47,111,237,0.14)'}} />
						<div style={{fontSize: 23, fontWeight: 650, marginTop: 16, letterSpacing: '-0.02em'}}>{s}</div>
					</div>
				))}
			</div>
		</BuildStep>
		<BuildStep f={f} at={steps[4]} style={{marginTop: 22, height: 84}}>
			<div style={{height: 84, borderRadius: 16, background: S.ink, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 30, fontWeight: 650, letterSpacing: '-0.02em'}}>
				Call {LEAD.phone}
			</div>
		</BuildStep>
	</div>
);

/** Neutral browser frame (deliberately generic — never imitates a real product's UI). */
export const BrowserChrome: React.FC<{label?: React.ReactNode; right?: React.ReactNode; progress?: number}> = ({label, right, progress}) => (
	<div style={{height: 64, display: 'flex', alignItems: 'center', gap: 14, padding: '0 26px', background: '#0D0D11', borderBottom: `2px solid ${COLORS.line}`, position: 'relative'}}>
		<div style={{display: 'flex', gap: 9}}>
			{[0, 1, 2].map((i) => (
				<div key={i} style={{width: 13, height: 13, borderRadius: 7, background: 'rgba(244,244,246,0.16)'}} />
			))}
		</div>
		<div style={{marginLeft: 10, display: 'flex', alignItems: 'center', gap: 12, fontFamily: FONTS.sans, fontSize: 24, color: COLORS.textDim}}>{label}</div>
		<div style={{flex: 1}} />
		{right}
		{progress !== undefined && (
			<div style={{position: 'absolute', left: 0, bottom: -2, height: 3, width: `${clamp01(progress) * 100}%`, background: COLORS.text, opacity: progress >= 1 ? 0 : 1}} />
		)}
	</div>
);
