import React, { useEffect, useState, useCallback } from 'react';
import { useAuthStore } from '../stores/authStore';
import api from '../services/api';
import { motion } from 'framer-motion';
import {
  ChartBarIcon, ArrowTrendingUpIcon, ArrowTrendingDownIcon,
  CalendarDaysIcon, CurrencyDollarIcon, PresentationChartLineIcon
} from '@heroicons/react/24/outline';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';

const YoYCard = ({ title, amount, growth, delay, isCurrency = true }) => {
  const isPositive = growth >= 0;
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="glass-panel p-6"
    >
      <div className="flex justify-between items-start mb-2">
        <h4 className="text-[10px] font-bold uppercase tracking-widest text-gray-500">{title}</h4>
        {growth !== undefined && (
          <div className={`flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold ${
            isPositive ? 'bg-finledger-emerald/10 text-finledger-emerald border border-finledger-emerald/20' : 
            'bg-finledger-ruby/10 text-finledger-ruby border border-finledger-ruby/20'
          }`}>
            {isPositive ? <ArrowTrendingUpIcon className="w-3" /> : <ArrowTrendingDownIcon className="w-3" />}
            {Math.abs(growth)}%
          </div>
        )}
      </div>
      <h2 className={`text-3xl font-black mb-1 tracking-tight ${growth >= 0 ? 'text-white' : 'text-gray-300'}`}>
        {isCurrency ? '₹' : ''}{amount?.toLocaleString('en-IN') || 0}
      </h2>
    </motion.div>
  );
};

