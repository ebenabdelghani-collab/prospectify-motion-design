import React from 'react';
import {C, EASE, FONT, T, lerp, ramp, win} from '../tokens';
import {Icon, Star} from '../kit/icons';
import {Cursor} from '../kit/cursor';
import {Kinetic, Mono} from '../kit/type';
import {BIZ_A, BIZ_B} from '../data';

/**
 * 3 · INSIGHT — a genuinely useful lesson before any product appears.
 * Which one would you pitch? → B, every time → Demand first. Website problem second.
 * Still the neutral world: white emphasis only; the brand colour is saved for the reveal.
 */
const Row: React.FC<{icon: string; text: string; hi?: number; color?: string}> = ({icon, text, hi = 0, color = C.text2}) => (
	<div style={{display: 'flex', alignItems: 'center', gap: 16, height: 52, padding: '0 14px', marginLeft: -14, borderRadius: 12, background: `rgba(255,255,255,${0.07 * hi})`}}>
		<Icon n={icon} size={26} color={hi > 0.5 ? C.text : C.text3} sw={2.1} />
		<div style={{fontFamily: FONT.sans, fontSize: 30, fontWeight: hi > 0.5 ? 650 : 520, color: hi > 0.5 ? C.text : color, letterSpacing: '-0.01em'}}>{text}</div>
	</div>
);

