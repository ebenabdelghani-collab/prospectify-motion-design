import React from 'react';
import {C, EASE, FONT, T, clamp01, lerp, ramp} from '../tokens';
import {Icon} from '../kit/icons';
import {Glow} from '../kit/signal';
import {Kinetic} from '../kit/type';
import {GradButton, Logo} from '../kit/ui';

/**
 * 13 · THE LOOP — one continuous signal: find → understand → contact → build → sell → track → repeat.
 * 14 · FINAL CONVERSION — strip everything away: mark, two lines, one action.
 */
const NODES = [
	{l: 'Find', i: 'search'},
	{l: 'Understand', i: 'target'},
	{l: 'Contact', i: 'phone'},
	{l: 'Build', i: 'layout'},
	{l: 'Sell', i: 'dollar'},
	{l: 'Track', i: 'chart'},
];
const CX = 540;
const CY = 900;
const R = 300;

export const Loop: React.FC<{f: number}> = ({f}) => {
	if (f < T.LOOP_IN - 2 || f > T.LOOP_OUT + 26) return null;
	const nodes = T.LOOP_NODES as unknown as number[];
	const draw = clamp01((f - nodes[0]) / (T.LOOP_CLOSE - nodes[0]));
	const headA = -Math.PI / 2 + draw * Math.PI * 2;
	const out = ramp(f, T.LOOP_OUT, 22, EASE.CAMERA);
	const rep = ramp(f, T.LOOP_REPEAT, 16, EASE.FAST_LOCK);
	const spin = ramp(f, T.LOOP_REPEAT, 50, EASE.CAMERA);
	const inL = ramp(f, T.LOOP_IN, 14);
	const scale = lerp(1, 0.22, out);
	const arc = (a0: number, a1: number) => {
		const x0 = CX + R * Math.cos(a0);
		const y0 = CY + R * Math.sin(a0);
		const x1 = CX + R * Math.cos(a1);
		const y1 = CY + R * Math.sin(a1);
		const large = a1 - a0 > Math.PI ? 1 : 0;
		return `M ${x0} ${y0} A ${R} ${R} 0 ${large} 1 ${x1} ${y1}`;
	};
	return (
		<div style={{position: 'absolute', inset: 0, opacity: inL * (1 - ramp(f, T.LOOP_OUT + 10, 14)), transform: `scale(${scale})`, transformOrigin: `${CX}px ${CY - 380}px`}}>
			<svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
				<defs>
					<filter id="lgGlow" x="-50%" y="-50%" width="200%" height="200%">
						<feGaussianBlur stdDeviation="7" />
					</filter>
				</defs>
				<circle cx={CX} cy={CY} r={R} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={2} />
				{draw > 0.001 && (
					<>
						<path d={arc(-Math.PI / 2, headA)} fill="none" stroke={C.accent} strokeWidth={10} opacity={0.4} filter="url(#lgGlow)" />
						<path d={arc(-Math.PI / 2, headA)} fill="none" stroke={C.accentBright} strokeWidth={3.5} strokeLinecap="round" />
						<circle cx={CX + R * Math.cos(headA)} cy={CY + R * Math.sin(headA)} r={7} fill="#fff" opacity={draw < 1 ? 1 : 1 - rep} />
					</>
				)}
			</svg>
			{NODES.map((n, i) => {
				const a = -Math.PI / 2 + (i / 6) * Math.PI * 2;
				const t = ramp(f, nodes[i], 14, EASE.FAST_LOCK);
				const x = CX + R * Math.cos(a);
				const y = CY + R * Math.sin(a);
				const lx = CX + (R + 120) * Math.cos(a);
				const ly = CY + (R + 92) * Math.sin(a);
				return (
					<React.Fragment key={n.l}>
						<div style={{position: 'absolute', left: x - 44, top: y - 44, width: 88, height: 88, borderRadius: 26, background: t > 0 ? '#1a1a1e' : '#111114', border: `2px solid ${t > 0 ? `rgba(${C.accentRGB},${0.3 + 0.5 * t})` : C.lineStrong}`, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${lerp(0.8, 1, t)})`, boxShadow: t > 0 ? `0 0 ${30 * t}px rgba(${C.accentRGB},${0.35 * t})` : undefined}}>
							<Icon n={n.i} size={40} color={t > 0 ? C.accent : C.text3} sw={2.2} />
						</div>
						<div style={{position: 'absolute', left: lx - 120, top: ly - 22, width: 240, textAlign: 'center', fontFamily: FONT.sans, fontSize: 36, fontWeight: 720, letterSpacing: '-0.02em', color: t > 0.5 ? C.text : C.text3, opacity: lerp(0.4, 1, t)}}>{n.l}</div>
					</React.Fragment>
				);
			})}
			<div style={{position: 'absolute', left: CX - 250, top: CY - 70, width: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 18, opacity: rep, transform: `scale(${lerp(0.9, 1, rep)})`}}>
				<div style={{transform: `rotate(${spin * 360}deg)`}}>
					<Icon n="repeat" size={64} color={C.accent} sw={2.4} />
				</div>
				<div style={{fontFamily: FONT.sans, fontSize: 96, fontWeight: 800, letterSpacing: '-0.05em', color: C.text}}>Repeat.</div>
			</div>
		</div>
	);
};

export const CTA: React.FC<{f: number}> = ({f}) => {
	if (f < T.FINAL_LOGO - 2) return null;
	const logoIn = ramp(f, T.FINAL_LOGO, 24, EASE.FAST_LOCK);
	const cta = ramp(f, T.CTA, 18, EASE.FAST_LOCK);
	const sheen = clamp01((f - (T.CTA + 20)) / 40);
	const accent = ramp(f, T.FINDS_ACCENT, 10);
	return (
		<div style={{position: 'absolute', inset: 0}}>
			<Glow x={540} y={560} r={420} o={ramp(f, T.FINAL_LOGO, 8) * lerp(1, 0.35, ramp(f, T.FINAL_LOGO + 8, 60)) * 0.8} />
			<div style={{position: 'absolute', left: 540 - 60, top: 470, opacity: logoIn, transform: `scale(${lerp(0.82, 1, logoIn)})`, clipPath: `inset(${(1 - logoIn) * 50}% round 20px)`}}>
				<Logo size={120} />
			</div>
			<div style={{position: 'absolute', left: 60, top: 700, width: 960}}>
				<Kinetic f={f} inAt={T.LINE1} text="You build the website." size={76} weight={680} color={C.text2} align="center" stagger={3} />
				<div style={{height: 18}} />
				<Kinetic f={f} inAt={T.LINE2} text={'Prospectify\nfinds the client.'} size={92} weight={800} align="center" stagger={3} accent={['finds']} accentColor={`rgb(${Math.round(lerp(245, 244, accent))},${Math.round(lerp(245, 37, accent))},${Math.round(lerp(247, 98, accent))})`} />
			</div>
			<div style={{position: 'absolute', left: 540 - 280, top: 1190, width: 560, opacity: cta, transform: `translateY(${(1 - cta) * 30}px) scale(${lerp(0.96, 1, cta)})`}}>
				<GradButton label="Start free" icon={undefined} h={116} fs={44} sheen={sheen} />
			</div>
			<div style={{position: 'absolute', left: 0, right: 0, top: 1342, textAlign: 'center', fontFamily: FONT.sans, fontSize: 30, fontWeight: 600, color: C.text2, opacity: ramp(f, T.CTA_SUB, 14), transform: `translateY(${(1 - ramp(f, T.CTA_SUB, 14)) * 16}px)`}}>
				3 real leads free · No card required
			</div>
			<div style={{position: 'absolute', left: 0, right: 0, top: 1410, textAlign: 'center', fontFamily: FONT.sans, fontSize: 36, fontWeight: 700, letterSpacing: '-0.01em', color: C.text, opacity: ramp(f, T.URL, 14)}}>prospectify.net</div>
		</div>
	);
};
