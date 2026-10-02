import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {useGsapTimeline} from '@remotion/gsap';
import gsap from 'gsap';
import {SplitText} from 'gsap/SplitText';
import {CustomEase} from 'gsap/CustomEase';
import {TransitionSeries, linearTiming} from '@remotion/transitions';
import {fade} from '@remotion/transitions/fade';
import {evolvePath} from '@remotion/paths';
import {Circle} from '@remotion/shapes';
import {Lottie} from '@remotion/lottie';
import {RemotionRiveCanvas} from '@remotion/rive';
import {ThreeCanvas} from '@remotion/three';
import {RoundedBox} from '@react-three/drei';
import {EffectComposer, Bloom} from '@react-three/postprocessing';

/**
 * STACK CHECK — not a deliverable. Proves every library in the motion toolbox resolves,
 * bundles and renders deterministically inside Remotion. Safe to delete.
 */
gsap.registerPlugin(SplitText, CustomEase);
// Referenced so the bundler must resolve them (no assets are loaded here).
export const RESOLVED = {Lottie, RemotionRiveCanvas};

const GsapType: React.FC = () => {
	const ref = useGsapTimeline<HTMLDivElement>(({timeline, scope}) => {
		const split = new SplitText(scope.querySelector('h1'), {type: 'chars'});
		timeline.from(split.chars, {yPercent: 110, opacity: 0, stagger: 0.03, duration: 0.6, ease: CustomEase.create('snap', 'M0,0 C0.16,1 0.3,1 1,1')});
	});
	return (
		<div ref={ref} style={{position: 'absolute', top: 260, width: '100%', textAlign: 'center', overflow: 'hidden'}}>
			<h1 style={{margin: 0, fontFamily: 'sans-serif', fontSize: 120, fontWeight: 800, color: '#F4F4F6', letterSpacing: '-0.04em'}}>GSAP · SplitText</h1>
		</div>
	);
};

const PathAndShape: React.FC = () => {
	const f = useCurrentFrame();
	const d = 'M 140 1000 C 400 700, 700 1300, 940 1000';
	const {strokeDasharray, strokeDashoffset} = evolvePath(Math.min(1, f / 40), d);
	return (
		<>
			<svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
				<path d={d} stroke="#E63F6D" strokeWidth={10} fill="none" strokeDasharray={strokeDasharray} strokeDashoffset={strokeDashoffset} />
			</svg>
			<div style={{position: 'absolute', left: 490, top: 1200}}>
				<Circle radius={50} fill="#E63F6D" />
			</div>
		</>
	);
};

const Spatial: React.FC = () => {
	const f = useCurrentFrame();
	const {width, height} = useVideoConfig();
	return (
		<ThreeCanvas width={width} height={height} camera={{position: [0, 0, 6], fov: 40}}>
			<ambientLight intensity={0.4} />
			<directionalLight position={[3, 4, 5]} intensity={2} />
			<RoundedBox args={[2.4, 1.4, 0.2]} radius={0.12} rotation={[0.3, f * 0.03, 0]}>
				<meshStandardMaterial color="#E63F6D" emissive="#E63F6D" emissiveIntensity={0.4} />
			</RoundedBox>
			<EffectComposer>
				<Bloom intensity={0.8} luminanceThreshold={0.2} />
			</EffectComposer>
		</ThreeCanvas>
	);
};

export const StackCheck: React.FC = () => (
	<AbsoluteFill style={{background: '#050505'}}>
		<TransitionSeries>
			<TransitionSeries.Sequence durationInFrames={60}>
				<GsapType />
				<PathAndShape />
			</TransitionSeries.Sequence>
			<TransitionSeries.Transition presentation={fade()} timing={linearTiming({durationInFrames: 15})} />
			<TransitionSeries.Sequence durationInFrames={60}>
				<Spatial />
			</TransitionSeries.Sequence>
		</TransitionSeries>
	</AbsoluteFill>
);
