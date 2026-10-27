import React, { useState, useEffect } from 'react';
import {
  Cpu,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Terminal,
  Copy,
  RefreshCw,
} from 'lucide-react';
import { fetchAIStatus } from '../services/api';
import { AIStatus } from '../types';

export const ModelStatus: React.FC = () => {
  const [status, setStatus] = useState<AIStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState<string | null>(null);

  const checkStatus = () => {
    setLoading(true);
    fetchAIStatus()
      .then(setStatus)
      .catch((err) => {
        setStatus({
          status: 'unreachable',
          model: 'gemma4:e2b',
          base_url: 'http://localhost:11434',
          message: 'Unable to reach backend or Ollama server.',
        });
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    checkStatus();
  }, []);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(text);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2.5">
            <Cpu className="w-6 h-6 text-purple-400" />
            AI Runtime Status
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Google Gemma 4 running locally via Ollama HTTP API (No cloud / no external telemetry).
          </p>
        </div>

        <button
          onClick={checkStatus}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh Status
        </button>
      </div>

      {/* Main Status Box */}
      <div className="p-6 rounded-2xl bg-card border border-border space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            {status?.status === 'ready' && (
              <div className="w-12 h-12 rounded-xl bg-emerald-950 border border-emerald-500/50 flex items-center justify-center text-emerald-400">
                <CheckCircle2 className="w-6 h-6" />
              </div>
            )}
            {status?.status === 'model_missing' && (
              <div className="w-12 h-12 rounded-xl bg-amber-950 border border-amber-500/50 flex items-center justify-center text-amber-400">
                <AlertTriangle className="w-6 h-6" />
              </div>
            )}
            {status?.status === 'unreachable' && (
              <div className="w-12 h-12 rounded-xl bg-rose-950 border border-rose-500/50 flex items-center justify-center text-rose-400">
                <XCircle className="w-6 h-6" />
              </div>
            )}

            <div>
              <div className="text-xs font-mono text-slate-400 uppercase tracking-wider">
                Overall State
              </div>
              <div className="text-lg font-bold text-white">
                {status?.status === 'ready' && 'Ready & Operational'}
                {status?.status === 'model_missing' && 'Ollama Running — Model Missing'}
                {status?.status === 'unreachable' && 'Ollama Daemon Unreachable'}
                {!status && 'Checking connection...'}
              </div>
            </div>
          </div>

          <div className="text-right text-xs font-mono text-slate-400 space-y-1">
            <div>
              Model Target: <strong className="text-purple-300">{status?.model || 'gemma4:e2b'}</strong>
            </div>
            <div>
              Endpoint: <strong className="text-cyan-300">{status?.base_url || 'http://localhost:11434'}</strong>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#0b101c] border border-slate-800 text-xs text-slate-300">
          <strong>Diagnostic Output: </strong>
          {status?.message}
        </div>
      </div>

      {/* Quick Setup Commands for Windows */}
      <div className="p-6 rounded-2xl bg-card border border-border space-y-4">
        <h2 className="text-sm font-bold text-white flex items-center gap-2">
          <Terminal className="w-4 h-4 text-purple-400" />
          Windows Setup & Verification Instructions
        </h2>

        <div className="space-y-3">
          <div>
            <div className="text-xs text-slate-400 mb-1">
              1. Check Ollama Version (PowerShell or CMD):
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-[#0b101c] border border-slate-800 font-mono text-xs text-slate-200">
              <code>ollama --version</code>
              <button
                onClick={() => copyToClipboard('ollama --version')}
                className="text-slate-400 hover:text-white"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div>
            <div className="text-xs text-slate-400 mb-1">
              2. Pull Google Gemma 4 (PowerShell or CMD):
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-[#0b101c] border border-slate-800 font-mono text-xs text-slate-200">
              <code>ollama pull gemma4:e2b</code>
              <button
                onClick={() => copyToClipboard('ollama pull gemma4:e2b')}
                className="text-slate-400 hover:text-white"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div>
            <div className="text-xs text-slate-400 mb-1">
              3. Run and Warm-up Gemma 4:
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-[#0b101c] border border-slate-800 font-mono text-xs text-slate-200">
              <code>ollama run gemma4:e2b</code>
              <button
                onClick={() => copyToClipboard('ollama run gemma4:e2b')}
                className="text-slate-400 hover:text-white"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {copied && (
          <div className="text-xs text-emerald-400 font-mono">
            ✓ Copied "{copied}" to clipboard!
          </div>
        )}
      </div>
    </div>
  );
};
