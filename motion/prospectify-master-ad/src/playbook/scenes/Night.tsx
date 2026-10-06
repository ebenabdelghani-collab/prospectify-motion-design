import React from 'react';
import {C, EASE, FONT, clamp01, lerp, press, rand, ramp, typed} from '../../final/tokens';
import {Icon, Star} from '../../final/kit/icons';
import {BIZ_PHOTOS, Photo} from '../../final/kit/media';
import {BELLA, BELLA_THEME, BrowserFrame, SITE_H, SITE_W, Website} from '../../final/kit/website';
import {Big, Chroma, H, Letters, NightBG, P, Splat, TabChip, W, clockText, DAY} from '../fx';

/**
 * ACT 1 — NIGHT. 11:46 PM. Building took 40 minutes; finding a buyer takes 14 tabs.
 * The businesses are over here, over there, everywhere. A liquid splat turns night into day.
 */
const TABS: [string, string][] = [
	['Maps – restaurants near me', '#34a853'], ['Bella Forno – Reviews (312)', '#fbbc04'], ['@bellaforno.atx', '#e1306c'], ['who owns bella forno?', '#4285f4'],
	['bella forno email contact', '#4285f4'], ['prospects_v3.xlsx', '#188038'], ['Yelp – Bella Forno', '#d32323'], ['Bella Forno | Home (2017)', '#a8744f'],
	['Maps – barbers near me', '#34a853'], ['Lumen Nails – Reviews (6)', '#fbbc04'], ['LinkedIn – results', '#0a66c2'], ['Inbox (23)', '#ea4335'],
	['Facebook – Page', '#1877f2'], ['Sheet2', '#188038'],
];
const TAB_POS = TABS.map((_, i) => ({x: 120 + rand(i * 3.3) * 1300, y: 90 + rand(i * 7.1) * 860, z: -200 - rand(i * 1.9) * 700, r: (rand(i * 5.5) - 0.5) * 14}));
const CARDS = [
	{n: 'Bella Forno Trattoria', k: 'Italian · 4.8 (312)', p: 'pizza_4'}, {n: 'Taquería El Sol', k: 'Mexican · 4.7 (186)', p: 'tacos_0'}, {n: 'Juniper Café', k: 'Café · 4.5 (98)', p: 'cafe_1'},
	{n: 'Lumen Nail Studio', k: 'Nails · 4.2 (6)', p: 'nails_1'}, {n: 'Kinfolk Barbers', k: 'Barber · 4.6 (54)', p: 'barber_0'}, {n: 'Southside Smokehouse', k: 'BBQ · 4.6 (241)', p: 'bbq_0'},
	{n: 'Petal & Stem', k: 'Florist · 4.9 (128)', p: 'florist_0'}, {n: 'Noodle Theory', k: 'Ramen · 4.4 (77)', p: 'noodles_0'}, {n: 'Sunny Side', k: 'Brunch · 4.5 (143)', p: 'brunch_1'},
	{n: 'Velvet Room', k: 'Bar · 4.3 (121)', p: 'bar_4'}, {n: 'Green Bowl', k: 'Salads · 4.4 (65)', p: 'salad_2'}, {n: 'Ember Coffee', k: 'Café · 4.6 (88)', p: 'cafe_2'},
	{n: 'Casa Verde', k: 'Italian · 4.5 (204)', p: 'pasta_5'}, {n: 'Oak & Iron', k: 'Barber · 4.7 (61)', p: 'barber_2'}, {n: 'Dolce Vita', k: 'Desserts · 4.8 (97)', p: 'tiramisu_5'},
	{n: 'Fire & Slice', k: 'Pizza · 4.6 (156)', p: 'oven_2'}, {n: 'Bloom Florals', k: 'Florist · 4.7 (44)', p: 'florist_3'}, {n: 'Ramen Ya', k: 'Ramen · 4.5 (120)', p: 'noodles_5'},
];

