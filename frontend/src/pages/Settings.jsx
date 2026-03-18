import React, { useState } from 'react';
import { useAuthStore } from '../stores/authStore';
import api from '../services/api';
import { Cog6ToothIcon, ShieldCheckIcon, KeyIcon, BuildingOfficeIcon } from '@heroicons/react/24/outline';

const Settings = () => {
  const { user, activeCompanyId, companies } = useAuthStore();
  const [groqKey, setGroqKey] = useState('');
  const [saved, setSaved] = useState(false);

  // Settings for budget/targets
  const [annualRevenueTarget, setAnnualRevenueTarget] = useState('');
  const [annualProfitTarget, setAnnualProfitTarget] = useState('');
  const [budgetSaved, setBudgetSaved] = useState(false);
  const [budgetError, setBudgetError] = useState(null);

  const activeCompany = companies.find(c => c._id === activeCompanyId);

  const handleSaveBudget = async (e) => {
    e.preventDefault();
    setBudgetError(null);
    try {
      await api.post('/companies/budget', {
        companyId: activeCompanyId,
        annualRevenueTarget: parseFloat(annualRevenueTarget),
        annualProfitTarget: parseFloat(annualProfitTarget)
      });
      setBudgetSaved(true);
      setTimeout(() => setBudgetSaved(false), 3000);
    } catch (err) {
      setBudgetError(err || 'Could not save budget targets.');
    }
  };

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
          <Cog6ToothIcon className="w-8 h-8 text-finledger-indigo" />
          Settings
        </h1>
        <p className="text-gray-400">Manage your workspace, API keys, and company targets.</p>
      </div>

      {/* Account Info */}
      <div className="glass-panel p-8 mb-8">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <ShieldCheckIcon className="w-6 h-6 text-finledger-emerald" />
          Account Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="text-xs text-gray-500 uppercase tracking-wider font-bold">Name</label>
            <p className="text-lg text-white font-medium mt-1">{user?.name}</p>
          </div>
          <div>
            <label className="text-xs text-gray-500 uppercase tracking-wider font-bold">Email</label>
            <p className="text-lg text-white font-medium mt-1">{user?.email}</p>
          </div>
          <div>
            <label className="text-xs text-gray-500 uppercase tracking-wider font-bold">Role</label>
            <p className="text-lg text-finledger-indigo font-bold mt-1">{user?.role}</p>
          </div>
          <div>
            <label className="text-xs text-gray-500 uppercase tracking-wider font-bold">Companies</label>
            <p className="text-lg text-white font-medium mt-1">{companies.length} connected</p>
          </div>
        </div>
      </div>

      {/* Budget / Targets Config */}
      {activeCompanyId && (
        <div className="glass-panel p-8 mb-8">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <BuildingOfficeIcon className="w-6 h-6 text-finledger-indigo" />
            Targets — {activeCompany?.name}
          </h3>
          <p className="text-gray-400 text-sm mb-6">Set your annual revenue and profit targets. The prorata engine uses these to calculate expected performance at any point in the year.</p>
          
          {budgetSaved && <div className="mb-4 bg-finledger-emerald/20 text-finledger-emerald border border-finledger-emerald/50 px-4 py-3 rounded-xl text-sm font-medium">Targets saved successfully.</div>}
          {budgetError && <div className="mb-4 bg-red-900/20 border border-red-900/50 text-red-400 px-4 py-3 rounded-xl text-sm font-medium">{budgetError}</div>}

          <form onSubmit={handleSaveBudget} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5 ml-1">Annual Revenue Target (₹)</label>
              <input 
                type="number"
                className="w-full bg-gray-800/50 border border-gray-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-finledger-indigo/50 transition-all placeholder-gray-500"
                placeholder="e.g. 5000000"
                value={annualRevenueTarget}
                onChange={(e) => setAnnualRevenueTarget(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5 ml-1">Annual Profit Target (₹)</label>
              <input 
                type="number"
                className="w-full bg-gray-800/50 border border-gray-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-finledger-indigo/50 transition-all placeholder-gray-500"
                placeholder="e.g. 1500000"
                value={annualProfitTarget}
                onChange={(e) => setAnnualProfitTarget(e.target.value)}
                required
              />
            </div>
            <div className="md:col-span-2">
              <button type="submit" className="btn-primary">Save Targets</button>
            </div>
          </form>
        </div>
      )}

      {/* API Key Config */}
      <div className="glass-panel p-8">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <KeyIcon className="w-6 h-6 text-yellow-500" />
          API Configuration
        </h3>
        <p className="text-gray-400 text-sm mb-6">Configure your Groq API key for LLM intelligence. This is stored server-side and never exposed to the client.</p>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5 ml-1">Groq API Key</label>
          <input 
            type="password"
            className="w-full bg-gray-800/50 border border-gray-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-finledger-indigo/50 transition-all placeholder-gray-500"
            placeholder="gsk_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
            value={groqKey}
            onChange={(e) => setGroqKey(e.target.value)}
          />
          <p className="text-xs text-gray-600 mt-2 ml-1">Note: In production this would be managed via environment variables.</p>
        </div>
        <button 
          className="btn-primary mt-6 opacity-50 cursor-not-allowed"
          disabled
        >
          Save Key (Server-side only)
        </button>
      </div>
    </div>
  );
};

export default Settings;
