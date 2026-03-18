import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import PublicNavbar from '../components/PublicNavbar';
import { useAuthStore } from '../stores/authStore';
import {
  BuildingOfficeIcon, CpuChipIcon, ShieldCheckIcon, CalendarDaysIcon,
  ArrowTrendingUpIcon, BoltIcon, SparklesIcon, DocumentTextIcon,
  ChartBarIcon, ClockIcon, CheckCircleIcon, ExclamationTriangleIcon,
  DocumentMagnifyingGlassIcon, CubeTransparentIcon
} from '@heroicons/react/24/outline';

/* ════════════════════════════════════════════════════════
   UTILITY HOOKS
   ════════════════════════════════════════════════════════ */

/* Typing animation hook */
const useTypingEffect = (lines, speed = 40, startDelay = 0, shouldStart = true) => {
  const [displayed, setDisplayed] = useState([]);
  const [lineIndex, setLineIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDone, setIsDone] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    if (!shouldStart) return;
    const t = setTimeout(() => setHasStarted(true), startDelay);
    return () => clearTimeout(t);
  }, [shouldStart, startDelay]);

  useEffect(() => {
    if (!hasStarted || isDone) return;
    if (lineIndex >= lines.length) { setIsDone(true); return; }
    const currentLine = lines[lineIndex];
    if (charIndex <= currentLine.length) {
      const timer = setTimeout(() => {
        setDisplayed(prev => { const copy = [...prev]; copy[lineIndex] = currentLine.slice(0, charIndex); return copy; });
        setCharIndex(c => c + 1);
      }, speed + Math.random() * 20);
      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(() => { setLineIndex(l => l + 1); setCharIndex(0); }, 200);
      return () => clearTimeout(timer);
    }
  }, [hasStarted, lineIndex, charIndex, lines, speed, isDone]);

  return { displayed, isDone };
};

/* Scroll reveal */
const ScrollReveal = ({ children, className = '', delay = 0 }) => {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) setIsVisible(true); }, { threshold: 0.12 });
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
        let start = 0; const increment = end / (duration / 16);
        const timer = setInterval(() => { start += increment; if (start >= end) { setCount(end); clearInterval(timer); } else { setCount(Math.floor(start)); } }, 16);
      }
    }, { threshold: 0.5 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [end, duration]);
  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
};

/* ════════════════════════════════════════════════════════
   HERO — INTERACTIVE STACKED FILES ILLUSTRATION
   ════════════════════════════════════════════════════════ */

const FileCard = ({ title, icon, color, status, statusColor, delay, rotate, translate, zIndex, children }) => {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="absolute transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] cursor-default"
      style={{
        transform: hovered
          ? `${translate} rotate(0deg) scale(1.05)`
          : `${translate} rotate(${rotate}deg) scale(1)`,
        zIndex: hovered ? 50 : zIndex,
        transitionDelay: `${delay}ms`,
      }}
    >
      <div className={`w-64 bg-[#0D0B14]/95 backdrop-blur-xl border border-white/10 rounded-xl p-4 shadow-2xl ${hovered ? 'shadow-[0_20px_60px_rgba(99,102,241,0.2)] border-white/20' : ''} transition-all duration-500`}>
        {/* File header */}
        <div className="flex items-center gap-2.5 mb-3 pb-2.5 border-b border-white/[0.06]">
          <div className={`w-7 h-7 rounded-lg ${color} flex items-center justify-center`}>{icon}</div>
          <div className="flex-1">
            <div className="text-xs font-semibold text-white tracking-tight">{title}</div>
            <div className={`text-[9px] font-mono ${statusColor} uppercase tracking-wider mt-0.5 flex items-center gap-1`}>
              <div className={`w-1 h-1 rounded-full ${statusColor.replace('text-', 'bg-')} animate-pulse`} />
              {status}
            </div>
          </div>
        </div>
        {/* File body */}
        <div className="space-y-1.5">{children}</div>
      </div>
    </div>
  );
};

