import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import api from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BuildingOfficeIcon, PlusIcon, ExclamationTriangleIcon, 
  XMarkIcon, ArrowTrendingUpIcon, ArrowTrendingDownIcon,
  MagnifyingGlassIcon, SparklesIcon, ChartBarIcon,
  ShieldCheckIcon, ClockIcon, BoltIcon,
  ArrowPathIcon, ViewColumnsIcon
} from '@heroicons/react/24/outline';

/* ═══════════════════════════════════════════════════
   ADD COMPANY MODAL — Premium glassmorphism design
   ═══════════════════════════════════════════════════ */
const AddCompanyModal = ({ onClose, onCreated }) => {
  const [name, setName] = useState('');
  const [industry, setIndustry] = useState('');
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [annualRevenueTarget, setAnnualRevenueTarget] = useState('');
  const [annualProfitTarget, setAnnualProfitTarget] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await api.post('/companies', {
        name, industry, registrationNumber,
        annualRevenueTarget: annualRevenueTarget ? parseFloat(annualRevenueTarget) : undefined,
        annualProfitTarget: annualProfitTarget ? parseFloat(annualProfitTarget) : undefined
      });
      onCreated();
      onClose();
    } catch (err) {
      setError(err || 'Failed to create company');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100] flex items-center justify-center p-4" 
      onClick={onClose}
    >
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }} 
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="bg-[#0D0B14] border border-white/10 rounded-2xl p-8 max-w-lg w-full relative shadow-2xl shadow-black/50" 
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-white transition p-1 rounded-lg hover:bg-white/5">
          <XMarkIcon className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-finledger-indigo to-finledger-electric flex items-center justify-center shadow-lg shadow-finledger-indigo/20">
            <BuildingOfficeIcon className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Connect New Company</h2>
            <p className="text-xs text-gray-500">Add a client company to start analyzing financials.</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 text-red-400 bg-red-500/10 px-4 py-3 rounded-xl text-sm border border-red-500/20 flex items-center gap-2">
            <ExclamationTriangleIcon className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <InputField label="Company Name" required value={name} onChange={setName} placeholder="e.g. Stark Industries" />
          <div className="grid grid-cols-2 gap-3">
            <InputField label="Industry" value={industry} onChange={setIndustry} placeholder="e.g. Technology" />
            <InputField label="Reg. Number" value={registrationNumber} onChange={setRegistrationNumber} placeholder="e.g. CIN12345" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <InputField label="Revenue Target (₹)" type="number" value={annualRevenueTarget} onChange={setAnnualRevenueTarget} placeholder="5000000" />
            <InputField label="Profit Target (₹)" type="number" value={annualProfitTarget} onChange={setAnnualProfitTarget} placeholder="1500000" />
          </div>
          <button type="submit" disabled={loading} className="w-full btn-primary mt-2 flex items-center justify-center gap-2">
            {loading ? (
              <><div className="w-4 h-4 border-2 border-white/30 border-t-black rounded-full animate-spin" /> Connecting...</>
            ) : (
              <><PlusIcon className="w-4 h-4" /> Connect Company</>
            )}
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
};

/* Input field component */
const InputField = ({ label, value, onChange, placeholder, type = 'text', required = false }) => (
  <div>
    <label className="block text-xs font-medium text-gray-400 mb-1.5">{label} {required && <span className="text-finledger-indigo">*</span>}</label>
    <input 
      type={type} value={value} onChange={(e) => onChange(e.target.value)} required={required}
      className="w-full bg-white/[0.03] border border-white/[0.06] text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-finledger-indigo/30 focus:border-finledger-indigo/50 transition-all placeholder-gray-600 hover:border-white/10"
      placeholder={placeholder}
    />
  </div>
);

/* ═══════════════════════════════════════════════════
   COMPANY CARD — Interactive premium card
   ═══════════════════════════════════════════════════ */
