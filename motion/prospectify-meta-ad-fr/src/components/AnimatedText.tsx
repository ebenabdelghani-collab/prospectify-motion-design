import React from 'react';
import {ramp, win} from '../animations/ease';
import {C, FONT, TL, Z} from '../styles/tokens';

/**
 * Titres graphiques (la pub doit se comprendre sans le son). Fade + montée de 12 px, sortie nette.
 * La taille s'adapte à la ligne la plus longue pour rester dans la zone sûre.
 */
export const AnimatedText: React.FC<{f: number}> = ({f}) => {
	const h = TL.HEAD.find((x) => f >= x.a && f <= x.b + 4);
	if (!h) return null;
	const o = win(f, h.a, h.b + 4, 6, 5);
	const t = ramp(f, h.a, 9);
	const longest = Math.max(...h.lines.map((l) => l.length));
	const fs = Math.min(96, Math.floor(920 / (longest * 0.62)));
	return (
		<div style={{position: 'absolute', left: Z.side, right: Z.side, top: Z.headTop, height: Z.headH, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: FONT, opacity: o, transform: `translateY(${(1 - t) * 12}px)`}}>
			{h.lines.map((line, i) => (
				<div key={i} style={{fontSize: fs, fontWeight: 800, letterSpacing: '-0.035em', lineHeight: 1.04, color: C.white, textAlign: 'center', whiteSpace: 'nowrap', opacity: ramp(f, h.a + i * 3, 7)}}>
					{line.split(' ').map((w, k) => (
						<span key={k} style={h.accent.includes(w) ? {background: C.grad, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent'} : undefined}>
							{k > 0 ? ' ' : ''}
							{w}
						</span>
					))}
				</div>
			))}
		</div>
	);
};
