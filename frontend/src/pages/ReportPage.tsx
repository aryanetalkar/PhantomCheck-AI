import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Printer,
  ArrowLeft,
  ShieldCheck,
  Calendar,
  Cpu,
  Scale,
  CheckCircle,
  HelpCircle,
  XCircle,
} from 'lucide-react';
import { getReport } from '../services/api';
import { FullReport } from '../types';
import { VerdictBadge } from '../components/VerdictBadge';

export const ReportPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [report, setReport] = useState<FullReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      getReport(id)
        .then(setReport)
        .catch((err) => setError(err.message || 'Failed to load report'))
        .finally(() => setLoading(false));
    }
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-12 text-center text-slate-400 font-mono text-sm">
        Generating forensic report view...
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="max-w-4xl mx-auto p-12 text-center space-y-4">
        <h2 className="text-xl font-bold text-white">Report Not Found</h2>
        <p className="text-sm text-slate-400">{error || 'Investigation report does not exist yet.'}</p>
        <Link
          to={`/workspace?id=${id}`}
          className="inline-block px-4 py-2 rounded-lg bg-purple-600 text-white text-xs font-semibold"
        >
          Return to Workspace
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8 font-sans">
      {/* Action bar (Hidden on print) */}
      <div className="flex items-center justify-between no-print border-b border-border pb-4">
        <Link
          to={`/workspace?id=${id}`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-300 hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Workspace
        </Link>

        <button
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs shadow-md transition-all"
        >
          <Printer className="w-4 h-4" />
          Print / Save as PDF
        </button>
      </div>

      {/* Printable Report Document */}
      <div className="bg-card text-slate-100 p-8 sm:p-12 rounded-2xl border border-border shadow-xl space-y-8 print:p-0 print:border-none print:shadow-none print:bg-white print:text-black">
        {/* Header */}
        <div className="border-b border-slate-700/80 pb-6 print:border-black flex items-start justify-between">
          <div className="space-y-1">
            <div className="text-xs uppercase font-mono font-bold tracking-widest text-purple-400 print:text-purple-700">
              PhantomCheck AI • Forensic Verification Report
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Evidence-Based Assessment
            </h1>
            <p className="text-xs text-slate-400 print:text-slate-600">
              Media-Literacy Claim Dissection & Evidence Evaluation
            </p>
          </div>

          <div className="text-right text-xs font-mono text-slate-400 print:text-slate-700 space-y-1">
            <div>Report ID: {report.investigation_id.slice(0, 8)}</div>
            <div>Timestamp: {new Date(report.timestamp).toLocaleString()}</div>
            <div>Runtime Model: {report.model_name}</div>
          </div>
        </div>

        {/* Original Message */}
        <div className="space-y-2">
          <h2 className="text-xs font-mono font-bold uppercase text-slate-400 print:text-slate-700">
            Original Forwarded Message Analyzed
          </h2>
          <div className="p-4 rounded-xl bg-[#090d16] border border-slate-800 text-xs italic font-mono text-slate-300 print:bg-slate-50 print:border-slate-300 print:text-black">
            "{report.original_message}"
          </div>
        </div>

        {/* Investigated Claim Card */}
        <div className="p-5 rounded-xl bg-purple-950/20 border border-purple-500/30 print:bg-purple-50 print:border-purple-200 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-bold text-purple-400 print:text-purple-800">
              TARGET CLAIM ({report.claim_investigated.category})
            </span>
            <span className="text-[11px] font-mono text-slate-400 print:text-slate-600">
              Checkable: {report.claim_investigated.checkable ? 'Yes (Empirical)' : 'No (Subjective)'}
            </span>
          </div>
          <p className="text-base font-bold text-white print:text-black">
            "{report.claim_investigated.text}"
          </p>
          <div className="text-xs text-slate-400 print:text-slate-600">
            Missing info: {report.claim_investigated.missing_info}
          </div>
        </div>

        {/* Verdict Box */}
        <div className="p-6 rounded-xl bg-[#0c1322] border border-slate-800 print:bg-slate-50 print:border-slate-300 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <span className="text-[10px] font-mono uppercase text-slate-400 print:text-slate-600 block">
                Final Assessment Verdict
              </span>
              <VerdictBadge verdict={report.verdict.verdict} size="lg" />
            </div>
            <div className="text-right">
              <span className="text-[10px] font-mono uppercase text-slate-400 print:text-slate-600 block">
                Forensic Confidence
              </span>
              <span className="text-sm font-bold text-white print:text-black">
                {report.verdict.confidence}
              </span>
            </div>
          </div>

          <p className="text-xs text-slate-200 print:text-slate-800 leading-relaxed">
            <strong>Plain Explanation: </strong>
            {report.verdict.plain_explanation}
          </p>

          <div className="text-xs text-cyan-300 print:text-cyan-800">
            <strong>What would change this conclusion: </strong>
            {report.verdict.what_would_change_conclusion}
          </div>
        </div>

        {/* Evidence Actually Reviewed */}
        <div className="space-y-3">
          <h2 className="text-xs font-mono font-bold uppercase text-slate-400 print:text-slate-700">
            User Evidence Actually Reviewed ({report.evidence_reviewed.length})
          </h2>

          {report.evidence_reviewed.length === 0 ? (
            <p className="text-xs text-slate-500 italic">
              No evidence was submitted by the user. The claim stands evaluated under preliminary unverified baseline.
            </p>
          ) : (
            <div className="space-y-3">
              {report.evidence_reviewed.map((ev, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-[#090d16] border border-slate-800 print:bg-white print:border-slate-200 space-y-1.5"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-white print:text-black">
                      {ev.title}
                    </span>
                    <span className="font-mono text-[10px] uppercase font-bold text-purple-400 print:text-purple-700">
                      Stance: {ev.stance}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 print:text-slate-800">
                    {ev.what_it_says}
                  </p>
                  <p className="text-[11px] italic font-mono text-slate-400 print:text-slate-600">
                    "{ev.short_excerpt}"
                  </p>
                  <p className="text-[10px] text-amber-300 print:text-amber-700">
                    Limitations: {ev.limitations}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Detailed Reasoning */}
        <div className="space-y-2">
          <h2 className="text-xs font-mono font-bold uppercase text-slate-400 print:text-slate-700">
            Objective Reasoning
          </h2>
          <p className="text-xs text-slate-300 print:text-slate-800 leading-relaxed whitespace-pre-line">
            {report.reasoning}
          </p>
        </div>

        {/* Suggested Verification Steps */}
        <div className="space-y-2">
          <h2 className="text-xs font-mono font-bold uppercase text-purple-300 print:text-purple-800">
            Suggested Verification Steps (Separated from Evidence Reviewed)
          </h2>
          <ul className="list-disc list-inside text-xs text-slate-300 print:text-slate-800 space-y-1">
            {report.suggested_verification_steps.map((step, idx) => (
              <li key={idx}>{step}</li>
            ))}
          </ul>
        </div>

        {/* Overarching Limitations */}
        <div className="p-4 rounded-xl bg-[#090d16] border border-slate-800 print:bg-slate-50 print:border-slate-200 space-y-1">
          <span className="text-[10px] font-mono font-bold text-amber-400 print:text-amber-700 uppercase">
            Disclaimers & Limitations
          </span>
          <ul className="list-disc list-inside text-[11px] text-slate-400 print:text-slate-600 space-y-0.5">
            {report.limitations.map((lim, idx) => (
              <li key={idx}>{lim}</li>
            ))}
            <li>This output is an evidence-based assessment, not independent verification.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
