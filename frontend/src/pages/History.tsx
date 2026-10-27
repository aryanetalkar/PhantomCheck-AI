import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  History as HistoryIcon,
  Search,
  Trash2,
  ExternalLink,
  Calendar,
  FileQuestion,
  RefreshCw,
} from 'lucide-react';
import { listInvestigations, deleteInvestigation } from '../services/api';
import { InvestigationSummary } from '../types';
import { VerdictBadge } from '../components/VerdictBadge';

export const History: React.FC = () => {
  const [investigations, setInvestigations] = useState<InvestigationSummary[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadData = (query?: string) => {
    setLoading(true);
    listInvestigations(query)
      .then(setInvestigations)
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadData(search.trim());
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this investigation record?')) return;
    setDeletingId(id);
    try {
      await deleteInvestigation(id);
      setInvestigations((prev) => prev.filter((item) => item.id !== id));
    } catch (err: any) {
      alert('Delete failed: ' + err.message);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2.5">
            <HistoryIcon className="w-6 h-6 text-purple-400" />
            Investigation History
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Local SQLite audit records of past claim analyses and evidence logs.
          </p>
        </div>

        {/* Search bar */}
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative w-full sm:w-72">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search claims or text..."
              className="w-full rounded-xl bg-card border border-border px-3.5 py-2 pl-9 text-xs text-slate-100 placeholder-slate-500 focus:border-purple-500"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          </div>
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition-colors"
          >
            Filter
          </button>
        </form>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-400 text-sm flex items-center justify-center gap-2">
          <RefreshCw className="w-4 h-4 animate-spin text-purple-400" />
          Retrieving historical cases...
        </div>
      ) : investigations.length === 0 ? (
        <div className="p-12 rounded-2xl bg-card border border-dashed border-border text-center space-y-3">
          <FileQuestion className="w-8 h-8 text-slate-500 mx-auto" />
          <h3 className="text-base font-bold text-white">No Investigations Found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {search ? 'No investigations matched your filter term.' : 'You have not scanned any claims yet.'}
          </p>
          <Link
            to="/workspace"
            className="inline-block mt-2 px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-xs font-semibold text-white transition-colors"
          >
            Launch First Investigation
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {investigations.map((inv) => (
            <div
              key={inv.id}
              className="p-5 rounded-xl bg-card border border-border hover:border-slate-700 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2.5">
                  <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                    ID: {inv.id.slice(0, 8)}
                  </span>
                  {inv.verdict_status ? (
                    <VerdictBadge verdict={inv.verdict_status as any} size="sm" />
                  ) : (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-500">
                      In-Progress
                    </span>
                  )}
                  <span className="text-[11px] text-slate-500 flex items-center gap-1 font-mono">
                    <Calendar className="w-3 h-3" />
                    {new Date(inv.created_at).toLocaleString()}
                  </span>
                </div>

                <h3 className="text-sm font-semibold text-white line-clamp-1">
                  {inv.selected_claim_text || inv.raw_input_snippet}
                </h3>

                <div className="text-[11px] text-slate-400 flex items-center gap-3">
                  <span>Claims extracted: {inv.claims_count}</span>
                  <span>•</span>
                  <span>Evidence items: {inv.evidence_count}</span>
                  <span>•</span>
                  <span className="font-mono text-slate-500">Model: {inv.model}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end md:self-center">
                <Link
                  to={`/workspace?id=${inv.id}`}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-purple-400" />
                  Open
                </Link>

                <button
                  onClick={() => handleDelete(inv.id)}
                  disabled={deletingId === inv.id}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950/60 hover:text-rose-400 text-slate-400 transition-colors"
                  title="Delete record"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
