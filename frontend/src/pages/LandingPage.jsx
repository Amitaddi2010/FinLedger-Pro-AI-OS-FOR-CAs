import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import PublicNavbar from '../components/PublicNavbar';
import { 
  BuildingOfficeIcon, CpuChipIcon, ShieldCheckIcon, CalendarDaysIcon 
} from '@heroicons/react/24/outline';

const features = [
  {
    icon: <BuildingOfficeIcon className="w-5 h-5" />,
    label: "Portfolio",
    title: "Multi-Company Management",
    desc: "Manage unlimited client companies from a single unified dashboard with health scoring and priority alerts. The entry point to your complete practice management.",
    buttonText: "Explore Portfolio",
    stats: [{ label: "stars", value: "79.0k" }, { label: "contributors", value: "1,245" }],
    graphicColor: "bg-finledger-indigo/20",
    graphicText: "company_portfolio.exe"
  },
  {
    icon: <CpuChipIcon className="w-5 h-5" />,
    label: "Intelligence",
    title: "AI-Powered Anomaly Detection",
    desc: "Detect expense spikes, revenue drops, and compliance risks in real-time by comparing against trailing 3-month averages using our Groq LLM engine.",
    buttonText: "Explore Intelligence",
    stats: [{ label: "stars", value: "16.1k" }, { label: "contributors", value: "722" }],
    graphicColor: "bg-finledger-emerald/20",
    graphicText: "anomaly_scanner.exe"
  },
  {
    icon: <ShieldCheckIcon className="w-5 h-5" />,
    label: "Storage",
    title: "Bank-Grade Secure Vault",
    desc: "AES-256 encrypted document vault for all your client financials, audit reports, and tax documents. Organized and accessible instantly.",
    buttonText: "Explore Vault",
    stats: [{ label: "stars", value: "13.1k" }, { label: "contributors", value: "160" }],
    graphicColor: "bg-finledger-electric/20",
    graphicText: "secure_vault.exe"
  },
  {
    icon: <CalendarDaysIcon className="w-5 h-5" />,
    label: "Tracking",
    title: "Automated Compliance Calendar",
    desc: "Never miss a ROC, GST, or Tax filing deadline again. Our smart calendar tracks and alerts you about all critical compliance dates.",
    buttonText: "Explore Calendar",
    stats: [{ label: "stars", value: "20.0k" }, { label: "contributors", value: "327" }],
    graphicColor: "bg-rose-500/20",
    graphicText: "compliance_tracker.exe"
  }
];

