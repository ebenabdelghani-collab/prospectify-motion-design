import React from 'react';
import {COLORS, EASE, FONTS} from '../constants/theme';
import {T} from '../constants/timeline';
import {COPY} from '../constants/copy';
import {MaskLine} from '../components/primitives';
import {lerp, ramp, rand} from '../motion/anim';

const FROM = {x: 49, y: 712, w: 982, h: 192}; // hook bar rect at end of the stall push-in
const TO = {x: 70, y: 610, w: 940, h: 860};
const TAB_H = 64;

const grey = (a: number) => `rgba(244,244,246,${a})`;

const QueryBar: React.FC<{q: string}> = ({q}) => (
	<div
		style={{
			height: 72,
			borderRadius: 36,
			background: grey(0.07),
			display: 'flex',
			alignItems: 'center',
			padding: '0 32px',
			fontFamily: FONTS.sans,
			fontSize: 30,
			color: grey(0.7),
			gap: 18,
		}}
	>
		<svg width={28} height={28} viewBox="0 0 24 24">
			<circle cx={10.5} cy={10.5} r={6.5} fill="none" stroke={grey(0.5)} strokeWidth={2.2} />
			<path d="M15.5 15.5 21 21" stroke={grey(0.5)} strokeWidth={2.2} strokeLinecap="round" />
		</svg>
		{q}
	</div>
);

const MapPanel: React.FC<{seed: number}> = ({seed}) => (
	<div style={{position: 'absolute', inset: 0, background: '#16161B'}}>
		<svg width="100%" height="100%" style={{position: 'absolute', inset: 0}}>
			{Array.from({length: 16}).map((_, i) => {
				const v = i % 2 === 0;
				const p = rand(seed * 31 + i) * 940;
				return v ? (
					<line key={i} x1={p} y1={0} x2={p + rand(i + seed) * 120 - 60} y2={800} stroke={grey(0.08)} strokeWidth={6 + (i % 3) * 6} />
				) : (
					<line key={i} x1={0} y1={p * 0.85} x2={940} y2={p * 0.85 + rand(i * 3 + seed) * 140 - 70} stroke={grey(0.08)} strokeWidth={6 + (i % 4) * 5} />
				);
			})}
			{Array.from({length: 11}).map((_, i) => {
				const x = 80 + rand(seed * 7 + i * 13) * 780;
				const y = 160 + rand(seed * 11 + i * 17) * 560;
				return (
					<g key={`p${i}`} transform={`translate(${x},${y})`}>
						<path d="M0 0 C -14 -18 -14 -36 0 -40 C 14 -36 14 -18 0 0 Z" fill={grey(0.55)} />
						<circle cx={0} cy={-27} r={5} fill="#16161B" />
					</g>
				);
			})}
		</svg>
		<div style={{position: 'absolute', left: 32, right: 32, top: 28}}>
			<QueryBar q="plumbers near austin" />
		</div>
	</div>
);

const ResultsPanel: React.FC<{seed: number; page?: string}> = ({seed, page}) => (
	<div style={{position: 'absolute', inset: 0, background: '#141419', padding: 32}}>
		<QueryBar q="plumber austin tx website" />
		{Array.from({length: 6}).map((_, i) => (
			<div key={i} style={{marginTop: i === 0 ? 40 : 30}}>
				<div style={{width: 200 + rand(seed + i) * 340, height: 26, borderRadius: 6, background: grey(0.3)}} />
				<div style={{width: 560 + rand(seed * 2 + i) * 240, height: 14, borderRadius: 6, background: grey(0.1), marginTop: 14}} />
				<div style={{width: 380 + rand(seed * 3 + i) * 300, height: 14, borderRadius: 6, background: grey(0.1), marginTop: 10}} />
			</div>
		))}
		{page && (
			<div style={{position: 'absolute', bottom: 34, left: 0, right: 0, textAlign: 'center', fontFamily: FONTS.sans, fontSize: 28, color: grey(0.45)}}>
				{page}
			</div>
		)}
	</div>
);

