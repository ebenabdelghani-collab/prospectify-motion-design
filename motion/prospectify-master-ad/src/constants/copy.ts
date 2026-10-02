import {T} from './timeline';

// ── Headline track ────────────────────────────────────────────────────────
// On-screen type doubles as captions: the ad must read perfectly with sound off.
// Each headline holds until the next one takes over (no overlaps, one system).
export type Headline = {
	at: number;
	lines: string[];
	dim?: number[]; // indices of lines set in secondary grey
	checkAt?: number; // frame a lock-check appears after the last line
	size?: number;
	sub?: string;
};

export const HEADLINES: Headline[] = [
	// ACT 2 — pain, word by word with the voice
	{at: T.PAIN_CUTS[0], lines: ['Maps.'], size: 132},
	{at: T.PAIN_CUTS[1], lines: ['Reviews.'], size: 132},
	{at: T.PAIN_CUTS[2], lines: ['Their website.'], size: 120},
	{at: T.PAIN_CUTS[3], lines: ['Their Instagram.'], size: 112},
	{at: T.PAIN_CUTS[4], lines: ['An email…', 'somewhere.'], dim: [1], size: 112},
	{at: T.WORTH_START, lines: ['Is this one even', 'worth *pitching?*'], dim: [0]},
	{at: T.ZERO_IN, lines: []},
	// ACT 3 — insight
	{at: T.INSIGHT_Q, lines: ['Which one', 'would *you* pitch?'], dim: [0]},
	{at: T.NOWEB_LINE, lines: ['“No website”', 'isn’t the *opportunity.*'], dim: [1]},
	{at: T.DEMAND_LINE, lines: ['Demand *first.*', 'Bad website second.'], dim: [1], size: 88},
	// ACT 4 — scale
	{at: T.FIFTY_IN, lines: ['Now find', '*fifty* of them.'], dim: [0]},
	{at: T.TIME_LINE, lines: ['That’s where', 'your time *goes.*'], dim: [0]},
	{at: T.SCALE_COLLAPSE, lines: []},
	// ACT 6–7 — product
	{at: T.PICK_HEADLINE, lines: ['Pick a city.', 'Pick a niche.'], dim: [0]},
	{at: T.FINDS_HEADLINE, lines: ['Businesses *actually*', 'worth pitching.'], dim: [0]},
	{at: T.LEAD_SELECTED, lines: ['And *why.*'], checkAt: T.WHY_READY},
	{at: T.NEXT_HEADLINE, lines: ['Your next *move.*']},
	{at: T.CONTACT_READY, lines: ['The contact.', '*Ready.*'], dim: [1], checkAt: T.CONTACT_READY},
	{at: T.ANGLE_READY, lines: ['The angle.', '*Ready.*'], dim: [1], checkAt: T.ANGLE_READY},
	{at: T.OUTREACH_TYPE[0], lines: ['The first message.', '*Ready.*'], dim: [1], checkAt: T.OUTREACH_READY},
	// ACT 8 — build prompt
	{at: T.PROMPT_HEADLINE, lines: ['And the', 'website *prompt…*'], dim: [0]},
	{at: T.EXACT_HEADLINE, lines: ['Written for this', '**exact** business.'], dim: [0], checkAt: T.PROMPT_READY},
	// ACT 9–10
	{at: T.BUILDER_HEADLINE, lines: ['Your prompt.', 'Your *builder.*'], dim: [0], sub: 'Paste it into any AI builder.'},
	{at: T.BUILDIT_HEADLINE, lines: ['Build *it.*'], checkAt: T.SITE_READY, size: 132},
	{at: T.PITCHIT_HEADLINE, lines: ['Pitch *it.*'], checkAt: T.PITCH_CONFIRM, size: 132},
	// ACT 11–12
	{at: T.SELL_HEADLINE, lines: ['Sold it?', 'Log *it.*'], dim: [0], checkAt: T.SOLD},
	{at: T.TRACK_HEADLINE, lines: ['See what’s', '*actually* working.'], dim: [0]},
	{at: T.LOOP_IN, lines: []},
];

export const COPY = {
	buildPrompt: 'Build a site for a plumber',
	builtChip: 'Built · 40 min',
	findPrompt: 'Find someone to buy it',
	nightCaption: 'That still eats your *whole* *night.*',
	zeroLabel: 'Pitches sent tonight',
	wordmark: 'Prospectify',
	revealLine: 'Built for *exactly* this.',
	builderLegal: 'Trademarks belong to their owners. No affiliation implied.',
	loop: ['Find.', 'Pitch.', 'Build.', 'Sell.'],
	repeat: 'Repeat.',
	finalLine1: 'You build the website.',
	finalLine2: ['Prospectify finds', 'the *client.*'],
	cta: 'Start free',
	url: 'prospectify.net',
	paidOffer: '3 real leads free · No card',
} as const;