const Card: React.FC<{letter: string; name: string; kind: string; rating: number; reviews: number; children: React.ReactNode; hover?: number; picked?: number; style?: React.CSSProperties}> = ({letter, name, kind, rating, reviews, children, hover = 0, picked = 0, style}) => (
	<div
		style={{
			position: 'absolute',
			width: 900,
			borderRadius: 30,
			background: '#141416',
			border: `${1.5 + picked * 1}px solid rgba(255,255,255,${0.1 + hover * 0.12 + picked * 0.45})`,
			boxShadow: `0 40px 100px rgba(0,0,0,0.5)${picked ? `, 0 0 0 ${8 * picked}px rgba(255,255,255,${0.04 * picked})` : ''}`,
			padding: '34px 40px 30px',
			...style,
		}}
	>
		<div style={{display: 'flex', alignItems: 'flex-start', gap: 26}}>
			<div style={{width: 74, height: 74, borderRadius: 20, border: `2px solid rgba(255,255,255,${0.25 + picked * 0.6})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT.sans, fontSize: 40, fontWeight: 800, color: C.text, flexShrink: 0, background: picked ? `rgba(255,255,255,${0.1 * picked})` : 'transparent'}}>{letter}</div>
			<div style={{flex: 1}}>
				<div style={{fontFamily: FONT.sans, fontSize: 40, fontWeight: 720, color: C.text, letterSpacing: '-0.025em'}}>{name}</div>
				<div style={{display: 'flex', alignItems: 'center', gap: 10, marginTop: 8, fontFamily: FONT.sans, fontSize: 26, fontWeight: 500, color: C.text3}}>
					{kind} · <Star size={24} /> <span style={{color: C.text2, fontWeight: 650}}>{rating.toFixed(1)}</span> ({reviews})
				</div>
			</div>
		</div>
		<div style={{height: 1, background: C.line, margin: '24px 0 14px'}} />
		{children}
	</div>
);

export const Insight: React.FC<{f: number}> = ({f}) => {
	if (f < T.CARDS_IN - 4 || f > T.FIFTY_IN + 40) return null;
	const inA = ramp(f, T.CARDS_IN, 22, EASE.FAST_LOCK);
	const inB = ramp(f, T.CARDS_IN + 6, 22, EASE.FAST_LOCK);
	const hoverA = win(f, T.INS_HOVER_A - 4, T.INS_HOVER_B - 6, 8, 8);
	const hoverB = ramp(f, T.INS_HOVER_B, 8);
	const picked = ramp(f, T.PICK_B, 10, EASE.FAST_LOCK);
	const aDim = ramp(f, T.A_DIM, 20, EASE.SOFT);
	const center = ramp(f, T.B_CENTER, 34, EASE.CAMERA);
	const demand = ramp(f, T.DEMAND_SIGNALS, 14);
	const problem = ramp(f, T.PROBLEM_SIGNALS, 14);
	const leave = ramp(f, T.FIFTY_IN - 2, 26, EASE.CAMERA); // hands over to the 50-node field
	const great = ramp(f, T.GREAT_IN, 10);
	// layout
	const aY = lerp(lerp(700, 640, inA), 380, center) - aDim * 20;
	const bY = lerp(lerp(1220, 1080, inB), 760, center);
	const headOut = (at: number) => ramp(f, at, 10, EASE.EXIT);
	return (
		<div style={{position: 'absolute', inset: 0, opacity: 1 - leave, transform: `scale(${lerp(1, 0.55, leave)})`, transformOrigin: '540px 1000px', filter: leave > 0.02 ? `blur(${leave * 6}px)` : undefined}}>
			{/* headline track */}
			<div style={{position: 'absolute', left: 90, top: 300, width: 900}}>
				{f < T.PICK_B + 2 && (
					<div style={{opacity: 1 - headOut(T.PICK_B - 2)}}>
						<Kinetic f={f} inAt={T.QUESTION_IN} text={'Which one would\nyou pitch?'} size={86} weight={760} stagger={3} />
					</div>
				)}
				{f >= T.PICK_B && f < T.B_CENTER + 2 && (
					<div style={{opacity: 1 - headOut(T.B_CENTER - 4)}}>
						<Kinetic f={f} inAt={T.PICK_B + 2} text={'B. Every time.'} size={86} weight={760} stagger={4} />
						<div style={{marginTop: 20}}>
							<Kinetic f={f} inAt={T.A_DIM + 6} text={'“No website” ≠ good client.'} size={46} weight={600} color={C.text2} stagger={2} />
						</div>
					</div>
				)}
				{f >= T.B_CENTER - 2 && f < T.DEMAND_IN + 2 && (
					<div style={{opacity: 1 - headOut(T.DEMAND_IN - 4)}}>
						<Kinetic f={f} inAt={T.VO.v_better.start - 2} text="The better opportunity?" size={86} weight={760} stagger={3} />
					</div>
				)}
				{f >= T.DEMAND_IN - 2 && f < T.GREAT_IN + 2 && (
					<div style={{opacity: 1 - headOut(T.GREAT_IN - 2), position: 'absolute', top: -120}}>
						<Kinetic f={f} inAt={T.DEMAND_IN} text="Demand first." size={112} weight={800} stagger={4} />
						<div style={{marginTop: 10}}>
							<Kinetic f={f} inAt={T.PROBLEM_IN} text="Website problem second." size={64} weight={680} color={C.text2} stagger={3} />
						</div>
					</div>
				)}
				{f >= T.GREAT_IN && (
					<div style={{opacity: great * (1 - ramp(f, T.FIFTY_IN - 6, 8, EASE.EXIT))}}>
						<Kinetic f={f} inAt={T.GREAT_IN} text="Great." size={112} weight={800} />
					</div>
				)}
			</div>
			{/* Business A */}
			<Card
				letter="A"
				name={BIZ_A.name}
				kind={BIZ_A.kind}
				rating={BIZ_A.rating}
				reviews={BIZ_A.reviews}
				hover={hoverA}
				style={{left: 90, top: aY, opacity: inA * lerp(1, 0.3, aDim) * (1 - ramp(f, T.B_CENTER, 18, EASE.EXIT)), transform: `translateX(${lerp(-60, 0, inA) - ramp(f, T.B_CENTER, 24, EASE.EXIT) * 140}px) scale(${lerp(1, 0.96, aDim)})`, filter: aDim > 0.05 ? `saturate(${1 - aDim})` : undefined}}
			>
				{BIZ_A.signals.map((s) => (
					<Row key={s.text} icon={s.icon} text={s.text} />
				))}
			</Card>
			{/* Business B */}
			<Card
				letter="B"
				name={BIZ_B.name}
				kind={BIZ_B.kind}
				rating={BIZ_B.rating}
				reviews={BIZ_B.reviews}
				hover={hoverB}
				picked={picked}
				style={{left: 90, top: bY, opacity: inB, transform: `translateX(${lerp(60, 0, inB)}px) scale(${1 + 0.05 * ramp(f, T.B_CENTER + 20, T.GREAT_IN - T.B_CENTER - 20, EASE.SOFT)})`, transformOrigin: '50% 30%'}}
			>
				<Mono size={18} style={{margin: '6px 0 4px', color: demand > 0.5 ? C.text : C.text3}}>Demand</Mono>
				{BIZ_B.demand.map((s) => (
					<Row key={s.text} icon={s.icon} text={s.text} hi={demand} />
				))}
				<Mono size={18} style={{margin: '14px 0 4px', color: problem > 0.5 ? C.text : C.text3}}>Website</Mono>
				{BIZ_B.problem.map((s) => (
					<Row key={s.text} icon={s.icon} text={s.text} hi={problem} />
				))}
			</Card>
			<Cursor
				f={f}
				show={[T.INS_CURSOR_IN, T.B_CENTER + 6]}
				keys={[
					[T.INS_CURSOR_IN - 8, 1000, 1700],
					[T.INS_HOVER_A, 760, 760],
					[T.INS_HOVER_B, 820, 1170],
					[T.PICK_B, 800, 1150],
					[T.B_CENTER + 6, 900, 1500],
				]}
				clicks={[T.PICK_B]}
			/>
		</div>
	);
};
