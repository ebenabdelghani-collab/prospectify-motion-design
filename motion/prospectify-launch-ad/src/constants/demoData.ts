// DEMO DATA — fictional business used to demonstrate the workflow.
// Phone uses the reserved 555-01xx fiction range. Replace with an approved real
// demo record from the Prospectify app before running paid media, if desired.
export const LEAD = {
	name: 'Bellwood Plumbing',
	category: 'Plumber',
	city: 'Austin, TX',
	rating: '4.8',
	reviews: '126',
	phone: '(512) 555-0148',
	address: 'E 6th St, Austin, TX',
	why: ['No website', '4.8★ · 126 reviews'],
	outreach:
		'Hi Bellwood team — 126 great reviews, but no website. I can build you one this week. Want a free preview?',
};

export const SEARCH = {
	niche: 'Plumbers',
	city: 'Austin, TX',
};

export type ResultStatus = 'none' | 'outdated' | 'mobile' | 'ok';
export const RESULTS: {name: string; status: ResultStatus; label: string}[] = [
	{name: 'Bellwood Plumbing', status: 'none', label: 'No website'},
	{name: 'Lone Star Drain Co.', status: 'outdated', label: 'Outdated site'},
	{name: 'Capitol City Plumbing', status: 'mobile', label: 'Broken on mobile'},
	{name: 'Eastside Pipe & Drain', status: 'none', label: 'No website'},
	{name: 'Hill Country Plumbing', status: 'ok', label: 'Has website'},
];

// Structured build prompt — specific to THIS business, not a generic template.
export const PROMPT = {
	intro: ['Build a website for Bellwood Plumbing,', 'a local plumber in Austin, TX.'],
	fields: [
		['Pages', 'Home · Services · Reviews · Contact'],
		['Highlight', '4.8★ from 126 reviews'],
		['Main CTA', 'Call (512) 555-0148'],
		['Style', 'Trustworthy, clean, mobile-first'],
		['Goal', 'Turn local searches into calls'],
	] as [string, string][],
};

export const BUILDERS = [
	{id: 'lovable', name: 'Lovable', src: 'builders/lovable.svg', w: 84, h: 84},
	{id: 'base44', name: 'Base44', src: 'builders/base44.svg', w: 84, h: 84},
	{id: 'claude', name: 'Claude', src: 'builders/claude.svg', w: 84, h: 84},
	{id: 'bolt', name: 'Bolt', src: 'builders/bolt.svg', w: 132, h: 57},
] as const;
