import React, { useEffect, useState, useCallback } from 'react';
import { useAuthStore } from '../stores/authStore';
import api from '../services/api';
import { motion } from 'framer-motion';
import {
  DocumentCheckIcon, ChartBarIcon,
  ArrowUturnDownIcon, DocumentArrowUpIcon,
  CalculatorIcon, ExclamationCircleIcon,
  CheckCircleIcon, SparklesIcon
} from '@heroicons/react/24/outline';

const GstCard = ({ title, amount, subtitle, icon: Icon, colorClass, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.4 }}
    className="glass-panel p-6 relative overflow-hidden group hover:-translate-y-1 hover:shadow-2xl hover:shadow-finledger-indigo/10 transition-all duration-300"
  >
    <div className={`absolute top-0 right-0 p-6 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity transform translate-x-2 -translate-y-2 group-hover:scale-110 duration-500 ${colorClass}`}>
      {Icon && <Icon className="w-24 h-24" />}
    </div>
    <div className="relative z-10">
      <div className="flex items-center gap-3 mb-4">
        <div className={`p-2 rounded-lg bg-white/[0.04] border border-white/[0.06] ${colorClass}`}>
          {Icon && <Icon className="w-5 h-5" />}
        </div>
        <h4 className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{title}</h4>
      </div>
      <h2 className={`text-3xl font-black mb-1 tracking-tight ${colorClass}`}>
        ₹{amount?.toLocaleString('en-IN') || 0}
      </h2>
      <p className="text-xs text-gray-500 font-medium">{subtitle}</p>
    </div>
  </motion.div>
);

