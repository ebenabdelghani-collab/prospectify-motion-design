import React, {useLayoutEffect, useMemo, useRef} from 'react';
import {ThreeCanvas} from '@remotion/three';
import {useThree} from '@react-three/fiber';
import * as THREE from 'three';
import {RoomEnvironment} from 'three/examples/jsm/environments/RoomEnvironment.js';
import {T} from '../constants/timeline';
import {EASE} from '../constants/theme';
import {clamp01, lerp, ramp, rand} from '../motion/anim';

const ACCENT = '#E63F6D';

/** Studio reflections without any downloaded HDR: a procedural room, prefiltered once. */
const Env: React.FC = () => {
	const {gl, scene} = useThree();
	useMemo(() => {
		const pmrem = new THREE.PMREMGenerator(gl);
		scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
		scene.background = null;
		scene.fog = new THREE.FogExp2('#050507', 0.028);
		pmrem.dispose();
	}, [gl, scene]);
	return null;
};

/** Frame-driven camera rig (no useFrame — every value is a pure function of the frame). */
const Rig: React.FC<{f: number}> = ({f}) => {
	const {camera} = useThree();
	const rise = ramp(f, T.FIFTY_IN + 10, T.TIME_LINE - T.FIFTY_IN - 6, EASE.glide);
	const orbit = ramp(f, T.FIFTY_IN + 10, T.SCALE_COLLAPSE - T.FIFTY_IN, EASE.linear) * 0.55;
	const push = ramp(f, T.SCALE_COLLAPSE, 30, EASE.snap);
	const dist = lerp(lerp(5.5, 24, rise), 8.5, push);
	const h = lerp(lerp(3.2, 24, rise), 5, push);
	const a = 0.35 + orbit;
	camera.position.set(Math.sin(a) * dist, h, Math.cos(a) * dist);
	camera.lookAt(0, lerp(0.9, -1.5, rise) + push * 4.5, lerp(0, -2, rise) * (1 - push));
	(camera as THREE.PerspectiveCamera).fov = 38;
	(camera as THREE.PerspectiveCamera).updateProjectionMatrix();
	return null;
};

const GRID = 34;
const CELL = 1.25;
const City: React.FC<{f: number}> = ({f}) => {
	const ref = useRef<THREE.InstancedMesh>(null);
	const lit = useRef<THREE.InstancedMesh>(null);
	const blocks = useMemo(() => {
		const out: {x: number; z: number; h: number; w: number; d: number; win: boolean}[] = [];
		for (let i = -GRID / 2; i < GRID / 2; i++) {
			for (let j = -GRID / 2; j < GRID / 2; j++) {
				if (i % 4 === 0 || j % 5 === 0) continue; // streets
				if (j > 7 && j < 10) continue; // the river
				if (Math.hypot(i, j) < 2.6) continue; // a plaza around B
				const r = Math.hypot(i, j);
				const downtown = Math.max(0, 1 - r / 13);
				const s = rand(i * 131 + j * 7);
				const h = 0.25 + Math.pow(s, 2.2) * (0.8 + downtown * 5.5);
				out.push({x: i * CELL, z: j * CELL, h, w: CELL * (0.62 + rand(i + j * 3) * 0.2), d: CELL * (0.62 + rand(i * 5 - j) * 0.2), win: rand(i * 17 + j * 29) > 0.55});
			}
		}
		return out;
	}, []);
	const sink = ramp(f, T.SCALE_COLLAPSE + 2, 16, EASE.exit);
	useLayoutEffect(() => {
		const m = new THREE.Matrix4();
		blocks.forEach((b, k) => {
			const hh = b.h * (1 - sink);
			m.compose(new THREE.Vector3(b.x, hh / 2, b.z), new THREE.Quaternion(), new THREE.Vector3(b.w, Math.max(0.001, hh), b.d));
			ref.current!.setMatrixAt(k, m);
			lit.current!.setMatrixAt(k, b.win ? m.clone().multiply(new THREE.Matrix4().makeScale(1.002, 0.995, 1.002)) : new THREE.Matrix4().makeScale(0, 0, 0));
		});
		ref.current!.instanceMatrix.needsUpdate = true;
		lit.current!.instanceMatrix.needsUpdate = true;
	});
	return (
		<>
			<instancedMesh ref={ref} args={[undefined, undefined, blocks.length]}>
				<boxGeometry args={[1, 1, 1]} />
				<meshStandardMaterial color="#1E222B" roughness={0.5} metalness={0.4} envMapIntensity={0.6} />
			</instancedMesh>
			<instancedMesh ref={lit} args={[undefined, undefined, blocks.length]}>
				<boxGeometry args={[1, 1, 1]} />
				<meshStandardMaterial color="#000" emissive="#CFDDF5" emissiveIntensity={0.3} transparent opacity={0.12} />
			</instancedMesh>
			{/* ground + river */}
			<mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
				<planeGeometry args={[120, 120]} />
				<meshStandardMaterial color="#0B0D11" roughness={0.9} />
			</mesh>
			<mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 8.75 * CELL]}>
				<planeGeometry args={[120, 2.6]} />
				<meshPhysicalMaterial color="#0E2236" roughness={0.12} metalness={0.2} clearcoat={1} />
			</mesh>
		</>
	);
};

