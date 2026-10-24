import React from 'react';
import {clamp01, lerp, ramp} from '../animations/ease';
import {LEADS} from '../data/leads';
import {C, FONT} from '../styles/tokens';
import {IllustrativeTag, Logo, Pin, Scissors} from './Basics';
import {CARD_H, LeadCard, LeadScoreHighlight} from './LeadCard';

/** Fenêtre de l'interface illustrative (coordonnées de la composition 1080 × 1920). */
export const WIN = {x: 70, y: 500, w: 940, h: 580, header: 72, pad: 28} as const;
export const LIST_TOP = WIN.header + 24 + 56 + 20; // sous la barre « Montpellier · Barbiers »
export const CARD_GAP = 14;
export const cardRect = (i: number) => ({x: WIN.x + WIN.pad, y: WIN.y + LIST_TOP + i * (CARD_H + CARD_GAP), w: WIN.w - WIN.pad * 2, h: CARD_H});

export type SearchKeys = {
	city: number; // focus + saisie « Montpellier »
	category: number; // focus + saisie « Barbiers »
	click: number; // clic sur Rechercher
	results: number; // les cartes arrivent
	status: number; // focus « Sans site web »
	score: number; // focus score
	select: number; // carte A sélectionnée
	hideFirst: number; // la carte A part en morphing vers la démo
};

const typed = (text: string, f: number, a: number, per = 1.6) => text.slice(0, Math.max(0, Math.floor((f - a) / per)));

const Field: React.FC<{label: string; value: string; icon: React.ReactNode; focus: number; caret: boolean}> = ({label, value, icon, focus, caret}) => (
	<div>
		<div style={{fontSize: 20, fontWeight: 600, color: C.grey, marginBottom: 10}}>{label}</div>
		<div style={{height: 84, borderRadius: 18, background: 'rgba(255,255,255,0.04)', border: `1.5px solid ${focus > 0 ? `rgba(${C.accentRGB},${0.4 + 0.5 * focus})` : C.line}`, boxShadow: focus > 0 ? `0 0 0 ${5 * focus}px rgba(${C.accentRGB},0.14)` : undefined, display: 'flex', alignItems: 'center', gap: 16, padding: '0 24px', fontSize: 32, fontWeight: 600, color: C.white}}>
			{icon}
			<span>{value}</span>
			{caret && <span style={{width: 3, height: 36, background: C.accentBright, marginLeft: -10}} />}
		</div>
	</div>
);

