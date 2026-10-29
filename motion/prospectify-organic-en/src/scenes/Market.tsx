// Scenes B–E: millions of shops → the website business → AI + price → $50K agencies → "so why?"
import React from 'react';
import {ACC, BG, BACK, Brackets, Browser, Chip, Count, DIM, FAINT, FONT, INK, Label, MiniStore, Pin, Pop, RRect, SNAP, Spot, Stroke, INOUT, ip, p01} from '../lib/kit';

type P = {f: number; C: Record<string, number>};

// ── B: "It's not one shop. It's millions of local businesses, in every city." ──
export const City: React.FC<P> = ({f, C}) => {
	const cols = 17, rows = 5, dx = 104, dy = 112;
	const ox = 960 - ((cols - 1) * dx) / 2, oy = 390;
	const zoom = ip(f, [C.S4 - 8, C.S5], [1.9, 1.0], INOUT);
	const pins = [
		[3, 1], [8, 4], [13, 2], [5, 3], [11, 0], [15, 4], [1, 3], [9, 1],
	];
	return (
		<g transform={`translate(960 560) scale(${zoom}) translate(-960 -560)`}>
			<Spot x={960} y={560} r={700} />
			{Array.from({length: rows}).map((_, r) =>
				Array.from({length: cols}).map((__, c) => {
					const dist = Math.hypot(c - 8, (r - 2) * 1.3);
					const t = (dist === 0 ? C.S4 - 6 : C.S4 + 10) + dist * 3.2;
					const a = p01(f, t, 16, BACK);
					if (a <= 0) return null;
					const lit = c === 8 && r === 2 ? 1 : 0.15;
					return (
						<g key={`${r}-${c}`} transform={`translate(${ox + c * dx} ${oy + r * dy + 40}) scale(${0.6 + 0.4 * a})`} opacity={a}>
							<MiniStore lit={lit} />
						</g>
					);
				}),
			)}
			{pins.map(([c, r], i) => (
				<Pop key={i} f={f} t={C.city + i * 4} x={ox + c * dx} y={oy + r * dy - 4} d={16} s0={0.2}>
					<Pin s={0.62} c={ACC} filled />
				</Pop>
			))}
			<g opacity={p01(f, C.millions - 4, 10)}>
				<text x={960} y={250} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={92} letterSpacing="0.06em" fill={INK}>
					{'MILLIONS'.slice(0, Math.ceil(p01(f, C.millions - 4, 18) * 8))}
				</text>
			</g>
			<Label f={f} t={C.millions + 10} x={960} y={950} text="OF LOCAL BUSINESSES WITHOUT A WEBSITE" size={19} c={DIM} />
			<Label f={f} t={C.city} x={960} y={998} text="IN EVERY CITY" size={19} c={ACC} />
		</g>
	);
};

