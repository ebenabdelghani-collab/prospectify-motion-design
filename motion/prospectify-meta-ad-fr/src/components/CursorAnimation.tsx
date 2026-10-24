import React from 'react';
import {keyed, ramp} from '../animations/ease';

export type CursorKey = [frame: number, x: number, y: number];

/** Curseur : trajectoire douce entre des clés, petit enfoncement + onde au clic. */
export const CursorAnimation: React.FC<{f: number; keys: CursorKey[]; clicks: number[]; show: [number, number]}> = ({f, keys, clicks, show}) => {
	if (f < show[0] || f > show[1]) return null;
	const x = keyed(f, keys.map(([k, v]) => [k, v]));
	const y = keyed(f, keys.map(([k, , v]) => [k, v]));
	const o = Math.min(ramp(f, show[0], 6), 1 - ramp(f, show[1] - 6, 6));
	const c = clicks.find((k) => f >= k && f < k + 12);
	const press = c === undefined ? 0 : Math.sin(Math.PI * Math.min(1, (f - c) / 6));
	const ring = c === undefined ? 0 : (f - c) / 12;
	return (
		<div style={{position: 'absolute', left: x, top: y, opacity: o, pointerEvents: 'none', zIndex: 50}}>
			{c !== undefined && <div style={{position: 'absolute', left: -28, top: -28, width: 56, height: 56, borderRadius: 28, border: '2.5px solid rgba(255,255,255,0.8)', transform: `scale(${0.4 + ring * 1.1})`, opacity: 1 - ring}} />}
			<svg width={40} height={40} viewBox="0 0 24 24" style={{position: 'absolute', left: -6, top: -4, transform: `scale(${1 - press * 0.12})`, transformOrigin: '6px 4px', filter: 'drop-shadow(0 6px 12px rgba(0,0,0,0.5))'}}>
				<path d="M5 3l14 8-6.2 1.6L9.6 19z" fill="#fff" stroke="#0b0b0e" strokeWidth={1.4} strokeLinejoin="round" />
			</svg>
		</div>
	);
};
