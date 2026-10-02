import type {Lead} from './kit/ui';

/**
 * DEMO DATA ONLY. Fictional businesses written for this film — not customers, not results.
 * Every product field shown exists in the production app (rating, reviews, website status, 0–100 score,
 * phone, WhatsApp outreach, AI prompt, sale price, analytics). Phone numbers use the reserved 555 range.
 */

export const HERO: Lead = {name: 'Bella Forno Trattoria', city: 'Austin', rating: 4.8, reviews: 312, score: 94, icon: 'utensils', status: 'weak', tag: 'Weak site'};

export const RESULTS: Lead[] = [
	{name: 'Taquería El Sol', city: 'Austin', rating: 4.7, reviews: 186, score: 91, icon: 'utensils', status: 'none', tag: 'No website'},
	HERO,
	{name: 'Juniper Café', city: 'Austin', rating: 4.5, reviews: 98, score: 82, icon: 'coffee', status: 'weak', tag: 'Weak site'},
	{name: 'Southside Smokehouse', city: 'Austin', rating: 4.6, reviews: 241, score: 88, icon: 'utensils', status: 'social_only', tag: 'Social media only'},
	{name: 'Noodle Theory', city: 'Austin', rating: 4.4, reviews: 77, score: 79, icon: 'utensils', status: 'none', tag: 'No website'},
];
// order after ranking by score (FLIP sort)
export const RANKED = [...RESULTS].sort((a, b) => b.score - a.score);

export const BIZ_A = {
	name: 'Lumen Nail Studio',
	kind: 'Nail salon · Austin',
	rating: 4.2,
	reviews: 6,
	signals: [
		{icon: 'globe', text: 'No website'},
		{icon: 'message', text: '6 reviews · last one 14 months ago'},
		{icon: 'camera', text: 'Instagram · 3 posts'},
	],
};
export const BIZ_B = {
	name: 'Bella Forno Trattoria',
	kind: 'Italian restaurant · Austin',
	rating: 4.8,
	reviews: 312,
	demand: [
		{icon: 'message', text: '312 reviews · new this week'},
		{icon: 'camera', text: 'Instagram · posts daily'},
	],
	problem: [
		{icon: 'smartphone', text: 'Site breaks on mobile'},
		{icon: 'calendar', text: 'No online booking'},
	],
};

export const PHONE = '+1 (512) 555-0147';

export const OUTREACH_FRAGMENTS = ['312 reviews at 4.8★', 'hard to use on a phone', 'no way to book online'];
export const OUTREACH_MESSAGE = [
	{t: 'Hi Bella Forno team — ', k: 0},
	{t: '312 reviews at 4.8★', k: 1},
	{t: ' is seriously impressive. I noticed your site is ', k: 0},
	{t: 'hard to use on a phone', k: 2},
	{t: ' and there’s ', k: 0},
	{t: 'no way to book online', k: 3},
	{t: '. I build fast, mobile-first restaurant sites with booking. Want me to send you a quick preview?', k: 0},
];

export const PROMPT_FIELDS: [string, string][] = [
	['Business', 'Bella Forno Trattoria · Italian'],
	['Services', 'Wood-fired pizza · fresh pasta'],
	['Location', 'East Austin, TX'],
	['Offer', 'Dinner · weekend brunch'],
	['Customers', 'Locals, families, date nights'],
	['Website problem', 'Not mobile-friendly · no booking'],
	['Pages', 'Home · Menu · Book · Contact'],
	['CTA', '“Book a table”'],
	['Style', 'Warm, rustic, editorial'],
	['Goal', 'Online reservations'],
	['Local context', '312 Google reviews · ★ 4.8'],
];

export const PROMPT_TEXT =
	'Build a mobile-first website for Bella Forno Trattoria, a wood-fired Italian restaurant in East Austin with 312 Google reviews (★ 4.8). Pages: Home, Menu, Book, Contact. Primary CTA: “Book a table” with online reservations. Warm, rustic, editorial style…';