// ── C: "building websites for them… simplest online business" + "With AI… an afternoon… $500 to $2,000" ──
export const WebBiz: React.FC<P> = ({f, C}) => {
	const W = 760, H = 470;
	const shift = ip(f, [C.S6 - 6, C.S6 + 26], [0, -300], INOUT);
	const sc = ip(f, [C.S6 - 6, C.S6 + 26], [1, 0.86], INOUT);
	const b = C.building;
	const blk = (k: number) => p01(f, b + 10 + k * 7, 18, SNAP);
	const ai = p01(f, C.S6 + 8, 30);
	const sweep = ip(f, [C.afternoon - 30, C.afternoon + 40], [0, 360 * 1.5], INOUT);
	return (
		<g>
			<Spot x={960 + shift} y={520} r={620} />
			<g transform={`translate(${960 + shift} 520) scale(${sc}) translate(${-W / 2} ${-H / 2})`}>
				<Browser p={p01(f, C.S5 - 6, 40)} w={W} h={H} url="YOUR-CLIENT.COM" />
				{/* the site assembling itself */}
				<g opacity={blk(0)} transform={`translate(0 ${(1 - blk(0)) * 14})`}>
					<rect x={40} y={92} width={120} height={14} rx={7} fill={INK} />
					{[0, 1, 2].map((i) => (
						<rect key={i} x={470 + i * 86} y={94} width={60} height={10} rx={5} fill={DIM} />
					))}
				</g>
				<g opacity={blk(1)} transform={`translate(0 ${(1 - blk(1)) * 14})`}>
					<rect x={40} y={150} width={330} height={26} rx={8} fill={INK} />
					<rect x={40} y={190} width={260} height={26} rx={8} fill={INK} />
					<rect x={40} y={236} width={300} height={10} rx={5} fill={DIM} />
					<rect x={40} y={254} width={240} height={10} rx={5} fill={DIM} />
				</g>
				<g opacity={blk(2)} transform={`translate(0 ${(1 - blk(2)) * 14})`}>
					<rect x={40} y={290} width={170} height={48} rx={24} fill={ai > 0 ? 'url(#grad)' : INK} />
					<text x={125} y={320} textAnchor="middle" fontFamily={FONT} fontWeight={700} fontSize={15} letterSpacing="0.18em" fill={ai > 0 ? '#fff' : BG}>
						BOOK NOW
					</text>
				</g>
				<g opacity={blk(3)} transform={`translate(0 ${(1 - blk(3)) * 14})`}>
					<rect x={410} y={140} width={310} height={200} rx={14} fill="none" stroke={INK} strokeWidth={2.4} />
					<path d="M 430 320 L 510 236 L 570 290 L 620 250 L 700 320 Z" fill={INK} opacity={0.85} />
					<circle cx={650} cy={188} r={18} fill={INK} opacity={0.85} />
				</g>
				<g opacity={blk(4)} transform={`translate(0 ${(1 - blk(4)) * 14})`}>
					{[0, 1, 2].map((i) => (
						<g key={i}>
							<rect x={40 + i * 232} y={378} width={210} height={62} rx={12} fill="none" stroke={DIM} strokeWidth={2} />
							<rect x={58 + i * 232} y={398} width={110} height={9} rx={4.5} fill={DIM} />
							<rect x={58 + i * 232} y={416} width={70} height={7} rx={3.5} fill={FAINT} />
						</g>
					))}
				</g>
				{/* AI sheen across the page */}
				{ai > 0 && ai < 1 ? <rect x={ai * (W + 200) - 200} y={60} width={120} height={H - 60} fill="url(#grad)" opacity={0.18 * Math.sin(ai * Math.PI)} /> : null}
			</g>
			<Label f={f} t={C.simplest - 4} x={960 + shift * 0} y={160} text="ONE OF THE SIMPLEST ONLINE BUSINESSES" size={20} c={DIM} out={C.S6 - 4} />
			{/* AI chip */}
			<Pop f={f} t={C.S6} x={960 - 300 - W * 0.43 + 70} y={250} s0={0.4}>
				<Chip text="AI" w={84} h={44} size={18} acc />
			</Pop>
			{/* clock: an afternoon */}
			<Pop f={f} t={C.S6 + 10} x={1390} y={360} out={C.owners - 6}>
				<Stroke d="M 0 -110 A 110 110 0 1 1 -0.1 -110" p={p01(f, C.S6 + 10, 30)} />
				{[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((i) => (
					<line key={i} x1={Math.sin((i * Math.PI) / 6) * 92} y1={-Math.cos((i * Math.PI) / 6) * 92} x2={Math.sin((i * Math.PI) / 6) * 100} y2={-Math.cos((i * Math.PI) / 6) * 100} stroke={DIM} strokeWidth={2} />
				))}
				<g transform={`rotate(${sweep})`}>
					<line x1={0} y1={0} x2={0} y2={-80} stroke={INK} strokeWidth={4} strokeLinecap="round" />
				</g>
				<g transform={`rotate(${sweep / 12 + 40})`}>
					<line x1={0} y1={0} x2={0} y2={-52} stroke={INK} strokeWidth={5} strokeLinecap="round" />
				</g>
				<circle r={7} fill={ACC} />
			</Pop>
			<Label f={f} t={C.afternoon} x={1390} y={540} text="ONE AFTERNOON" size={20} c={INK} out={C.owners - 6} />
			{/* price tag: what owners pay */}
			<Pop f={f} t={C.owners} x={1390} y={420} d={22}>
				<g transform="rotate(-6)">
					<path d="M -150 -70 H 110 L 170 0 L 110 70 H -150 Q -170 70 -170 50 V -50 Q -170 -70 -150 -70 Z" fill={BG} stroke={INK} strokeWidth={3.2} strokeLinejoin="round" />
					<circle cx={118} cy={0} r={10} fill="none" stroke={INK} strokeWidth={3} />
					<Count f={f} t={C.p500 - 4} d={20} from={0} to={500} prefix="$" x={-20} y={26} size={72} c={INK} />
					{f >= C.p2000 - 4 ? <rect x={-168} y={-68} width={278} height={136} fill={BG} /> : null}
					<Count f={f} t={C.p2000 - 4} d={36} from={500} to={2000} prefix="$" x={-24} y={26} size={72} c={ACC} />
				</g>
			</Pop>
			<Label f={f} t={C.owners + 6} x={1390} y={560} text="WHAT OWNERS PAY · PER SITE" size={18} c={DIM} />
			<Label f={f} t={C.p2000} x={1390} y={596} text="$500 — $2,000" size={18} c={ACC} />
		</g>
	);
};

// ── D: "Some small agencies doing only this pass fifty thousand dollars a month." ──
export const Agencies: React.FC<P> = ({f, C}) => {
	const x0 = 520, y0 = 760, w = 880, h = 420;
	const curve = `M ${x0} ${y0 - 20} C ${x0 + 260} ${y0 - 40}, ${x0 + 480} ${y0 - 110}, ${x0 + 640} ${y0 - 230} S ${x0 + 820} ${y0 - 380}, ${x0 + w} ${y0 - h}`;
	const p = p01(f, C.S7 + 6, Math.max(40, C.fifty + 30 - C.S7), SNAP);
	// head position along the curve, approximated with the same bezier sampled numerically
	const pts = React.useMemo(() => sample(curve), [curve]);
	const head = pts[Math.min(pts.length - 1, Math.floor(p * (pts.length - 1)))];
	return (
		<g>
			<Spot x={960} y={560} r={640} />
			<Label f={f} t={C.S7} x={960} y={175} text="SMALL AGENCIES · WEBSITES ONLY" size={20} c={DIM} />
			<Stroke d={`M ${x0} ${y0 - h - 20} V ${y0} H ${x0 + w + 30}`} p={p01(f, C.S7 - 4, 24)} c={DIM} w={2.4} />
			{[1, 2, 3].map((i) => (
				<Stroke key={i} d={`M ${x0} ${y0 - (i * h) / 3.4} H ${x0 + w}`} p={p01(f, C.S7 + i * 4, 30)} dash="4 10" c={FAINT} w={2} />
			))}
			{['JAN', 'MAR', 'MAY', 'JUL', 'SEP', 'NOV'].map((m, i) => (
				<Label key={m} f={f} t={C.S7 + 10 + i * 3} x={x0 + 40 + i * 160} y={y0 + 40} text={m} size={15} c={DIM} />
			))}
			<Stroke d={curve} p={p} w={4} />
			{p > 0 ? (
				<g transform={`translate(${head[0]} ${head[1]})`}>
					<circle r={26} fill="url(#spotAcc)" />
					<circle r={8} fill={INK} />
				</g>
			) : null}
			<Pop f={f} t={C.fifty - 6} x={x0 + w - 10} y={y0 - h - 70} origin="0px 0px">
				<Count f={f} t={C.fifty - 6} d={50} from={0} to={50000} prefix="$" x={0} y={0} size={96} anchor="end" c={ACC} weight={800} />
			</Pop>
			<Label f={f} t={C.month} x={x0 + w - 10} y={y0 - h - 20} text="PER MONTH" size={20} anchor="end" c={INK} />
		</g>
	);
};

function sample(d: string): [number, number][] {
	// parse "M x y C ... S ..." built above; evaluate cubic segments
	const n = d.replace(/,/g, ' ').split(/\s+/).filter(Boolean);
	const pts: [number, number][] = [];
	let i = 0, cx = 0, cy = 0, lc: [number, number] = [0, 0];
	while (i < n.length) {
		const cmd = n[i++];
		if (cmd === 'M') { cx = +n[i++]; cy = +n[i++]; pts.push([cx, cy]); continue; }
		let c1: [number, number];
		if (cmd === 'C') { c1 = [+n[i++], +n[i++]]; } else { c1 = [2 * cx - lc[0], 2 * cy - lc[1]]; }
		const c2: [number, number] = [+n[i++], +n[i++]];
		const e: [number, number] = [+n[i++], +n[i++]];
		for (let k = 1; k <= 60; k++) {
			const t = k / 60, u = 1 - t;
			pts.push([u * u * u * cx + 3 * u * u * t * c1[0] + 3 * u * t * t * c2[0] + t * t * t * e[0], u * u * u * cy + 3 * u * u * t * c1[1] + 3 * u * t * t * c2[1] + t * t * t * e[1]]);
		}
		lc = c2; cx = e[0]; cy = e[1];
	}
	return pts;
}

// ── E: "So why isn't everyone doing it?" ──
export const Why: React.FC<P> = ({f, C}) => {
	const close = p01(f, C.S8 - 4, 22, SNAP);
	const pulse = 1 + 0.03 * Math.sin((f - C.S8) / 7);
	return (
		<g>
			<Spot x={960} y={500} r={460} o={p01(f, C.S8, 20)} />
			<g transform={`translate(960 500) scale(${pulse})`}>
				<Brackets w={420 - 120 * close} h={420 - 120 * close} p={close} len={46} />
				<Pop f={f} t={C.S8 + 2} s0={0.4} d={22}>
					<g transform="translate(-85 -85)">
						<RRect p={p01(f, C.S8 + 2, 20)} w={170} h={170} r={22} c={INK} fill={BG} />
						<text x={85} y={124} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={110} fill={INK}>
							?
						</text>
					</g>
				</Pop>
			</g>
			<Label f={f} t={C.everyone - 6} x={960} y={790} text="WHY ISN'T EVERYONE DOING IT?" size={22} c={INK} />
		</g>
	);
};
