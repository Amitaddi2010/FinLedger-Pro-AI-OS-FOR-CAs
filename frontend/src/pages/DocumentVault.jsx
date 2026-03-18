import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArchiveBoxIcon, ArrowDownTrayIcon, DocumentTextIcon, 
  FolderIcon, MagnifyingGlassIcon, PlusIcon,
  EllipsisVerticalIcon, ArrowPathIcon, CloudArrowUpIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline'; 
import api from '../services/api';
import { useAuthStore } from '../stores/authStore';

const CATEGORIES = ['All Files', 'Tax Documents', 'Financials', 'Audit', 'Bank Statements', 'Legal'];

const DocumentVault = () => {
  const { activeCompanyId } = useAuthStore();
  const [documents, setDocuments] = useState([]);
  const [stats, setStats] = useState({ usedGB: 0, limitGB: 10, usedPercent: 0 });
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [activeCategory, setActiveCategory] = useState('All Files');
  const [searchQuery, setSearchQuery] = useState('');
  const fileInputRef = useRef(null);

  const fetchData = async () => {
    try {
      const docsRes = await api.get(`/documents?companyId=${activeCompanyId}`);
      setDocuments(docsRes.data);
      const statsRes = await api.get(`/documents/stats`);
      setStats(statsRes.data);
    } catch (err) {
      console.error("Vault Data Fetch Failed:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeCompanyId) fetchData();
  }, [activeCompanyId]);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('companyId', activeCompanyId);
    formData.append('category', activeCategory !== 'All Files' ? activeCategory : 'Financials');

    try {
      await api.post('/documents/upload', formData);
      await fetchData(); 
    } catch (err) {
      alert("Upload failed: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  const filteredDocs = (Array.isArray(documents) ? documents : []).filter(doc => {
    const matchesCategory = activeCategory === 'All Files' || doc.category === activeCategory;
    const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  if (!activeCompanyId) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh] text-center animate-fade-in">
        <div className="w-24 h-24 rounded-3xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-center mb-8 shadow-2xl">
          <ArchiveBoxIcon className="w-10 h-10 text-finledger-indigo opacity-50" />
        </div>
        <h2 className="text-3xl font-black text-white mb-3">Vault Locked</h2>
        <p className="text-gray-500 max-w-md text-lg">Select a client workspace to access their encrypted document storage.</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in max-w-[1600px] mx-auto pb-12">
      {/* Header */}
      <div className="mb-8 flex flex-col md:flex-row md:justify-between md:items-end gap-5">
        <div>
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold tracking-widest uppercase flex items-center gap-1.5">
              <ShieldCheckIcon className="w-3.5 h-3.5" /> AES-256 Encrypted
            </span>
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-3xl md:text-4xl font-black text-white tracking-tight">
            Document Vault
          </motion.h1>
        </div>
        
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex gap-3">
          <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileUpload} />
          <button 
            onClick={() => fetchData()}
            className="text-sm font-medium text-gray-400 hover:text-white bg-white/[0.03] border border-white/[0.06] hover:border-white/10 p-2.5 rounded-xl transition-all"
            title="Refresh"
          >
            <ArrowPathIcon className={`w-5 h-5 ${loading ? 'animate-spin text-finledger-indigo' : ''}`} />
          </button>
          <button 
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="btn-primary flex items-center gap-2 text-sm px-6 py-2.5 hover:shadow-lg hover:shadow-white/20 active:scale-95 transition-all"
          >
            {uploading ? <ArrowPathIcon className="w-4 h-4 animate-spin" /> : <CloudArrowUpIcon className="w-5 h-5" />}
            {uploading ? 'Encrypting...' : 'Upload File'}
          </button>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        
        {/* Left Sidebar - Categories & Storage */}
        <div className="xl:col-span-1 space-y-6">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <h4 className="text-[10px] uppercase tracking-[0.15em] font-semibold text-gray-600 mb-3 px-2">Folders</h4>
            <div className="space-y-1.5 bg-white/[0.02] border border-white/[0.06] rounded-2xl p-2.5">
              {CATEGORIES.map((category) => (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all flex items-center gap-3 ${
                    activeCategory === category 
                      ? 'bg-finledger-indigo/15 text-white border border-finledger-indigo/20 shadow-inner' 
                      : 'text-gray-400 hover:bg-white/[0.03] hover:text-gray-300 border border-transparent'
                  }`}
                >
                  <FolderIcon className={`w-5 h-5 ${activeCategory === category ? 'text-finledger-indigo fill-finledger-indigo/20' : 'text-gray-500'}`} />
                  {category}
                  {activeCategory === category && <div className="ml-auto w-1 h-1 rounded-full bg-finledger-indigo" />}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Storage Meter */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="p-6 bg-white/[0.02] border border-white/[0.06] rounded-2xl relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-finledger-indigo opacity-50" />
            
            <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.15em] mb-4 flex items-center gap-2">
              <ArchiveBoxIcon className="w-4 h-4 text-emerald-400" /> Storage Quota
            </h4>
            
            <div className="flex justify-between items-baseline mb-3">
              <span className="text-3xl font-black text-white tracking-tighter">
                {stats.usedGB.toFixed(3)}<span className="text-sm text-gray-500 ml-1 font-medium">GB</span>
              </span>
              <span className="text-xs font-mono text-gray-400">{stats.limitGB} GB Max</span>
            </div>
            
            <div className="w-full bg-white/[0.04] rounded-full h-2 overflow-hidden mb-4">
              <div 
                className={`h-full rounded-full transition-all duration-1000 ${stats.usedPercent > 80 ? 'bg-rose-500' : 'bg-emerald-500'}`} 
                style={{ width: `${Math.max(stats.usedPercent, 2)}%` }} 
              />
            </div>
            
            <div className="text-[10px] text-gray-500 font-medium bg-white/[0.02] p-2.5 rounded-lg border border-white/[0.04] leading-relaxed">
              Files are automatically encrypted at rest and in transit.
            </div>
          </motion.div>
        </div>

        {/* Main Vault Area */}
        <div className="xl:col-span-3">
          
          {/* Search Bar */}
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-6 relative">
            <MagnifyingGlassIcon className="w-5 h-5 text-gray-500 absolute left-4 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search secure documents..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/[0.02] border border-white/[0.06] text-white rounded-xl pl-12 pr-4 py-3.5 text-sm font-medium outline-none focus:ring-2 focus:ring-finledger-indigo/30 focus:border-finledger-indigo/50 transition-all hover:border-white/10"
            />
          </motion.div>

          {/* Files List View */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="bg-[#0D0B14] border border-white/[0.06] rounded-2xl shadow-2xl overflow-hidden">
            
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-4 p-4 md:p-5 border-b border-white/[0.06] bg-white/[0.02] text-[10px] font-bold text-gray-500 uppercase tracking-[0.15em]">
              <div className="col-span-8 md:col-span-6 pl-2">Document Name</div>
              <div className="col-span-3 hidden md:block">Upload Date</div>
              <div className="col-span-2 hidden md:block text-right">Size</div>
              <div className="col-span-4 md:col-span-1 text-right pr-2">Actions</div>
            </div>

            {/* Table Body */}
            <div className="divide-y divide-white/[0.04]">
              {loading ? (
                <div className="py-20 flex flex-col items-center justify-center">
                  <div className="w-8 h-8 border-2 border-white/20 border-t-finledger-indigo rounded-full animate-spin mb-4" />
                  <p className="text-gray-500 text-sm font-medium uppercase tracking-widest text-[10px]">Decrypting Vault...</p>
                </div>
              ) : filteredDocs.length > 0 ? (
                <AnimatePresence>
                  {filteredDocs.map((doc, idx) => (
                    <motion.div 
                      key={doc.id} 
                      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ delay: idx * 0.05 }}
                      className="grid grid-cols-12 gap-4 p-4 md:p-5 items-center hover:bg-white/[0.03] transition-colors group cursor-default"
                    >
                      <div className="col-span-8 md:col-span-6 flex items-center gap-4 pl-2">
                        <div className={`p-2.5 rounded-xl border flex items-center justify-center shrink-0
                          ${doc.type === 'PDF' ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' : 
                            doc.type === 'IMAGE' ? 'bg-finledger-indigo/10 border-finledger-indigo/20 text-finledger-indigo' : 
                            'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'}`}
                        >
                          <DocumentTextIcon className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-gray-200 group-hover:text-white transition-colors truncate">{doc.name}</p>
                          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mt-1">{doc.category}</p>
                        </div>
                      </div>
                      
                      <div className="col-span-3 hidden md:block text-sm text-gray-400 font-mono">
                        {doc.date}
                      </div>
                      
                      <div className="col-span-2 hidden md:block text-right text-sm text-gray-400 font-mono font-medium">
                        {doc.size}
                      </div>
                      
                      <div className="col-span-4 md:col-span-1 flex justify-end items-center gap-1.5 opacity-50 group-hover:opacity-100 transition-opacity pr-2">
                        <button className="p-2 bg-white/[0.05] border border-white/10 text-white hover:bg-white/10 rounded-lg transition" title="Download">
                          <ArrowDownTrayIcon className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-gray-500 hover:text-white hover:bg-white/10 rounded-lg transition" title="More Options">
                          <EllipsisVerticalIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              ) : (
                <div className="py-24 text-center text-gray-500 flex flex-col items-center">
                  <div className="w-16 h-16 bg-white/[0.02] border border-white/[0.05] rounded-2xl flex items-center justify-center mb-6">
                    <ArchiveBoxIcon className="w-8 h-8 text-gray-600" />
                  </div>
                  <p className="text-xl font-bold text-gray-300 mb-1">Vault is Empty</p>
                  <p className="text-sm font-medium text-gray-500">No documents found matching your criteria.</p>
                </div>
              )}
            </div>
          </motion.div>

        </div>
      </div>
    </div>
  );
};

export default DocumentVault;
