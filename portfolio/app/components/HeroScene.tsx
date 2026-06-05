'use client';

import { useRef, useMemo, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Sphere, MeshDistortMaterial, Stars } from '@react-three/drei';
import * as THREE from 'three';

function AnimatedSphere() {
  const meshRef = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = clock.getElapsedTime() * 0.15;
      meshRef.current.rotation.x = Math.sin(clock.getElapsedTime() * 0.1) * 0.15;
    }
  });
  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.8}>
      <Sphere ref={meshRef} args={[2.2, 64, 64]}>
        <MeshDistortMaterial
          color="#6c63ff"
          attach="material"
          distort={0.45}
          speed={1.8}
          roughness={0.1}
          metalness={0.6}
          transparent
          opacity={0.85}
        />
      </Sphere>
    </Float>
  );
}

function Rings() {
  const group = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (group.current) {
      group.current.rotation.z = clock.getElapsedTime() * 0.1;
      group.current.rotation.y = clock.getElapsedTime() * 0.05;
    }
  });
  return (
    <group ref={group}>
      {[3.5, 4.5, 5.8].map((r, i) => (
        <mesh key={i} rotation={[Math.PI / 2 + i * 0.4, i * 0.3, 0]}>
          <torusGeometry args={[r, 0.02, 4, 120]} />
          <meshBasicMaterial
            color={['#6c63ff', '#00f5d4', '#ff6584'][i]}
            transparent
            opacity={0.35 - i * 0.05}
          />
        </mesh>
      ))}
    </group>
  );
}

function Particles() {
  const ref = useRef<THREE.Points>(null);
  const [pos, col] = useMemo(() => {
    const n = 1500;
    const p = new Float32Array(n * 3);
    const c = new Float32Array(n * 3);
    const palette = [new THREE.Color('#6c63ff'), new THREE.Color('#00f5d4'), new THREE.Color('#a78bfa')];
    for (let i = 0; i < n; i++) {
      const r = 6 + Math.random() * 10;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      p[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      p[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      p[i * 3 + 2] = r * Math.cos(phi);
      const color = palette[Math.floor(Math.random() * palette.length)];
      c[i * 3] = color.r; c[i * 3 + 1] = color.g; c[i * 3 + 2] = color.b;
    }
    return [p, c];
  }, []);

  useFrame(({ clock }) => {
    if (ref.current) ref.current.rotation.y = clock.getElapsedTime() * 0.03;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[pos, 3]} />
        <bufferAttribute attach="attributes-color" args={[col, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.06} vertexColors transparent opacity={0.8} sizeAttenuation />
    </points>
  );
}

export default function HeroScene() {
  return (
    <div className="w-full h-full">
      <Canvas
        camera={{ position: [0, 0, 10], fov: 50 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.4} />
        <pointLight position={[10, 10, 10]} intensity={1.5} color="#6c63ff" />
        <pointLight position={[-10, -10, -10]} intensity={0.8} color="#00f5d4" />
        <pointLight position={[0, 10, -5]} intensity={0.6} color="#ff6584" />
        <Suspense fallback={null}>
          <AnimatedSphere />
          <Rings />
          <Particles />
          <Stars radius={60} depth={30} count={1000} factor={2} fade speed={0.5} />
        </Suspense>
      </Canvas>
    </div>
  );
}
