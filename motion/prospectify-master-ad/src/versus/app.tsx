import React from 'react';
import {Img, staticFile} from 'remotion';
import {C, EASE, clamp01, lerp, ramp} from '../final/tokens';
import {Icon, Star} from '../final/kit/icons';
import {Logo} from '../final/kit/ui';
import {photo} from '../final/kit/media';
import {GF} from './fx';

/**
 * Prospectify app — current design (prospectify.net, captured 2026-10-06): Geist type, #09090b surfaces,
 * pill buttons with the #ff3b5f→#f42562 gradient, 16 px cards, lead rows with score · photo · status ·
 * price range · phone, a lead panel with the business photo, Message / Website prompt tabs and
 * Friendly / Formal / Direct tones, "Mark as contacted". Businesses are fictional samples (DEMO DATA);
 * photos are CC0 stand-ins for the Google Maps photo the app shows.
 * Virtual canvas 1600×1000; the caller scales it.
 */
export const APP_W = 1600;
export const APP_H = 1000;

export type Lead = {name: string; niche: string; img: string; rating: number; reviews: number; score: number; status: string; price: string};
export const LEADS: Lead[] = [
	{name: 'Bella Forno', niche: 'Restaurant', img: 'pizza_4', rating: 4.8, reviews: 312, score: 94, status: 'No website', price: '$500–900'},
	{name: 'Maple Street Barbers', niche: 'Barber', img: 'barber_0', rating: 4.8, reviews: 212, score: 92, status: 'No website', price: '$400–750'},
	{name: 'Casa Verde Tacos', niche: 'Restaurant', img: 'tacos_0', rating: 4.6, reviews: 389, score: 88, status: 'Social media only', price: '$500–900'},
	{name: 'Juniper Café', niche: 'Café', img: 'cafe_1', rating: 4.7, reviews: 208, score: 86, status: 'No website', price: '$400–700'},
	{name: 'Eastside Nails Studio', niche: 'Nail salon', img: 'nails_1', rating: 4.5, reviews: 74, score: 81, status: 'No website', price: '$350–650'},
	{name: 'Southside Smokehouse', niche: 'Restaurant', img: 'bbq_0', rating: 4.5, reviews: 264, score: 77, status: 'Basic website', price: '$450–800'},
];

const pop = (t: number, px = 24): React.CSSProperties => ({opacity: clamp01(t * 1.4), transform: `translateY(${(1 - t) * px}px)`, filter: t < 1 ? `blur(${(1 - t) * 6}px)` : undefined});
export const PILL_GRAD = 'linear-gradient(180deg, #ff3b5f 0%, #f42562 100%)';

export const Pill: React.FC<{children: React.ReactNode; h?: number; fs?: number; sheen?: number; style?: React.CSSProperties}> = ({children, h = 44, fs = 16, sheen = -1, style}) => (
	<div style={{height: h, padding: `0 ${h * 0.55}px`, borderRadius: 980, background: PILL_GRAD, color: '#fff', fontFamily: GF, fontSize: fs, fontWeight: 600, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: h * 0.18, position: 'relative', overflow: 'hidden', boxShadow: `0 10px 30px rgba(${C.accentRGB},0.3), inset 0 1px 0 rgba(255,255,255,0.25)`, whiteSpace: 'nowrap', ...style}}>
		{sheen >= 0 && sheen <= 1 && <div style={{position: 'absolute', top: 0, bottom: 0, width: '60%', left: `${lerp(-60, 110, sheen)}%`, background: 'linear-gradient(105deg, rgba(255,255,255,0) 30%, rgba(255,255,255,0.3) 50%, rgba(255,255,255,0) 70%)'}} />}
		<span style={{position: 'relative', display: 'inline-flex', alignItems: 'center', gap: h * 0.18}}>{children}</span>
	</div>
);

const Badge: React.FC<{s: string}> = ({s}) => {
	const hot = s === 'No website' || s === 'Social media only';
	return <span style={{height: 26, padding: '0 10px', borderRadius: 7, display: 'inline-flex', alignItems: 'center', fontSize: 13.5, fontWeight: 500, background: hot ? 'rgba(244,37,98,0.13)' : 'rgba(255,255,255,0.06)', color: hot ? C.accentBright : C.text2, whiteSpace: 'nowrap'}}>{s}</span>;
};