const HeroFileStack = () => {
  const [aiStep, setAiStep] = useState(0);
  const aiSteps = ['Scanning ledger entries...', 'Detecting anomalies...', 'Classifying transactions...', 'Generating insights...', '✓ Analysis complete'];
  useEffect(() => {
    const interval = setInterval(() => setAiStep(s => (s + 1) % aiSteps.length), 2200);
    return () => clearInterval(interval);
  }, []);

  const [ticker, setTicker] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => setTicker(t => t + 1), 3000);
    return () => clearInterval(interval);
  }, []);

  const revenues = useMemo(() => ['₹24.5L', '₹26.1L', '₹23.8L', '₹27.3L'], []);
  const expenses = useMemo(() => ['₹18.2L', '₹17.9L', '₹19.1L', '₹18.5L'], []);

  return (
    <div className="relative w-full h-[420px] md:h-[460px]">
      {/* Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-finledger-indigo/8 rounded-full blur-[100px]" />

      {/* File 1 — Financial Report */}
      <FileCard
        title="Q3_Financial_Report.xlsx"
        icon={<ChartBarIcon className="w-3.5 h-3.5 text-emerald-400" />}
        color="bg-emerald-500/15"
        status="processed"
        statusColor="text-emerald-400"
        delay={0} rotate={-6} translate="translate(5%, 12%)" zIndex={10}
      >
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-white/[0.03] rounded-lg p-2">
            <div className="text-[8px] text-gray-500 font-mono uppercase">Revenue</div>
            <div className="text-sm font-bold text-emerald-400 transition-all duration-500">{revenues[ticker % revenues.length]}</div>
            <div className="text-[9px] text-emerald-400/70 font-mono">+12.3%</div>
          </div>
          <div className="bg-white/[0.03] rounded-lg p-2">
            <div className="text-[8px] text-gray-500 font-mono uppercase">Expenses</div>
            <div className="text-sm font-bold text-rose-400 transition-all duration-500">{expenses[ticker % expenses.length]}</div>
            <div className="text-[9px] text-rose-400/70 font-mono">+3.1%</div>
          </div>
        </div>
        <div className="mt-2 w-full h-1 bg-white/5 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full animate-pulse" style={{ width: '72%' }} />
        </div>
      </FileCard>

      {/* File 2 — AI Analysis (center & front) */}
      <FileCard
        title="AI_Analysis_Engine"
        icon={<SparklesIcon className="w-3.5 h-3.5 text-finledger-indigo" />}
        color="bg-finledger-indigo/15"
        status="running"
        statusColor="text-finledger-indigo"
        delay={150} rotate={2} translate="translate(28%, 5%)" zIndex={20}
      >
        <div className="bg-[#080614] rounded-lg p-2.5 border border-white/[0.04]">
          <div className="font-mono text-[10px] leading-5 text-gray-400">
            <span className="text-finledger-indigo">❯</span> groq.analyze(
            <span className="text-emerald-400">ledger</span>)
          </div>
          <div className="font-mono text-[10px] leading-5 text-white mt-1 transition-all duration-500 min-h-[20px]">
            <span className="text-yellow-400">⟳</span> {aiSteps[aiStep]}
          </div>
          {aiStep === aiSteps.length - 1 && (
            <div className="font-mono text-[10px] text-emerald-400 mt-1 animate-fade-in">
              → 3 anomalies, 2 recommendations
            </div>
          )}
        </div>
        {/* Processing bar */}
        <div className="mt-2 flex items-center gap-2">
          <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-finledger-indigo to-finledger-electric rounded-full transition-all duration-[2000ms]"
              style={{ width: `${((aiStep + 1) / aiSteps.length) * 100}%` }}
            />
          </div>
          <span className="text-[9px] font-mono text-gray-500">{Math.round(((aiStep + 1) / aiSteps.length) * 100)}%</span>
        </div>
      </FileCard>

      {/* File 3 — GST Compliance */}
      <FileCard
        title="GST_Compliance_Check.pdf"
        icon={<DocumentMagnifyingGlassIcon className="w-3.5 h-3.5 text-amber-400" />}
        color="bg-amber-500/15"
        status="review needed"
        statusColor="text-amber-400"
        delay={300} rotate={5} translate="translate(55%, 18%)" zIndex={15}
      >
        <div className="space-y-1.5">
          {[
            { label: 'GSTR-1 Filed', ok: true },
            { label: 'GSTR-3B Match', ok: true },
            { label: 'ITC Reconciliation', ok: false },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-2 text-[10px]">
              {item.ok
                ? <CheckCircleIcon className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                : <ExclamationTriangleIcon className="w-3.5 h-3.5 text-amber-400 shrink-0 animate-pulse" />}
              <span className={item.ok ? 'text-gray-400' : 'text-amber-300 font-medium'}>{item.label}</span>
            </div>
          ))}
        </div>
      </FileCard>

      {/* File 4 — Audit Trail */}
      <FileCard
        title="Audit_Trail_2024.log"
        icon={<ClockIcon className="w-3.5 h-3.5 text-purple-400" />}
        color="bg-purple-500/15"
        status="logging"
        statusColor="text-purple-400"
        delay={450} rotate={-3} translate="translate(15%, 55%)" zIndex={12}
      >
        <div className="font-mono text-[9px] leading-4 text-gray-500 space-y-0.5">
          <div><span className="text-purple-400">18:42</span> User login: ca@finledger.com</div>
          <div><span className="text-purple-400">18:43</span> Opened: Stark Industries</div>
          <div><span className="text-purple-400">18:44</span> Ran AI analysis → 3 anomalies</div>
          <div><span className="text-emerald-400">18:45</span> Exported report → PDF <span className="animate-pulse">▊</span></div>
        </div>
      </FileCard>

      {/* File 5 — Transaction Import */}
      <FileCard
        title="Transactions_Import.csv"
        icon={<DocumentTextIcon className="w-3.5 h-3.5 text-cyan-400" />}
        color="bg-cyan-500/15"
        status="imported"
        statusColor="text-cyan-400"
        delay={600} rotate={4} translate="translate(48%, 52%)" zIndex={14}
      >
        <div className="bg-[#080614] rounded-lg p-2 border border-white/[0.04] overflow-hidden">
          <table className="w-full text-[8px] font-mono">
            <thead>
              <tr className="text-gray-500 border-b border-white/[0.04]">
                <th className="text-left pb-1">Date</th>
                <th className="text-left pb-1">Desc</th>
                <th className="text-right pb-1">Amt</th>
              </tr>
            </thead>
            <tbody className="text-gray-400">
              <tr><td>15 Mar</td><td>Office Rent</td><td className="text-right text-rose-400">-₹45K</td></tr>
              <tr><td>16 Mar</td><td>Client Pay</td><td className="text-right text-emerald-400">+₹2.1L</td></tr>
              <tr><td>17 Mar</td><td>Software</td><td className="text-right text-rose-400">-₹12K</td></tr>
            </tbody>
          </table>
        </div>
      </FileCard>
    </div>
  );
};

