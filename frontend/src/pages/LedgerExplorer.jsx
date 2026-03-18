import React, { useEffect, useState, useCallback } from 'react';
import { useAuthStore } from '../stores/authStore';
import api from '../services/api';
import { motion } from 'framer-motion';
import {
  MagnifyingGlassIcon, FunnelIcon, ArrowsUpDownIcon,
  ChevronLeftIcon, ChevronRightIcon, ArrowDownTrayIcon,
  TableCellsIcon, BanknotesIcon
} from '@heroicons/react/24/outline';

const LedgerExplorer = () => {
  const { activeCompanyId, companies } = useAuthStore();
  const activeCompany = (Array.isArray(companies) ? companies : []).find(c => c._id === activeCompanyId);

  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [categories, setCategories] = useState([]);

  // Filters
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');

  const fetchTransactions = useCallback(async () => {
    if (!activeCompanyId) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 50, sortBy, sortOrder });
      if (search) params.set('search', search);
      if (typeFilter) params.set('type', typeFilter);
      if (categoryFilter) params.set('category', categoryFilter);
      if (statusFilter) params.set('status', statusFilter);

      const res = await api.get(`/transactions/list?${params.toString()}`);
      setTransactions(res.data.transactions);
      setTotalPages(res.data.totalPages);
      setTotal(res.data.total);
      setCategories(res.data.categories || []);
    } catch (err) {
      console.error('Ledger Fetch Error:', err);
    } finally {
      setLoading(false);
    }
  }, [activeCompanyId, page, search, typeFilter, categoryFilter, statusFilter, sortBy, sortOrder]);

  useEffect(() => { fetchTransactions(); }, [fetchTransactions]);

  // Reset page when filters change
  useEffect(() => { setPage(1); }, [search, typeFilter, categoryFilter, statusFilter]);

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const exportCSV = () => {
    if (transactions.length === 0) return;
    const headers = ['Date', 'Description', 'Amount', 'Type', 'Category', 'Status'];
    const rows = (Array.isArray(transactions) ? transactions : []).map(t => [
      new Date(t.date).toLocaleDateString('en-IN'),
      `"${t.description}"`,
      t.amount,
      t.type,
      t.category,
      t.status
    ]);
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeCompany?.name || 'ledger'}_export.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const SortHeader = ({ field, children }) => (
    <th
      onClick={() => handleSort(field)}
      className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-gray-500 cursor-pointer hover:text-white transition-colors group select-none"
    >
      <span className="flex items-center gap-1.5">
        {children}
        <ArrowsUpDownIcon className={`w-3 h-3 transition-colors ${sortBy === field ? 'text-finledger-indigo' : 'text-gray-700 group-hover:text-gray-400'}`} />
        {sortBy === field && (
          <span className="text-finledger-indigo text-[8px]">{sortOrder === 'asc' ? '↑' : '↓'}</span>
        )}
      </span>
    </th>
  );

  if (!activeCompanyId) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh] text-center animate-fade-in">
        <div className="w-24 h-24 rounded-3xl glass-card flex items-center justify-center mb-8 animate-float">
          <TableCellsIcon className="w-10 h-10 text-finledger-indigo" />
        </div>
        <h2 className="text-3xl font-black text-white mb-3">No Workspace Selected</h2>
        <p className="text-finledger-silver max-w-md text-lg">Select a company from the sidebar to explore its general ledger.</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in pb-12 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="mb-8">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-3 mb-1">
          <span className="px-2.5 py-1 rounded-md bg-finledger-indigo/10 border border-finledger-indigo/20 text-finledger-indigo text-[10px] font-bold tracking-widest uppercase">
            General Ledger
          </span>
          <span className="text-gray-600 text-xs font-mono">{total.toLocaleString()} records</span>
        </motion.div>
        <h1 className="text-4xl font-black text-white tracking-tight">Ledger Explorer</h1>
        <p className="text-gray-500 mt-1">Search, filter, and drill into every transaction for {activeCompany?.name}</p>
      </div>

      {/* Controls Bar */}
      <div className="glass-panel p-4 mb-6">
        <div className="flex flex-wrap gap-3 items-center">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <MagnifyingGlassIcon className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white/[0.03] border border-white/[0.08] rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:border-finledger-indigo/40 focus:ring-1 focus:ring-finledger-indigo/20 transition-all"
            />
          </div>

          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2.5 bg-white/[0.03] border border-white/[0.08] rounded-xl text-sm text-gray-300 focus:outline-none focus:border-finledger-indigo/40 appearance-none cursor-pointer min-w-[120px]"
          >
            <option value="">All Types</option>
            <option value="INCOME">Income</option>
            <option value="EXPENSE">Expense</option>
          </select>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2.5 bg-white/[0.03] border border-white/[0.08] rounded-xl text-sm text-gray-300 focus:outline-none focus:border-finledger-indigo/40 appearance-none cursor-pointer min-w-[140px]"
          >
            <option value="">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2.5 bg-white/[0.03] border border-white/[0.08] rounded-xl text-sm text-gray-300 focus:outline-none focus:border-finledger-indigo/40 appearance-none cursor-pointer min-w-[120px]"
          >
            <option value="">All Status</option>
            <option value="CLEARED">Cleared</option>
            <option value="PENDING">Pending</option>
            <option value="FLAGGED">Flagged</option>
          </select>

          {/* Export Button */}
          <button
            onClick={exportCSV}
            className="flex items-center gap-2 px-4 py-2.5 glass-panel border-white/5 hover:border-white/20 text-sm text-gray-400 hover:text-white rounded-xl transition-all"
          >
            <ArrowDownTrayIcon className="w-4 h-4" /> Export
          </button>
        </div>
      </div>

      {/* Transaction Table */}
      <div className="glass-panel overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-white/10 border-t-finledger-indigo rounded-full animate-spin" />
          </div>
        ) : transactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <BanknotesIcon className="w-12 h-12 text-gray-700 mb-4" />
            <p className="text-gray-500 text-lg font-medium">No transactions found</p>
            <p className="text-gray-600 text-sm mt-1">Try adjusting your filters or upload data first.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-white/[0.06]">
                <tr className="bg-white/[0.02]">
                  <SortHeader field="date">Date</SortHeader>
                  <SortHeader field="description">Description</SortHeader>
                  <SortHeader field="amount">Amount</SortHeader>
                  <SortHeader field="type">Type</SortHeader>
                  <SortHeader field="category">Category</SortHeader>
                  <SortHeader field="status">Status</SortHeader>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {(Array.isArray(transactions) ? transactions : []).map((txn, i) => (
                  <motion.tr
                    key={txn._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.02 }}
                    className="hover:bg-white/[0.02] transition-colors group"
                  >
                    <td className="px-4 py-3.5 text-sm text-gray-400 font-mono whitespace-nowrap">
                      {new Date(txn.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-4 py-3.5 text-sm text-white font-medium max-w-[300px] truncate">
                      {txn.description}
                    </td>
                    <td className={`px-4 py-3.5 text-sm font-bold tabular-nums ${txn.type === 'INCOME' ? 'text-finledger-emerald' : 'text-finledger-ruby'}`}>
                      {txn.type === 'INCOME' ? '+' : '-'}₹{txn.amount?.toLocaleString('en-IN')}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md ${
                        txn.type === 'INCOME'
                          ? 'bg-finledger-emerald/10 text-finledger-emerald border border-finledger-emerald/20'
                          : 'bg-finledger-ruby/10 text-finledger-ruby border border-finledger-ruby/20'
                      }`}>
                        {txn.type}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-sm text-gray-400">{txn.category}</td>
                    <td className="px-4 py-3.5">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md ${
                        txn.status === 'CLEARED' ? 'bg-finledger-emerald/10 text-finledger-emerald border border-finledger-emerald/20' :
                        txn.status === 'FLAGGED' ? 'bg-finledger-gold/10 text-finledger-gold border border-finledger-gold/20' :
                        'bg-gray-500/10 text-gray-400 border border-gray-500/20'
                      }`}>
                        {txn.status}
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-white/[0.06]">
            <p className="text-xs text-gray-500">
              Showing {((page - 1) * 50) + 1}–{Math.min(page * 50, total)} of {total.toLocaleString()} records
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 rounded-lg glass-panel border-white/5 text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeftIcon className="w-4 h-4" />
              </button>
              <span className="text-sm text-gray-400 font-medium px-3">
                <span className="text-white">{page}</span> / {totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-2 rounded-lg glass-panel border-white/5 text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <ChevronRightIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LedgerExplorer;
