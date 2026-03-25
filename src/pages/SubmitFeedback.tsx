import React, { useState } from 'react';
import axios from 'axios';
import { MessageSquare, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';

export default function SubmitFeedback() {
  const [form, setForm] = useState({ name: '', email: '', product: '', category: 'general', message: '' });
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('submitting');
    try {
      await axios.post('/api/feedback', form);
      setStatus('success');
      setForm({ name: '', email: '', product: '', category: 'general', message: '' });
      setTimeout(() => setStatus('idle'), 3000);
    } catch (error) {
      console.error(error);
      setStatus('error');
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100"
      >
        <div className="bg-slate-900 p-8 text-white">
          <div className="flex items-center gap-3 mb-2">
            <MessageSquare className="w-6 h-6 text-blue-400" />
            <h2 className="text-2xl font-bold">Share Your Feedback</h2>
          </div>
          <p className="text-slate-400">Help us improve our products with your valuable insights.</p>
        </div>

        <div className="p-8">
          {status === 'success' && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-8 p-4 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-xl flex items-center gap-3"
            >
              <CheckCircle2 className="w-5 h-5" />
              <p className="font-medium">Feedback submitted successfully! Thank you.</p>
            </motion.div>
          )}

          {status === 'error' && (
            <div className="mb-8 p-4 bg-rose-50 border border-rose-100 text-rose-700 rounded-xl flex items-center gap-3">
              <AlertCircle className="w-5 h-5" />
              <p className="font-medium">Something went wrong. Please try again.</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Your Name</label>
                <input 
                  className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" 
                  placeholder="John Doe" 
                  value={form.name} 
                  onChange={e => setForm({...form, name: e.target.value})} 
                  required 
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Email (Optional)</label>
                <input 
                  type="email"
                  className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" 
                  placeholder="john@example.com" 
                  value={form.email} 
                  onChange={e => setForm({...form, email: e.target.value})} 
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Product Name</label>
                <input 
                  className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" 
                  placeholder="e.g. Mobile App" 
                  value={form.product} 
                  onChange={e => setForm({...form, product: e.target.value})} 
                  required 
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Category</label>
                <select 
                  className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none appearance-none" 
                  value={form.category} 
                  onChange={e => setForm({...form, category: e.target.value})}
                >
                  <option value="general">General Feedback</option>
                  <option value="bug">Bug Report</option>
                  <option value="feature request">Feature Request</option>
                  <option value="complaint">Complaint</option>
                  <option value="praise">Praise</option>
                </select>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Your Comments</label>
              <textarea 
                className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl h-40 focus:ring-2 focus:ring-blue-500 outline-none resize-none" 
                placeholder="Tell us what's on your mind..." 
                value={form.message} 
                onChange={e => setForm({...form, message: e.target.value})} 
                required 
              />
            </div>

            <button 
              disabled={status === 'submitting'}
              className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold hover:bg-slate-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {status === 'submitting' ? 'Submitting...' : 'Send Feedback'}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
