import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import PublicNavbar from '../components/PublicNavbar';
import { 
  BoltIcon, HeartIcon, ShieldCheckIcon, 
  LightBulbIcon, UserGroupIcon, CubeTransparentIcon,
  SparklesIcon, RocketLaunchIcon, ChartBarIcon,
  ArrowTrendingUpIcon, CheckCircleIcon, ClockIcon,
  BuildingOfficeIcon, CpuChipIcon, CalendarDaysIcon,
  DocumentTextIcon, GlobeAltIcon, CommandLineIcon
} from '@heroicons/react/24/outline';

/* ═══════════════════════════════════════════════════
   UTILITY COMPONENTS
   ═══════════════════════════════════════════════════ */

/* Scroll-triggered fade-in */
const ScrollReveal = ({ children, className = '', delay = 0 }) => {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) setIsVisible(true);
    }, { threshold: 0.12 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  return (
    <div ref={ref} className={`transition-all duration-700 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'} ${className}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
};

/* Animated counter */
const AnimatedCounter = ({ end, suffix = '', duration = 2000 }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const hasAnimated = useRef(false);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !hasAnimated.current) {
        hasAnimated.current = true;
        let start = 0;
        const increment = end / (duration / 16);
        const timer = setInterval(() => {
          start += increment;
          if (start >= end) { setCount(end); clearInterval(timer); }
          else { setCount(Math.floor(start)); }
        }, 16);
      }
    }, { threshold: 0.5 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [end, duration]);
  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
};

/* Typing text animation */
const TypingText = ({ texts, speed = 80 }) => {
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [displayed, setDisplayed] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentFullText = texts[currentTextIndex];
    let timer;

    if (!isDeleting && displayed.length < currentFullText.length) {
      timer = setTimeout(() => setDisplayed(currentFullText.slice(0, displayed.length + 1)), speed);
    } else if (!isDeleting && displayed.length === currentFullText.length) {
      timer = setTimeout(() => setIsDeleting(true), 2000);
    } else if (isDeleting && displayed.length > 0) {
      timer = setTimeout(() => setDisplayed(displayed.slice(0, -1)), speed / 2);
    } else if (isDeleting && displayed.length === 0) {
      setIsDeleting(false);
      setCurrentTextIndex((currentTextIndex + 1) % texts.length);
    }
    return () => clearTimeout(timer);
  }, [displayed, isDeleting, currentTextIndex, texts, speed]);

  return (
    <span className="bg-gradient-to-r from-finledger-indigo to-finledger-emerald bg-clip-text text-transparent">
      {displayed}<span className="animate-pulse text-finledger-indigo">|</span>
    </span>
  );
};

/* Floating particles */
const FloatingParticles = ({ count = 12, color = 'bg-finledger-indigo/15' }) => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden">
    {[...Array(count)].map((_, i) => (
      <div key={i} className={`absolute w-1 h-1 ${color} rounded-full`}
        style={{
          left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`,
          animation: `float ${4 + Math.random() * 4}s ease-in-out infinite`,
          animationDelay: `${Math.random() * 4}s`,
        }}
      />
    ))}
  </div>
);

/* ═══════════════════════════════════════════════════
   INTERACTIVE COMPONENTS
   ═══════════════════════════════════════════════════ */

