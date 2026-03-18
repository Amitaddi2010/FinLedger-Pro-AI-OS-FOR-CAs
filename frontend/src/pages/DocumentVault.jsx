import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ArchiveBoxIcon, 
  ArrowDownTrayIcon, 
  DocumentTextIcon, 
  FolderIcon, 
  MagnifyingGlassIcon,
  PlusIcon,
  EllipsisVerticalIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline'; 
import api from '../services/api';
import { useAuthStore } from '../stores/authStore';

const DocumentVault = () => {
  const { activeCompanyId } = useAuthStore();
  const [documents, setDocuments] = useState([]);
  const [stats, setStats] = useState({ usedGB: 0, limitGB: 10, usedPercent: 0 });
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [activeCategory, setActiveCategory] = useState('All Files');
  const [searchQuery, setSearchQuery] = useState('');
  const fileInputRef = React.useRef(null);

  const CATEGORIES = ['All Files', 'Tax Documents', 'Financials', 'Audit', 'Bank Statements', 'Legal'];

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

  React.useEffect(() => {
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
      await fetchData(); // Refresh data
    } catch (err) {
      alert("Upload failed: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  const filteredDocs = documents.filter(doc => {
    const matchesCategory = activeCategory === 'All Files' || doc.category === activeCategory;
    const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="animate-fade-in pb-12 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="mb-10 flex flex-col md:flex-row md:justify-between md:items-end gap-4">
        <div>
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-3 mb-1">
            <span className="px-2.5 py-1 rounded-md bg-finledger-indigo/10 border border-finledger-indigo/20 text-finledger-indigo text-[10px] font-bold tracking-widest uppercase">
              Secure Storage
            </span>
          </motion.div>
          <h1 className="text-4xl font-black text-white tracking-tight">Document Vault</h1>
        </div>
        <div className="flex gap-3">
          <button className="glass-panel text-finledger-silver hover:text-white px-5 py-2.5 text-sm font-medium border-white/5 hover:border-white/20 transition rounded-xl flex items-center gap-2">
            <FolderIcon className="w-4 h-4" /> New Folder
          </button>
          
          <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileUpload} />
          <button 
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="btn-primary flex items-center gap-2 text-sm rounded-xl px-6"
          >
            {uploading ? <ArrowPathIcon className="w-4 h-4 animate-spin" /> : <PlusIcon className="w-4 h-4" />}
            {uploading ? 'Archiving...' : 'Upload Document'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        
        {/* Left Sidebar - Categories */}
        <div className="xl:col-span-1 space-y-2">
          {CATEGORIES.map(category => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`w-full text-left px-5 py-3 rounded-xl text-sm font-medium transition-all ${
                activeCategory === category 
                  ? 'bg-finledger-indigo/20 text-finledger-indigo border border-finledger-indigo/30' 
                  : 'text-gray-400 hover:bg-slate-800/50 hover:text-white border border-transparent'
              }`}
            >
              <div className="flex items-center gap-3">
                <FolderIcon className={`w-5 h-5 ${activeCategory === category ? 'text-finledger-indigo' : 'text-gray-500'}`} />
                {category}
              </div>
            </button>
          ))}

          {/* Storage Meter */}
          <div className="mt-8 p-5 glass-panel border-white/5">
            <h4 className="text-xs font-bold text-finledger-silver uppercase tracking-widest mb-3">Storage Quota</h4>
            <div className="flex items-end justify-between mb-2">
              <span className="text-2xl font-black text-white">{stats.usedGB.toFixed(3)} <span className="text-sm text-gray-400 font-medium">GB</span></span>
              <span className="text-xs text-gray-500 font-bold">{stats.limitGB} GB</span>
            </div>
            <div className="w-full bg-slate-800/50 rounded-full h-2 overflow-hidden border border-white/5 mb-3">
              <div className="bg-gradient-to-r from-finledger-indigo to-finledger-electric h-2 rounded-full" style={{ width: `${stats.usedPercent}%` }}></div>
            </div>
            <p className="text-[10px] text-gray-400 font-medium text-center">Your vault uses AES-256 bank-grade encryption.</p>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="xl:col-span-3">
          
          {/* Search Bar */}
          <div className="mb-6 relative">
            <MagnifyingGlassIcon className="w-5 h-5 text-gray-500 absolute left-4 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search documents by name, type, or client company..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 text-gray-200 rounded-xl pl-12 pr-4 py-3 outline-none focus:ring-2 focus:ring-finledger-indigo focus:border-transparent transition-all shadow-[0_4px_20px_rgba(0,0,0,0.2)]"
            />
          </div>

          {/* Files List View */}
          <div className="glass-panel overflow-hidden border-white/5 shadow-2xl">
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-4 p-4 border-b border-white/5 bg-slate-800/30 text-xs font-bold text-finledger-silver uppercase tracking-widest">
              <div className="col-span-6 md:col-span-5 pl-2">Name</div>
              <div className="col-span-2 hidden md:block">Client</div>
              <div className="col-span-2 hidden md:block">Date Modified</div>
              <div className="col-span-3 md:col-span-2 text-right">Size</div>
              <div className="col-span-3 md:col-span-1"></div>
            </div>

            {/* Table Body */}
            <div className="divide-y divide-white/5">
              {filteredDocs.length > 0 ? (
                filteredDocs.map((doc, idx) => (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    key={doc.id} 
                    className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-white/[0.02] transition-colors group cursor-pointer"
                  >
                    <div className="col-span-6 md:col-span-5 flex items-center gap-4 pl-2">
                      <div className={`p-2 rounded-lg 
                        ${doc.type === 'PDF' ? 'bg-red-900/20 text-red-500' : 
                          doc.type === 'IMAGE' ? 'bg-blue-900/20 text-blue-500' : 
                          'bg-emerald-900/20 text-emerald-500'}`}
                      >
                        <DocumentTextIcon className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-200 group-hover:text-finledger-indigo transition-colors truncate">{doc.name}</p>
                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-0.5">{doc.category}</p>
                      </div>
                    </div>
                    
                    <div className="col-span-2 hidden md:block text-xs text-gray-400 font-medium truncate">
                      {doc.company}
                    </div>
                    
                    <div className="col-span-2 hidden md:block text-xs text-gray-400 font-medium">
                      {doc.date}
                    </div>
                    
                    <div className="col-span-3 md:col-span-2 text-right text-xs text-gray-400 font-bold">
                      {doc.size}
                    </div>
                    
                    <div className="col-span-3 md:col-span-1 flex justify-end items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-1.5 text-gray-400 hover:text-white rounded-md hover:bg-white/10 transition"><ArrowDownTrayIcon className="w-4 h-4" /></button>
                      <button className="p-1.5 text-gray-400 hover:text-white rounded-md hover:bg-white/10 transition"><EllipsisVerticalIcon className="w-4 h-4" /></button>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="py-20 text-center text-gray-500 flex flex-col items-center">
                  <ArchiveBoxIcon className="w-16 h-16 mb-4 opacity-20" />
                  <p className="text-lg font-bold text-gray-400">No documents found</p>
                  <p className="text-sm mt-1">Try adjusting your filters or search query.</p>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default DocumentVault;