const OldSitePanel: React.FC<{footer: string}> = ({footer}) => (
	<div style={{position: 'absolute', inset: 0, background: '#D9D3C4', padding: 40, fontFamily: 'Times New Roman, serif', color: '#2A2A2A'}}>
		<div style={{fontSize: 54, fontWeight: 700, textAlign: 'center', letterSpacing: '0.02em'}}>WELCOME TO OUR WEB SITE</div>
		<div style={{height: 4, background: '#7A6F5A', margin: '22px 0 34px'}} />
		<div style={{display: 'flex', gap: 30}}>
			<div style={{width: 240, height: 300, background: '#B9B09B'}} />
			<div style={{flex: 1, fontSize: 30, lineHeight: 1.5}}>
				<div style={{color: '#1F3FB8', textDecoration: 'underline'}}>Home</div>
				<div style={{color: '#1F3FB8', textDecoration: 'underline'}}>About Us</div>
				<div style={{color: '#1F3FB8', textDecoration: 'underline'}}>Services (coming soon)</div>
				<div style={{marginTop: 24, fontSize: 40, fontWeight: 700, color: '#8A2B1C'}}>Under construction</div>
			</div>
		</div>
		<div style={{position: 'absolute', bottom: 36, left: 0, right: 0, textAlign: 'center', fontSize: 26}}>{footer}</div>
	</div>
);

const SheetPanel: React.FC<{rows: number}> = ({rows}) => {
	const cols = ['Business', 'Website?', 'Email', 'Phone'];
	const cells = ['?', 'TBD', '—', 'check', '??', 'no idea'];
	return (
		<div style={{position: 'absolute', inset: 0, background: '#18181E', fontFamily: FONTS.sans, fontSize: 26, color: grey(0.6)}}>
			<div style={{display: 'grid', gridTemplateColumns: '60px 300px 190px 190px 200px'}}>
				<div style={{height: 56, background: grey(0.06)}} />
				{cols.map((c) => (
					<div key={c} style={{height: 56, display: 'flex', alignItems: 'center', padding: '0 16px', background: grey(0.06), borderLeft: `1px solid ${grey(0.08)}`, color: grey(0.8), fontWeight: 600}}>
						{c}
					</div>
				))}
				{Array.from({length: rows}).map((_, r) => (
					<React.Fragment key={r}>
						<div style={{height: 54, display: 'flex', alignItems: 'center', justifyContent: 'center', borderTop: `1px solid ${grey(0.08)}`, color: grey(0.35)}}>{r + 2}</div>
						{cols.map((c, ci) => (
							<div key={c} style={{height: 54, display: 'flex', alignItems: 'center', padding: '0 16px', borderTop: `1px solid ${grey(0.08)}`, borderLeft: `1px solid ${grey(0.08)}`}}>
								{ci === 0 ? <div style={{width: 120 + rand(r * 5) * 140, height: 14, borderRadius: 7, background: grey(0.2)}} /> : cells[Math.floor(rand(r * 7 + ci) * cells.length)]}
							</div>
						))}
					</React.Fragment>
				))}
			</div>
		</div>
	);
};

const MessagePanel: React.FC<{title: string; body: string}> = ({title, body}) => (
	<div style={{position: 'absolute', inset: 0, background: '#141419', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: FONTS.sans}}>
		<div style={{fontSize: 120, fontWeight: 700, color: grey(0.18), letterSpacing: '-0.04em'}}>{title}</div>
		<div style={{fontSize: 34, color: grey(0.5), marginTop: 10}}>{body}</div>
	</div>
);

const PANELS = [
	() => <MapPanel seed={1} />,
	() => <ResultsPanel seed={2} />,
	() => <OldSitePanel footer="Copyright © 2011 · Best viewed in 800×600" />,
	() => <SheetPanel rows={12} />,
	() => <MessagePanel title="404" body="Page not found" />,
	() => <MapPanel seed={6} />,
	() => <MessagePanel title="Contact" body="No email listed." />,
	() => <ResultsPanel seed={9} page="Page 4 of 27" />,
	() => <SheetPanel rows={12} />,
	() => <OldSitePanel footer="Last updated: 2014" />,
	() => <MapPanel seed={13} />,
];

