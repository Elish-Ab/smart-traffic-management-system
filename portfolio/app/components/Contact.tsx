'use client';

import { useRef, useState, Suspense } from 'react';
import { motion, useInView } from 'framer-motion';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Mail, GitFork, MessageSquare, Send, MapPin, Clock } from 'lucide-react';

function ContactOrb() {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.rotation.x = clock.getElapsedTime() * 0.2;
      ref.current.rotation.y = clock.getElapsedTime() * 0.3;
    }
  });
  return (
    <mesh ref={ref}>
      <icosahedronGeometry args={[1.5, 2]} />
      <meshBasicMaterial color="#6c63ff" wireframe transparent opacity={0.3} />
    </mesh>
  );
}

const contactInfo = [
  { icon: Mail, label: 'Email', value: 'elishabu28@gmail.com', href: 'mailto:elishabu28@gmail.com', color: '#6c63ff' },
  { icon: GitFork, label: 'GitHub', value: 'github.com/elish-ab', href: 'https://github.com/elish-ab', color: '#00f5d4' },
  { icon: MapPin, label: 'Location', value: 'Available Worldwide', href: null, color: '#ff6584' },
  { icon: Clock, label: 'Response', value: 'Within 24 hours', href: null, color: '#a78bfa' },
];

export default function Contact() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const subject = encodeURIComponent(`Portfolio Inquiry from ${form.name}`);
    const body = encodeURIComponent(`Name: ${form.name}\nEmail: ${form.email}\n\n${form.message}`);
    window.location.href = `mailto:elishabu28@gmail.com?subject=${subject}&body=${body}`;
    setSent(true);
    setTimeout(() => setSent(false), 3000);
  };

  return (
    <section id="contact" className="relative py-32 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full opacity-10 blur-3xl"
          style={{ background: 'radial-gradient(circle, #6c63ff, transparent)' }} />
      </div>

      <div ref={ref} className="max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="tag mb-4 inline-block">Let&apos;s Work Together</span>
          <h2 className="text-4xl sm:text-5xl font-black text-white mb-4">
            Get In <span className="text-gradient">Touch</span>
          </h2>
          <p className="text-slate-400 max-w-xl mx-auto">
            Have a project in mind? Looking for an AI engineer or backend developer? I&apos;m open to exciting opportunities.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-10">
          {/* Left */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7 }}
          >
            <div className="h-56 mb-8 relative glass rounded-2xl overflow-hidden">
              <Canvas camera={{ position: [0, 0, 5], fov: 50 }} gl={{ alpha: true }}>
                <ambientLight intensity={0.5} />
                <pointLight position={[5, 5, 5]} intensity={2} color="#6c63ff" />
                <pointLight position={[-5, -5, 5]} intensity={1} color="#00f5d4" />
                <Suspense fallback={null}>
                  <ContactOrb />
                </Suspense>
              </Canvas>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-3xl mb-1">👋</div>
                  <p className="text-white font-bold text-sm">Available for new projects</p>
                  <div className="flex items-center justify-center gap-1.5 mt-1">
                    <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                    <span className="text-xs text-green-400">Online Now</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {contactInfo.map((item, i) => {
                const Icon = item.icon;
                const content = (
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={inView ? { opacity: 1, y: 0 } : {}}
                    transition={{ delay: 0.3 + i * 0.1 }}
                    whileHover={{ scale: 1.03, y: -2 }}
                    className="glass rounded-xl p-4 card-hover"
                  >
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-2"
                      style={{ background: `${item.color}18` }}>
                      <Icon size={15} style={{ color: item.color }} />
                    </div>
                    <div className="text-xs text-slate-500 mb-0.5">{item.label}</div>
                    <div className="text-white text-xs font-medium truncate">{item.value}</div>
                  </motion.div>
                );
                return item.href ? (
                  <a key={item.label} href={item.href} target="_blank" rel="noopener noreferrer">{content}</a>
                ) : (
                  <div key={item.label}>{content}</div>
                );
              })}
            </div>
          </motion.div>

          {/* Right - Form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7 }}
          >
            <form onSubmit={handleSubmit} className="glass rounded-2xl p-8">
              <h3 className="text-white font-bold text-lg mb-6 flex items-center gap-2">
                <MessageSquare size={18} className="text-purple-400" />
                Send a Message
              </h3>

              <div className="space-y-4">
                {[
                  { id: 'name', label: 'Full Name', type: 'text', placeholder: 'John Doe' },
                  { id: 'email', label: 'Email Address', type: 'email', placeholder: 'john@company.com' },
                ].map(({ id, label, type, placeholder }) => (
                  <div key={id}>
                    <label className="block text-xs text-slate-400 font-medium mb-2 uppercase tracking-wide">{label}</label>
                    <input
                      type={type}
                      required
                      placeholder={placeholder}
                      value={form[id as keyof typeof form]}
                      onChange={(e) => setForm((f) => ({ ...f, [id]: e.target.value }))}
                      className="w-full bg-slate-900/60 border border-slate-700/60 rounded-xl px-4 py-3 text-white text-sm placeholder-slate-600 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/30 transition-all"
                    />
                  </div>
                ))}

                <div>
                  <label className="block text-xs text-slate-400 font-medium mb-2 uppercase tracking-wide">Message</label>
                  <textarea
                    required
                    rows={5}
                    placeholder="Tell me about your project..."
                    value={form.message}
                    onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                    className="w-full bg-slate-900/60 border border-slate-700/60 rounded-xl px-4 py-3 text-white text-sm placeholder-slate-600 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/30 transition-all resize-none"
                  />
                </div>

                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  className="w-full btn-primary justify-center py-3 rounded-xl"
                >
                  <span>{sent ? '✓ Message Sent!' : 'Send Message'}</span>
                  {!sent && <Send size={15} />}
                </motion.button>
              </div>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
