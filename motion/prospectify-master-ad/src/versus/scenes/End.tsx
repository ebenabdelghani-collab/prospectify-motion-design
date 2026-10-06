import React from 'react';
import {C, EASE, FONT, clamp01, lerp, ramp} from '../../final/tokens';
import {Logo} from '../../final/kit/ui';
import {Pill} from '../app';
import {Icon} from '../../final/kit/icons';
import {GF, BrandBG, Chroma, Clock, COLD, ColdBG, Kword, P, W, appear, gone} from '../fx';

/* ───────────────────────────── RECAP: split screen ───────────────────────────── */
const Row: React.FC<{f: number; at: number; icon: string; text: string; cold?: boolean}> = ({f, at, icon, text, cold}) => {
	const t = appear(f, at, 12);
	return (
		<div style={{display: 'flex', alignItems: 'center', gap: 18, marginTop: 22, opacity: t, transform: `translateX(${(1 - t) * (cold ? -40 : 40)}px)`, fontFamily: GF, fontSize: 36, fontWeight: 700, color: cold ? COLD.ink : C.text}}>
			<div style={{width: 50, height: 50, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', background: cold ? 'rgba(170,190,215,0.08)' : C.grad, border: cold ? `1.5px solid ${COLD.line}` : 'none'}}>
				<Icon n={icon} size={26} color={cold ? COLD.dim : '#fff'} sw={2.6} />
			</div>
			{text}
		</div>
	);
};

export const Recap: React.FC<{f: number}> = ({f}) => {
	if (f < P.RC_IN - 4 || f > P.CTA_IN + 16) return null;
	const split = ramp(f, P.RC_IN, 22, EASE.CAMERA);
	const withT = appear(f, P.RC_WITH, 14);
	const out = gone(f, P.CTA_IN - 6, 14);
	const x = lerp(W, W / 2, split);
	return (
		<div style={{position: 'absolute', inset: 0, opacity: 1 - out}}>
			{/* left: without */}
			<div style={{position: 'absolute', left: 0, top: 0, width: x, height: 1080, overflow: 'hidden'}}>
				<ColdBG f={f} />
				<div style={{position: 'absolute', left: 110, top: 200, width: 760}}>
					<div style={{fontFamily: GF, fontSize: 26, fontWeight: 800, letterSpacing: '0.2em', color: COLD.dim}}>WITHOUT</div>
					<div style={{marginTop: 18, filter: 'saturate(0.4)'}}>
						<Clock mins={26 * 60 + 7} size={150} />
					</div>
					<div style={{marginTop: 10}}>
						<Row f={f} at={P.RC_IN + 8} icon="x" text="14 tabs, guessing" cold />
						<Row f={f} at={P.RC_IN + 13} icon="x" text="Same cold message" cold />
						<Row f={f} at={P.RC_IN + 18} icon="x" text="Generic site" cold />
					</div>
					<div style={{marginTop: 40}}>
						<Kword f={f} at={P.RC_ALL} text="All night." size={110} color={COLD.ink} />
					</div>
				</div>
			</div>
			{/* right: with */}
			<div style={{position: 'absolute', left: x, top: 0, right: 0, height: 1080, overflow: 'hidden'}}>
				<div style={{position: 'absolute', left: -x + W / 2, top: 0, width: W / 2, height: 1080}}>
					<div style={{position: 'absolute', inset: 0, width: W / 2, overflow: 'hidden'}}>
						<BrandBG f={f} gx={50} gy={50} />
					</div>
				</div>
				<div style={{position: 'absolute', left: 110, top: 200, width: 760, opacity: withT}}>
					<div style={{display: 'flex', alignItems: 'center', gap: 14}}>
						<Logo size={34} />
						<div style={{fontFamily: GF, fontSize: 26, fontWeight: 800, letterSpacing: '0.2em', color: C.text}}>WITH PROSPECTIFY</div>
					</div>
					<div style={{marginTop: 18}}>
						<Clock mins={23 * 60 + 53} size={150} color={C.text} apColor={C.accent} />
					</div>
					<div style={{marginTop: 10}}>
						<Row f={f} at={P.RC_WITH + 4} icon="check" text="Client found and scored" />
						<Row f={f} at={P.RC_WITH + 9} icon="check" text="Outreach written for you" />
						<Row f={f} at={P.RC_WITH + 14} icon="check" text="Premium site prompt ready" />
					</div>
					<div style={{marginTop: 40}}>
						<Kword f={f} at={P.RC_ONE} text="One search." size={110} grad />
					</div>
				</div>
			</div>
			{/* divider */}
			<div style={{position: 'absolute', left: x - 2, top: 0, width: 4, height: 1080, background: C.grad, boxShadow: `0 0 40px rgba(${C.accentRGB},0.8)`, opacity: split < 1 ? 1 : 0.9}} />
		</div>
	);
};

/* ───────────────────────────── CTA ───────────────────────────── */
export const CTA: React.FC<{f: number}> = ({f}) => {
	if (f < P.CTA_IN - 4) return null;
	const t = appear(f, P.CTA_IN, 16);
	const push = lerp(1, 1.06, ramp(f, P.CTA_IN, P.durationInFrames - P.CTA_IN, EASE.SOFT));
	const btn = appear(f, P.CTA_START, 14);
	const clickAt = P.CTA_CLICK;
	const pressS = 1 - 0.05 * Math.sin(Math.PI * clamp01((f - clickAt) / 10));
	const cur = ramp(f, clickAt - 30, 28, EASE.CAMERA);
	return (
		<div style={{position: 'absolute', inset: 0, opacity: t}}>
			<BrandBG f={f} glow={1.2} gy={58} />
			<div style={{position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', transform: `scale(${push})`}}>
				<div style={{display: 'flex', alignItems: 'center', gap: 26, opacity: t, transform: `translateY(${(1 - t) * 30}px)`}}>
					<Logo size={96} />
					<div style={{fontFamily: GF, fontSize: 104, fontWeight: 650, letterSpacing: '-0.05em', color: C.text}}>Prospectify</div>
				</div>
				<div style={{marginTop: 34}}>
					<Kword f={f} at={P.CTA_IN + 6} text="Your first client is already out there." size={62} color={C.text} weight={750} stagger={0.5} />
				</div>
				<div style={{position: 'relative', marginTop: 54, width: 600, opacity: btn, transform: `scale(${lerp(0.9, 1, btn) * pressS})`}}>
					<div style={{borderRadius: 999, boxShadow: `0 0 0 ${ramp(f, clickAt + 2, 30) * 70}px rgba(${C.accentRGB},${0.3 * (1 - ramp(f, clickAt + 2, 30))})`}}>
						<Pill h={118} fs={50} sheen={clamp01((f - P.CTA_START - 10) / 40)} style={{width: '100%'}}>Get 3 free leads</Pill>
					</div>
					{f > clickAt - 30 && (
						<svg width={60} height={60} viewBox="0 0 24 24" style={{position: 'absolute', left: lerp(980, 380, cur), top: lerp(420, 70, cur), transform: `scale(${1 - 0.15 * Math.sin(Math.PI * clamp01((f - clickAt) / 10))})`, filter: 'drop-shadow(0 6px 10px rgba(0,0,0,0.5))'}}>
							<path d="M4 2 L4 19 L8.5 14.8 L11.5 21.5 L14.3 20.3 L11.3 13.7 L17.5 13.7 Z" fill="#fff" stroke="#09090b" strokeWidth={1.4} strokeLinejoin="round" />
						</svg>
					)}
				</div>
				<div style={{marginTop: 30, display: 'flex', gap: 16, opacity: appear(f, P.CTA_FREE, 12)}}>
					{['No card required', 'Any country', 'Cancel anytime'].map((x) => (
						<div key={x} style={{height: 56, padding: '0 24px', borderRadius: 16, background: C.surface2, border: `1.5px solid ${C.lineStrong}`, display: 'flex', alignItems: 'center', gap: 10, fontFamily: GF, fontSize: 26, fontWeight: 700, color: C.text}}>
							<Icon n="check" size={24} color={C.accent} sw={2.8} />
							{x}
						</div>
					))}
				</div>
				<div style={{marginTop: 26, fontFamily: GF, fontSize: 36, fontWeight: 800, color: C.text, letterSpacing: '-0.01em', opacity: appear(f, P.CTA_FREE + 10, 12)}}>prospectify.net</div>
			</div>
			<div style={{position: 'absolute', left: 0, right: 0, bottom: 24, textAlign: 'center', fontFamily: GF, fontSize: 15, fontWeight: 600, color: C.text3, opacity: appear(f, P.CTA_FREE + 10, 12)}}>Businesses shown are demo data. Builder names belong to their owners · no affiliation implied.</div>
		</div>
	);
};

export const unusedEnd = Chroma;
