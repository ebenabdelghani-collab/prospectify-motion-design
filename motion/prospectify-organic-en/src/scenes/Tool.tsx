// Scenes I–K: the tool (find · message · prompt) → the clients are already out there → comment "UP".
import React from 'react';
import {Img, staticFile} from 'remotion';
import {ACC, BG, BACK, Chip, DIM, FAINT, FONT, INK, Label, MiniStore, Person, Pin, Pop, RRect, SNAP, Spot, Stroke, Type, INOUT, ip, p01} from '../lib/kit';

type P = {f: number; C: Record<string, number>};

const LEADS = [
	{name: 'Golden Crust Bakery', kind: 'BAKERY', score: 94},
	{name: 'Northside Barbers', kind: 'BARBER', score: 91},
	{name: 'Casa Lina Café', kind: 'CAFÉ', score: 88},
	{name: 'Peak Auto Repair', kind: 'MECHANIC', score: 86},
];

// ── I: "They use a tool called Prospectify. It finds… writes the message… writes the prompt…" ──
export const Tool: React.FC<P> = ({f, C}) => {
	const W = 1240, H = 640, X = 960 - W / 2, Y = 560 - H / 2 + 20;
	const open = p01(f, C.S12 + 4, 34, SNAP);
	const step = f >= C.prompt - 4 ? 2 : f >= C.writes - 4 ? 1 : f >= C.finds - 4 ? 0 : -1;
	const tabs = ['01  FIND', '02  MESSAGE', '03  PROMPT'];
	return (
		<g>
			<Spot x={960} y={560} r={820} acc o={p01(f, C.prospectify - 10, 30)} />
			<Spot x={960} y={560} r={700} />
			<Label f={f} t={C.S12} x={960} y={150} text="THE ONES WHO SCALE DON'T DO IT BY HAND" size={19} c={DIM} out={C.prospectify} />
			<g transform={`translate(${X} ${Y + (1 - open) * 30})`} opacity={open}>
				<RRect p={p01(f, C.S12 + 4, 40)} w={W} h={H} r={22} fill={BG} fillO={0.92} />
				<Stroke d={`M 0 66 H ${W}`} p={p01(f, C.S12 + 14, 24)} w={2.4} c={DIM} />
				{[0, 1, 2].map((i) => <circle key={i} cx={32 + i * 22} cy={33} r={5.5} fill={DIM} />)}
				{/* real logo + name */}
				<g opacity={p01(f, C.prospectify - 6, 14)}>
					<foreignObject x={110} y={12} width={44} height={44}>
						<Img src={staticFile('brand/prospectify-logo-site.png')} style={{width: 44, height: 44}} />
					</foreignObject>
					<text x={160} y={42} fontFamily={FONT} fontWeight={700} fontSize={22} fill={INK} letterSpacing="-0.01em">
						Prospectify
					</text>
				</g>
				{/* step tabs */}
				{tabs.map((t, i) => (
					<g key={t} transform={`translate(${W - 3 * 190 - 20 + i * 190} 33)`} opacity={p01(f, C.prospectify + i * 4, 12)}>
						<rect x={0} y={-19} width={176} height={38} rx={19} fill={step === i ? 'url(#grad)' : 'none'} stroke={step === i ? 'none' : FAINT} strokeWidth={2} />
						<text x={88} y={6} textAnchor="middle" fontFamily={FONT} fontWeight={700} fontSize={14} letterSpacing="0.2em" fill={step === i ? '#fff' : DIM}>
							{t}
						</text>
					</g>
				))}
				{/* left: leads with no website */}
				<text x={40} y={118} fontFamily={FONT} fontWeight={700} fontSize={14} letterSpacing="0.26em" fill={DIM} opacity={p01(f, C.finds - 6, 10)}>
					BUSINESSES WITH NO WEBSITE
				</text>
				{LEADS.map((l, i) => {
					const t = C.finds + 4 + i * 8;
					const sel = i === 0 && f >= C.writes - 4;
					return (
						<Pop key={l.name} f={f} t={t} x={30} y={146 + i * 112} d={18} s0={0.95} dy={18}>
							<rect x={0} y={0} width={560} height={96} rx={14} fill={sel ? 'rgba(255,59,95,0.08)' : 'none'} stroke={sel ? ACC : FAINT} strokeWidth={2} />
							<g transform="translate(46 70)">
								<Pin s={0.62} filled={sel} c={sel ? ACC : INK} />
							</g>
							<text x={88} y={42} fontFamily={FONT} fontWeight={700} fontSize={22} fill={INK}>
								{l.name}
							</text>
							<text x={88} y={70} fontFamily={FONT} fontWeight={600} fontSize={13} letterSpacing="0.22em" fill={DIM}>
								{l.kind} · ★ 4.{8 - (i % 2)}
							</text>
							<g transform="translate(430 34)">
								<Chip text="NO WEBSITE" w={150} h={30} size={11} acc />
							</g>
							<text x={505} y={78} textAnchor="middle" fontFamily={FONT} fontWeight={700} fontSize={14} fill={DIM}>
								{l.score}/100
							</text>
						</Pop>
					);
				})}
				{/* right top: message */}
				<g opacity={p01(f, C.writes - 4, 12)}>
					<text x={640} y={118} fontFamily={FONT} fontWeight={700} fontSize={14} letterSpacing="0.26em" fill={DIM}>
						MESSAGE · WHATSAPP
					</text>
					<g transform="translate(640 140)">
						<RRect p={p01(f, C.writes - 4, 20)} w={560} h={190} r={18} c={step === 1 ? INK : DIM} sw={2.2} />
					</g>
					<Type f={f} t={C.writes + 4} text="Hi! I found Golden Crust on Google Maps —" cps={34} x={664} y={190} size={20} caret={false} />
					<Type f={f} t={C.writes + 4 + (42 / 34) * 60} text="4.8 stars, but no website yet. I build" cps={34} x={664} y={222} size={20} caret={false} />
					<Type f={f} t={C.writes + 4 + (80 / 34) * 60} text="clean sites for local bakeries. Can I" cps={34} x={664} y={254} size={20} caret={false} />
					<Type f={f} t={C.writes + 4 + (118 / 34) * 60} text="send you a free preview?" cps={34} x={664} y={286} size={20} caret={step === 1} />
				</g>
				{/* right bottom: prompt */}
				<g opacity={p01(f, C.prompt - 4, 12)}>
					<text x={640} y={378} fontFamily={FONT} fontWeight={700} fontSize={14} letterSpacing="0.26em" fill={DIM}>
						PROMPT · AI WEBSITE BUILDER
					</text>
					<g transform="translate(640 400)">
						<RRect p={p01(f, C.prompt - 4, 20)} w={560} h={200} r={18} c={step === 2 ? INK : DIM} sw={2.2} fill="rgba(255,255,255,0.03)" />
					</g>
					<Type f={f} t={C.prompt + 6} text="Build a premium one-page website for" cps={40} x={664} y={448} size={19} caret={false} spacing="0.01em" />
					<Type f={f} t={C.prompt + 6 + (36 / 40) * 60} text="Golden Crust Bakery: warm hero photo," cps={40} x={664} y={480} size={19} caret={false} />
					<Type f={f} t={C.prompt + 6 + (73 / 40) * 60} text="menu, reviews, opening hours, map," cps={40} x={664} y={512} size={19} caret={false} />
					<Type f={f} t={C.prompt + 6 + (108 / 40) * 60} text="and a big “Order now” button." cps={40} x={664} y={544} size={19} caret={step === 2} />
					<Pop f={f} t={C.build} x={1110} y={574} s0={0.5}>
						<Chip text="COPY" w={100} h={32} size={12} acc />
					</Pop>
				</g>
				<text x={W - 20} y={H - 16} textAnchor="end" fontFamily={FONT} fontWeight={600} fontSize={11} letterSpacing="0.24em" fill={FAINT}>
					ILLUSTRATIVE INTERFACE
				</text>
			</g>
		</g>
	);
};