export const SearchInterface: React.FC<{f: number; k: SearchKeys}> = ({f, k}) => {
	const city = typed('Montpellier', f, k.city + 3);
	const cat = typed('Barbiers', f, k.category + 3);
	const focusCity = f >= k.city && f < k.category ? ramp(f, k.city, 5) : 0;
	const focusCat = f >= k.category && f < k.click ? ramp(f, k.category, 5) : 0;
	const press = f >= k.click && f < k.click + 8 ? Math.sin(Math.PI * ((f - k.click) / 8)) : 0;
	const loading = f >= k.click + 2 && f < k.results;
	const toList = ramp(f, k.results - 4, 10);
	const dimOthers = Math.max(ramp(f, k.status, 10) * 0.55, ramp(f, k.select, 8) * 0.8);
	const statusT = f < k.select ? ramp(f, k.status, 10) * (1 - ramp(f, k.score, 10) * 0.6) : 0.4;
	const scoreT = f < k.select ? ramp(f, k.score, 10) : 1 - ramp(f, k.select, 8);
	const sel = ramp(f, k.select, 8);
	const w = WIN.w - WIN.pad * 2;
	return (
		<div style={{width: WIN.w, height: WIN.h, borderRadius: 32, background: C.surface, border: `1.5px solid ${C.lineStrong}`, boxShadow: '0 60px 140px rgba(0,0,0,0.7)', overflow: 'hidden', fontFamily: FONT, position: 'relative'}}>
			{/* en-tête */}
			<div style={{height: WIN.header, display: 'flex', alignItems: 'center', gap: 12, padding: '0 26px', borderBottom: `1px solid ${C.line}`}}>
				<Logo size={30} />
				<span style={{fontSize: 25, fontWeight: 700, color: C.white, letterSpacing: '-0.02em'}}>Prospectify</span>
				<div style={{flex: 1}} />
				<IllustrativeTag />
			</div>
			{/* état 1 : le formulaire */}
			{toList < 1 && (
				<div style={{position: 'absolute', left: WIN.pad, right: WIN.pad, top: WIN.header + 30, opacity: 1 - toList, transform: `translateY(${-toList * 30}px)`}}>
					<div style={{fontSize: 40, fontWeight: 750, color: C.white, letterSpacing: '-0.03em'}}>Trouvez des commerces sans site web</div>
					<div style={{marginTop: 28, display: 'flex', flexDirection: 'column', gap: 22}}>
						<Field label="Ville" value={city} icon={<Pin size={28} color={focusCity > 0 ? C.accentBright : C.grey} />} focus={focusCity} caret={focusCity > 0 && Math.floor(f / 8) % 2 === 0} />
						<Field label="Catégorie" value={cat} icon={<Scissors size={28} color={focusCat > 0 ? C.accentBright : C.grey} />} focus={focusCat} caret={focusCat > 0 && Math.floor(f / 8) % 2 === 0} />
					</div>
					<div style={{marginTop: 28, height: 88, borderRadius: 980, background: C.grad, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14, fontSize: 32, fontWeight: 700, color: '#fff', transform: `scale(${1 - press * 0.03})`, boxShadow: `0 18px 50px rgba(${C.accentRGB},0.4)`}}>
						{loading && (
							<svg width={30} height={30} viewBox="0 0 24 24" style={{transform: `rotate(${(f - k.click) * 24}deg)`}}>
								<circle cx={12} cy={12} r={9} fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth={3} />
								<path d="M12 3a9 9 0 0 1 9 9" fill="none" stroke="#fff" strokeWidth={3} strokeLinecap="round" />
							</svg>
						)}
						{loading ? 'Recherche…' : 'Rechercher'}
					</div>
				</div>
			)}
			{/* état 2 : les résultats */}
			{toList > 0 && (
				<>
					<div style={{position: 'absolute', left: WIN.pad, right: WIN.pad, top: WIN.header + 24, height: 56, display: 'flex', alignItems: 'center', gap: 12, opacity: toList}}>
						{[
							[<Pin key="p" size={20} color={C.accentBright} />, 'Montpellier'],
							[<Scissors key="s" size={20} color={C.accentBright} />, 'Barbiers'],
						].map(([icon, label], i) => (
							<div key={i} style={{height: 50, padding: '0 18px', borderRadius: 14, background: 'rgba(255,255,255,0.05)', border: `1px solid ${C.line}`, display: 'flex', alignItems: 'center', gap: 10, fontSize: 23, fontWeight: 600, color: C.white}}>
								{icon}
								{label}
							</div>
						))}
						<div style={{flex: 1}} />
						<div style={{fontSize: 18, color: C.grey2}}>Données d'exemple</div>
					</div>
					{LEADS.map((lead, i) => {
						const t = ramp(f, k.results + i * 4, 9);
						const first = i === 0;
						if (first && f >= k.hideFirst) return null;
						const r = cardRect(i);
						return (
							<div key={lead.name} style={{position: 'absolute', left: r.x - WIN.x, top: r.y - WIN.y, opacity: t * (first ? 1 : 1 - dimOthers), transform: `translateY(${(1 - t) * 26}px) scale(${first ? 1 + 0.03 * clamp01(Math.max(statusT, scoreT, sel)) : lerp(1, 0.98, dimOthers)})`, transformOrigin: 'center'}}>
								<LeadCard lead={lead} w={w} status={first ? statusT : 0} score={first ? scoreT : 0} selected={first ? sel : 0} />
								{first && <LeadScoreHighlight t={scoreT} cardW={w} />}
							</div>
						);
					})}
				</>
			)}
		</div>
	);
};
