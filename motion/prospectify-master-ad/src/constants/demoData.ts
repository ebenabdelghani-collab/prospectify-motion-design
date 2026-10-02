// DEMO DATA — a fictional business used to show the workflow. Not a customer, not a result.
// Phone uses the reserved 555-01xx fiction range. The sale amount is the demo user's own entry
// in their dashboard (shown with a "Demo account" tag), not a claim about Prospectify outcomes.

export const LEAD = {
	name: 'Bellwood Plumbing',
	category: 'Plumber',
	city: 'Austin, TX',
	rating: '4.8',
	reviews: '126',
	recent: '9 this month',
	phone: '(512) 555-0148',
	address: 'E 6th St, Austin',
	why: {
		demand: ['126 reviews', '9 new this month'],
		problem: ['Site breaks on mobile', 'No online booking'],
	},
	angle: 'Busy + well-reviewed. Site loses mobile customers.',
	outreach:
		'Hi Bellwood team — 126 great reviews, but your site breaks on phones, where most of them find you. I can rebuild it this week. Want a free preview?',
	sale: {amount: '1,500', date: 'Oct 2, 2026'},
};

export const SEARCH = {city: 'Austin, TX', niche: 'Plumbers'};

export type Strength = 'high' | 'mid' | 'low';
export const RESULTS: {name: string; demand: string; problem: string; strength: Strength}[] = [
	{name: 'Bellwood Plumbing', demand: '126 reviews', problem: 'Site breaks on mobile', strength: 'high'},
	{name: 'Lone Star Drain Co.', demand: '88 reviews', problem: 'Outdated site', strength: 'high'},
	{name: 'Capitol City Plumbing', demand: '61 reviews', problem: 'No online booking', strength: 'mid'},
	{name: 'Eastside Pipe & Drain', demand: '54 reviews', problem: 'Social only', strength: 'mid'},
	{name: 'Hill Country Plumbing', demand: '12 reviews', problem: 'Modern site', strength: 'low'},
];

// Insight scene — generic A/B illustration, deliberately unnamed.
export const INSIGHT = {
	a: {label: 'Business A', rating: '3.9★', signals: ['No website', '4 reviews', 'Last review 2 years ago']},
	b: {
		label: 'Business B',
		rating: '4.8★',
		demand: ['126 reviews', '9 new this month'],
		problem: ['Outdated site', 'Breaks on mobile'],
	},
};

// Build prompt written for THIS business (not a template).
export const PROMPT = {
	intro: ['Rebuild the website for Bellwood Plumbing,', 'a busy local plumber in Austin, TX.'],
	fields: [
		['Offer', 'Repairs · Drains · Water heaters'],
		['Pages', 'Home · Services · Reviews · Contact'],
		['Main CTA', 'Call (512) 555-0148 · Book online'],
		['Local', 'Austin service area · 4.8★ from 126 reviews'],
		['Fix', 'Fast on mobile · booking above the fold'],
		['Style', 'Trustworthy, clean, mobile-first'],
	] as [string, string][],
};

export const BUILDERS = [
	{id: 'lovable', name: 'Lovable', src: 'builders/lovable.svg', w: 84, h: 84},
	{id: 'claude', name: 'Claude', src: 'builders/claude.svg', w: 84, h: 84},
	{id: 'bolt', name: 'Bolt', src: 'builders/bolt.svg', w: 132, h: 57},
	{id: 'base44', name: 'Base44', src: 'builders/base44.svg', w: 84, h: 84},
] as const;
