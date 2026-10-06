import React from 'react';
import {Img, staticFile} from 'remotion';
import {C, EASE, FONT, clamp01, lerp, ramp} from '../final/tokens';
import {Icon, Star} from '../final/kit/icons';
import {Logo} from '../final/kit/ui';

/**
 * Prospectify app, 16:9 desktop. Rebuilt from the production tokens + production UI strings
 * (motion-source/research/app-ui-strings-en.txt). All businesses are DEMO DATA.
 * Virtual canvas 1600×1000; the caller scales it.
 */
export const APP_W = 1600;
export const APP_H = 1000;

export type Lead = {name: string; icon: string; area: string; rating: number; reviews: number; score: number; tag: string};
export const LEADS: Lead[] = [
	{name: 'Bella Forno', icon: 'utensils', area: 'East Austin', rating: 4.8, reviews: 312, score: 94, tag: 'No website'},
	{name: 'Juniper Café', icon: 'coffee', area: 'Clarksville', rating: 4.7, reviews: 208, score: 91, tag: 'Social media only'},
	{name: 'El Sol Taquería', icon: 'utensils', area: 'Holly', rating: 4.6, reviews: 189, score: 88, tag: 'No website'},
	{name: 'Kinfolk Barbers', icon: 'scissors', area: 'Cherrywood', rating: 4.9, reviews: 143, score: 86, tag: 'Weak site'},
	{name: 'Southside Smokehouse', icon: 'utensils', area: 'Bouldin', rating: 4.5, reviews: 264, score: 83, tag: 'Social media only'},
];

const surf = {background: C.surface2, border: `1.5px solid ${C.lineStrong}`};
const pop = (t: number, px = 24): React.CSSProperties => ({opacity: clamp01(t * 1.4), transform: `translateY(${(1 - t) * px}px) scale(${lerp(0.97, 1, t)})`, filter: t < 1 ? `blur(${(1 - t) * 6}px)` : undefined});

export const ScoreRing: React.FC<{score: number; size: number; t?: number}> = ({score, size, t = 1}) => {
	const r = size * 0.42;
	const c = 2 * Math.PI * r;
	return (
		<div style={{width: size, height: size, position: 'relative', flexShrink: 0}}>
			<svg width={size} height={size} style={{position: 'absolute', inset: 0, transform: 'rotate(-90deg)'}}>
				<circle cx={size / 2} cy={size / 2} r={r} stroke="rgba(255,255,255,0.08)" strokeWidth={size * 0.075} fill="none" />
				<defs>
					<linearGradient id={`rg${size}`} x1="0" y1="0" x2="1" y2="1">
						<stop offset="0%" stopColor="#f42562" />
						<stop offset="100%" stopColor="#ff5a45" />
					</linearGradient>
				</defs>
				<circle cx={size / 2} cy={size / 2} r={r} stroke={`url(#rg${size})`} strokeWidth={size * 0.075} fill="none" strokeLinecap="round" strokeDasharray={`${c * (score / 100) * t} ${c}`} />
			</svg>
			<div style={{position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: FONT.sans}}>
				<div style={{fontSize: size * 0.34, fontWeight: 800, color: C.text, letterSpacing: '-0.03em', lineHeight: 1}}>{Math.round(score * t)}</div>
				<div style={{fontSize: size * 0.13, fontWeight: 600, color: C.text3}}>/100</div>
			</div>
		</div>
	);
};

const Tag: React.FC<{children: React.ReactNode; hot?: boolean}> = ({children, hot}) => (
	<span style={{height: 30, padding: '0 11px', borderRadius: 8, display: 'inline-flex', alignItems: 'center', fontSize: 15, fontWeight: 700, background: hot ? C.accentSoft : 'rgba(255,255,255,0.05)', border: `1px solid ${hot ? `rgba(${C.accentRGB},0.35)` : C.lineStrong}`, color: hot ? C.accentBright : C.text2}}>
		{children}
	</span>
);

