import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShieldAlert,
  Ghost,
  Sparkles,
  ArrowRight,
  Flame,
  CheckCircle,
  HelpCircle,
  XCircle,
  FileText,
  AlertTriangle,
} from 'lucide-react';
import { HALLOWEEN_SAMPLES } from '../services/samples';
import { listInvestigations, fetchAIStatus } from '../services/api';
import { InvestigationSummary, AIStatus } from '../types';
import { VerdictBadge } from '../components/VerdictBadge';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [recent, setRecent] = useState<InvestigationSummary[]>([]);
  const [aiStatus, setAiStatus] = useState<AIStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      listInvestigations().catch(() => []),
      fetchAIStatus().catch(() => null),
    ]).then(([historyData, statusData]) => {
      setRecent(historyData.slice(0, 4));
      setAiStatus(statusData);
      setLoading(false);
    });
  }, []);

  const handleLaunchSample = (sampleText: string) => {
    navigate('/workspace', { state: { prefillText: sampleText } });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Hero Section */}
      <div className="relative rounded-2xl p-8 sm:p-12 overflow-hidden bg-gradient-to-br from-card via-[#131b2e] to-[#0b101c] border border-border glow-purple">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-10 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-950/70 border border-purple-500/30 text-purple-300 text-xs font-semibold tracking-wide uppercase">
            <Ghost className="w-4 h-4 text-purple-400" />
            Hackathon PS 1.7 "Fake or Phantom?"
          </div>

          <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
            Don't Just Believe It.{' '}
            <span className="bg-gradient-to-r from-purple-400 via-cyan-300 to-white bg-clip-text text-transparent">
              Investigate It.
            </span>
          </h1>

          <p className="text-slate-300 text-base sm:text-lg leading-relaxed">
            The media-literacy verification engine powered by a local <strong className="text-purple-300">Google Gemma 4</strong> runtime. Dissect viral forwards, separate sensational rhetoric from checkable claims, evaluate user-supplied documentation, and learn forensic verification.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Link
              to="/workspace"
              className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-base shadow-lg shadow-purple-600/25 transition-all transform hover:-translate-y-0.5"
            >
              Start New Investigation
              <ArrowRight className="w-5 h-5" />
            </Link>

            <Link
              to="/how-it-works"
              className="inline-flex items-center gap-2 px-5 py-3.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-200 font-medium text-sm transition-all"
            >
              How Verification Works
            </Link>
          </div>

          {/* Model Status Notice */}
          <div className="pt-2 text-xs text-slate-400 flex items-center gap-2">
            <span className="font-mono text-slate-500">Local AI Engine:</span>
            {aiStatus?.status === 'ready' && (
              <span className="text-emerald-400 flex items-center gap-1 font-medium font-mono">
                ● Connected to {aiStatus.model} via Ollama
              </span>
            )}
            {aiStatus?.status === 'model_missing' && (
              <span className="text-amber-400 flex items-center gap-1 font-medium font-mono">
                ⚠️ Ollama running, run <code className="bg-slate-900 px-1 py-0.5 rounded text-amber-300">{aiStatus.install_command}</code>
              </span>
            )}
            {aiStatus?.status === 'unreachable' && (
              <span className="text-rose-400 flex items-center gap-1 font-medium font-mono">
                ✕ Ollama offline at {aiStatus.base_url} (Local mock testing available)
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Halloween / Fictional Demos Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-purple-950/50 border border-purple-500/20 text-purple-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">
                Halloween Mode: Fictional Test Samples
              </h2>
              <p className="text-xs text-slate-400">
                Four clearly labelled fictional ghost & viral campus rumors that run against the real Gemma 4 model.
              </p>
            </div>
          </div>
          <span className="text-xs px-2.5 py-1 rounded bg-purple-950 border border-purple-500/30 text-purple-300 font-mono font-medium hidden sm:inline-block">
            100% FICTIONAL SAMPLES
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {HALLOWEEN_SAMPLES.map((sample, idx) => (
            <div
              key={sample.id}
              className="group p-5 rounded-xl bg-card border border-border hover:border-purple-500/40 hover:bg-[#131b2e] transition-all flex flex-col justify-between"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-purple-400 font-semibold">
                    SAMPLE 0{idx + 1}
                  </span>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-amber-950/60 border border-amber-600/30 text-amber-300">
                    FICTIONAL DEMO
                  </span>
                </div>
                <h3 className="font-semibold text-white text-base group-hover:text-purple-300 transition-colors">
                  "{sample.preview}"
                </h3>
                <p className="text-slate-400 text-xs line-clamp-2 italic">
                  {sample.fullText}
                </p>
              </div>

              <div className="pt-4 flex items-center justify-between border-t border-slate-800/60 mt-4">
                <span className="text-[11px] text-slate-500 font-medium">
                  Expected: UNVERIFIED (Without Evidence)
                </span>
                <button
                  onClick={() => handleLaunchSample(sample.fullText)}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-cyan-300 hover:text-cyan-200 transition-colors"
                >
                  Load & Investigate
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Forensic Verification Mindset */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="p-6 rounded-xl bg-card border border-border space-y-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-950/60 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <CheckCircle className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-white text-base">SUPPORTED</h3>
          <p className="text-slate-400 text-xs leading-relaxed">
            Directly corroborated by reputable, timestamped documentation or verified official records submitted by the investigator.
          </p>
        </div>

        <div className="p-6 rounded-xl bg-card border border-border space-y-3">
          <div className="w-10 h-10 rounded-lg bg-rose-950/60 border border-rose-500/30 flex items-center justify-center text-rose-400">
            <XCircle className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-white text-base">CONTRADICTED</h3>
          <p className="text-slate-400 text-xs leading-relaxed">
            Conclusively refuted by contradictory official evidence, debunked dates, or proven fabrications. Supernatural tone alone is NOT grounds for contradiction.
          </p>
        </div>

        <div className="p-6 rounded-xl bg-card border border-border space-y-3">
          <div className="w-10 h-10 rounded-lg bg-amber-950/60 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <HelpCircle className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-white text-base">UNVERIFIED (Default)</h3>
          <p className="text-slate-400 text-xs leading-relaxed">
            The scientific forensic baseline: absence of evidence is not proof of falsehood. Rumors and ghost sightings remain UNVERIFIED until verified facts emerge.
          </p>
        </div>
      </div>

      {/* Recent Investigations */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-purple-400" />
            Recent Investigations
          </h2>
          <Link
            to="/history"
            className="text-xs font-semibold text-purple-400 hover:text-purple-300 transition-colors"
          >
            View All History →
          </Link>
        </div>

        {loading ? (
          <div className="p-8 text-center text-slate-500 text-sm">Loading investigations...</div>
        ) : recent.length === 0 ? (
          <div className="p-8 rounded-xl bg-card border border-dashed border-border text-center text-slate-400 text-sm">
            No investigations yet. Paste a claim or click a sample above to begin.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recent.map((inv) => (
              <Link
                key={inv.id}
                to={`/workspace?id=${inv.id}`}
                className="p-5 rounded-xl bg-card border border-border hover:border-slate-700 hover:bg-[#141b2e] transition-all flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono text-slate-500">
                      ID: {inv.id.slice(0, 8)}
                    </span>
                    {inv.verdict_status ? (
                      <VerdictBadge verdict={inv.verdict_status as any} size="sm" />
                    ) : (
                      <span className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                        Evidence Phase
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-medium text-slate-200 line-clamp-2">
                    {inv.selected_claim_text || inv.raw_input_snippet}
                  </p>
                </div>
                <div className="pt-3 text-[11px] text-slate-500 flex items-center justify-between border-t border-slate-800/60 mt-3">
                  <span>Claims: {inv.claims_count} | Evidence: {inv.evidence_count}</span>
                  <span className="font-mono text-purple-400/80">Open Investigation →</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
