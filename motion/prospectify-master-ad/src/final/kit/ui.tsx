import React from 'react';
import {Img, staticFile} from 'remotion';
import {C, EASE, FONT, clamp01, lerp, ramp} from '../tokens';
import {Icon, Star} from './icons';

/**
 * Real Prospectify UI, rebuilt 1:1 from the production landing component (motion-source/ui/
 * landing-hero-product-mock.png) and production CSS tokens, scaled for a 9:16 phone frame.
 * Strings used in product screens are production strings (motion-source/research/app-ui-strings-en.txt).
 */

export const LOGO_SRC = () => staticFile('final/prospectify-logo.png');

/** The official mark — the real PNG, never redrawn. `size` is the visible mark height (art has padding). */
export const Logo: React.FC<{size: number; style?: React.CSSProperties}> = ({size, style}) => {
	// the PNG's mark occupies ~64% of its canvas (bbox 243–1042 of 1254) → scale so the mark is `size`
	const box = size / 0.64;
	return (
		<div style={{width: size, height: size, position: 'relative', overflow: 'visible', flexShrink: 0, ...style}}>
			<Img src={LOGO_SRC()} style={{position: 'absolute', width: box, height: box, left: (size - box) / 2, top: (size - box) / 2}} />
		</div>
	);
};

export const Wordmark: React.FC<{size: number; color?: string}> = ({size, color = C.text}) => (
	<span style={{fontFamily: FONT.sans, fontSize: size, fontWeight: 760, letterSpacing: '-0.035em', color, lineHeight: 1}}>Prospectify</span>
);

export const AppHeader: React.FC<{o?: number; style?: React.CSSProperties}> = ({o = 1, style}) => (
	<div style={{position: 'absolute', left: 90, top: 150, display: 'flex', alignItems: 'center', gap: 16, opacity: o, ...style}}>
		<Logo size={44} />
		<Wordmark size={32} />
	</div>
);

export const DemoTag: React.FC<{o?: number; style?: React.CSSProperties}> = ({o = 1, style}) =>
	o <= 0 ? null : (
		<div style={{position: 'absolute', right: 90, top: 158, height: 30, padding: '0 12px', borderRadius: 8, border: `1px solid ${C.lineStrong}`, display: 'flex', alignItems: 'center', fontFamily: FONT.mono, fontSize: 15, letterSpacing: '0.14em', color: C.text3, opacity: o, ...style}}>
			DEMO DATA
		</div>
	);

export const Panel: React.FC<{style?: React.CSSProperties; children?: React.ReactNode}> = ({style, children}) => (
	<div
		style={{
			position: 'absolute',
			borderRadius: 36,
			background: 'linear-gradient(180deg, #19191d 0%, #141417 100%)',
			border: `1.5px solid ${C.lineStrong}`,
			boxShadow: '0 50px 120px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.04)',
			...style,
		}}
	>
		{children}
	</div>
);

export const SearchField: React.FC<{text: string; caret?: boolean; right?: React.ReactNode; style?: React.CSSProperties; focus?: number}> = ({text, caret, right, style, focus = 0}) => (
	<div
		style={{
			height: 96,
			borderRadius: 22,
			background: C.surface2,
			border: `1.5px solid ${focus > 0 ? `rgba(${C.accentRGB},${0.15 + 0.35 * focus})` : C.lineStrong}`,
			display: 'flex',
			alignItems: 'center',
			gap: 22,
			padding: '0 30px',
			...style,
		}}
	>
		<Icon n="search" size={34} color={C.accent} sw={2.4} />
		<div style={{fontFamily: FONT.sans, fontSize: 38, fontWeight: 500, color: C.text, letterSpacing: '-0.01em', whiteSpace: 'nowrap'}}>
			{text}
			{caret && <span style={{display: 'inline-block', width: 3, height: 40, marginLeft: 3, background: C.text, verticalAlign: 'middle'}} />}
		</div>
		<div style={{flex: 1}} />
		{right}
	</div>
);

export const GradBar: React.FC<{p: number; style?: React.CSSProperties}> = ({p, style}) => (
	<div style={{height: 7, borderRadius: 4, background: 'rgba(255,255,255,0.05)', overflow: 'hidden', ...style}}>
		<div style={{width: `${clamp01(p) * 100}%`, height: '100%', borderRadius: 4, background: C.grad, boxShadow: `0 0 16px rgba(${C.accentRGB},0.6)`}} />
	</div>
);

