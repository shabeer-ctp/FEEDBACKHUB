import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { TrendingUp, MessageSquare, Bug, Lightbulb, AlertTriangle } from 'lucide-react';
import { motion } from 'motion/react';

interface Stats {
  total: number;
  by_category: { bug: number; "feature request": number; general: number; complaint: number; praise: number };
  by_sentiment: { positive: number; neutral: number; negative: number };
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [summary, setSummary] = useState<string>('');

  useEffect(() => {
    axios.get('/api/stats').then(res => setStats(res.data));
    axios.get('/api/summary').then(res => setSummary(res.data.summary));
  }, []);

  if (!stats) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900"></div>
    </div>
  );

  const categoryData = [
    { name: 'Bugs', value: stats.by_category.bug || 0, color: '#ef4444' },
    { name: 'Features', value: stats.by_category["feature request"] || 0, color: '#3b82f6' },
    { name: 'General', value: stats.by_category.general || 0, color: '#64748b' },
    { name: 'Complaints', value: stats.by_category.complaint || 0, color: '#f59e0b' },
    { name: 'Praise', value: stats.by_category.praise || 0, color: '#10b981' },
  ];

  const sentimentData = [
    { name: 'Positive', value: stats.by_sentiment.positive || 0, color: '#10b981' },
    { name: 'Neutral', value: stats.by_sentiment.neutral || 0, color: '#94a3b8' },
    { name: 'Negative', value: stats.by_sentiment.negative || 0, color: '#f43f5e' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-12">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">ANALYTICS</h1>
          <p className="text-slate-500 mt-2">Real-time insights from customer feedback.</p>
        </div>
        <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-full text-sm font-bold border border-emerald-100">
          <TrendingUp className="w-4 h-4" />
          LIVE UPDATES
        </div>
      </div>

      {summary && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 p-8 bg-blue-900 text-white rounded-3xl shadow-xl relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <TrendingUp className="w-32 h-32" />
          </div>
          <div className="relative z-10">
            <h3 className="text-blue-300 font-bold uppercase tracking-widest text-xs mb-3">AI Intelligence Summary</h3>
            <p className="text-xl font-medium leading-relaxed">{summary}</p>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        <StatCard title="Total Feedback" value={stats.total} icon={<MessageSquare className="w-6 h-6" />} color="bg-slate-900" />
        <StatCard title="Bugs Reported" value={stats.by_category.bug} icon={<Bug className="w-6 h-6" />} color="bg-rose-600" />
        <StatCard title="Feature Requests" value={stats.by_category["feature request"]} icon={<Lightbulb className="w-6 h-6" />} color="bg-blue-600" />
        <StatCard title="Negative Sentiment" value={stats.by_sentiment.negative} icon={<AlertTriangle className="w-6 h-6" />} color="bg-amber-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100"
        >
          <h3 className="text-xl font-bold mb-8 flex items-center gap-2">
            <span className="w-2 h-8 bg-blue-600 rounded-full"></span>
            Category Distribution
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100"
        >
          <h3 className="text-xl font-bold mb-8 flex items-center gap-2">
            <span className="w-2 h-8 bg-emerald-500 rounded-full"></span>
            Sentiment Breakdown
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={sentimentData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {sentimentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-6 mt-4">
            {sentimentData.map((item) => (
              <div key={item.name} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                <span className="text-sm font-medium text-slate-600">{item.name}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, color }: { title: string, value: number, icon: React.ReactNode, color: string }) {
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-4"
    >
      <div className={`${color} p-4 rounded-2xl text-white shadow-lg`}>
        {icon}
      </div>
      <div>
        <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">{title}</p>
        <p className="text-3xl font-black text-slate-900">{value}</p>
      </div>
    </motion.div>
  );
}
