import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  ArrowRight,
  Route,
  ShieldCheck,
  Activity,
  Radar,
  ChevronRight,
  Users,
  CheckCircle,
  Clock,
  Zap,
  Globe,
  MapPin,
  Sparkles,
  ArrowUpRight,
  Play,
} from "lucide-react";

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] }
  }
};

const fadeInScale = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] }
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

// Animated gradient orb component
function GradientOrb({ 
  className, 
  delay = 0 
}: { 
  className: string; 
  delay?: number;
}) {
  return (
    <motion.div
      className={`pointer-events-none absolute rounded-full blur-[120px] ${className}`}
      animate={{
        x: [0, 50, 20, -30, 0],
        y: [0, -30, 20, 40, 0],
        scale: [1, 1.1, 0.95, 1.05, 1],
      }}
      transition={{
        duration: 20,
        delay,
        ease: "easeInOut",
        repeat: Infinity,
      }}
    />
  );
}

// Floating particles
function FloatingParticles() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute h-1 w-1 rounded-full bg-emerald-400/30"
          style={{
            left: `${15 + i * 15}%`,
            top: `${20 + (i % 3) * 25}%`,
          }}
          animate={{
            y: [0, -30, 0],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 4 + i,
            ease: "easeInOut",
            repeat: Infinity,
            delay: i * 0.5,
          }}
        />
      ))}
    </div>
  );
}

// Glass card component
function GlassCard({ 
  children, 
  className = "",
  delay = 0
}: { 
  children: React.ReactNode; 
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      variants={fadeInUp}
      whileHover={{ 
        y: -4, 
        boxShadow: "0 8px 32px rgba(16, 185, 129, 0.15)",
        transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] }
      }}
      className={`group relative overflow-hidden rounded-2xl border border-white/50 bg-white/70 p-8 shadow-[0_4px_24px_rgba(0,0,0,0.04)] backdrop-blur-xl transition-all duration-300 ${className}`}
    >
      {/* Hover glow effect */}
      <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/50 via-transparent to-transparent" />
      </div>
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
}

// Feature icon wrapper
function FeatureIcon({ icon: Icon }: { icon: React.ElementType }) {
  return (
    <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl border border-emerald-200/50 bg-gradient-to-br from-emerald-50/80 to-emerald-100/50 shadow-sm transition-all duration-300 group-hover:shadow-[0_0_20px_rgba(16,185,129,0.2)] group-hover:border-emerald-300/50">
      <Icon className="h-6 w-6 text-emerald-600" strokeWidth={1.5} />
    </div>
  );
}

// Stat item
function StatItem({ 
  icon: Icon, 
  value, 
  label, 
  delay = 0 
}: { 
  icon: React.ElementType; 
  value: string; 
  label: string;
  delay?: number;
}) {
  return (
    <motion.div
      variants={fadeInUp}
      className="flex flex-col items-center space-y-3 text-center"
    >
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-emerald-200/50 bg-emerald-50/50">
          <Icon className="h-5 w-5 text-emerald-600" />
        </div>
        <span className="text-4xl font-semibold tracking-tight text-zinc-900">
          {value}
        </span>
      </div>
      <p className="text-xs font-semibold uppercase tracking-[0.15em] text-zinc-500">
        {label}
      </p>
    </motion.div>
  );
}

// Animated number counter
function AnimatedCounter({ value, suffix = "" }: { value: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    const duration = 2000;
    const steps = 60;
    const increment = value / steps;
    let current = 0;
    
    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);
    
    return () => clearInterval(timer);
  }, [value]);
  
  return <span>{count}{suffix}</span>;
}

// Modern Navbar
function ModernNavbar() {
  const [scrolled, setScrolled] = useState(false);
  
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  
  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className={`fixed left-0 right-0 top-0 z-50 transition-all duration-300 ${
        scrolled 
          ? "border-b border-zinc-200/50 bg-white/80 shadow-[0_4px_24px_rgba(0,0,0,0.02)] backdrop-blur-xl" 
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-4">
        <Link 
          to="/" 
          className="flex items-center gap-2 text-lg font-semibold tracking-tight text-zinc-900 transition-colors hover:text-emerald-600"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-lg shadow-emerald-500/20">
            <Zap className="h-4 w-4 text-white" fill="currentColor" />
          </div>
          <span>UrbanFix</span>
        </Link>
        
        <nav className="hidden items-center gap-8 md:flex">
          {["Features", "How it Works", "Pricing", "API"].map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase().replace(/\s/g, "-")}`}
              className="text-sm font-medium text-zinc-600 transition-colors hover:text-emerald-600"
            >
              {item}
            </a>
          ))}
        </nav>
        
        <div className="flex items-center gap-4">
          <Link 
            to="/login"
            className="hidden text-sm font-medium text-zinc-600 transition-colors hover:text-emerald-600 sm:block"
          >
            Log in
          </Link>
          <Link to="/signup/user">
            <Button 
              className="h-10 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 px-5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/25 transition-all hover:shadow-emerald-500/40 hover:scale-[1.02] active:scale-[0.98]"
            >
              Get Started
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </motion.header>
  );
}

