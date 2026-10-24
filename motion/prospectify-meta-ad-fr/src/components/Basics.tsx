import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {C, FONT} from '../styles/tokens';

/** Logo officiel (PNG). La marque occupe ~64 % du canevas du fichier : on compense pour que `size` soit la marque. */
export const Logo: React.FC<{size: number; style?: React.CSSProperties}> = ({size, style}) => {
	const box = size / 0.64;
	return (
		<div style={{width: size, height: size, position: 'relative', flexShrink: 0, ...style}}>
			<Img src={staticFile('logos/prospectify-logo.png')} style={{position: 'absolute', width: box, height: box, left: (size - box) / 2, top: (size - box) / 2}} />
		</div>
	);
};

/** Fond : noir Prospectify, deux halos de marque qui dérivent lentement. Pas de particules. */
export const Background: React.FC<{f: number; heat?: number}> = ({f, heat = 1}) => (
	<AbsoluteFill style={{background: C.bg, overflow: 'hidden'}}>
		<div style={{position: 'absolute', width: 1300, height: 1100, left: -420 + Math.sin(f / 90) * 40, top: 120 + Math.cos(f / 110) * 30, borderRadius: '50%', background: `radial-gradient(closest-side, rgba(${C.accentRGB},${0.2 * heat}), rgba(${C.accentRGB},0))`}} />
		<div style={{position: 'absolute', width: 1200, height: 1000, left: 420 + Math.cos(f / 100) * 40, top: 760 + Math.sin(f / 80) * 30, borderRadius: '50%', background: `radial-gradient(closest-side, rgba(255,90,69,${0.13 * heat}), rgba(255,90,69,0))`}} />
		<div style={{position: 'absolute', inset: 0, background: 'radial-gradient(110% 70% at 50% 40%, rgba(0,0,0,0) 40%, rgba(0,0,0,0.6) 100%)'}} />
	</AbsoluteFill>
);

/** Mention discrète : la séquence montre une interface recréée, pas une capture de l'application. */
export const IllustrativeTag: React.FC<{label?: string; style?: React.CSSProperties}> = ({label = 'Interface illustrative', style}) => (
	<div style={{height: 30, padding: '0 12px', borderRadius: 8, border: `1px solid ${C.line}`, background: 'rgba(255,255,255,0.04)', display: 'inline-flex', alignItems: 'center', fontFamily: FONT, fontSize: 16, fontWeight: 500, color: C.grey2, letterSpacing: '0.01em', whiteSpace: 'nowrap', ...style}}>
		{label}
	</div>
);

export const Check: React.FC<{size?: number; color?: string; sw?: number}> = ({size = 22, color = '#fff', sw = 2.6}) => (
	<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" style={{display: 'block', flexShrink: 0}}>
		<path d="M20 6 9 17l-5-5" />
	</svg>
);

export const Pin: React.FC<{size?: number; color?: string}> = ({size = 22, color = C.grey}) => (
	<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{display: 'block', flexShrink: 0}}>
		<path d="M20 10c0 4.99-5.54 10.19-7.4 11.8a1 1 0 0 1-1.2 0C9.54 20.19 4 14.99 4 10a8 8 0 0 1 16 0" />
		<circle cx="12" cy="10" r="3" />
	</svg>
);

export const Scissors: React.FC<{size?: number; color?: string}> = ({size = 22, color = C.grey}) => (
	<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{display: 'block', flexShrink: 0}}>
		<circle cx="6" cy="6" r="3" />
		<path d="M8.12 8.12 12 12" />
		<path d="M20 4 8.12 15.88" />
		<circle cx="6" cy="18" r="3" />
		<path d="M14.8 14.8 20 20" />
	</svg>
);

export const Globe: React.FC<{size?: number; color?: string}> = ({size = 20, color = C.accentBright}) => (
	<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{display: 'block', flexShrink: 0}}>
		<circle cx="12" cy="12" r="10" />
		<path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
		<path d="M2 12h20" />
		<path d="m4 4 16 16" />
	</svg>
);

/** Barre de navigateur (pour les maquettes de site). */
export const BrowserBar: React.FC<{url: string; h?: number}> = ({url, h = 48}) => (
	<div style={{height: h, display: 'flex', alignItems: 'center', gap: 16, padding: '0 18px', background: '#15151b', borderBottom: `1px solid ${C.line}`, flexShrink: 0}}>
		<div style={{display: 'flex', gap: 8}}>
			{['#ff5f57', '#febc2e', '#28c840'].map((c) => (
				<div key={c} style={{width: 12, height: 12, borderRadius: 6, background: c, opacity: 0.85}} />
			))}
		</div>
		<div style={{flex: 1, height: h * 0.6, borderRadius: 8, background: 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', padding: '0 14px', fontFamily: FONT, fontSize: 17, color: C.grey}}>{url}</div>
	</div>
);