// 50 pins: B at the origin, the rest spread across the city.
const PINS: [number, number][] = [[0, 0]];
for (let i = 1; i < 50; i++) {
	const a = rand(i * 7.1) * Math.PI * 2;
	const r = 2.2 + Math.sqrt(rand(i * 3.3)) * 15;
	PINS.push([Math.cos(a) * r, Math.sin(a) * r * 0.8]);
}

const Pin: React.FC<{f: number; i: number}> = ({f, i}) => {
	const at = T.FIFTY_FILL[i];
	const t = clamp01((f - at) / 12);
	// overshoot pop (a little physics — the pin lands)
	const pop = t <= 0 ? 0 : 1 + Math.sin(t * Math.PI) * 0.35 * (1 - t);
	const implode = ramp(f, T.SCALE_COLLAPSE - 2, 12, EASE.exit);
	const [x, z] = PINS[i];
	const lift = i === 0 ? 0 : 0;
	const px = lerp(x, 0, implode);
	const pz = lerp(z, 0, implode);
	const py = lerp(0, 3, implode) + lift;
	const hot = i === 0;
	const flick = !hot && T.TIME_FLICKS.some((k) => f >= k && f < k + 5 && Math.floor(rand(k * 1.3) * 50) === i);
	const s = Math.max(0.0001, (hot ? 3.2 : 2.3) * pop * lerp(1, 0.5, implode));
	return (
		<group position={[px, py, pz]} scale={[s, s, s]}>
			{hot && implode < 0.5 && (
				<mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]} scale={[1 + ((f % 40) / 40) * 1.6, 1 + ((f % 40) / 40) * 1.6, 1]}>
					<ringGeometry args={[0.32, 0.4, 64]} />
					<meshBasicMaterial color={ACCENT} transparent opacity={0.9 * (1 - (f % 40) / 40)} />
				</mesh>
			)}
			<mesh position={[0, 0.62, 0]}>
				<sphereGeometry args={[0.26, 48, 48]} />
				<meshPhysicalMaterial color={hot ? ACCENT : flick ? '#FFFFFF' : '#D5D8DF'} roughness={0.14} metalness={hot ? 0.05 : 0.2} clearcoat={1} clearcoatRoughness={0.04} envMapIntensity={0.7} emissive={hot ? ACCENT : flick ? '#FFFFFF' : '#9AA3B5'} emissiveIntensity={hot ? 0.35 : flick ? 0.6 : 0.12} />
			</mesh>
			<mesh position={[0, 0.27, 0]}>
				<coneGeometry args={[0.1, 0.55, 24]} />
				<meshPhysicalMaterial color={hot ? ACCENT : '#A9AEB8'} roughness={0.2} metalness={0.4} clearcoat={1} />
			</mesh>
		</group>
	);
};

/** All pins collapse into one glossy brand sphere, which contracts to the point the logo is born from. */
const Core: React.FC<{f: number}> = ({f}) => {
	const grow = ramp(f, T.SCALE_COLLAPSE + 4, 12, EASE.snap);
	const shrink = ramp(f, T.REVEAL - 14, 12, EASE.exit);
	const r = Math.max(0.0001, 0.9 * grow * (1 - shrink) + Math.sin(clamp01((f - T.SCALE_COLLAPSE - 4) / 16) * Math.PI) * 0.12);
	return (
		<mesh position={[0, 3, 0]} scale={[r, r * (1 - 0.08 * Math.sin(f * 0.4) * (1 - shrink)), r]}>
			<sphereGeometry args={[1, 96, 96]} />
			<meshPhysicalMaterial color="#C8285A" roughness={0.16} metalness={0.15} clearcoat={1} clearcoatRoughness={0.08} envMapIntensity={0.35} emissive="#7A0F2E" emissiveIntensity={0.35 + shrink * 2.5} />
		</mesh>
	);
};

export const CityFlyover: React.FC<{f: number; opacity: number}> = ({f, opacity}) => (
	<div style={{position: 'absolute', inset: 0, opacity}}>
		<ThreeCanvas width={1080} height={1920} camera={{position: [0, 2, 6], fov: 38, near: 0.05, far: 200}}>
			<Env />
			<Rig f={f} />
			<ambientLight intensity={0.12} />
			<hemisphereLight args={['#8FA3C8', '#050505', 0.35]} />
			<directionalLight position={[-8, 14, 6]} intensity={1.15} color="#AFC2F0" />
			<directionalLight position={[10, 6, -8]} intensity={0.6} color="#E63F6D" />
			<pointLight position={[0, 6, 0]} intensity={6} distance={10} color={ACCENT} />
			<City f={f} />
			{PINS.map((_, i) => (f >= T.FIFTY_FILL[i] ? <Pin key={i} f={f} i={i} /> : null))}
			{f >= T.SCALE_COLLAPSE && <Core f={f} />}
		</ThreeCanvas>
	</div>
);