// ── J: "The skill is easy to learn. The clients are already out there." ──
export const OutThere: React.FC<P> = ({f, C}) => {
	const N = 12;
	const zoom = ip(f, [C.S13 - 6, C.S14 + 6], [1.08, 0.94], INOUT);
	return (
		<g transform={`translate(960 560) scale(${zoom}) translate(-960 -560)`}>
			<Spot x={960} y={560} r={620} />
			{Array.from({length: N}).map((_, i) => {
				const a = (i / N) * Math.PI * 2 - Math.PI / 2;
				const R = i % 2 ? 380 : 300;
				const x = 960 + Math.cos(a) * R * 1.35, y = 560 + Math.sin(a) * R * 0.78;
				const t = C.clients + i * 3;
				const lit = p01(f, t + 6, 14);
				return (
					<g key={i}>
						<Stroke d={`M 960 520 L ${x} ${y - 20}`} p={p01(f, t, 18)} dash="3 9" c={lit > 0.5 ? ACC : DIM} w={2.4} />
						<Pop f={f} t={C.S13 + 4 + i * 2} x={x} y={y} s0={0.3} d={16}>
							<MiniStore lit={lit} />
						</Pop>
						{lit > 0 ? (
							<g transform={`translate(${x} ${y - 56})`} opacity={lit}>
								<Pin s={0.5} c={ACC} filled />
							</g>
						) : null}
					</g>
				);
			})}
			<Pop f={f} t={C.S13 - 4} x={960} y={600} s0={0.6}>
				<circle cy={-60} r={90} fill="url(#spot)" />
				<Person s={1.1} />
			</Pop>
			<Label f={f} t={C.S13 + 2} x={960} y={660} text="THE SKILL · EASY TO LEARN" size={18} c={DIM} />
			<Label f={f} t={C.outthere - 4} x={960} y={1000} text="THE CLIENTS ARE ALREADY OUT THERE" size={22} c={INK} />
		</g>
	);
};

