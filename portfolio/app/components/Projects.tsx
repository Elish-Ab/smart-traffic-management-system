'use client';

import { useRef, useState } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { ExternalLink, GitFork, Brain, Server, Zap, Globe, Bot, Database } from "lucide-react";

const categories = ['All', 'AI/ML', 'Backend', 'Automation', 'Web'];

const projects = [
  {
    title: 'Smart Traffic Management System',
    desc: 'AI-powered real-time traffic management system using computer vision, IoT signals, and ML models to optimize city traffic flow dynamically.',
    tags: ['Python', 'ML', 'IoT', 'Computer Vision', 'React'],
    category: 'AI/ML',
    icon: Brain,
    color: '#6c63ff',
    github: 'https://github.com/elish-ab/smart-traffic-management-system',
    featured: true,
  },
  {
    title: 'BetaFits MCP Tools',
    desc: 'Custom MCP (Model Context Protocol) toolset that integrates AI agents with external services, enabling autonomous workflow automation.',
    tags: ['Python', 'MCP', 'LLM', 'AI Agents', 'API'],
    category: 'AI/ML',
    icon: Bot,
    color: '#00f5d4',
    github: 'https://github.com/elish-ab/betafits-mcp-tools',
    featured: true,
  },
  {
    title: 'DevFlow AI',
    desc: 'Developer productivity platform powered by AI — automates code reviews, issue tracking, and workflow orchestration for engineering teams.',
    tags: ['TypeScript', 'Next.js', 'OpenAI', 'GitHub API'],
    category: 'AI/ML',
    icon: Zap,
    color: '#ff6584',
    github: 'https://github.com/elish-ab/devflow-ai',
    featured: true,
  },
  {
    title: 'Metacura',
    desc: 'AI-driven healthcare automation backend — processes medical data, generates insights, and automates patient management workflows.',
    tags: ['Python', 'FastAPI', 'ML', 'Healthcare', 'Automation'],
    category: 'Backend',
    icon: Server,
    color: '#a78bfa',
    github: 'https://github.com/elish-ab/metacura',
    featured: false,
  },
  {
    title: 'Simless Platform',
    desc: 'Modern SaaS landing page and backend for a telecom automation service with real-time data and seamless API integrations.',
    tags: ['TypeScript', 'Next.js', 'Vercel', 'API'],
    category: 'Web',
    icon: Globe,
    color: '#f59e0b',
    github: 'https://github.com/elish-ab/simless-',
    live: 'https://v0-next-js-landing-page-theta-nine.vercel.app',
    featured: false,
  },
  {
    title: 'Google Maps Scraper Automation',
    desc: 'Production-grade web scraper for Google Maps business data extraction with anti-detection, proxy rotation, and data pipeline output.',
    tags: ['Python', 'Playwright', 'Automation', 'Data'],
    category: 'Automation',
    icon: Database,
    color: '#10b981',
    github: 'https://github.com/elish-ab/Google_Map_Scraper_Automation',
    featured: false,
  },
  {
    title: 'ENB Stock Platform',
    desc: 'Real-time stock market dashboard with live data feeds, portfolio tracking, and AI-powered price predictions.',
    tags: ['TypeScript', 'React', 'Finance API', 'Charts'],
    category: 'Web',
    icon: Zap,
    color: '#06b6d4',
    github: 'https://github.com/elish-ab/enb-stock',
    live: 'https://enb-stock-two.vercel.app',
    featured: false,
  },
  {
    title: 'EU Scraper / CVR Scraper',
    desc: 'Enterprise-level data collection pipelines scraping EU business registries and Danish CVR data for lead generation and compliance.',
    tags: ['Python', 'Requests', 'BeautifulSoup', 'Data Pipeline'],
    category: 'Automation',
    icon: Database,
    color: '#8b5cf6',
    github: 'https://github.com/elish-ab/Scraper-EU',
    featured: false,
  },
  {
    title: 'Brent Oil Price Predictor',
    desc: 'Time-series ML model predicting Brent crude oil prices using LSTM neural networks and economic feature engineering.',
    tags: ['Python', 'PyTorch', 'LSTM', 'Jupyter', 'Pandas'],
    category: 'AI/ML',
    icon: Brain,
    color: '#f97316',
    github: 'https://github.com/elish-ab/Brent-Oil-Price-Prediction',
    featured: false,
  },
];

