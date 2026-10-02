import {Easing} from 'remotion';

// ── Colour ──────────────────────────────────────────────────────────────
// Balance target: ~85% black/graphite, ~10% white/grey structure, ~5% accent.
export const COLORS = {
	bg: '#050505',
	bgLift: '#0B0B0F',
	surface: '#121218',
	surfaceHi: '#191920',
	line: 'rgba(244,244,246,0.10)',
	lineHi: 'rgba(244,244,246,0.22)',
	text: '#F4F4F6',
	textDim: '#9A9AA6',
	textMute: '#5C5C68',
	accent: '#E63F6D', // primary Prospectify accent
	accent2: '#E8445F',
	accentPink: '#E53C75',
	accentSoft: 'rgba(230,63,109,0.14)',
	// Logo-derived gradient (top-right warm → bottom-left pink), used only on the CTA.
	logoGradient: 'linear-gradient(135deg, #E8445F 0%, #E63F6D 55%, #E53C75 100%)',
	// The fictional client website built in the AI builder (deliberately NOT Prospectify-branded).
	site: {
		bg: '#F5F2EC',
		ink: '#10233D',
		inkDim: '#5B6B80',
		brand: '#2F6FED',
		card: '#FFFFFF',
	},
} as const;

// ── Type ────────────────────────────────────────────────────────────────
export const FONTS = {
	sans: 'Geist, system-ui, sans-serif',
	mono: 'GeistMono, ui-monospace, monospace',
	serif: '"InstrumentSerif", Georgia, serif',
} as const;

export const TYPE = {
	display: {fontSize: 112, fontWeight: 650, letterSpacing: '-0.045em', lineHeight: 1.0},
	headline: {fontSize: 92, fontWeight: 650, letterSpacing: '-0.04em', lineHeight: 1.04},
	title: {fontSize: 52, fontWeight: 600, letterSpacing: '-0.025em', lineHeight: 1.1},
	body: {fontSize: 34, fontWeight: 450, letterSpacing: '-0.01em', lineHeight: 1.3},
	label: {fontSize: 22, fontWeight: 500, letterSpacing: '0.08em', lineHeight: 1},
} as const;

// ── Easing ──────────────────────────────────────────────────────────────
// Fast things snap, hard things hesitate, solved things lock. No bounce anywhere.
export const EASE = {
	snap: Easing.bezier(0.16, 1, 0.3, 1), // expo-out: arrivals
	lock: Easing.bezier(0.2, 0, 0, 1), // decisive settle
	glide: Easing.bezier(0.65, 0, 0.35, 1), // cursor / camera travel
	exit: Easing.bezier(0.7, 0, 0.84, 0), // accelerate out
	linear: (t: number) => t,
} as const;

// ── Layout / safe zones (1080×1920) ─────────────────────────────────────
// TikTok/Reels overlay UI: keep critical content within x∈[90,990], y∈[200,1500].
export const SAFE = {
	left: 90,
	right: 990,
	top: 200,
	bottom: 1500,
	width: 900,
} as const;

export const LAYOUT = {
	headerY: 196, // persistent Prospectify header (logo + wordmark)
	headlineX: 90,
	headlineY: 300, // headline block top
	productTop: 640, // product zone
	productBottom: 1460,
	radius: 28,
	radiusSm: 16,
} as const;