// ── K: 'Comment "UP" and I'll send you the link to the tool that finds them for you.' ──
export const Comment: React.FC<P> = ({f, C}) => {
	const W = 760, H = 96;
	const sent = p01(f, C.link - 8, 16, BACK);
	return (
		<g>
			<Spot x={960} y={520} r={560} />
			<Label f={f} t={C.S14 - 4} x={960} y={360} text="COMMENT" size={22} c={DIM} />
			<Pop f={f} t={C.S14 - 6} x={960 - W / 2} y={420} d={22} s0={0.92}>
				<RRect p={p01(f, C.S14 - 6, 26)} w={W} h={H} r={H / 2} fill={BG} fillO={0.9} />
				<circle cx={50} cy={H / 2} r={22} fill="none" stroke={DIM} strokeWidth={2.4} />
				<circle cx={50} cy={H / 2 - 5} r={7} fill={DIM} />
				<path d={`M 36 ${H / 2 + 15} Q 50 ${H / 2 + 3} 64 ${H / 2 + 15}`} fill="none" stroke={DIM} strokeWidth={2.4} />
				{f < C.up - 2 ? (
					<text x={96} y={H / 2 + 10} fontFamily={FONT} fontWeight={500} fontSize={28} fill={FAINT}>
						Add comment…
					</text>
				) : null}
				<Type f={f} t={C.up - 2} text="UP" cps={8} x={96} y={H / 2 + 14} size={40} weight={800} caret={f < C.link - 8} />
				<g transform={`translate(${W - 52} ${H / 2}) scale(${1 + 0.18 * Math.sin(sent * Math.PI)})`}>
					<circle r={30} fill={f >= C.up + 6 ? 'url(#grad)' : 'none'} stroke={f >= C.up + 6 ? 'none' : DIM} strokeWidth={2.4} />
					<path d="M -10 -2 L 0 -12 L 10 -2 M 0 -12 V 12" fill="none" stroke="#fff" strokeWidth={3.4} strokeLinecap="round" strokeLinejoin="round" />
				</g>
			</Pop>
			{/* the reply: a link to the tool */}
			<Pop f={f} t={C.link} x={960} y={640} s0={0.7} d={20}>
				<g transform="translate(-260 -36)">
					<RRect p={p01(f, C.link, 20)} w={520} h={72} r={36} c={INK} sw={2.4} />
					<g transform="translate(46 36)" fill="none" stroke={ACC} strokeWidth={3.2} strokeLinecap="round">
						<path d="M -4 6 L 6 -4" />
						<path d="M -2 -10 L 2 -14 A 7 7 0 0 1 14 -2 L 10 2" />
						<path d="M 2 14 L -2 18 A 7 7 0 0 1 -14 6 L -10 2" transform="translate(0 -4)" />
					</g>
					<Type f={f} t={C.link + 6} text="the tool that finds clients" cps={30} x={84} y={45} size={24} weight={600} caret={false} />
				</g>
			</Pop>
			<Label f={f} t={C.findsyou} x={960} y={760} text="FINDS · WRITES · PROMPTS" size={17} c={DIM} />
		</g>
	);
};