const LandingPage = () => {
  return (
    <div className="bg-[#08060D] text-white min-h-screen font-sans selection:bg-finledger-indigo/30 selection:text-white">
      <PublicNavbar />

      <main className="flex flex-col">
        {/* ===== HERO SECTION ===== */}
        <div className="flex flex-col justify-start items-center gap-6 pt-16 md:pt-32 pb-20 relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] max-w-[800px] max-h-[800px] bg-finledger-indigo/10 rounded-full blur-[120px] pointer-events-none" />
          
          <div className="w-full sm:max-w-3xl flex flex-col justify-start items-center gap-10 px-5 sm:px-0 relative z-10">
            <div className="flex flex-col justify-start items-center gap-6">
              <div inert="true" className="px-4 py-1.5 bg-white/5 rounded shadow-sm outline outline-1 outline-white/10 flex items-center gap-2 font-mono font-medium text-xs tracking-tight mb-4 backdrop-blur-md">
                <div className="p-0.5 bg-emerald-500/20 rounded-sm inline-flex justify-start items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                </div>
                <span className="text-gray-400">prod server</span>
                <span className="text-gray-600">/</span>
                <span className="text-gray-300">running</span>
              </div>
              
              <h1 className="text-center text-5xl md:text-7xl font-black text-white tracking-tight leading-[1.1] shine-text">
                <span className="block">The AI Operating System</span>
                <span className="block mt-2">For Chartered Accountants</span>
              </h1>
              
              <p className="self-stretch text-center text-gray-400 text-lg md:text-xl font-medium max-w-2xl mx-auto leading-relaxed mt-4">
                Making CA professionals more productive than ever before with AI-powered insights, anomaly detection, and unified portfolio management.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
                <Link to="/register" className="btn-primary text-base !py-3.5 !px-8 shadow-[0_0_30px_rgba(255,255,255,0.15)] hover:shadow-[0_0_40px_rgba(255,255,255,0.25)] transition-all">
                  Start Free Trial
                </Link>
                <Link to="/about" className="text-base text-gray-300 hover:text-white transition font-medium px-8 py-3.5 rounded-lg border border-white/10 hover:bg-white/5">
                  Learn More
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* ===== TRUSTED BY ===== */}
        <section className="w-full border-t border-white/10 pt-10 md:pt-14 pb-14 flex flex-col items-center justify-center gap-8">
          <p className="text-center text-gray-500 text-sm font-medium tracking-wide uppercase">
            Trusted by top CA firms across the country
          </p>
          <div className="flex flex-wrap justify-center items-center gap-12 md:gap-24 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
            <div className="text-2xl font-black tracking-tighter">MEHTA & CO.</div>
            <div className="text-2xl font-black tracking-widest font-serif">KAPOOR</div>
            <div className="text-2xl font-bold italic">Sharma Advisors</div>
            <div className="text-xl font-black tracking-tight">FinServe</div>
          </div>
        </section>

        {/* ===== MAIN FEATURES SECTION ===== */}
        <section className="bg-[#08060D] w-full">
          <section className="w-full border-t border-white/10 p-5 md:pl-10">
            <span className="text-gray-500 text-xs font-medium font-mono uppercase tracking-wide">CORE SUITE</span>
          </section>
          
          <section className="w-full border-t border-white/10 px-10 h-48 sm:h-[300px] flex flex-col justify-center gap-5">
            <h2 className="text-start text-4xl md:text-5xl font-black text-white tracking-tight">Financial Intelligence</h2>
            <p className="max-w-2xl text-gray-400 text-lg leading-relaxed">
              We are building the definitive toolchain for CA practices. Everything you need to scale your firm, analyze client data, and ensure absolute compliance.
            </p>
          </section>

          <section className="w-full border-t border-white/10 flex flex-col md:flex-row">
            {/* Sticky Sidebar */}
            <div className="w-72 p-10 sticky top-20 self-start hidden md:flex flex-col border-r border-white/10 h-screen overflow-y-auto">
              <ul className="flex flex-col gap-6">
                {features.map((feature, i) => (
                  <li key={i} className="transition-all duration-300 opacity-70 hover:opacity-100">
                    <button type="button" className="flex items-center gap-4 text-base font-semibold text-white">
                      {feature.icon}
                      {feature.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Feature Blocks */}
            <div className="w-full flex flex-col relative z-20">
              {features.map((feature, i) => (
                <div key={i} className={`grid lg:grid-cols-2 w-full ${i !== 0 ? 'border-t border-white/10' : ''}`}>
                  {/* Left content area */}
                  <div className="flex flex-col p-10 justify-between gap-10 lg:gap-20">
                    <div className="flex flex-col gap-5 max-w-[24rem]">
                      <span className="text-gray-500 text-xs font-mono uppercase tracking-widest">{feature.label}</span>
                      <h4 className="text-3xl font-bold text-white tracking-tight leading-tight">{feature.title}</h4>
                      <p className="text-gray-400 text-base leading-relaxed">
                        {feature.desc}
                      </p>
                      <Link to="/register" className="btn-primary !px-6 !py-2.5 inline-block w-fit mt-5 text-sm">
                        {feature.buttonText}
                      </Link>
                    </div>

                    <div className="flex gap-4 divide-x divide-white/10 items-center bg-white/5 border border-white/10 px-4 py-2 w-fit rounded-lg">
                      <div className="flex items-center gap-2 pr-4 text-white">
                        {feature.icon}
                      </div>
                      {feature.stats.map((stat, j) => (
                        <div key={j} className="flex gap-1.5 items-baseline pl-4">
                          <span className="text-white font-bold tracking-tight">{stat.value}</span>
                          <span className="text-gray-500 text-sm">{stat.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Right graphic area */}
                  <div className="flex flex-col min-h-[16rem] sm:min-h-[30rem] border-l border-white/10 relative overflow-hidden bg-[#0D0B14]">
                    <div className="absolute inset-0 bg-gradient-to-br from-transparent to-white/5 opacity-50" />
                    <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] ${feature.graphicColor} rounded-full blur-[100px] opacity-20`} />
                    
                    <div className="relative pl-10 h-full flex flex-col justify-center overflow-visible">
                      <div className="block p-4 relative bg-[#0D0B14] rounded-tl-xl rounded-bl-xl border border-white/10 border-r-0 shadow-[0_0_50px_rgba(0,0,0,0.5)] z-10 translate-x-10 aspect-[4/3] flex flex-col">
                        <div className="flex items-center gap-2 mb-4 pb-4 border-b border-white/10">
                          <div className="w-3 h-3 rounded-full bg-rose-500" />
                          <div className="w-3 h-3 rounded-full bg-amber-500" />
                          <div className="w-3 h-3 rounded-full bg-emerald-500" />
                          <span className="ml-2 font-mono text-xs text-gray-500">{feature.graphicText}</span>
                        </div>
                        <div className="flex-1 font-mono text-sm text-gray-300 opacity-70">
                          &gt; initializing module...<br/>
                          &gt; allocating memory...<br/>
                          &gt; connected to core engine.<br/>
                          <span className="animate-pulse">_</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </section>

        {/* ===== BOTTOM CTA ===== */}
        <section className="w-full border-t border-white/10 px-5 md:px-10 py-20 md:py-40 flex flex-col items-center gap-10 bg-[#08060D]">
          <h3 className="max-w-[45rem] text-center text-3xl md:text-5xl font-black text-white leading-tight mx-auto tracking-tight">
            Our mission is to make the next generation of CAs more productive than ever before.
          </h3>
          <div className="flex flex-row gap-6 items-baseline mt-4">
            <Link to="/about" className="btn-primary !px-10 !py-4 text-lg">Learn more</Link>
          </div>
        </section>

        {/* ===== FOOTER ===== */}
        <footer className="w-full border-t border-white/10 py-16 px-6 lg:px-10 bg-[#08060D]">
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
