import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import api from '../services/api';
import { 
  ArrowTrendingUpIcon, ArrowTrendingDownIcon, SparklesIcon, 
  ChartPieIcon, CurrencyDollarIcon, PresentationChartLineIcon,
  ExclamationTriangleIcon, CalendarDaysIcon, BanknotesIcon,
  ArrowPathIcon, PrinterIcon
} from '@heroicons/react/24/outline';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts';
import { motion } from 'framer-motion';

/* ==================== SKELETON LOADER ==================== */
const SkeletonCard = ({ className = "" }) => (
  <div className={`glass-panel p-6 ${className}`}>
    <div className="skeleton-bg h-4 w-24 rounded mb-4"></div>
    <div className="skeleton-bg h-10 w-48 rounded mb-2"></div>
    <div className="skeleton-bg h-3 w-32 rounded"></div>
  </div>
);

/* ==================== KPI CARD ==================== */
const MetricCard = ({ title, value, status, percentage, icon: Icon, prefix = "₹", subtitle, index = 0 }) => {
  const isPositive = status === 'AHEAD' || status === 'PROFIT' || status === 'UP';
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      className="glass-panel p-6 relative overflow-hidden group hover:-translate-y-1 hover:shadow-2xl hover:shadow-finledger-indigo/10 transition-all duration-300"
    >
      <div className="absolute top-0 right-0 p-6 opacity-[0.02] group-hover:opacity-[0.06] transition-opacity transform translate-x-2 -translate-y-2 group-hover:scale-110 duration-500">
        {Icon && <Icon className="w-28 h-28" />}
      </div>
      <div className="flex justify-between items-start mb-3 relative z-10">
        <h4 className="text-gray-400 font-medium text-xs uppercase tracking-widest">{title}</h4>
        {percentage !== undefined && (
          <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide ${
            isPositive 
              ? 'bg-finledger-emerald/10 text-finledger-emerald border border-finledger-emerald/20 shadow-[0_0_10px_rgba(16,185,129,0.15)]' 
              : 'bg-finledger-ruby/10 text-finledger-ruby border border-finledger-ruby/20 shadow-[0_0_10px_rgba(239,68,68,0.15)]'
          }`}>
            {isPositive ? <ArrowTrendingUpIcon className="w-3" /> : <ArrowTrendingDownIcon className="w-3" />}
            {Math.abs(percentage)}%
          </div>
        )}
      </div>
      <h2 className="text-3xl font-black text-white mb-1 tracking-tight relative z-10 font-sans">
        {prefix}{typeof value === 'number' ? value.toLocaleString('en-IN') : value}
      </h2>
      {subtitle && <p className="text-xs text-finledger-silver relative z-10">{subtitle}</p>}
    </motion.div>
  );
};

/* ==================== MAIN DASHBOARD ==================== */
const CompanyDashboard = () => {
  const { activeCompanyId, companies } = useAuthStore();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [categories, setCategories] = useState([]);
  const [mom, setMom] = useState(null);
  const [anomalies, setAnomalies] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [insight, setInsight] = useState(null);
  const [loading, setLoading] = useState(false);
  const [insightLoading, setInsightLoading] = useState(false);

  const activeCompany = (Array.isArray(companies) ? companies : []).find(c => c._id === activeCompanyId);

  useEffect(() => {
    if (activeCompanyId) {
      loadAllData();
      setInsight(null); // Clear insight on company switch
    }
  }, [activeCompanyId]);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [summaryRes, catRes, momRes, anomalyRes, forecastRes] = await Promise.allSettled([
        api.get('/transactions/summary'),
        api.get('/metrics/categories?type=EXPENSE'),
        api.get('/metrics/mom'),
        api.get('/metrics/anomalies'),
        api.get('/metrics/forecast')
      ]);
      
      if (summaryRes.status === 'fulfilled') setData(summaryRes.value.data);
      if (catRes.status === 'fulfilled') setCategories(catRes.value.data);
      if (momRes.status === 'fulfilled') setMom(momRes.value.data);
      if (anomalyRes.status === 'fulfilled') setAnomalies(anomalyRes.value.data);
      if (forecastRes.status === 'fulfilled') setForecast(forecastRes.value.data);
    } catch (err) {
      console.error(err);
    } finally {
      // Add slight delay for premium feel
      setTimeout(() => setLoading(false), 500);
    }
  };

  const generateInsight = async () => {
    setInsightLoading(true);
    try {
      const res = await api.post('/insights/generate');
      setInsight(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setInsightLoading(false);
    }
  };

  if (!activeCompanyId) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh] text-center animate-fade-in">
        <div className="w-24 h-24 rounded-3xl glass-card flex items-center justify-center mb-8 animate-float shadow-finledger-indigo/20">
          <PresentationChartLineIcon className="w-10 h-10 text-finledger-indigo" />
        </div>
        <h2 className="text-3xl font-black text-white mb-3">No Workspace Selected</h2>
        <p className="text-finledger-silver max-w-md text-lg">Select a client company from the sidebar dropdown to access their financial command center.</p>
      </div>
    );
  }

  // --- Chart Processing ---
  const pieColors = ['#6366f1', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#64748b'];
  const chartData = categories.slice(0, 5).map((c, i) => ({
    name: c._id || 'Other',
    value: c.total,
    color: pieColors[i % pieColors.length]
  }));

  const trendData = [
    { name: 'Last Month', revenue: mom?.previous?.totalRevenue || 0, profit: mom?.previous?.profit || 0 },
    { name: 'This Month', revenue: mom?.current?.totalRevenue || 0, profit: mom?.current?.profit || 0 }
  ];

  return (
    <div className="animate-fade-in pb-12 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="mb-10 flex flex-col md:flex-row md:justify-between md:items-end gap-4">
        <div>
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-3 mb-1">
            <span className="px-2.5 py-1 rounded-md bg-finledger-indigo/10 border border-finledger-indigo/20 text-finledger-indigo text-[10px] font-bold tracking-widest uppercase">
              Financial Command Center
            </span>
          </motion.div>
          <h1 className="text-2xl md:text-4xl font-black text-white tracking-tight">{activeCompany?.name}</h1>
        </div>
        <div className="flex flex-wrap gap-3">
          <button onClick={() => navigate('/report')} className="text-sm font-medium text-finledger-silver hover:text-white glass-panel border-white/5 hover:border-white/20 px-4 py-2.5 rounded-xl transition flex items-center gap-2">
            <PrinterIcon className="w-4 h-4" /> Export Report
          </button>
          <button onClick={loadAllData} className="text-sm font-medium text-finledger-silver hover:text-white glass-panel border-white/5 hover:border-white/20 px-4 py-2.5 rounded-xl transition flex items-center gap-2">
            <ArrowPathIcon className="w-4 h-4" /> Sync Ledgers
          </button>
          <button 
            onClick={generateInsight} 
            disabled={insightLoading}
            className="btn-primary flex items-center gap-2 text-sm rounded-xl px-5"
          >
            {insightLoading ? (
              <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Analyzing...</>
            ) : (
              <><SparklesIcon className="w-4 h-4" /> Run AI Analysis</>
            )}
          </button>
        </div>
      </div>

      {/* Loading Skeletons */}
      {loading ? (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => <SkeletonCard key={i} />)}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SkeletonCard className="h-80" />
            <SkeletonCard className="h-80" />
          </div>
        </div>
      ) : data ? (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <MetricCard 
              index={0}
              title="Gross Revenue" 
              value={data.actuals.totalRevenue} 
              status={data.prorata?.revenue?.status || 'AHEAD'} 
              percentage={data.prorata?.revenue?.percentage || 0}
              icon={CurrencyDollarIcon}
              subtitle="YTD Actuals"
            />
            <MetricCard 
              index={1}
              title="Total Expenses" 
              value={data.actuals.totalExpenses} 
              status={data.actuals.totalExpenses > data.actuals.totalRevenue * 0.7 ? 'BEHIND' : 'AHEAD'}
              percentage={data.actuals.totalRevenue > 0 ? parseFloat(((data.actuals.totalExpenses / data.actuals.totalRevenue) * 100).toFixed(1)) : 0}
              icon={BanknotesIcon}
              subtitle="% of Revenue (Burn)"
            />
            <MetricCard 
              index={2}
              title="Net Profit" 
              value={data.actuals.profit} 
              status={data.prorata?.profit?.status || (data.actuals.profit >= 0 ? 'AHEAD' : 'BEHIND')} 
              percentage={data.prorata?.profit?.percentage || 0}
              icon={PresentationChartLineIcon}
              subtitle="vs Prorata Expectations"
            />
            <MetricCard 
              index={3}
              title="Net Margin" 
              value={data.actuals.netMargin} 
              prefix=""
              status={data.actuals.netMargin >= 15 ? 'AHEAD' : data.actuals.netMargin > 0 ? 'UP' : 'BEHIND'} 
              percentage={data.actuals.netMargin}
              icon={ChartPieIcon}
              subtitle="Operating Profitability"
            />
          </div>

          {/* AI Intelligence Panel (Floats to top when generated) */}
          {insight && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.98, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="glass-panel border-finledger-indigo/30 overflow-hidden relative mb-8 shadow-2xl shadow-finledger-indigo/10"
            >
              <div className="absolute top-0 left-0 w-1.5 h-full primary-gradient" />
              <div className="p-8 lg:p-10">
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 bg-finledger-indigo/10 rounded-xl border border-finledger-indigo/20 shadow-inner">
                     <SparklesIcon className="w-6 h-6 text-finledger-indigo" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-white tracking-tight">AI Executive Summary</h3>
                    <p className="text-sm text-finledger-indigo font-medium">FinLedger Intelligence Engine</p>
                  </div>
                </div>
                
                <p className="text-xl text-white font-medium mb-10 leading-relaxed border-l-4 border-finledger-emerald pl-6 bg-slate-800/20 py-5 pr-5 rounded-r-2xl border-y border-r border-white/5">
                  "{insight.keyInsight}"
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 text-sm">
                  <div className="space-y-8">
                    <div>
                      <h4 className="font-bold text-finledger-silver mb-4 uppercase tracking-widest text-xs">What is Happening</h4>
                      <ul className="space-y-3">
                        {insight.whatIsHappening?.map((item, i) => (
                          <li key={i} className="flex gap-3 text-gray-300 leading-relaxed">
                            <span className="text-finledger-indigo mt-0.5 w-1.5 h-1.5 rounded-full bg-finledger-indigo shrink-0" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-bold text-finledger-silver mb-4 uppercase tracking-widest text-xs flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-finledger-ruby animate-pulse" />
                        Root Causes Detected
                      </h4>
                      <div className="bg-red-950/20 p-5 rounded-2xl border border-red-900/30">
                        <ul className="space-y-3">
                          {insight.rootCause?.map((item, i) => (
                            <li key={i} className="flex gap-3 text-red-200/80 leading-relaxed">
                              <span className="text-finledger-ruby shrink-0">×</span> {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-8">
                    <div>
                      <h4 className="font-bold text-finledger-silver mb-4 uppercase tracking-widest text-xs flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-finledger-emerald" /> 
                        Recommended Actions
                      </h4>
                      <div className="bg-emerald-950/20 p-5 rounded-2xl border border-emerald-900/30">
                        <ul className="space-y-3">
                          {insight.actions?.map((item, i) => (
                            <li key={i} className="flex gap-3 text-emerald-200/80 leading-relaxed">
                              <span className="text-finledger-emerald shrink-0">→</span> {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-bold text-finledger-silver mb-3 uppercase tracking-widest text-xs">Predicted Impact</h4>
                      <div className="glass-panel border-white/5 p-5 bg-slate-800/30 text-gray-300 leading-relaxed font-medium">
                        {insight.impact}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Data Visualizations */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            
            {/* Expense Breakdown Pie Chart */}
            <div className="glass-panel p-8">
              <h3 className="text-sm font-bold text-finledger-silver uppercase tracking-widest mb-6">Expense Distribution</h3>
              <div className="h-[250px] w-full">
                {chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={chartData}
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                        stroke="none"
                      >
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <RechartsTooltip 
                        contentStyle={{ backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }}
                        itemStyle={{ color: '#fff' }}
                        formatter={(value) => `₹${value.toLocaleString('en-IN')}`}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500 text-sm">No expenses recorded.</div>
                )}
              </div>
              {/* Custom Legend */}
              <div className="flex flex-wrap justify-center gap-4 mt-2">
                {chartData.map((c, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-gray-400">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.color }}></span>
                    {c.name}
                  </div>
                ))}
              </div>
            </div>

            {/* Performance Trend Line Chart */}
            <div className="glass-panel p-8">
              <h3 className="text-sm font-bold text-finledger-silver uppercase tracking-widest mb-6">Month-over-Month Trend</h3>
              <div className="h-[280px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                    <XAxis dataKey="name" stroke="#94a3b8" tick={{fontSize: 12}} axisLine={false} tickLine={false} />
                    <YAxis stroke="#94a3b8" tick={{fontSize: 12}} axisLine={false} tickLine={false} tickFormatter={(val) => `₹${(val/1000)}k`} />
                    <RechartsTooltip 
                      contentStyle={{ backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }}
                      formatter={(value) => `₹${value.toLocaleString('en-IN')}`}
                    />
                    <Line type="monotone" dataKey="revenue" name="Revenue" stroke="#6366f1" strokeWidth={3} dot={{r: 4, strokeWidth: 2}} activeDot={{r: 6}} />
                    <Line type="monotone" dataKey="profit" name="Profit" stroke="#10b981" strokeWidth={3} dot={{r: 4, strokeWidth: 2}} activeDot={{r: 6}} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
            
          </div>
          
          {/* Bottom Row - Alerts & Forecasts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="glass-panel p-6 border-l-2 border-l-finledger-gold">
              <h3 className="text-sm font-bold text-finledger-silver uppercase tracking-widest mb-4 flex items-center gap-2">
                <ExclamationTriangleIcon className="w-5 h-5 text-finledger-gold" />
                Intelligent Alerts
              </h3>
              {anomalies?.aggregateAnomalies?.length > 0 ? (
                <div className="space-y-3">
                  {anomalies.aggregateAnomalies.map((a, i) => (
                    <div key={i} className="p-4 rounded-xl border bg-slate-800/30 border-white/5 text-sm">
                      <span className="font-bold text-white block mb-1">{a.type.replace('_', ' ')}</span>
                      <span className="text-gray-400">{a.message}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center gap-3 text-finledger-emerald bg-emerald-900/10 p-4 rounded-xl border border-emerald-900/20">
                  <div className="w-2 h-2 rounded-full bg-finledger-emerald" />
                  <span className="text-sm font-medium">No financial anomalies detected. Ledgers look clean.</span>
                </div>
              )}
            </div>

            <div className="glass-panel p-6 border-l-2 border-l-finledger-electric">
              <h3 className="text-sm font-bold text-finledger-silver uppercase tracking-widest mb-4 flex items-center gap-2">
                <PresentationChartLineIcon className="w-5 h-5 text-finledger-electric" />
                Cash Flow Forecast
              </h3>
              {forecast?.predictedRevenue !== null && forecast?.predictedRevenue !== undefined && forecast?.historicalData?.length > 0 ? (
                <div className="h-[200px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart 
                      data={[
                        ...forecast.historicalData.slice(-3).map(d => ({ 
                          name: d.month, 
                          actualRevenue: d.revenue, 
                          actualProfit: d.revenue - d.expenses 
                        })),
                        { 
                          name: 'Next Month (Predicted)', 
                          predictedRevenue: forecast.predictedRevenue,
                          predictedProfit: forecast.predictedProfit
                        }
                      ]} 
                      margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                      <XAxis dataKey="name" stroke="#94a3b8" tick={{fontSize: 10}} axisLine={false} tickLine={false} />
                      <YAxis stroke="#94a3b8" tick={{fontSize: 10}} axisLine={false} tickLine={false} tickFormatter={(val) => `₹${(val/1000)}k`} />
                      <RechartsTooltip 
                        contentStyle={{ backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }}
                        formatter={(value, name) => [`₹${value.toLocaleString('en-IN')}`, name.replace(/([A-Z])/g, ' $1').trim()]}
                      />
                      <Line type="monotone" dataKey="actualRevenue" stroke="#8b5cf6" strokeWidth={2} dot={{r: 3}} />
                      <Line type="monotone" dataKey="actualProfit" stroke="#10b981" strokeWidth={2} dot={{r: 3}} />
                      <Line type="dashed" strokeDasharray="5 5" dataKey="predictedRevenue" stroke="#8b5cf6" strokeWidth={3} dot={{r: 5, strokeWidth: 2}} activeDot={{r: 8}} />
                      <Line type="dashed" strokeDasharray="5 5" dataKey="predictedProfit" stroke="#10b981" strokeWidth={3} dot={{r: 5, strokeWidth: 2}} activeDot={{r: 8}} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center bg-white/[0.02] rounded-xl border border-white/5">
                  <PresentationChartLineIcon className="w-8 h-8 text-gray-600 mb-2" />
                  <p className="text-gray-400 text-sm font-medium">Insufficient Historical Data</p>
                  <p className="text-gray-500 text-xs mt-1">2+ months of tracking required for ML forecasts.</p>
                </div>
              )}
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
};

export default CompanyDashboard;
