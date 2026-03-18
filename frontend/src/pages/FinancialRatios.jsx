import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../stores/authStore';
import api from '../services/api';
import { motion } from 'framer-motion';
import {
  ChartBarSquareIcon, ArrowTrendingUpIcon, ArrowTrendingDownIcon,
  SparklesIcon, CalculatorIcon, BanknotesIcon,
  CurrencyDollarIcon, PresentationChartLineIcon, FireIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

const RatioCard = ({ title, value, suffix = '', prefix = '', icon: Icon, description, status, index = 0 }) => {
  const isPositive = status === 'good';
  const isBad = status === 'bad';
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4 }}
      className="glass-panel p-6 relative overflow-hidden group hover:-translate-y-1 hover:shadow-2xl hover:shadow-finledger-indigo/10 transition-all duration-300"
    >
      <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity transform translate-x-2 -translate-y-2 group-hover:scale-110 duration-500">
        {Icon && <Icon className="w-24 h-24" />}
      </div>
      <div className="flex items-start justify-between mb-3 relative z-10">
        <div className="p-2 rounded-lg bg-white/[0.04] border border-white/[0.06]">
          {Icon && <Icon className="w-4 h-4 text-finledger-indigo" />}
        </div>
        {status && (
          <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded-md border ${
            isPositive ? 'bg-finledger-emerald/10 text-finledger-emerald border-finledger-emerald/20' :
            isBad ? 'bg-finledger-ruby/10 text-finledger-ruby border-finledger-ruby/20' :
            'bg-finledger-gold/10 text-finledger-gold border-finledger-gold/20'
          }`}>
            {isPositive ? 'Healthy' : isBad ? 'At Risk' : 'Monitor'}
          </span>
        )}
      </div>
      <h4 className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">{title}</h4>
      <h2 className="text-3xl font-black text-white mb-1 tracking-tight">
        {prefix}{typeof value === 'number' ? value.toLocaleString('en-IN') : value}{suffix}
      </h2>
      <p className="text-xs text-gray-500 leading-relaxed">{description}</p>
    </motion.div>
  );
};

const FinancialRatios = () => {
  const { activeCompanyId, companies } = useAuthStore();
  const activeCompany = (Array.isArray(companies) ? companies : []).find(c => c._id === activeCompanyId);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    if (!activeCompanyId) return;
    setLoading(true);
    setAiAnalysis(null);
    api.get('/metrics/ratios')
      .then(res => setData(res.data))
      .catch(err => console.error('Ratios Error:', err))
      .finally(() => setLoading(false));
  }, [activeCompanyId]);

  const requestAiAnalysis = async () => {
    if (!data) return;
    setAiLoading(true);
    try {
      const prompt = `Analyze these financial ratios for a company called "${activeCompany?.name || 'Unknown'}":
- Net Margin: ${data.ratios.netMargin}%
- Expense Ratio: ${data.ratios.expenseRatio}%
- Revenue Growth (YoY): ${data.ratios.revenueGrowth}%
- Profit Growth (YoY): ${data.ratios.profitGrowth}%
- Revenue-to-Expense Coverage: ${data.ratios.burnCoverage}x
- Avg Transaction Size: ₹${data.ratios.avgTransactionSize}
- Monthly Avg Revenue: ₹${data.ratios.monthlyAvgRevenue}
- Total Transactions: ${data.meta.txnCount} (${data.meta.incomeCount} income, ${data.meta.expenseCount} expenses)

Provide a concise 3-4 sentence executive interpretation. Highlight what's healthy, what's risky, and one actionable recommendation.`;

      const res = await api.post('/insights/ask', { question: prompt });
      setAiAnalysis(res.data.answer || res.data.response || 'Analysis complete.');
    } catch (err) {
      console.error('AI Analysis Error:', err);
      setAiAnalysis('Unable to generate analysis. Please try again.');
    } finally {
      setAiLoading(false);
    }
  };

  if (!activeCompanyId) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh] text-center animate-fade-in">
        <div className="w-24 h-24 rounded-3xl glass-card flex items-center justify-center mb-8 animate-float">
          <CalculatorIcon className="w-10 h-10 text-finledger-indigo" />
        </div>
        <h2 className="text-3xl font-black text-white mb-3">No Workspace Selected</h2>
        <p className="text-finledger-silver max-w-md text-lg">Select a company to view its financial health ratios.</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in pb-12 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="mb-8 flex flex-col md:flex-row md:justify-between md:items-end gap-4">
        <div>
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-3 mb-1">
            <span className="px-2.5 py-1 rounded-md bg-finledger-indigo/10 border border-finledger-indigo/20 text-finledger-indigo text-[10px] font-bold tracking-widest uppercase">
              Financial Intelligence
            </span>
          </motion.div>
          <h1 className="text-4xl font-black text-white tracking-tight">Financial Ratios</h1>
          <p className="text-gray-500 mt-1">Auto-computed health metrics for {activeCompany?.name}</p>
        </div>
        <button
          onClick={requestAiAnalysis}
          disabled={aiLoading || !data}
          className="btn-primary flex items-center gap-2 text-sm rounded-xl px-5"
        >
          {aiLoading ? (
            <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Analyzing...</>
          ) : (
            <><SparklesIcon className="w-4 h-4" /> AI Interpretation</>
          )}
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-10 h-10 border-4 border-white/10 border-t-finledger-indigo rounded-full animate-spin" />
        </div>
      ) : data ? (
        <>
          {/* AI Analysis Panel */}
          {aiAnalysis && (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass-panel border-finledger-indigo/30 overflow-hidden relative mb-8 shadow-2xl shadow-finledger-indigo/10"
            >
              <div className="absolute top-0 left-0 w-1.5 h-full primary-gradient" />
              <div className="p-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-finledger-indigo/10 rounded-xl border border-finledger-indigo/20">
                    <SparklesIcon className="w-5 h-5 text-finledger-indigo" />
                  </div>
                  <h3 className="text-lg font-bold text-white">AI Financial Interpretation</h3>
                </div>
                <p className="text-gray-300 leading-relaxed text-sm">{aiAnalysis}</p>
              </div>
            </motion.div>
          )}

          {/* Ratio Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <RatioCard
              index={0}
              title="Net Profit Margin"
              value={data.ratios.netMargin}
              suffix="%"
              icon={PresentationChartLineIcon}
              description="Profit retained per rupee of revenue"
              status={data.ratios.netMargin >= 15 ? 'good' : data.ratios.netMargin >= 0 ? 'neutral' : 'bad'}
            />
            <RatioCard
              index={1}
              title="Expense Ratio"
              value={data.ratios.expenseRatio}
              suffix="%"
              icon={BanknotesIcon}
              description="Percentage of revenue consumed by expenses"
              status={data.ratios.expenseRatio <= 70 ? 'good' : data.ratios.expenseRatio <= 90 ? 'neutral' : 'bad'}
            />
            <RatioCard
              index={2}
              title="Revenue Growth (YoY)"
              value={data.ratios.revenueGrowth}
              suffix="%"
              icon={ArrowTrendingUpIcon}
              description="Year-over-year revenue trajectory"
              status={data.ratios.revenueGrowth > 10 ? 'good' : data.ratios.revenueGrowth >= 0 ? 'neutral' : 'bad'}
            />
            <RatioCard
              index={3}
              title="Profit Growth (YoY)"
              value={data.ratios.profitGrowth}
              suffix="%"
              icon={data.ratios.profitGrowth >= 0 ? ArrowTrendingUpIcon : ArrowTrendingDownIcon}
              description="Year-over-year profit trajectory"
              status={data.ratios.profitGrowth > 5 ? 'good' : data.ratios.profitGrowth >= 0 ? 'neutral' : 'bad'}
            />
            <RatioCard
              index={4}
              title="Revenue Coverage"
              value={data.ratios.burnCoverage}
              suffix="x"
              icon={FireIcon}
              description="How many times revenue covers expenses"
              status={data.ratios.burnCoverage >= 1.3 ? 'good' : data.ratios.burnCoverage >= 1 ? 'neutral' : 'bad'}
            />
            <RatioCard
              index={5}
              title="Avg Transaction Size"
              value={data.ratios.avgTransactionSize}
              prefix="₹"
              icon={CurrencyDollarIcon}
              description="Average value per ledger entry"
            />
          </div>

          {/* Bottom Stats Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass-panel p-6">
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-3 flex items-center gap-2">
                <ClockIcon className="w-3.5 h-3.5" /> Monthly Averages
              </h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Avg Monthly Revenue</span>
                  <span className="text-sm font-bold text-finledger-emerald">₹{data.ratios.monthlyAvgRevenue?.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Avg Monthly Expenses</span>
                  <span className="text-sm font-bold text-finledger-ruby">₹{data.ratios.monthlyAvgExpenses?.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            <div className="glass-panel p-6">
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-3 flex items-center gap-2">
                <ChartBarSquareIcon className="w-3.5 h-3.5" /> Transaction Volume
              </h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Total Entries</span>
                  <span className="text-sm font-bold text-white">{data.meta.txnCount}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Income / Expense</span>
                  <span className="text-sm font-medium">
                    <span className="text-finledger-emerald">{data.meta.incomeCount}</span>
                    <span className="text-gray-600 mx-1">/</span>
                    <span className="text-finledger-ruby">{data.meta.expenseCount}</span>
                  </span>
                </div>
              </div>
            </div>

            <div className="glass-panel p-6">
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-3 flex items-center gap-2">
                <PresentationChartLineIcon className="w-3.5 h-3.5" /> Previous Year
              </h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Revenue (FY{new Date().getFullYear()-1})</span>
                  <span className="text-sm font-bold text-gray-300">₹{data.previous?.totalRevenue?.toLocaleString('en-IN') || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Profit (FY{new Date().getFullYear()-1})</span>
                  <span className={`text-sm font-bold ${data.previous?.profit >= 0 ? 'text-finledger-emerald' : 'text-finledger-ruby'}`}>
                    ₹{data.previous?.profit?.toLocaleString('en-IN') || 0}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
};

export default FinancialRatios;