export function LandingPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const { scrollYProgress } = useScroll();
  const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#fafafa] text-zinc-900">
      {/* Background Elements */}
      <div className="pointer-events-none fixed inset-0 z-0">
        {/* Noise texture */}
        <div
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          }}
        />
        
        {/* Animated gradient orbs */}
        <GradientOrb 
          className="-left-40 top-0 h-[600px] w-[600px] bg-emerald-300/20" 
          delay={0}
        />
        <GradientOrb 
          className="right-0 top-40 h-[800px] w-[800px] bg-emerald-200/15" 
          delay={5}
        />
        <GradientOrb 
          className="bottom-0 left-1/3 h-[500px] w-[500px] bg-cyan-200/10" 
          delay={10}
        />
        
        {/* Floating particles */}
        <FloatingParticles />
        
        {/* Grid pattern */}
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(to right, #10b981 1px, transparent 1px), linear-gradient(to bottom, #10b981 1px, transparent 1px)`,
            backgroundSize: '60px 60px'
          }}
        />
      </div>

      {/* Navigation */}
      <ModernNavbar />

      {/* Main Content */}
      <main className="relative z-10">
        {/* Hero Section */}
        <section className="relative flex min-h-screen flex-col items-center justify-center px-6 pt-24 pb-16">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="mx-auto max-w-5xl text-center"
          >
            {/* Badge */}
            <motion.div variants={fadeInUp} className="mb-8">
              <Badge 
                variant="outline" 
                className="h-8 rounded-full border-emerald-200/50 bg-emerald-50/50 px-4 text-xs font-semibold uppercase tracking-wider text-emerald-700 backdrop-blur-sm"
              >
                <Sparkles className="mr-2 h-3.5 w-3.5" />
                Precision Network v3.0
              </Badge>
            </motion.div>
            
            {/* Headline */}
            <motion.h1 
              variants={fadeInUp}
              className="mb-6 text-5xl font-semibold tracking-tight text-zinc-900 md:text-7xl lg:text-8xl"
              style={{ letterSpacing: '-0.03em' }}
            >
              Orchestrate Your
              <br />
              <span className="bg-gradient-to-r from-emerald-600 to-emerald-500 bg-clip-text text-transparent">
                Urban Reality
              </span>
            </motion.h1>
            
            {/* Subheadline */}
            <motion.p 
              variants={fadeInUp}
              className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-zinc-500 md:text-xl"
            >
              High-precision service routing and intelligent telemetry for the 
              modern metropolis. Locate verified expertise with atmospheric accuracy.
            </motion.p>
            
            {/* Search Bar */}
            <motion.div 
              variants={fadeInUp}
              className="mx-auto mb-8 w-full max-w-xl"
            >
              <div className="group flex items-center gap-3 rounded-2xl border border-zinc-200/80 bg-white/90 p-2 shadow-[0_8px_32px_rgba(0,0,0,0.06)] backdrop-blur-xl transition-all duration-300 focus-within:border-emerald-300/50 focus-within:shadow-[0_8px_32px_rgba(16,185,129,0.12)]">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-100/80 text-zinc-400 transition-colors group-focus-within:bg-emerald-50 group-focus-within:text-emerald-500">
                  <Search className="h-5 w-5" />
                </div>
                <Input
                  type="text"
                  placeholder="Search services, locations, expertise..."
                  className="flex-1 border-0 bg-transparent text-base text-zinc-800 placeholder:text-zinc-400 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Button 
                  className="h-12 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 px-6 text-sm font-semibold text-white shadow-lg shadow-emerald-500/25 transition-all hover:shadow-emerald-500/40 hover:scale-[1.02] active:scale-[0.98]"
                >
                  Search
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </motion.div>
            
            {/* Status indicators */}
            <motion.div 
              variants={fadeInUp}
              className="flex items-center justify-center gap-3"
            >
              <div className="flex items-center gap-2 rounded-full border border-emerald-200/50 bg-emerald-50/50 px-4 py-2 backdrop-blur-sm">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                </span>
                <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
                  System Optimal
                </span>
              </div>
              <div className="flex items-center gap-2 rounded-full border border-zinc-200/50 bg-white/50 px-4 py-2 backdrop-blur-sm">
                <Globe className="h-3.5 w-3.5 text-zinc-400" />
                <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  Grid Active
                </span>
              </div>
            </motion.div>
          </motion.div>
          
          {/* Scroll indicator */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.5, duration: 0.6 }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2"
          >
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 2, ease: "easeInOut", repeat: Infinity }}
              className="flex flex-col items-center gap-2"
            >
              <span className="text-xs font-medium text-zinc-400">Scroll to explore</span>
              <div className="h-10 w-6 rounded-full border-2 border-zinc-300/50 p-1">
                <motion.div 
                  animate={{ y: [0, 12, 0] }}
                  transition={{ duration: 2, ease: "easeInOut", repeat: Infinity }}
                  className="h-2 w-full rounded-full bg-zinc-400/50"
                />
              </div>
            </motion.div>
          </motion.div>
        </section>

        {/* Features Section */}
        <section id="features" className="relative px-6 py-24 lg:py-32">
          <div className="mx-auto max-w-7xl">
            {/* Section header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="mb-16 text-center"
            >
              <Badge 
                variant="outline" 
                className="mb-4 h-7 rounded-full border-zinc-200/50 bg-zinc-50/50 px-3 text-xs font-semibold uppercase tracking-wider text-zinc-500"
              >
                Core Capabilities
              </Badge>
              <h2 className="mb-4 text-3xl font-semibold tracking-tight text-zinc-900 md:text-4xl lg:text-5xl" style={{ letterSpacing: '-0.02em' }}>
                Precision at Every Layer
              </h2>
              <p className="mx-auto max-w-xl text-lg text-zinc-500">
                Three pillars of urban orchestration, designed for maximum efficiency
              </p>
            </motion.div>
            
            {/* Feature cards */}
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              className="grid gap-6 md:grid-cols-3"
            >
              {/* Feature 1 */}
              <GlassCard>
                <FeatureIcon icon={Route} />
                <h3 className="mb-3 text-xl font-semibold text-zinc-900" style={{ letterSpacing: '-0.01em' }}>
                  Intelligent Routing
                </h3>
                <p className="mb-4 leading-relaxed text-zinc-500">
                  Algorithmic dispatch matching your exact coordinates with the optimal specialist in real-time.
                </p>
                <ul className="space-y-2">
                  {["Real-time optimization", "Multi-factor matching", "ETA prediction"].map((item) => (
                    <li key={item} className="flex items-center gap-2 text-sm text-zinc-600">
                      <CheckCircle className="h-4 w-4 text-emerald-500" />
                      {item}
                    </li>
                  ))}
                </ul>
              </GlassCard>
              
              {/* Feature 2 */}
              <GlassCard delay={0.1}>
                <FeatureIcon icon={ShieldCheck} />
                <h3 className="mb-3 text-xl font-semibold text-zinc-900" style={{ letterSpacing: '-0.01em' }}>
                  Verified Expertise
                </h3>
                <p className="mb-4 leading-relaxed text-zinc-500">
                  Cryptographically verified credentials ensuring absolute precision and quality for every engagement.
                </p>
                <ul className="space-y-2">
                  {["Identity verification", "Skill validation", "Reputation scoring"].map((item) => (
                    <li key={item} className="flex items-center gap-2 text-sm text-zinc-600">
                      <CheckCircle className="h-4 w-4 text-emerald-500" />
                      {item}
                    </li>
                  ))}
                </ul>
              </GlassCard>
              
              {/* Feature 3 */}
              <GlassCard delay={0.2}>
                <FeatureIcon icon={Activity} />
                <h3 className="mb-3 text-xl font-semibold text-zinc-900" style={{ letterSpacing: '-0.01em' }}>
                  Real-time Telemetry
                </h3>
                <p className="mb-4 leading-relaxed text-zinc-500">
                  Continuous stream of diagnostic data and progress tracking via our hyper-responsive dashboard.
                </p>
                <ul className="space-y-2">
                  {["Live tracking", "Progress analytics", "Automated alerts"].map((item) => (
                    <li key={item} className="flex items-center gap-2 text-sm text-zinc-600">
                      <CheckCircle className="h-4 w-4 text-emerald-500" />
                      {item}
                    </li>
                  ))}
                </ul>
              </GlassCard>
            </motion.div>
          </div>
        </section>

        {/* System Architecture Section */}
        <section className="relative px-6 py-24 lg:py-32">
          <div className="mx-auto max-w-7xl">
            <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
              {/* Content */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              >
                <Badge 
                  variant="outline" 
                  className="mb-4 h-7 rounded-full border-emerald-200/50 bg-emerald-50/50 px-3 text-xs font-semibold uppercase tracking-wider text-emerald-600"
                >
                  System Architecture
                </Badge>
                <h2 className="mb-6 text-3xl font-semibold tracking-tight text-zinc-900 md:text-4xl lg:text-5xl" style={{ letterSpacing: '-0.02em' }}>
                  Proximity Radar
                </h2>
                <p className="mb-6 text-lg leading-relaxed text-zinc-500">
                  Visualize active nodes within your immediate perimeter. Our spatial awareness engine processes location data in real-time, displaying available specialists as dynamic points on an interactive canvas.
                </p>
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center gap-2 rounded-lg border border-zinc-200/50 bg-white/50 px-4 py-2 backdrop-blur-sm">
                    <MapPin className="h-4 w-4 text-emerald-500" />
                    <span className="text-sm font-medium text-zinc-700">Geospatial precision</span>
                  </div>
                  <div className="flex items-center gap-2 rounded-lg border border-zinc-200/50 bg-white/50 px-4 py-2 backdrop-blur-sm">
                    <Zap className="h-4 w-4 text-emerald-500" />
                    <span className="text-sm font-medium text-zinc-700">&lt;50ms latency</span>
                  </div>
                </div>
              </motion.div>
              
              {/* Visual */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
                className="relative"
              >
                <div className="relative aspect-square overflow-hidden rounded-3xl border border-white/50 bg-gradient-to-br from-emerald-50/80 to-white/60 p-8 shadow-[0_8px_32px_rgba(0,0,0,0.06)] backdrop-blur-xl">
                  {/* Radar visualization */}
                  <div className="relative flex h-full items-center justify-center">
                    {/* Radar circles */}
                    {[200, 160, 120, 80, 40].map((size, i) => (
                      <div
                        key={i}
                        className="absolute rounded-full border border-emerald-200/30"
                        style={{ width: size, height: size }}
                      />
                    ))}
                    {/* Radar sweep */}
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 8, ease: "linear", repeat: Infinity }}
                      className="absolute h-[200px] w-[200px]"
                      style={{
                        background: 'conic-gradient(from 0deg, transparent 0deg, rgba(16, 185, 129, 0.1) 60deg, transparent 60deg)',
                        borderRadius: '50%'
                      }}
                    />
                    {/* Center point */}
                    <div className="relative z-10 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/30">
                      <div className="h-2 w-2 rounded-full bg-white" />
                    </div>
                    {/* Satellite points */}
                    {[
                      { x: 50, y: -30, delay: 0 },
                      { x: -40, y: 40, delay: 0.5 },
                      { x: 60, y: 50, delay: 1 },
                      { x: -30, y: -50, delay: 1.5 },
                    ].map((pos, i) => (
                      <motion.div
                        key={i}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: pos.delay, duration: 0.5 }}
                        className="absolute h-3 w-3 rounded-full bg-zinc-400 shadow-md"
                        style={{ 
                          transform: `translate(${pos.x}px, ${pos.y}px)`,
                        }}
                      />
                    ))}
                  </div>
                  
                  {/* Floating label */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.5, duration: 0.5 }}
                    className="absolute bottom-4 left-4 flex items-center gap-2 rounded-lg border border-emerald-200/50 bg-white/80 px-3 py-2 backdrop-blur-sm"
                  >
                    <Radar className="h-4 w-4 text-emerald-500" />
                    <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
                      4 Nodes Active
                    </span>
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="relative border-y border-zinc-200/50 bg-gradient-to-r from-zinc-50/50 via-white/50 to-zinc-50/50 px-6 py-20 backdrop-blur-sm">
          <div className="mx-auto max-w-7xl">
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              className="grid gap-8 md:grid-cols-3"
            >
              <StatItem icon={Users} value="142+" label="Specialists Online" />
              <StatItem icon={CheckCircle} value="99.8%" label="Resolution Rate" />
              <StatItem icon={Clock} value="&lt;12m" label="Average ETA" />
            </motion.div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="relative overflow-hidden px-6 py-24 lg:py-32">
          {/* Background glow */}
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="h-[600px] w-[600px] rounded-full bg-emerald-400/10 blur-[150px]" />
          </div>
          
          <div className="relative mx-auto max-w-4xl text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            >
              <Badge 
                variant="outline" 
                className="mb-6 h-8 rounded-full border-emerald-200/50 bg-emerald-50/50 px-4 text-xs font-semibold uppercase tracking-wider text-emerald-700"
              >
                Ready to Transform?
              </Badge>
              <h2 className="mb-6 text-4xl font-semibold tracking-tight text-zinc-900 md:text-5xl lg:text-6xl" style={{ letterSpacing: '-0.02em' }}>
                Start Orchestrating
                <br />
                <span className="text-emerald-600">Today</span>
              </h2>
              <p className="mx-auto mb-10 max-w-xl text-lg text-zinc-500">
                Join the network of optimized urban nodes. Secure your access to precision services today.
              </p>
              
              <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Link to="/signup/user">
                  <Button 
                    size="lg"
                    className="h-14 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 px-8 text-base font-semibold text-white shadow-xl shadow-emerald-500/30 transition-all hover:shadow-emerald-500/50 hover:scale-[1.02] active:scale-[0.98]"
                  >
                    Connect to Grid
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Button 
                  variant="outline" 
                  size="lg"
                  className="h-14 rounded-xl border-zinc-300 px-8 text-base font-semibold text-zinc-700 transition-all hover:bg-zinc-50 hover:border-zinc-400"
                >
                  <Play className="mr-2 h-4 w-4" />
                  Watch Demo
                </Button>
              </div>
              
              {/* Trust indicators */}
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="mt-10 flex items-center justify-center gap-6 text-sm text-zinc-400"
              >
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-500" />
                  <span>No credit card required</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-500" />
                  <span>Free 14-day trial</span>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Modern Footer */}
        <footer className="relative border-t border-zinc-200/50 bg-zinc-50/50 px-6 py-16 backdrop-blur-sm">
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-12 md:grid-cols-4 lg:grid-cols-5">
              {/* Brand column */}
              <div className="md:col-span-2 lg:col-span-2">
                <Link to="/" className="mb-4 flex items-center gap-2 text-lg font-semibold tracking-tight text-zinc-900">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-lg shadow-emerald-500/20">
                    <Zap className="h-4 w-4 text-white" fill="currentColor" />
                  </div>
                  <span>UrbanFix</span>
                </Link>
                <p className="mb-6 max-w-xs text-sm leading-relaxed text-zinc-500">
                  High-precision service routing and intelligent telemetry for the modern metropolis.
                </p>
                <div className="flex items-center gap-2 rounded-full border border-emerald-200/50 bg-emerald-50/50 px-4 py-2 w-fit">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                  </span>
                  <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
                    All Systems Operational
                  </span>
                </div>
              </div>
              
              {/* Links columns */}
              <div>
                <h4 className="mb-4 text-xs font-semibold uppercase tracking-wider text-zinc-900">Product</h4>
                <ul className="space-y-3">
                  {["Features", "Integrations", "Pricing", "Changelog", "Roadmap"].map((item) => (
                    <li key={item}>
                      <a href="#" className="text-sm text-zinc-500 transition-colors hover:text-emerald-600">
                        {item}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h4 className="mb-4 text-xs font-semibold uppercase tracking-wider text-zinc-900">Resources</h4>
                <ul className="space-y-3">
                  {["Documentation", "API Reference", "Guides", "Community", "Support"].map((item) => (
                    <li key={item}>
                      <a href="#" className="text-sm text-zinc-500 transition-colors hover:text-emerald-600">
                        {item}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h4 className="mb-4 text-xs font-semibold uppercase tracking-wider text-zinc-900">Company</h4>
                <ul className="space-y-3">
                  {["About", "Blog", "Careers", "Press", "Contact"].map((item) => (
                    <li key={item}>
                      <a href="#" className="text-sm text-zinc-500 transition-colors hover:text-emerald-600">
                        {item}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            
            {/* Bottom bar */}
            <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-zinc-200/50 pt-8 md:flex-row">
              <p className="text-sm text-zinc-400">
                © {new Date().getFullYear()} UrbanFix. All rights reserved.
              </p>
              <div className="flex items-center gap-6">
                {["Privacy", "Terms", "Cookies", "Security"].map((item) => (
                  <a key={item} href="#" className="text-sm text-zinc-400 transition-colors hover:text-emerald-600">
                    {item}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
