import React, { useEffect, useState, useCallback } from 'react';
import { useAuthStore } from '../stores/authStore';
import api from '../services/api';
import { motion } from 'framer-motion';
import { 
  ShieldCheckIcon, ClockIcon, UserIcon, SparklesIcon,
  DocumentTextIcon, Cog6ToothIcon, ExclamationTriangleIcon,
  ServerStackIcon
} from '@heroicons/react/24/outline';

const AuditTrail = () => {
  const { activeCompanyId, companies } = useAuthStore();
  const activeCompany = (companies || []).find(c => c._id === activeCompanyId);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchLogs = useCallback(async () => {
    if (!activeCompanyId) return;
    setLoading(true);
    try {
      const res = await api.get('/company/audit-logs');
      setLogs(res.data);
    } catch (error) {
      console.error('Audit Fetch Error:', error);
    } finally {
      setLoading(false);
    }
  }, [activeCompanyId]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  if (!activeCompanyId) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh] text-center animate-fade-in">
        <div className="w-24 h-24 rounded-3xl glass-card flex items-center justify-center mb-8 animate-float shadow-finledger-indigo/20">
          <ShieldCheckIcon className="w-10 h-10 text-finledger-indigo" />
        </div>
        <h2 className="text-3xl font-black text-white mb-3">No Workspace Selected</h2>
        <p className="text-finledger-silver max-w-md text-lg">Select a company from the sidebar to view its audit trail.</p>
      </div>
    );
  }

  const getActionIcon = (action, entity) => {
    const act = action.toLowerCase();
    const ent = entity.toLowerCase();
    
    if (ent.includes('insight') || act.includes('ai') || act.includes('forecast')) return <SparklesIcon className="w-5 h-5 text-finledger-indigo" />;
    if (ent.includes('document') || act.includes('upload')) return <DocumentTextIcon className="w-5 h-5 text-finledger-emerald" />;
    if (act.includes('delete') || act.includes('error')) return <ExclamationTriangleIcon className="w-5 h-5 text-finledger-ruby" />;
    if (ent.includes('settings') || act.includes('update')) return <Cog6ToothIcon className="w-5 h-5 text-gray-400" />;
    
    return <ServerStackIcon className="w-5 h-5 text-gray-500" />;
  };

  const getActionColor = (action, entity) => {
    const act = action.toLowerCase();
    const ent = entity.toLowerCase();
    
    if (ent.includes('insight') || act.includes('ai')) return 'border-finledger-indigo/40 bg-finledger-indigo/5';
    if (act.includes('delete')) return 'border-finledger-ruby/40 bg-finledger-ruby/5';
    if (act.includes('upload') || act.includes('create')) return 'border-finledger-emerald/40 bg-finledger-emerald/5';
    
    return 'border-white/10 bg-white/[0.02]';
  };

  return (
    <div className="animate-fade-in pb-12 max-w-[1200px] mx-auto">
      {/* Header */}
      <div className="mb-10">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-3 mb-1">
          <span className="px-2.5 py-1 rounded-md bg-finledger-indigo/10 border border-finledger-indigo/20 text-finledger-indigo text-[10px] font-bold tracking-widest uppercase">
            Compliance & Security
          </span>
        </motion.div>
        <h1 className="text-4xl font-black text-white tracking-tight">AI Audit Trail</h1>
        <p className="text-gray-500 mt-1">Immutable ledger of system activity, user actions, and AI inferences for {activeCompany?.name}</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-10 h-10 border-4 border-white/10 border-t-finledger-indigo rounded-full animate-spin" />
        </div>
      ) : logs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center glass-panel">
          <ShieldCheckIcon className="w-12 h-12 text-gray-700 mb-4" />
          <p className="text-gray-500 text-lg font-medium">No activity recorded yet</p>
          <p className="text-gray-600 text-sm mt-1">Actions performed in this workspace will appear here securely.</p>
        </div>
      ) : (
        <div className="relative pl-6 md:pl-0">
          {/* Timeline Center Line (Desktop) / Left Line (Mobile) */}
          <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-px bg-white/5 md:-translate-x-1/2" />

          <div className="space-y-8">
            {logs.map((log, index) => {
              const isEven = index % 2 === 0;
              const date = new Date(log.createdAt);
              
              return (
                <motion.div
                  key={log._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05, duration: 0.4 }}
                  className="relative flex items-center md:justify-between flex-col md:flex-row gap-6 md:gap-0 group"
                >
                  {/* Timeline Dot */}
                  <div className="absolute left-[-5px] md:left-1/2 top-6 md:top-1/2 w-3 h-3 rounded-full bg-finledger-midnight border-2 border-finledger-indigo z-10 md:-translate-x-1/2 md:-translate-y-1/2 group-hover:scale-150 group-hover:bg-finledger-indigo transition-all duration-300" />

                  {/* Desktop Left Side (Date & User) / Mobile Top Side */}
                  <div className={`w-full md:w-5/12 ml-6 md:ml-0 flex ${isEven ? 'md:justify-end md:text-right' : 'md:justify-start md:text-left md:order-2'} flex-col gap-1 z-10`}>
                    <div className="flex items-center gap-2 text-xs text-gray-400 font-mono mb-1 md:hidden">
                       <ClockIcon className="w-3.5 h-3.5" />
                       {date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })} at {date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <div className="hidden md:flex items-center gap-2 text-xs text-gray-500 font-mono mb-1 w-full justify-inherit" style={{ justifyContent: isEven ? 'flex-end' : 'flex-start' }}>
                       {date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })} at {date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    
                    <div className={`flex items-center gap-2 ${isEven ? 'md:flex-row-reverse' : ''}`}>
                      <div className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center border border-white/10 shrink-0">
                         <UserIcon className="w-3 h-3 text-gray-400" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-300">{log.userId?.name || 'System Actor'}</p>
                        <p className="text-[10px] text-gray-500 uppercase tracking-wider">{log.userId?.role || 'AUTO'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Desktop Right Side (Action Card) / Mobile Bottom Side */}
                  <div className={`w-full md:w-5/12 ml-6 md:ml-0 ${isEven ? 'md:order-2' : 'md:text-right'}`}>
                    <div className={`p-5 rounded-2xl border backdrop-blur-sm transition-all duration-300 hover:shadow-lg ${getActionColor(log.action, log.entity)}`}>
                      <div className="flex items-start gap-4">
                        <div className="p-2 bg-white/5 rounded-xl border border-white/10 shrink-0 mt-1">
                          {getActionIcon(log.action, log.entity)}
                        </div>
                        <div className="flex-1 text-left">
                           <div className="flex items-center gap-2 mb-1 flex-wrap">
                             <span className="text-[10px] uppercase tracking-widest font-bold px-2 py-0.5 rounded-md bg-white/5 text-gray-400">
                               {log.entity}
                             </span>
                             <span className="text-[10px] uppercase tracking-widest font-bold text-gray-500">
                               {log.action}
                             </span>
                           </div>
                           <p className="text-sm text-gray-200 leading-relaxed font-medium">
                             {typeof log.details === 'string' ? log.details : JSON.stringify(log.details)}
                           </p>
                           {log.ipAddress && (
                             <p className="text-xs text-gray-600 font-mono mt-3 break-all">
                               IP: {log.ipAddress}
                             </p>
                           )}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default AuditTrail;