const YoYComparison = () => {
  const { activeCompanyId, companies } = useAuthStore();
  const activeCompany = companies.find(c => c._id === activeCompanyId);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchYoYData = useCallback(async () => {
    if (!activeCompanyId) return;
    setLoading(true);
    try {
      const res = await api.get('/metrics/yoy');
      // The API returns data sorted newest to oldest. We want oldest to newest for the chart.
      setData([...res.data].reverse());
    } catch (err) {
      console.error('YoY Fetch Error:', err);
    } finally {
      setLoading(false);
    }
  }, [activeCompanyId]);

  useEffect(() => { fetchYoYData(); }, [fetchYoYData]);

  if (!activeCompanyId) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh] text-center animate-fade-in">
        <div className="w-24 h-24 rounded-3xl glass-card flex items-center justify-center mb-8 animate-float shadow-finledger-indigo/20">
          <ChartBarIcon className="w-10 h-10 text-finledger-indigo" />
        </div>
        <h2 className="text-3xl font-black text-white mb-3">No Workspace Selected</h2>
        <p className="text-finledger-silver max-w-md text-lg">Select a company from the sidebar to view historical YoY performance.</p>
      </div>
    );
  }

  // Current year data is the last item in the reversed array
  const currentYearData = data.length > 0 ? data[data.length - 1] : null;

  return (
    <div className="animate-fade-in pb-12 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="mb-8 flex flex-col md:flex-row md:justify-between md:items-end gap-4">
        <div>
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-3 mb-1">
            <span className="px-2.5 py-1 rounded-md bg-finledger-indigo/10 border border-finledger-indigo/20 text-finledger-indigo text-[10px] font-bold tracking-widest uppercase mb-1">
              Historical Analysis
            </span>
          </motion.div>
          <h1 className="text-4xl font-black text-white tracking-tight">Year-over-Year (YoY) Performance</h1>
          <p className="text-gray-500 mt-1">Multi-year growth trends and financial trajectory for {activeCompany?.name}</p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-10 h-10 border-4 border-white/10 border-t-finledger-indigo rounded-full animate-spin" />
        </div>
      ) : data.length > 0 ? (
        <>
          {/* Current Year KPI Highlights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <YoYCard 
              title={`FY ${currentYearData.year} Revenue`}
              amount={currentYearData.revenue}
              growth={currentYearData.revenueGrowthYoY}
              delay={0}
            />
            <YoYCard 
              title={`FY ${currentYearData.year} Expenses`}
              amount={currentYearData.expense}
              delay={0.1}
            />
            <YoYCard 
              title={`FY ${currentYearData.year} Net Profit`}
              amount={currentYearData.profit}
              growth={currentYearData.profitGrowthYoY}
              delay={0.2}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue Trend Chart */}
            <div className="glass-panel p-8 min-h-[400px]">
              <h3 className="text-sm font-bold text-finledger-silver uppercase tracking-widest mb-6 flex items-center gap-2">
                <CurrencyDollarIcon className="w-5 h-5 text-finledger-indigo" />
                Revenue Trajectory
              </h3>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                    <XAxis dataKey="year" stroke="#94a3b8" tick={{fontSize: 12}} axisLine={false} tickLine={false} />
                    <YAxis 
                      stroke="#94a3b8" 
                      tick={{fontSize: 12}} 
                      axisLine={false} 
                      tickLine={false} 
                      tickFormatter={(val) => `₹${(val/1000)}k`} 
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }}
                      itemStyle={{ color: '#fff' }}
                      formatter={(value) => `₹${value.toLocaleString('en-IN')}`}
                    />
                    <Bar dataKey="revenue" name="Total Revenue" fill="#6366f1" radius={[4, 4, 0, 0]} maxBarSize={60} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Profitability Chart */}
            <div className="glass-panel p-8 min-h-[400px]">
              <h3 className="text-sm font-bold text-finledger-silver uppercase tracking-widest mb-6 flex items-center gap-2">
                <PresentationChartLineIcon className="w-5 h-5 text-finledger-emerald" />
                Net Profit Trajectory
              </h3>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                    <XAxis dataKey="year" stroke="#94a3b8" tick={{fontSize: 12}} axisLine={false} tickLine={false} />
                    <YAxis 
                      stroke="#94a3b8" 
                      tick={{fontSize: 12}} 
                      axisLine={false} 
                      tickLine={false} 
                      tickFormatter={(val) => `₹${(val/1000)}k`} 
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }}
                      itemStyle={{ color: '#fff' }}
                      formatter={(value) => `₹${value.toLocaleString('en-IN')}`}
                    />
                    <ReferenceLine y={0} stroke="#475569" strokeWidth={2} />
                    <Bar dataKey="profit" name="Net Profit" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={60}>
                      {
                        data.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.profit >= 0 ? '#10b981' : '#ef4444'} />
                        ))
                      }
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
          
          <div className="mt-6 glass-panel p-6">
            <h3 className="text-sm font-bold text-finledger-silver uppercase tracking-widest mb-4 flex items-center gap-2">
               <CalendarDaysIcon className="w-5 h-5" /> Detailed Year-over-Year Matrix
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="border-b border-white/[0.06]">
                  <tr>
                    <th className="px-4 py-3 text-xs font-bold uppercase tracking-widest text-gray-500">Financial Year</th>
                    <th className="px-4 py-3 text-xs font-bold uppercase tracking-widest text-gray-500">Total Revenue</th>
                    <th className="px-4 py-3 text-xs font-bold uppercase tracking-widest text-gray-500">Revenue Growth</th>
                    <th className="px-4 py-3 text-xs font-bold uppercase tracking-widest text-gray-500">Total Expenses</th>
                    <th className="px-4 py-3 text-xs font-bold uppercase tracking-widest text-gray-500">Net Profit</th>
                    <th className="px-4 py-3 text-xs font-bold uppercase tracking-widest text-gray-500">Profit Growth</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {[...data].reverse().map((row) => (
                    <tr key={row.year} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-4 py-4 text-sm font-bold text-white">FY {row.year}</td>
                      <td className="px-4 py-4 text-sm text-gray-300 font-mono">₹{row.revenue.toLocaleString('en-IN')}</td>
                      <td className="px-4 py-4 text-sm font-medium">
                        {row.year === data[0].year ? <span className="text-gray-600">—</span> : (
                            <span className={row.revenueGrowthYoY >= 0 ? 'text-finledger-emerald' : 'text-finledger-ruby'}>
                                {row.revenueGrowthYoY >= 0 ? '+' : ''}{row.revenueGrowthYoY}%
                            </span>
                        )}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-400 font-mono">₹{row.expense.toLocaleString('en-IN')}</td>
                      <td className={`px-4 py-4 text-sm font-bold font-mono ${row.profit >= 0 ? 'text-white' : 'text-finledger-ruby'}`}>
                         ₹{row.profit.toLocaleString('en-IN')}
                      </td>
                      <td className="px-4 py-4 text-sm font-medium">
                        {row.year === data[0].year ? <span className="text-gray-600">—</span> : (
                            <span className={row.profitGrowthYoY >= 0 ? 'text-finledger-emerald' : 'text-finledger-ruby'}>
                                {row.profitGrowthYoY >= 0 ? '+' : ''}{row.profitGrowthYoY}%
                            </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </>
      ) : (
         <div className="flex flex-col items-center justify-center py-20 text-center glass-panel">
            <ChartBarIcon className="w-12 h-12 text-gray-700 mb-4" />
            <p className="text-gray-500 text-lg font-medium">Insufficient Historical Data</p>
            <p className="text-gray-600 text-sm mt-1">Upload transactions from multiple years to view YoY performance.</p>
          </div>
      )}
    </div>
  );
};

export default YoYComparison;