/* ════════════════════════════════════════════════════════
   SMART AI BADGE — Animated intelligence indicator
   ════════════════════════════════════════════════════════ */
const SmartAIBadge = () => {
  const [phase, setPhase] = useState(0);
  const phases = [
    { text: 'Analyzing patterns', icon: '🔍' },
    { text: 'Processing ledger', icon: '⚙️' },
    { text: 'Detecting anomalies', icon: '🧠' },
    { text: 'Ready to assist', icon: '✨' },
  ];
  useEffect(() => {
    const interval = setInterval(() => setPhase(p => (p + 1) % phases.length), 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="inline-flex items-center gap-3 px-5 py-2 bg-white/[0.04] rounded-full border border-white/10 backdrop-blur-md hover:bg-white/[0.08] transition-all duration-300 cursor-default group">
      <div className="relative">
        <CubeTransparentIcon className="w-4 h-4 text-finledger-indigo" />
        <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xs font-mono text-gray-400 transition-all duration-500">{phases[phase].icon}</span>
        <span className="text-xs font-medium text-gray-300 group-hover:text-white transition-colors min-w-[130px]">
          {phases[phase].text}
        </span>
      </div>
      <div className="flex gap-0.5">
        {[0, 1, 2, 3].map(i => (
          <div key={i} className={`w-1 rounded-full transition-all duration-300 ${i <= phase ? 'bg-finledger-indigo h-3' : 'bg-white/10 h-2'}`} />
        ))}
      </div>
    </div>
  );
};

/* ════════════════════════════════════════════════════════
   ANIMATED CURSOR
   ════════════════════════════════════════════════════════ */
const AnimatedCursor = ({ pathPoints, duration = 8000, delay = 0 }) => {
  const [pos, setPos] = useState(pathPoints[0]);
  const [visible, setVisible] = useState(false);
  const [clicking, setClicking] = useState(false);

  useEffect(() => {
    const startTimeout = setTimeout(() => {
      setVisible(true);
      let pointIndex = 0;
      const interval = setInterval(() => {
        pointIndex = (pointIndex + 1) % pathPoints.length;
        setPos(pathPoints[pointIndex]);
        if (pointIndex % 3 === 0) { setClicking(true); setTimeout(() => setClicking(false), 200); }
      }, duration / pathPoints.length);
      return () => clearInterval(interval);
    }, delay);
    return () => clearTimeout(startTimeout);
  }, [pathPoints, duration, delay]);

  if (!visible) return null;
  return (
    <div className="absolute z-30 pointer-events-none transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)]" style={{ left: `${pos.x}%`, top: `${pos.y}%` }}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className={`drop-shadow-[0_0_8px_rgba(99,102,241,0.6)] transition-transform duration-200 ${clicking ? 'scale-75' : 'scale-100'}`}>
        <path d="M5.65 1.65L21.35 12.65L13.35 13.65L17.35 22.65L14.35 23.65L10.35 14.65L5.65 19.65V1.65Z" fill="#6366f1" stroke="white" strokeWidth="1.5"/>
      </svg>
      {clicking && <div className="absolute top-2 left-2 w-6 h-6 rounded-full bg-finledger-indigo/30 animate-ping" />}
    </div>
  );
};

/* ════════════════════════════════════════════════════════
   TERMINAL CARD
   ════════════════════════════════════════════════════════ */
const TerminalCard = ({ lines, title, accentColor = 'indigo', delay = 0 }) => {
  const { displayed, isDone } = useTypingEffect(lines, 35, delay, true);
  const colorMap = { indigo: 'text-finledger-indigo', emerald: 'text-emerald-400', electric: 'text-purple-400', rose: 'text-rose-400' };
  const glowMap = { indigo: '0_0_60px_rgba(99,102,241,0.15)', emerald: '0_0_60px_rgba(16,185,129,0.15)', electric: '0_0_60px_rgba(139,92,246,0.15)', rose: '0_0_60px_rgba(244,63,94,0.15)' };

  return (
    <div className="bg-[#0D0B14] rounded-xl border border-white/10 overflow-hidden transition-all duration-500 group hover:border-white/20" style={{ boxShadow: glowMap[accentColor] }}>
      <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10 bg-white/[0.02]">
        <div className="w-3 h-3 rounded-full bg-rose-500/80" /><div className="w-3 h-3 rounded-full bg-amber-500/80" /><div className="w-3 h-3 rounded-full bg-emerald-500/80" />
        <span className="ml-2 font-mono text-[11px] text-gray-500">{title}</span>
      </div>
      <div className="p-5 font-mono text-sm leading-7 min-h-[180px]">
        {displayed.map((line, i) => (
          <div key={i} className="flex gap-2"><span className={`${colorMap[accentColor]} opacity-70`}>❯</span><span className="text-gray-300">{line}</span></div>
        ))}
        {!isDone && <div className="flex gap-2"><span className={`${colorMap[accentColor]} opacity-70`}>❯</span><span className={`${colorMap[accentColor]} animate-pulse font-bold`}>▊</span></div>}
        {isDone && <div className="flex gap-2 mt-1"><span className={`${colorMap[accentColor]} opacity-70`}>❯</span><span className="text-emerald-400">✓ complete</span><span className="animate-pulse text-gray-500">_</span></div>}
      </div>
    </div>
  );
};

/* ════════════════════════════════════════════════════════
   ANIMATED PROGRESS
   ════════════════════════════════════════════════════════ */
const AnimatedProgress = ({ label, value, color, delay = 0 }) => {
  const [width, setWidth] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    const timer = setTimeout(() => {
      const observer = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) setWidth(value); }, { threshold: 0.3 });
      if (ref.current) observer.observe(ref.current);
      return () => observer.disconnect();
    }, delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return (
    <div ref={ref} className="flex flex-col gap-1.5">
      <div className="flex justify-between text-xs"><span className="text-gray-400 font-mono">{label}</span><span className={`font-bold font-mono ${color}`}>{width}%</span></div>
      <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-[2000ms] ease-out ${color.replace('text-', 'bg-')}`} style={{ width: `${width}%` }} />
      </div>
    </div>
  );
};

/* ════════════════════════════════════════════════════════
   FLOATING PARTICLES
   ════════════════════════════════════════════════════════ */
const FloatingParticles = () => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden">
    {[...Array(15)].map((_, i) => (
      <div key={i} className="absolute w-1 h-1 bg-finledger-indigo/20 rounded-full"
        style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`, animation: `float ${4 + Math.random() * 4}s ease-in-out infinite`, animationDelay: `${Math.random() * 4}s` }}
      />
    ))}
  </div>
);

