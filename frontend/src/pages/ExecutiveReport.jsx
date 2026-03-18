import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../stores/authStore';
import api from '../services/api';
import { ShieldCheckIcon, PrinterIcon, ArrowLeftIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';

const ExecutiveReport = () => {
  const { activeCompanyId, companies } = useAuthStore();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const activeCompany = companies.find(c => c._id === activeCompanyId);

  useEffect(() => {
    const fetchReport = async () => {
      if (!activeCompanyId) return;
      try {
        setLoading(true);
        const res = await api.get('/insights/executive-summary');
        setData(res.data);
      } catch (err) {
        console.error("Report Fetch Error:", err);
        setError(err.response?.data?.message || err.message || 'Failed to generate report');
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, [activeCompanyId]);

  if (!activeCompanyId) {
    return <div className="text-white p-8">Please select a company first.</div>;
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] text-center p-8 text-white">
        <ArrowPathIcon className="w-16 h-16 animate-spin text-finledger-indigo mb-6" />
        <h2 className="text-2xl font-black mb-2 tracking-tight">Compiling Medical-Grade Audit</h2>
        <p className="text-gray-400 font-mono text-sm max-w-sm">
          Analyzing ledger vectors. Quantifying cash flow anomalies. Generating forensic summary...
        </p>
      </div>
    );
  }

  if (error) {
    return <div className="text-rose-400 p-8">Error: {error}</div>;
  }

  const { report, snapshot } = data;

  return (
    <div className="bg-[#08060D] min-h-screen text-white print:bg-white print:text-black">
      
      {/* Screen-only Action Bar */}
      <div className="max-w-4xl mx-auto py-6 px-8 flex justify-between items-center print:hidden border-b border-white/[0.06]">
         <button onClick={() => navigate('/company')} className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition">
           <ArrowLeftIcon className="w-4 h-4" /> Back to Dashboard
         </button>
         <button onClick={() => window.print()} className="btn-primary flex items-center gap-2 px-6 py-2 text-sm rounded-lg hover:shadow-lg transition">
           <PrinterIcon className="w-4 h-4" /> Print PDF Report
         </button>
      </div>

      {/* A4 Paper Container for Print */}
      <div className="max-w-4xl mx-auto bg-white text-black p-10 md:p-16 my-8 print:my-0 print:p-0 shadow-2xl print:shadow-none min-h-[297mm]">
        
        {/* Report Header */}
        <div className="border-b-4 border-black pb-8 mb-8 flex justify-between items-start">
           <div>
             <h1 className="text-4xl font-black tracking-tighter uppercase mb-2">FinLedger Forensic Audit</h1>
             <p className="text-lg font-bold tracking-tight text-gray-600">Executive Diagnostics Summary</p>
           </div>
           <div className="text-right">
             <div className="flex items-center justify-end gap-1.5 mb-2">
               <ShieldCheckIcon className="w-6 h-6 text-black" />
               <span className="font-bold text-sm uppercase tracking-widest">AES-256 Verified</span>
             </div>
             <p className="text-xs font-mono text-gray-500 uppercase">Entity: <span className="text-black font-bold">{activeCompany?.name}</span></p>
             <p className="text-xs font-mono text-gray-500 uppercase">Generated: <span className="text-black font-bold">{new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</span></p>
             <p className="text-xs font-mono text-gray-500 uppercase tracking-widest mt-2">{activeCompany?.industry}</p>
           </div>
        </div>

        {/* 1. Quantitative Snapshot */}
        <div className="mb-10">
          <h2 className="text-sm font-black uppercase tracking-widest border-b border-gray-300 pb-2 mb-4 text-gray-800">1. Quantitative Snapshot</h2>
          <div className="grid grid-cols-3 gap-6">
            <div className="bg-gray-50 p-4 border border-gray-200">
               <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Total Validated Revenue</p>
               <p className="text-2xl font-black">₹{snapshot.actuals?.totalRevenue?.toLocaleString('en-IN')}</p>
            </div>
            <div className="bg-gray-50 p-4 border border-gray-200">
               <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Total Executed Expenditure</p>
               <p className="text-2xl font-black">₹{snapshot.actuals?.totalExpenses?.toLocaleString('en-IN')}</p>
            </div>
            <div className="bg-gray-50 p-4 border border-gray-200">
               <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Net Flow Vector</p>
               <p className="text-2xl font-black">
                 {snapshot.actuals?.profit >= 0 ? '+' : '-'}₹{Math.abs(snapshot.actuals?.profit || 0).toLocaleString('en-IN')}
               </p>
            </div>
          </div>
        </div>

        {/* 2. Executive Overview */}
        <div className="mb-10">
          <h2 className="text-sm font-black uppercase tracking-widest border-b border-gray-300 pb-2 mb-4 text-gray-800">2. Executive Overview</h2>
          <p className="text-base leading-relaxed font-medium text-black">
             {report.executiveSummary}
          </p>
        </div>

        {/* 3. Forensic Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
           <div>
             <h2 className="text-sm font-black uppercase tracking-widest border-b border-gray-300 pb-2 mb-4 text-gray-800">3a. Cash Flow Diagnostic</h2>
             <p className="text-sm leading-relaxed text-black border-l-4 border-black pl-4 py-2 bg-gray-50">
                {report.cashFlowDiagnostic}
             </p>
           </div>
           <div>
             <h2 className="text-sm font-black uppercase tracking-widest border-b border-gray-300 pb-2 mb-4 text-rose-600 print:text-black">3b. Detected Anomalies</h2>
             <ul className="list-disc pl-5 space-y-2 text-sm font-bold text-rose-600 print:text-black">
               {report.anomaliesDetected?.map((anomaly, i) => (
                 <li key={i}>{anomaly}</li>
               ))}
             </ul>
           </div>
        </div>

        {/* 4. Strategic Prescription */}
        <div className="mb-10 bg-gray-50 border border-gray-200 p-6">
          <h2 className="text-sm font-black uppercase tracking-widest border-b border-gray-300 pb-2 mb-4 text-gray-800">4. Strategic Prescription & Next Steps</h2>
          <ul className="space-y-4 text-sm font-medium">
            {report.strategicPrescription?.map((step, i) => (
              <li key={i} className="flex gap-4 items-start">
                <span className="w-6 h-6 shrink-0 bg-black text-white rounded-full flex items-center justify-center font-bold text-xs">
                  {i + 1}
                </span>
                <span className="mt-0.5">{step}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* 5. Key Findings Matrix */}
        <div className="mb-10 page-break-inside-avoid">
          <h2 className="text-sm font-black uppercase tracking-widest border-b border-gray-300 pb-2 mb-4 text-gray-800">5. Significant Finding Matrix</h2>
          <div className="divide-y divide-gray-200 border-b border-t border-gray-200">
             {report.keyFindings?.map((finding, i) => (
                <div key={i} className="py-4 flex gap-4">
                   <div className="w-24 shrink-0">
                     <span className={`text-[10px] font-bold px-2 py-1 uppercase tracking-widest border text-center block ${
                       finding.severity === 'HIGH' ? 'border-black bg-black text-white' : 
                       'border-gray-400 text-gray-600'
                     }`}>
                        {finding.severity}
                     </span>
                   </div>
                   <div>
                     <h3 className="font-bold text-black mb-1 text-sm">{finding.title}</h3>
                     <p className="text-xs text-gray-700">{finding.description}</p>
                   </div>
                </div>
             ))}
          </div>
        </div>

        {/* Footer */}
        <div className="pt-8 border-t border-black text-center text-[10px] uppercase font-bold text-gray-400 tracking-widest">
           Confidential & Privileged Document • Generated Automatically by FinLedger AI Engine v3
        </div>

      </div>
    </div>
  );
};

export default ExecutiveReport;