const Thumb: React.FC<{img: string; size: number; r?: number}> = ({img, size, r = 10}) => (
	<div style={{width: size, height: size, borderRadius: r, overflow: 'hidden', flexShrink: 0, background: '#232328'}}>
		<Img src={photo(img)} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
	</div>
);

export const LeadRow: React.FC<{lead: Lead; t: number; sel: number; score: number}> = ({lead, t, sel, score}) => (
	<div style={{height: 82, display: 'flex', alignItems: 'center', gap: 16, padding: '0 22px', borderBottom: `1px solid ${C.line}`, background: sel > 0 ? `rgba(255,255,255,${0.035 * sel})` : 'transparent', boxShadow: sel > 0 ? `inset 3px 0 0 rgba(${C.accentRGB},${sel})` : undefined, ...pop(t, 16)}}>
		<div style={{width: 44, textAlign: 'center'}}>
			<div style={{fontSize: 22, fontWeight: 700, color: lead.score >= 85 ? C.accent : C.text, lineHeight: 1, fontVariantNumeric: 'tabular-nums'}}>{Math.round(score)}</div>
			<div style={{fontSize: 11, color: C.text3, marginTop: 3}}>score</div>
		</div>
		<Thumb img={lead.img} size={46} />
		<div style={{flex: 1, minWidth: 0}}>
			<div style={{fontSize: 18, fontWeight: 600, color: C.text, letterSpacing: '-0.01em', whiteSpace: 'nowrap'}}>{lead.name}</div>
			<div style={{display: 'flex', alignItems: 'center', gap: 5, marginTop: 4, fontSize: 14, color: C.text3, whiteSpace: 'nowrap'}}>
				{lead.niche} · Austin · <Star size={13} /> {lead.rating.toFixed(1)} ({lead.reviews})
			</div>
		</div>
		<Badge s={lead.status} />
		<div style={{width: 100, textAlign: 'right', fontSize: 15.5, fontWeight: 500, color: C.text2, fontVariantNumeric: 'tabular-nums'}}>{lead.price}</div>
		<Icon n="phone" size={18} color={C.text3} sw={1.8} />
	</div>
);

export const BUILDERS = [
	{n: 'Lovable', src: 'final/builders/lovable-logomark-color.svg', w: 30, h: 30},
	{n: 'Bolt', src: 'final/builders/bolt-wordmark-white.svg', w: 58, h: 17, word: true},
	{n: 'Base44', src: 'final/builders/base44-icon-site.png', w: 30, h: 30},
];

export const PROMPT =
	'Build a premium, mobile-first website for Bella Forno, a wood-fired Neapolitan pizzeria in East Austin (4.8★, 312 reviews, no website today). Mood: dark, warm, cinematic, ember-orange accents on charcoal. Hero: full-bleed photo of the oven, headline "Real fire. Real dough.", primary button "Book a table". Sections: signature pies with prices, a standout review, online booking with time slots, hours and map. Fast, accessible, SEO-ready.';

export const MESSAGES = {
	whatsapp: "Hi there!\n\nI found Bella Forno on Google Maps: 4.8 with 312 reviews, that's impressive!\n\nI build websites for local businesses. A site would help people searching for pizza in Austin find your menu, hours and booking.\n\nI can show you a quick example, no strings attached. Interested?",
	email: 'Subject: A website as good as your 312 reviews\n\nHi Bella Forno team,\n\nYour reviews are outstanding, but people who search for you can’t find a menu or book a table online.\n\nI build fast, mobile-first sites for local restaurants. Can I send you a 2-minute preview made for you?',
	phone: 'Call script\n\n“Hi, is this Bella Forno? I’m a local web designer. You have 312 great reviews on Google but no website, so people can’t see your menu or book online.\n\nI made a quick preview for you. Can I text it over?”',
};

type Keys = {
	searchKeys: number[];
	scan: number;
	rows: number[];
	select: number;
	panel: number;
	tab: [number, number, number]; // lead, message, prompt
	channel: [number, number, number]; // whatsapp, email, call
	copy: number;
	tool: number;
	promptType: [number, number];
	ready: number;
};

const CITY = 'Austin';

