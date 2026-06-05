'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

const experiences = [
  {
    role: 'AI Automation Engineer',
    company: 'Freelance / Remote',
    period: '2024 — Present',
    desc: 'Designing and deploying AI-powered automation systems for clients across sectors. Building MCP agent tools, LLM integrations, and intelligent workflow orchestration pipelines.',
    tags: ['Python', 'LLM', 'MCP', 'n8n', 'FastAPI'],
    color: '#6c63ff',
  },
  {
    role: 'Backend Developer',
    company: 'Freelance Projects',
    period: '2023 — 2024',
    desc: 'Built production REST APIs, admin dashboards, and data pipelines. Delivered e-commerce backends, task management apps, and real estate platforms for global clients.',
    tags: ['Node.js', 'Laravel', 'PostgreSQL', 'React', 'Docker'],
    color: '#00f5d4',
  },
  {
    role: 'ML Engineer (Academic & Personal)',
    company: 'Research & FYP Projects',
    period: '2022 — 2023',
    desc: 'Developed ML models for time-series prediction, computer vision, and classification tasks. Built the Smart Traffic Management System as a flagship final-year project.',
    tags: ['PyTorch', 'Python', 'Jupyter', 'Computer Vision', 'LSTM'],
    color: '#ff6584',
  },
  {
    role: 'Full-Stack Developer',
    company: 'Personal Projects & Open Source',
    period: '2021 — 2022',
    desc: 'Started building web applications from scratch — React frontends, Node.js backends, and PHP/Laravel apps. Solved 100+ competitive programming problems on HackerRank.',
    tags: ['React', 'JavaScript', 'PHP', 'MySQL', 'HTML/CSS'],
    color: '#a78bfa',
  },
];

const education = [
  {
    degree: 'BSc in Computer Science',
    institution: 'University (2026)',
    desc: 'Focus on Software Engineering, Artificial Intelligence, and distributed systems. Final Year Project: Smart Traffic Management System using AI/ML.',
    color: '#6c63ff',
  },
];

export default function Experience() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section id="experience" className="relative py-32 overflow-hidden">
      <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-px"
        style={{ background: 'linear-gradient(to bottom, transparent, rgba(108,99,255,0.3), transparent)' }} />

      <div ref={ref} className="max-w-4xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="tag mb-4 inline-block">Career</span>
          <h2 className="text-4xl sm:text-5xl font-black text-white mb-4">
            Experience &amp; <span className="text-gradient">Education</span>
          </h2>
          <p className="text-slate-400 max-w-xl mx-auto">
            A journey from curiosity to expertise — building real things at every step.
          </p>
        </motion.div>

        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-8 top-0 bottom-0 w-px md:left-1/2"
            style={{ background: 'linear-gradient(to bottom, #6c63ff44, #00f5d444, transparent)' }} />

          <div className="space-y-8">
            {experiences.map((exp, i) => (
              <motion.div
                key={exp.role}
                initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }}
                animate={inView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.6, delay: i * 0.12 }}
                className={`relative flex gap-8 ${i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} items-start`}
              >
                {/* Timeline dot */}
                <div className="absolute left-8 -translate-x-1/2 md:left-1/2 mt-5 w-3 h-3 rounded-full z-10"
                  style={{ background: exp.color, boxShadow: `0 0 12px ${exp.color}` }} />

                <div className={`ml-16 md:ml-0 md:w-1/2 ${i % 2 === 0 ? 'md:pr-12' : 'md:pl-12'}`}>
                  <div className="glass rounded-2xl p-6 card-hover">
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div>
                        <h3 className="font-bold text-white text-base">{exp.role}</h3>
                        <p className="text-sm" style={{ color: exp.color }}>{exp.company}</p>
                      </div>
                      <span className="text-xs text-slate-500 font-mono bg-slate-800/60 px-2 py-1 rounded-lg whitespace-nowrap">{exp.period}</span>
                    </div>
                    <p className="text-slate-400 text-sm leading-relaxed mb-4">{exp.desc}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {exp.tags.map((t) => (
                        <span key={t} className="text-xs px-2 py-0.5 rounded-md"
                          style={{ background: `${exp.color}12`, color: `${exp.color}bb`, border: `1px solid ${exp.color}22` }}>
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="hidden md:block md:w-1/2" />
              </motion.div>
            ))}
          </div>
        </div>

        {/* Education */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-16 glass rounded-2xl p-8"
        >
          <h3 className="font-bold text-slate-400 text-xs uppercase tracking-widest mb-6">Education</h3>
          {education.map((edu) => (
            <div key={edu.degree} className="flex gap-4 items-start">
              <div className="w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center"
                style={{ background: `${edu.color}18`, border: `1px solid ${edu.color}33` }}>
                <span style={{ color: edu.color }} className="text-lg">🎓</span>
              </div>
              <div>
                <h4 className="text-white font-bold">{edu.degree}</h4>
                <p className="text-sm mb-2" style={{ color: edu.color }}>{edu.institution}</p>
                <p className="text-slate-400 text-sm leading-relaxed">{edu.desc}</p>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
