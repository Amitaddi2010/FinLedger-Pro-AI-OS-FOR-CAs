import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuthStore } from '../stores/authStore';
import { BoltIcon, UserPlusIcon } from '@heroicons/react/24/outline';

const Register = () => {
  const navigate = useNavigate();
  const login = useAuthStore(state => state.login);
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await api.post('/auth/register', { name, email, password });
      // Auto-login after registration
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Failed to register');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-finledger-slate px-4 relative overflow-hidden">
      
      {/* Background Ornaments */}
      <div className="absolute top-[-10%] right-[-10%] w-[40rem] h-[40rem] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[30rem] h-[30rem] bg-finledger-indigo/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="glass-panel p-10 max-w-md w-full relative z-10">
        <div className="text-center mb-10">
          <div className="mx-auto w-16 h-16 bg-gray-900 rounded-2xl border border-gray-700 flex items-center justify-center mb-6 shadow-xl">
            <UserPlusIcon className="w-10 h-10 text-finledger-indigo" />
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-white mb-2">Create Account</h2>
          <p className="text-gray-400 text-sm">Set up your FinLedger Pro workspace.</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {error && <div className="text-red-400 bg-red-900/20 px-4 py-3 rounded-lg text-sm border border-red-900/50">{error}</div>}
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5 ml-1">Full Name</label>
            <input 
              type="text" 
              className="w-full bg-gray-800/50 border border-gray-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-finledger-indigo/50 transition-all placeholder-gray-500"
              placeholder="CA Jane Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5 ml-1">Email</label>
            <input 
              type="email" 
              className="w-full bg-gray-800/50 border border-gray-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-finledger-indigo/50 transition-all placeholder-gray-500"
              placeholder="jane@ca-firm.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5 ml-1">Password</label>
            <input 
              type="password" 
              className="w-full bg-gray-800/50 border border-gray-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-finledger-indigo/50 transition-all placeholder-gray-500"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full btn-primary mt-4"
          >
            {loading ? 'Creating Workspace...' : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-gray-500 text-sm mt-8">
          Already have an account? <Link to="/login" className="text-finledger-indigo hover:underline font-medium">Sign In</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
