import React from 'react';
import {Img, staticFile} from 'remotion';
import {C, FONT} from '../styles/tokens';
import {BrowserBar, IllustrativeTag} from './Basics';

const SERIF_FREE = FONT; // une seule famille dans tout le film

/** Le site « déjà construit » de l'accroche : celui que le spectateur sait faire avec l'IA. */
export const HookSite: React.FC<{w: number; h: number}> = ({w, h}) => (
	<div style={{width: w, height: h, display: 'flex', flexDirection: 'column', background: '#0f0f13', fontFamily: SERIF_FREE}}>
		<BrowserBar url="ton-site.fr" />
		<div style={{position: 'relative', flex: 1, overflow: 'hidden'}}>
			<Img src={staticFile('photos/cafe_0.jpg')} style={{position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover'}} />
			<div style={{position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(10,8,6,0.25) 0%, rgba(10,8,6,0.88) 100%)'}} />
			<div style={{position: 'absolute', left: 40, right: 40, top: 26, display: 'flex', alignItems: 'center', fontSize: 18, fontWeight: 600, color: 'rgba(255,255,255,0.85)', gap: 28}}>
				<span style={{fontWeight: 800, letterSpacing: '0.08em'}}>CAFÉ NOVA</span>
				<div style={{flex: 1}} />
				<span>Menu</span>
				<span>Horaires</span>
				<span>Contact</span>
			</div>
			<div style={{position: 'absolute', left: 40, right: 40, bottom: 40}}>
				<div style={{fontSize: 58, fontWeight: 800, color: '#fff', letterSpacing: '-0.04em', lineHeight: 1.0}}>Le café du quartier,
					<br />enfin en ligne.</div>
				<div style={{marginTop: 22, display: 'flex', gap: 14}}>
					<div style={{height: 54, padding: '0 26px', borderRadius: 980, background: '#fff', color: '#111', display: 'flex', alignItems: 'center', fontSize: 20, fontWeight: 700}}>Voir le menu</div>
					<div style={{height: 54, padding: '0 26px', borderRadius: 980, border: '1.5px solid rgba(255,255,255,0.5)', color: '#fff', display: 'flex', alignItems: 'center', fontSize: 20, fontWeight: 600}}>Réserver</div>
				</div>
			</div>
		</div>
	</div>
);

/** Démo de site pour le barbier fictif : l'exemple de ce que l'utilisateur peut proposer (créée par lui, avec l'IA). */
export const WebsiteMockup: React.FC<{w: number; h: number; scroll?: number}> = ({w, h, scroll = 0}) => (
	<div style={{width: w, height: h, display: 'flex', flexDirection: 'column', background: '#0e0c0b', fontFamily: SERIF_FREE, position: 'relative'}}>
		<BrowserBar url="atelier-barbier-a · démo" />
		<div style={{position: 'relative', flex: 1, overflow: 'hidden'}}>
			<div style={{position: 'absolute', left: 0, right: 0, top: -scroll}}>
				<div style={{position: 'relative', height: 360, overflow: 'hidden'}}>
					<Img src={staticFile('photos/barber_2.jpg')} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
					<div style={{position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(14,12,11,0.1) 0%, rgba(14,12,11,0.92) 100%)'}} />
					<div style={{position: 'absolute', left: 36, right: 36, top: 22, display: 'flex', alignItems: 'center', gap: 24, fontSize: 17, fontWeight: 600, color: 'rgba(255,255,255,0.85)'}}>
						<span style={{fontWeight: 800, letterSpacing: '0.1em'}}>ATELIER A</span>
						<div style={{flex: 1}} />
						<span>Prestations</span>
						<span>Galerie</span>
						<span>Accès</span>
					</div>
					<div style={{position: 'absolute', left: 36, right: 36, bottom: 30}}>
						<div style={{fontSize: 17, fontWeight: 700, letterSpacing: '0.16em', color: '#e9b77a'}}>BARBIER · MONTPELLIER</div>
						<div style={{marginTop: 10, fontSize: 54, fontWeight: 800, color: '#fff', letterSpacing: '-0.04em', lineHeight: 1.0}}>L'art de la coupe.</div>
						<div style={{marginTop: 18, height: 54, width: 260, borderRadius: 980, background: '#e9b77a', color: '#1a120b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 800}}>Réserver un créneau</div>
					</div>
				</div>
				<div style={{padding: '26px 36px', display: 'flex', gap: 14}}>
					{['Coupe', 'Barbe', 'Soin'].map((s) => (
						<div key={s} style={{flex: 1, height: 74, borderRadius: 16, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 700, color: '#f3e7da'}}>{s}</div>
					))}
				</div>
				<div style={{padding: '0 36px', display: 'flex', gap: 14}}>
					{['photos/barber_0.jpg', 'photos/barber_1.jpg', 'photos/barber_2.jpg'].map((p) => (
						<div key={p} style={{flex: 1, height: 150, borderRadius: 16, overflow: 'hidden'}}>
							<Img src={staticFile(p)} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
						</div>
					))}
				</div>
			</div>
		</div>
		<IllustrativeTag label="Démo illustrative" style={{position: 'absolute', right: 16, top: 9, background: 'rgba(14,12,11,0.9)', color: C.grey}} />
	</div>
);