function ProjectCard({ project, idx }: { project: typeof projects[0]; idx: number }) {
  const [hovered, setHovered] = useState(false);
  const Icon = project.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 30, scale: 0.95 }}
      transition={{ duration: 0.4, delay: idx * 0.07 }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      className="glass rounded-2xl overflow-hidden card-hover group relative"
    >
      {project.featured && (
        <div className="absolute top-3 right-3 z-10">
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
            style={{ background: `${project.color}22`, color: project.color, border: `1px solid ${project.color}44` }}>
            Featured
          </span>
        </div>
      )}

      <div className="p-6">
        <div className="flex items-start gap-4 mb-4">
          <motion.div
            animate={hovered ? { scale: 1.15, rotate: 5 } : { scale: 1, rotate: 0 }}
            transition={{ duration: 0.3 }}
            className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: `${project.color}18`, border: `1px solid ${project.color}33` }}
          >
            <Icon size={20} style={{ color: project.color }} />
          </motion.div>
          <div>
            <h3 className="font-bold text-white text-base mb-1 group-hover:text-gradient-blue transition-all">{project.title}</h3>
            <span className="tag text-xs">{project.category}</span>
          </div>
        </div>

        <p className="text-slate-400 text-sm leading-relaxed mb-5">{project.desc}</p>

        <div className="flex flex-wrap gap-1.5 mb-5">
          {project.tags.map((t) => (
            <span key={t} className="text-xs px-2 py-0.5 rounded-md"
              style={{ background: `${project.color}12`, color: `${project.color}cc`, border: `1px solid ${project.color}22` }}>
              {t}
            </span>
          ))}
        </div>

        <div className="flex gap-3">
          {project.github && (
            <motion.a href={project.github} target="_blank" rel="noopener noreferrer"
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
            >
              <GitFork size={13} />
              <span>Code</span>
            </motion.a>
          )}
          {project.live && (
            <motion.a href={project.live} target="_blank" rel="noopener noreferrer"
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              className="flex items-center gap-1.5 text-xs transition-colors"
              style={{ color: project.color }}
            >
              <ExternalLink size={13} />
              <span>Live Demo</span>
            </motion.a>
          )}
        </div>
      </div>

      {/* Bottom accent line */}
      <motion.div
        className="h-0.5 w-0"
        animate={hovered ? { width: '100%' } : { width: '0%' }}
        transition={{ duration: 0.3 }}
        style={{ background: `linear-gradient(90deg, transparent, ${project.color}, transparent)` }}
      />
    </motion.div>
  );
}

export default function Projects() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  const [filter, setFilter] = useState('All');

  const filtered = filter === 'All' ? projects : projects.filter((p) => p.category === filter);

  return (
    <section id="projects" className="relative py-32 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none grid-bg opacity-40" />

      <div ref={ref} className="max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <span className="tag mb-4 inline-block">Portfolio</span>
          <h2 className="text-4xl sm:text-5xl font-black text-white mb-4">
            Featured <span className="text-gradient">Projects</span>
          </h2>
          <p className="text-slate-400 max-w-xl mx-auto">
            30+ projects shipped — from AI automation pipelines to production web apps.
          </p>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.2 }}
          className="flex flex-wrap gap-2 justify-center mb-10"
        >
          {categories.map((cat) => (
            <motion.button
              key={cat}
              onClick={() => setFilter(cat)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                filter === cat
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/40'
                  : 'glass text-slate-400 hover:text-white'
              }`}
            >
              {cat}
            </motion.button>
          ))}
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <AnimatePresence mode="popLayout">
            {filtered.map((project, i) => (
              <ProjectCard key={project.title} project={project} idx={i} />
            ))}
          </AnimatePresence>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.6 }}
          className="text-center mt-10"
        >
          <a href="https://github.com/elish-ab" target="_blank" rel="noopener noreferrer" className="btn-secondary">
            <GitFork size={16} />
            View All on GitHub
          </a>
        </motion.div>
      </div>
    </section>
  );
}
