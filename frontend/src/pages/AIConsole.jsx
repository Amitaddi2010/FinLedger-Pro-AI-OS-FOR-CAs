import React, { useState, useRef, useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';
import api from '../services/api';
import { SparklesIcon, PaperAirplaneIcon, DocumentTextIcon, BuildingLibraryIcon } from '@heroicons/react/24/outline'; 

const AIConsole = () => {
  const { activeCompanyId } = useAuthStore();
  const [query, setQuery] = useState('');
  const [conversation, setConversation] = useState([]);
  const [loading, setLoading] = useState(false);
  const endOfMessagesRef = useRef(null);

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation]);

  if (!activeCompanyId) {
    return <div className="text-gray-500 text-center mt-20 text-xl font-medium">Select a company first to use the AI Console.</div>;
  }

  const handleAsk = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    const userMessage = { role: 'user', content: query };
    setConversation(prev => [...prev, userMessage]);
    setQuery('');
    setLoading(true);

    try {
      const res = await api.post('/insights/ask', { query: userMessage.content });
      const aiResponse = res.data; // Expected JSON

      const aiMessage = { role: 'ai', content: aiResponse };
      setConversation(prev => [...prev, aiMessage]);
    } catch (err) {
      setConversation(prev => [...prev, { role: 'error', content: 'Connection to intelligence layer failed.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-[calc(100vh-6rem)] flex flex-col bg-finledger-charcoal/50 rounded-2xl border border-gray-800 shadow-2xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)]">
      
      {/* Header */}
      <div className="p-6 border-b border-gray-800 flex items-center justify-between bg-gray-900/50 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl primary-gradient text-white flex items-center justify-center shadow-lg shadow-finledger-indigo/20">
            <SparklesIcon className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">FinLedger Oracle</h2>
            <p className="text-xs text-finledger-emerald font-medium flex items-center gap-1 mt-0.5">
               <span className="w-2 h-2 rounded-full bg-finledger-emerald inline-block animate-pulse"></span>
               System Online
            </p>
          </div>
        </div>
        <div className="flex gap-2">
            <span className="px-3 py-1.5 bg-gray-800 border border-gray-700 text-xs font-medium rounded-lg text-gray-400">Llama 3 70B</span>
        </div>
      </div>

      {/* Chat History */}
      <div className="flex-1 overflow-y-auto p-6 space-y-8 scroll-smooth">
        
        {conversation.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center max-w-lg mx-auto opacity-70 transition-opacity hover:opacity-100">
            <BuildingLibraryIcon className="w-20 h-20 text-gray-600 mb-6" />
            <h3 className="text-2xl font-bold text-white mb-3">Ask me anything about the financials.</h3>
            <p className="text-gray-400 text-sm mb-8 leading-relaxed">
               I have full access to your company's transactional history, prorata expectations, and historical data. I can detect anomalies, pinpoint cash leaks, and provide actionable resolution steps.
            </p>
            <div className="w-full space-y-3">
               <div className="bg-gray-800/50 p-4 rounded-xl text-left border border-gray-700 hover:border-finledger-indigo/50 cursor-pointer transition-colors" onClick={() => setQuery("Why has our profit margin dropped compared to last term?")}>
                  <p className="text-sm font-medium text-gray-300">"Why has our profit margin dropped compared to last term?"</p>
               </div>
               <div className="bg-gray-800/50 p-4 rounded-xl text-left border border-gray-700 hover:border-finledger-indigo/50 cursor-pointer transition-colors" onClick={() => setQuery("Are there any unusual spikes in marketing expenses?")}>
                  <p className="text-sm font-medium text-gray-300">"Are there any unusual spikes in marketing expenses?"</p>
               </div>
            </div>
          </div>
        )}

        {conversation.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
            {msg.role === 'user' ? (
              <div className="bg-finledger-indigo text-white px-5 py-3.5 rounded-2xl rounded-tr-sm max-w-[80%] shadow-lg shadow-finledger-indigo/10 border border-finledger-indigo/50 font-medium">
                {msg.content}
              </div>
            ) : msg.role === 'error' ? (
              <div className="bg-red-900/20 border border-red-900/50 text-red-400 px-5 py-3.5 rounded-2xl rounded-tl-sm max-w-[80%] font-medium">
                {msg.content}
              </div>
            ) : (
              <div className="glass-panel p-6 border-gray-700 max-w-[90%] w-full">
                <div className="flex gap-3 items-center mb-4">
                  <div className="w-8 h-8 rounded-full bg-gray-800 border border-gray-600 flex items-center justify-center">
                    <SparklesIcon className="w-4 h-4 text-finledger-emerald" />
                  </div>
                  <span className="text-finledger-silver font-bold tracking-wide uppercase text-xs">Analysis Complete</span>
                </div>
                
                <h4 className="text-lg font-bold text-white mb-6 border-l-4 border-finledger-emerald pl-4">
                  {msg.content.keyInsight}
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-900/30 p-5 rounded-xl border border-gray-800">
                  <div>
                     <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Root Cause Analysis</p>
                     <ul className="space-y-2 text-sm text-gray-300">
                       {msg.content.rootCause?.map((cause, i) => <li key={i} className="flex gap-2"><span>-</span> <span>{cause}</span></li>)}
                     </ul>
                  </div>
                  <div>
                     <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Recommended Actions</p>
                     <ul className="space-y-2 text-sm text-finledger-emerald font-medium">
                       {msg.content.actions?.map((action, i) => <li key={i} className="flex gap-2 text-emerald-400 mt-0.5"><span>→</span> <span>{action}</span></li>)}
                     </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-800 p-4 rounded-2xl rounded-tl-sm max-w-[80%] border border-gray-700 flex items-center gap-3">
               <span className="w-2 h-2 rounded-full bg-finledger-indigo animate-bounce"></span>
               <span className="w-2 h-2 rounded-full bg-finledger-indigo animate-bounce" style={{animationDelay: "0.1s"}}></span>
               <span className="w-2 h-2 rounded-full bg-finledger-indigo animate-bounce" style={{animationDelay: "0.2s"}}></span>
               <span className="text-sm text-gray-400 ml-2 font-medium">Structuring intelligence...</span>
            </div>
          </div>
        )}
        <div ref={endOfMessagesRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-gray-900 border-t border-gray-800">
        <form onSubmit={handleAsk} className="relative max-w-4xl mx-auto">
          <input 
            type="text" 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            disabled={loading}
            placeholder="E.g., Which expense categories are exceeding the prorata target this quarter?"
            className="w-full bg-gray-800 border-2 border-gray-700 text-white rounded-xl pl-6 pr-16 py-4 focus:outline-none focus:ring-0 focus:border-finledger-indigo transition shadow-inner font-medium placeholder-gray-500"
          />
          <button 
            type="submit" 
            disabled={loading || !query.trim()}
            className="absolute right-2 top-2 bottom-2 aspect-square bg-finledger-indigo rounded-lg flex items-center justify-center text-white disabled:opacity-50 hover:bg-indigo-500 transition shadow-lg"
          >
            <PaperAirplaneIcon className="w-5 h-5 -rotate-45" />
          </button>
        </form>
      </div>

    </div>
  );
};

export default AIConsole;
