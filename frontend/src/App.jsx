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
import Sidebar from './components/Sidebar';
import { useAuthStore } from './stores/authStore';

const ProtectedRoute = ({ children }) => {
  const user = useAuthStore(state => state.user);
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return (
    <div className="flex bg-finledger-slate min-h-screen">
      <Sidebar />
      <div className="flex-1 ml-64 p-8 overflow-y-auto">
        {children}
      </div>
    </div>
  );
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Pages */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Protected Dashboard Pages */}
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/company" element={<ProtectedRoute><CompanyDashboard /></ProtectedRoute>} />
        <Route path="/calendar" element={<ProtectedRoute><ComplianceCalendar /></ProtectedRoute>} />
        <Route path="/vault" element={<ProtectedRoute><DocumentVault /></ProtectedRoute>} />
        <Route path="/ai-console" element={<ProtectedRoute><AIConsole /></ProtectedRoute>} />
        <Route path="/upload" element={<ProtectedRoute><UploadData /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
