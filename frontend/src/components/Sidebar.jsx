import React, { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { 
  ChartBarIcon, BuildingOfficeIcon, BoltIcon, 
  ArrowUpOnSquareIcon, ArrowLeftEndOnRectangleIcon,
  Cog6ToothIcon, CalendarDaysIcon, ArchiveBoxIcon,
  ShieldCheckIcon, SparklesIcon, ChevronDownIcon, BellAlertIcon,
  TableCellsIcon, CalculatorIcon, DocumentCheckIcon, BanknotesIcon
} from '@heroicons/react/24/outline';

const Sidebar = () => {
  const { user, companies, activeCompanyId, logout, fetchCompanies, switchCompany } = useAuthStore();
  const navigate = useNavigate();
  const [isCompanyOpen, setIsCompanyOpen] = useState(false);

  useEffect(() => { if (user) fetchCompanies(); }, [user]);

  const handleLogout = async () => { await logout(); navigate('/login'); };

  const activeCompany = (Array.isArray(companies) ? companies : []).find(c => c._id === activeCompanyId);

  return (
    <div className="fixed top-0 left-0 h-full w-64 bg-[#0D0B14] border-r border-white/[0.06] flex flex-col pt-6 pb-4 text-gray-400 shadow-2xl z-50">
      
      {/* Brand */}
      <div className="px-6 pb-5 border-b border-white/[0.06]">
        <div className="flex items-center gap-2.5 group cursor-pointer" onClick={() => navigate('/')}>
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-finledger-indigo to-finledger-electric flex items-center justify-center shadow-lg shadow-finledger-indigo/20 group-hover:shadow-finledger-indigo/40 transition-all duration-300 group-hover:scale-105">
            <ShieldCheckIcon className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white tracking-tight">
              FinLedger <span className="text-finledger-indigo">Pro</span>
            </h1>
            <p className="text-[9px] text-gray-600 font-mono uppercase tracking-[0.2em] -mt-0.5">AI OS for CAs</p>
          </div>
        </div>
      </div>

      {/* Company Switcher — Redesigned as dropdown card */}
      <div className="px-4 py-4 border-b border-white/[0.06]">
        <p className="text-[10px] uppercase tracking-[0.15em] font-semibold text-gray-600 mb-2 px-2">Workspace</p>
        <div className="relative">
          <button
            onClick={() => setIsCompanyOpen(!isCompanyOpen)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] hover:border-white/10 transition-all duration-200 group"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-finledger-indigo/20 to-finledger-electric/20 border border-finledger-indigo/20 flex items-center justify-center shrink-0">
              <BuildingOfficeIcon className="w-4 h-4 text-finledger-indigo" />
            </div>
            <div className="flex-1 text-left min-w-0">
              <div className="text-sm font-medium text-white truncate">
                {activeCompany?.name || 'Select Company'}
              </div>
              {activeCompany?.industry && (
                <div className="text-[10px] text-gray-500 truncate">{activeCompany.industry}</div>
              )}
            </div>
            <ChevronDownIcon className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${isCompanyOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Dropdown */}
          {isCompanyOpen && companies.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-[#0D0B14] border border-white/10 rounded-xl shadow-2xl shadow-black/50 z-50 py-1 max-h-48 overflow-y-auto animate-fade-in">
              {(Array.isArray(companies) ? companies : []).map(company => (
                <button
                  key={company._id}
                  onClick={() => { switchCompany(company._id); setIsCompanyOpen(false); }}
                  className={`w-full text-left px-3 py-2 flex items-center gap-3 hover:bg-white/[0.05] transition-colors ${
                    company._id === activeCompanyId ? 'bg-finledger-indigo/10' : ''
                  }`}
                >
                  <div className={`w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold ${
                    company._id === activeCompanyId 
                      ? 'bg-finledger-indigo text-white' 
                      : 'bg-white/5 text-gray-500'
                  }`}>
                    {company.name?.charAt(0)}
                  </div>
                  <span className={`text-sm truncate ${company._id === activeCompanyId ? 'text-white font-medium' : 'text-gray-400'}`}>
                    {company.name}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto px-3 py-4 flex flex-col gap-0.5">
        <p className="text-[10px] uppercase tracking-[0.15em] font-semibold text-gray-600 mb-2 px-3">Main</p>
        
        {user?.role === 'CLIENT' ? (
          <NavItem to="/client-dashboard" icon={<BuildingOfficeIcon className="w-[18px] h-[18px]"/>} label="Client Portal" />
        ) : (
          <NavItem to="/dashboard" icon={<BuildingOfficeIcon className="w-[18px] h-[18px]"/>} label="Portfolio" />
        )}

        {user?.role !== 'CLIENT' && (
          <>
            <NavItem to="/company" icon={<ChartBarIcon className="w-[18px] h-[18px]"/>} label="Command Center" />
            <NavItem to="/ai-console" icon={<SparklesIcon className="w-[18px] h-[18px]"/>} label="AI Console" badge="AI" />
            <NavItem to="/upload" icon={<ArrowUpOnSquareIcon className="w-[18px] h-[18px]"/>} label="Data Ingestion" />
          </>
        )}
        
        <div className="my-3 mx-3 border-t border-white/[0.04]" />
        <p className="text-[10px] uppercase tracking-[0.15em] font-semibold text-gray-600 mb-2 px-3">Tools</p>
        
        <NavItem to="/calendar" icon={<CalendarDaysIcon className="w-[18px] h-[18px]"/>} label="Compliance" />
        <NavItem to="/vault" icon={<ArchiveBoxIcon className="w-[18px] h-[18px]"/>} label="Document Vault" />
        <NavItem to="/gst" icon={<DocumentCheckIcon className="w-[18px] h-[18px]"/>} label="GST Returns" badge="Tax" />
        <NavItem to="/ledger" icon={<TableCellsIcon className="w-[18px] h-[18px]"/>} label="Ledger" />
        <NavItem to="/ratios" icon={<CalculatorIcon className="w-[18px] h-[18px]"/>} label="Ratios" />
        <NavItem to="/yoy" icon={<ChartBarIcon className="w-[18px] h-[18px]"/>} label="YoY Comparison" />
        <NavItem to="/audit" icon={<ShieldCheckIcon className="w-[18px] h-[18px]"/>} label="Audit Trail" />
        <NavItem to="/billing" icon={<BanknotesIcon className="w-[18px] h-[18px]"/>} label="Client Billing" badge="New" />
        {user?.role !== 'CLIENT' && <NavItem to="/alerts" icon={<BellAlertIcon className="w-[18px] h-[18px]"/>} label="Alerts Inbox" badge="New" />}
        
        {user?.role !== 'CLIENT' && (
          <>
            <div className="my-3 mx-3 border-t border-white/[0.04]" />
            <NavItem to="/settings" icon={<Cog6ToothIcon className="w-[18px] h-[18px]"/>} label="Settings" />
          </>
        )}
      </div>

      {/* AI Status indicator */}
      <div className="px-4 py-3 border-t border-white/[0.06]">
        <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-finledger-indigo/[0.06] border border-finledger-indigo/10">
          <div className="relative">
            <BoltIcon className="w-4 h-4 text-finledger-indigo" />
            <div className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
          </div>
          <div className="flex-1">
            <div className="text-[10px] font-semibold text-finledger-indigo">Groq Engine</div>
            <div className="text-[9px] text-gray-500 font-mono">llama-3-70b • online</div>
          </div>
        </div>
      </div>

      {/* User Info */}
      <div className="px-4 pt-3 border-t border-white/[0.06]">
        <div className="flex items-center gap-3 px-2 py-1.5 rounded-xl hover:bg-white/[0.03] transition-all group cursor-default">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-finledger-indigo to-finledger-electric flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-finledger-indigo/10">
            {user?.name?.charAt(0)}
          </div>
          <div className="flex flex-col flex-1 min-w-0">
            <span className="text-sm font-semibold text-gray-200 truncate">{user?.name}</span>
            <span className="text-[10px] text-finledger-indigo font-medium">{user?.role || 'CA Professional'}</span>
          </div>
          <button 
            onClick={handleLogout} 
            className="text-gray-600 hover:text-rose-400 transition-colors p-1.5 rounded-lg hover:bg-rose-500/10" 
            title="Logout"
          >
            <ArrowLeftEndOnRectangleIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

const NavItem = ({ to, icon, label, badge }) => (
  <NavLink 
    to={to} 
    end={to === '/dashboard'}
    className={({ isActive }) => 
      `flex items-center gap-3 px-3 py-2 rounded-xl font-medium text-sm transition-all duration-200 group ${
        isActive 
          ? 'bg-white/[0.06] text-white shadow-sm border border-white/[0.06]' 
          : 'text-gray-500 hover:bg-white/[0.03] hover:text-gray-300'
      }`
    }
  >
    <span className="group-hover:text-finledger-indigo transition-colors">{icon}</span>
    <span className="flex-1">{label}</span>
    {badge && (
      <span className="text-[9px] font-bold bg-finledger-indigo/15 text-finledger-indigo px-1.5 py-0.5 rounded-md border border-finledger-indigo/20">
        {badge}
      </span>
    )}
  </NavLink>
);

export default Sidebar;
