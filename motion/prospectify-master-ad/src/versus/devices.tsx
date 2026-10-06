import React from 'react';
import {FONT} from '../final/tokens';

/**
 * Premium hardware, drawn in CSS (no third-party marks): a titanium phone with a dynamic island and a
 * laptop with a notch. Glass highlights + layered shadows so they read as objects, not flat rectangles.
 */

export const Phone: React.FC<{
	w: number;
	children: React.ReactNode;
	rotY?: number;
	rotX?: number;
	rotZ?: number;
	glare?: number; // 0..1 sweep position of the glass highlight
	style?: React.CSSProperties;
	time?: string;
	dark?: boolean; // status bar ink
}> = ({w, children, rotY = 0, rotX = 0, rotZ = 0, glare = 0.3, style, time = '9:41', dark = false}) => {
	const h = w * 2.07;
	const r = w * 0.175;
	const bez = w * 0.032;
	const ink = dark ? '#111' : '#fff';
	return (
		<div style={{width: w, height: h, position: 'relative', transformStyle: 'preserve-3d', transform: `perspective(${w * 9}px) rotateX(${rotX}deg) rotateY(${rotY}deg) rotateZ(${rotZ}deg)`, ...style}}>
			{/* contact + ambient shadow */}
			<div style={{position: 'absolute', left: '6%', right: '6%', bottom: -h * 0.04, height: h * 0.08, borderRadius: '50%', background: 'rgba(0,0,0,0.55)', filter: `blur(${w * 0.08}px)`}} />
			<div style={{position: 'absolute', inset: 0, borderRadius: r, boxShadow: `0 ${w * 0.25}px ${w * 0.5}px rgba(0,0,0,0.55), 0 ${w * 0.05}px ${w * 0.1}px rgba(0,0,0,0.35)`}} />
			{/* side buttons */}
			<div style={{position: 'absolute', left: -w * 0.012, top: h * 0.2, width: w * 0.016, height: h * 0.05, borderRadius: 3, background: 'linear-gradient(90deg,#55555c,#2a2a2f)'}} />
			<div style={{position: 'absolute', left: -w * 0.012, top: h * 0.28, width: w * 0.016, height: h * 0.085, borderRadius: 3, background: 'linear-gradient(90deg,#55555c,#2a2a2f)'}} />
			<div style={{position: 'absolute', left: -w * 0.012, top: h * 0.38, width: w * 0.016, height: h * 0.085, borderRadius: 3, background: 'linear-gradient(90deg,#55555c,#2a2a2f)'}} />
			<div style={{position: 'absolute', right: -w * 0.012, top: h * 0.3, width: w * 0.016, height: h * 0.13, borderRadius: 3, background: 'linear-gradient(270deg,#55555c,#2a2a2f)'}} />
			{/* titanium frame */}
			<div style={{position: 'absolute', inset: 0, borderRadius: r, background: 'linear-gradient(145deg, #6b6b72 0%, #2b2b30 18%, #45454b 50%, #1d1d21 78%, #5a5a61 100%)', padding: w * 0.012}}>
				<div style={{position: 'absolute', inset: w * 0.006, borderRadius: r - w * 0.006, boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.18)'}} />
				{/* black glass bezel */}
				<div style={{position: 'absolute', inset: w * 0.012, borderRadius: r - w * 0.012, background: '#050506', padding: bez}}>
					{/* screen */}
					<div style={{position: 'relative', width: '100%', height: '100%', borderRadius: r - w * 0.044, overflow: 'hidden', background: '#000'}}>
						{children}
						{/* status bar */}
						<div style={{position: 'absolute', left: 0, right: 0, top: 0, height: w * 0.13, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: `0 ${w * 0.085}px`, fontFamily: FONT.sans, fontWeight: 700, fontSize: w * 0.048, color: ink, pointerEvents: 'none'}}>
							<span>{time}</span>
							<span style={{display: 'flex', gap: w * 0.015, alignItems: 'center'}}>
								<span style={{display: 'flex', gap: w * 0.006, alignItems: 'flex-end'}}>
									{[0.35, 0.55, 0.75, 1].map((k, i) => (
										<span key={i} style={{width: w * 0.011, height: w * 0.034 * k, borderRadius: 1, background: ink}} />
									))}
								</span>
								<span style={{width: w * 0.07, height: w * 0.034, borderRadius: w * 0.01, border: `${w * 0.004}px solid ${ink}`, opacity: 0.9, position: 'relative'}}>
									<span style={{position: 'absolute', inset: w * 0.004, right: w * 0.016, borderRadius: w * 0.005, background: ink}} />
								</span>
							</span>
						</div>
						{/* dynamic island */}
						<div style={{position: 'absolute', left: '50%', top: w * 0.03, width: w * 0.3, height: w * 0.088, marginLeft: -w * 0.15, borderRadius: w, background: '#000'}}>
							<div style={{position: 'absolute', right: w * 0.03, top: w * 0.026, width: w * 0.036, height: w * 0.036, borderRadius: '50%', background: 'radial-gradient(circle at 35% 35%, #2a3550 0%, #0a0c12 60%)'}} />
						</div>
						{/* glass glare */}
						<div style={{position: 'absolute', inset: 0, background: `linear-gradient(115deg, rgba(255,255,255,0) ${glare * 100 - 25}%, rgba(255,255,255,0.10) ${glare * 100}%, rgba(255,255,255,0) ${glare * 100 + 22}%)`, pointerEvents: 'none'}} />
					</div>
				</div>
			</div>
		</div>
	);
};

/** Laptop: thin black bezel with a notch, aluminium deck below. `w` = screen width. */
export const Laptop: React.FC<{w: number; children: React.ReactNode; rotX?: number; rotY?: number; style?: React.CSSProperties; glare?: number}> = ({w, children, rotX = 0, rotY = 0, style, glare = 0.3}) => {
	const h = w * 0.64;
	const bez = w * 0.018;
	return (
		<div style={{width: w, position: 'relative', transform: `perspective(${w * 4}px) rotateX(${rotX}deg) rotateY(${rotY}deg)`, ...style}}>
			<div style={{position: 'absolute', left: '-4%', right: '-4%', bottom: -w * 0.04, height: w * 0.06, borderRadius: '50%', background: 'rgba(0,0,0,0.6)', filter: `blur(${w * 0.03}px)`}} />
			{/* lid */}
			<div style={{width: w, height: h, borderRadius: w * 0.024, background: 'linear-gradient(180deg,#2a2a2e,#151517)', padding: w * 0.004, boxShadow: `0 ${w * 0.06}px ${w * 0.12}px rgba(0,0,0,0.5)`}}>
				<div style={{width: '100%', height: '100%', borderRadius: w * 0.02, background: '#050506', padding: bez, position: 'relative'}}>
					<div style={{position: 'relative', width: '100%', height: '100%', borderRadius: w * 0.006, overflow: 'hidden', background: '#000'}}>
						{children}
						<div style={{position: 'absolute', inset: 0, background: `linear-gradient(120deg, rgba(255,255,255,0) ${glare * 100 - 30}%, rgba(255,255,255,0.07) ${glare * 100}%, rgba(255,255,255,0) ${glare * 100 + 30}%)`, pointerEvents: 'none'}} />
					</div>
					{/* notch */}
					<div style={{position: 'absolute', left: '50%', top: 0, width: w * 0.1, height: bez * 1.25, marginLeft: -w * 0.05, borderRadius: `0 0 ${w * 0.008}px ${w * 0.008}px`, background: '#050506'}} />
				</div>
			</div>
			{/* deck */}
			<div style={{position: 'relative', left: '-7%', width: '114%', height: w * 0.028, borderRadius: `0 0 ${w * 0.03}px ${w * 0.03}px`, background: 'linear-gradient(180deg,#d9d9de 0%,#a9a9b0 45%,#6d6d74 100%)'}}>
				<div style={{position: 'absolute', left: '50%', top: 0, width: w * 0.16, height: w * 0.01, marginLeft: -w * 0.08, borderRadius: `0 0 ${w * 0.01}px ${w * 0.01}px`, background: 'linear-gradient(180deg,#8d8d94,#b9b9c0)'}} />
			</div>
		</div>
	);
};

/** Browser chrome for inside the laptop (dark, minimal). */
export const Chrome: React.FC<{url: string; children: React.ReactNode; h: number; dark?: boolean}> = ({url, children, h, dark = true}) => (
	<div style={{width: '100%', height: '100%', display: 'flex', flexDirection: 'column', background: dark ? '#1b1b1f' : '#ececef'}}>
		<div style={{height: h, display: 'flex', alignItems: 'center', gap: h * 0.5, padding: `0 ${h * 0.5}px`, flexShrink: 0}}>
			<div style={{display: 'flex', gap: h * 0.18}}>
				{['#ff5f57', '#febc2e', '#28c840'].map((c) => (
					<div key={c} style={{width: h * 0.26, height: h * 0.26, borderRadius: '50%', background: c}} />
				))}
			</div>
			<div style={{flex: 1, height: h * 0.62, borderRadius: h * 0.2, background: dark ? '#2a2a30' : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT.sans, fontSize: h * 0.3, fontWeight: 600, color: dark ? '#b9b9c2' : '#555'}}>
				{url}
			</div>
			<div style={{width: h * 1.2}} />
		</div>
		<div style={{flex: 1, position: 'relative', overflow: 'hidden'}}>{children}</div>
	</div>
);
