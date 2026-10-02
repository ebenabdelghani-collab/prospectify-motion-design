import React from 'react';
import {COLORS, EASE, FONTS} from '../constants/theme';
import {T} from '../constants/timeline';
import {COPY} from '../constants/copy';
import {lineScale} from '../components/ui';
import {lerp, ramp, rand} from '../motion/anim';

const WIN = {x: 70, y: 620, w: 940, h: 860};
const TAB_H = 64;
const g = (a: number) => `rgba(244,244,246,${a})`;

const QueryBar: React.FC<{q: string}> = ({q}) => (
	<div style={{height: 72, borderRadius: 36, background: g(0.07), display: 'flex', alignItems: 'center', padding: '0 32px', fontFamily: FONTS.sans, fontSize: 30, color: g(0.75), gap: 18}}>
		<svg width={28} height={28} viewBox="0 0 24 24">
			<circle cx={10.5} cy={10.5} r={6.5} fill="none" stroke={g(0.5)} strokeWidth={2.2} />
			<path d="M15.5 15.5 21 21" stroke={g(0.5)} strokeWidth={2.2} strokeLinecap="round" />
		</svg>
		{q}
	</div>
);

const MapPanel: React.FC<{seed: number}> = ({seed}) => (
	<div style={{position: 'absolute', inset: 0, background: '#16161B'}}>
		<svg width="100%" height="100%" style={{position: 'absolute', inset: 0}}>
			{Array.from({length: 16}).map((_, i) => {
				const p = rand(seed * 31 + i) * 940;
				return i % 2 === 0 ? (
					<line key={i} x1={p} y1={0} x2={p + rand(i + seed) * 120 - 60} y2={800} stroke={g(0.08)} strokeWidth={6 + (i % 3) * 6} />
				) : (
					<line key={i} x1={0} y1={p * 0.85} x2={940} y2={p * 0.85 + rand(i * 3 + seed) * 140 - 70} stroke={g(0.08)} strokeWidth={6 + (i % 4) * 5} />
				);
			})}
			{Array.from({length: 13}).map((_, i) => (
				<g key={`p${i}`} transform={`translate(${80 + rand(seed * 7 + i * 13) * 780},${170 + rand(seed * 11 + i * 17) * 560})`}>
					<path d="M0 0 C -14 -18 -14 -36 0 -40 C 14 -36 14 -18 0 0 Z" fill={g(0.55)} />
					<circle cx={0} cy={-27} r={5} fill="#16161B" />
				</g>
			))}
		</svg>
		<div style={{position: 'absolute', left: 32, right: 32, top: 28}}>
			<QueryBar q="plumbers near austin" />
		</div>
	</div>
);

const ReviewsPanel: React.FC = () => (
	<div style={{position: 'absolute', inset: 0, background: '#141419', padding: 36, fontFamily: FONTS.sans}}>
		<div style={{fontSize: 40, fontWeight: 650, color: g(0.85), letterSpacing: '-0.02em'}}>Reviews</div>
		{[5, 4, 5, 2, 5].map((stars, i) => (
			<div key={i} style={{marginTop: 30, paddingBottom: 26, borderBottom: `1.5px solid ${g(0.07)}`}}>
				<div style={{display: 'flex', alignItems: 'center', gap: 16}}>
					<div style={{width: 48, height: 48, borderRadius: 24, background: g(0.12)}} />
					<div style={{width: 160 + rand(i) * 120, height: 18, borderRadius: 9, background: g(0.25)}} />
					<div style={{flex: 1}} />
					<div style={{fontSize: 28, color: g(0.6), letterSpacing: '0.1em'}}>{'★'.repeat(stars) + '☆'.repeat(5 - stars)}</div>
				</div>
				<div style={{width: 640 + rand(i * 3) * 160, height: 13, borderRadius: 7, background: g(0.1), marginTop: 18}} />
				<div style={{width: 420 + rand(i * 5) * 200, height: 13, borderRadius: 7, background: g(0.1), marginTop: 10}} />
			</div>
		))}
	</div>
);