export const BizCard: React.FC<{c: (typeof CARDS)[number]; w?: number; style?: React.CSSProperties}> = ({c, w = 300, style}) => (
	<div style={{width: w, borderRadius: 18, overflow: 'hidden', background: 'rgba(30,27,40,0.96)', border: '1px solid rgba(255,255,255,0.14)', boxShadow: '0 24px 60px rgba(0,0,0,0.55)', ...style}}>
		<Photo n={c.p} w={w} h={w * 0.52} />
		<div style={{padding: `${w * 0.045}px ${w * 0.055}px ${w * 0.05}px`}}>
			<div style={{fontFamily: FONT.sans, fontSize: w * 0.064, fontWeight: 700, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden'}}>{c.n}</div>
			<div style={{display: 'flex', alignItems: 'center', gap: 6, marginTop: 4, fontFamily: FONT.sans, fontSize: w * 0.048, color: 'rgba(255,255,255,0.6)'}}>
				<Star size={w * 0.05} /> {c.k}
			</div>
		</div>
	</div>
);

export const Night: React.FC<{f: number}> = ({f}) => {
	if (f > P.SPLAT + 40) return null;
	// ── clock ──
	const mins = 23 * 60 + 46 + (f >= P.MINUTE_FLIP ? 1 : 0) + (f >= P.SEARCH_IN ? 1 : 0) + (f >= P.TABS_IN ? 1 : 0);
	const ck = clockText(mins);
	const toCorner = ramp(f, P.BUILD_IN, 26, EASE.CAMERA);
	const clockIn = ramp(f, P.CLOCK_IN, 18, EASE.FAST_LOCK);
	// ── build ──
	const buildIn = ramp(f, P.BUILD_IN + 4, 24, EASE.FAST_LOCK);
	const buildOut = ramp(f, P.SEARCH_IN, 20, EASE.EXIT);
	const steps = P.BUILD_STEPS as unknown as number[];
	// ── search ──
	const searchIn = ramp(f, P.SEARCH_IN + 6, 20, EASE.FAST_LOCK);
	const searchOut = ramp(f, P.SEARCH_BURST, 18, EASE.EXIT);
	// ── tabs ──
	const tabSteps = P.TAB_STEPS as unknown as number[];
	const tabIdx = tabSteps.filter((s) => f >= s).length - 1;
	const counts = [5, 9, 13, 14];
	const tabsOut = ramp(f, P.TABS_OUT, 18, EASE.EXIT);
	const shown = tabIdx >= 0 ? counts[tabIdx] : 0;
	// ── here / there / everywhere ──
	const hereT = ramp(f, P.HERE_IN, 16, EASE.FAST_LOCK);
	const thereT = ramp(f, P.THERE_IN, 16, EASE.FAST_LOCK);
	const everyT = ramp(f, P.EVERY_IN, 18, EASE.FAST_LOCK);
	const spin = (f - P.EVERY_IN) * 0.012 + 4 * (1 - EASE.UI(clamp01((f - P.EVERY_IN) / 50)));
	const cam = 1 + 0.04 * ramp(f, 0, P.SPLAT, EASE.SOFT);
	return (
		<div style={{position: 'absolute', inset: 0}}>
			<NightBG f={f} />
			<div style={{position: 'absolute', inset: 0, transform: `scale(${cam})`, transformOrigin: '50% 50%'}}>
				{/* CLOCK — big, then parks top-left */}
				<div
					style={{
						position: 'absolute',
						left: lerp(W / 2, 150, toCorner),
						top: lerp(H / 2 - 40, 84, toCorner),
						transform: `translate(${lerp(-50, 0, toCorner)}%, -50%) scale(${lerp(1, 0.22, toCorner) * lerp(0.94, 1, clockIn)})`,
						transformOrigin: '0% 50%',
						opacity: clockIn * (1 - ramp(f, P.SPLAT, 10)),
						textAlign: 'center',
					}}
				>
					<div style={{fontFamily: FONT.sans, fontSize: 30, fontWeight: 600, color: 'rgba(255,255,255,0.65)', marginBottom: 8, opacity: 1 - toCorner}}>Wednesday, October 1</div>
					<Chroma f={f} hits={[...(P.CLOCK_GLITCH as unknown as number[]), P.MINUTE_FLIP, P.SEARCH_IN, P.TABS_IN]}>
						<div style={{display: 'flex', alignItems: 'baseline', justifyContent: 'center', fontFamily: FONT.sans, fontWeight: 800, letterSpacing: '-0.06em', color: '#fff', textShadow: '0 0 60px rgba(255,255,255,0.15)'}}>
							<span style={{fontSize: 300, fontVariantNumeric: 'tabular-nums'}}>{ck.hm}</span>
							<span style={{fontSize: 90, color: C.accent, marginLeft: 14, letterSpacing: '-0.02em'}}>{ck.ap}</span>
						</div>
					</Chroma>
				</div>
				{/* BUILD — the easy part: 40 minutes */}
				{buildIn > 0 && buildOut < 1 && (
					<div style={{position: 'absolute', inset: 0, opacity: buildIn * (1 - buildOut), transform: `translateX(${-buildOut * 600}px)`, filter: buildOut > 0.02 ? `blur(${buildOut * 14}px)` : undefined}}>
						<div style={{position: 'absolute', left: W / 2 - 560, top: 150, width: 1120, height: 84, borderRadius: 42, background: 'rgba(36,32,48,0.95)', border: '1px solid rgba(255,255,255,0.14)', display: 'flex', alignItems: 'center', gap: 18, padding: '0 34px', fontFamily: FONT.sans, fontSize: 32, color: '#fff'}}>
							<Icon n="sparkles" size={30} color={C.accent} />
							{typed(P.PROMPT, P.BUILD_KEYS as unknown as number[], f)}
							<span style={{display: 'inline-block', width: 3, height: 34, background: '#fff', opacity: Math.floor(f / 15) % 2}} />
						</div>
						<div style={{position: 'absolute', left: W / 2 - (SITE_W * 0.66) / 2, top: 270, width: SITE_W, height: SITE_H + 58, transform: `scale(0.66) perspective(2000px) rotateX(${lerp(14, 4, buildIn)}deg)`, transformOrigin: '0 0'}}>
							<BrowserFrame w={SITE_W} h={SITE_H + 58} url="bellaforno-austin.com" style={{left: 0, top: 0}}>
								<Website f={f} steps={steps} theme={BELLA_THEME} c={BELLA} />
							</BrowserFrame>
						</div>
						<div style={{position: 'absolute', left: W / 2 + 340, top: 330, transform: `scale(${press(f, P.BUILD_DONE) * ramp(f, P.BUILD_DONE, 12, EASE.OVERSHOOT)}) rotate(-6deg)`, padding: '14px 26px', borderRadius: 16, background: C.accent, fontFamily: FONT.sans, fontSize: 40, fontWeight: 800, color: '#fff', boxShadow: '0 20px 50px rgba(244,37,98,0.45)'}}>40 min ✓</div>
					</div>
				)}
				{/* SEARCH — the hard part */}
				{searchIn > 0 && f < P.SEARCH_BURST + 50 && (
					<div style={{position: 'absolute', left: W / 2 - 620, top: H / 2 - 60, width: 1240, height: 120, opacity: searchIn}}>
						<div style={{position: 'absolute', inset: 0, borderRadius: 60, background: 'rgba(36,32,48,0.95)', border: '1px solid rgba(255,255,255,0.16)', boxShadow: '0 30px 80px rgba(0,0,0,0.6)', opacity: 1 - searchOut, transform: `scaleX(${lerp(0.9, 1, searchIn)})`}} />
						<div style={{position: 'absolute', left: 44, top: 0, height: 120, display: 'flex', alignItems: 'center', gap: 22}}>
							<div style={{opacity: 1 - searchOut}}>
								<Icon n="search" size={42} color="rgba(255,255,255,0.7)" />
							</div>
							{f < P.SEARCH_BURST ? (
								<div style={{fontFamily: FONT.sans, fontSize: 50, fontWeight: 600, color: '#fff', letterSpacing: '-0.02em', whiteSpace: 'pre'}}>
									{typed(P.QUERY, P.SEARCH_KEYS as unknown as number[], f)}
									<span style={{display: 'inline-block', width: 4, height: 54, marginLeft: 4, background: C.accent, verticalAlign: 'middle'}} />
								</div>
							) : (
								<Letters f={f} inAt={-100} text={P.QUERY} size={50} weight={600} outAt={P.SEARCH_BURST} explode stagger={0} style={{letterSpacing: '-0.02em'}} />
							)}
						</div>
					</div>
				)}
				{/* 14 TABS */}
				{tabIdx >= 0 && tabsOut < 1 && (
					<div style={{position: 'absolute', inset: 0, perspective: 1600, opacity: 1 - tabsOut}}>
						{TABS.slice(0, shown).map(([label, dot], i) => {
							const p = TAB_POS[i];
							const born = tabSteps[Math.min(3, [5, 9, 13, 14].findIndex((c) => i < c))];
							const t = ramp(f, born + (i % 5) * 2, 20, EASE.FAST_LOCK);
							const drift = Math.sin((f + i * 30) / 50) * 12;
							return (
								<div key={label} style={{position: 'absolute', left: p.x, top: p.y + drift, transform: `translate3d(0, 0, ${lerp(900, p.z, t) + tabsOut * 800}px) rotate(${p.r}deg)`, opacity: Math.min(1, t * 2), filter: `blur(${Math.max(0, (-p.z - 400) / 160) + (1 - t) * 8}px)`}}>
									<TabChip label={label} dot={dot} scale={1.6} />
								</div>
							);
						})}
						<div style={{position: 'absolute', left: 0, right: 0, top: H / 2 - 150, display: 'flex', justifyContent: 'center'}}>
							<Chroma f={f} hits={tabSteps}>
								<div style={{display: 'flex', alignItems: 'baseline', gap: 30, fontFamily: FONT.sans, fontWeight: 800, letterSpacing: '-0.06em'}}>
									<span style={{fontSize: 300, color: C.accent, fontVariantNumeric: 'tabular-nums'}}>{shown}</span>
									<span style={{fontSize: 300, color: '#fff', opacity: ramp(f, tabSteps[3] - 2, 8)}}>TABS.</span>
								</div>
							</Chroma>
						</div>
					</div>
				)}
				{/* over here. */}
				{hereT > 0 && f < P.EVERY_IN + 4 && (
					<div style={{position: 'absolute', left: 170, top: 150, opacity: 1 - ramp(f, P.EVERY_IN - 4, 8)}}>
						<Big text="over" accent="here." size={130} style={{opacity: hereT, transform: `translateY(${(1 - hereT) * 40}px)`}} />
						<div style={{display: 'flex', gap: 26, marginTop: 40}}>
							{CARDS.slice(0, 2).map((c, i) => (
								<BizCard key={c.n} c={c} w={330} style={{opacity: ramp(f, P.HERE_IN + 4 + i * 4, 14), transform: `translateY(${(1 - ramp(f, P.HERE_IN + 4 + i * 4, 18, EASE.FAST_LOCK)) * 80}px) rotate(${i ? 3 : -2}deg)`}} />
							))}
						</div>
					</div>
				)}
				{/* over there. */}
				{thereT > 0 && f < P.EVERY_IN + 4 && (
					<div style={{position: 'absolute', right: 170, bottom: 120, textAlign: 'right', opacity: 1 - ramp(f, P.EVERY_IN - 4, 8)}}>
						<div style={{display: 'flex', gap: 26, marginBottom: 40, justifyContent: 'flex-end'}}>
							{CARDS.slice(2, 4).map((c, i) => (
								<BizCard key={c.n} c={c} w={300} style={{opacity: ramp(f, P.THERE_IN + 2 + i * 4, 14), transform: `translateY(${(1 - ramp(f, P.THERE_IN + 2 + i * 4, 18, EASE.FAST_LOCK)) * -80}px) rotate(${i ? -3 : 2}deg)`}} />
							))}
						</div>
						<Big text="over" accent="there." size={130} style={{opacity: thereT, transform: `translateY(${(1 - thereT) * 40}px)`}} />
					</div>
				)}
				{/* everywhere. — a 3D ring of real businesses */}
				{everyT > 0 && (
					<div style={{position: 'absolute', inset: 0, perspective: 1800}}>
						{CARDS.map((c, i) => {
							const a = (i / CARDS.length) * Math.PI * 2 + spin;
							const z = Math.sin(a);
							const x = W / 2 + Math.cos(a) * 760 * lerp(0.4, 1, everyT);
							const y = H / 2 + Math.sin(a) * 300 * lerp(0.4, 1, everyT) - 20;
							const s = lerp(0.62, 1.05, (z + 1) / 2);
							return (
								<div key={c.n} style={{position: 'absolute', left: x - 120, top: y - 100, zIndex: Math.round(z * 100) + 100, transform: `scale(${s}) rotateY(${-Math.cos(a) * 28}deg)`, opacity: everyT * lerp(0.35, 1, (z + 1) / 2), filter: z < 0 ? `blur(${-z * 3}px)` : undefined}}>
									<BizCard c={c} w={240} />
								</div>
							);
						})}
						<div style={{position: 'absolute', left: 0, right: 0, top: H / 2 - 90, display: 'flex', justifyContent: 'center', zIndex: 150}}>
							<Chroma f={f} hits={[P.EVERY_IN]}>
								<Letters f={f} inAt={P.EVERY_IN} text="everywhere." size={190} stagger={1.2} style={{textShadow: '0 10px 60px rgba(0,0,0,0.6)'}} />
							</Chroma>
						</div>
					</div>
				)}
			</div>
			<Splat f={f} at={P.SPLAT} color={DAY} />
		</div>
	);
};
