import React from 'react';
import { Link } from 'react-router-dom';
import PublicNavbar from '../components/PublicNavbar';
import { 
  BoltIcon, HeartIcon, ShieldCheckIcon, 
  LightBulbIcon, UserGroupIcon, AcademicCapIcon 
} from '@heroicons/react/24/outline';

const values = [
  {
    icon: <LightBulbIcon className="w-6 h-6" />,
    title: 'Innovation First',
    desc: 'We leverage cutting-edge AI to solve real problems, not build tech for tech\'s sake.'
  },
  {
    icon: <ShieldCheckIcon className="w-6 h-6" />,
    title: 'Trust & Security',
    desc: 'Financial data is sacred. We employ enterprise-grade encryption and strict access controls.'
  },
  {
    icon: <UserGroupIcon className="w-6 h-6" />,
    title: 'CA-Centric Design',
    desc: 'Every feature is built from the perspective of a working Chartered Accountant managing real clients.'
  },
  {
    icon: <HeartIcon className="w-6 h-6" />,
    title: 'Impact Over Revenue',
    desc: 'We measure success by how many hours we save CAs, not just by MRR growth.'
  }
];

const milestones = [
  { year: '2023', event: 'Idea conceived during busy audit season at a Big 4 firm' },
  { year: '2024', event: 'MVP built and validated with 25 beta CAs in Mumbai & Delhi' },
  { year: '2025', event: 'Integrated Groq AI engine for real-time financial intelligence' },
  { year: '2026', event: '500+ CAs managing 12,000+ companies on the platform' },
];

