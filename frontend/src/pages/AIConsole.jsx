import React, { useState, useRef, useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';
import api from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { SparklesIcon, PaperAirplaneIcon, DocumentTextIcon, ChartBarIcon, CpuChipIcon, BoltIcon, ExclamationTriangleIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline'; 

const suggestedLedgerQueries = [
  "Why has our profit margin dropped compared to last term?",
  "Are there any unusual spikes in marketing expenses?",
  "Show me the top 3 highest expense categories this month.",
  "What is the revenue projection for next quarter?"
];

const suggestedDocumentQueries = [
  "What is the termination clause in the recent lease agreement?",
  "Summarize the key points from the last tax filing.",
  "What is the total invoice amount for vendor X?",
  "Extract the specific payment terms from the uploaded contracts."
];

const AIConsole = () => {
  const { activeCompanyId } = useAuthStore();
  const [query, setQuery] = useState('');
  const [conversation, setConversation] = useState([]);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState('ledger'); // 'ledger' or 'document'
  const endOfMessagesRef = useRef(null);

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation, loading]);

  if (!activeCompanyId) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh] text-center animate-fade-in">
        <div className="w-24 h-24 rounded-3xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-center mb-8 shadow-2xl">
          <SparklesIcon className="w-10 h-10 text-finledger-indigo opacity-50" />
        </div>
        <h2 className="text-3xl font-black text-white mb-3">AI Engine Standby</h2>
        <p className="text-gray-500 max-w-md text-lg">Select a client workspace to initialize the intelligence matrix.</p>
      </div>
    );
  }

  const handleAsk = async (e) => {
    e?.preventDefault();
    if (!query.trim() || loading) return;

    const currentMode = mode;
    const userMessage = { role: 'user', content: query, mode: currentMode };
    setConversation(prev => [...prev, userMessage]);
    const currentQuery = query;
    setQuery('');
    setLoading(true);

    try {
      if (currentMode === 'ledger') {
        const res = await api.post('/insights/ask', { query: currentQuery });
        setConversation(prev => [...prev, { role: 'ai', content: res.data, mode: 'ledger' }]);
      } else {
        const res = await api.post('/insights/ask-documents', { query: currentQuery });
        setConversation(prev => [...prev, { role: 'ai', content: res.data, mode: 'document' }]);
      }
    } catch (err) {
      setConversation(prev => [...prev, { role: 'error', content: 'Connection to intelligence layer failed. Please verify API configuration.' }]);
    } finally {
      setLoading(false);
    }
  };

  const setAndSubmitQuery = (q) => {
    setQuery(q);
    setTimeout(() => {
      document.getElementById('ask-form').dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
    }, 50);
  };

  const renderSuggestedQueries = () => {
    const list = mode === 'ledger' ? suggestedLedgerQueries : suggestedDocumentQueries;
    return (
      <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-3">
        {list.map((q, i) => (
          <motion.button 
            key={i}
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
            onClick={() => setAndSubmitQuery(q)}
            className="bg-white/[0.02] p-4 rounded-xl text-left border border-white/[0.05] hover:border-finledger-indigo/30 hover:bg-finledger-indigo/[0.02] transition-all group"
          >
            <p className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors">"{q}"</p>
          </motion.button>
        ))}
      </div>
    );
  };

  const renderAIResponse = (msg) => {
    if (msg.mode === 'ledger') {
      return (
        <div className="bg-white/[0.02] border border-white/[0.06] p-6 md:p-8 rounded-3xl rounded-tl-sm max-w-[95%] md:max-w-[85%] w-full shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-finledger-emerald to-finledger-indigo" />
          
          <div className="flex gap-3 items-center mb-6 relative z-10">
            <div className="w-8 h-8 rounded-lg bg-white/[0.05] border border-white/10 flex items-center justify-center">
              <ChartBarIcon className="w-4 h-4 text-finledger-emerald" />
            </div>
            <span className="text-gray-400 font-bold tracking-widest uppercase text-[10px]">Ledger Matrix</span>
          </div>
          
          <h4 className="text-lg md:text-xl font-bold text-white mb-8 border-l-2 border-finledger-emerald/30 pl-5 leading-relaxed bg-white/[0.01] py-2 rounded-r-xl relative z-10">
            {msg.content.keyInsight}
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-[#08060D]/50 p-6 rounded-2xl border border-white/[0.04] relative z-10">
            <div>
               <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                 <span className="w-1.5 h-1.5 rounded-full bg-rose-500" /> Root Cause Analysis
               </p>
               <ul className="space-y-3">
                 {msg.content.rootCause?.map((cause, i) => (
                   <li key={i} className="flex gap-3 text-sm text-gray-300 leading-relaxed">
                     <span className="text-gray-600 mt-0.5 shrink-0">—</span> <span>{cause}</span>
                   </li>
                 ))}
               </ul>
            </div>
            <div className="md:border-l border-white/[0.06] md:pl-6 pt-6 md:pt-0 border-t md:border-t-0 mt-6 md:mt-0">
               <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                 <span className="w-1.5 h-1.5 rounded-full bg-finledger-emerald" /> Recommended Actions
               </p>
               <ul className="space-y-3">
                 {msg.content.actions?.map((action, i) => (
                   <li key={i} className="flex gap-3 text-sm font-medium text-emerald-100/80 leading-relaxed">
                     <span className="text-finledger-emerald mt-0.5 shrink-0">→</span> <span>{action}</span>
                   </li>
                 ))}
               </ul>
            </div>
          </div>
        </div>
      );
    } else {
      // Document RAG Response
      return (
        <div className="bg-[#0D0B14] border border-finledger-indigo/20 p-6 md:p-8 rounded-3xl rounded-tl-sm max-w-[95%] md:max-w-[85%] w-full shadow-2xl relative overflow-hidden group shadow-finledger-indigo/5">
          <div className="absolute top-0 right-0 w-32 h-32 bg-finledger-indigo/10 rounded-full blur-[40px] pointer-events-none" />
          
          <div className="flex gap-3 items-center justify-between mb-6 relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-finledger-indigo/10 border border-finledger-indigo/20 flex items-center justify-center">
                <DocumentTextIcon className="w-4 h-4 text-finledger-indigo" />
              </div>
              <span className="text-gray-400 font-bold tracking-widest uppercase text-[10px]">Document Oracle</span>
            </div>
            <span className={`text-[9px] font-bold px-2 py-1 uppercase tracking-widest rounded border ${
               msg.content.confidence === 'HIGH' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
               msg.content.confidence === 'LOW' ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' :
               'bg-amber-500/10 border-amber-500/20 text-amber-400'
            }`}>
              Confidence: {msg.content.confidence}
            </span>
          </div>

          <div className="text-base text-gray-200 leading-relaxed mb-6 font-medium bg-white/[0.01] p-5 rounded-2xl border border-white/[0.03]">
            {msg.content.answer}
          </div>

          {msg.content.extractedQuotes?.length > 0 && (
            <div className="relative z-10">
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                <ChatBubbleLeftRightIcon className="w-3.5 h-3.5 text-gray-400" /> Extracted Document Text
              </p>
              <div className="space-y-2">
                {msg.content.extractedQuotes.map((quote, i) => (
                  <div key={i} className="pl-4 border-l-2 border-finledger-indigo/40 py-1 text-sm text-gray-400 font-mono">
                    "{quote}"
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      );
    }
  };

  return (
    <div className="h-[calc(100vh-6rem)] max-w-5xl mx-auto flex flex-col bg-[#0D0B14] rounded-2xl border border-white/[0.06] shadow-2xl overflow-hidden relative">
      
      {/* Background Glow */}
      <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-finledger-indigo/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Header */}
      <div className="p-4 md:p-6 border-b border-white/[0.06] flex items-center justify-between bg-white/[0.01] backdrop-blur-xl z-20 relative">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-finledger-indigo to-finledger-electric flex items-center justify-center shadow-lg shadow-finledger-indigo/20 relative">
            <SparklesIcon className="w-6 h-6 text-white" />
            <div className="absolute top-0 left-0 w-full h-full rounded-xl border border-white/20" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white tracking-tight">FinLedger Oracle</h2>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-[10px] text-gray-400 font-mono uppercase tracking-widest">System Online</span>
            </div>
          </div>
        </div>
        
        {/* Toggle Mode */}
        <div className="flex bg-black/40 p-1 border border-white/[0.06] rounded-xl">
           <button 
             onClick={() => setMode('ledger')} 
             className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-widest flex items-center gap-2 transition-all ${
               mode === 'ledger' ? 'bg-white/[0.1] text-white shadow-sm' : 'text-gray-500 hover:text-gray-300'
             }`}
           >
             <ChartBarIcon className="w-4 h-4" /> Ledger Engine
           </button>
           <button 
             onClick={() => setMode('document')} 
             className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-widest flex items-center gap-2 transition-all ${
               mode === 'document' ? 'bg-finledger-indigo/20 border border-finledger-indigo/30 text-finledger-indigo shadow-inner' : 'text-gray-500 hover:text-gray-300'
             }`}
           >
             <DocumentTextIcon className="w-4 h-4" /> Vault RAG
           </button>
        </div>
      </div>

      {/* Chat History */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8 scroll-smooth z-10 relative">
        
        {conversation.length === 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center justify-center h-full text-center max-w-2xl mx-auto">
            <div className={`w-20 h-20 bg-white/[0.02] border ${mode === 'document' ? 'border-finledger-indigo/30 shadow-finledger-indigo/20' : 'border-white/[0.05]'} rounded-3xl flex items-center justify-center mb-6 shadow-2xl transition-all`}>
              {mode === 'ledger' ? <BoltIcon className="w-10 h-10 text-finledger-emerald" /> : <DocumentTextIcon className="w-10 h-10 text-finledger-indigo" />}
            </div>
            <h3 className="text-3xl font-black text-white mb-4 tracking-tight">
              {mode === 'ledger' ? 'Financial Matrix Online' : 'Document Intelligence Matrix'}
            </h3>
            <p className="text-gray-400 text-base mb-10 leading-relaxed font-medium">
               {mode === 'ledger' 
                 ? "I have full access to your client's ledger, prorata expectations, and historical data. I can detect anomalies, pinpoint cash leaks, and provide actionable resolution steps." 
                 : "I have embedded and indexed all text from the secure PDFs located in the Document Vault. I can answer questions, summarize clauses, or extract specific numbers securely."}
            </p>
            
            {renderSuggestedQueries()}
          </motion.div>
        )}

        {conversation.map((msg, idx) => (
          <motion.div 
            initial={{ opacity: 0, y: 10, scale: 0.98 }} 
            animate={{ opacity: 1, y: 0, scale: 1 }} 
            key={idx} 
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.role === 'user' ? (
              <div className="bg-gradient-to-br from-finledger-indigo to-finledger-electric text-white px-6 py-4 rounded-2xl rounded-tr-sm max-w-[85%] md:max-w-[70%] shadow-lg shadow-finledger-indigo/20 font-medium text-sm md:text-base border border-finledger-indigo/30">
                {msg.content}
              </div>
            ) : msg.role === 'error' ? (
              <div className="bg-rose-500/10 border border-rose-500/30 px-6 py-4 rounded-2xl rounded-tl-sm max-w-[85%] md:max-w-[70%] font-medium text-sm flex items-start gap-3 flex-row">
                <ExclamationTriangleIcon className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                <span className="text-rose-200">{msg.content}</span>
              </div>
            ) : (
              renderAIResponse(msg)
            )}
          </motion.div>
        ))}
        
        {loading && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex justify-start">
            <div className={`px-6 py-4 rounded-2xl rounded-tl-sm border border-white/[0.06] flex items-center gap-4 ${mode === 'document' ? 'bg-finledger-indigo/5' : 'bg-white/[0.02]'}`}>
               <div className="flex gap-1.5">
                 <span className={`w-2 h-2 rounded-full animate-bounce ${mode === 'document' ? 'bg-finledger-indigo' : 'bg-finledger-emerald'}`}></span>
                 <span className={`w-2 h-2 rounded-full animate-bounce ${mode === 'document' ? 'bg-finledger-indigo' : 'bg-finledger-emerald'}`} style={{animationDelay: "0.15s"}}></span>
                 <span className={`w-2 h-2 rounded-full animate-bounce ${mode === 'document' ? 'bg-finledger-indigo' : 'bg-finledger-emerald'}`} style={{animationDelay: "0.3s"}}></span>
               </div>
               <span className="text-xs text-gray-400 font-mono uppercase tracking-widest">
                 {mode === 'ledger' ? 'Processing numerical matrices...' : 'Searching vector embeddings...'}
               </span>
            </div>
          </motion.div>
        )}
        <div ref={endOfMessagesRef} className="h-4" />
      </div>

      {/* Input Area */}
      <div className="p-4 md:p-6 bg-[#08060D] border-t border-white/[0.06] z-10 relative">
        <form id="ask-form" onSubmit={handleAsk} className="relative w-full">
          <input 
            type="text" 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            disabled={loading}
            placeholder={mode === 'ledger' ? "Ask about cash flow, anomalies, or predictions..." : "Search across all Vault PDFs for names, clauses, or amounts..."}
            className="w-full bg-white/[0.03] border border-white/[0.06] text-white rounded-xl pl-6 pr-16 py-4 md:py-5 focus:outline-none focus:ring-2 focus:ring-finledger-indigo/30 focus:border-finledger-indigo/50 transition-all shadow-inner font-medium placeholder-gray-600 text-sm md:text-base disabled:opacity-50 hover:border-white/10"
          />
          <button 
            type="submit" 
            disabled={loading || !query.trim()}
            className={`absolute right-2.5 top-2.5 bottom-2.5 aspect-square rounded-lg flex items-center justify-center disabled:opacity-50 disabled:bg-white/10 disabled:text-gray-500 transition-all shadow-lg active:scale-95 ${
              mode === 'document' 
                ? 'bg-gradient-to-br from-finledger-indigo to-indigo-700 text-white hover:shadow-finledger-indigo/40' 
                : 'bg-white text-black hover:bg-gray-200'
            }`}
          >
            <PaperAirplaneIcon className="w-5 h-5 -rotate-45" />
          </button>
        </form>
        <p className="text-center text-[10px] text-gray-600 font-mono uppercase tracking-widest mt-4 flex items-center justify-center gap-2">
          {mode === 'ledger' ? <CpuChipIcon className="w-3.5 h-3.5" /> : <DocumentTextIcon className="w-3.5 h-3.5" />}
          {mode === 'ledger' ? 'Llama 3 70B • Mathematical Analysis Mode' : 'Llama 3 70B • Vector Retrieval Mode'}
        </p>
      </div>

    </div>
  );
};

export default AIConsole;
