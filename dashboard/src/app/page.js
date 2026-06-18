'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import {
  Activity, ArrowRight, BarChart3, MousePointerClick, Eye,
  Zap, Shield, Code2, Globe, Terminal, Copy, Check,
  ChevronRight, Layers, Clock, Users, TrendingUp, Sparkles
} from 'lucide-react';

// ─── Animated Counter ─────────────────────────────────────
function AnimatedNumber({ value, suffix = '' }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;
    let start = 0;
    const end = parseInt(value);
    const duration = 2000;
    const increment = end / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [value, isInView]);

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

// ─── Feature Card ─────────────────────────────────────────
function FeatureCard({ icon: Icon, title, description, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }}
      className="group relative rounded-2xl border border-border bg-card p-8 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 overflow-hidden"
    >
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-accent/[0.03] to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      <div className="relative z-10">
        <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10 text-accent transition-all duration-300 group-hover:bg-accent group-hover:text-white group-hover:shadow-accent">
          <Icon size={24} />
        </div>
        <h3 className="font-display text-xl font-medium tracking-tight text-foreground mb-2">{title}</h3>
        <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
      </div>
    </motion.div>
  );
}

// ─── Step Card ────────────────────────────────────────────
function StepCard({ number, title, description, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }}
      className="text-center"
    >
      <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-accent to-accent-secondary text-white font-display text-xl shadow-accent">
        {number}
      </div>
      <h3 className="font-display text-lg font-medium tracking-tight text-foreground mb-2">{title}</h3>
      <p className="text-sm leading-relaxed text-muted-foreground max-w-xs mx-auto">{description}</p>
    </motion.div>
  );
}

// ─── Code Block ───────────────────────────────────────────
function CodeBlock() {
  const [copied, setCopied] = useState(false);

  const code = `<script src="https://cdn.analyzr.dev/tracker.js"></script>
<script>
  UserAnalytics.init({
    endpoint: 'https://api.analyzr.dev',
    siteId: 'your-site-id'
  });
</script>`;

  async function handleCopy() {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="relative rounded-2xl border border-border bg-[#0d1117] overflow-hidden shadow-xl"
    >
      <div className="flex items-center justify-between px-5 py-3 border-b border-white/10">
        <div className="flex gap-2">
          <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
          <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
          <div className="w-3 h-3 rounded-full bg-[#28c840]" />
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors px-3 py-1.5 rounded-lg hover:bg-white/10"
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
      <pre className="p-6 text-sm text-gray-300 font-mono leading-relaxed overflow-x-auto">
        <code>{code}</code>
      </pre>
    </motion.div>
  );
}