export const ProspectifyApp: React.FC<{f: number; k: Keys}> = ({f, k}) => {
	const typedN = k.searchKeys.filter((x) => x <= f).length;
	const scanP = ramp(f, k.scan, 22, EASE.SOFT);
	const sel = ramp(f, k.select, 12, EASE.FAST_LOCK);
	const panelT = ramp(f, k.panel, 20, EASE.FAST_LOCK);
	const tabIdx = k.tab.filter((x) => f >= x).length - 1;
	const chIdx = Math.max(0, k.channel.filter((x) => f >= x).length - 1);
	const chKey = (['whatsapp', 'email', 'phone'] as const)[chIdx];
	const chT = ramp(f, k.channel[chIdx], 34, EASE.SOFT);
	const copied = f >= k.copy;
	const promptN = Math.round(PROMPT.length * clamp01((f - k.promptType[0]) / Math.max(1, k.promptType[1] - k.promptType[0])));
	const lead = LEADS[0];
	const listW = lerp(1380, 830, panelT);
	return (
		<div style={{width: APP_W, height: APP_H, background: '#0a0a0c', fontFamily: GF, color: C.text, position: 'relative', overflow: 'hidden', display: 'flex'}}>
			{/* sidebar */}
			<div style={{width: 200, borderRight: `1px solid ${C.line}`, padding: '26px 14px', background: '#0c0c0f'}}>
				<div style={{display: 'flex', alignItems: 'center', gap: 10, padding: '0 8px'}}>
					<Logo size={22} />
					<span style={{fontSize: 16, fontWeight: 650, letterSpacing: '-0.02em'}}>Prospectify</span>
				</div>
				<div style={{marginTop: 34, display: 'flex', flexDirection: 'column', gap: 4}}>
					{[
						['layout', 'Home'],
						['search', 'Find'],
						['user', 'My leads'],
						['chart', 'Analytics'],
						['clipboard', 'Method'],
					].map(([ic, l], i) => (
						<div key={l} style={{height: 38, borderRadius: 10, display: 'flex', alignItems: 'center', gap: 11, padding: '0 10px', background: i === 1 ? 'rgba(255,255,255,0.06)' : 'transparent', color: i === 1 ? C.text : C.text2, fontSize: 15, fontWeight: 500}}>
							<Icon n={ic} size={17} color={i === 1 ? C.accent : C.text3} sw={1.8} />
							{l}
						</div>
					))}
				</div>
			</div>
			{/* main */}
			<div style={{position: 'relative', width: listW, borderRight: panelT > 0 ? `1px solid ${C.line}` : undefined}}>
				<div style={{padding: '26px 22px 0'}}>
					<div style={{display: 'flex', alignItems: 'center'}}>
						<div style={{fontSize: 24, fontWeight: 600, letterSpacing: '-0.03em'}}>Find clients</div>
						<div style={{flex: 1}} />
						<div style={{height: 26, padding: '0 10px', borderRadius: 7, border: `1px solid ${C.lineStrong}`, display: 'flex', alignItems: 'center', fontSize: 11.5, letterSpacing: '0.12em', color: C.text3, fontWeight: 600}}>SAMPLE DATA</div>
					</div>
					<div style={{marginTop: 18, display: 'flex', gap: 10}}>
						<div style={{flex: 1.1, height: 44, borderRadius: 12, background: '#111114', border: `1px solid ${typedN > 0 && scanP < 1 ? `rgba(${C.accentRGB},0.55)` : C.lineStrong}`, display: 'flex', alignItems: 'center', padding: '0 14px', fontSize: 16}}>
							{CITY.slice(0, typedN)}
							{typedN < CITY.length && f % 30 < 18 && <span style={{display: 'inline-block', width: 2, height: 20, marginLeft: 1, background: C.text}} />}
						</div>
						<div style={{flex: 1, height: 44, borderRadius: 12, background: '#111114', border: `1px solid ${C.lineStrong}`, display: 'flex', alignItems: 'center', padding: '0 14px', fontSize: 16, color: typedN >= CITY.length ? C.text : C.text3}}>
							{typedN >= CITY.length ? 'Restaurants' : 'All industries'}
							<div style={{flex: 1}} />
							<span style={{color: C.text3, fontSize: 12}}>⌄</span>
						</div>
						<Pill h={44} fs={16} style={{transform: `scale(${f >= k.scan && f < k.scan + 6 ? 0.95 : 1})`}}>
							<Icon n="search" size={16} color="#fff" sw={2.2} /> Search
						</Pill>
					</div>
					<div style={{marginTop: 14, height: 3, borderRadius: 2, background: 'rgba(255,255,255,0.04)', overflow: 'hidden'}}>
						<div style={{width: `${scanP * 100}%`, height: '100%', background: C.grad, boxShadow: `0 0 14px rgba(${C.accentRGB},0.7)`}} />
					</div>
					<div style={{marginTop: 14, display: 'flex', justifyContent: 'space-between', fontSize: 13.5, color: C.text3}}>
						<span>{scanP < 1 ? 'Scanning Google Maps…' : '15 businesses'}</span>
						<span>Highest score first</span>
					</div>
				</div>
				<div style={{marginTop: 10, borderTop: `1px solid ${C.line}`}}>
					{LEADS.map((l, i) => {
						const t = ramp(f, k.rows[i] ?? k.rows[k.rows.length - 1] + 5 * (i - k.rows.length + 1), 14, EASE.FAST_LOCK);
						const sc = l.score * ramp(f, k.rows[i] ?? 0, 24, EASE.SOFT);
						return <LeadRow key={l.name} lead={l} t={t} sel={i === 0 ? sel : 0} score={sc} />;
					})}
				</div>
			</div>
			{/* lead panel */}
			{panelT > 0 && (
				<div style={{flex: 1, position: 'relative', opacity: panelT, transform: `translateX(${(1 - panelT) * 80}px)`, display: 'flex', flexDirection: 'column'}}>
					<div style={{position: 'relative', height: 190, overflow: 'hidden'}}>
						<Img src={photo('pizza_4')} style={{width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${1.12 - 0.08 * ramp(f, k.panel, 120, EASE.SOFT)})`}} />
						<div style={{position: 'absolute', inset: 0, background: 'linear-gradient(0deg, #0a0a0c 0%, rgba(10,10,12,0.2) 60%, rgba(10,10,12,0.4) 100%)'}} />
						<div style={{position: 'absolute', right: 16, top: 14, fontSize: 11.5, color: 'rgba(255,255,255,0.6)'}}>Sample photo</div>
						<div style={{position: 'absolute', left: 22, right: 22, bottom: 10, display: 'flex', alignItems: 'flex-end'}}>
							<div style={{flex: 1}}>
								<div style={{fontSize: 24, fontWeight: 650, letterSpacing: '-0.03em'}}>{lead.name}</div>
								<div style={{fontSize: 14, color: C.text2, marginTop: 2}}>Restaurant / Pizzeria · Austin</div>
							</div>
							<div style={{textAlign: 'right'}}>
								<div style={{fontSize: 34, fontWeight: 650, color: C.accent, lineHeight: 1}}>{Math.round(94 * ramp(f, k.panel + 4, 26, EASE.SOFT))}</div>
								<div style={{fontSize: 12, color: C.text3}}>score</div>
							</div>
						</div>
					</div>
					<div style={{padding: '12px 22px 0', display: 'flex', gap: 7, flexWrap: 'wrap'}}>
						<Badge s="No website" />
						<span style={{height: 26, padding: '0 10px', borderRadius: 7, display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 13.5, background: 'rgba(255,255,255,0.06)', color: C.text2}}>
							<Star size={12} /> 4.8 · 312 reviews
						</span>
						<span style={{height: 26, padding: '0 10px', borderRadius: 7, display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 13.5, background: 'rgba(255,255,255,0.06)', color: C.text2}}>
							<Icon n="phone" size={12} color={C.text2} sw={2} /> Phone listed
						</span>
					</div>
					{/* tabs */}
					<div style={{margin: '14px 22px 0', display: 'flex', padding: 4, borderRadius: 980, background: '#111114', border: `1px solid ${C.line}`}}>
						{['Message', 'Website prompt'].map((t, i) => {
							const on = (tabIdx <= 1 && i === 0) || (tabIdx === 2 && i === 1);
							return (
								<div key={t} style={{flex: 1, height: 36, borderRadius: 980, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 550, background: on ? '#232328' : 'transparent', color: on ? C.text : C.text3}}>
									{t}
								</div>
							);
						})}
					</div>
					<div style={{position: 'relative', flex: 1, padding: '12px 22px 0'}}>
						{tabIdx <= 1 && (
							<div>
								<div style={{display: 'flex', alignItems: 'center', gap: 6}}>
									{['Friendly', 'Formal', 'Direct'].map((t, i) => (
										<span key={t} style={{height: 30, padding: '0 13px', borderRadius: 980, display: 'inline-flex', alignItems: 'center', fontSize: 14, border: `1px solid ${i === 0 ? 'rgba(255,255,255,0.28)' : C.line}`, color: i === 0 ? C.text : C.text3}}>
											{t}
										</span>
									))}
									<div style={{flex: 1}} />
									<span style={{height: 30, padding: '0 12px', borderRadius: 980, display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13.5, border: `1px solid ${copied ? 'rgba(52,211,153,0.5)' : C.line}`, color: copied ? '#34D399' : C.text2, transform: `scale(${f >= k.copy && f < k.copy + 8 ? 0.94 : 1})`}}>
										<Icon n={copied ? 'check' : 'copy'} size={13} color={copied ? '#34D399' : C.text2} sw={2.2} />
										{copied ? 'Copied' : 'Copy'}
									</span>
								</div>
								<div style={{marginTop: 10, display: 'flex', gap: 6}}>
									{[
										['message', 'WhatsApp'],
										['mail', 'Email'],
										['phone', 'Call script'],
										['repeat', 'Follow-up'],
									].map(([ic, l], i) => {
										const on = tabIdx === 1 && chIdx === i;
										return (
											<div key={l} style={{flex: 1, height: 34, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontSize: 13.5, fontWeight: 550, background: on ? 'rgba(244,37,98,0.13)' : 'transparent', border: `1px solid ${on ? `rgba(${C.accentRGB},0.6)` : C.line}`, color: on ? C.text : C.text3}}>
												<Icon n={ic} size={14} color={on ? C.accent : C.text3} sw={2} />
												{l}
											</div>
										);
									})}
								</div>
								<div style={{marginTop: 10, height: 300, borderRadius: 14, background: chKey === 'whatsapp' ? 'rgba(0,92,75,0.18)' : '#111114', border: `1px solid ${chKey === 'whatsapp' ? 'rgba(52,211,153,0.18)' : C.line}`, padding: '14px 16px', fontSize: 15.5, lineHeight: 1.5, color: C.text, whiteSpace: 'pre-wrap', overflow: 'hidden'}}>
									{tabIdx === 1 ? MESSAGES[chKey].slice(0, Math.round(MESSAGES[chKey].length * chT)) : <span style={{color: C.text3}}>Message for Bella Forno…</span>}
									{tabIdx === 1 && chT < 1 && <span style={{display: 'inline-block', width: 2, height: 17, background: C.accent, marginLeft: 2, verticalAlign: 'middle'}} />}
								</div>
							</div>
						)}
						{tabIdx === 2 && (
							<div style={pop(ramp(f, k.tab[2], 12, EASE.FAST_LOCK), 14)}>
								<div style={{fontSize: 13.5, color: C.text3}}>Your AI builder</div>
								<div style={{marginTop: 8, display: 'flex', gap: 6}}>
									{BUILDERS.map((b, i) => {
										const on = f >= k.tool && i === 0;
										return (
											<div key={b.n} style={{flex: 1, height: 42, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: on ? 'rgba(244,37,98,0.13)' : '#111114', border: `1px solid ${on ? `rgba(${C.accentRGB},0.6)` : C.line}`}}>
												<Img src={staticFile(b.src)} style={{width: b.w * 0.75, height: b.h * 0.75}} />
												{!b.word && <span style={{fontSize: 14.5, fontWeight: 550}}>{b.n}</span>}
											</div>
										);
									})}
								</div>
								<div style={{marginTop: 10, height: 304, borderRadius: 14, background: '#111114', border: `1px solid ${C.line}`, padding: '14px 16px', fontFamily: '"GeistMono", ui-monospace, monospace', fontSize: 13.6, lineHeight: 1.55, color: '#d8d8e0', overflow: 'hidden'}}>
									{PROMPT.slice(0, promptN)}
									{promptN < PROMPT.length && <span style={{display: 'inline-block', width: 8, height: 15, background: C.accent, marginLeft: 2, verticalAlign: 'middle'}} />}
								</div>
								<div style={{marginTop: 8, display: 'flex', alignItems: 'center', fontSize: 13, color: f >= k.ready ? '#34D399' : C.text3, fontWeight: 550}}>{f >= k.ready ? '✓ Ready to paste · Optimised for Lovable' : `${promptN} characters`}</div>
							</div>
						)}
					</div>
					<div style={{padding: '0 22px 22px'}}>
						<Pill h={46} fs={16} style={{width: '100%'}}>Mark as contacted</Pill>
					</div>
				</div>
			)}
		</div>
	);
};
