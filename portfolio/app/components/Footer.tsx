'use client';

import { motion } from 'framer-motion';
import { GitFork, Mail, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="relative border-t border-slate-800/60 py-10 px-6">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-600 to-cyan-400 flex items-center justify-center text-white font-bold text-xs">
            EA
          </div>
          <span className="text-slate-400 text-sm">
            Built with <Heart size={11} className="inline text-red-400 mx-1" /> by Elish — 2026
          </span>
        </div>

        <div className="flex items-center gap-4">
          {[
            { href: 'https://github.com/elish-ab', icon: GitFork },
            { href: 'mailto:elishabu28@gmail.com', icon: Mail },
          ].map(({ href, icon: Icon }) => (
            <motion.a
              key={href}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.2, y: -2 }}
              className="text-slate-600 hover:text-slate-300 transition-colors"
            >
              <Icon size={17} />
            </motion.a>
          ))}
        </div>

        <p className="text-slate-600 text-xs">Backend · AI · ML · Automation</p>
      </div>
    </footer>
  );
}
