import React from 'react';
import { Link } from 'react-router-dom';
import { BoltIcon } from '@heroicons/react/24/outline';

const PublicNavbar = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#08060D]/80 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 group">
            <span className="text-xl font-bold text-white tracking-tight">
              FinLedger <span className="text-gray-400">Pro</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <Link to="/" className="text-sm text-gray-400 hover:text-white transition font-medium">Home</Link>
            <Link to="/about" className="text-sm text-gray-400 hover:text-white transition font-medium">About Us</Link>
            <a href="#features" className="text-sm text-gray-400 hover:text-white transition font-medium">Features</a>
          </div>

          <div className="flex items-center gap-4">
            <Link to="/login" className="text-sm text-gray-300 hover:text-white transition font-medium px-4 py-2 rounded border border-transparent hover:bg-white/5">
              Sign In
            </Link>
            <Link to="/register" className="btn-primary text-sm !py-2 !px-5">
              Get Started
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default PublicNavbar;