const OldSitePanel: React.FC = () => (
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
		<div style={{position: 'absolute', bottom: 36, left: 0, right: 0, textAlign: 'center', fontSize: 26}}>Copyright © 2011 · Best viewed in 800×600</div>
	</div>
);

// Generic social profile grid — no platform branding.
const SocialPanel: React.FC = () => (
	<div style={{position: 'absolute', inset: 0, background: '#121216', padding: 36, fontFamily: FONTS.sans}}>
		<div style={{display: 'flex', alignItems: 'center', gap: 26}}>
			<div style={{width: 120, height: 120, borderRadius: 60, background: g(0.14)}} />
			<div>
				<div style={{width: 260, height: 22, borderRadius: 11, background: g(0.35)}} />
				<div style={{display: 'flex', gap: 34, marginTop: 20, fontSize: 26, color: g(0.6)}}>
					<span>212 posts</span>
					<span>1.4k followers</span>
				</div>
			</div>
		</div>
		<div style={{fontSize: 26, color: g(0.55), marginTop: 26}}>📍 Austin · DM for quotes · link in bio?</div>
		<div style={{display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginTop: 30}}>
			{Array.from({length: 9}).map((_, i) => (
				<div key={i} style={{height: 170, background: g(0.05 + rand(i * 9) * 0.1)}} />
			))}
		</div>
	</div>
);

const ContactPanel: React.FC = () => (
	<div style={{position: 'absolute', inset: 0, background: '#141419', padding: 44, fontFamily: FONTS.sans}}>
		<div style={{fontSize: 46, fontWeight: 650, color: g(0.85), letterSpacing: '-0.02em'}}>Contact us</div>
		{['Name', 'Phone', 'Message'].map((l, i) => (
			<div key={l} style={{marginTop: 34}}>
				<div style={{fontSize: 24, color: g(0.45)}}>{l}</div>
				<div style={{height: i === 2 ? 180 : 70, borderRadius: 12, border: `2px solid ${g(0.12)}`, marginTop: 10}} />
			</div>
		))}
		<div style={{marginTop: 34, fontSize: 30, fontWeight: 600, color: '#E8445F'}}>Email: not listed</div>
	</div>
);

const PANELS = [MapPanel, ReviewsPanel, OldSitePanel, SocialPanel, ContactPanel];