// ─── Floating Nav ─────────────────────────────────────────
function FloatingNav({ isAuthenticated }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-card/80 backdrop-blur-xl border-b border-border shadow-sm' : 'bg-transparent'
      }`}
    >
      <div className="mx-auto max-w-6xl flex items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-3 group">
          <img src="/logo.png" alt="Analyzr" className="h-10 w-10 rounded-xl shadow-sm group-hover:shadow-accent transition-shadow" />
          <span className="font-display text-xl tracking-tight text-foreground">Analyzr</span>
        </Link>

        <div className="hidden sm:flex items-center gap-8 text-sm text-muted-foreground">
          <a href="#features" className="hover:text-foreground transition-colors">Features</a>
          <a href="#how-it-works" className="hover:text-foreground transition-colors">How it Works</a>
          <a href="#integration" className="hover:text-foreground transition-colors">Integration</a>
        </div>

        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <Link href="/sites">
              <Button size="sm">
                Dashboard <ArrowRight size={16} className="ml-2" />
              </Button>
            </Link>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm">Sign in</Button>
              </Link>
              <Link href="/signup">
                <Button size="sm">
                  Get Started <ArrowRight size={16} className="ml-2" />
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </motion.nav>
  );
}

// ─── Main Landing Page ────────────────────────────────────
export default function LandingPage() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Activity className="h-10 w-10 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      <FloatingNav isAuthenticated={isAuthenticated} />

      {/* ─── Hero Section ─────────────────────────────────── */}
      <section className="relative pt-32 pb-20 sm:pt-40 sm:pb-32 px-6">
        {/* Background effects */}
        <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 h-[600px] w-[800px] rounded-full bg-accent/[0.06] blur-[120px]" />
        <div className="pointer-events-none absolute top-40 right-0 h-[400px] w-[400px] rounded-full bg-accent-secondary/[0.04] blur-[100px]" />
        <div className="pointer-events-none absolute inset-0 bg-dot-pattern-dark opacity-40" />

        <div
          className="relative z-10 mx-auto max-w-4xl text-center"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <Badge variant="accent" dot pulsing className="mb-8 mx-auto">
              Open Source Analytics
            </Badge>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="font-display text-5xl sm:text-6xl lg:text-7xl font-normal tracking-tight text-foreground leading-[1.1] mb-6"
          >
            Understand Your{' '}
            <span className="gradient-text">Users</span>
            <br />
            Like Never Before
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.35 }}
            className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Lightweight, privacy-first analytics with session tracking,
            click heatmaps, and real-time insights. One script tag.
            Zero complexity.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link href={isAuthenticated ? '/sites' : '/signup'}>
              <Button size="lg" className="min-w-[200px]">
                {isAuthenticated ? 'Go to Dashboard' : 'Start for Free'}
                <ArrowRight size={18} className="ml-2" />
              </Button>
            </Link>
            <a href="#integration">
              <Button variant="secondary" size="lg" className="min-w-[200px]">
                <Code2 size={18} className="mr-2" />
                View Integration
              </Button>
            </a>
          </motion.div>

          {/* Stats row */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.65 }}
            className="mt-16 grid grid-cols-3 gap-8 max-w-lg mx-auto"
          >
            <div>
              <p className="font-display text-3xl sm:text-4xl tracking-tight text-foreground">
                <AnimatedNumber value={2} />KB
              </p>
              <p className="text-xs font-mono uppercase tracking-wider text-muted-foreground mt-1">SDK Size</p>
            </div>
            <div>
              <p className="font-display text-3xl sm:text-4xl tracking-tight text-foreground">
                <AnimatedNumber value={0} />ms
              </p>
              <p className="text-xs font-mono uppercase tracking-wider text-muted-foreground mt-1">Render Impact</p>
            </div>
            <div>
              <p className="font-display text-3xl sm:text-4xl tracking-tight text-foreground">
                <AnimatedNumber value={100} suffix="%" />
              </p>
              <p className="text-xs font-mono uppercase tracking-wider text-muted-foreground mt-1">Open Source</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── Dashboard Preview ────────────────────────────── */}
      <section className="relative px-6 pb-24">
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="mx-auto max-w-5xl"
        >
          <div className="rounded-2xl bg-gradient-to-br from-accent via-accent-secondary to-accent p-[2px] shadow-accent-lg">
            <div className="rounded-[calc(16px-2px)] bg-card overflow-hidden">
              {/* Mock browser chrome */}
              <div className="flex items-center gap-2 px-5 py-3 bg-muted/50 border-b border-border">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400/60" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400/60" />
                  <div className="w-3 h-3 rounded-full bg-green-400/60" />
                </div>
                <div className="flex-1 mx-4">
                  <div className="mx-auto max-w-md rounded-lg bg-background border border-border px-4 py-1.5 text-xs text-muted-foreground font-mono text-center">
                    app.analyzr.dev/sites/dashboard
                  </div>
                </div>
              </div>
              {/* Mock dashboard content */}
              <div className="p-8 sm:p-10">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                  {[
                    { label: 'Total Sessions', value: '2,847', icon: Users, color: 'accent' },
                    { label: 'Page Views', value: '12,453', icon: Eye, color: 'blue-500' },
                    { label: 'Click Events', value: '8,291', icon: MousePointerClick, color: 'purple-500' },
                    { label: 'Avg. Duration', value: '3m 42s', icon: Clock, color: 'emerald-500' },
                  ].map((stat, i) => (
                    <div key={i} className="rounded-xl border border-border bg-background p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <stat.icon size={14} className={`text-${stat.color}`} />
                        <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">{stat.label}</span>
                      </div>
                      <p className="text-xl font-bold text-foreground">{stat.value}</p>
                    </div>
                  ))}
                </div>
                {/* Mock chart area */}
                <div className="rounded-xl border border-border bg-background p-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-medium text-foreground">Page Views Over Time</span>
                    <span className="flex items-center gap-1 text-xs text-emerald-600 font-medium">
                      <TrendingUp size={12} /> +24.3%
                    </span>
                  </div>
                  {/* SVG chart */}
                  <svg viewBox="0 0 600 120" className="w-full h-auto">
                    <defs>
                      <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.2" />
                        <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    <path
                      d="M0,90 C50,85 80,70 120,65 C160,60 200,75 240,50 C280,25 320,40 360,35 C400,30 440,20 480,25 C520,30 560,15 600,10 L600,120 L0,120 Z"
                      fill="url(#chartGradient)"
                    />
                    <path
                      d="M0,90 C50,85 80,70 120,65 C160,60 200,75 240,50 C280,25 320,40 360,35 C400,30 440,20 480,25 C520,30 560,15 600,10"
                      fill="none"
                      stroke="var(--accent)"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ─── Features ─────────────────────────────────────── */}
      <section id="features" className="relative py-24 px-6">
        <div className="pointer-events-none absolute top-0 left-0 h-[400px] w-[400px] rounded-full bg-accent/[0.03] blur-[120px]" />
        <div className="mx-auto max-w-6xl relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <Badge variant="accent" dot className="mb-6 mx-auto">Features</Badge>
            <h2 className="font-display text-4xl sm:text-5xl font-normal tracking-tight text-foreground mb-4">
              Everything You <span className="gradient-text">Need</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              A complete toolkit to understand how users interact with your website. No bloat. No compromise.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard
              icon={MousePointerClick}
              title="Click Heatmaps"
              description="Visualize exactly where users click with beautiful, real-time heatmaps overlaid directly on your pages."
              delay={0}
            />
            <FeatureCard
              icon={Layers}
              title="Session Replay"
              description="Browse detailed session timelines showing every page view, click, and navigation path users take."
              delay={0.1}
            />
            <FeatureCard
              icon={BarChart3}
              title="Real-time Dashboard"
              description="Monitor page views, sessions, clicks, and engagement metrics through a clean, live dashboard."
              delay={0.2}
            />
            <FeatureCard
              icon={Zap}
              title="Lightweight SDK"
              description="Under 2KB gzipped. Zero dependencies. No impact on your site performance or Core Web Vitals."
              delay={0.3}
            />
            <FeatureCard
              icon={Shield}
              title="Privacy First"
              description="Self-hosted. No cookies for cross-site tracking. No personal data collection. GDPR-friendly by design."
              delay={0.4}
            />
            <FeatureCard
              icon={Globe}
              title="SPA Support"
              description="Automatically tracks client-side navigation in React, Next.js, Vue, and any single-page application."
              delay={0.5}
            />
          </div>
        </div>
      </section>

      {/* ─── How It Works ─────────────────────────────────── */}
      <section id="how-it-works" className="relative py-24 px-6 bg-muted/30">
        <div className="mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <Badge variant="accent" dot className="mb-6 mx-auto">How It Works</Badge>
            <h2 className="font-display text-4xl sm:text-5xl font-normal tracking-tight text-foreground mb-4">
              Up and Running in <span className="gradient-text">Minutes</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              Three simple steps from zero to full user analytics.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-12 sm:gap-8">
            <StepCard
              number="1"
              title="Create an Account"
              description="Sign up for free and register your website in the dashboard."
              delay={0}
            />
            <StepCard
              number="2"
              title="Add the Script"
              description="Copy our tiny tracking snippet and paste it into your site's HTML."
              delay={0.15}
            />
            <StepCard
              number="3"
              title="Watch the Data"
              description="See sessions, clicks, and heatmaps populate in real time."
              delay={0.3}
            />
          </div>
        </div>
      </section>

      {/* ─── Integration / Code ───────────────────────────── */}
      <section id="integration" className="relative py-24 px-6">
        <div className="pointer-events-none absolute bottom-0 right-0 h-[400px] w-[400px] rounded-full bg-accent-secondary/[0.04] blur-[120px]" />
        <div className="mx-auto max-w-5xl relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <Badge variant="accent" dot className="mb-6">Integration</Badge>
              <h2 className="font-display text-4xl sm:text-5xl font-normal tracking-tight text-foreground mb-4">
                One Script. <span className="gradient-text">Done.</span>
              </h2>
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                Add a single script tag to your website — or install via NPM for React, Next.js, and Vue projects. That's it.
              </p>

              <div className="space-y-4">
                {[
                  { icon: Terminal, text: 'Works with HTML, React, Next.js, Vue, and more' },
                  { icon: Zap, text: 'Auto-detects SPA navigation out of the box' },
                  { icon: Shield, text: 'Batched event sending with sendBeacon fallback' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm text-muted-foreground">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10 text-accent shrink-0">
                      <item.icon size={16} />
                    </div>
                    {item.text}
                  </div>
                ))}
              </div>
            </motion.div>

            <CodeBlock />
          </div>
        </div>
      </section>

      {/* ─── CTA Section ──────────────────────────────────── */}
      <section className="relative py-24 px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-3xl text-center"
        >
          <div className="rounded-3xl border border-border bg-card p-12 sm:p-16 relative overflow-hidden">
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-accent/[0.04] to-accent-secondary/[0.02]" />
            <div className="relative z-10">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-accent to-accent-secondary text-white shadow-accent-lg">
                <Sparkles size={32} />
              </div>
              <h2 className="font-display text-3xl sm:text-4xl font-normal tracking-tight text-foreground mb-4">
                Ready to <span className="gradient-text">Understand</span> Your Users?
              </h2>
              <p className="text-lg text-muted-foreground mb-8 max-w-lg mx-auto">
                Start tracking user behavior in under 5 minutes. Free forever. No credit card required.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href={isAuthenticated ? '/sites' : '/signup'}>
                  <Button size="lg" className="min-w-[200px]">
                    {isAuthenticated ? 'Open Dashboard' : 'Get Started Free'}
                    <ArrowRight size={18} className="ml-2" />
                  </Button>
                </Link>
                <a href="https://github.com/iyush05/Analyzr" target="_blank" rel="noopener noreferrer">
                  <Button variant="secondary" size="lg" className="min-w-[200px]">
                    <svg viewBox="0 0 24 24" className="mr-2 h-5 w-5" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" /></svg>
                    View on GitHub
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ─── Footer ───────────────────────────────────────── */}
      <footer className="border-t border-border py-12 px-6">
        <div className="mx-auto max-w-6xl flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Analyzr" className="h-8 w-8 rounded-lg" />
            <span className="font-display text-lg tracking-tight text-foreground">Analyzr</span>
          </div>
          <div className="flex items-center gap-8 text-sm text-muted-foreground">
            <a href="https://github.com/iyush05/Analyzr" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">GitHub</a>
            <a href="https://www.npmjs.com/package/@iyush05/analyzr" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">NPM</a>
            <Link href="/login" className="hover:text-foreground transition-colors">Dashboard</Link>
          </div>
          <p className="text-xs text-muted-foreground">
            Built with <span className="text-accent">♥</span> by Ayush Kannaujiya
          </p>
        </div>
      </footer>
    </div>
  );
}
