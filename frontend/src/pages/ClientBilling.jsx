import React, { useEffect, useState, useCallback } from 'react';
import { useAuthStore } from '../stores/authStore';
import api from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CurrencyRupeeIcon, PlusIcon, DocumentTextIcon,
  CheckCircleIcon, XCircleIcon, ClockIcon,
  BanknotesIcon, DocumentArrowDownIcon
} from '@heroicons/react/24/outline';

const CreateInvoiceModal = ({ isOpen, onClose, onCreated }) => {
  const { companies } = useAuthStore();
  const safeCompanies = companies || [];
  const [clientId, setClientId] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [taxRate, setTaxRate] = useState(18);
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState([{ description: '', hsnSac: '', quantity: 1, rate: 0 }]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!clientId) return alert('Please select a client');
    setLoading(true);
    try {
      await api.post('/invoices', { clientId, items, dueDate, taxRate, notes });
      onCreated();
      onClose();
    } catch (err) {
      console.error('Invoice Creation Error:', err);
      alert('Failed to create invoice');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-finledger-midnight/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-3xl glass-panel p-8"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-black text-white">Create New Invoice</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white p-2">
            <XCircleIcon className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Billed To (Client)</label>
              <select
                required
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-finledger-indigo/50"
              >
                <option value="">Select a client...</option>
                {safeCompanies.map(c => (
                  <option key={c._id} value={c._id} className="bg-gray-900">{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Due Date</label>
              <input
                type="date"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-finledger-indigo/50 [color-scheme:dark]"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-end mb-2">
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Line Items</label>
              <button
                type="button"
                onClick={() => setItems([...items, { description: '', hsnSac: '', quantity: 1, rate: 0 }])}
                className="text-xs text-finledger-indigo hover:text-white font-bold flex items-center gap-1"
              >
                <PlusIcon className="w-3 h-3" /> Add Item
              </button>
            </div>
            <div className="space-y-3">
              {items.map((item, index) => (
                <div key={index} className="flex gap-3 items-start bg-white/[0.02] p-3 rounded-xl border border-white/[0.05]">
                  <input
                    placeholder="Description (e.g. Audit Services)"
                    className="flex-1 bg-transparent border-b border-white/[0.08] px-2 py-1 text-sm text-white focus:outline-none focus:border-finledger-indigo"
                    value={item.description}
                    required
                    onChange={(e) => {
                      const newItems = [...items];
                      newItems[index].description = e.target.value;
                      setItems(newItems);
                    }}
                  />
                  <input
                    type="number"
                    placeholder="Rate (₹)"
                    required
                    className="w-32 bg-transparent border-b border-white/[0.08] px-2 py-1 text-sm text-white focus:outline-none focus:border-finledger-indigo"
                    value={item.rate || ''}
                    onChange={(e) => {
                      const newItems = [...items];
                      newItems[index].rate = Number(e.target.value);
                      setItems(newItems);
                    }}
                  />
                  <input
                    type="number"
                    placeholder="Qty"
                    required
                    min="1"
                    className="w-20 bg-transparent border-b border-white/[0.08] px-2 py-1 text-sm text-white focus:outline-none focus:border-finledger-indigo"
                    value={item.quantity}
                    onChange={(e) => {
                      const newItems = [...items];
                      newItems[index].quantity = Math.max(1, Number(e.target.value));
                      setItems(newItems);
                    }}
                  />
                  {items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => setItems(items.filter((_, i) => i !== index))}
                      className="p-1.5 text-red-400 hover:text-red-300 rounded-md hover:bg-red-500/10"
                    >
                      <XCircleIcon className="w-5 h-5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Tax Rate (%)</label>
              <input
                type="number"
                value={taxRate}
                onChange={(e) => setTaxRate(Number(e.target.value))}
                className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-finledger-indigo/50"
              />
            </div>
             <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Notes</label>
              <input
                type="text"
                placeholder="Internal or customer notes..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-finledger-indigo/50"
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-4 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl text-gray-400 hover:text-white font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary rounded-xl px-8 py-2.5"
            >
              {loading ? 'Generating...' : 'Issue Invoice'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

const ClientBilling = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchInvoices = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/invoices');
      setInvoices(res.data);
    } catch (err) {
      console.error('Invoice Fetch Error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchInvoices(); }, [fetchInvoices]);

  const updateStatus = async (id, newStatus) => {
    try {
      await api.put(`/invoices/${id}/status`, { status: newStatus });
      fetchInvoices();
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  // KPI Calculations
  const safeInvoices = invoices || [];
  const totalRevenue = safeInvoices.filter(i => i.status === 'PAID').reduce((sum, i) => sum + i.totalAmount, 0);
  const totalOutstanding = safeInvoices.filter(i => i.status === 'SENT' || i.status === 'OVERDUE').reduce((sum, i) => sum + i.totalAmount, 0);
  const overdueCount = safeInvoices.filter(i => i.status === 'OVERDUE').length;

  return (
    <div className="animate-fade-in pb-12 max-w-[1600px] mx-auto relative">
      <div className="mb-8 flex flex-col md:flex-row md:justify-between md:items-end gap-4">
        <div>
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-3 mb-1">
            <span className="px-2.5 py-1 rounded-md bg-finledger-indigo/10 border border-finledger-indigo/20 text-finledger-indigo text-[10px] font-bold tracking-widest uppercase">
              Practice Management
            </span>
          </motion.div>
          <h1 className="text-4xl font-black text-white tracking-tight">Client Billing</h1>
          <p className="text-gray-500 mt-1">Manage CA firm invoices, track receivables, and analyze revenue.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="btn-primary flex items-center gap-2 text-sm rounded-xl px-5"
        >
          <PlusIcon className="w-4 h-4" /> Create Invoice
        </button>
      </div>

      {/* KPI Overviews */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="glass-panel p-6 border-l-2 border-l-finledger-emerald">
          <div className="flex justify-between items-start mb-4">
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Collected Revenue</h4>
            <div className="p-2 rounded-lg bg-finledger-emerald/10 border border-finledger-emerald/20 flex-shrink-0">
               <CurrencyRupeeIcon className="w-4 h-4 text-finledger-emerald" />
            </div>
          </div>
          <h2 className="text-3xl font-black text-white mb-1">₹{totalRevenue.toLocaleString('en-IN')}</h2>
          <p className="text-xs text-gray-500 font-medium">All PAID invoices</p>
        </div>

        <div className="glass-panel p-6 border-l-2 border-l-finledger-indigo border-white/5">
          <div className="flex justify-between items-start mb-4">
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Outstanding Receivables</h4>
            <div className="p-2 rounded-lg bg-finledger-indigo/10 border border-finledger-indigo/20 flex-shrink-0">
               <BanknotesIcon className="w-4 h-4 text-finledger-indigo" />
            </div>
          </div>
          <h2 className="text-3xl font-black text-white mb-1">₹{totalOutstanding.toLocaleString('en-IN')}</h2>
          <p className="text-xs text-gray-500 font-medium">SENT and OVERDUE</p>
        </div>

        <div className="glass-panel p-6 border-l-2 border-l-finledger-ruby border-white/5">
          <div className="flex justify-between items-start mb-4">
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Action Required</h4>
             <div className="p-2 rounded-lg bg-finledger-ruby/10 border border-finledger-ruby/20 flex-shrink-0">
               <ClockIcon className="w-4 h-4 text-finledger-ruby" />
            </div>
          </div>
          <h2 className="text-3xl font-black text-white mb-1">{overdueCount}</h2>
          <p className="text-xs text-gray-500 font-medium">Invoices past due date</p>
        </div>
      </div>

      {/* Invoices List */}
      <div className="glass-panel p-1">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-white/10 border-t-finledger-indigo rounded-full animate-spin" />
          </div>
        ) : safeInvoices.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <DocumentTextIcon className="w-12 h-12 text-gray-700 mb-4" />
            <p className="text-gray-400 text-lg font-medium">No invoices created yet</p>
            <button onClick={() => setIsModalOpen(true)} className="text-finledger-indigo text-sm mt-2 hover:underline">
              Create your first invoice
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="border-b border-white/[0.06]">
                <tr className="bg-white/[0.02]">
                  <th className="px-5 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-500 whitespace-nowrap">Invoice #</th>
                  <th className="px-5 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-500">Client</th>
                  <th className="px-5 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-500">Issued On</th>
                  <th className="px-5 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-500">Amount</th>
                  <th className="px-5 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-500 items-center">Status</th>
                  <th className="px-5 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-500 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {safeInvoices.map((inv, idx) => (
                  <motion.tr
                    key={inv._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: idx * 0.05 }}
                    className="hover:bg-white/[0.02] transition-colors group"
                  >
                    <td className="px-5 py-4 font-mono text-sm text-gray-300">{inv.invoiceNumber}</td>
                    <td className="px-5 py-4 text-sm font-bold text-white">{inv.clientId?.name}</td>
                    <td className="px-5 py-4 text-sm text-gray-400">
                      {new Date(inv.issueDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-5 py-4 text-sm font-black text-white font-mono tracking-tight">
                      ₹{inv.totalAmount.toLocaleString('en-IN')}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-1.5 rounded-md border ${
                        inv.status === 'PAID' ? 'bg-finledger-emerald/10 text-finledger-emerald border-finledger-emerald/20' :
                        inv.status === 'OVERDUE' ? 'bg-finledger-ruby/10 text-finledger-ruby border-finledger-ruby/20' :
                        inv.status === 'SENT' ? 'bg-finledger-indigo/10 text-finledger-indigo border-finledger-indigo/20' :
                        'bg-gray-500/10 text-gray-400 border-gray-500/20'
                      }`}>
                        {inv.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      {inv.status !== 'PAID' && inv.status !== 'CANCELLED' && (
                        <button
                          onClick={() => updateStatus(inv._id, 'PAID')}
                          className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 rounded-md transition-colors mr-2 border border-emerald-500/20"
                        >
                          Mark Paid
                        </button>
                      )}
                      <button className="text-gray-500 hover:text-white transition-colors p-1" title="Download Record">
                         <DocumentArrowDownIcon className="w-5 h-5 inline" />
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Overlay */}
      <AnimatePresence>
        {isModalOpen && (
          <CreateInvoiceModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onCreated={fetchInvoices}
          />
        )}
      </AnimatePresence>

    </div>
  );
};

export default ClientBilling;
