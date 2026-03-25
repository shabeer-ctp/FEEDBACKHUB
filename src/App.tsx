import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, MessageSquarePlus, ListFilter, Github, LogIn } from 'lucide-react';
import SubmitFeedback from './pages/SubmitFeedback';
import Dashboard from './pages/Dashboard';
import AdminList from './pages/AdminList';
import Login from './pages/Login';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

function Navbar() {
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  
  const navItems = [
    { path: '/', label: 'Submit', icon: <MessageSquarePlus className="w-4 h-4" /> },
    { path: '/dashboard', label: 'Analytics', icon: <LayoutDashboard className="w-4 h-4" /> },
    { path: isAuthenticated ? '/admin' : '/login', label: isAuthenticated ? 'Admin' : 'Login', icon: isAuthenticated ? <ListFilter className="w-4 h-4" /> : <LogIn className="w-4 h-4" /> },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center">
              <span className="text-white font-black text-xl">F</span>
            </div>
            <span className="text-xl font-black text-slate-900 tracking-tighter">FEEDBACKHUB</span>
          </Link>

          <div className="flex items-center gap-1 overflow-x-auto">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-2 px-3 md:px-5 py-2.5 rounded-xl text-xs md:text-sm font-bold transition-all whitespace-nowrap",
                  location.pathname === item.path 
                    ? "bg-slate-900 text-white shadow-lg shadow-slate-200" 
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                )}
              >
                {item.icon}
                {item.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <a 
              href="https://github.com" 
              target="_blank" 
              rel="noreferrer"
              className="p-2.5 text-slate-400 hover:text-slate-900 transition-colors"
            >
              <Github className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
          <Navbar />
          <main>
            <Routes>
              <Route path="/" element={<SubmitFeedback />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/admin" element={<AdminList />} />
              <Route path="/login" element={<Login />} />
            </Routes>
          </main>
          
          <footer className="py-12 border-t border-slate-200 mt-20">
            <div className="max-w-7xl mx-auto px-4 text-center">
              <p className="text-slate-400 text-sm font-medium">
                © 2026 FeedbackHub. Built for excellence.
              </p>
            </div>
          </footer>
        </div>
      </Router>
    </AuthProvider>
  );
}
