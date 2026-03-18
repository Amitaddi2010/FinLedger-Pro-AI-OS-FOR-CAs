import React, { useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { 
  ChartBarIcon, BuildingOfficeIcon, BoltIcon, 
  ArrowUpOnSquareIcon, ArrowLeftEndOnRectangleIcon,
  Cog6ToothIcon, CalendarDaysIcon, ArchiveBoxIcon
} from '@heroicons/react/24/outline';

const Sidebar = () => {
  const { user, companies, activeCompanyId, logout, fetchCompanies, switchCompany } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      fetchCompanies();
    }
  }, [user]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="fixed top-0 left-0 h-full w-64 bg-finledger-charcoal border-r border-gray-800 flex flex-col pt-8 pb-4 text-finledger-silver shadow-2xl z-50">
      
      {/* Brand */}
      <div className="px-6 pb-6 border-b border-gray-800">
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <BoltIcon className="w-8 h-8 text-finledger-emerald" />
          FinLedger <span className="text-finledger-indigo">Pro</span>
        </h1>
        <p className="text-xs text-gray-500 mt-1 pl-10 font-medium tracking-wide">AI OS FOR CAs</p>
      </div>

      {/* Company Switcher */}
      <div className="px-6 py-6 border-b border-gray-800">
        <p className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-2">Active Company</p>
        <select 
          className="w-full bg-gray-900 border border-gray-700 text-sm text-gray-200 rounded-lg p-2.5 outline-none focus:ring-1 focus:ring-finledger-indigo transition"
          value={activeCompanyId || ''}
          onChange={(e) => switchCompany(e.target.value)}
        >
          <option value="" disabled>Select a Company</option>
          {companies.map(company => (
            <option key={company._id} value={company._id}>{company.name}</option>
          ))}
        </select>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto px-4 py-6 flex flex-col gap-2">
        <NavItem to="/dashboard" icon={<BuildingOfficeIcon className="w-5 h-5"/>} label="Portfolio" />
        <NavItem to="/company" icon={<ChartBarIcon className="w-5 h-5"/>} label="Command Center" />
        <NavItem to="/calendar" icon={<CalendarDaysIcon className="w-5 h-5"/>} label="Compliance Calendar" />
        <NavItem to="/vault" icon={<ArchiveBoxIcon className="w-5 h-5"/>} label="Document Vault" />
        <NavItem to="/ai-console" icon={<BoltIcon className="w-5 h-5"/>} label="AI Console" />
        <NavItem to="/upload" icon={<ArrowUpOnSquareIcon className="w-5 h-5"/>} label="Data Ingestion" />
        
        <div className="my-4 border-t border-gray-800" />
        
        <NavItem to="/settings" icon={<Cog6ToothIcon className="w-5 h-5"/>} label="Settings" />
      </div>

      {/* Footer / User Info */}
      <div className="px-6 pt-4 border-t border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-finledger-emerald to-finledger-indigo flex items-center justify-center text-white font-bold">
            {user?.name?.charAt(0)}
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-gray-200">{user?.name}</span>
            <span className="text-xs text-finledger-indigo font-medium">{user?.role}</span>
          </div>
          <button onClick={handleLogout} className="ml-auto text-gray-400 hover:text-white transition group" title="Logout">
            <ArrowLeftEndOnRectangleIcon className="w-5 h-5 group-hover:scale-110 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
};

// Internal Sub-component for nav items
const NavItem = ({ to, icon, label }) => (
  <NavLink 
    to={to} 
    end={to === '/dashboard'}
    className={({ isActive }) => 
      `flex items-center gap-3 px-4 py-2.5 rounded-lg font-medium transition-all duration-200 ${
        isActive 
          ? 'bg-finledger-indigo/20 text-finledger-indigo shadow-inner border border-finledger-indigo/10' 
          : 'text-gray-400 hover:bg-gray-800/50 hover:text-gray-200'
      }`
    }
  >
    {icon}
    <span>{label}</span>
  </NavLink>
);

export default Sidebar;
