import React, {useMemo} from 'react';
import {ThreeCanvas} from '@remotion/three';
import {useThree} from '@react-three/fiber';
import * as THREE from 'three';
import {RoomEnvironment} from 'three/examples/jsm/environments/RoomEnvironment.js';
import {rand} from '../motion/anim';

const COLS = ['#E63F6D', '#E8445F', '#F4F4F6', '#C8285A', '#E53C75'];

const Env: React.FC = () => {
	const {gl, scene} = useThree();
	useMemo(() => {
		const pmrem = new THREE.PMREMGenerator(gl);
		scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
		pmrem.dispose();
	}, [gl, scene]);
	return null;
};

/** Glossy spheres burst from a point and fall under gravity — the sale "lands". Pure function of `t` (seconds). */
export const SphereBurst: React.FC<{t: number; origin?: [number, number, number]; n?: number}> = ({t, origin = [0.25, 0.7, 0], n = 26}) => {
	if (t < 0 || t > 0.95) return null;
	return (
		<div style={{position: 'absolute', inset: 0, pointerEvents: 'none'}}>
			<ThreeCanvas width={1080} height={1920} camera={{position: [0, 0, 10], fov: 40}}>
				<Env />
				<ambientLight intensity={0.3} />
				<directionalLight position={[3, 5, 6]} intensity={1.6} />
				{Array.from({length: n}).map((_, i) => {
					const a = rand(i * 3.1) * Math.PI * 2;
					const sp = 3 + rand(i * 5.7) * 6;
					const vx = Math.cos(a) * sp;
					const vy = Math.abs(Math.sin(a)) * sp * 0.9 + 2;
					const vz = (rand(i * 9.3) - 0.3) * 6;
					const x = origin[0] + vx * t;
					const y = origin[1] + vy * t - 0.5 * 14 * t * t;
					const z = origin[2] + vz * t;
					const r = (0.1 + rand(i * 2.2) * 0.17) * Math.min(1, t * 8) * (1 - Math.min(1, Math.max(0, (t - 0.55) / 0.35)));
					return (
						<mesh key={i} position={[x, y, z]} scale={[Math.max(r, 0.0001), Math.max(r, 0.0001), Math.max(r, 0.0001)]}>
							<sphereGeometry args={[1, 40, 40]} />
							<meshPhysicalMaterial color={COLS[i % COLS.length]} roughness={0.12} metalness={0.1} clearcoat={1} clearcoatRoughness={0.05} envMapIntensity={0.5} />
						</mesh>
					);
				})}
			</ThreeCanvas>
		</div>
	);
};
