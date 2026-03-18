import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../stores/authStore';
import api from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BellAlertIcon, CheckCircleIcon, ExclamationTriangleIcon, 
  ArrowTrendingDownIcon, CurrencyDollarIcon, BanknotesIcon,
  ShieldExclamationIcon, ArrowPathIcon
} from '@heroicons/react/24/outline';

const getIconForType = (type) => {
  switch(type) {
    case 'ANOMALY': return <ExclamationTriangleIcon className="w-5 h-5 text-amber-500" />;
    case 'PRORATA_DEVIATION': return <ArrowTrendingDownIcon className="w-5 h-5 text-rose-500" />;
    case 'CASHFLOW_RISK': return <BanknotesIcon className="w-5 h-5 text-rose-500" />;
    default: return <BellAlertIcon className="w-5 h-5 text-finledger-indigo" />;
  }
};

const getColorForSeverity = (severity) => {
  switch(severity) {
    case 'HIGH': return 'bg-rose-500/10 border-rose-500/30 text-rose-400';
    case 'MEDIUM': return 'bg-amber-500/10 border-amber-500/30 text-amber-400';
    case 'LOW': return 'bg-finledger-indigo/10 border-finledger-indigo/30 text-finledger-indigo';
    default: return 'bg-gray-500/10 border-gray-500/30 text-gray-400';
  }
};

const AlertsInbox = () => {
  const { activeCompanyId, companies } = useAuthStore();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const activeCompany = (Array.isArray(companies) ? companies : []).find(c => c._id === activeCompanyId);

  const fetchAlerts = async () => {
    if (!activeCompanyId) return;
    setLoading(true);
    try {
      const res = await api.get(`/alerts?companyId=${activeCompanyId}`);
      setAlerts(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, [activeCompanyId]);

  const handleScan = async () => {
    setScanning(true);
    try {
      await api.post(`/alerts/scan/${activeCompanyId}`);
      await fetchAlerts();
    } catch (err) {
      console.error(err);
    } finally {
      setScanning(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await api.put(`/alerts/${id}/read`);
      setAlerts(prev => prev.map(a => a._id === id ? { ...a, isRead: true } : a));
    } catch (err) {
      console.error(err);
    }
  };

  if (!activeCompanyId) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh] text-center animate-fade-in">
        <div className="w-24 h-24 rounded-3xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-center mb-8 shadow-2xl">
          <ShieldExclamationIcon className="w-10 h-10 text-finledger-indigo opacity-50" />
        </div>
        <h2 className="text-3xl font-black text-white mb-3">Alerts Offline</h2>
        <p className="text-gray-500 max-w-md text-lg">Select a client workspace to view their security and financial alerts.</p>
      </div>
    );
  }

  const unreadCount = (Array.isArray(alerts) ? alerts : []).filter(a => !a.isRead).length;

  return (
    <div className="animate-fade-in max-w-4xl mx-auto pb-12">
      {/* Header */}
      <div className="mb-10 flex flex-col md:flex-row md:justify-between md:items-end gap-5">
        <div>
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-1 rounded-lg bg-finledger-indigo/10 border border-finledger-indigo/20 text-finledger-indigo text-[10px] font-bold tracking-widest uppercase flex items-center gap-1.5">
               Detection Engine
            </span>
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-3xl md:text-4xl font-black text-white tracking-tight">
            Intelligent Alerts
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="text-gray-500 mt-2 font-medium max-w-lg">
            Review predictive cashflow warnings and ledger anomalies for <span className="text-white font-bold">{activeCompany?.name}</span>.
          </motion.p>
        </div>
        
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
          <button 
            onClick={handleScan}
            disabled={scanning}
            className="btn-primary flex items-center gap-2 text-sm px-6 py-2.5"
          >
            {scanning ? <ArrowPathIcon className="w-4 h-4 animate-spin" /> : <ShieldExclamationIcon className="w-4 h-4" />}
            {scanning ? 'Scanning Ledgers...' : 'Force Diagnostic Scan'}
          </button>
        </motion.div>
      </div>

      <div className="bg-[#0D0B14] border border-white/[0.06] rounded-3xl overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-white/[0.06] bg-white/[0.01] flex justify-between items-center">
           <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
             Inbox <span className="bg-finledger-indigo text-white text-[10px] px-2 py-0.5 rounded-full">{unreadCount} Unread</span>
           </h3>
           <div className="text-[10px] uppercase font-bold text-gray-500 tracking-widest flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" /> Active System Rules
           </div>
        </div>

        <div className="divide-y divide-white/[0.04] max-h-[70vh] overflow-y-auto no-scrollbar">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center">
              <div className="w-8 h-8 border-2 border-white/20 border-t-finledger-indigo rounded-full animate-spin mb-4" />
              <p className="text-gray-500 text-sm font-medium uppercase tracking-widest text-[10px]">Retrieving alerts...</p>
            </div>
          ) : alerts.length > 0 ? (
            <AnimatePresence>
              {(Array.isArray(alerts) ? alerts : []).map((alert, i) => (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                  key={alert._id} 
                  className={`p-6 flex flex-col md:flex-row gap-5 transition-all group ${alert.isRead ? 'opacity-60 bg-transparent hover:bg-white/[0.01]' : 'bg-white/[0.02] hover:bg-white/[0.04]'}`}
                >
                  <div className="shrink-0 flex flex-col items-center gap-2">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${getColorForSeverity(alert.severity)}`}>
                      {getIconForType(alert.type)}
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-3">
                        <h4 className={`text-base font-bold truncate ${alert.isRead ? 'text-gray-400' : 'text-white'}`}>{alert.title}</h4>
                        {!alert.isRead && <span className="w-2 h-2 rounded-full bg-finledger-indigo animate-pulse shrink-0" />}
                      </div>
                      <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest shrink-0">
                        {new Date(alert.createdAt).toLocaleString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    
                    <p className={`text-sm leading-relaxed mb-4 ${alert.isRead ? 'text-gray-500' : 'text-gray-300'}`}>
                      {alert.message}
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className={`text-[9px] font-bold px-2 py-1 uppercase tracking-widest rounded-md border ${getColorForSeverity(alert.severity)}`}>
                          Severity: {alert.severity}
                        </span>
                        <span className="text-[9px] font-bold px-2 py-1 uppercase tracking-widest rounded-md border bg-white/[0.02] border-white/10 text-gray-400">
                          {alert.type.replace('_', ' ')}
                        </span>
                      </div>
                      
                      {!alert.isRead && (
                        <button 
                          onClick={() => markAsRead(alert._id)}
                          className="text-[10px] uppercase font-bold tracking-widest text-emerald-400 flex items-center gap-1.5 hover:text-emerald-300 transition opacity-0 group-hover:opacity-100"
                        >
                          <CheckCircleIcon className="w-4 h-4" /> Mark Reviewed
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          ) : (
            <div className="py-24 text-center text-gray-500 flex flex-col items-center">
              <div className="w-16 h-16 bg-white/[0.02] border border-white/[0.05] rounded-2xl flex items-center justify-center mb-6">
                <CheckCircleIcon className="w-8 h-8 text-emerald-500/50" />
              </div>
              <p className="text-xl font-bold text-gray-300 mb-2">Inbox Zero</p>
              <p className="text-sm font-medium text-gray-500 max-w-sm">No critical warnings or anomalies have been detected. The ledgers are optimal.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AlertsInbox;