export const IconTile: React.FC<{n: string; size?: number; style?: React.CSSProperties}> = ({n, size = 80, style}) => (
	<div style={{width: size, height: size, borderRadius: size * 0.2, background: C.surface3, border: `1.5px solid ${C.lineStrong}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, ...style}}>
		<Icon n={n} size={size * 0.44} color={C.accent} sw={2.2} />
	</div>
);

export const ScoreBox: React.FC<{score: number; size?: number; style?: React.CSSProperties}> = ({score, size = 1, style}) => (
	<div style={{width: 94 * size, height: 82 * size, borderRadius: 16 * size, background: '#0f0f12', border: `1.5px solid ${C.lineStrong}`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexShrink: 0, ...style}}>
		<div style={{fontFamily: FONT.sans, fontSize: 38 * size, fontWeight: 800, color: C.accent, lineHeight: 1, letterSpacing: '-0.02em'}}>{Math.round(score)}</div>
		<div style={{fontFamily: FONT.sans, fontSize: 19 * size, fontWeight: 600, color: C.text3, marginTop: 3 * size}}>/100</div>
	</div>
);

export type Lead = {name: string; city: string; rating: number; reviews: number; score: number; icon: string; status: string; tag: string};

/** The real lead row: niche tile · name · pin city · ★ rating · score /100. */
export const LeadRow: React.FC<{lead: Lead; selected?: number; style?: React.CSSProperties; showTag?: boolean}> = ({lead, selected = 0, style, showTag = true}) => (
	<div
		style={{
			height: 132,
			borderRadius: 24,
			background: selected > 0 ? `linear-gradient(180deg, rgba(${C.accentRGB},${0.13 * selected}) 0%, rgba(${C.accentRGB},${0.04 * selected}) 100%), ${C.surface2}` : C.surface2,
			border: `1.5px solid ${selected > 0 ? `rgba(${C.accentRGB},${0.18 + 0.32 * selected})` : C.lineStrong}`,
			display: 'flex',
			alignItems: 'center',
			gap: 26,
			padding: '0 26px 0 28px',
			...style,
		}}
	>
		<IconTile n={lead.icon} size={80} />
		<div style={{flex: 1, minWidth: 0}}>
			<div style={{fontFamily: FONT.sans, fontSize: 36, fontWeight: 700, color: C.text, letterSpacing: '-0.02em', whiteSpace: 'nowrap'}}>{lead.name}</div>
			<div style={{display: 'flex', alignItems: 'center', gap: 8, marginTop: 8, fontFamily: FONT.sans, fontSize: 25, fontWeight: 500, color: C.text3, whiteSpace: 'nowrap'}}>
				<Icon n="pin" size={24} color={C.text3} sw={2} />
				{lead.city} ·
				<Star size={22} />
				<span>{lead.rating.toFixed(1)}</span>
				{showTag && (
					<span style={{marginLeft: 10, height: 34, padding: '0 12px', borderRadius: 9, background: 'rgba(255,255,255,0.05)', border: `1px solid ${C.lineStrong}`, fontSize: 21, fontWeight: 600, color: C.text2, display: 'inline-flex', alignItems: 'center'}}>
						{lead.tag}
					</span>
				)}
			</div>
		</div>
		<ScoreBox score={lead.score} />
	</div>
);

export const ActionTile: React.FC<{icon: string; label: string; style?: React.CSSProperties; active?: number}> = ({icon, label, style, active = 0}) => (
	<div
		style={{
			flex: 1,
			height: 118,
			borderRadius: 22,
			background: active > 0 ? `rgba(${C.accentRGB},${0.1 * active})` : C.surface2,
			border: `1.5px solid ${active > 0 ? `rgba(${C.accentRGB},${0.2 + 0.4 * active})` : C.lineStrong}`,
			display: 'flex',
			flexDirection: 'column',
			alignItems: 'center',
			justifyContent: 'center',
			gap: 12,
			...style,
		}}
	>
		<Icon n={icon} size={34} color={C.accent} sw={2.2} />
		<div style={{fontFamily: FONT.sans, fontSize: 24, fontWeight: 600, color: C.text2}}>{label}</div>
	</div>
);

export const GradButton: React.FC<{label: string; icon?: string; h?: number; fs?: number; style?: React.CSSProperties; sheen?: number}> = ({label, icon, h = 92, fs = 32, style, sheen = -1}) => (
	<div
		style={{
			height: h,
			borderRadius: h * 0.28,
			background: C.grad,
			display: 'flex',
			alignItems: 'center',
			justifyContent: 'center',
			gap: 14,
			padding: '0 36px',
			fontFamily: FONT.sans,
			fontSize: fs,
			fontWeight: 700,
			color: '#fff',
			letterSpacing: '-0.01em',
			position: 'relative',
			overflow: 'hidden',
			boxShadow: `0 18px 50px rgba(${C.accentRGB},0.28), inset 0 1px 0 rgba(255,255,255,0.25)`,
			...style,
		}}
	>
		{sheen >= 0 && sheen <= 1 && (
			<div style={{position: 'absolute', top: 0, bottom: 0, width: 120, left: `${lerp(-30, 120, sheen)}%`, background: 'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.3) 50%, rgba(255,255,255,0) 100%)', transform: 'skewX(-18deg)'}} />
		)}
		{icon && <Icon n={icon} size={fs * 1.05} color="#fff" sw={2.4} />}
		<span style={{position: 'relative'}}>{label}</span>
	</div>
);

export const Chip: React.FC<{children: React.ReactNode; tone?: 'accent' | 'plain' | 'ghost'; style?: React.CSSProperties}> = ({children, tone = 'plain', style}) => (
	<div
		style={{
			display: 'inline-flex',
			alignItems: 'center',
			gap: 10,
			height: 50,
			padding: '0 20px',
			borderRadius: 14,
			fontFamily: FONT.sans,
			fontSize: 25,
			fontWeight: 600,
			whiteSpace: 'nowrap',
			background: tone === 'accent' ? C.accentSoft : tone === 'ghost' ? 'transparent' : 'rgba(255,255,255,0.05)',
			border: `1.5px solid ${tone === 'accent' ? `rgba(${C.accentRGB},0.4)` : C.lineStrong}`,
			color: tone === 'accent' ? '#ffd0da' : C.text2,
			...style,
		}}
	>
		{children}
	</div>
);

/** Eyebrow: the site's small uppercase tracked accent label ("HOW IT WORKS"). */
export const Eyebrow: React.FC<{children: React.ReactNode; color?: string; style?: React.CSSProperties}> = ({children, color = C.accent, style}) => (
	<div style={{fontFamily: FONT.sans, fontSize: 22, fontWeight: 700, letterSpacing: '0.2em', color, textTransform: 'uppercase', ...style}}>{children}</div>
);

/** Number that counts up between two frames. */
export const useCount = (f: number, at: number, dur: number, to: number) => Math.round(to * ramp(f, at, dur, EASE.SOFT));