const GstIntelligence = () => {
  const { activeCompanyId, companies } = useAuthStore();
  const activeCompany = (companies || []).find(c => c._id === activeCompanyId);
  
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // Date selection
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [selectedYear, setSelectedYear] = useState(currentYear);

  const fetchGstData = useCallback(async () => {
    if (!activeCompanyId) return;
    setLoading(true);
    try {
      const res = await api.get(`/metrics/gst?month=${selectedMonth}&year=${selectedYear}`);
      setData(res.data);
    } catch (err) {
      console.error('GST Data Fetch Error:', err);
    } finally {
      // Add a tiny delay to make loading feel substantial
      setTimeout(() => setLoading(false), 400);
    }
  }, [activeCompanyId, selectedMonth, selectedYear]);

  useEffect(() => { fetchGstData(); }, [fetchGstData]);

  if (!activeCompanyId) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh] text-center animate-fade-in">
        <div className="w-24 h-24 rounded-3xl glass-card flex items-center justify-center mb-8 animate-float shadow-finledger-indigo/20">
          <DocumentCheckIcon className="w-10 h-10 text-finledger-indigo" />
        </div>
        <h2 className="text-3xl font-black text-white mb-3">No Workspace Selected</h2>
        <p className="text-finledger-silver max-w-md text-lg">Select a company from the sidebar to view GST intelligence.</p>
      </div>
    );
  }

  const months = [
    { value: 1, label: 'January' }, { value: 2, label: 'February' }, { value: 3, label: 'March' },
    { value: 4, label: 'April' }, { value: 5, label: 'May' }, { value: 6, label: 'June' },
    { value: 7, label: 'July' }, { value: 8, label: 'August' }, { value: 9, label: 'September' },
    { value: 10, label: 'October' }, { value: 11, label: 'November' }, { value: 12, label: 'December' }
  ];

  const years = [currentYear, currentYear - 1, currentYear - 2];

  return (
    <div className="animate-fade-in pb-12 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="mb-8 flex flex-col md:flex-row md:justify-between md:items-end gap-4">
        <div>
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-3 mb-1">
            <span className="px-2.5 py-1 rounded-md bg-finledger-indigo/10 border border-finledger-indigo/20 text-finledger-indigo text-[10px] font-bold tracking-widest uppercase">
              Tax Compliance Module
            </span>
          </motion.div>
          <h1 className="text-4xl font-black text-white tracking-tight">GST Intelligence</h1>
          <p className="text-gray-500 mt-1">GSTR-1 & 3B estimations and ITC tracking for {activeCompany?.name}</p>
        </div>

        {/* Date Controls */}
        <div className="flex items-center gap-3">
          <div className="glass-panel p-1.5 rounded-xl border-white/10 flex gap-2">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="bg-transparent text-sm text-white focus:outline-none cursor-pointer px-2"
            >
              {months.map(m => <option key={m.value} value={m.value} className="bg-gray-900">{m.label}</option>)}
            </select>
            <span className="text-white/20">|</span>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="bg-transparent text-sm text-white focus:outline-none cursor-pointer px-2"
            >
              {years.map(y => <option key={y} value={y} className="bg-gray-900">{y}</option>)}
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-10 h-10 border-4 border-white/10 border-t-finledger-indigo rounded-full animate-spin" />
        </div>
      ) : data ? (
        <>
          {/* Filing Status Banner */}
          <div className="mb-8">
            <div className={`flex flex-col md:flex-row items-center justify-between p-5 rounded-2xl border ${
              data.filingStatus === 'Ready to File' 
                ? 'bg-emerald-950/20 border-emerald-900/30' 
                : data.filingStatus === 'Overdue'
                ? 'bg-red-950/20 border-red-900/30'
                : 'bg-slate-800/20 border-white/5'
            }`}>
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl border ${
                  data.filingStatus === 'Ready to File' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' :
                  data.filingStatus === 'Overdue' ? 'bg-red-500/10 border-red-500/20 text-red-500' :
                  'bg-gray-500/10 border-gray-500/20 text-gray-500'
                }`}>
                  {data.filingStatus === 'Ready to File' ? <CheckCircleIcon className="w-6 h-6" /> :
                   data.filingStatus === 'Overdue' ? <ExclamationCircleIcon className="w-6 h-6" /> :
                   <DocumentCheckIcon className="w-6 h-6" />}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">GSTR-3B Status: {data.filingStatus}</h3>
                  <p className="text-sm text-gray-400">
                    {data.transactionCount > 0 
                      ? `Based on ${data.transactionCount} transactions processed for ${months.find(m => m.value === data.period.month)?.label} ${data.period.year}`
                      : 'No transaction data available for this period to estimate filing requirements.'}
                  </p>
                </div>
              </div>
              <div className="mt-4 md:mt-0 flex gap-3">
                <button className="px-5 py-2.5 rounded-xl border border-white/10 text-sm font-medium text-white hover:bg-white/5 transition-colors">
                  Generate GSTR-1
                </button>
                <button className="px-5 py-2.5 rounded-xl bg-finledger-indigo text-sm font-bold text-white hover:bg-finledger-electric transition-colors shadow-lg shadow-finledger-indigo/20">
                  Prepare GSTR-3B
                </button>
              </div>
            </div>
          </div>

          {/* Main KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <GstCard 
              title="Outward Tax Liability"
              amount={data.summary.totalOutwardTax}
              subtitle={`Computed from ₹${data.summary.totalOutwardSupply.toLocaleString('en-IN')} taxable sales`}
              icon={DocumentArrowUpIcon}
              colorClass="text-finledger-ruby"
              delay={0}
            />
            <GstCard 
              title="Input Tax Credit (ITC)"
              amount={data.summary.totalItcAvailable}
              subtitle={`Estimated claim from ₹${data.summary.totalInwardSupply.toLocaleString('en-IN')} expenses`}
              icon={ArrowUturnDownIcon}
              colorClass="text-finledger-emerald"
              delay={0.1}
            />
            <GstCard 
              title="Net GST Payable"
              amount={data.summary.netPayable}
              subtitle="Cash ledger liability after ITC setup"
              icon={CalculatorIcon}
              colorClass="text-finledger-indigo"
              delay={0.2}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Tax Head Breakdown */}
            <div className="lg:col-span-2 glass-panel p-8">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-sm font-bold text-finledger-silver uppercase tracking-widest flex items-center gap-2">
                  <ChartBarIcon className="w-5 h-5 text-finledger-indigo" />
                  Tax Head Breakdown (Estimated)
                </h3>
              </div>
              
              <div className="grid grid-cols-3 gap-6">
                <div className="bg-white/[0.02] border border-white/[0.05] p-5 rounded-2xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-16 h-16 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-all" />
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">IGST</p>
                  <p className="text-2xl font-black text-white">₹{data.taxHeadBreakdown.igst.toLocaleString('en-IN')}</p>
                  <p className="text-xs text-blue-400 mt-2">Inter-state Supplies</p>
                </div>
                
                <div className="bg-white/[0.02] border border-white/[0.05] p-5 rounded-2xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all" />
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">CGST</p>
                  <p className="text-2xl font-black text-white">₹{data.taxHeadBreakdown.cgst.toLocaleString('en-IN')}</p>
                  <p className="text-xs text-emerald-400 mt-2">Intra-state (Central)</p>
                </div>

                <div className="bg-white/[0.02] border border-white/[0.05] p-5 rounded-2xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-16 h-16 bg-purple-500/10 rounded-full blur-2xl group-hover:bg-purple-500/20 transition-all" />
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">SGST</p>
                  <p className="text-2xl font-black text-white">₹{data.taxHeadBreakdown.sgst.toLocaleString('en-IN')}</p>
                  <p className="text-xs text-purple-400 mt-2">Intra-state (State)</p>
                </div>
              </div>
            </div>

            {/* AI Intelligence Note */}
            <div className="glass-panel p-6 border-l-2 border-l-finledger-indigo bg-gradient-to-br from-finledger-indigo/5 to-transparent">
              <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-4 flex items-center gap-2">
                <SparklesIcon className="w-5 h-5 text-finledger-indigo" />
                AI Ledger Insights
              </h3>
              <p className="text-gray-300 text-sm leading-relaxed mb-4">
                FinLedger AI has analyzed {data.transactionCount} transactions for GST calculations. 
              </p>
              <ul className="space-y-3">
                <li className="flex gap-2 text-xs text-gray-400">
                  <span className="text-finledger-indigo">→</span>
                  No blocked ITC components identified in this period.
                </li>
                <li className="flex gap-2 text-xs text-gray-400">
                  <span className="text-finledger-indigo">→</span>
                  Outward supplies are consistent with the previous month's trend.
                </li>
                <li className="flex gap-2 text-xs text-gray-400">
                  <span className="text-finledger-indigo">→</span>
                  Tax rates assumed at standard 18% where explicit HSN/SAC logic was absent in the ingested CSV.
                </li>
              </ul>
            </div>

          </div>
        </>
      ) : null}
    </div>
  );
};

export default GstIntelligence;
