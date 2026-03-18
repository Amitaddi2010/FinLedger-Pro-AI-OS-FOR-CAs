import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import AboutUs from './pages/AboutUs';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import CompanyDashboard from './pages/CompanyDashboard';
import AIConsole from './pages/AIConsole';
import UploadData from './pages/UploadData';
import Settings from './pages/Settings';
import ComplianceCalendar from './pages/ComplianceCalendar';
import DocumentVault from './pages/DocumentVault';
import ExecutiveReport from './pages/ExecutiveReport';
import AlertsInbox from './pages/AlertsInbox';
import ClientDashboard from './pages/ClientDashboard';
import LedgerExplorer from './pages/LedgerExplorer';
import FinancialRatios from './pages/FinancialRatios';
import GstIntelligence from './pages/GstIntelligence';
import YoYComparison from './pages/YoYComparison';
import AuditTrail from './pages/AuditTrail';
import ClientBilling from './pages/ClientBilling';
import Sidebar from './components/Sidebar';
import { useAuthStore } from './stores/authStore';

const ProtectedRoute = ({ children }) => {
  const user = useAuthStore(state => state.user);
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return (
    <div className="flex bg-[#08060D] min-h-screen">
      <Sidebar />
      <div className="flex-1 ml-64 p-8 overflow-y-auto">
        {children}
      </div>
    </div>
  );
};

const RoleRedirect = () => {
  const user = useAuthStore(state => state.user);
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'CLIENT') return <Navigate to="/client-dashboard" replace />;
  return <Dashboard />;
};

function App() {
  const { checkAuth, checkingAuth, user } = useAuthStore();

  React.useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (checkingAuth) {
    return (
      <div className="flex bg-[#08060D] items-center justify-center min-h-screen">
        <div className="w-10 h-10 border-4 border-white/20 border-t-finledger-indigo rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* Public Pages */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />
        <Route path="/register" element={user ? <Navigate to="/" replace /> : <Register />} />
        
        {/* Protected Dashboard Pages */}
        <Route path="/dashboard" element={<ProtectedRoute><RoleRedirect /></ProtectedRoute>} />
        <Route path="/client-dashboard" element={<ProtectedRoute><ClientDashboard /></ProtectedRoute>} />
        <Route path="/company" element={<ProtectedRoute><CompanyDashboard /></ProtectedRoute>} />
        <Route path="/calendar" element={<ProtectedRoute><ComplianceCalendar /></ProtectedRoute>} />
        <Route path="/vault" element={<ProtectedRoute><DocumentVault /></ProtectedRoute>} />
        <Route path="/ai-console" element={<ProtectedRoute><AIConsole /></ProtectedRoute>} />
        <Route path="/upload" element={<ProtectedRoute><UploadData /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
        <Route path="/report" element={<ProtectedRoute><ExecutiveReport /></ProtectedRoute>} />
        <Route path="/alerts" element={<ProtectedRoute><AlertsInbox /></ProtectedRoute>} />
        <Route path="/ledger" element={<ProtectedRoute><LedgerExplorer /></ProtectedRoute>} />
        <Route path="/ratios" element={<ProtectedRoute><FinancialRatios /></ProtectedRoute>} />
        <Route path="/gst" element={<ProtectedRoute><GstIntelligence /></ProtectedRoute>} />
        <Route path="/yoy" element={<ProtectedRoute><YoYComparison /></ProtectedRoute>} />
        <Route path="/audit" element={<ProtectedRoute><AuditTrail /></ProtectedRoute>} />
        <Route path="/billing" element={<ProtectedRoute><ClientBilling /></ProtectedRoute>} />
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
