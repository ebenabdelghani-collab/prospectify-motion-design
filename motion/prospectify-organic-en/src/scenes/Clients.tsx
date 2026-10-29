// Scenes F–H: the hard part is finding clients → the manual grind → where most people quit.
import React from 'react';
import {ACC, BG, Browser, CheckBox, Count, DIM, FAINT, FONT, INK, Label, Person, Pin, Pop, RRect, SNAP, Spot, Stroke, Type, INOUT, BACK, ip, p01} from '../lib/kit';

type P = {f: number; C: Record<string, number>};

// ── F: "building the site was never the hard part. Finding the clients is." ──
export const Balance: React.FC<P> = ({f, C}) => {
	const tilt = ip(f, [C.finding - 4, C.finding + 26], [0, 14], BACK) + Math.sin((f - C.S9) / 22) * 1.2 * (1 - p01(f, C.finding, 10));
	const L = 330; // half beam
	const rad = (tilt * Math.PI) / 180;
	const lx = -Math.cos(rad) * L, ly = -Math.sin(rad) * L;
	const rx = Math.cos(rad) * L, ry = Math.sin(rad) * L;
	const pan = (x: number, y: number, children: React.ReactNode, t: number) => (
		<g transform={`translate(${x} ${y})`}>
			<Stroke d="M 0 0 L -110 150 M 0 0 L 110 150" p={p01(f, t, 18)} c={DIM} w={2} />
			<Stroke d="M -140 150 Q 0 196 140 150" p={p01(f, t + 6, 18)} />
			<g transform="translate(0 148)">{children}</g>
		</g>
	);
	return (
		<g transform="translate(960 380)">
			<Spot x={0} y={200} r={560} />
			<Stroke d="M 0 0 V 430 M -120 430 H 120" p={p01(f, C.S9 - 6, 26)} />
			<polygon points="0,-18 16,10 -16,10" fill={INK} opacity={p01(f, C.S9, 10)} />
			<g transform={`rotate(${tilt})`}>
				<Stroke d={`M ${-L} 0 H ${L}`} p={p01(f, C.S9, 24)} w={4} />
			</g>
			{pan(lx, ly, (
				<Pop f={f} t={C.S9 + 10} x={-70} y={-110} s0={0.5}>
					<Browser p={p01(f, C.S9 + 10, 26)} w={140} h={100} />
				</Pop>
			), C.S9 + 4)}
			{pan(rx, ry, (
				<g>
					{[-60, 0, 60].map((x, i) => (
						<Pop key={x} f={f} t={C.finding - 10 + i * 5} x={x} y={-6} s0={0.4}>
							<Person s={0.62} c={i === 1 ? ACC : INK} />
						</Pop>
					))}
				</g>
			), C.S9 + 8)}
			<Label f={f} t={C.S9 + 14} x={lx} y={ly + 250} text="BUILD THE SITE" size={20} c={DIM} />
			<Label f={f} t={C.hard} x={lx} y={ly + 284} text="EASY" size={18} c={INK} />
			<Label f={f} t={C.finding} x={rx} y={ry + 250} text="FIND THE CLIENTS" size={20} c={INK} />
			<Label f={f} t={C.finding + 10} x={rx} y={ry + 284} text="THE HARD PART" size={18} c={ACC} />
		</g>
	);
};

