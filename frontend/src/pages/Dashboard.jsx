import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import api from '../services/api';
import { 
  BuildingOfficeIcon, PlusIcon, ExclamationTriangleIcon, 
  XMarkIcon, ArrowTrendingUpIcon, ArrowTrendingDownIcon 
} from '@heroicons/react/24/outline';

const AddCompanyModal = ({ onClose, onCreated }) => {
  const [name, setName] = useState('');
  const [industry, setIndustry] = useState('');
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [annualRevenueTarget, setAnnualRevenueTarget] = useState('');
  const [annualProfitTarget, setAnnualProfitTarget] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await api.post('/companies', {
        name,
        industry,
        registrationNumber,
        annualRevenueTarget: annualRevenueTarget ? parseFloat(annualRevenueTarget) : undefined,
        annualProfitTarget: annualProfitTarget ? parseFloat(annualProfitTarget) : undefined
      });
      onCreated();
      onClose();
    } catch (err) {
      setError(err || 'Failed to create company');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4" onClick={onClose}>
      <div className="glass-panel p-8 max-w-lg w-full relative animate-fade-in" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white transition">
          <XMarkIcon className="w-6 h-6" />
        </button>

        <h2 className="text-2xl font-bold text-white mb-2">Connect New Company</h2>
        <p className="text-gray-400 text-sm mb-8">Add a client company to start analyzing financials.</p>

        {error && <div className="mb-4 text-red-400 bg-red-900/20 px-4 py-3 rounded-lg text-sm border border-red-900/50">{error}</div>}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Company Name *</label>
            <input 
              type="text" value={name} onChange={(e) => setName(e.target.value)} required
              className="w-full bg-gray-800/50 border border-gray-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-finledger-indigo/50 transition-all placeholder-gray-500"
              placeholder="e.g. Stark Industries"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Industry</label>
              <input 
                type="text" value={industry} onChange={(e) => setIndustry(e.target.value)}
                className="w-full bg-gray-800/50 border border-gray-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-finledger-indigo/50 transition-all placeholder-gray-500"
                placeholder="e.g. Technology"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Reg. Number</label>
              <input 
                type="text" value={registrationNumber} onChange={(e) => setRegistrationNumber(e.target.value)}
                className="w-full bg-gray-800/50 border border-gray-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-finledger-indigo/50 transition-all placeholder-gray-500"
                placeholder="e.g. CIN12345"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Revenue Target (₹)</label>
              <input 
                type="number" value={annualRevenueTarget} onChange={(e) => setAnnualRevenueTarget(e.target.value)}
                className="w-full bg-gray-800/50 border border-gray-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-finledger-indigo/50 transition-all placeholder-gray-500"
                placeholder="e.g. 5000000"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Profit Target (₹)</label>
              <input 
                type="number" value={annualProfitTarget} onChange={(e) => setAnnualProfitTarget(e.target.value)}
                className="w-full bg-gray-800/50 border border-gray-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-finledger-indigo/50 transition-all placeholder-gray-500"
                placeholder="e.g. 1500000"
              />
            </div>
          </div>

          <button type="submit" disabled={loading} className="w-full btn-primary mt-2">
            {loading ? 'Connecting...' : 'Connect Company'}
          </button>
        </form>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const { companies, fetchCompanies, switchCompany } = useAuthStore();
  const [portfolio, setPortfolio] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const loadPortfolio = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/metrics/portfolio');
      setPortfolio(res.data);
    } catch (err) {
      // Fallback to basic companies list if metrics API returns no data
      console.error(err);
    } finally {
      setLoading(false);
    }
    await fetchCompanies();
  }, [fetchCompanies]);

  useEffect(() => {
    loadPortfolio();
  }, [loadPortfolio]);

  const handleCompanyClick = async (companyId) => {
    await switchCompany(companyId);
    navigate('/company');
  };

  const filteredPortfolio = portfolio.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (c.industry || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Fall back to companies list if portfolio API returned empty but we have companies
  const displayData = filteredPortfolio.length > 0 ? filteredPortfolio : 
    companies.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase())).map(c => ({
      ...c, healthScore: c.healthScore || 100, metrics: null, prorataStatus: null
    }));

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Portfolio Overview</h1>
          <p className="text-gray-400 mt-2">Manage all your client companies from one centralized hub.</p>
        </div>
        <button className="btn-primary flex items-center gap-2" onClick={() => setShowAddModal(true)}>
          <PlusIcon className="w-5 h-5"/>
          Add Company
        </button>
      </div>

      <div className="relative mb-8">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <BuildingOfficeIcon className="h-5 w-5 text-gray-500" />
        </div>
        <input 
          type="text"
          className="block w-full pl-10 pr-3 py-3 border border-gray-800 rounded-xl leading-5 bg-finledger-charcoal text-gray-300 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-finledger-indigo focus:border-finledger-indigo sm:text-sm shadow-sm transition"
          placeholder="Search companies by name or industry..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="text-center py-20">
          <div className="inline-block w-8 h-8 border-4 border-finledger-indigo/30 border-t-finledger-indigo rounded-full animate-spin mb-4"></div>
          <p className="text-gray-400 font-medium">Loading portfolio intelligence...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayData.map(company => (
            <div 
              key={company._id} 
              className="glass-panel p-6 hover:border-finledger-indigo/50 transition-all cursor-pointer group flex flex-col"
              onClick={() => handleCompanyClick(company._id)}
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-xl font-bold text-white group-hover:text-finledger-indigo transition-colors">{company.name}</h3>
                  <span className="text-xs font-medium px-2.5 py-1 bg-gray-800 text-gray-300 rounded-md mt-2 inline-block shadow-inner border border-gray-700/50">
                    {company.industry || 'Unknown Sector'}
                  </span>
                </div>
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br from-finledger-slate to-gray-800 border border-gray-700 flex items-center justify-center shadow-lg group-hover:shadow-finledger-indigo/20 transition-all`}>
                  <span className={`text-lg font-bold ${company.healthScore >= 70 ? 'text-finledger-emerald' : company.healthScore >= 40 ? 'text-yellow-400' : 'text-finledger-ruby'}`}>{company.healthScore}</span>
                </div>
              </div>

              {/* Metrics summary if available */}
              {company.metrics && (
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-gray-800/50 p-3 rounded-lg border border-gray-700/50">
                    <p className="text-xs text-gray-500 mb-1">Revenue</p>
                    <p className="text-sm font-bold text-white">₹{company.metrics.totalRevenue?.toLocaleString()}</p>
                  </div>
                  <div className="bg-gray-800/50 p-3 rounded-lg border border-gray-700/50">
                    <p className="text-xs text-gray-500 mb-1">Profit</p>
                    <p className={`text-sm font-bold ${company.metrics.profit >= 0 ? 'text-finledger-emerald' : 'text-finledger-ruby'}`}>₹{company.metrics.profit?.toLocaleString()}</p>
                  </div>
                </div>
              )}

              {/* Prorata badge */}
              {company.prorataStatus?.revenue && (
                <div className={`flex items-center gap-2 mb-4 px-3 py-2 rounded-lg text-xs font-bold ${
                  company.prorataStatus.revenue.status === 'AHEAD' 
                    ? 'bg-finledger-emerald/10 text-finledger-emerald border border-finledger-emerald/20' 
                    : 'bg-finledger-ruby/10 text-finledger-ruby border border-finledger-ruby/20'
                }`}>
                  {company.prorataStatus.revenue.status === 'AHEAD' 
                    ? <ArrowTrendingUpIcon className="w-4 h-4"/> 
                    : <ArrowTrendingDownIcon className="w-4 h-4"/>}
                  Revenue {company.prorataStatus.revenue.status} by {company.prorataStatus.revenue.percentage}%
                </div>
              )}

              <div className="mt-auto space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-400 flex items-center gap-1.5">
                    <ExclamationTriangleIcon className={`w-4 h-4 ${company.riskLevel === 'HIGH' ? 'text-finledger-ruby' : 'text-gray-500'}`}/>
                    Risk Level
                  </span>
                  <span className={`font-semibold ${company.riskLevel === 'HIGH' ? 'text-finledger-ruby' : company.riskLevel === 'MEDIUM' ? 'text-yellow-400' : 'text-finledger-emerald'}`}>
                    {company.riskLevel || 'LOW'}
                  </span>
                </div>

                <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden shadow-inner border border-gray-800/50">
                  <div 
                    className={`h-2 rounded-full transition-all duration-1000 ${
                      company.healthScore >= 70 
                        ? 'bg-gradient-to-r from-finledger-emerald to-finledger-indigo shadow-[0_0_10px_rgba(16,185,129,0.5)]'
                        : company.healthScore >= 40 
                          ? 'bg-gradient-to-r from-yellow-400 to-orange-400'
                          : 'bg-gradient-to-r from-finledger-ruby to-red-600'
                    }`}
                    style={{width: `${company.healthScore}%`}}
                  ></div>
                </div>

                <div className="pt-4 border-t border-gray-800 flex justify-between items-center text-xs font-medium">
                  <span className="text-gray-500">Health Score: {company.healthScore}/100</span>
                  <span className="text-finledger-indigo group-hover:translate-x-1 transition-transform flex items-center gap-1">
                    View Dashboard &rarr;
                  </span>
                </div>
              </div>
            </div>
          ))}

          {displayData.length === 0 && !loading && (
            <div className="col-span-full flex flex-col items-center justify-center p-16 glass-panel border-dashed border-2 border-gray-700">
              <div className="w-20 h-20 bg-gray-800/50 rounded-full flex items-center justify-center mb-6 shadow-xl">
                <BuildingOfficeIcon className="w-10 h-10 text-gray-500" />
              </div>
              <p className="text-xl font-bold text-gray-300 mb-2">No Companies Yet</p>
              <p className="text-gray-500 text-center max-w-md mb-8">Begin by adding your first client company to start generating financial intelligence.</p>
              <button className="btn-primary" onClick={() => setShowAddModal(true)}>Connect Company</button>
            </div>
          )}
        </div>
      )}

      {/* Add Company Modal */}
      {showAddModal && (
        <AddCompanyModal 
          onClose={() => setShowAddModal(false)} 
          onCreated={loadPortfolio}
        />
      )}
    </div>
  );
};

export default Dashboard;