/* AI Terminal — shows the story of building FinLedger */
const StoryTerminal = () => {
  const [lineIndex, setLineIndex] = useState(0);
  const lines = [
    { prefix: 'founder', text: 'analyzing 500+ client ledgers manually...', color: 'text-amber-400' },
    { prefix: 'founder', text: 'time_spent: 70% on repetitive aggregation', color: 'text-rose-400' },
    { prefix: 'founder', text: 'insight: "AI can do this in seconds"', color: 'text-finledger-indigo' },
    { prefix: 'system', text: 'initializing FinLedger Pro v0.1...', color: 'text-gray-400' },
    { prefix: 'system', text: 'integrating Groq LLM engine...', color: 'text-gray-400' },
    { prefix: 'beta', text: '25 CAs onboarded in Mumbai & Delhi', color: 'text-emerald-400' },
    { prefix: 'prod', text: '500+ CA firms live. 12,000+ companies.', color: 'text-emerald-400' },
    { prefix: 'ai', text: '✓ mission: 60% workload reduction achieved', color: 'text-emerald-400' },
  ];

  useEffect(() => {
    if (lineIndex >= lines.length) return;
    const timer = setTimeout(() => setLineIndex(i => i + 1), 1200);
    return () => clearTimeout(timer);
  }, [lineIndex, lines.length]);

  return (
    <div className="bg-[#0D0B14] rounded-xl border border-white/10 overflow-hidden shadow-[0_0_60px_rgba(99,102,241,0.1)]">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10 bg-white/[0.02]">
        <div className="w-3 h-3 rounded-full bg-rose-500/80" />
        <div className="w-3 h-3 rounded-full bg-amber-500/80" />
        <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
        <span className="ml-2 font-mono text-[11px] text-gray-500">origin_story.sh</span>
      </div>
      <div className="p-5 font-mono text-xs leading-6 min-h-[220px]">
        {lines.slice(0, lineIndex).map((line, i) => (
          <div key={i} className="flex gap-2 animate-fade-in">
            <span className="text-gray-600 shrink-0">[{line.prefix}]</span>
            <span className={`${line.color} transition-all`}>{line.text}</span>
          </div>
        ))}
        {lineIndex < lines.length && (
          <div className="flex gap-2">
            <span className="text-gray-600">[...]</span>
            <span className="text-finledger-indigo animate-pulse font-bold">▊</span>
          </div>
        )}
      </div>
    </div>
  );
};

