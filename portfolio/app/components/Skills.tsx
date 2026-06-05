'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

const skillGroups = [
  {
    label: 'Backend & APIs',
    color: '#6c63ff',
    skills: [
      { name: 'Python / FastAPI / Django', level: 95 },
      { name: 'Node.js / Express', level: 88 },
      { name: 'RESTful APIs / GraphQL', level: 90 },
      { name: 'Laravel / PHP', level: 80 },
    ],
  },
  {
    label: 'AI & Machine Learning',
    color: '#00f5d4',
    skills: [
      { name: 'PyTorch / TensorFlow', level: 85 },
      { name: 'LLM Integration / Prompt Eng.', level: 90 },
      { name: 'ML Pipelines / Training', level: 82 },
      { name: 'MCP Tools / AI Agents', level: 88 },
    ],
  },
  {
    label: 'Infrastructure & Data',
    color: '#ff6584',
    skills: [
      { name: 'PostgreSQL / MongoDB', level: 88 },
      { name: 'Docker / CI-CD', level: 82 },
      { name: 'Web Scraping / Automation', level: 92 },
      { name: 'TypeScript / React / Next.js', level: 85 },
    ],
  },
];

const techStack = [
  'Python', 'TypeScript', 'Node.js', 'FastAPI', 'Django', 'React', 'Next.js',
  'PyTorch', 'Docker', 'PostgreSQL', 'MongoDB', 'Redis', 'Laravel', 'n8n',
  'Langchain', 'OpenAI API', 'Vercel', 'Git', 'Linux', 'Playwright',
];

function SkillBar({ name, level, color, delay }: { name: string; level: number; color: string; delay: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  return (
    <div ref={ref} className="mb-4">
      <div className="flex justify-between items-center mb-1.5">
        <span className="text-sm text-slate-300 font-medium">{name}</span>
        <span className="text-xs font-mono" style={{ color }}>{level}%</span>
      </div>
      <div className="skill-bar">
        <motion.div
          className="skill-bar-fill"
          initial={{ width: 0 }}
          animate={inView ? { width: `${level}%` } : { width: 0 }}
          transition={{ duration: 1, delay, ease: 'easeOut' }}
          style={{ background: `linear-gradient(90deg, ${color}88, ${color})` }}
        />
      </div>
    </div>
  );
}

export default function Skills() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section id="skills" className="relative py-32 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-full"
          style={{ background: 'linear-gradient(to bottom, transparent, rgba(108,99,255,0.2), transparent)' }} />
      </div>

      <div ref={ref} className="max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="tag mb-4 inline-block">Technical Expertise</span>
          <h2 className="text-4xl sm:text-5xl font-black text-white mb-4">
            Skills &amp; <span className="text-gradient">Stack</span>
          </h2>
          <p className="text-slate-400 max-w-xl mx-auto">
            A versatile toolkit built through years of real-world projects — from AI systems to production APIs.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {skillGroups.map((group, gi) => (
            <motion.div
              key={group.label}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: gi * 0.15 }}
              className="glass rounded-2xl p-6 card-hover"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-3 h-3 rounded-full" style={{ background: group.color, boxShadow: `0 0 10px ${group.color}` }} />
                <h3 className="font-bold text-white text-sm tracking-wide uppercase">{group.label}</h3>
              </div>
              {group.skills.map((skill, si) => (
                <SkillBar key={skill.name} {...skill} color={group.color} delay={gi * 0.15 + si * 0.1} />
              ))}
            </motion.div>
          ))}
        </div>

        {/* Tech cloud */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="glass rounded-2xl p-8"
        >
          <h3 className="text-center text-sm font-semibold text-slate-500 uppercase tracking-widest mb-6">Technologies I Work With</h3>
          <div className="flex flex-wrap gap-3 justify-center">
            {techStack.map((tech, i) => (
              <motion.span
                key={tech}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={inView ? { opacity: 1, scale: 1 } : {}}
                transition={{ duration: 0.3, delay: 0.5 + i * 0.03 }}
                whileHover={{ scale: 1.1, y: -2 }}
                className="tag cursor-default"
              >
                {tech}
              </motion.span>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
