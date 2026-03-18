import React, { useState } from 'react';
import { useAuthStore } from '../stores/authStore';
import api from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Cog6ToothIcon, ShieldCheckIcon, KeyIcon, 
  BuildingOfficeIcon, UserCircleIcon, ExclamationTriangleIcon,
  CheckBadgeIcon
} from '@heroicons/react/24/outline';

const Settings = () => {
  const { user, activeCompanyId, companies } = useAuthStore();
  const [groqKey, setGroqKey] = useState('');
  
  // Client Invites
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientPassword, setClientPassword] = useState('');
  const [inviteStatus, setInviteStatus] = useState({ loading: false, message: null, error: null });
  
  // Settings for budget/targets
  const [annualRevenueTarget, setAnnualRevenueTarget] = useState('');
  const [annualProfitTarget, setAnnualProfitTarget] = useState('');
  const [budgetStatus, setBudgetStatus] = useState({ loading: false, saved: false, error: null });

  const activeCompany = (Array.isArray(companies) ? companies : []).find(c => c._id === activeCompanyId);

  const handleSaveBudget = async (e) => {
    e.preventDefault();
    setBudgetStatus({ loading: true, saved: false, error: null });
    try {
      await api.post('/companies/budget', {
        companyId: activeCompanyId,
        annualRevenueTarget: parseFloat(annualRevenueTarget),
        annualProfitTarget: parseFloat(annualProfitTarget)
      });
      setBudgetStatus({ loading: false, saved: true, error: null });
      setTimeout(() => setBudgetStatus(prev => ({ ...prev, saved: false })), 3000);
    } catch (err) {
      setBudgetStatus({ loading: false, saved: false, error: err || 'Could not save parameters.' });
    }
  };

  const handleInviteClient = async (e) => {
    e.preventDefault();
    if (!activeCompanyId) return;
    setInviteStatus({ loading: true, message: null, error: null });
    try {
      const res = await api.post('/auth/invite-client', {
        name: clientName,
        email: clientEmail,
        password: clientPassword,
        companyId: activeCompanyId
      });
      setInviteStatus({ loading: false, message: res.data.message, error: null });
      setClientName(''); setClientEmail(''); setClientPassword('');
      setTimeout(() => setInviteStatus({ loading: false, message: null, error: null }), 5000);
    } catch (err) {
      setInviteStatus({ loading: false, message: null, error: err?.response?.data?.message || 'Failed to create client access' });
    }
  };

  return (
    <div className="max-w-4xl mx-auto animate-fade-in pb-12">
      
      {/* Header */}
      <div className="mb-10 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
           <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-2 mb-2">
             <span className="px-2.5 py-1 rounded-lg bg-finledger-indigo/10 border border-finledger-indigo/20 text-finledger-indigo text-[10px] font-bold tracking-widest uppercase flex items-center gap-1.5">
                <Cog6ToothIcon className="w-3.5 h-3.5" /> Platform Config
             </span>
           </motion.div>
           <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-3xl md:text-4xl font-black text-white tracking-tight">
             Settings & Preferences
           </motion.h1>
           <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="text-gray-500 mt-2 font-medium max-w-lg">
             Manage your proprietary AI keys, client thresholds, and CA administration.
           </motion.p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Account Info Panel */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="md:col-span-12 glass-panel relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/5 rounded-full blur-[60px]" />
          
          <div className="p-8 border-b border-white/[0.06] flex items-center gap-4 relative z-10">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <ShieldCheckIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white tracking-tight">Identity & Entitlements</h3>
              <p className="text-[10px] text-emerald-400 uppercase tracking-widest font-bold mt-0.5">Verified Principal</p>
            </div>
          </div>
          
          <div className="p-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 bg-white/[0.01] relative z-10">
            <InfoBlock label="Administrator Name" value={user?.name} icon={<UserCircleIcon className="w-4 h-4 text-gray-400" />} />
            <InfoBlock label="Registered Email" value={user?.email} />
            <InfoBlock label="Clearance Level" value={user?.role} highlight />
            <InfoBlock label="Managed Entities" value={`${companies.length} Linked Portfolios`} />
          </div>
        </motion.div>

        {/* Budget Config Panel */}
        {activeCompanyId ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="md:col-span-7 glass-panel flex flex-col relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-finledger-indigo/5 rounded-full blur-[60px] pointer-events-none" />
            
            <div className="p-6 md:p-8 border-b border-white/[0.06] relative z-10 relative">
              <div className="flex items-center gap-3 mb-1">
                <BuildingOfficeIcon className="w-6 h-6 text-finledger-indigo" />
                <h3 className="text-xl font-bold text-white tracking-tight">Target Parameters</h3>
              </div>
              <p className="text-[11px] font-medium text-gray-500 uppercase tracking-widest pl-9">Entity: {activeCompany?.name}</p>
            </div>
            
            <div className="p-6 md:p-8 flex-1 bg-white/[0.01] relative z-10">
              <p className="text-gray-400 text-sm mb-6 leading-relaxed font-medium">Establish statutory revenue and profit expectations. Prorata logic modules utilize these targets to calculate real-time performance vectoring.</p>
              
              <AnimatePresence>
                {budgetStatus.saved && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mb-6 bg-emerald-500/10 border border-emerald-500/20 px-4 py-3 rounded-xl flex items-center gap-3 text-emerald-400">
                    <CheckBadgeIcon className="w-5 h-5 shrink-0" />
                    <span className="text-sm font-bold">Parameters synchronized with engine.</span>
                  </motion.div>
                )}
                {budgetStatus.error && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mb-6 bg-rose-500/10 border border-rose-500/20 px-4 py-3 rounded-xl flex items-center gap-3 text-rose-400">
                    <ExclamationTriangleIcon className="w-5 h-5 shrink-0" />
                    <span className="text-sm font-bold">{budgetStatus.error}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              <form onSubmit={handleSaveBudget} className="space-y-5">
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5 ml-1">Core Revenue Baseline (₹)</label>
                  <input 
                    type="number"
                    className="w-full bg-white/[0.03] border border-white/[0.06] text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-finledger-indigo/30 focus:border-finledger-indigo/50 transition-all font-mono placeholder-gray-600 hover:border-white/10"
                    placeholder="e.g. 5000000"
                    value={annualRevenueTarget}
                    onChange={(e) => setAnnualRevenueTarget(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5 ml-1">Net Margin Vector (₹)</label>
                  <input 
                    type="number"
                    className="w-full bg-white/[0.03] border border-white/[0.06] text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-finledger-indigo/30 focus:border-finledger-indigo/50 transition-all font-mono placeholder-gray-600 hover:border-white/10"
                    placeholder="e.g. 1500000"
                    value={annualProfitTarget}
                    onChange={(e) => setAnnualProfitTarget(e.target.value)}
                    required
                  />
                </div>
                <button type="submit" disabled={budgetStatus.loading} className="w-full btn-primary py-3.5 mt-2 rounded-xl flex justify-center items-center gap-2">
                  {budgetStatus.loading ? <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" /> : 'Calibrate Engine Targets'}
                </button>
              </form>
            </div>
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="md:col-span-7 glass-panel flex flex-col items-center justify-center p-10 text-center border-dashed border-2 border-white/[0.05]">
             <BuildingOfficeIcon className="w-12 h-12 text-gray-600 mb-4" />
             <h3 className="text-lg font-bold text-gray-300">No Entity Selected</h3>
             <p className="text-sm text-gray-500 font-medium">Connect to a client workspace from the sidebar to configure target parameters.</p>
          </motion.div>
        )}

        {/* API Key Config Panel */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="md:col-span-5 glass-panel flex flex-col relative overflow-hidden">
          <div className="p-6 md:p-8 border-b border-white/[0.06]">
            <div className="flex items-center gap-3 mb-1">
              <KeyIcon className="w-6 h-6 text-amber-500" />
              <h3 className="text-xl font-bold text-white tracking-tight">Engine Credentials</h3>
            </div>
            <p className="text-[11px] font-medium text-amber-500/80 uppercase tracking-widest pl-9">Strict Confidentiality</p>
          </div>
          
          <div className="p-6 md:p-8 flex-1 bg-white/[0.01]">
            <p className="text-gray-400 text-sm mb-6 leading-relaxed font-medium">Input proprietary LLM cryptographic keys to enable dynamic financial analysis. Key injection is managed server-side and entirely abstracted from untrusted client execution.</p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5 ml-1">Groq LPU Authorization Key</label>
                <input 
                  type="password"
                  className="w-full bg-white/[0.03] border border-white/[0.06] text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500/50 transition-all font-mono placeholder-gray-600 hover:border-white/10"
                  placeholder="gsk_•••••••••••••••••••••••••"
                  value={groqKey}
                  onChange={(e) => setGroqKey(e.target.value)}
                />
              </div>
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 text-[10px] font-medium text-amber-400/80 leading-relaxed uppercase tracking-wider">
                Note: In production topologies, credential delegation is exclusively handled natively via immutable environment variables.
              </div>
              <button className="w-full btn-primary bg-white/5 border border-white/10 text-gray-500 py-3.5 mt-2 rounded-xl cursor-not-allowed uppercase tracking-widest text-[11px]" disabled>
                Injection Lock Engaged
              </button>
            </div>
          </div>
        </motion.div>
        
        {/* Client Access Setup Panel */}
        {activeCompanyId && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="md:col-span-12 glass-panel flex flex-col relative overflow-hidden mt-6">
            <div className="absolute top-0 left-0 w-48 h-48 bg-emerald-500/5 rounded-full blur-[60px] pointer-events-none" />
            
            <div className="p-6 md:p-8 border-b border-white/[0.06]">
              <div className="flex items-center gap-3 mb-1">
                <UserCircleIcon className="w-6 h-6 text-emerald-500" />
                <h3 className="text-xl font-bold text-white tracking-tight">Client Portal Provisioning</h3>
              </div>
              <p className="text-[11px] font-medium text-emerald-500/80 uppercase tracking-widest pl-9">Entity: {activeCompany?.name}</p>
            </div>
            
            <div className="p-6 md:p-8 flex-1 bg-white/[0.01]">
              <p className="text-gray-400 text-sm mb-6 leading-relaxed font-medium max-w-2xl">
                Generate a restricted portal login for this specific client. They will only have access to their Vault, PDF Executive Summaries, and Receipt Uploads. They will NOT see insights, predictive alerts, or settings.
              </p>
              
              <AnimatePresence>
                {inviteStatus.message && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mb-6 bg-emerald-500/10 border border-emerald-500/20 px-4 py-3 rounded-xl flex items-center gap-3 text-emerald-400">
                    <CheckBadgeIcon className="w-5 h-5 shrink-0" />
                    <span className="text-sm font-bold">{inviteStatus.message}</span>
                  </motion.div>
                )}
                {inviteStatus.error && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mb-6 bg-rose-500/10 border border-rose-500/20 px-4 py-3 rounded-xl flex items-center gap-3 text-rose-400">
                    <ExclamationTriangleIcon className="w-5 h-5 shrink-0" />
                    <span className="text-sm font-bold">{inviteStatus.error}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              <form onSubmit={handleInviteClient} className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5 ml-1">Client Name</label>
                  <input 
                    type="text"
                    className="w-full bg-white/[0.03] border border-white/[0.06] text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/50 transition-all font-mono placeholder-gray-600 hover:border-white/10"
                    placeholder="e.g. Tony Stark"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5 ml-1">Client Email Address</label>
                  <input 
                    type="email"
                    className="w-full bg-white/[0.03] border border-white/[0.06] text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/50 transition-all font-mono placeholder-gray-600 hover:border-white/10"
                    placeholder="tony@stark.com"
                    value={clientEmail}
                    onChange={(e) => setClientEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="relative">
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5 ml-1">Temporary Password</label>
                  <input 
                    type="password"
                    className="w-full bg-white/[0.03] border border-white/[0.06] text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/50 transition-all font-mono placeholder-gray-600 hover:border-white/10"
                    placeholder="••••••••"
                    value={clientPassword}
                    onChange={(e) => setClientPassword(e.target.value)}
                    required
                    minLength="6"
                  />
                </div>
                <div className="md:col-span-3 flex justify-end">
                   <button type="submit" disabled={inviteStatus.loading} className="btn-primary flex items-center gap-2 !bg-emerald-600 hover:!bg-emerald-500 border-none">
                     {inviteStatus.loading ? <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : 'Provision Client Access'}
                   </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}

      </div>
    </div>
  );
};

/* Info Block Component */
const InfoBlock = ({ label, value, highlight, icon }) => (
  <div className="flex flex-col gap-1.5">
    <div className="text-[9px] uppercase font-bold tracking-widest text-gray-500 flex items-center gap-1.5">
      {icon} {label}
    </div>
    <div className={`text-sm md:text-base font-medium truncate ${highlight ? 'text-finledger-indigo bg-finledger-indigo/10 px-2.5 py-1 -ml-2.5 rounded-md inline-block self-start font-bold' : 'text-gray-200'}`}>
      {value || '—'}
    </div>
  </div>
);

export default Settings;