const AboutUs = () => {
  return (
    <div className="bg-finledger-slate text-white min-h-screen">
      <PublicNavbar />

      {/* ===== HERO ===== */}
      <section className="relative pt-32 pb-20 px-6 lg:px-8 overflow-hidden">
        <div className="absolute top-[-15%] right-[-10%] w-[40rem] h-[40rem] bg-finledger-indigo/8 rounded-full blur-[150px] pointer-events-none" />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <p className="text-finledger-indigo text-sm font-bold uppercase tracking-widest mb-4">Our Story</p>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-[1.15] mb-6">
            Built by a CA Who
            <br />
            <span className="bg-gradient-to-r from-finledger-indigo to-finledger-emerald bg-clip-text text-transparent">
              Understood the Pain
            </span>
          </h1>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto leading-relaxed">
            FinLedger Pro was born from the frustration of spending countless hours on manual financial analysis. 
            We believe technology should amplify a CA's expertise, not replace it.
          </p>
        </div>
      </section>

      {/* ===== VISION ===== */}
      <section className="py-20 px-6 lg:px-8 border-t border-gray-800/50">
        <div className="max-w-5xl mx-auto">
          <div className="glass-panel p-12 md:p-16 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-finledger-indigo/5 to-finledger-emerald/5 pointer-events-none" />
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-finledger-indigo/20 flex items-center justify-center">
                  <BoltIcon className="w-6 h-6 text-finledger-indigo" />
                </div>
                <h2 className="text-2xl font-bold">Our Vision</h2>
              </div>
              <p className="text-xl text-gray-300 leading-relaxed font-light">
                "To become the default operating system for every Chartered Accountant in India — replacing manual 
                spreadsheets, fragmented tools, and guesswork with a unified, AI-powered intelligence platform 
                that makes every CA feel like they have a team of analysts behind them."
              </p>
              <div className="mt-8 flex items-center gap-4">
                <div className="w-1 h-16 bg-gradient-to-b from-finledger-indigo to-finledger-emerald rounded-full" />
                <div>
                  <p className="text-sm text-gray-500 font-medium uppercase tracking-wider">Our Mission</p>
                  <p className="text-gray-400 mt-1">Reduce CA workload by 60% while increasing the quality and depth of financial insights delivered to clients.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== FOUNDER ===== */}
      <section className="py-20 px-6 lg:px-8 border-t border-gray-800/50 bg-gradient-to-b from-finledger-slate to-finledger-charcoal">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-finledger-emerald text-sm font-bold uppercase tracking-widest mb-3">Leadership</p>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">
              Meet the <span className="text-finledger-indigo">Founder</span>
            </h2>
          </div>

          <div className="glass-panel p-8 md:p-12 flex flex-col md:flex-row gap-10 items-center">
            {/* Founder Image */}
            <div className="flex-shrink-0">
              <div className="w-56 h-56 md:w-64 md:h-64 rounded-2xl overflow-hidden border-2 border-finledger-indigo/30 shadow-2xl shadow-finledger-indigo/10 relative">
                <img 
                  src="/founder_aarushi.png" 
                  alt="CA Aarushi Gupta - Founder, FinLedger Pro" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-finledger-slate/60 to-transparent" />
              </div>
            </div>

            {/* Founder Bio */}
            <div className="flex-1 text-center md:text-left">
              <h3 className="text-2xl font-bold text-white mb-1">CA Aarushi Gupta</h3>
              <p className="text-finledger-indigo font-semibold text-sm mb-6">Founder & CEO</p>

              <div className="space-y-4 text-gray-400 text-sm leading-relaxed">
                <p>
                  Aarushi is a Chartered Accountant with over 8 years of experience spanning Big 4 advisory, 
                  mid-market audit, and independent consulting. She qualified as a CA topping her region and 
                  went on to build a practice serving 50+ SMBs across manufacturing, IT, and retail.
                </p>
                <p>
                  The idea for FinLedger Pro came during a particularly intense audit season, when she realized 
                  that 70% of her time was spent on repetitive data aggregation and manual variance analysis — 
                  tasks that AI could handle in seconds. She assembled a team of engineers and built the first 
                  prototype in just 12 weeks.
                </p>
                <p>
                  Today, she leads FinLedger Pro's product vision, ensuring every feature solves a real problem 
                  that CAs face daily. She remains an active practitioner, using her own platform to manage her 
                  clients.
                </p>
              </div>

              <div className="flex flex-wrap gap-3 mt-6 justify-center md:justify-start">
                <span className="text-xs font-semibold px-3 py-1.5 bg-finledger-indigo/10 text-finledger-indigo rounded-full border border-finledger-indigo/20">FCA, ICAI</span>
                <span className="text-xs font-semibold px-3 py-1.5 bg-finledger-emerald/10 text-finledger-emerald rounded-full border border-finledger-emerald/20">B.Com (Hons), SRCC</span>
                <span className="text-xs font-semibold px-3 py-1.5 bg-purple-500/10 text-purple-400 rounded-full border border-purple-500/20">AI & FinTech Enthusiast</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== VALUES ===== */}
      <section className="py-20 px-6 lg:px-8 border-t border-gray-800/50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-finledger-indigo text-sm font-bold uppercase tracking-widest mb-3">What Drives Us</p>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">Our Core Values</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {values.map((v, i) => (
              <div key={i} className="glass-panel p-8 flex gap-5 hover:border-finledger-indigo/20 transition-all group">
                <div className="w-12 h-12 shrink-0 rounded-xl bg-finledger-indigo/10 flex items-center justify-center text-finledger-indigo group-hover:bg-finledger-indigo/20 transition">
                  {v.icon}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white mb-2">{v.title}</h3>
                  <p className="text-sm text-gray-400 leading-relaxed">{v.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== TIMELINE ===== */}
      <section className="py-20 px-6 lg:px-8 border-t border-gray-800/50 bg-gradient-to-b from-finledger-slate to-finledger-charcoal">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-finledger-emerald text-sm font-bold uppercase tracking-widest mb-3">Our Journey</p>
            <h2 className="text-3xl font-extrabold tracking-tight">Key Milestones</h2>
          </div>

          <div className="relative">
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-finledger-indigo to-finledger-emerald rounded-full" />
            <div className="space-y-10">
              {milestones.map((m, i) => (
                <div key={i} className="flex gap-6 items-start">
                  <div className="w-12 h-12 shrink-0 rounded-full bg-finledger-charcoal border-2 border-finledger-indigo/50 flex items-center justify-center z-10 shadow-lg shadow-finledger-indigo/10">
                    <span className="text-xs font-bold text-finledger-indigo">{m.year}</span>
                  </div>
                  <div className="glass-panel p-5 flex-1 hover:border-finledger-indigo/20 transition-all">
                    <p className="text-sm text-gray-300">{m.event}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="py-20 px-6 lg:px-8 border-t border-gray-800/50">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-extrabold tracking-tight mb-4">Want to Join Our Journey?</h2>
          <p className="text-gray-400 mb-8">Start your free trial today and experience the future of CA practice management.</p>
          <Link to="/register" className="btn-primary text-base !py-3.5 !px-10">
            Get Started for Free
          </Link>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="border-t border-gray-800/50 py-8 px-6 text-center">
        <p className="text-xs text-gray-600">© {new Date().getFullYear()} FinLedger Pro. All rights reserved. Founded by CA Aarushi Gupta.</p>
      </footer>
    </div>
  );
};

export default AboutUs;
