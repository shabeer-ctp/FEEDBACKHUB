import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Lock, User, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await axios.post('/api/admin/login', { username, password });
      login(res.data.token);
      navigate('/admin');
    } catch (err) {
      setError('Invalid username or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden"
      >
        <div className="bg-slate-900 p-8 text-white text-center">
          <div className="w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Lock className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold">Admin Portal</h2>
          <p className="text-slate-400 mt-1">Please sign in to manage feedback</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {error && (
            <div className="p-4 bg-rose-50 border border-rose-100 text-rose-700 rounded-xl flex items-center gap-3 text-sm font-medium">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Username</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                className="w-full bg-slate-50 border border-slate-200 pl-11 pr-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                value={username}
                onChange={e => setUsername(e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="password"
                className="w-full bg-slate-50 border border-slate-200 pl-11 pr-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button 
            disabled={loading}
            className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold hover:bg-slate-800 transition-all disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