const CompanyCard = ({ company, onClick, index }) => {
  const healthColor = company.healthScore >= 70 ? 'emerald' : company.healthScore >= 40 ? 'amber' : 'rose';
  const healthColors = {
    emerald: { text: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', glow: 'shadow-emerald-500/10' },
    amber: { text: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20', glow: 'shadow-amber-500/10' },
    rose: { text: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/20', glow: 'shadow-rose-500/10' },
  };
  const colors = healthColors[healthColor];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
      onClick={onClick}
      className="relative bg-white/[0.02] border border-white/[0.06] rounded-2xl p-6 hover:bg-white/[0.04] hover:border-white/10 transition-all duration-300 cursor-pointer group hover:-translate-y-1 hover:shadow-xl hover:shadow-black/20"
    >
      {/* Top section */}
      <div className="flex justify-between items-start mb-5">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-finledger-indigo/15 to-finledger-electric/15 border border-finledger-indigo/20 flex items-center justify-center shrink-0">
              <span className="text-xs font-bold text-finledger-indigo">{company.name?.charAt(0)}</span>
            </div>
            <h3 className="text-lg font-bold text-white truncate group-hover:text-finledger-indigo transition-colors">{company.name}</h3>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 bg-white/[0.04] text-gray-500 rounded-md border border-white/[0.04] uppercase tracking-wider">
            {company.industry || 'Unknown Sector'}
          </span>
        </div>

        {/* Health Score Ring */}
        <div className={`relative w-14 h-14 shrink-0`}>
          <svg className="w-full h-full -rotate-90" viewBox="0 0 40 40">
            <circle cx="20" cy="20" r="16" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="3" />
            <circle 
              cx="20" cy="20" r="16" fill="none" 
              stroke={healthColor === 'emerald' ? '#10b981' : healthColor === 'amber' ? '#f59e0b' : '#f43f5e'}
              strokeWidth="3" strokeLinecap="round"
              strokeDasharray={`${(company.healthScore / 100) * 100.5} 100.5`}
              className="transition-all duration-1000"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={`text-sm font-black ${colors.text}`}>{company.healthScore}</span>
          </div>
        </div>
      </div>

      {/* Metrics */}
      {company.metrics && (
        <div className="grid grid-cols-2 gap-2 mb-4">
          <div className="bg-white/[0.02] rounded-xl p-3 border border-white/[0.04]">
            <p className="text-[9px] text-gray-600 font-mono uppercase tracking-wider mb-1">Revenue</p>
            <p className="text-sm font-bold text-white">₹{company.metrics.totalRevenue?.toLocaleString()}</p>
          </div>
          <div className="bg-white/[0.02] rounded-xl p-3 border border-white/[0.04]">
            <p className="text-[9px] text-gray-600 font-mono uppercase tracking-wider mb-1">Profit</p>
            <p className={`text-sm font-bold ${company.metrics.profit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              ₹{company.metrics.profit?.toLocaleString()}
            </p>
          </div>
        </div>
      )}

      {/* Prorata Status */}
      {company.prorataStatus?.revenue && (
        <div className={`flex items-center gap-2 mb-4 px-3 py-2 rounded-xl text-xs font-semibold ${
          company.prorataStatus.revenue.status === 'AHEAD' 
            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/15' 
            : 'bg-rose-500/10 text-rose-400 border border-rose-500/15'
        }`}>
          {company.prorataStatus.revenue.status === 'AHEAD' 
            ? <ArrowTrendingUpIcon className="w-3.5 h-3.5"/> 
            : <ArrowTrendingDownIcon className="w-3.5 h-3.5"/>}
          Revenue {company.prorataStatus.revenue.status} by {company.prorataStatus.revenue.percentage}%
        </div>
      )}

      {/* Bottom section */}
      <div className="mt-auto space-y-3">
        {/* Risk Level */}
        <div className="flex justify-between items-center text-xs">
          <span className="text-gray-500 flex items-center gap-1.5">
            <ShieldCheckIcon className={`w-3.5 h-3.5 ${company.riskLevel === 'HIGH' ? 'text-rose-400' : 'text-gray-600'}`}/>
            Risk
          </span>
          <span className={`font-bold px-2 py-0.5 rounded-md ${
            company.riskLevel === 'HIGH' ? 'text-rose-400 bg-rose-500/10' 
            : company.riskLevel === 'MEDIUM' ? 'text-amber-400 bg-amber-500/10' 
            : 'text-emerald-400 bg-emerald-500/10'
          }`}>
            {company.riskLevel || 'LOW'}
          </span>
        </div>

        {/* Health progress bar */}
        <div className="w-full bg-white/[0.04] rounded-full h-1.5 overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${company.healthScore}%` }}
            transition={{ duration: 1, delay: index * 0.1, ease: 'easeOut' }}
            className={`h-full rounded-full ${
              company.healthScore >= 70 
                ? 'bg-gradient-to-r from-emerald-500 to-emerald-400'
                : company.healthScore >= 40 
                  ? 'bg-gradient-to-r from-amber-500 to-amber-400'
                  : 'bg-gradient-to-r from-rose-500 to-rose-400'
            }`}
          />
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-white/[0.04] flex justify-between items-center text-xs">
          <span className="text-gray-600 font-mono">Health: {company.healthScore}/100</span>
          <span className="text-finledger-indigo font-medium group-hover:translate-x-1 transition-transform flex items-center gap-1">
            Open Dashboard →
          </span>
        </div>
      </div>
    </motion.div>
  );
};

/* ═══════════════════════════════════════════════════
   MAIN DASHBOARD
   ═══════════════════════════════════════════════════ */
const Dashboard = () => {
  const { companies, fetchCompanies, switchCompany } = useAuthStore();
  const [portfolio, setPortfolio] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const loadPortfolio = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/metrics/portfolio');
      setPortfolio(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
    await fetchCompanies();
  }, [fetchCompanies]);

  useEffect(() => { loadPortfolio(); }, [loadPortfolio]);

  const handleCompanyClick = async (companyId) => {
    await switchCompany(companyId);
    navigate('/company');
  };

  const filteredPortfolio = portfolio.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (c.industry || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const displayData = filteredPortfolio.length > 0 ? filteredPortfolio : 
    companies.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase())).map(c => ({
      ...c, healthScore: c.healthScore || 100, metrics: null, prorataStatus: null
    }));

  // Portfolio stats
  const totalCompanies = displayData.length;
  const avgHealth = totalCompanies > 0 ? Math.round(displayData.reduce((sum, c) => sum + (c.healthScore || 0), 0) / totalCompanies) : 0;
  const highRiskCount = displayData.filter(c => c.riskLevel === 'HIGH').length;

  return (
    <div className="animate-fade-in max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
        <div>
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-1 rounded-lg bg-finledger-indigo/10 border border-finledger-indigo/20 text-finledger-indigo text-[10px] font-bold tracking-widest uppercase">
              Portfolio Hub
            </span>
            <span className="text-[10px] text-gray-600 font-mono">v2.0</span>
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="text-3xl md:text-4xl font-black text-white tracking-tight"
          >
            Portfolio Overview
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
            className="text-gray-500 mt-1 text-sm"
          >
            Manage and monitor all client companies in one centralized hub.
          </motion.p>
        </div>
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex gap-3">
          <button onClick={loadPortfolio} className="text-sm font-medium text-gray-400 hover:text-white bg-white/[0.03] border border-white/[0.06] hover:border-white/10 px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 hover:bg-white/[0.06]">
            <ArrowPathIcon className="w-4 h-4" /> Refresh
          </button>
          <button className="btn-primary flex items-center gap-2 text-sm" onClick={() => setShowAddModal(true)}>
            <PlusIcon className="w-4 h-4"/> Add Company
          </button>
        </motion.div>
      </div>

      {/* Stats Bar */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6"
      >
        {[
          { label: 'Total Companies', value: totalCompanies, icon: <BuildingOfficeIcon className="w-4 h-4" />, color: 'text-finledger-indigo' },
          { label: 'Avg Health', value: `${avgHealth}/100`, icon: <ChartBarIcon className="w-4 h-4" />, color: avgHealth >= 70 ? 'text-emerald-400' : 'text-amber-400' },
          { label: 'High Risk', value: highRiskCount, icon: <ExclamationTriangleIcon className="w-4 h-4" />, color: highRiskCount > 0 ? 'text-rose-400' : 'text-emerald-400' },
          { label: 'AI Engine', value: 'Online', icon: <SparklesIcon className="w-4 h-4" />, color: 'text-emerald-400' },
        ].map((stat, i) => (
          <div key={i} className="bg-white/[0.02] border border-white/[0.06] rounded-xl px-4 py-3 flex items-center gap-3 hover:bg-white/[0.04] transition-all cursor-default group">
            <div className={`${stat.color} opacity-60 group-hover:opacity-100 transition-opacity`}>{stat.icon}</div>
            <div>
              <div className="text-[9px] text-gray-600 font-mono uppercase tracking-wider">{stat.label}</div>
              <div className={`text-sm font-bold ${stat.color}`}>{stat.value}</div>
            </div>
          </div>
        ))}
      </motion.div>

      {/* Search */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="relative mb-6">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <MagnifyingGlassIcon className="h-4 w-4 text-gray-600" />
        </div>
        <input 
          type="text"
          className="block w-full pl-11 pr-4 py-3 border border-white/[0.06] rounded-xl bg-white/[0.02] text-white placeholder-gray-600 text-sm focus:outline-none focus:ring-2 focus:ring-finledger-indigo/20 focus:border-finledger-indigo/30 transition-all hover:border-white/10"
          placeholder="Search companies by name or industry..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </motion.div>

      {/* Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="relative mb-6">
            <div className="w-16 h-16 border-4 border-white/[0.06] border-t-finledger-indigo rounded-full animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <SparklesIcon className="w-5 h-5 text-finledger-indigo animate-pulse" />
            </div>
          </div>
          <p className="text-gray-500 font-medium text-sm">Loading portfolio intelligence...</p>
          <p className="text-gray-700 text-xs mt-1 font-mono">Syncing with AI engine</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          <AnimatePresence>
            {displayData.map((company, i) => (
              <CompanyCard 
                key={company._id} 
                company={company} 
                index={i}
                onClick={() => handleCompanyClick(company._id)}
              />
            ))}
          </AnimatePresence>

          {displayData.length === 0 && !loading && (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="col-span-full flex flex-col items-center justify-center p-16 bg-white/[0.01] border-2 border-dashed border-white/[0.06] rounded-2xl"
            >
              <div className="w-20 h-20 bg-white/[0.03] rounded-2xl flex items-center justify-center mb-6 border border-white/[0.06]">
                <BuildingOfficeIcon className="w-10 h-10 text-gray-600" />
              </div>
              <p className="text-xl font-bold text-gray-300 mb-2">No Companies Yet</p>
              <p className="text-gray-600 text-center max-w-md mb-8 text-sm">Begin by adding your first client company to start generating financial intelligence.</p>
              <button className="btn-primary flex items-center gap-2" onClick={() => setShowAddModal(true)}>
                <PlusIcon className="w-4 h-4" />Connect Company
              </button>
            </motion.div>
          )}
        </div>
      )}

      {/* Add Company Modal */}
      <AnimatePresence>
        {showAddModal && (
          <AddCompanyModal 
            onClose={() => setShowAddModal(false)} 
            onCreated={loadPortfolio}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Dashboard;