/* ════════════════════════════════════════════════════════
   FEATURE DATA
   ════════════════════════════════════════════════════════ */
const features = [
  {
    icon: <BuildingOfficeIcon className="w-5 h-5" />, label: "Portfolio", title: "Multi-Company Management",
    desc: "Manage unlimited client companies from a single unified dashboard with health scoring and priority alerts.",
    buttonText: "Explore Portfolio", accentColor: "indigo", terminalTitle: "company_portfolio.exe",
    terminalLines: ["loading client portfolio...", "scanning 147 companies...", "health_score: Stark Industries → 94/100", "health_score: Wayne Corp → 87/100", "⚠ alert: Oscorp — GST filing overdue", "generating priority dashboard..."],
    cursorPath: [{ x: 20, y: 30 }, { x: 45, y: 25 }, { x: 70, y: 40 }, { x: 55, y: 60 }, { x: 30, y: 55 }, { x: 40, y: 35 }],
    stats: [{ label: "Companies", value: "147" }, { label: "Health Score", value: "94%" }]
  },
  {
    icon: <CpuChipIcon className="w-5 h-5" />, label: "Intelligence", title: "AI-Powered Anomaly Detection",
    desc: "Detect expense spikes, revenue drops, and compliance risks in real-time using our Groq LLM engine.",
    buttonText: "Explore Intelligence", accentColor: "emerald", terminalTitle: "anomaly_scanner.exe",
    terminalLines: ["initializing groq-llm engine...", "model: llama-3-70b loaded ✓", "analyzing Q3 transactions...", "⚠ anomaly detected: +340% office expenses", "comparing trailing 3-month average...", "generating risk report → severity: HIGH"],
    cursorPath: [{ x: 30, y: 20 }, { x: 60, y: 35 }, { x: 75, y: 50 }, { x: 50, y: 65 }, { x: 25, y: 45 }, { x: 45, y: 30 }],
    stats: [{ label: "Anomalies", value: "23" }, { label: "Accuracy", value: "99.2%" }]
  },
  {
    icon: <ShieldCheckIcon className="w-5 h-5" />, label: "Storage", title: "Bank-Grade Secure Vault",
    desc: "AES-256 encrypted document vault for tax docs, audit reports, and client financials. Instantly accessible.",
    buttonText: "Explore Vault", accentColor: "electric", terminalTitle: "secure_vault.exe",
    terminalLines: ["initializing AES-256 encryption...", "vault connection: SECURE ✓", "scanning documents → 1,284 files", "verifying checksums...", "audit_report_Q3.pdf → VERIFIED", "storage: 2.4GB / 50GB used"],
    cursorPath: [{ x: 25, y: 25 }, { x: 55, y: 30 }, { x: 70, y: 45 }, { x: 45, y: 60 }, { x: 30, y: 50 }, { x: 50, y: 35 }],
    stats: [{ label: "Documents", value: "1,284" }, { label: "Encrypted", value: "100%" }]
  },
  {
    icon: <CalendarDaysIcon className="w-5 h-5" />, label: "Tracking", title: "Automated Compliance Calendar",
    desc: "Never miss ROC, GST, or Tax deadlines. Smart calendar with auto-reminders and priority tracking.",
    buttonText: "Explore Calendar", accentColor: "rose", terminalTitle: "compliance_tracker.exe",
    terminalLines: ["syncing compliance database...", "loading 2024-25 deadlines...", "GST-3B Mar → 7 days remaining", "TDS Q4 filing → 21 days remaining", "⚠ ROC Annual Return → OVERDUE", "sending alert to 3 team members..."],
    cursorPath: [{ x: 35, y: 20 }, { x: 60, y: 30 }, { x: 75, y: 55 }, { x: 50, y: 70 }, { x: 20, y: 50 }, { x: 40, y: 25 }],
    stats: [{ label: "Deadlines", value: "42" }, { label: "On-time", value: "98%" }]
  }
];

