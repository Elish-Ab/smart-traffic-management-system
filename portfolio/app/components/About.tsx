'use client';

import { useRef, Suspense } from 'react';
import { motion, useInView } from 'framer-motion';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import * as THREE from 'three';
import { Code2, Brain, Server, Cpu } from 'lucide-react';

function BrainModel() {
  const group = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (group.current) {
      group.current.rotation.y = clock.getElapsedTime() * 0.25;
    }
  });

  const nodes = Array.from({ length: 18 }, (_, i) => {
    const phi = Math.acos(-1 + (2 * i) / 18);
    const theta = Math.sqrt(18 * Math.PI) * phi;
    return new THREE.Vector3(
      Math.cos(theta) * Math.sin(phi) * 1.8,
      Math.sin(theta) * Math.sin(phi) * 1.8,
      Math.cos(phi) * 1.8
    );
  });

  return (
    <Float speed={1.5} floatIntensity={0.4}>
      <group ref={group}>
        {nodes.map((pos, i) => (
          <mesh key={i} position={pos}>
            <sphereGeometry args={[0.12, 8, 8]} />
            <meshBasicMaterial color={i % 3 === 0 ? '#6c63ff' : i % 3 === 1 ? '#00f5d4' : '#ff6584'} transparent opacity={0.8} />
          </mesh>
        ))}
        {nodes.slice(0, 12).map((a, i) =>
          nodes.slice(i + 1, i + 3).map((b, j) => {
            const points = [a, b];
            const geo = new THREE.BufferGeometry().setFromPoints(points);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const Line = 'line' as any;
            return (
              <Line key={`${i}-${j}`} geometry={geo}>
                <lineBasicMaterial color="#6c63ff" transparent opacity={0.2} />
              </Line>
            );
          })
        )}
        <mesh>
          <icosahedronGeometry args={[1.4, 1]} />
          <meshBasicMaterial color="#6c63ff" wireframe transparent opacity={0.08} />
        </mesh>
      </group>
    </Float>
  );
}

const traits = [
  {
    icon: Brain,
    title: 'AI-First Thinking',
    desc: 'Every system I build has AI at its core. I integrate LLMs, ML models, and autonomous agents into real products.',
    color: '#6c63ff',
  },
  {
    icon: Server,
    title: 'Backend Mastery',
    desc: 'Production-grade APIs, microservices, and scalable data pipelines using Python, Node.js, and cloud infrastructure.',
    color: '#00f5d4',
  },
  {
    icon: Cpu,
    title: 'ML Engineering',
    desc: 'From data collection to model deployment — trained on PyTorch with real-world forecasting and classification models.',
    color: '#ff6584',
  },
  {
    icon: Code2,
    title: 'Full-Stack Reach',
    desc: 'TypeScript, React, Next.js, and Laravel let me build complete products end-to-end without bottlenecks.',
    color: '#a78bfa',
  },
];

export default function About() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section id="about" className="relative py-32">
      <div ref={ref} className="max-w-6xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* 3D visual */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="h-[380px] relative"
          >
            <div className="absolute inset-0 rounded-3xl overflow-hidden glass">
              <Canvas camera={{ position: [0, 0, 5], fov: 50 }} gl={{ alpha: true }}>
                <ambientLight intensity={0.5} />
                <pointLight position={[5, 5, 5]} intensity={1.5} color="#6c63ff" />
                <pointLight position={[-5, -5, 5]} intensity={1} color="#00f5d4" />
                <Suspense fallback={null}>
                  <BrainModel />
                </Suspense>
              </Canvas>
            </div>

            {/* Floating badges */}
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -bottom-4 -right-4 glass rounded-2xl px-4 py-3 shadow-xl"
            >
              <div className="text-xs text-slate-500 mb-0.5">Experience</div>
              <div className="text-white font-bold text-sm">3+ Years</div>
            </motion.div>

            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
              className="absolute -top-4 -left-4 glass rounded-2xl px-4 py-3 shadow-xl"
            >
              <div className="text-xs text-slate-500 mb-0.5">Projects</div>
              <div className="text-gradient-blue font-bold text-sm">30+ Shipped</div>
            </motion.div>
          </motion.div>

          {/* Content */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6 }}
            >
              <span className="tag mb-4 inline-block">About Me</span>
              <h2 className="text-4xl sm:text-5xl font-black text-white mb-6">
                Building the <span className="text-gradient">Intelligent</span> Web
              </h2>
              <p className="text-slate-400 leading-relaxed mb-4">
                I&apos;m a Backend &amp; AI Automation Engineer with a strong Machine Learning background. I specialize in
                designing intelligent systems that combine robust backend architecture with the power of modern AI.
              </p>
              <p className="text-slate-400 leading-relaxed mb-8">
                Whether it&apos;s a real-time traffic AI system, an MCP agent framework, or a data scraping pipeline —
                I turn complex requirements into clean, scalable software that delivers real business value.
              </p>
            </motion.div>

            <div className="grid grid-cols-2 gap-4">
              {traits.map((trait, i) => {
                const Icon = trait.icon;
                return (
                  <motion.div
                    key={trait.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={inView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.5, delay: 0.2 + i * 0.1 }}
                    whileHover={{ scale: 1.03, y: -3 }}
                    className="glass rounded-xl p-4 cursor-default"
                  >
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-3"
                      style={{ background: `${trait.color}18` }}>
                      <Icon size={16} style={{ color: trait.color }} />
                    </div>
                    <h4 className="text-white font-semibold text-sm mb-1">{trait.title}</h4>
                    <p className="text-slate-500 text-xs leading-relaxed">{trait.desc}</p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
