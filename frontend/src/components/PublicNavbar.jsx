import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ShieldCheckIcon } from '@heroicons/react/24/outline';
import { useAuthStore } from '../stores/authStore';

const PublicNavbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const handleFeaturesClick = (e) => {
    e.preventDefault();
    if (location.pathname === '/') {
      // Already on homepage — smooth scroll to #features
      const el = document.getElementById('features');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    } else {
      // Navigate to homepage first, then scroll
      navigate('/');
      setTimeout(() => {
        const el = document.getElementById('features');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 300);
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#08060D]/80 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 group">
            <ShieldCheckIcon className="w-6 h-6 text-finledger-indigo group-hover:text-finledger-electric transition-colors" />
            <span className="text-xl font-bold text-white tracking-tight">
              FinLedger <span className="text-gray-400">Pro</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <Link to="/" className={`text-sm font-medium transition ${location.pathname === '/' ? 'text-white' : 'text-gray-400 hover:text-white'}`}>Home</Link>
            <Link to="/about" className={`text-sm font-medium transition ${location.pathname === '/about' ? 'text-white' : 'text-gray-400 hover:text-white'}`}>About Us</Link>
            <a href="#features" onClick={handleFeaturesClick} className="text-sm text-gray-400 hover:text-white transition font-medium cursor-pointer">Features</a>
          </div>

          <div className="flex items-center gap-4">
            {user ? (
              <Link to={user.role === 'CLIENT' ? "/client-dashboard" : "/dashboard"} className="btn-primary text-sm !py-2 !px-5">
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link to="/login" className="text-sm text-gray-300 hover:text-white transition font-medium px-4 py-2 rounded-lg border border-transparent hover:bg-white/5">
                  Sign In
                </Link>
                <Link to="/register" className="btn-primary text-sm !py-2 !px-5">
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default PublicNavbar;