/** 7.5–17.5s: the manual workflow, one panel per spoken word; then 0 pitches sent. */
export const Pain: React.FC<{f: number}> = ({f}) => {
	if (f < T.PAIN_START || f > T.PAIN_END + 2) return null;

	const open = lineScale(f, T.ZERO_IN - 8, T.PAIN_START);
	const cuts = [...T.PAIN_CUTS, ...T.WORTH_FLICKS];
	const idx = Math.max(0, cuts.filter((c) => c <= f).length - 1);
	const panelIdx = idx < 5 ? idx : (idx * 3 + 1) % 5;
	const Panel = PANELS[panelIdx];
	const frantic = idx >= 5 ? 1 : 0;
	const jx = (rand(idx * 3 + 1) - 0.5) * (14 + frantic * 30);
	const jy = (rand(idx * 5 + 2) - 0.5) * (10 + frantic * 24);
	const jr = (rand(idx * 7 + 3) - 0.5) * (0.8 + frantic * 2.2);
	const tabs = 3 + idx * 2;
	const cursor = {x: 160 + rand(idx * 13) * 620, y: 200 + rand(idx * 17) * 480};

	const zeroT = ramp(f, T.ZERO_LOCK, 10, EASE.lock);
	const zeroOut = lineScale(f, T.PAIN_END - 8);

	return (
		<>
			{f < T.ZERO_IN + 2 && (
				<div style={{position: 'absolute', left: WIN.x, top: WIN.y, width: WIN.w, height: WIN.h, transform: `translate(${jx}px, ${jy}px) rotate(${jr}deg) scaleY(${open})`}}>
					{[3, 2, 1].map((d) => (
						<div
							key={d}
							style={{
								position: 'absolute',
								inset: 0,
								transform: `translate(${(rand(idx - d) - 0.5) * 60}px, ${-d * 24}px) scale(${1 - d * 0.03})`,
								borderRadius: 26,
								background: COLORS.surface,
								border: `2px solid ${COLORS.line}`,
								opacity: idx >= d ? 0.6 - d * 0.14 : 0,
							}}
						/>
					))}
					<div style={{position: 'absolute', inset: 0, borderRadius: 26, overflow: 'hidden', background: COLORS.surface, border: `2px solid ${COLORS.lineHi}`, boxShadow: '0 40px 120px rgba(0,0,0,0.7)'}}>
						<div style={{height: TAB_H, display: 'flex', alignItems: 'flex-end', gap: 4, padding: '0 14px', background: '#0D0D11', overflow: 'hidden'}}>
							{Array.from({length: tabs}).map((_, i) => (
								<div key={i} style={{flex: 1, minWidth: 0, height: 46, borderRadius: '12px 12px 0 0', background: i === tabs - 1 ? COLORS.surface : g(0.05), display: 'flex', alignItems: 'center', padding: '0 10px'}}>
									<div style={{width: '70%', height: 10, borderRadius: 5, background: g(i === tabs - 1 ? 0.35 : 0.14)}} />
								</div>
							))}
						</div>
						<div style={{position: 'absolute', left: 0, right: 0, top: TAB_H, bottom: 0}}>
							<Panel seed={idx + 1} />
						</div>
					</div>
					<svg width={48} height={48} viewBox="0 0 28 28" style={{position: 'absolute', left: cursor.x, top: cursor.y}}>
						<path d="M6 4 L6 22 L10.6 17.8 L13.6 24.4 L16.6 23.1 L13.7 16.7 L19.8 16.7 Z" fill="#F4F4F6" stroke="#050505" strokeWidth={1.4} />
					</svg>
				</div>
			)}

			{/* 0 pitches sent */}
			{f >= T.ZERO_IN && (
				<div style={{position: 'absolute', left: 0, right: 0, top: 440, textAlign: 'center', fontFamily: FONTS.sans, transform: `scaleY(${zeroOut}) scale(${lerp(1, 1.04, ramp(f, T.ZERO_IN, T.PAIN_END - T.ZERO_IN, EASE.linear))})`, transformOrigin: '50% 400px'}}>
					<div style={{display: 'flex', justifyContent: 'center', gap: 18, alignItems: 'baseline', fontFamily: FONTS.mono, fontSize: 34, letterSpacing: '0.06em', color: COLORS.textDim, marginBottom: 70, opacity: ramp(f, T.ZERO_IN, 10)}}>
						TABS OPENED
						<span style={{fontFamily: FONTS.sans, fontSize: 64, fontWeight: 650, letterSpacing: '-0.03em', color: COLORS.text, fontVariantNumeric: 'tabular-nums', minWidth: 80, textAlign: 'left'}}>
							{Math.round(lerp(23, 47, ramp(f, T.ZERO_IN, T.PAIN_END - T.ZERO_IN - 10, EASE.glide)))}
						</span>
					</div>
					<div style={{fontSize: 48, fontWeight: 560, letterSpacing: '-0.025em', color: COLORS.textDim, opacity: ramp(f, T.ZERO_IN, 10)}}>{COPY.zeroLabel}</div>
					<div
						style={{
							fontSize: 520,
							fontWeight: 700,
							letterSpacing: '-0.06em',
							lineHeight: 1,
							color: COLORS.text,
							marginTop: 10,
							opacity: ramp(f, T.ZERO_IN + 4, 10),
							transform: `scale(${lerp(1.18, 1, ramp(f, T.ZERO_IN + 4, 16, EASE.snap)) * lerp(1, 0.97, zeroT) + 0.03 * zeroT})`,
						}}
					>
						0
					</div>
				</div>
			)}
		</>
	);
};
