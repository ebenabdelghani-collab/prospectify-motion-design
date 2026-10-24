import React from 'react';
import {Img, staticFile} from 'remotion';
import {lerp} from '../animations/ease';
import {C, FONT} from '../styles/tokens';
import {Check, Globe, Pin} from './Basics';

export const CARD_H = 116;

type Lead = {name: string; cat: string; city: string; score: number; photo: string};

/** Carte prospect (illustrative). `status` et `score` reçoivent un focus piloté par la voix. */
export const LeadCard: React.FC<{lead: Lead; w: number; status?: number; score?: number; selected?: number}> = ({lead, w, status = 0, score = 0, selected = 0}) => (
	<div style={{width: w, height: CARD_H, borderRadius: 22, background: C.surface2, border: `1.5px solid ${selected > 0.5 ? `rgba(${C.accentRGB},0.85)` : C.line}`, boxShadow: selected > 0 ? `0 0 0 ${4 * selected}px rgba(${C.accentRGB},0.18), 0 30px 70px rgba(0,0,0,0.5)` : '0 18px 40px rgba(0,0,0,0.35)', display: 'flex', alignItems: 'center', gap: 20, padding: '0 22px 0 18px', fontFamily: FONT, position: 'relative', boxSizing: 'border-box'}}>
		<div style={{width: 80, height: 80, borderRadius: 16, overflow: 'hidden', flexShrink: 0}}>
			<Img src={staticFile(lead.photo)} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
		</div>
		<div style={{flex: 1, minWidth: 0}}>
			<div style={{fontSize: 30, fontWeight: 700, color: C.white, letterSpacing: '-0.02em', whiteSpace: 'nowrap'}}>{lead.name}</div>
			<div style={{marginTop: 10, display: 'flex', alignItems: 'center', gap: 12}}>
				<div style={{display: 'flex', alignItems: 'center', gap: 6, fontSize: 20, color: C.grey}}>
					<Pin size={18} />
					{lead.cat} · {lead.city}
				</div>
				<div style={{height: 34, padding: '0 12px', borderRadius: 10, display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: 19, fontWeight: 650, background: `rgba(${C.accentRGB},${lerp(0.12, 0.22, status)})`, color: C.accentBright, boxShadow: status > 0 ? `0 0 ${26 * status}px rgba(${C.accentRGB},${0.55 * status}), inset 0 0 0 1.5px rgba(${C.accentRGB},${0.7 * status})` : undefined, transform: `scale(${1 + 0.06 * status})`, transformOrigin: 'left center', whiteSpace: 'nowrap'}}>
					<Globe size={17} />
					Sans site web
				</div>
			</div>
		</div>
		<div style={{width: 120, textAlign: 'right', flexShrink: 0, transform: `scale(${1 + 0.08 * score})`, transformOrigin: 'right center'}}>
			<div style={{fontSize: 46, fontWeight: 800, color: score > 0.3 ? C.accentBright : C.white, lineHeight: 1, letterSpacing: '-0.03em'}}>
				{lead.score}
				<span style={{fontSize: 18, fontWeight: 500, color: C.grey2}}>/100</span>
			</div>
			<div style={{marginTop: 6, fontSize: 16, color: C.grey2, fontWeight: 500}}>score</div>
		</div>
		{selected > 0.5 && (
			<div style={{position: 'absolute', right: -14, top: -14, width: 38, height: 38, borderRadius: 19, background: C.grad, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 8px 20px rgba(${C.accentRGB},0.5)`, transform: `scale(${selected})`}}>
				<Check size={20} sw={3} />
			</div>
		)}
	</div>
);

/** Focus sur le score : un encadré lumineux discret et l'étiquette « Score de priorité ». Pas de clignotement. */
export const LeadScoreHighlight: React.FC<{t: number; cardW: number}> = ({t, cardW}) => {
	if (t <= 0) return null;
	return (
		<div style={{position: 'absolute', left: cardW - 170, top: -12, width: 168, height: CARD_H + 24, borderRadius: 22, border: `2px solid rgba(${C.accentRGB},${0.9 * t})`, boxShadow: `0 0 40px rgba(${C.accentRGB},${0.35 * t})`, opacity: t, transform: `scale(${lerp(1.08, 1, t)})`}}>
			<div style={{position: 'absolute', left: '50%', top: -20, transform: 'translateX(-50%)', height: 36, padding: '0 14px', borderRadius: 10, background: C.grad, display: 'flex', alignItems: 'center', fontFamily: FONT, fontSize: 18, fontWeight: 700, color: '#fff', whiteSpace: 'nowrap'}}>Score de priorité</div>
		</div>
	);
};