/** 2.0–3.1s — manual prospecting, compressed: tabs pile up, nothing resolves, it collapses. */
export const Chaos: React.FC<{f: number}> = ({f}) => {
	if (f < T.CHAOS_START || f >= T.CHAOS_END) return null;

	const grow = ramp(f, T.CHAOS_START, 12, EASE.snap);
	const rect = {
		x: lerp(FROM.x, TO.x, grow),
		y: lerp(FROM.y, TO.y, grow),
		w: lerp(FROM.w, TO.w, grow),
		h: lerp(FROM.h, TO.h, grow),
	};
	const cutIdx = T.CHAOS_CUTS.filter((c) => c <= f).length - 1;
	const Panel = PANELS[Math.max(0, cutIdx) % PANELS.length];
	const jx = (rand(cutIdx * 3 + 1) - 0.5) * 30;
	const jy = (rand(cutIdx * 5 + 2) - 0.5) * 24;
	const jr = (rand(cutIdx * 7 + 3) - 0.5) * 2.4;
	const tabs = 3 + cutIdx * 2;

	// Collapse to a line, then to nothing (the transition family: everything resolves through "the line").
	const cy = ramp(f, T.CHAOS_COLLAPSE, 7, EASE.exit);
	const cx = ramp(f, T.CHAOS_COLLAPSE + 6, 6, EASE.exit);
	const sy = lerp(1, 0.004, cy);
	const sx = lerp(1, 0, cx);

	const cursor = {x: 200 + rand(cutIdx * 13) * 600, y: 220 + rand(cutIdx * 17) * 480};

	return (
		<>
			<div style={{position: 'absolute', left: 90, top: 300, opacity: 1 - cy}}>
				<MaskLine f={f} inAt={T.STILL_SEARCHING} text={COPY.stillSearching[0]} style={{fontSize: 128, fontWeight: 700, letterSpacing: '-0.05em', color: COLORS.textDim, lineHeight: 1}} />
				<MaskLine f={f} inAt={T.STILL_SEARCHING + 4} text={COPY.stillSearching[1]} style={{fontSize: 128, fontWeight: 700, letterSpacing: '-0.05em', color: COLORS.text, lineHeight: 1}} />
			</div>
			<div
				style={{
					position: 'absolute',
					left: rect.x,
					top: rect.y,
					width: rect.w,
					height: rect.h,
					transform: `translate(${jx * grow}px, ${jy * grow}px) rotate(${jr * grow}deg) scale(${sx}, ${sy})`,
					transformOrigin: '50% 50%',
				}}
			>
				{/* ghosts of previous tabs piling up behind */}
				{[2, 1].map((d) => (
					<div
						key={d}
						style={{
							position: 'absolute',
							inset: 0,
							transform: `translate(${(rand(cutIdx - d) - 0.5) * 50}px, ${-d * 26}px) scale(${1 - d * 0.035})`,
							borderRadius: 26,
							background: COLORS.surface,
							border: `2px solid ${COLORS.line}`,
							opacity: cutIdx >= d ? 0.55 - d * 0.15 : 0,
						}}
					/>
				))}
				<div
					style={{
						position: 'absolute',
						inset: 0,
						borderRadius: 26,
						overflow: 'hidden',
						background: COLORS.surface,
						border: `2px solid ${COLORS.lineHi}`,
						boxShadow: '0 40px 120px rgba(0,0,0,0.7)',
					}}
				>
					{/* tab strip — gets more crowded every cut */}
					<div style={{height: TAB_H, display: 'flex', alignItems: 'flex-end', gap: 4, padding: '0 14px', background: '#0D0D11', overflow: 'hidden'}}>
						{Array.from({length: tabs}).map((_, i) => (
							<div
								key={i}
								style={{
									flex: 1,
									minWidth: 0,
									height: 46,
									borderRadius: '12px 12px 0 0',
									background: i === tabs - 1 ? COLORS.surface : grey(0.05),
									display: 'flex',
									alignItems: 'center',
									padding: '0 10px',
								}}
							>
								<div style={{width: '70%', height: 10, borderRadius: 5, background: grey(i === tabs - 1 ? 0.35 : 0.14)}} />
							</div>
						))}
					</div>
					<div style={{position: 'absolute', left: 0, right: 0, top: TAB_H, bottom: 0, opacity: grow}}>
						<Panel />
					</div>
				</div>
				{grow > 0.9 && (
					<svg width={48} height={48} viewBox="0 0 28 28" style={{position: 'absolute', left: cursor.x, top: cursor.y}}>
						<path d="M6 4 L6 22 L10.6 17.8 L13.6 24.4 L16.6 23.1 L13.7 16.7 L19.8 16.7 Z" fill="#F4F4F6" stroke="#050505" strokeWidth={1.4} />
					</svg>
				)}
			</div>
		</>
	);
};
