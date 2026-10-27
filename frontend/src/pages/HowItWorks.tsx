import React from 'react';
import {
  BookOpen,
  CheckCircle,
  XCircle,
  HelpCircle,
  AlertTriangle,
  Search,
  Calendar,
  Image,
  FileCheck,
  Share2,
  BrainCircuit,
  Eye,
} from 'lucide-react';

export const HowItWorks: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Header */}
      <div className="space-y-3 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-950/70 border border-purple-500/30 text-purple-300 text-xs font-semibold">
          <BookOpen className="w-4 h-4 text-purple-400" />
          Media Literacy & Verification Guide
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          How to Verify a Claim & Understand AI Verdicts
        </h1>
        <p className="text-slate-400 text-sm max-w-2xl mx-auto">
          Forensic principles for debunking viral hoaxes, ghost sightings, and urgent forwarded messages.
        </p>
      </div>

      {/* The 3 Verdicts Defined */}
      <section className="p-6 rounded-2xl bg-card border border-border space-y-6">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <FileCheck className="w-5 h-5 text-purple-400" />
          What the Three Forensic Verdicts Mean
        </h2>

        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30 space-y-1.5">
            <div className="flex items-center gap-2 text-emerald-300 font-bold text-sm">
              <CheckCircle className="w-4 h-4" />
              SUPPORTED
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Substantiated by verified, reliable documentation or official institutional sources submitted during the investigation. The evidence directly backs up the specific assertion without material contradictions.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-500/30 space-y-1.5">
            <div className="flex items-center gap-2 text-rose-300 font-bold text-sm">
              <XCircle className="w-4 h-4" />
              CONTRADICTED
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Directly refuted by reliable factual evidence, official statements, or proven timeline mismatches. Note: sounding supernatural, spooky, or bizarre is NOT proof of contradiction—only empirical disproof justifies this verdict.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/30 space-y-1.5">
            <div className="flex items-center gap-2 text-amber-300 font-bold text-sm">
              <HelpCircle className="w-4 h-4" />
              UNVERIFIED (The Scientific Baseline)
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Insufficient, conflicting, or absent evidence. In media literacy, <strong>absence of evidence is never proof of falsehood</strong>. Fictional ghost stories and unbacked rumors stay UNVERIFIED until empirical evidence is provided.
            </p>
          </div>
        </div>
      </section>

      {/* Static 8-Point Verification Guide */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Eye className="w-5 h-5 text-cyan-400" />
          8 Rules for Fact-Checking Any Suspicious Forward
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-card border border-border space-y-2">
            <span className="text-xs font-mono font-bold text-cyan-400">01. Find the Original Source</span>
            <p className="text-xs text-slate-300">
              Trace the claim back to who originally said it. If it starts with "Forwarded as received" or "A senior doctor told me", treat it with extreme skepticism.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-card border border-border space-y-2">
            <span className="text-xs font-mono font-bold text-cyan-400">02. Check the Date & Context</span>
            <p className="text-xs text-slate-300">
              Old stories from 5 years ago are constantly recycled during crises or holidays. Always confirm the exact timestamp of the occurrence.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-card border border-border space-y-2">
            <span className="text-xs font-mono font-bold text-cyan-400">03. Seek Independent Reporting</span>
            <p className="text-xs text-slate-300">
              If an event actually happened, reputable journalists and multiple independent outlets will report it. If only one obscure blog mentions it, pause.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-card border border-border space-y-2">
            <span className="text-xs font-mono font-bold text-cyan-400">04. Check Official Announcements</span>
            <p className="text-xs text-slate-300">
              For campus closures, exam cancellations, or health alerts, inspect verified registrar portals, dean emails, or police blotters directly.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-card border border-border space-y-2">
            <span className="text-xs font-mono font-bold text-cyan-400">05. Reverse Image Search</span>
            <p className="text-xs text-slate-300">
              Upload alleged ghost photos or accident snapshots to Google Images or TinEye to check if the photo was taken from a film set or old news article.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-card border border-border space-y-2">
            <span className="text-xs font-mono font-bold text-cyan-400">06. Watch for Out-of-Context Media</span>
            <p className="text-xs text-slate-300">
              Real videos often get captioned with fake locations. Check signs, vehicle plates, weather, and language to confirm the location matches.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-card border border-border space-y-2">
            <span className="text-xs font-mono font-bold text-cyan-400">07. Eyewitness vs. Verified Fact</span>
            <p className="text-xs text-slate-300">
              Human memory in high-stress situations is prone to distortion and confirmation bias. Physical evidence and logs always outweigh unverified hearsay.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-card border border-border space-y-2">
            <span className="text-xs font-mono font-bold text-cyan-400">08. Don't Forward Before Checking</span>
            <p className="text-xs text-slate-300">
              The golden rule: never amplify sensational warnings out of panic. Pausing for 60 seconds stops the epidemic of misinformation.
            </p>
          </div>
        </div>
      </section>

      {/* Why AI Can Be Wrong */}
      <section className="p-6 rounded-2xl bg-[#111625] border border-amber-500/30 space-y-3">
        <h2 className="text-base font-bold text-amber-300 flex items-center gap-2">
          <BrainCircuit className="w-5 h-5 text-amber-400" />
          Why AI Analysis Can Be Flawed
        </h2>
        <p className="text-xs text-slate-300 leading-relaxed">
          PhantomCheck AI runs on a local Large Language Model (Google Gemma 4). While powerful at language parsing and schema extraction, AI is not omniscient:
        </p>
        <ul className="list-disc list-inside space-y-1.5 text-xs text-slate-400">
          <li><strong>Garbage in, garbage out:</strong> If the evidence text you paste is fabricated or misleading, the AI’s synthesis may also reflect that limitation.</li>
          <li><strong>No autonomous internet browsing:</strong> The model does not crawl the live internet; it relies exclusively on the evidence you feed it.</li>
          <li><strong>Nuance and satire:</strong> Complex irony, sarcasm, or local cultural folklore can occasionally be misinterpreted. Always use human judgment.</li>
        </ul>
      </section>
    </div>
  );
};
