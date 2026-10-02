import React from 'react';
import {C, EASE, FONT, T, lerp, press, ramp, typed} from '../tokens';
import {Cursor} from '../kit/cursor';
import {Icon} from '../kit/icons';
import {Scan, SignalLine} from '../kit/signal';
import {Kinetic, Mono, caretOn} from '../kit/type';
import {Chip, GradBar, GradButton, LeadRow, Panel, SearchField} from '../kit/ui';
import {HERO, RANKED, RESULTS} from '../data';

/**
 * 6 · SEARCH → RESULTS → WHY. Real finder: city + industry → Search. The signal passes through the
 * results area; opportunities resolve, then rank themselves by score (FLIP). One is selected; the rest
 * retreat; "Why this lead is valuable" answers the only question that matters.
 */
const PX = 60;
const PY = 300;
const ROW0 = PY + 470; // first result row y
const ROWH = 148;

export const ROW_Y = (rank: number) => ROW0 + rank * ROWH;
export const HERO_CARD = {x: 90, y: 300, w: 900, h: 132}; // where the selected lead lives from here on

export const Search: React.FC<{f: number}> = ({f}) => {
	if (f < T.SEARCH_IN - 2 || f > T.DOSSIER_IN + 30) return null;
	const inP = ramp(f, T.SEARCH_IN, 26, EASE.FAST_LOCK);
	const city = typed(T.CITY, T.CITY_KEYS as unknown as number[], f);
	const niche = ramp(f, T.NICHE_PICK, 12, EASE.FAST_LOCK);
	const searching = ramp(f, T.SEARCH_CLICK, 30, EASE.SOFT);
	const cards = T.RESULT_CARDS as unknown as number[];
	const sort = ramp(f, T.RESULTS_SORT, 26, EASE.FAST_LOCK);
	const selected = ramp(f, T.LEAD_SELECT, 10, EASE.FAST_LOCK);
	const retreat = ramp(f, T.LEAD_SELECT + 2, 26, EASE.CAMERA);
	const heroMove = ramp(f, T.LEAD_SELECT + 4, 30, EASE.CAMERA);
	const whyIn = ramp(f, T.WHY_IN, 20, EASE.FAST_LOCK);
	const out = ramp(f, T.DOSSIER_IN, 18, EASE.EXIT);
	const found = Math.round(15 * ramp(f, cards[0], 40, EASE.SOFT));
	const heroIdxRank = RANKED.indexOf(HERO);
	const heroArrival = RESULTS.indexOf(HERO);
	const heroY = lerp(lerp(ROW_Y(heroArrival), ROW_Y(heroIdxRank), sort), HERO_CARD.y, heroMove);
	const heroX = lerp(PX + 30, HERO_CARD.x, heroMove);
	const heroW = lerp(900, HERO_CARD.w, heroMove);
	return (
		<div style={{position: 'absolute', inset: 0}}>
			{/* finder panel */}
			<div style={{position: 'absolute', inset: 0, opacity: inP * (1 - retreat), transform: `translateY(${(1 - inP) * 90 + retreat * 60}px)`, filter: retreat > 0.02 ? `blur(${retreat * 6}px)` : undefined}}>
				<Panel style={{left: PX, top: PY, width: 960, height: 1230}} />
				<div style={{position: 'absolute', left: PX + 30, top: PY + 30, width: 900}}>
					<SearchField text={city} caret={f < T.NICHE_PICK && caretOn(f, T.CITY_KEYS[9])} focus={1 - ramp(f, T.NICHE_PICK, 10)} right={<span style={{fontFamily: FONT.sans, fontSize: 24, fontWeight: 600, color: C.text3}}>Worldwide</span>} />
					<div style={{display: 'flex', gap: 14, marginTop: 22}}>
						{['Restaurants', 'Barbers', 'Gyms', 'Beauty salons'].map((n, i) => (
							<Chip key={n} tone={i === 0 && niche > 0.5 ? 'accent' : 'plain'} style={{transform: i === 0 ? `scale(${press(f, T.NICHE_PICK)})` : undefined}}>
								{i === 0 && niche > 0.5 && <Icon n="check" size={22} color={C.accentBright} sw={2.6} />}
								{n}
							</Chip>
						))}
					</div>
					<GradButton label={f >= T.SEARCH_CLICK && searching < 1 ? 'Searching…' : 'Search'} icon="search" style={{marginTop: 26, transform: `scale(${press(f, T.SEARCH_CLICK)})`}} />
					<GradBar p={searching} style={{marginTop: 30}} />
					<div style={{display: 'flex', justifyContent: 'space-between', marginTop: 22, opacity: ramp(f, cards[0], 10)}}>
						<Mono size={20} color={C.text2}>{found} businesses found</Mono>
						<Mono size={20} color={sort > 0.5 ? C.accentBright : C.text3}>{sort > 0.5 ? 'sorted by opportunity' : 'analyzing…'}</Mono>
					</div>
				</div>
				{/* signal passes through the results area */}
				<SignalLine d={`M ${PX - 40} ${ROW0 - 30} C 300 ${ROW0 + 120}, 800 ${ROW0 + 260}, ${PX + 1000} ${ROW0 + 760}`} f={f} start={T.RESULTS_SIGNAL} dur={34} tail={0.3} width={2.6} />
			</div>
			{/* result rows (the selected one stays and travels) */}
			{RESULTS.map((lead, i) => {
				const at = cards[i];
				if (f < at - 1) return null;
				const t = ramp(f, at, 18, EASE.FAST_LOCK);
				const rank = RANKED.indexOf(lead);
				const isHero = lead === HERO;
				const y = isHero ? heroY : lerp(ROW_Y(i), ROW_Y(rank), sort);
				const hover = isHero ? ramp(f, T.LEAD_HOVER, 8) : 0;
				const leave = isHero ? 0 : retreat;
				return (
					<div
						key={lead.name}
						style={{
							position: 'absolute',
							left: isHero ? heroX : PX + 30,
							top: y + (1 - t) * 40 + leave * 120 * (rank + 1) * 0.4,
							width: isHero ? heroW : 900,
							opacity: Math.min(1, t * 1.8) * (1 - leave) * (isHero ? 1 - out * 0 : 1),
							transform: `scale(${lerp(0.94, 1, t) * (isHero ? press(f, T.LEAD_SELECT) * lerp(1, 1.015, hover) : lerp(1, 0.94, leave))})`,
							filter: t < 1 ? `blur(${(1 - t) * 6}px)` : leave > 0.02 ? `blur(${leave * 8}px)` : undefined,
							zIndex: isHero ? 5 : 1,
						}}
					>
						<LeadRow lead={{...lead, score: lead.score * ramp(f, at + 4, 26, EASE.SOFT)}} selected={isHero ? Math.max(hover * 0.6, selected) : 0} />
					</div>
				);
			})}
			<Scan f={f} at={T.LEAD_SELECT + 32} dur={18} x={HERO_CARD.x} y={HERO_CARD.y} w={HERO_CARD.w} h={HERO_CARD.h} r={24} />
			{/* WHY THIS LEAD */}
			{f >= T.WHY_IN - 2 && (
				<div style={{position: 'absolute', left: 90, top: 470, width: 900, opacity: whyIn * (1 - out), transform: `translateY(${(1 - whyIn) * 40}px)`}}>
					<Panel style={{left: 0, top: 0, width: 900, height: 640, borderRadius: 30}} />
					<div style={{position: 'absolute', left: 44, top: 40, width: 812}}>
						<Kinetic f={f} inAt={T.WHY_IN + 2} text="Why this lead is valuable" size={46} weight={760} stagger={2} />
						{[
							{icon: 'message', k: 'Solid reputation', v: '312 reviews · ★ 4.8'},
							{icon: 'smartphone', k: 'Clear need', v: 'Site not mobile-optimised'},
							{icon: 'calendar', k: 'Customer lost here', v: 'Looks for booking → closes the tab'},
						].map((r, i) => {
							const at = (T.WHY_REASONS as unknown as number[])[i];
							const t = ramp(f, at, 16, EASE.FAST_LOCK);
							return (
								<div key={r.k} style={{display: 'flex', alignItems: 'center', gap: 24, marginTop: i === 0 ? 40 : 18, height: 116, borderRadius: 22, background: C.surface2, border: `1.5px solid ${C.lineStrong}`, padding: '0 28px', opacity: t, transform: `translateX(${(1 - t) * 50}px)`}}>
									<div style={{width: 64, height: 64, borderRadius: 16, background: C.accentSoft, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
										<Icon n={r.icon} size={32} color={C.accent} sw={2.2} />
									</div>
									<div>
										<div style={{fontFamily: FONT.sans, fontSize: 24, fontWeight: 600, color: C.text3}}>{r.k}</div>
										<div style={{fontFamily: FONT.sans, fontSize: 34, fontWeight: 700, color: C.text, letterSpacing: '-0.015em', marginTop: 4}}>{r.v}</div>
									</div>
								</div>
							);
						})}
						<div style={{display: 'flex', alignItems: 'center', gap: 14, marginTop: 30, opacity: ramp(f, T.WHY_READY - 10, 14)}}>
							<div style={{width: 18, height: 18, borderRadius: 9, background: '#22c55e', boxShadow: '0 0 14px rgba(34,197,94,0.6)'}} />
							<div style={{fontFamily: FONT.sans, fontSize: 30, fontWeight: 700, color: C.text}}>High confidence</div>
							<div style={{fontFamily: FONT.sans, fontSize: 28, fontWeight: 500, color: C.text2}}>· Strong need + solid reputation</div>
						</div>
					</div>
				</div>
			)}
			<Cursor
				f={f}
				show={[T.SEARCH_HOVER - 14, T.WHY_IN + 10]}
				keys={[
					[T.SEARCH_HOVER - 22, 980, 1560],
					[T.SEARCH_HOVER, 640, PY + 300],
					[T.SEARCH_CLICK, 620, PY + 290],
					[T.SEARCH_CLICK + 30, 940, 1500],
					[T.LEAD_HOVER, 700, ROW_Y(heroIdxRank) + 60],
					[T.LEAD_SELECT, 690, ROW_Y(heroIdxRank) + 62],
					[T.WHY_IN + 10, 980, 1600],
				]}
				clicks={[T.SEARCH_CLICK, T.LEAD_SELECT]}
			/>
		</div>
	);
};
