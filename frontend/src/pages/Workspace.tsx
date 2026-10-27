import React, { useState, useEffect } from 'react';
import { useSearchParams, useLocation, useNavigate } from 'react-router-dom';
import {
  Search,
  FileSearch,
  UploadCloud,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  ExternalLink,
  Plus,
  RefreshCw,
  Printer,
  ShieldAlert,
  Flame,
  Scale,
  Sparkles,
} from 'lucide-react';
import {
  scanText,
  addEvidence,
  analyzeInvestigation,
  getInvestigation,
  fetchAIStatus,
} from '../services/api';
import {
  InvestigationDetail,
  Claim,
  AIStatus,
  EvidenceEvaluation,
} from '../types';
import { VerdictBadge } from '../components/VerdictBadge';

export const Workspace: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [rawText, setRawText] = useState<string>('');
  const [investigation, setInvestigation] = useState<InvestigationDetail | null>(null);
  const [selectedClaimId, setSelectedClaimId] = useState<string>('');
  const [aiStatus, setAiStatus] = useState<AIStatus | null>(null);

  // Loading & Error States
  const [scanning, setScanning] = useState(false);
  const [addingEvidence, setAddingEvidence] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Evidence Form States
  const [evidenceTitle, setEvidenceTitle] = useState('');
  const [evidenceUrl, setEvidenceUrl] = useState('');
  const [evidenceText, setEvidenceText] = useState('');
  const [evidenceNotes, setEvidenceNotes] = useState('');

  // Handle URL ID or router state prefill
  useEffect(() => {
    fetchAIStatus().then(setAiStatus).catch(() => null);

    const invId = searchParams.get('id');
    if (invId) {
      getInvestigation(invId)
        .then((data) => {
          setInvestigation(data);
          setRawText(data.raw_input);
          if (data.selected_claim_id) {
            setSelectedClaimId(data.selected_claim_id);
          } else if (data.claims.length > 0) {
            setSelectedClaimId(data.claims[0].id);
          }
        })
        .catch((err) => {
          setErrorMessage('Could not load investigation: ' + err.message);
        });
    } else if (location.state && (location.state as any).prefillText) {
      setRawText((location.state as any).prefillText);
    }
  }, [searchParams, location.state]);

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rawText.trim()) return;

    setScanning(true);
    setErrorMessage(null);

    try {
      const data = await scanText(rawText);
      setInvestigation(data);
      if (data.selected_claim_id) {
        setSelectedClaimId(data.selected_claim_id);
      } else if (data.claims.length > 0) {
        setSelectedClaimId(data.claims[0].id);
      }
      setSearchParams({ id: data.id });
    } catch (err: any) {
      setErrorMessage(err.message || 'Scan failed.');
    } finally {
      setScanning(false);
    }
  };

  const handleAddEvidence = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!investigation) return;
    if (!evidenceTitle.trim() || !evidenceText.trim()) return;

    setAddingEvidence(true);
    setErrorMessage(null);

    try {
      const updated = await addEvidence(investigation.id, {
        title: evidenceTitle.trim(),
        source_url: evidenceUrl.trim() || undefined,
        text: evidenceText.trim(),
        notes: evidenceNotes.trim() || undefined,
      });
      setInvestigation(updated);
      setEvidenceTitle('');
      setEvidenceUrl('');
      setEvidenceText('');
      setEvidenceNotes('');
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to add evidence.');
    } finally {
      setAddingEvidence(false);
    }
  };

  const handleAnalyze = async () => {
    if (!investigation || !selectedClaimId) return;

    setAnalyzing(true);
    setErrorMessage(null);

    try {
      const updated = await analyzeInvestigation(investigation.id, selectedClaimId);
      setInvestigation(updated);
    } catch (err: any) {
      setErrorMessage(err.message || 'Analysis failed.');
    } finally {
      setAnalyzing(false);
    }
  };

  const selectedClaim = investigation?.claims.find((c) => c.id === selectedClaimId);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Top Banner / Error alert */}
      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-950/70 border border-rose-500/40 text-rose-200 text-sm flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <strong className="font-semibold">Investigation Alert: </strong>
            <span>{errorMessage}</span>
            {aiStatus?.status !== 'ready' && (
              <div className="mt-2 text-xs text-rose-300 font-mono">
                Hint: Make sure Ollama is running and Gemma 4 model is pulled ({aiStatus?.install_command || 'ollama run gemma4:e2b'}).
              </div>
            )}
          </div>
        </div>
      )}

      {/* STEP 1: Scanner Section */}
      <section className="rounded-2xl p-6 bg-card border border-border shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-purple-950/60 border border-purple-500/30 flex items-center justify-center text-purple-400 font-mono font-bold text-sm">
              01
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">
                Suspicious Forward / Rumor Scanner
              </h2>
              <p className="text-xs text-slate-400">
                Paste any forwarded message, viral post, or claim (up to 5,000 characters).
              </p>
            </div>
          </div>
          {investigation && (
            <button
              onClick={() => {
                setInvestigation(null);
                setRawText('');
                setSearchParams({});
              }}
              className="text-xs text-slate-400 hover:text-white px-2.5 py-1 rounded bg-slate-800 transition-colors"
            >
              Start Fresh
            </button>
          )}
        </div>

        <form onSubmit={handleScan} className="space-y-4">
          <div className="relative">
            <textarea
              rows={4}
              maxLength={5000}
              disabled={scanning || analyzing}
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              placeholder="Paste forwarded WhatsApp/Telegram message, campus rumor, ghost sighting post, or news snippet here..."
              className="w-full rounded-xl bg-[#0b101c] border border-slate-800 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 p-4 text-sm text-slate-100 placeholder-slate-500 transition-all font-mono leading-relaxed"
            />
            <div className="absolute bottom-3 right-4 text-[11px] font-mono text-slate-500">
              {rawText.length}/5000
            </div>
          </div>

          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="text-xs text-slate-400 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
              Gemma 4 will extract checkable claims vs. sensational rhetoric.
            </div>

            <button
              type="submit"
              disabled={scanning || !rawText.trim()}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-semibold text-sm shadow-md transition-all"
            >
              {scanning ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Gemma 4 Analyzing Claims...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  Scan & Extract Claims
                </>
              )}
            </button>
          </div>
        </form>

        {/* Sensational wording flag display */}
        {investigation && investigation.sensational_wording.length > 0 && (
          <div className="p-3.5 rounded-xl bg-purple-950/20 border border-purple-500/20 text-xs space-y-1.5">
            <div className="flex items-center gap-1.5 text-purple-300 font-semibold">
              <Flame className="w-4 h-4 text-amber-400" />
              Sensational Rhetoric Detected ({investigation.sensational_wording.length})
            </div>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {investigation.sensational_wording.map((word, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded-md bg-purple-900/40 border border-purple-500/30 text-purple-200 font-mono text-[11px]"
                >
                  "{word}"
                </span>
              ))}
            </div>
            <p className="text-[11px] text-slate-400 pt-1">
              *Media-literacy rule: Sensational or alarming wording is persuasive rhetoric, <strong>not evidence of falsehood</strong>.
            </p>
          </div>
        )}
      </section>

      {/* STEP 2: Claim Cards (Target Selection) */}
      {investigation && (
        <section className="rounded-2xl p-6 bg-card border border-border shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-cyan-950/60 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-mono font-bold text-sm">
                02
              </div>
              <div>
                <h2 className="text-lg font-bold text-white tracking-tight">
                  Extracted Claims: Select Target for Investigation
                </h2>
                <p className="text-xs text-slate-400">
                  Media-literacy rule: <strong>Never give multiple claims one bundled verdict.</strong> Select one claim to test.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {investigation.claims.map((claim) => {
              const isSelected = selectedClaimId === claim.id;
              return (
                <div
                  key={claim.id}
                  onClick={() => setSelectedClaimId(claim.id)}
                  className={`cursor-pointer rounded-xl p-5 border transition-all relative flex flex-col justify-between ${
                    isSelected
                      ? 'bg-purple-950/30 border-purple-500 glow-purple ring-1 ring-purple-500'
                      : 'bg-[#0c1220] border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                        {claim.category}
                      </span>
                      {claim.is_main ? (
                        <span className="text-[10px] font-bold tracking-wider px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-500/40 text-cyan-300">
                          MAIN ASSERTION
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono text-slate-500">
                          SECONDARY CLAIM
                        </span>
                      )}
                    </div>

                    <h3 className="text-sm font-semibold text-white leading-snug">
                      "{claim.text}"
                    </h3>

                    {/* Entities / Dates */}
                    {claim.entities_and_dates.length > 0 && (
                      <div className="text-[11px] text-slate-400 flex flex-wrap items-center gap-1">
                        <span className="text-slate-500 font-mono">Entities/Dates:</span>
                        {claim.entities_and_dates.map((e, idx) => (
                          <span
                            key={idx}
                            className="bg-slate-900 px-1.5 py-0.5 rounded text-slate-300 font-mono text-[10px]"
                          >
                            {e}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Missing info */}
                    <div className="text-xs text-amber-300/90 bg-amber-950/20 p-2.5 rounded-lg border border-amber-900/30">
                      <span className="font-semibold">Missing Info: </span>
                      {claim.missing_info}
                    </div>

                    {/* Verification paths */}
                    {claim.ways_to_verify.length > 0 && (
                      <div className="text-xs text-slate-400 space-y-1">
                        <span className="text-slate-500 font-semibold text-[11px]">Ways to verify:</span>
                        <ul className="list-disc list-inside space-y-0.5 text-[11px] text-slate-300">
                          {claim.ways_to_verify.map((w, idx) => (
                            <li key={idx}>{w}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  <div className="pt-4 border-t border-slate-800/60 mt-4 flex items-center justify-between">
                    <span className="text-[11px] font-mono text-slate-400">
                      Verifiable: {claim.checkable ? '✓ Empirically Checkable' : '✕ Subjective / Unfalsifiable'}
                    </span>
                    <span
                      className={`text-xs font-semibold px-2.5 py-1 rounded ${
                        isSelected
                          ? 'bg-purple-600 text-white'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {isSelected ? '✓ Selected for Verdict' : 'Select Claim'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* STEP 3: User Evidence Section */}
      {investigation && selectedClaim && (
        <section className="rounded-2xl p-6 bg-card border border-border shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-950/60 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-mono font-bold text-sm">
                03
              </div>
              <div>
                <h2 className="text-lg font-bold text-white tracking-tight">
                  User-Provided Evidence Vault
                </h2>
                <p className="text-xs text-slate-400">
                  Label: <strong>User-provided evidence</strong>. Supply articles, official statements, eyewitness logs, or notes to test the claim.
                </p>
              </div>
            </div>
            <span className="text-xs text-emerald-400 font-mono font-medium">
              {investigation.evidence.length} items logged
            </span>
          </div>

          {/* URL Note Disclaimer */}
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-400 flex items-start gap-2">
            <ShieldAlert className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <span>
              <strong>Note on URLs:</strong> Direct URL retrieval is intentionally unavailable in local sandboxed environments. Gemma 4 evaluates only the pasted text you provide and will never claim a URL was visited.
            </span>
          </div>

          {/* Add Evidence Form */}
          <form
            onSubmit={handleAddEvidence}
            className="p-5 rounded-xl bg-[#0c1220] border border-slate-800 space-y-4"
          >
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Plus className="w-4 h-4 text-purple-400" />
              Add Evidence Item
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Evidence Title *
                </label>
                <input
                  type="text"
                  required
                  value={evidenceTitle}
                  onChange={(e) => setEvidenceTitle(e.target.value)}
                  placeholder="e.g. Campus Police Incident Log, Official Registrar Bulletin"
                  className="w-full rounded-lg bg-[#080d16] border border-slate-800 px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Source Reference / URL (Optional)
                </label>
                <input
                  type="text"
                  value={evidenceUrl}
                  onChange={(e) => setEvidenceUrl(e.target.value)}
                  placeholder="e.g. https://university.edu/announcements/402"
                  className="w-full rounded-lg bg-[#080d16] border border-slate-800 px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:border-purple-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Pasted Evidence Text * (What does the source say?)
              </label>
              <textarea
                rows={3}
                required
                value={evidenceText}
                onChange={(e) => setEvidenceText(e.target.value)}
                placeholder="Paste the relevant paragraph, quote, email, or report excerpt..."
                className="w-full rounded-lg bg-[#080d16] border border-slate-800 p-3 text-xs text-slate-100 placeholder-slate-500 focus:border-purple-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Your Notes / Context (Optional)
              </label>
              <input
                type="text"
                value={evidenceNotes}
                onChange={(e) => setEvidenceNotes(e.target.value)}
                placeholder="e.g. Obtained from notice board outside Dean's office at 2 PM"
                className="w-full rounded-lg bg-[#080d16] border border-slate-800 px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:border-purple-500"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={addingEvidence || !evidenceTitle.trim() || !evidenceText.trim()}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors disabled:opacity-50"
              >
                {addingEvidence ? 'Saving...' : 'Add to Evidence Vault'}
              </button>
            </div>
          </form>

          {/* List of Evidence Items */}
          {investigation.evidence.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-xs font-mono font-semibold text-slate-400 uppercase tracking-wider">
                Submitted User Evidence ({investigation.evidence.length})
              </h4>
              <div className="space-y-2">
                {investigation.evidence.map((evi) => (
                  <div
                    key={evi.id}
                    className="p-4 rounded-xl bg-[#0b101c] border border-slate-800 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white text-xs">
                          {evi.title}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                          User-provided evidence
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-500">
                        {evi.id}
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 italic border-l-2 border-purple-500/60 pl-3 py-1 font-mono">
                      "{evi.text}"
                    </p>

                    {(evi.source_url || evi.notes) && (
                      <div className="text-[11px] text-slate-400 flex flex-wrap gap-4 pt-1">
                        {evi.source_url && (
                          <span className="flex items-center gap-1">
                            URL: <code className="text-cyan-300">{evi.source_url}</code>
                          </span>
                        )}
                        {evi.notes && (
                          <span>Notes: {evi.notes}</span>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 4 Trigger Button */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-between flex-wrap gap-4">
            <div className="text-xs text-slate-400">
              Target Claim: <strong className="text-purple-300">"{selectedClaim.text}"</strong>
              <div className="text-[11px] text-slate-500">
                {investigation.evidence.length === 0
                  ? 'Proceeding with 0 evidence will yield a preliminary UNVERIFIED verdict.'
                  : `Evaluating with ${investigation.evidence.length} user-supplied evidence item(s).`}
              </div>
            </div>

            <button
              onClick={handleAnalyze}
              disabled={analyzing}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white font-bold text-sm shadow-lg shadow-purple-600/20 transition-all"
            >
              {analyzing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Gemma 4 Evaluating Evidence & Synthesizing Verdict...
                </>
              ) : (
                <>
                  <Scale className="w-4 h-4" />
                  Run Forensic Verdict & Report
                </>
              )}
            </button>
          </div>
        </section>
      )}

      {/* STEP 4 & 5: Verdict & Report Presentation */}
      {investigation && investigation.verdict && investigation.report && (
        <section className="rounded-2xl p-6 sm:p-8 bg-card border border-purple-500/40 glow-purple shadow-2xl space-y-8">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-950 border border-purple-500/50 flex items-center justify-center text-purple-400">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-extrabold text-white">
                  Media-Literacy Forensic Verdict & Report
                </h2>
                <div className="text-xs text-slate-400 font-mono">
                  Runtime: Google Gemma 4 (via local Ollama) • Investigation #{investigation.id.slice(0, 8)}
                </div>
              </div>
            </div>

            <button
              onClick={() => navigate(`/report/${investigation.id}`)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
            >
              <Printer className="w-4 h-4" />
              Print / Save PDF
            </button>
          </div>

          {/* Verdict Hero Card */}
          <div className="p-6 rounded-xl bg-gradient-to-br from-[#0c1322] to-[#121a2e] border border-slate-800 space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block mb-1">
                  Target Claim Evaluated
                </span>
                <h3 className="text-base sm:text-lg font-bold text-white">
                  "{investigation.verdict.claim_text}"
                </h3>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <span className="text-[10px] uppercase font-mono text-slate-400 block">
                    Confidence Level
                  </span>
                  <span className="text-xs font-bold text-slate-200">
                    {investigation.verdict.confidence}
                  </span>
                </div>
                <VerdictBadge verdict={investigation.verdict.verdict} size="lg" />
              </div>
            </div>

            <div className="p-4 rounded-lg bg-[#090e18] border border-slate-800/80 text-sm text-slate-200 leading-relaxed">
              <strong className="text-purple-300">Plain Explanation: </strong>
              {investigation.verdict.plain_explanation}
            </div>
          </div>

          {/* Evidence Evaluations Breakdown */}
          {investigation.evidence_evaluations.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Scale className="w-4 h-4 text-cyan-400" />
                Gemma 4 Evidence Breakdown (Per User Item)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {investigation.evidence_evaluations.map((ev) => (
                  <div
                    key={ev.evidence_id}
                    className="p-4 rounded-xl bg-[#0b101c] border border-slate-800 space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">
                        {ev.title}
                      </span>
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded font-mono ${
                          ev.stance === 'supports'
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-600/40'
                            : ev.stance === 'contradicts'
                            ? 'bg-rose-950 text-rose-300 border border-rose-600/40'
                            : 'bg-amber-950 text-amber-300 border border-amber-600/40'
                        }`}
                      >
                        {ev.stance}
                      </span>
                    </div>

                    <p className="text-xs text-slate-300">
                      <strong>Assertion:</strong> {ev.what_it_says}
                    </p>

                    <div className="text-[11px] text-slate-400 italic bg-slate-900/60 p-2 rounded font-mono">
                      "{ev.short_excerpt}"
                    </div>

                    <div className="text-[11px] text-amber-300/80">
                      <strong>Limitations:</strong> {ev.limitations}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* In-depth reasoning and what would change conclusion */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-5 rounded-xl bg-[#0b101c] border border-slate-800 space-y-2">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                Forensic Reasoning & Evidentiary Gaps
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">
                {investigation.report.reasoning}
              </p>
            </div>

            <div className="p-5 rounded-xl bg-[#0b101c] border border-slate-800 space-y-2">
              <h4 className="text-xs font-bold text-cyan-300 uppercase tracking-wider font-mono">
                What Would Change This Conclusion?
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                {investigation.verdict.what_would_change_conclusion}
              </p>
            </div>
          </div>

          {/* Suggested Verification Steps */}
          <div className="p-5 rounded-xl bg-purple-950/20 border border-purple-500/20 space-y-3">
            <h4 className="text-xs font-bold text-purple-300 uppercase tracking-wider font-mono">
              Suggested Independent Verification Steps (Separated from Reviewed Evidence)
            </h4>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300">
              {investigation.report.suggested_verification_steps.map((step, idx) => (
                <li key={idx} className="flex items-start gap-2 bg-[#0d1322] p-2.5 rounded-lg border border-slate-800">
                  <span className="text-cyan-400 font-bold font-mono">0{idx + 1}.</span>
                  <span>{step}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </div>
  );
};
