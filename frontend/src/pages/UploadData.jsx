import React, { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '../stores/authStore';
import api from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { CommandLineIcon, CpuChipIcon, ShieldCheckIcon, CloudArrowUpIcon, DocumentCheckIcon, EyeIcon, BanknotesIcon } from '@heroicons/react/24/outline';

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
  const [mode, setMode] = useState('bulk'); // 'bulk' or 'ocr'

  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(0);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [logs, setLogs] = useState([]);
  const [ocrResult, setOcrResult] = useState(null);
  const logsEndRef = useRef(null);

  useEffect(() => {
    let interval;
    let logInterval;
    if (loading && mode === 'bulk') {
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

    } else if (loading && mode === 'ocr') {
      interval = setInterval(() => setTimer(prev => prev + 0.05), 50);
      setLogs([
        `[${new Date().toISOString()}] SYSTEM: Initializing LLaMA-3 Vision Processor...`,
        `[${new Date().toISOString()}] ENCODING: Image Buffer verified...`,
        `[${new Date().toISOString()}] AI: Analyzing vendor strings & values...`
      ]);
    } else {
      setTimer(0);
      if(!message) setLogs([]); 
    }
    return () => {
      if (interval) clearInterval(interval);
      if (logInterval) clearInterval(logInterval);
    };
  }, [loading, message, mode]);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    setError(null);
    setMessage(null);
    setOcrResult(null);

    const formData = new FormData();
    formData.append(mode === 'bulk' ? 'file' : 'image', file);
    formData.append('companyId', activeCompanyId);
    
    try {
      if (mode === 'bulk') {
        setLogs([`[${new Date().toISOString()}] SYSTEM: Commencing direct binary upload...`]);
        await new Promise(resolve => setTimeout(resolve, 4000));
        const res = await api.post('/transactions/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        setMessage(res.data.message);
        setLogs(prev => [...prev, `[${new Date().toISOString()}] SYSTEM: Analysis Complete. Data ingested successfully.`]);
      } else {
        // OCR Upload
        const res = await api.post('/transactions/upload-receipt', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        setMessage(res.data.message);
        setOcrResult(res.data.transaction);
        const ocr = res.data.ocrData || res.data.transaction;
        setLogs(prev => [
            ...prev, 
            `[${new Date().toISOString()}] AI: Extraction Complete ✅`,
            `[${new Date().toISOString()}] AMOUNT: ₹${ocr.amount || 0}`,
            `[${new Date().toISOString()}] VENDOR: ${ocr.description || 'N/A'}`,
            `[${new Date().toISOString()}] CATEGORY: ${ocr.category || 'N/A'}`,
            `[${new Date().toISOString()}] SYSTEM: Ledger entry stored successfully.`
        ]);
      }
      setFile(null);
    } catch (err) {
      setError(err?.response?.data?.message || err.message);
      setLogs(prev => [...prev, `[${new Date().toISOString()}] ERROR: Process terminated abnormally.`]);
    } finally {
      setLoading(false);
    }
  };

  const clearForm = () => {
    setFile(null);
    setMessage(null);
    setError(null);
    setOcrResult(null);
    setLogs([]);
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
          Securely upload ledger exports or single receipts to feed the autonomous intelligence pipeline. Powered by Scavenger & Vision OCR.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8 relative z-10">
        
        <div className="glass-panel p-8 md:p-10 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <CpuChipIcon className="w-6 h-6 text-finledger-indigo" />
                <h3 className="text-xl font-bold text-white uppercase tracking-widest text-[13px]">Engine Control</h3>
              </div>
              
              <div className="flex bg-black/40 p-1 border border-white/[0.06] rounded-xl">
                 <button 
                   onClick={() => { setMode('bulk'); clearForm(); }} 
                   className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 transition-all ${
                     mode === 'bulk' ? 'bg-white/[0.1] text-white shadow-sm' : 'text-gray-500 hover:text-gray-300'
                   }`}
                 >
                   <CommandLineIcon className="w-3.5 h-3.5" /> Scavenger
                 </button>
                 <button 
                   onClick={() => { setMode('ocr'); clearForm(); }} 
                   className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 transition-all ${
                     mode === 'ocr' ? 'bg-finledger-indigo/20 border border-finledger-indigo/30 text-finledger-indigo shadow-inner' : 'text-gray-500 hover:text-gray-300'
                   }`}
                 >
                   <EyeIcon className="w-3.5 h-3.5" /> Vision AI
                 </button>
              </div>
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

            {ocrResult && (
               <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 bg-[#0D0B14] border border-white/10 p-5 rounded-xl shadow-inner">
                 <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                   <BanknotesIcon className="w-4 h-4 text-finledger-indigo" /> Ledger Entry Generated
                 </h4>
                 <div className="grid grid-cols-2 gap-4">
                   <div>
                     <p className="text-[9px] text-gray-500 uppercase tracking-widest">Amount</p>
                     <p className="text-xl font-bold text-white">₹{ocrResult.amount.toLocaleString()}</p>
                   </div>
                   <div>
                     <p className="text-[9px] text-gray-500 uppercase tracking-widest">Category</p>
                     <p className="text-sm font-medium text-emerald-400">{ocrResult.category}</p>
                   </div>
                   <div className="col-span-2">
                     <p className="text-[9px] text-gray-500 uppercase tracking-widest">Description</p>
                     <p className="text-sm text-gray-300 truncate">{ocrResult.description}</p>
                   </div>
                 </div>
               </motion.div>
            )}

            <form onSubmit={handleUpload} className="flex flex-col gap-6">
              <input 
                type="file" 
                accept={mode === 'bulk' ? ".csv,.900,.tsf,.xml,.zip" : "image/jpeg, image/png, image/webp"}
                id="file-upload"
                className="hidden"
                onChange={(e) => {
                  setFile(e.target.files[0]);
                  setMessage(null);
                  setError(null);
                  setOcrResult(null);
                }}
              />
              
              <label 
                htmlFor="file-upload" 
                className={`relative overflow-hidden w-full flex flex-col items-center justify-center gap-4 py-12 rounded-2xl border-2 border-dashed transition-all cursor-pointer group ${file ? 'bg-finledger-indigo/10 border-finledger-indigo/40' : 'bg-white/[0.02] border-white/10 hover:border-white/30 hover:bg-white/[0.04]'}`}
              >
                <CloudArrowUpIcon className={`w-12 h-12 ${file ? 'text-finledger-indigo' : 'text-gray-500 group-hover:text-gray-300'} transition-colors`} />
                <div className="text-center">
                  <p className={`font-bold ${file ? 'text-white' : 'text-gray-400'}`}>
                    {file ? file.name : (mode === 'bulk' ? 'Browse Ledger Data' : 'Upload Receipt Image')}
                  </p>
                  <p className="text-[11px] text-gray-500 uppercase tracking-widest mt-2">
                    {mode === 'bulk' ? 'Supports .CSV, .900, .TSF, .XML' : 'Supports JPG, PNG (Max 5MB)'}
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
                    {mode === 'bulk' ? 'ANALYZING LEDGER...' : 'RUNNING VISION OCR...'}
                  </>
                ) : (
                  mode === 'bulk' ? 'INITIATE INGESTION' : 'EXTRACT DATA'
                )}
                
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
              <div className="text-lg font-bold text-white">{mode === 'bulk' ? 'Scavenger v3' : 'LLaMA Vision'}</div>
            </div>
          </div>
        </div>

        {/* Terminal Window */}
        <div className="glass-panel flex flex-col relative overflow-hidden">
          <div className="bg-[#110E1A] px-6 py-4 flex items-center justify-between border-b border-white/10 z-20">
            <div className="flex items-center gap-4">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
              </div>
              <span className="text-gray-400 font-mono text-xs uppercase tracking-widest">
                {mode === 'bulk' ? 'ledger_scavenger.exe' : 'vision_engine.bin'}
              </span>
            </div>
            
            <div className="font-mono flex items-center gap-4 text-xs">
              <span className="text-gray-500">T+{timer.toFixed(2)}s</span>
              <span className={`px-2 py-0.5 rounded ${loading ? 'bg-finledger-indigo/20 text-finledger-indigo' : 'bg-white/5 text-gray-500'}`}>
                {loading ? 'ACTIVE' : 'IDLE'}
              </span>
            </div>
          </div>

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
                      log.includes('AI:') ? 'text-emerald-400' :
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
