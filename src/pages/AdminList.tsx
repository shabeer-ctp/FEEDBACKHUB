import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Trash2, AlertCircle, Filter, Search, ChevronDown, Download, LogOut, User } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

interface Feedback {
  id: number;
  name: string;
  email: string;
  product: string;
  category: string;
  message: string;
  sentiment: string;
  is_urgent: number;
  created_at: string;
}

export default function AdminList() {
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [filter, setFilter] = useState('');
  const [sentimentFilter, setSentimentFilter] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const { token, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    fetchFeedback();
  }, [filter, sentimentFilter, isAuthenticated]);

  const fetchFeedback = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filter) params.append('category', filter);
      if (sentimentFilter) params.append('sentiment', sentimentFilter);
      if (search) params.append('search', search);

      const res = await axios.get(`/api/feedback?${params.toString()}`);
      setFeedback(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this feedback?')) return;
    try {
      await axios.delete(`/api/admin/feedback/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFeedback(feedback.filter(f => f.id !== id));
    } catch (error) {
      console.error(error);
    }
  };

  const handleExport = async (format: 'csv' | 'json') => {
    try {
      const response = await axios.get(`/api/export/${format}`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `feedback_export.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Export failed', error);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">ADMIN PANEL</h1>
          <p className="text-slate-500 mt-2">Manage and analyze customer submissions.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button 
            onClick={() => handleExport('csv')}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold hover:bg-slate-50 transition-all shadow-sm"
          >
            <Download className="w-4 h-4" />
            CSV
          </button>
          <button 
            onClick={() => handleExport('json')}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold hover:bg-slate-50 transition-all shadow-sm"
          >
            <Download className="w-4 h-4" />
            JSON
          </button>
          <button 
            onClick={logout}
            className="flex items-center gap-2 px-4 py-2 bg-rose-50 text-rose-600 border border-rose-100 rounded-xl text-sm font-bold hover:bg-rose-100 transition-all"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </div>

      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 mb-8 flex flex-wrap items-center gap-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Search by name, product or message..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && fetchFeedback()}
          />
        </div>

        <select 
          className="px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-medium"
          value={filter}
          onChange={e => setFilter(e.target.value)}
        >
          <option value="">All Categories</option>
          <option value="bug">Bugs</option>
          <option value="feature request">Features</option>
          <option value="general">General</option>
          <option value="complaint">Complaints</option>
          <option value="praise">Praise</option>
        </select>

        <select 
          className="px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-medium"
          value={sentimentFilter}
          onChange={e => setSentimentFilter(e.target.value)}
        >
          <option value="">All Sentiments</option>
          <option value="positive">Positive</option>
          <option value="neutral">Neutral</option>
          <option value="negative">Negative</option>
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          <AnimatePresence mode="popLayout">
            {feedback.map((item) => (
              <motion.div 
                key={item.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 relative group"
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-3 mb-4">
                      <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                        <User className="w-4 h-4 text-slate-400" />
                        {item.name}
                        {item.email && <span className="text-slate-400 font-medium text-xs">({item.email})</span>}
                      </div>
                      <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-bold uppercase tracking-wider">
                        {item.category}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                        item.sentiment === 'positive' ? 'bg-emerald-50 text-emerald-600' :
                        item.sentiment === 'negative' ? 'bg-rose-50 text-rose-600' :
                        'bg-slate-50 text-slate-500'
                      }`}>
                        {item.sentiment}
                      </span>
                      {item.is_urgent === 1 && (
                        <span className="px-3 py-1 bg-amber-50 text-amber-600 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          Urgent
                        </span>
                      )}
                      <span className="text-slate-400 text-xs font-medium ml-auto md:ml-0">
                        {new Date(item.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    
                    <h3 className="text-xl font-bold text-slate-900 mb-2">{item.product}</h3>
                    <p className="text-slate-600 leading-relaxed">{item.message}</p>
                  </div>

                  <button 
                    onClick={() => handleDelete(item.id)}
                    className="p-3 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all md:opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {feedback.length === 0 && (
            <div className="text-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
              <p className="text-slate-400 font-medium">No feedback found matching your criteria.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
