import React from 'react';
import {ramp} from '../animations/ease';
import {C, FONT, TL, Z} from '../styles/tokens';

/** Sous-titres synchronisés : un bloc court (2 lignes max), stable, mots-clés en accent. Aucun rebond par mot. */
export const SubtitleRenderer: React.FC<{f: number}> = ({f}) => {
	const cap = TL.CAPS.find((c) => f >= c.a && f < c.b);
	if (!cap) return null;
	const t = ramp(f, cap.a, 4);
	const out = ramp(f, cap.b - 3, 3);
	return (
		<div style={{position: 'absolute', left: Z.side + 20, right: Z.side + 20, top: Z.subTop, height: Z.subH, display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', fontFamily: FONT, fontSize: 50, fontWeight: 700, lineHeight: 1.18, letterSpacing: '-0.02em', color: C.white, opacity: t * (1 - out), transform: `translateY(${(1 - t) * 6}px)`, textShadow: '0 4px 24px rgba(0,0,0,0.65)'}}>
			<span>
				{cap.words.map((w, i) => (
					<span key={i} style={{color: w.accent ? C.accentBright : C.white}}>
						{i > 0 ? ' ' : ''}
						{w.w}
					</span>
				))}
			</span>
		</div>
	);
};
