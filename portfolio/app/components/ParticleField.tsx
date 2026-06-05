'use client';

import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

function Particles() {
  const mesh = useRef<THREE.Points>(null);
  const count = 2000;

  const [positions, colors] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const palette = [
      new THREE.Color('#6c63ff'),
      new THREE.Color('#00f5d4'),
      new THREE.Color('#ff6584'),
      new THREE.Color('#a78bfa'),
    ];
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 30;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 30;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 15;
      const c = palette[Math.floor(Math.random() * palette.length)];
      col[i * 3] = c.r;
      col[i * 3 + 1] = c.g;
      col[i * 3 + 2] = c.b;
    }
    return [pos, col];
  }, []);

  useFrame(({ clock }) => {
    if (!mesh.current) return;
    mesh.current.rotation.y = clock.getElapsedTime() * 0.04;
    mesh.current.rotation.x = Math.sin(clock.getElapsedTime() * 0.02) * 0.1;
  });

  return (
    <points ref={mesh}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.05} vertexColors transparent opacity={0.7} sizeAttenuation />
    </points>
  );
}

function FloatingRing({ radius, color, speed, tilt }: { radius: number; color: string; speed: number; tilt: number }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    ref.current.rotation.z = clock.getElapsedTime() * speed;
    ref.current.rotation.x = tilt + Math.sin(clock.getElapsedTime() * 0.3) * 0.1;
  });
  return (
    <mesh ref={ref}>
      <torusGeometry args={[radius, 0.015, 8, 120]} />
      <meshBasicMaterial color={color} transparent opacity={0.3} />
    </mesh>
  );
}

function NeuralNet() {
  const ref = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    ref.current.rotation.y = clock.getElapsedTime() * 0.08;
  });

  const nodes = useMemo(() => {
    const n = [];
    const layers = [4, 6, 6, 4];
    let x = -3;
    for (const count of layers) {
      for (let i = 0; i < count; i++) {
        n.push(new THREE.Vector3(x, (i - count / 2) * 0.8, (Math.random() - 0.5) * 0.5));
      }
      x += 2;
    }
    return n;
  }, []);

  return (
    <group ref={ref} position={[0, 0, -4]} scale={0.6}>
      {nodes.map((pos, i) => (
        <mesh key={i} position={pos}>
          <sphereGeometry args={[0.08, 8, 8]} />
          <meshBasicMaterial color="#6c63ff" transparent opacity={0.6} />
        </mesh>
      ))}
    </group>
  );
}

export default function ParticleField() {
  return (
    <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }}>
      <Canvas camera={{ position: [0, 0, 10], fov: 60 }} gl={{ antialias: false, alpha: true }}>
        <Particles />
        <FloatingRing radius={5} color="#6c63ff" speed={0.15} tilt={0.5} />
        <FloatingRing radius={7} color="#00f5d4" speed={-0.08} tilt={1.2} />
        <FloatingRing radius={3.5} color="#ff6584" speed={0.2} tilt={0.3} />
        <NeuralNet />
      </Canvas>
    </div>
  );
}