// ── G: "Hours on Google Maps. Checking every listing. Writing every message by hand." ──
export const Grind: React.FC<P> = ({f, C}) => {
	const pw = 420, ph = 360, gap = 60;
	const x0 = 960 - (3 * pw + 2 * gap) / 2, y0 = 330;
	const hours = ip(f, [C.S10, C.S11 + 10], [0, 7 * 60 + 40], INOUT);
	const hh = Math.floor(hours / 60), mm = Math.floor(hours % 60);
	const panel = (i: number, t: number, title: string, body: React.ReactNode) => (
		<Pop f={f} t={t} x={x0 + i * (pw + gap)} y={y0} d={22}>
			<RRect p={p01(f, t, 26)} w={pw} h={ph} r={20} fill={BG} fillO={0.85} />
			<Stroke d={`M 0 58 H ${pw}`} p={p01(f, t + 8, 18)} w={2.4} c={DIM} />
			<text x={28} y={37} fontFamily={FONT} fontWeight={700} fontSize={15} letterSpacing="0.26em" fill={DIM}>
				{title}
			</text>
			{body}
		</Pop>
	);
	const pins = [[80, 140], [250, 120], [340, 220], [150, 260], [290, 300], [60, 320], [200, 190]];
	const rows = 5;
	return (
		<g>
			<Spot x={960} y={520} r={760} />
			{/* time spent ticker */}
			<g opacity={p01(f, C.S10, 12)}>
				<Label f={f} t={C.S10} x={960} y={188} text="TIME SPENT" size={17} c={DIM} />
				<text x={960} y={262} textAnchor="middle" fontFamily={FONT} fontWeight={700} fontSize={64} fill={hh >= 6 ? ACC : INK} style={{fontVariantNumeric: 'tabular-nums'}}>
					{`${hh}h ${String(mm).padStart(2, '0')}m`}
				</text>
			</g>
			{panel(0, C.S10 - 4, 'GOOGLE MAPS', (
				<g>
					{[110, 200, 290].map((y, i) => <Stroke key={y} d={`M 0 ${y} H ${pw}`} p={p01(f, C.S10 + 4 + i * 3, 20)} c={FAINT} w={10} />)}
					{[120, 260].map((x, i) => <Stroke key={x} d={`M ${x} 58 V ${ph}`} p={p01(f, C.S10 + 8 + i * 3, 20)} c={FAINT} w={10} />)}
					<Stroke d={`M 0 340 Q 200 230 ${pw} 100`} p={p01(f, C.S10 + 12, 24)} c={FAINT} w={14} />
					{pins.map(([x, y], i) => (
						<Pop key={i} f={f} t={C.S10 + 14 + i * 6} x={x} y={y} s0={0.2} d={14}>
							<Pin s={0.7} filled={i % 3 === 0} />
						</Pop>
					))}
				</g>
			))}
			{panel(1, C.checking - 6, 'EVERY LISTING', (
				<g>
					{Array.from({length: rows}).map((_, i) => {
						const t = C.checking + 2 + i * 7;
						return (
							<g key={i} transform={`translate(36 ${100 + i * 54})`} opacity={p01(f, t - 4, 10)}>
								<CheckBox p={p01(f, t - 4, 12)} on={p01(f, t + 6, 10)} />
								<rect x={34} y={-7} width={200 - (i % 3) * 30} height={10} rx={5} fill={DIM} />
								<rect x={34} y={10} width={120} height={7} rx={3.5} fill={FAINT} />
								<text x={346} y={6} textAnchor="end" fontFamily={FONT} fontWeight={700} fontSize={13} letterSpacing="0.14em" fill={i % 2 ? DIM : INK} opacity={p01(f, t + 8, 10)}>
									{i % 2 ? 'HAS SITE' : 'NO SITE?'}
								</text>
							</g>
						);
					})}
				</g>
			))}
			{panel(2, C.writing - 6, 'BY HAND', (
				<g>
					<g transform="translate(30 92)">
						<RRect p={p01(f, C.writing, 20)} w={360} h={150} r={18} c={DIM} sw={2} />
					</g>
					<Type f={f} t={C.writing + 6} text="Hi! I saw your shop on" cps={14} x={52} y={140} size={21} c={INK} caret={false} />
					<Type f={f} t={C.writing + 6 + 22 / 14 * 60} text="Google and I was wonde" cps={14} x={52} y={172} size={21} c={INK} />
					<g opacity={p01(f, C.hand, 10)}>
						<text x={pw / 2} y={300} textAnchor="middle" fontFamily={FONT} fontWeight={700} fontSize={15} letterSpacing="0.24em" fill={ACC}>
							MESSAGE 1 OF 50
						</text>
					</g>
				</g>
			))}
		</g>
	);
};

// ── H: "That's where most people quit." (reference motif: the ball on the dotted path hits the wall) ──
export const Quit: React.FC<P> = ({f, C}) => {
	const sx = 420, sy = 700, wx = 1080;
	const path = (x: number) => sy - Math.sin(((x - sx) / (1560 - sx)) * Math.PI) * 220;
	const travel = ip(f, [C.S11 + 4, C.quit + 2], [sx, wx - 34], Easing2);
	const fall = p01(f, C.quit + 2, 34, SNAP);
	const bx = travel - fall * 40, by = path(travel) + fall * 250;
	return (
		<g>
			<Spot x={960} y={560} r={700} />
			<Stroke d={`M ${sx} ${sy} ${Array.from({length: 40}, (_, i) => { const x = sx + ((1560 - sx) * (i + 1)) / 40; return `L ${x} ${path(x)}`; }).join(' ')}`} p={p01(f, C.S11 - 6, 30)} dash="3 12" c={DIM} w={3} />
			<circle cx={sx} cy={sy + 26} r={6} fill={INK} opacity={p01(f, C.S11 - 4, 10)} />
			<Label f={f} t={C.S11} x={sx} y={sy + 64} text="START" size={16} c={DIM} />
			{/* the wall */}
			<Pop f={f} t={C.S11 + 2} x={wx} y={path(wx) + 70} s0={0.6}>
				<RRect p={p01(f, C.S11 + 2, 20)} w={44} h={170} r={8} />
				{[0, 1, 2, 3].map((i) => <Stroke key={i} d={`M 4 ${30 + i * 36} L 40 ${14 + i * 36}`} p={p01(f, C.S11 + 10 + i * 3, 10)} w={2.4} />)}
			</Pop>
			<Label f={f} t={C.S11 + 8} x={wx + 22} y={path(wx) + 286} text="FINDING CLIENTS" size={16} c={DIM} />
			{/* the goal */}
			<g transform={`translate(1560 ${sy})`} opacity={p01(f, C.S11, 14)}>
				<Stroke d="M 0 0 V -110" p={p01(f, C.S11, 16)} />
				<path d="M 0 -110 L 62 -88 L 0 -66 Z" fill={INK} opacity={p01(f, C.S11 + 8, 10)} />
				<text x={0} y={46} textAnchor="middle" fontFamily={FONT} fontWeight={700} fontSize={26} fill={INK}>
					$
				</text>
			</g>
			{/* the ball */}
			<g opacity={p01(f, C.S11 + 4, 8) * (1 - p01(f, C.quit + 30, 16))}>
				<circle cx={bx} cy={by} r={34} fill="url(#spot)" />
				<circle cx={bx} cy={by} r={11} fill={INK} />
			</g>
			<Pop f={f} t={C.quit + 4} x={960} y={300} s0={0.5}>
				<text textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={86} letterSpacing="0.1em" fill={ACC}>
					QUIT
				</text>
			</Pop>
			<Label f={f} t={C.quit + 12} x={960} y={360} text="WHERE MOST PEOPLE STOP" size={18} c={DIM} />
		</g>
	);
};

// slow-in, fast-at-impact feel for the ball
const Easing2 = (t: number) => t * t * (3 - 2 * t) * 0.6 + t * 0.4;