const heroStats = [
  { number: 500, suffix: '+', label: 'CA Firms' },
  { number: 12000, suffix: '+', label: 'Companies Managed' },
  { number: 99, suffix: '.9%', label: 'Uptime' },
  { number: 4, suffix: '.8★', label: 'User Rating' },
];

/* ════════════════════════════════════════════════════════
   MAIN LANDING PAGE
   ════════════════════════════════════════════════════════ */
const LandingPage = () => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const heroRef = useRef(null);
  const { user } = useAuthStore();
  const handleMouseMove = useCallback((e) => {
    if (heroRef.current) {
      const rect = heroRef.current.getBoundingClientRect();
      setMousePos({ x: ((e.clientX - rect.left) / rect.width - 0.5) * 15, y: ((e.clientY - rect.top) / rect.height - 0.5) * 15 });
    }
  }, []);

  return (
    <div className="bg-[#08060D] text-white min-h-screen font-sans selection:bg-finledger-indigo/30 selection:text-white">
      <PublicNavbar />

      <main className="flex flex-col">
        {/* ═══════════════ HERO ═══════════════ */}
        <div ref={heroRef} onMouseMove={handleMouseMove} className="relative overflow-hidden pt-20 md:pt-28 pb-10">
          <FloatingParticles />
          {/* Parallax glows */}
          <div className="absolute top-1/2 left-1/2 w-[80vw] h-[80vw] max-w-[900px] max-h-[900px] bg-finledger-indigo/8 rounded-full blur-[150px] pointer-events-none transition-transform duration-1000 ease-out"
            style={{ transform: `translate(calc(-50% + ${mousePos.x}px), calc(-50% + ${mousePos.y}px))` }} />
          <div className="absolute top-[60%] left-[30%] w-[40vw] h-[40vw] max-w-[500px] max-h-[500px] bg-finledger-electric/5 rounded-full blur-[120px] pointer-events-none transition-transform duration-1000 ease-out"
            style={{ transform: `translate(${-mousePos.x * 0.5}px, ${-mousePos.y * 0.5}px)` }} />

          <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center min-h-[85vh]">
              {/* LEFT — Copy */}
              <div className="flex flex-col gap-6 pt-10 lg:pt-0">
                <ScrollReveal>
                  <SmartAIBadge />
                </ScrollReveal>

                <ScrollReveal delay={100}>
                  <h1 className="text-5xl md:text-6xl xl:text-7xl font-black text-white tracking-tight leading-[1.05]">
                    <span className="block">Your Financial</span>
                    <span className="block mt-1">
                      <span className="shine-text">AI Workstation</span>
                    </span>
                    <span className="block mt-1 text-gray-400 text-3xl md:text-4xl xl:text-5xl font-bold">for Chartered Accountants</span>
                  </h1>
                </ScrollReveal>

                <ScrollReveal delay={200}>
                  <p className="text-gray-400 text-lg md:text-xl leading-relaxed max-w-lg">
                    Upload ledgers. Run AI analysis. Detect anomalies. Generate reports. All from one intelligent platform built exclusively for CA professionals.
                  </p>
                </ScrollReveal>

                <ScrollReveal delay={300}>
                  <div className="flex flex-col sm:flex-row items-start gap-4 mt-4">
                    <Link to={user ? (user.role === 'CLIENT' ? "/client-dashboard" : "/dashboard") : "/register"} className="btn-primary text-base !py-3.5 !px-8 shadow-[0_0_30px_rgba(255,255,255,0.15)] hover:shadow-[0_0_50px_rgba(255,255,255,0.3)] transition-all group relative overflow-hidden">
                      <span className="relative z-10 flex items-center gap-2">
                        <BoltIcon className="w-4 h-4" />{user ? "Go to Dashboard" : "Start Free Trial"}
                      </span>
                    </Link>
                    <Link to="/about" className="text-base text-gray-300 hover:text-white transition font-medium px-8 py-3.5 rounded-xl border border-white/10 hover:bg-white/5 hover:border-white/20">
                      Learn More
                    </Link>
                  </div>
                </ScrollReveal>

                <ScrollReveal delay={400}>
                  <div className="flex items-center gap-6 mt-6 pt-6 border-t border-white/[0.06]">
                    <div className="flex -space-x-2">
                      {['bg-finledger-indigo', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500'].map((c, i) => (
                        <div key={i} className={`w-8 h-8 rounded-full ${c} border-2 border-[#08060D] flex items-center justify-center text-[9px] font-bold text-white`}>
                          {['AG', 'RK', 'SM', 'VP'][i]}
                        </div>
                      ))}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-white">500+ CA professionals</div>
                      <div className="text-xs text-gray-500">joined this month</div>
                    </div>
                  </div>
                </ScrollReveal>
              </div>

              {/* RIGHT — Interactive File Stack */}
              <ScrollReveal delay={200} className="hidden lg:block">
                <HeroFileStack />
              </ScrollReveal>
            </div>
          </div>
        </div>

        {/* ═══════════════ STATS BAR ═══════════════ */}
        <ScrollReveal>
          <section className="w-full border-t border-b border-white/10 py-10 bg-white/[0.01]">
            <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 px-6">
              {heroStats.map((stat, i) => (
                <div key={i} className="text-center group cursor-default">
                  <div className="text-3xl md:text-4xl font-black text-white tracking-tight group-hover:text-finledger-indigo transition-colors duration-300">
                    <AnimatedCounter end={stat.number} suffix={stat.suffix} />
                  </div>
                  <div className="text-sm text-gray-500 font-medium mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          </section>
        </ScrollReveal>

        {/* ═══════════════ TRUSTED BY ═══════════════ */}
        <section className="w-full pt-10 md:pt-14 pb-14 flex flex-col items-center justify-center gap-8">
          <p className="text-center text-gray-500 text-sm font-medium tracking-wide uppercase">Trusted by top CA firms across the country</p>
          <div className="flex flex-wrap justify-center items-center gap-12 md:gap-24 opacity-50 grayscale hover:grayscale-0 hover:opacity-80 transition-all duration-500">
            <div className="text-2xl font-black tracking-tighter">MEHTA & CO.</div>
            <div className="text-2xl font-black tracking-widest font-serif">KAPOOR</div>
            <div className="text-2xl font-bold italic">Sharma Advisors</div>
            <div className="text-xl font-black tracking-tight">FinServe</div>
          </div>
        </section>

        {/* ═══════════════ FEATURES SECTION ═══════════════ */}
        <section id="features" className="bg-[#08060D] w-full">
          <section className="w-full border-t border-white/10 p-5 md:pl-10">
            <span className="text-gray-500 text-xs font-medium font-mono uppercase tracking-wide">CORE SUITE</span>
          </section>

          <ScrollReveal>
            <section className="w-full border-t border-white/10 px-10 h-48 sm:h-[300px] flex flex-col justify-center gap-5">
              <h2 className="text-start text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight">Financial Intelligence</h2>
              <p className="max-w-2xl text-gray-400 text-lg leading-relaxed">
                We are building the definitive toolchain for CA practices. Everything you need to scale your firm, analyze client data, and ensure absolute compliance.
              </p>
            </section>
          </ScrollReveal>

          <section className="w-full border-t border-white/10 flex flex-col md:flex-row">
            {/* Sticky Sidebar */}
            <div className="w-72 p-10 sticky top-20 self-start hidden md:flex flex-col border-r border-white/10 h-screen overflow-y-auto">
              <ul className="flex flex-col gap-6">
                {features.map((feature, i) => (
                  <li key={i} className="transition-all duration-300 opacity-70 hover:opacity-100 hover:translate-x-1">
                    <a href={`#feature-${i}`} className="flex items-center gap-4 text-base font-semibold text-white group">
                      <span className="group-hover:text-finledger-indigo transition-colors">{feature.icon}</span>
                      {feature.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Feature Blocks */}
            <div className="w-full flex flex-col relative z-20">
              {features.map((feature, i) => (
                <ScrollReveal key={i} delay={i * 100}>
                  <div id={`feature-${i}`} className={`grid lg:grid-cols-2 w-full ${i !== 0 ? 'border-t border-white/10' : ''}`}>
                    {/* Left content */}
                    <div className="flex flex-col p-10 justify-between gap-10 lg:gap-20">
                      <div className="flex flex-col gap-5 max-w-[24rem]">
                        <span className="text-gray-500 text-xs font-mono uppercase tracking-widest">{feature.label}</span>
                        <h4 className="text-3xl font-bold text-white tracking-tight leading-tight">{feature.title}</h4>
                        <p className="text-gray-400 text-base leading-relaxed">{feature.desc}</p>
                        <Link to="/register" className="btn-primary !px-6 !py-2.5 inline-block w-fit mt-5 text-sm">{feature.buttonText}</Link>
                      </div>
                      <div className="flex gap-4 divide-x divide-white/10 items-center bg-white/5 border border-white/10 px-4 py-2 w-fit rounded-lg hover:bg-white/[0.08] transition-all duration-300">
                        <div className="flex items-center gap-2 pr-4 text-white">{feature.icon}</div>
                        {feature.stats.map((stat, j) => (
                          <div key={j} className="flex gap-1.5 items-baseline pl-4">
                            <span className="text-white font-bold tracking-tight">{stat.value}</span>
                            <span className="text-gray-500 text-sm">{stat.label}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Right — Terminal */}
                    <div className="flex flex-col min-h-[16rem] sm:min-h-[30rem] border-l border-white/10 relative overflow-hidden bg-[#0D0B14]">
                      <div className="absolute inset-0 bg-gradient-to-br from-transparent to-white/5 opacity-50" />
                      <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] rounded-full blur-[100px] opacity-20`}
                        style={{ backgroundColor: feature.accentColor === 'indigo' ? 'rgba(99,102,241,0.2)' : feature.accentColor === 'emerald' ? 'rgba(16,185,129,0.2)' : feature.accentColor === 'electric' ? 'rgba(139,92,246,0.2)' : 'rgba(244,63,94,0.2)' }} />

                      <div className="relative p-6 md:p-10 h-full flex flex-col justify-center gap-4">
                        <AnimatedCursor pathPoints={feature.cursorPath} duration={8000} delay={i * 1500 + 2000} />
                        <TerminalCard lines={feature.terminalLines} title={feature.terminalTitle} accentColor={feature.accentColor} delay={i * 800 + 500} />
                        <div className="space-y-2 mt-2">
                          <AnimatedProgress label="cpu" value={Math.floor(30 + Math.random() * 50)}
                            color={feature.accentColor === 'indigo' ? 'text-finledger-indigo' : feature.accentColor === 'emerald' ? 'text-emerald-400' : feature.accentColor === 'electric' ? 'text-purple-400' : 'text-rose-400'}
                            delay={i * 500 + 1000} />
                          <AnimatedProgress label="mem" value={Math.floor(20 + Math.random() * 40)} color="text-gray-400" delay={i * 500 + 1200} />
                        </div>
                      </div>
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </section>
        </section>

        {/* ═══════════════ HOW IT WORKS ═══════════════ */}
        <ScrollReveal>
          <section className="w-full border-t border-white/10 px-6 md:px-10 py-20 md:py-32 bg-[#08060D]">
            <div className="max-w-5xl mx-auto">
              <h3 className="text-center text-3xl md:text-5xl font-black text-white tracking-tight mb-4">How It Works</h3>
              <p className="text-center text-gray-400 text-lg mb-16 max-w-2xl mx-auto">Three simple steps to transform your CA practice with AI-powered intelligence.</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                  { step: '01', title: 'Upload Data', desc: 'Import CSV transactions or connect Tally. Our parser handles all formats automatically.', icon: '📤', gradient: 'from-finledger-indigo to-blue-500' },
                  { step: '02', title: 'AI Analysis', desc: 'Groq LLM engine scans for anomalies, patterns, and compliance risks in real-time.', icon: '🧠', gradient: 'from-emerald-500 to-teal-500' },
                  { step: '03', title: 'Get Insights', desc: 'Receive actionable reports with priority scoring and smart recommendations.', icon: '📊', gradient: 'from-purple-500 to-pink-500' },
                ].map((item, i) => (
                  <ScrollReveal key={i} delay={i * 200}>
                    <div className="relative group cursor-default">
                      <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-8 hover:bg-white/[0.05] hover:border-white/15 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_60px_rgba(99,102,241,0.1)]">
                        <span className="text-4xl mb-4 block">{item.icon}</span>
                        <div className={`font-mono text-xs tracking-widest mb-3 bg-gradient-to-r ${item.gradient} bg-clip-text text-transparent font-bold`}>{item.step}</div>
                        <h4 className="text-xl font-bold text-white mb-3">{item.title}</h4>
                        <p className="text-gray-400 text-sm leading-relaxed">{item.desc}</p>
                      </div>
                      {i < 2 && <div className="hidden md:block absolute top-1/2 -right-4 w-8 text-gray-600 text-center">→</div>}
                    </div>
                  </ScrollReveal>
                ))}
              </div>
            </div>
          </section>
        </ScrollReveal>

        {/* ═══════════════ BOTTOM CTA ═══════════════ */}
        <ScrollReveal>
          <section className="w-full border-t border-white/10 px-5 md:px-10 py-20 md:py-40 flex flex-col items-center gap-10 bg-[#08060D] relative overflow-hidden">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vw] max-w-[600px] max-h-[600px] bg-finledger-indigo/5 rounded-full blur-[120px] pointer-events-none" />
            <h3 className="max-w-[45rem] text-center text-3xl md:text-5xl font-black text-white leading-tight mx-auto tracking-tight relative z-10">
              Our mission is to make the next generation of CAs more productive than ever before.
            </h3>
            <div className="flex flex-col sm:flex-row gap-6 items-center mt-4 relative z-10">
              <Link to={user ? (user.role === 'CLIENT' ? "/client-dashboard" : "/dashboard") : "/register"} className="btn-primary !px-10 !py-4 text-lg group relative overflow-hidden">
                <span className="relative z-10 flex items-center gap-2"><BoltIcon className="w-5 h-5" />{user ? "Go to Dashboard" : "Get Started Now"}</span>
              </Link>
              <Link to="/about" className="text-lg text-gray-400 hover:text-white transition font-medium px-8 py-4 rounded-xl border border-white/10 hover:bg-white/5">Learn more</Link>
            </div>
          </section>
        </ScrollReveal>

        {/* ═══════════════ FOOTER ═══════════════ */}
        <footer className="w-full border-t border-white/10 py-16 px-6 lg:px-10 bg-[#08060D]">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between gap-10">
            <div className="flex flex-col gap-4 max-w-sm">
              <div className="flex items-center gap-2">
                <ShieldCheckIcon className="w-6 h-6 text-finledger-indigo" />
                <span className="text-xl font-bold text-white tracking-tight">FinLedger Pro</span>
              </div>
              <p className="text-sm text-gray-500 leading-relaxed font-medium">The ultimate operating system for modern Chartered Accountants. Elevate your practice with unprecedented AI insights.</p>
            </div>
            <div className="flex gap-16">
              <div className="flex flex-col gap-4">
                <h4 className="text-white font-bold tracking-wide">Resources</h4>
                <Link to="/login" className="text-sm text-gray-500 hover:text-white transition">Sign In</Link>
                <Link to="/register" className="text-sm text-gray-500 hover:text-white transition">Start Free Trial</Link>
                <Link to="/about" className="text-sm text-gray-500 hover:text-white transition">About Us</Link>
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
            <p>© {new Date().getFullYear()} FinLedger Pro. All rights reserved.</p>
            <p className="mt-2 md:mt-0">Designed for Productivity.</p>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default LandingPage;
