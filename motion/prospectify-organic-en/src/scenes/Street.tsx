// Scene A — "a business on your street… no website" → "Five-star reviews… nothing" → "people go somewhere else".
// One continuous street: the camera pans and pulls back instead of cutting.
import React from 'react';
import {ACC, BG, Brackets, Count, DIM, FONT, INK, Label, Magnifier, Person, Pop, RRect, STAR, Spot, Store, Stroke, Type, ip, p01, INOUT, SNAP} from '../lib/kit';

type P = {f: number; C: Record<string, number>};
const GY = 770; // ground line

export const Street: React.FC<P> = ({f, C}) => {
	// Camera: centre on the shop → slide left for the search card → pull back to show the competitor.
	const camX = ip(f, [C.search - 14, C.search + 16], [0, -250], INOUT) + ip(f, [C.S3 - 6, C.S3 + 30], [0, 250 - 120], INOUT);
	const camS = ip(f, [C.S3 - 6, C.S3 + 30], [1.16, 0.86], INOUT);
	const searchOut = C.S3 - 4;

	// Walkers in act 3: arrive at the shop, hesitate, leave for the competitor.
	const walkers = [0, 1, 2].map((i) => {
		const t0 = C.S3 + 4 + i * 16;
		const tLeave = C.else - 18 + i * 12;
		const xIn = ip(f, [t0, t0 + 50], [260, 640 + i * 70], SNAP);
		const xOut = ip(f, [tLeave, tLeave + 60], [0, 1700 - (640 + i * 70) + i * 50], INOUT);
		return {x: xIn + xOut, a: p01(f, t0, 12), hesit: f >= C.cant - 6 && f < tLeave + 10, gone: f > tLeave + 30};
	});
	const lost = walkers.filter((w, i) => f > C.else - 18 + i * 12 + 40).length;

	return (
		<g transform={`translate(${960 + camX} 560) scale(${camS}) translate(-960 -560)`}>
			<Spot x={1060} y={600} r={520} o={1} />
			{/* ground */}
			<Stroke d={`M 240 ${GY} H 1980`} p={p01(f, -12, 40)} dash="10 12" c={DIM} w={2} />

			{/* the shop: already drawing on frame 0 */}
			<g transform={`translate(1060 ${GY})`}>
				<Store p={p01(f, C.S1 - 26, 80)} sign="OPEN" lit={p01(f, C.money, 20)} />
			</g>
			<Label f={f} t={0} x={1060} y={GY + 52} text="LOCAL BUSINESS" size={18} c={DIM} out={C.S3} />

			{/* real money: revenue counter over the shop */}
			<g opacity={1 - p01(f, C.S2 - 8, 12)}>
				<Label f={f} t={C.money - 6} x={1060} y={336} text="REVENUE THIS MONTH" size={17} c={DIM} />
				<Count f={f} t={C.money} d={50} from={1200} to={18400} prefix="$" x={1060} y={410} size={76} />
			</g>
			{/* "no website at all" */}
			<Pop f={f} t={C.nosite} x={1420} y={460} out={C.S2 + 30}>
				<RRect p={p01(f, C.nosite, 26)} w={210} h={140} r={14} c={DIM} sw={2.4} />
				<Stroke d="M 0 36 H 210" p={p01(f, C.nosite + 6, 16)} c={DIM} w={2} />
				<text x={105} y={98} textAnchor="middle" fontFamily={FONT} fontWeight={700} fontSize={19} letterSpacing="0.22em" fill={DIM}>
					WEBSITE
				</text>
				<Stroke d="M 18 18 L 192 122" p={p01(f, C.nosite + 16, 12)} c={ACC} w={3.6} />
			</Pop>
			<Label f={f} t={C.nosite + 18} x={1525} y={640} text="NONE" size={20} c={ACC} out={C.S2 + 30} />

			{/* first customers (hook) */}
			<Pop f={f} t={C.street - 4} x={690} y={GY} out={C.line - 2}>
				<Person s={0.95} />
			</Pop>
			<Pop f={f} t={C.street + 6} x={600} y={GY} out={C.line - 2}>
				<Person s={0.85} />
			</Pop>

			{/* Five-star reviews */}
			<g opacity={1 - p01(f, C.S3 - 6, 14)}>
				{[0, 1, 2, 3, 4].map((i) => (
					<Pop key={i} f={f} t={C.S2 + i * 5} x={1060 + (i - 2) * 66} y={392} d={16} s0={0.3}>
						<path d={STAR} fill={INK} />
					</Pop>
				))}
				<Label f={f} t={C.S2 + 24} x={1060} y={462} text="4.9 · 312 REVIEWS" size={17} c={DIM} />
			</g>

			{/* A line at the door */}
			{[0, 1, 2, 3].map((i) => {
				const t = C.line + i * 5;
				const x = ip(f, [t, t + 34], [300, 800 - i * 78], SNAP);
				return (
					<g key={i} opacity={p01(f, t, 10) * (1 - p01(f, C.S3 - 10, 12))} transform={`translate(${x} ${GY})`}>
						<Person s={0.8 - i * 0.03} />
					</g>
				);
			})}

			{/* Search for it online… nothing */}
			<Pop f={f} t={C.search - 6} x={1420} y={330} out={searchOut} d={22}>
				<RRect p={p01(f, C.search - 6, 24)} w={560} h={76} r={38} fill={BG} fillO={0.9} />
				<g transform="translate(46 38)">
					<Magnifier s={1.1} />
				</g>
				<Type f={f} t={C.search + 4} text="bakery near me" cps={24} x={84} y={49} size={28} />
			</Pop>
			<Pop f={f} t={C.nothing - 22} x={1420 + Math.sin(Math.max(0, f - C.nothing) * 1.4) * 9 * (1 - p01(f, C.nothing, 22))} y={432} out={searchOut} d={18}>
				<RRect p={p01(f, C.nothing - 22, 22)} w={560} h={260} r={20} fill={BG} fillO={0.9} c={DIM} sw={2.4} />
				{[0, 1, 2].map((i) => (
					<g key={i} opacity={1 - p01(f, C.nothing - 2, 10)}>
						<rect x={40} y={50 + i * 66} width={56} height={40} rx={8} fill="none" stroke={DIM} strokeWidth={2} strokeDasharray="6 7" />
						<rect x={116} y={58 + i * 66} width={300 - i * 60} height={10} rx={5} fill={DIM} opacity={0.5} />
						<rect x={116} y={78 + i * 66} width={180} height={8} rx={4} fill={DIM} opacity={0.3} />
					</g>
				))}
				<g opacity={p01(f, C.nothing, 12)}>
					<Brackets w={260} h={120} p={p01(f, C.nothing, 16)} />
					<g transform="translate(280 130)">
						<text y={-6} textAnchor="middle" fontFamily={FONT} fontWeight={700} fontSize={34} letterSpacing="0.04em" fill={INK}>
							No website
						</text>
						<text y={30} textAnchor="middle" fontFamily={FONT} fontWeight={600} fontSize={15} letterSpacing="0.3em" fill={DIM}>
							0 RESULTS
						</text>
					</g>
				</g>
			</Pop>

			{/* Act 3: the competitor down the street */}
			<g opacity={p01(f, C.S3 + 4, 20)}>
				<g transform={`translate(1760 ${GY})`}>
					<Store p={p01(f, C.S3 + 4, 60)} s={0.86} sign="OPEN" lit={p01(f, C.else, 20)} />
				</g>
				<Pop f={f} t={C.S3 + 30} x={1760} y={GY - 330}>
					<g transform="translate(-85 -22)">
						<RRect p={p01(f, C.S3 + 30, 20)} w={170} h={44} r={22} c={INK} sw={2.4} />
						<text x={85} y={29} textAnchor="middle" fontFamily={FONT} fontWeight={700} fontSize={15} letterSpacing="0.22em" fill={INK}>
							WEBSITE ✓
						</text>
					</g>
				</Pop>
				<Label f={f} t={C.S3 + 20} x={1760} y={GY + 52} text="COMPETITOR" size={18} c={DIM} />
			</g>
			{walkers.map((w, i) =>
				w.a > 0 && !w.gone ? (
					<g key={i} transform={`translate(${w.x} ${GY})`} opacity={w.a}>
						<Person s={0.82} />
						{w.hesit ? (
							<g transform="translate(0 -168)" opacity={p01(f, C.cant - 6 + i * 3, 8)}>
								<circle r={20} fill="none" stroke={INK} strokeWidth={2.4} />
								<text y={8} textAnchor="middle" fontFamily={FONT} fontWeight={700} fontSize={22} fill={INK}>
									?
								</text>
							</g>
						) : null}
					</g>
				) : null,
			)}
			{/* arrivals at the competitor */}
			{[0, 1, 2].map((i) => (
				<Pop key={i} f={f} t={C.else - 18 + i * 12 + 58} x={1600 + i * 60} y={GY}>
					<Person s={0.78} />
				</Pop>
			))}
			<g opacity={p01(f, C.cant, 12)}>
				<Label f={f} t={C.cant} x={1060} y={318} text="CUSTOMERS LOST" size={17} c={DIM} />
				<text x={1060} y={392} textAnchor="middle" fontFamily={FONT} fontWeight={700} fontSize={66} fill={lost > 0 ? ACC : INK}>
					{lost}
				</text>
			</g>
		</g>
	);
};
