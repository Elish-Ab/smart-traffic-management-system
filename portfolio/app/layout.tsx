import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'Elish — Backend & AI Automation Engineer',
  description: 'Portfolio of Elish — Backend Engineer, AI Automation Specialist, and ML Engineer. Building intelligent systems that scale.',
  keywords: ['backend engineer', 'AI automation', 'machine learning', 'Python', 'TypeScript', 'portfolio'],
  openGraph: {
    title: 'Elish — Backend & AI Automation Engineer',
    description: 'Building intelligent backend systems and AI automation pipelines.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
