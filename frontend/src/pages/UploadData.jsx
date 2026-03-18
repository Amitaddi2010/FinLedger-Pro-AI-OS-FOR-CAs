import React, { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '../stores/authStore';
import api from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { CommandLineIcon, CpuChipIcon, ShieldCheckIcon, CloudArrowUpIcon, DocumentCheckIcon } from '@heroicons/react/24/outline';

const SCAVENGER_LOGS = [
  "INITIALIZING: Ledger Scavenger Protocol v3.4...",
  "ATTACHING: Deep-scan heuristics engine...",
  "RESOLVING: Chart of Accounts architecture...",
  "VERIFYING: Ingestion pipeline integrity...",
  "SCANNING: Primary voucher streams [0x8A4F]...",
  "DECODING: Proprietary TSF byte blocks...",
  "MAPPING: Bank entities & counter-parties...",
  "INDEXING: Transaction hashes verified...",
  "DETECTING: Outliers and anomaly candidates...",
  "COMPLETING: Metadata synchronization...",
];

const UploadData = () => {
  const { activeCompanyId } = useAuthStore();
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(0);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [logs, setLogs] = useState([]);
  const logsEndRef = useRef(null);

  useEffect(() => {
    let interval;
    let logInterval;
    if (loading) {
      interval = setInterval(() => {
        setTimer(prev => prev + 0.05);
      }, 50);

      let logIndex = 0;
      logInterval = setInterval(() => {
        if (logIndex < SCAVENGER_LOGS.length) {
          setLogs(prev => [...prev, `[${new Date().toISOString()}] ${SCAVENGER_LOGS[logIndex]}`]);
          logIndex++;
          logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        } else {
          // Generate active scanning logs
          const hashes = ['0x4A2B', '0x99F1', '0x1C2D', '0x88EE', '0x10AA'];
          const randomHash = hashes[Math.floor(Math.random() * hashes.length)];
          setLogs(prev => [...prev.slice(-15), `[${new Date().toISOString()}] PROCESS: Voucher fragment ${randomHash} verified.`]);
          logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
      }, 400);

    } else {
      setTimer(0);
      if(!message) setLogs([]); // keep logs on success
    }
    return () => {
      if (interval) clearInterval(interval);
      if (logInterval) clearInterval(logInterval);
    };
  }, [loading, message]);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    setError(null);
    setMessage(null);
    setLogs([`[${new Date().toISOString()}] SYSTEM: Commencing direct binary upload...`]);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('companyId', activeCompanyId);
    
    try {
      // Simulate real processing time for effect since actual upload might be instant
      await new Promise(resolve => setTimeout(resolve, 4000));
      const res = await api.post('/transactions/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setMessage(res.data.message);
      setLogs(prev => [...prev, `[${new Date().toISOString()}] SYSTEM: Analysis Complete. Data ingested successfully.`]);
      setFile(null);
    } catch (err) {
      setError(err?.response?.data?.message || err.message);
      setLogs(prev => [...prev, `[${new Date().toISOString()}] ERROR: Process terminated abnormally.`]);
    } finally {
      setLoading(false);
    }
  };

  if (!activeCompanyId) {
    return <div className="text-gray-500 text-center mt-20 text-xl font-medium tracking-tight">Select a company first to ingest core data.</div>;
  }

  return (
    <div className="max-w-7xl mx-auto animate-fade-in pb-20 relative">
      <div className="absolute inset-0 z-0 pointer-events-none radial-glow opacity-50" />
      
      <div className="relative z-10 flex flex-col items-center pt-8 pb-12">
        <div className="status-pill mb-6">
          <div className="w-1.5 h-1.5 rounded-full bg-finledger-emerald animate-pulse" />
          Production Core / <span className="text-finledger-indigo">Status: Optimal</span>
        </div>
        
        <motion.h1 
          initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="text-5xl md:text-6xl font-black text-white mb-4 tracking-tighter text-center shine-text"
        >
          Data Ingestion Engine
        </motion.h1>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto font-medium text-center">
          Securely upload ledger exports to feed the autonomous intelligence pipeline. Powered by our proprietary Scavenger technology.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8 relative z-10">
        
        {/* Upload Control Panel */}
        <div className="glass-panel p-8 md:p-10 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-8">
              <CpuChipIcon className="w-6 h-6 text-finledger-indigo" />
              <h3 className="text-xl font-bold text-white uppercase tracking-widest text-[13px]">Engine Control</h3>
            </div>
            
            <AnimatePresence>
              {message && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mb-6 bg-finledger-emerald/10 border border-finledger-emerald/30 p-4 rounded-xl flex items-center gap-4 text-finledger-emerald font-bold">
                  <DocumentCheckIcon className="w-6 h-6 shrink-0"/> 
                  <span className="text-sm">{message}</span>
                </motion.div>
              )}
              {error && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mb-6 bg-rose-500/10 border border-rose-500/30 p-4 rounded-xl flex items-center gap-4 text-rose-400 font-bold">
                  <span className="text-xl shrink-0">⚠️</span>
                  <span className="text-sm">{error}</span>
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleUpload} className="flex flex-col gap-6">
              <input 
                type="file" 
                accept=".csv,.900,.tsf,.xml,.zip"
                id="file-upload"
                className="hidden"
                onChange={(e) => {
                  setFile(e.target.files[0]);
                  setMessage(null);
                  setError(null);
                }}
              />
              
              <label 
                htmlFor="file-upload" 
                className={`relative overflow-hidden w-full flex flex-col items-center justify-center gap-4 py-12 rounded-2xl border-2 border-dashed transition-all cursor-pointer group ${file ? 'bg-finledger-indigo/10 border-finledger-indigo/40' : 'bg-white/[0.02] border-white/10 hover:border-white/30 hover:bg-white/[0.04]'}`}
              >
                <CloudArrowUpIcon className={`w-12 h-12 ${file ? 'text-finledger-indigo' : 'text-gray-500 group-hover:text-gray-300'} transition-colors`} />
                <div className="text-center">
                  <p className={`font-bold ${file ? 'text-white' : 'text-gray-400'}`}>
                    {file ? file.name : 'Click to Browse Data File'}
                  </p>
                  <p className="text-[11px] text-gray-500 uppercase tracking-widest mt-2">
                    Supports .CSV, .900, .TSF, .XML
                  </p>
                </div>
              </label>

              <button 
                type="submit" 
                disabled={!file || loading}
                className="w-full btn-primary flex justify-center items-center gap-3 group relative overflow-hidden"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                    ANALYZING LEDGER...
                  </>
                ) : (
                  'INITIATE INGESTION'
                )}
                
                {/* Button shine effect */}
                <div className="absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-gradient-to-r from-transparent to-white opacity-40 group-hover:animate-text-shine" />
              </button>
            </form>
          </div>

          <div className="mt-10 grid grid-cols-2 gap-4 border-t border-white/10 pt-8">
            <div className="flex flex-col gap-1">
              <div className="text-[10px] uppercase text-gray-500 font-bold tracking-widest flex items-center gap-1"><ShieldCheckIcon className="w-3 h-3"/> Integrity</div>
              <div className="text-lg font-bold text-white">AES-256</div>
            </div>
            <div className="flex flex-col gap-1">
              <div className="text-[10px] uppercase text-gray-500 font-bold tracking-widest flex items-center gap-1"><CommandLineIcon className="w-3 h-3"/> Parser</div>
              <div className="text-lg font-bold text-white">Scavenger v3</div>
            </div>
          </div>
        </div>

        {/* Terminal Window */}
        <div className="glass-panel flex flex-col relative overflow-hidden">
          {/* Header */}
          <div className="bg-[#110E1A] px-6 py-4 flex items-center justify-between border-b border-white/10 z-20">
            <div className="flex items-center gap-4">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
              </div>
              <span className="text-gray-400 font-mono text-xs uppercase tracking-widest">ledger_scavenger.exe</span>
            </div>
            
            <div className="font-mono flex items-center gap-4 text-xs">
              <span className="text-gray-500">T+{timer.toFixed(2)}s</span>
              <span className={`px-2 py-0.5 rounded ${loading ? 'bg-finledger-indigo/20 text-finledger-indigo' : 'bg-white/5 text-gray-500'}`}>
                {loading ? 'ACTIVE' : 'IDLE'}
              </span>
            </div>
          </div>

          {/* Console Output */}
          <div className="terminal-window flex-1 p-6 relative bg-transparent border-none rounded-none rounded-b-3xl">
            {loading && <div className="scanline z-10" />}
            
            <div className="h-[400px] overflow-y-auto space-y-2 relative z-20 pr-4 custom-scrollbar">
              <div className="text-gray-500 mb-4">
                VoidZero Core Linux 5.15.0-generic x86_64<br/>
                System online. Waiting for ingestion trigger...
              </div>
              
              <AnimatePresence>
                {logs.map((log, i) => (
                  <motion.div 
                    key={i} 
                    initial={{ opacity: 0, x: -10 }} 
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2 }}
                    className={`font-mono text-[13px] ${
                      log.includes('ERROR') ? 'text-rose-400' :
                      log.includes('SYSTEM') ? 'text-finledger-electric' :
                      'text-gray-300'
                    }`}
                  >
                    {log}
                  </motion.div>
                ))}
              </AnimatePresence>
              <div ref={logsEndRef} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadData;
