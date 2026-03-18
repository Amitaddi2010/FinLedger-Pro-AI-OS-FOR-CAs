import React, { useState } from 'react';
import { useAuthStore } from '../stores/authStore';
import api from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BuildingOfficeIcon, ArrowDownTrayIcon, ArrowUpTrayIcon, 
  SparklesIcon, PresentationChartLineIcon, DocumentCheckIcon
} from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';

const ClientDashboard = () => {
  const { activeCompanyId, companies, user } = useAuthStore();
  const navigate = useNavigate();
  const activeCompany = companies.find(c => c._id === activeCompanyId);
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState('');

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file || !activeCompanyId) return;

    setLoading(true);
    setMessage('');
    const formData = new FormData();
    formData.append('image', file);
    formData.append('companyId', activeCompanyId);
    
    try {
      await api.post('/transactions/upload-receipt', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setMessage('Receipt uploaded and safely routed to your CA.');
      setFile(null);
    } catch (err) {
      setMessage('Failed to upload receipt. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!activeCompanyId) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh] text-center animate-fade-in">
        <div className="w-24 h-24 rounded-3xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-center mb-8 shadow-2xl">
          <BuildingOfficeIcon className="w-10 h-10 text-finledger-indigo opacity-50" />
        </div>
        <h2 className="text-3xl font-black text-white mb-3">Welcome to your Portal</h2>
        <p className="text-gray-500 max-w-md text-lg">Your CA has not assigned you an active company profile yet.</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in max-w-6xl mx-auto pb-12">
      
      {/* Header Profile */}
      <div className="mb-10 text-center flex flex-col items-center">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="w-20 h-20 rounded-2xl bg-gradient-to-br from-finledger-indigo to-finledger-electric flex items-center justify-center mb-5 shadow-[0_0_40px_rgba(88,86,224,0.3)]">
           <BuildingOfficeIcon className="w-10 h-10 text-white" />
        </motion.div>
        <motion.h1 initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-4xl md:text-5xl font-black text-white tracking-tight mb-2">
          {activeCompany?.name}
        </motion.h1>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-gray-400 font-medium">
          Welcome back, {user?.name}. Your accounting ledger is actively managed by your CA.
        </motion.p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 mt-16">
        
        {/* Reports Download Card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-[#0D0B14] border border-white/[0.06] rounded-3xl p-8 relative overflow-hidden group hover:border-finledger-indigo/30 transition-all shadow-2xl">
           <div className="absolute top-0 right-0 w-40 h-40 bg-finledger-indigo/10 rounded-full blur-[50px] pointer-events-none group-hover:bg-finledger-indigo/20 transition-all" />
           <div className="w-14 h-14 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-center mb-6 relative z-10">
             <PresentationChartLineIcon className="w-7 h-7 text-finledger-indigo" />
           </div>
           
           <h3 className="text-2xl font-bold text-white mb-3 relative z-10">Executive Health Report</h3>
           <p className="text-gray-400 leading-relaxed mb-8 relative z-10">
             Your CA utilizes FinLedger Intelligence to generate medical-grade health diagnostics of your recent financials. Click below to view or export the latest PDF Report.
           </p>
           
           <button onClick={() => navigate('/report')} className="w-full btn-primary flex items-center justify-center gap-2 py-4 shadow-xl relative z-10">
             <ArrowDownTrayIcon className="w-5 h-5" /> Download Latest PDF
           </button>
           
           <div className="mt-6 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-emerald-400">
             <SparklesIcon className="w-4 h-4"/> AI Generated Diagnostics
           </div>
        </motion.div>

        {/* Receipt Upload Card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-[#0D0B14] border border-white/[0.06] rounded-3xl p-8 relative shadow-2xl">
           <div className="w-14 h-14 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-center mb-6 relative z-10">
             <ArrowUpTrayIcon className="w-7 h-7 text-white" />
           </div>
           
           <h3 className="text-2xl font-bold text-white mb-3 relative z-10">Upload Receipts</h3>
           <p className="text-gray-400 leading-relaxed mb-6 relative z-10">
             Snap a photo of your receipt or invoice and upload it. The intelligence engine will automatically extract the values and route it to your CA's ledger.
           </p>

           <AnimatePresence>
             {message && (
               <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className={`mb-6 p-4 rounded-xl flex items-center gap-3 text-sm font-bold border ${message.includes('successfully') || message.includes('safely') ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-rose-500/10 border-rose-500/30 text-rose-400'}`}>
                 <DocumentCheckIcon className="w-5 h-5 shrink-0" />
                 {message}
               </motion.div>
             )}
           </AnimatePresence>

           <form onSubmit={handleUpload} className="relative z-10">
             <input 
               type="file" 
               accept="image/jpeg, image/png, image/webp"
               id="client-receipt"
               className="hidden"
               onChange={(e) => setFile(e.target.files[0])}
             />
             <label htmlFor="client-receipt" className={`w-full py-10 flex flex-col items-center justify-center border-2 border-dashed rounded-2xl cursor-pointer transition-all mb-4 ${file ? 'border-finledger-indigo/50 bg-finledger-indigo/5' : 'border-white/10 bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/20'}`}>
               <ArrowUpTrayIcon className={`w-8 h-8 mb-3 ${file ? 'text-finledger-indigo' : 'text-gray-500'}`} />
               <span className={`font-bold ${file ? 'text-white' : 'text-gray-400'}`}>{file ? file.name : 'Tap to Browse Device'}</span>
             </label>
             
             <button type="submit" disabled={!file || loading} className="w-full bg-white text-black font-bold py-4 rounded-xl hover:bg-gray-200 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
               {loading ? <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" /> : 'Secure Upload to CA'}
             </button>
           </form>
        </motion.div>
        
      </div>

    </div>
  );
};

export default ClientDashboard;
