import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  ShieldAlert,
  Search,
  History,
  BookOpen,
  Cpu,
  Ghost,
  CheckCircle2,
  AlertTriangle,
  XCircle,
} from 'lucide-react';
import { fetchAIStatus } from '../services/api';
import { AIStatus } from '../types';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const [aiStatus, setAiStatus] = useState<AIStatus | null>(null);

  useEffect(() => {
    fetchAIStatus()
      .then(setAiStatus)
      .catch(() =>
        setAiStatus({
          status: 'unreachable',
          model: 'gemma4:e2b',
          base_url: 'http://localhost:11434',
          message: 'Offline or unreachable',
        })
      );
  }, [location.pathname]);

  const navLinks = [
    { to: '/', label: 'Dashboard', icon: Ghost },
    { to: '/workspace', label: 'Investigate', icon: Search },
    { to: '/history', label: 'History', icon: History },
    { to: '/how-it-works', label: 'Verification Guide', icon: BookOpen },
    { to: '/status', label: 'Model Status', icon: Cpu },
  ];

  return (
    <nav className="border-b border-border bg-[#0d1322]/80 backdrop-blur-md sticky top-0 z-50 no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Tagline */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-purple-950/60 border border-purple-500/40 flex items-center justify-center text-purple-400 group-hover:border-purple-400 transition-colors shadow-lg shadow-purple-950/40">
              <Ghost className="w-5 h-5" />
            </div>
            <div>
              <div className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-purple-300 via-cyan-200 to-white bg-clip-text text-transparent">
                PhantomCheck AI
              </div>
              <div className="text-[11px] text-slate-400 font-medium tracking-wide">
                Don't Just Believe It. Investigate It.
              </div>
            </div>
          </Link>

          {/* Links */}
          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.to;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-purple-950/50 text-purple-300 border border-purple-500/30'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  <Icon className="w-4 h-4 text-purple-400" />
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* AI Status Badge */}
          <Link
            to="/status"
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all text-xs"
            title="Google Gemma 4 Ollama status"
          >
            {aiStatus?.status === 'ready' && (
              <>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-emerald-300 font-mono font-medium">Gemma 4 Ready</span>
              </>
            )}
            {aiStatus?.status === 'model_missing' && (
              <>
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-amber-300 font-mono font-medium">Model Missing</span>
              </>
            )}
            {aiStatus?.status === 'unreachable' && (
              <>
                <XCircle className="w-3.5 h-3.5 text-rose-400" />
                <span className="text-rose-300 font-mono font-medium">Ollama Offline</span>
              </>
            )}
            {!aiStatus && (
              <span className="text-slate-400 font-mono">Checking AI...</span>
            )}
          </Link>
        </div>
      </div>
    </nav>
  );
};