/* Interactive value card with hover micro-animation */
const ValueCard = ({ icon, title, desc, gradient, index }) => {
  const [hovered, setHovered] = useState(false);

  return (
    <ScrollReveal delay={index * 150}>
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="relative group cursor-default"
      >
        {/* Glow on hover */}
        <div className={`absolute -inset-0.5 rounded-[28px] bg-gradient-to-r ${gradient} opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500`} />
        
        <div className="relative bg-white/[0.02] backdrop-blur-sm border border-white/[0.06] rounded-3xl p-8 hover:bg-white/[0.05] hover:border-white/15 transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_20px_60px_rgba(0,0,0,0.3)]">
          <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-5 transition-transform duration-500 ${hovered ? 'scale-110 rotate-3' : ''}`}>
            <div className="text-white">{icon}</div>
          </div>
          <h3 className="text-xl font-bold text-white mb-3 tracking-tight">{title}</h3>
          <p className="text-sm text-gray-400 leading-relaxed">{desc}</p>
        </div>
      </div>
    </ScrollReveal>
  );
};

/* Timeline node with animation */
const TimelineNode = ({ year, event, isLast, index, icon, color }) => (
  <ScrollReveal delay={index * 200}>
    <div className="flex gap-6 items-start relative">
      {/* Connector line */}
      {!isLast && (
        <div className="absolute left-6 top-12 bottom-0 w-0.5 bg-gradient-to-b from-white/10 to-transparent" style={{ height: 'calc(100% + 2.5rem)' }} />
      )}
      
      {/* Node */}
      <div className={`w-12 h-12 shrink-0 rounded-full bg-[#0D0B14] border-2 ${color} flex items-center justify-center z-10 shadow-lg transition-all duration-300 hover:scale-110 cursor-default group`}>
        <span className="text-xs font-bold text-white group-hover:hidden">{year}</span>
        <span className="hidden group-hover:block">{icon}</span>
      </div>
      
      {/* Content */}
      <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-5 flex-1 hover:bg-white/[0.05] hover:border-white/10 transition-all duration-300 group cursor-default">
        <div className="flex items-center gap-3 mb-2">
          <span className={`text-xs font-mono font-bold ${color.replace('border-', 'text-').replace('/50', '')} uppercase tracking-wider`}>{year}</span>
          <div className="flex-1 h-px bg-white/[0.06]" />
        </div>
        <p className="text-sm text-gray-300 leading-relaxed">{event}</p>
      </div>
    </div>
  </ScrollReveal>
);

/* Tech stack card */
const TechCard = ({ icon, name, desc, color }) => (
  <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-4 hover:bg-white/[0.05] hover:border-white/10 transition-all duration-300 hover:-translate-y-1 cursor-default group">
    <div className="flex items-center gap-3 mb-2">
      <div className={`w-8 h-8 rounded-lg ${color} flex items-center justify-center transition-transform duration-300 group-hover:scale-110`}>
        {icon}
      </div>
      <span className="text-sm font-bold text-white">{name}</span>
    </div>
    <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
  </div>
);

/* ═══════════════════════════════════════════════════
   DATA
   ═══════════════════════════════════════════════════ */

const values = [
  {
    icon: <LightBulbIcon className="w-6 h-6" />,
    title: 'Innovation First',
    desc: 'We leverage cutting-edge AI to solve real problems, not build tech for tech\'s sake. Every feature is battle-tested against actual accounting workflows.',
    gradient: 'from-finledger-indigo to-blue-500'
  },
  {
    icon: <ShieldCheckIcon className="w-6 h-6" />,
    title: 'Trust & Security',
    desc: 'Financial data is sacred. We employ bank-grade AES-256 encryption, SOC 2 compliance, and strict role-based access controls.',
    gradient: 'from-emerald-500 to-teal-500'
  },
  {
    icon: <UserGroupIcon className="w-6 h-6" />,
    title: 'CA-Centric Design',
    desc: 'Every interface element, workflow, and AI prompt is built from the perspective of a working Chartered Accountant managing real clients.',
    gradient: 'from-purple-500 to-pink-500'
  },
  {
    icon: <HeartIcon className="w-6 h-6" />,
    title: 'Impact Over Revenue',
    desc: 'We measure success by how many hours we save CAs and the quality of insights delivered — not just by MRR growth.',
    gradient: 'from-rose-500 to-orange-500'
  }
];

const milestones = [
  { year: '2023', event: 'Idea conceived during a grueling audit season at a Big 4 firm. 70% of time wasted on manual data aggregation.', icon: '💡', color: 'border-amber-500/50' },
  { year: '2024', event: 'MVP built in 12 weeks and validated with 25 beta CAs across Mumbai & Delhi. 3x productivity improvement confirmed.', icon: '🚀', color: 'border-finledger-indigo/50' },
  { year: '2025', event: 'Integrated Groq\'s Llama 3 70B engine for real-time financial intelligence. AI accuracy hit 99.2%.', icon: '🧠', color: 'border-emerald-500/50' },
  { year: '2026', event: '500+ CA firms managing 12,000+ companies. Platform processing ₹2,000Cr+ in annual transactions.', icon: '📈', color: 'border-purple-500/50' },
];

const techStack = [
  { icon: <CubeTransparentIcon className="w-4 h-4 text-finledger-indigo" />, name: 'React + Vite', desc: 'Lightning-fast frontend', color: 'bg-finledger-indigo/15' },
  { icon: <CommandLineIcon className="w-4 h-4 text-emerald-400" />, name: 'Node.js', desc: 'Scalable backend API', color: 'bg-emerald-500/15' },
  { icon: <SparklesIcon className="w-4 h-4 text-purple-400" />, name: 'Groq LLM', desc: 'AI-powered analysis', color: 'bg-purple-500/15' },
  { icon: <GlobeAltIcon className="w-4 h-4 text-amber-400" />, name: 'MongoDB', desc: 'Flexible data store', color: 'bg-amber-500/15' },
];

const impactStats = [
  { number: 60, suffix: '%', label: 'Workload Reduction', color: 'text-finledger-indigo' },
  { number: 500, suffix: '+', label: 'CA Firms Active', color: 'text-emerald-400' },
  { number: 12000, suffix: '+', label: 'Companies Managed', color: 'text-purple-400' },
  { number: 99, suffix: '.2%', label: 'AI Accuracy', color: 'text-amber-400' },
];

/* ═══════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════ */
const AboutUs = () => {
  return (
    <div className="bg-[#08060D] text-white min-h-screen font-sans selection:bg-finledger-indigo/30 selection:text-white">
      <PublicNavbar />

      {/* ═══════════════ HERO ═══════════════ */}
      <section className="relative pt-28 md:pt-36 pb-20 px-6 lg:px-8 overflow-hidden">
        <FloatingParticles count={15} />
        <div className="absolute top-[-15%] right-[-10%] w-[40rem] h-[40rem] bg-finledger-indigo/8 rounded-full blur-[150px] pointer-events-none" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[30rem] h-[30rem] bg-finledger-electric/5 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-6xl mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left — Copy */}
            <div>
              <ScrollReveal>
                <div className="inline-flex items-center gap-2.5 px-4 py-1.5 bg-white/[0.04] rounded-full border border-white/10 backdrop-blur-md mb-6">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                  <span className="text-xs font-mono text-gray-400">Our Story</span>
                  <span className="text-xs text-gray-600">·</span>
                  <span className="text-xs text-gray-300">Est. 2023</span>
                </div>
              </ScrollReveal>

              <ScrollReveal delay={100}>
                <h1 className="text-4xl md:text-5xl xl:text-6xl font-black tracking-tight leading-[1.1] mb-6">
                  <span className="block text-white">Built by a CA Who</span>
                  <span className="block mt-1">
                    <TypingText texts={['Understood the Pain', 'Lived the Grind', 'Built the Solution', 'Changed the Game']} />
                  </span>
                </h1>
              </ScrollReveal>

              <ScrollReveal delay={200}>
                <p className="text-lg text-gray-400 max-w-lg leading-relaxed mb-8">
                  FinLedger Pro was born from the frustration of spending countless hours on manual financial analysis. 
                  We believe technology should <span className="text-white font-medium">amplify</span> a CA's expertise, not replace it.
                </p>
              </ScrollReveal>

              <ScrollReveal delay={300}>
                <div className="flex items-center gap-4">
                  <Link to="/register" className="btn-primary text-sm !py-3 !px-7 group relative overflow-hidden">
                    <span className="relative z-10 flex items-center gap-2">
                      <BoltIcon className="w-4 h-4" />
                      Start Free Trial
                    </span>
                  </Link>
                  <a href="#story" className="text-sm text-gray-300 hover:text-white transition font-medium px-6 py-3 rounded-xl border border-white/10 hover:bg-white/5">
                    Read Our Story
                  </a>
                </div>
              </ScrollReveal>
            </div>

            {/* Right — Story Terminal */}
            <ScrollReveal delay={300} className="hidden lg:block">
              <StoryTerminal />
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ═══════════════ IMPACT STATS ═══════════════ */}
      <ScrollReveal>
        <section className="w-full border-t border-b border-white/10 py-12 bg-white/[0.01]">
          <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 px-6">
            {impactStats.map((stat, i) => (
              <div key={i} className="text-center group cursor-default">
                <div className={`text-3xl md:text-4xl font-black tracking-tight ${stat.color} transition-all duration-300`}>
                  <AnimatedCounter end={stat.number} suffix={stat.suffix} />
                </div>
                <div className="text-sm text-gray-500 font-medium mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </section>
      </ScrollReveal>

      {/* ═══════════════ VISION ═══════════════ */}
      <section id="story" className="py-20 md:py-28 px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <ScrollReveal>
            <div className="relative bg-white/[0.02] backdrop-blur-sm border border-white/[0.06] rounded-3xl p-10 md:p-16 overflow-hidden">
              {/* Background effects */}
              <div className="absolute inset-0 bg-gradient-to-br from-finledger-indigo/5 to-finledger-emerald/5 pointer-events-none" />
              <div className="absolute top-0 right-0 w-64 h-64 bg-finledger-indigo/5 rounded-full blur-[80px] pointer-events-none" />
              
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-finledger-indigo to-finledger-electric flex items-center justify-center shadow-lg shadow-finledger-indigo/20">
                    <BoltIcon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">Our Vision</h2>
                    <p className="text-xs text-gray-500 font-mono uppercase tracking-wider">The future of CA practice</p>
                  </div>
                </div>

                <blockquote className="text-xl md:text-2xl text-gray-300 leading-relaxed font-light italic mb-8">
                  "To become the default operating system for every Chartered Accountant in India — replacing manual 
                  spreadsheets, fragmented tools, and guesswork with a unified, AI-powered intelligence platform 
                  that makes every CA feel like they have a <span className="text-white font-medium not-italic">team of analysts</span> behind them."
                </blockquote>

                <div className="flex items-center gap-4 pt-6 border-t border-white/[0.06]">
                  <div className="w-1 h-16 bg-gradient-to-b from-finledger-indigo to-finledger-emerald rounded-full" />
                  <div>
                    <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Our Mission</p>
                    <p className="text-gray-400 leading-relaxed">Reduce CA workload by 60% while increasing the quality and depth of financial insights delivered to clients.</p>
                  </div>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ═══════════════ FOUNDER ═══════════════ */}
      <section className="py-20 px-6 lg:px-8 border-t border-white/[0.06]">
        <div className="max-w-5xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-14">
              <div className="inline-flex items-center gap-2.5 px-4 py-1.5 bg-white/[0.04] rounded-full border border-white/10 mb-4">
                <span className="text-xs font-mono text-emerald-400 uppercase tracking-wider">Leadership</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-black tracking-tight">
                Meet the <span className="bg-gradient-to-r from-finledger-indigo to-finledger-electric bg-clip-text text-transparent">Founder</span>
              </h2>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={200}>
            <div className="relative bg-white/[0.02] backdrop-blur-sm border border-white/[0.06] rounded-3xl p-8 md:p-12 flex flex-col md:flex-row gap-10 items-center hover:border-white/10 transition-all duration-500 group">
              {/* Glow */}
              <div className="absolute -inset-1 rounded-[28px] bg-gradient-to-r from-finledger-indigo/10 to-finledger-emerald/10 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-700 pointer-events-none" />

              {/* Founder Image */}
              <div className="flex-shrink-0 relative">
                <div className="w-56 h-56 md:w-64 md:h-64 rounded-2xl overflow-hidden border-2 border-finledger-indigo/30 shadow-2xl shadow-finledger-indigo/10 relative group-hover:border-finledger-indigo/50 transition-all duration-500">
                  <img 
                    src="/founder_aarushi.png" 
                    alt="CA Aarushi Gupta - Founder, FinLedger Pro" 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.parentElement.innerHTML = '<div class="w-full h-full bg-gradient-to-br from-finledger-indigo/20 to-finledger-electric/20 flex items-center justify-center"><span class="text-5xl font-black text-white/20">AG</span></div>';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#08060D]/60 to-transparent" />
                </div>
                {/* Online indicator */}
                <div className="absolute -bottom-2 -right-2 bg-[#0D0B14] border border-white/10 rounded-full px-3 py-1 flex items-center gap-1.5 shadow-lg">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                  <span className="text-[10px] font-mono text-emerald-400">active founder</span>
                </div>
              </div>

              {/* Founder Bio */}
              <div className="flex-1 text-center md:text-left relative z-10">
                <h3 className="text-2xl font-bold text-white mb-1">CA Aarushi Gupta</h3>
                <p className="text-finledger-indigo font-semibold text-sm mb-6">Founder & CEO</p>

                <div className="space-y-4 text-gray-400 text-sm leading-relaxed">
                  <p>
                    Aarushi is a Chartered Accountant with over <span className="text-white font-medium">8 years of experience</span> spanning Big 4 advisory, 
                    mid-market audit, and independent consulting. She qualified topping her region and built a practice serving 50+ SMBs.
                  </p>
                  <p>
                    The idea for FinLedger Pro came during an intense audit season, when she realized 
                    <span className="text-white font-medium"> 70% of her time</span> was spent on repetitive data aggregation — 
                    tasks that AI could handle in seconds. She assembled a team and built the first prototype in <span className="text-white font-medium">12 weeks</span>.
                  </p>
                  <p>
                    Today, she leads product vision while remaining an active practitioner, using her own platform daily to manage clients.
                  </p>
                </div>

                <div className="flex flex-wrap gap-3 mt-6 justify-center md:justify-start">
                  {[
                    { label: 'FCA, ICAI', color: 'bg-finledger-indigo/10 text-finledger-indigo border-finledger-indigo/20' },
                    { label: 'B.Com (Hons), SRCC', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
                    { label: 'AI & FinTech', color: 'bg-purple-500/10 text-purple-400 border-purple-500/20' },
                  ].map((tag, i) => (
                    <span key={i} className={`text-xs font-semibold px-3 py-1.5 rounded-full border ${tag.color} hover:scale-105 transition-transform cursor-default`}>
                      {tag.label}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ═══════════════ VALUES ═══════════════ */}
      <section className="py-20 px-6 lg:px-8 border-t border-white/[0.06]">
        <div className="max-w-5xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-14">
              <div className="inline-flex items-center gap-2.5 px-4 py-1.5 bg-white/[0.04] rounded-full border border-white/10 mb-4">
                <span className="text-xs font-mono text-finledger-indigo uppercase tracking-wider">What Drives Us</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-black tracking-tight">Our Core Values</h2>
              <p className="text-gray-400 mt-3 max-w-lg mx-auto">The principles that guide every decision we make and every feature we build.</p>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {values.map((v, i) => (
              <ValueCard key={i} {...v} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════ TECH STACK ═══════════════ */}
      <section className="py-20 px-6 lg:px-8 border-t border-white/[0.06]">
        <div className="max-w-5xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-14">
              <div className="inline-flex items-center gap-2.5 px-4 py-1.5 bg-white/[0.04] rounded-full border border-white/10 mb-4">
                <span className="text-xs font-mono text-purple-400 uppercase tracking-wider">Technology</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-black tracking-tight">Built with the Best</h2>
              <p className="text-gray-400 mt-3 max-w-lg mx-auto">Enterprise-grade technology stack designed for performance, security, and scalability.</p>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={200}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {techStack.map((tech, i) => (
                <TechCard key={i} {...tech} />
              ))}
            </div>
          </ScrollReveal>

          {/* Architecture diagram */}
          <ScrollReveal delay={400}>
            <div className="mt-10 bg-[#0D0B14] rounded-xl border border-white/10 p-6 md:p-8">
              <div className="flex items-center gap-2 mb-6">
                <CubeTransparentIcon className="w-5 h-5 text-finledger-indigo" />
                <span className="font-mono text-sm text-gray-400">System Architecture</span>
              </div>
              <div className="flex flex-col md:flex-row items-center justify-center gap-4">
                {[
                  { label: 'Frontend', sub: 'React + Tailwind', color: 'border-finledger-indigo/40 text-finledger-indigo' },
                  { label: 'API Layer', sub: 'Express.js', color: 'border-emerald-500/40 text-emerald-400' },
                  { label: 'AI Engine', sub: 'Groq LLM', color: 'border-purple-500/40 text-purple-400' },
                  { label: 'Database', sub: 'MongoDB', color: 'border-amber-500/40 text-amber-400' },
                ].map((node, i) => (
                  <React.Fragment key={i}>
                    <div className={`px-6 py-4 border-2 ${node.color} rounded-xl text-center bg-white/[0.02] hover:bg-white/[0.05] transition-all duration-300 cursor-default group min-w-[140px]`}>
                      <div className={`text-sm font-bold ${node.color.split(' ')[1]}`}>{node.label}</div>
                      <div className="text-xs text-gray-500 mt-1 font-mono">{node.sub}</div>
                    </div>
                    {i < 3 && (
                      <div className="text-gray-600 font-mono text-sm hidden md:block">→</div>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ═══════════════ TIMELINE ═══════════════ */}
      <section className="py-20 px-6 lg:px-8 border-t border-white/[0.06]">
        <div className="max-w-3xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-14">
              <div className="inline-flex items-center gap-2.5 px-4 py-1.5 bg-white/[0.04] rounded-full border border-white/10 mb-4">
                <span className="text-xs font-mono text-amber-400 uppercase tracking-wider">Our Journey</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-black tracking-tight">Key Milestones</h2>
              <p className="text-gray-400 mt-3">From idea to India's leading CA intelligence platform.</p>
            </div>
          </ScrollReveal>

          <div className="space-y-8">
            {milestones.map((m, i) => (
              <TimelineNode key={i} {...m} index={i} isLast={i === milestones.length - 1} />
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════ BOTTOM CTA ═══════════════ */}
      <ScrollReveal>
        <section className="border-t border-white/[0.06] px-6 lg:px-8 py-20 md:py-32 relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[50vw] h-[50vw] max-w-[500px] max-h-[500px] bg-finledger-indigo/5 rounded-full blur-[120px] pointer-events-none" />
          
          <div className="max-w-3xl mx-auto text-center relative z-10">
            <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-4">
              Want to Join Our <span className="bg-gradient-to-r from-finledger-indigo to-finledger-emerald bg-clip-text text-transparent">Journey</span>?
            </h2>
            <p className="text-gray-400 text-lg mb-10 max-w-xl mx-auto">Start your free trial today and experience the future of CA practice management.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register" className="btn-primary text-base !py-3.5 !px-10 group relative overflow-hidden">
                <span className="relative z-10 flex items-center gap-2">
                  <RocketLaunchIcon className="w-4 h-4" />
                  Get Started for Free
                </span>
              </Link>
              <Link to="/" className="text-base text-gray-400 hover:text-white transition font-medium px-8 py-3.5 rounded-xl border border-white/10 hover:bg-white/5">
                Back to Home
              </Link>
            </div>
          </div>
        </section>
      </ScrollReveal>

      {/* ═══════════════ FOOTER ═══════════════ */}
      <footer className="border-t border-white/[0.06] py-16 px-6 lg:px-10 bg-[#08060D]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between gap-10">
          <div className="flex flex-col gap-4 max-w-sm">
            <div className="flex items-center gap-2">
              <ShieldCheckIcon className="w-6 h-6 text-finledger-indigo" />
              <span className="text-xl font-bold text-white tracking-tight">FinLedger Pro</span>
            </div>
            <p className="text-sm text-gray-500 leading-relaxed font-medium">
              The ultimate operating system for modern Chartered Accountants. Elevate your practice with unprecedented AI insights.
            </p>
          </div>
          <div className="flex gap-16">
            <div className="flex flex-col gap-4">
              <h4 className="text-white font-bold tracking-wide">Resources</h4>
              <Link to="/login" className="text-sm text-gray-500 hover:text-white transition">Sign In</Link>
              <Link to="/register" className="text-sm text-gray-500 hover:text-white transition">Start Free Trial</Link>
              <Link to="/" className="text-sm text-gray-500 hover:text-white transition">Home</Link>
            </div>
            <div className="flex flex-col gap-4">
              <h4 className="text-white font-bold tracking-wide">Company</h4>
              <span className="text-sm text-gray-500 cursor-pointer hover:text-white transition">Privacy Policy</span>
              <span className="text-sm text-gray-500 cursor-pointer hover:text-white transition">Terms of Service</span>
              <span className="text-sm text-gray-500 cursor-pointer hover:text-white transition">Contact</span>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-16 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between text-xs text-gray-600 font-medium">
          <p>© {new Date().getFullYear()} FinLedger Pro. All rights reserved. Founded by CA Aarushi Gupta.</p>
          <p className="mt-2 md:mt-0">Designed for Productivity.</p>
        </div>
      </footer>
    </div>
  );
};

export default AboutUs;