export const LeadRow: React.FC<{lead: Lead; t: number; sel: number; score: number}> = ({lead, t, sel, score}) => (
	<div
		style={{
			height: 104,
			borderRadius: 20,
			display: 'flex',
			alignItems: 'center',
			gap: 20,
			padding: '0 20px',
			background: sel > 0 ? `linear-gradient(180deg, rgba(${C.accentRGB},${0.14 * sel}), rgba(${C.accentRGB},${0.03 * sel})), ${C.surface2}` : C.surface2,
			border: `1.5px solid ${sel > 0 ? `rgba(${C.accentRGB},${0.2 + 0.4 * sel})` : C.lineStrong}`,
			boxShadow: sel > 0 ? `0 0 ${40 * sel}px rgba(${C.accentRGB},${0.18 * sel})` : undefined,
			...pop(t),
		}}
	>
		<div style={{width: 64, height: 64, borderRadius: 16, background: C.surface3, border: `1.5px solid ${C.lineStrong}`, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
			<Icon n={lead.icon} size={30} color={C.accent} sw={2.2} />
		</div>
		<div style={{flex: 1, minWidth: 0}}>
			<div style={{fontSize: 27, fontWeight: 750, color: C.text, letterSpacing: '-0.02em'}}>{lead.name}</div>
			<div style={{display: 'flex', alignItems: 'center', gap: 8, marginTop: 6, fontSize: 18, fontWeight: 550, color: C.text3}}>
				<Icon n="pin" size={18} color={C.text3} sw={2} /> {lead.area} · <Star size={17} /> {lead.rating.toFixed(1)} · {lead.reviews} reviews
				<span style={{marginLeft: 8}}>
					<Tag hot={lead.tag === 'No website'}>{lead.tag}</Tag>
				</span>
			</div>
		</div>
		<div style={{width: 84, height: 74, borderRadius: 14, background: '#0f0f12', border: `1.5px solid ${C.lineStrong}`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
			<div style={{fontSize: 32, fontWeight: 800, color: C.accent, lineHeight: 1}}>{Math.round(score)}</div>
			<div style={{fontSize: 15, fontWeight: 600, color: C.text3, marginTop: 2}}>/100</div>
		</div>
	</div>
);

export const BUILDERS = [
	{n: 'Lovable', src: 'final/builders/lovable-logomark-color.svg', w: 30, h: 30},
	{n: 'Bolt', src: 'final/builders/bolt-wordmark-white.svg', w: 58, h: 17, word: true},
	{n: 'Base44', src: 'final/builders/base44-icon-site.png', w: 30, h: 30},
];

export const PROMPT =
	'Build a premium, mobile-first website for Bella Forno — a wood-fired Neapolitan pizzeria in East Austin (4.8★, 312 reviews, no website today). Mood: dark, warm, cinematic; ember-orange accents on charcoal. Hero: full-bleed photo of the oven, headline "Real fire. Real dough.", primary CTA "Book a table". Sections: signature pies with prices, a standout review, online booking with time slots, hours and map. Fast, accessible, SEO-ready.';

export const MESSAGES = {
	whatsapp: "Hi Bella Forno team! 312 reviews at 4.8★ — seriously impressive. I noticed there's no website yet, so people searching for you can't see the menu or book a table. I build fast, mobile-first restaurant sites. Want me to send you a quick preview?",
	email: 'Subject: A website as good as your 312 reviews\n\nHi Bella Forno team,\nYour reviews are outstanding, but there is no website to send that traffic to — no menu, no booking. I design premium restaurant sites. Can I send a 2-minute preview built for you?',
	phone: '“Hi, is this Bella Forno? I’m a local web designer. You have 312 great reviews but no website — people can’t book online. I made a quick preview for you. Can I text it over?”',
};

type Keys = {
	searchKeys: number[];
	scan: number;
	rows: number[];
	select: number;
	panel: number;
	tab: [number, number, number]; // analysis, outreach, prompt
	channel: [number, number, number]; // whatsapp, email, phone
	copy: number;
	tool: number;
	promptType: [number, number];
	ready: number;
};

const QUERY = 'Restaurants · Austin, TX';

export const ProspectifyApp: React.FC<{f: number; k: Keys}> = ({f, k}) => {
	const typedN = k.searchKeys.filter((x) => x <= f).length;
	const scanP = ramp(f, k.scan, 26, EASE.SOFT);
	const sel = ramp(f, k.select, 12, EASE.FAST_LOCK);
	const panelT = ramp(f, k.panel, 20, EASE.FAST_LOCK);
	const tabIdx = k.tab.filter((x) => f >= x).length - 1;
	const chIdx = k.channel.filter((x) => f >= x).length - 1;
	const chKey = (['whatsapp', 'email', 'phone'] as const)[Math.max(0, chIdx)];
	const chT = ramp(f, k.channel[Math.max(0, chIdx)], 30, EASE.SOFT);
	const copied = f >= k.copy;
	const promptN = Math.round(PROMPT.length * clamp01((f - k.promptType[0]) / Math.max(1, k.promptType[1] - k.promptType[0])));
	const listW = lerp(1380, 700, panelT);
	return (
		<div style={{width: APP_W, height: APP_H, background: C.bg, fontFamily: FONT.sans, color: C.text, position: 'relative', overflow: 'hidden', display: 'flex'}}>
			{/* sidebar */}
			<div style={{width: 92, borderRight: `1px solid ${C.line}`, display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 30, gap: 30}}>
				<Logo size={40} />
				{['search', 'user', 'clipboard', 'chart'].map((n, i) => (
					<div key={n} style={{width: 52, height: 52, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', background: i === 0 ? C.accentSoft : 'transparent'}}>
						<Icon n={n} size={24} color={i === 0 ? C.accent : C.text3} sw={2} />
					</div>
				))}
			</div>
			<div style={{flex: 1, position: 'relative', padding: '34px 40px'}}>
				{/* header */}
				<div style={{display: 'flex', alignItems: 'center', gap: 16}}>
					<div style={{fontSize: 34, fontWeight: 800, letterSpacing: '-0.03em'}}>Find leads</div>
					<div style={{flex: 1}} />
					<div style={{height: 34, padding: '0 12px', borderRadius: 8, border: `1px solid ${C.lineStrong}`, display: 'flex', alignItems: 'center', fontFamily: FONT.mono, fontSize: 14, letterSpacing: '0.14em', color: C.text3}}>DEMO DATA</div>
				</div>
				{/* search */}
				<div style={{marginTop: 22, width: listW, height: 80, borderRadius: 20, ...surf, border: `1.5px solid rgba(${C.accentRGB},${typedN > 0 && scanP < 1 ? 0.5 : 0.15})`, display: 'flex', alignItems: 'center', gap: 18, padding: '0 24px'}}>
					<Icon n="search" size={30} color={C.accent} sw={2.4} />
					<div style={{fontSize: 30, fontWeight: 600, whiteSpace: 'nowrap'}}>
						{QUERY.slice(0, typedN)}
						{typedN < QUERY.length && f % 30 < 18 && <span style={{display: 'inline-block', width: 3, height: 32, marginLeft: 2, background: C.text, verticalAlign: 'middle'}} />}
					</div>
					<div style={{flex: 1}} />
					<Tag hot>No website</Tag>
					<div style={{height: 52, padding: '0 22px', borderRadius: 14, background: C.grad, display: 'flex', alignItems: 'center', fontSize: 20, fontWeight: 750, whiteSpace: 'nowrap'}}>Find leads →</div>
				</div>
				<div style={{marginTop: 14, width: listW, height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.05)', overflow: 'hidden'}}>
					<div style={{width: `${scanP * 100}%`, height: '100%', background: C.grad, boxShadow: `0 0 18px rgba(${C.accentRGB},0.7)`}} />
				</div>
				<div style={{marginTop: 14, display: 'flex', justifyContent: 'space-between', width: listW, fontSize: 17, fontWeight: 600, color: C.text3}}>
					<span>{scanP < 1 ? 'Scanning the area…' : `${LEADS.length} new leads · Sorted by score`}</span>
					<span>Leads / search · 15</span>
				</div>
				{/* rows */}
				<div style={{marginTop: 18, width: listW, display: 'flex', flexDirection: 'column', gap: 14}}>
					{LEADS.map((l, i) => {
						const t = ramp(f, k.rows[i], 14, EASE.FAST_LOCK);
						const sc = l.score * ramp(f, k.rows[i], 26, EASE.SOFT);
						return <LeadRow key={l.name} lead={l} t={t} sel={i === 0 ? sel : 0} score={sc} />;
					})}
				</div>
				{/* opportunity panel */}
				{panelT > 0 && (
					<div style={{position: 'absolute', top: 34, right: 40, width: 700, bottom: 34, borderRadius: 28, ...surf, background: 'linear-gradient(180deg,#19191d,#131316)', boxShadow: '0 40px 100px rgba(0,0,0,0.6)', padding: 30, opacity: panelT, transform: `translateX(${(1 - panelT) * 120}px)`}}>
						<div style={{display: 'flex', alignItems: 'center', gap: 20}}>
							<ScoreRing score={94} size={92} t={ramp(f, k.panel + 6, 30, EASE.SOFT)} />
							<div>
								<div style={{fontSize: 32, fontWeight: 800, letterSpacing: '-0.03em'}}>Bella Forno</div>
								<div style={{marginTop: 6, display: 'flex', gap: 8}}>
									<Tag hot>High opportunity</Tag>
									<Tag hot>No website</Tag>
								</div>
							</div>
						</div>
						{/* tabs */}
						<div style={{marginTop: 24, display: 'flex', gap: 6, padding: 6, borderRadius: 16, background: '#0e0e11', border: `1px solid ${C.line}`}}>
							{['Analysis', 'Outreach', 'AI Prompt'].map((t, i) => (
								<div key={t} style={{flex: 1, height: 48, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontSize: 19, fontWeight: 750, background: tabIdx === i ? C.grad : 'transparent', color: tabIdx === i ? '#fff' : C.text3}}>
									<Icon n={['target', 'message', 'sparkles'][i]} size={19} color={tabIdx === i ? '#fff' : C.text3} sw={2.2} />
									{t}
								</div>
							))}
						</div>
						<div style={{position: 'relative', marginTop: 22}}>
							{tabIdx <= 0 && (
								<div style={pop(ramp(f, k.tab[0], 14, EASE.FAST_LOCK))}>
									<div style={{fontSize: 15, fontWeight: 800, letterSpacing: '0.18em', color: C.accent}}>WHY THIS LEAD IS VALUABLE</div>
									{['312 reviews at 4.8★ — and no website', 'Menu and booking only by phone', 'Searches Google → not found → goes to a competitor'].map((x, i) => (
										<div key={x} style={{marginTop: 14, display: 'flex', gap: 14, alignItems: 'center', fontSize: 21, fontWeight: 600, color: C.text, ...pop(ramp(f, k.tab[0] + 8 + i * 6, 12, EASE.FAST_LOCK), 12)}}>
											<div style={{width: 30, height: 30, borderRadius: 9, background: C.accentSoft, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0}}>
												<Icon n={i === 2 ? 'x' : 'check'} size={18} color={C.accent} sw={2.6} />
											</div>
											{i === 2 ? <span><span style={{color: C.text3}}>Customer lost here:</span> {x}</span> : x}
										</div>
									))}
								</div>
							)}
							{tabIdx === 1 && (
								<div style={pop(ramp(f, k.tab[1], 14, EASE.FAST_LOCK))}>
									<div style={{display: 'flex', alignItems: 'center', gap: 10}}>
										<span style={{fontSize: 16, fontWeight: 700, color: C.text3}}>Choose your tone</span>
										{['Friendly', 'Professional', 'Direct'].map((t, i) => (
											<Tag key={t} hot={i === 0}>{t}</Tag>
										))}
									</div>
									<div style={{marginTop: 16, display: 'flex', gap: 10}}>
										{[
											['message', 'WhatsApp'],
											['mail', 'Email'],
											['phone', 'Phone script'],
										].map(([ic, l], i) => (
											<div key={l} style={{flex: 1, height: 58, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9, fontSize: 18, fontWeight: 750, background: chIdx === i ? `rgba(${C.accentRGB},0.14)` : C.surface3, border: `1.5px solid ${chIdx === i ? C.accent : C.lineStrong}`, color: chIdx === i ? C.text : C.text3, transform: `scale(${chIdx === i ? 1 + 0.04 * (1 - ramp(f, k.channel[i], 10)) : 1})`}}>
												<Icon n={ic} size={20} color={chIdx === i ? C.accent : C.text3} sw={2.2} />
												{l}
											</div>
										))}
									</div>
									<div style={{marginTop: 16, height: 300, borderRadius: 18, background: '#0e0e11', border: `1px solid ${C.line}`, padding: '20px 22px', fontSize: 21, lineHeight: 1.5, color: C.text, whiteSpace: 'pre-wrap', overflow: 'hidden'}}>
										{MESSAGES[chKey].slice(0, Math.round(MESSAGES[chKey].length * chT))}
										{chT < 1 && <span style={{display: 'inline-block', width: 2, height: 24, background: C.accent, marginLeft: 2, verticalAlign: 'middle'}} />}
									</div>
									<div style={{marginTop: 16, display: 'flex', gap: 12}}>
										<div style={{flex: 1, height: 64, borderRadius: 16, background: copied ? '#34D399' : C.grad, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, fontSize: 21, fontWeight: 800, color: copied ? '#05140d' : '#fff', transform: `scale(${f >= k.copy && f < k.copy + 8 ? 0.96 : 1})`}}>
											<Icon n={copied ? 'check' : 'copy'} size={22} color={copied ? '#05140d' : '#fff'} sw={2.6} />
											{copied ? 'Copied!' : 'Copy message'}
										</div>
										<div style={{height: 64, padding: '0 22px', borderRadius: 16, ...surf, display: 'flex', alignItems: 'center', gap: 10, fontSize: 19, fontWeight: 700, color: C.text2}}>
											<Icon n="clock" size={20} color={C.text3} /> Follow-up · Day 3
										</div>
									</div>
								</div>
							)}
							{tabIdx === 2 && (
								<div style={pop(ramp(f, k.tab[2], 14, EASE.FAST_LOCK))}>
									<div style={{fontSize: 16, fontWeight: 700, color: C.text3}}>Select your AI tool</div>
									<div style={{marginTop: 12, display: 'flex', gap: 10}}>
										{BUILDERS.map((b, i) => {
											const on = f >= k.tool && i === 0;
											return (
												<div key={b.n} style={{flex: 1, height: 62, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, background: on ? `rgba(${C.accentRGB},0.14)` : C.surface3, border: `1.5px solid ${on ? C.accent : C.lineStrong}`}}>
													<Img src={staticFile(b.src)} style={{width: b.w, height: b.h}} />
													{!b.word && <span style={{fontSize: 19, fontWeight: 750}}>{b.n}</span>}
												</div>
											);
										})}
									</div>
									<div style={{marginTop: 16, height: 330, borderRadius: 18, background: '#0e0e11', border: `1px solid ${C.line}`, padding: '18px 22px', fontFamily: FONT.mono, fontSize: 17.5, lineHeight: 1.55, color: '#d8d8e0', overflow: 'hidden'}}>
										<span style={{color: C.accent}}>›</span> {PROMPT.slice(0, promptN)}
										{promptN < PROMPT.length && <span style={{display: 'inline-block', width: 9, height: 20, background: C.accent, marginLeft: 2, verticalAlign: 'middle'}} />}
									</div>
									<div style={{marginTop: 14, display: 'flex', alignItems: 'center', gap: 12}}>
										<div style={{fontSize: 17, fontWeight: 700, color: C.text3}}>{PROMPT.length} characters · Optimised for Lovable</div>
										<div style={{flex: 1}} />
										<div style={{height: 54, padding: '0 22px', borderRadius: 14, background: f >= k.ready ? '#34D399' : C.surface3, color: f >= k.ready ? '#05140d' : C.text3, display: 'flex', alignItems: 'center', fontSize: 19, fontWeight: 800, transform: `scale(${1 + 0.06 * Math.max(0, 1 - Math.abs(f - k.ready - 4) / 6)})`}}>
											✓ Ready to paste
										</div>
									</div>
								</div>
							)}
						</div>
					</div>
				)}
			</div>
		</div>
	);
};
