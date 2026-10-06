import React from 'react';
import TL from './timeline.json';
import {C, EASE, clamp01, ramp} from '../final/tokens';
import {GF} from '../versus/fx';

export {GF, BrandBG, ColdBG, COLD, Clock, Chroma, appear, gone, coldGrade, loadGeist} from '../versus/fx';

/**
 * THE LOOP — retention cut. Layout contract (founder rule: text never sits on a visual):
 *   visual zone  y 36 … 800   ·   caption band  y 840 … 980 (word-by-word captions only).
 */
export const W = 1920;
export const H = 1080;
type Cap = {words: {w: string; a: number; b: number; accent: boolean}[]; a: number; b: number};
export const P = TL as unknown as Record<string, number & number[]> & {VO: Record<string, {start: number; end: number; text: string}>; CAPS: Cap[]; durationInFrames: number};

/** Word-by-word captions in the bottom band: 1–3 words, the key word in the brand coral. */
export const Captions: React.FC<{f: number}> = ({f}) => {
	const cap = P.CAPS.find((c) => f >= c.a && f <= c.b);
	if (!cap) return null;
	const out = ramp(f, cap.b - 5, 5, EASE.EXIT);
	return (
		<div style={{position: 'absolute', left: 0, right: 0, top: 846, height: 120, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 22, fontFamily: GF, opacity: 1 - out}}>
			{cap.words.map((w, i) => {
				const t = ramp(f, w.a - 1, 7, EASE.FAST_LOCK);
				if (f < w.a - 1) return <span key={i} style={{fontSize: 70, fontWeight: 700, opacity: 0}}>{w.w}</span>;
				return (
					<span
						key={i}
						style={{
							display: 'inline-block',
							fontSize: 70,
							fontWeight: 700,
							letterSpacing: '-0.035em',
							color: w.accent ? C.accentBright : '#fff',
							transform: `translateY(${(1 - t) * 18}px) scale(${0.86 + 0.14 * t})`,
							opacity: clamp01(t * 1.6),
							textShadow: '0 6px 30px rgba(0,0,0,0.55)',
						}}
					>
						{w.w}
					</span>
				);
			})}
		</div>
	);
};
