import React from 'react';
import { X, CheckCircle2, XCircle, Award, Briefcase, ThumbsUp, AlertTriangle } from 'lucide-react';

export default function CandidateComparisonModal({
  candidates,
  selectedJob,
  onClose,
  onStatusChange,
  onSelectCandidate
}) {
  if (!candidates || candidates.length < 2) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-6xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl shadow-black/80 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
          <div>
            <span className="px-2 py-0.5 text-xs font-semibold uppercase tracking-wider rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Side-by-Side Matrix
            </span>
            <h2 className="text-2xl font-extrabold text-white mt-1">
              Comparing {candidates.length} Candidates for {selectedJob?.title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Comparison Grid */}
        <div className="p-6 overflow-x-auto overflow-y-auto">
          <div className="grid grid-flow-col auto-cols-[340px] sm:auto-cols-[380px] gap-4 min-w-full">
            {candidates.map((c) => {
              const name = c.candidate_name || c.name;
              const fit = c.fit_score || 0;
              const matched = c.matched_skills || [];
              const missing = c.missing_skills || [];
              const strengths = c.strengths || [];
              const weaknesses = c.weaknesses || [];

              return (
                <div key={c.id || c.candidate_id} className="bg-slate-850 border border-slate-750 rounded-xl p-5 flex flex-col justify-between space-y-4">
                  
                  {/* Top Card Info */}
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="text-lg font-bold text-white">{name}</h3>
                        <p className="text-xs text-slate-400 font-mono">{c.candidate_email || c.email}</p>
                      </div>
                      <span className="px-2.5 py-1 text-xs font-bold font-mono rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
                        {fit} / 10
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-3">
                      <div className="flex justify-between text-xs text-slate-400 mb-1">
                        <span>Match Level</span>
                        <span className="font-mono font-bold text-white">{c.match_percentage || 0}%</span>
                      </div>
                      <div className="w-full bg-slate-800 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-indigo-500 to-emerald-400 h-full rounded-full"
                          style={{ width: `${c.match_percentage || 0}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Experience & Education */}
                  <div className="space-y-2 py-2 border-y border-slate-800 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Total Experience:</span>
                      <span className="font-mono font-bold text-white">{c.total_years_experience || 2}+ Years</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Current Status:</span>
                      <span className="font-semibold text-emerald-400">{c.status || 'Under Review'}</span>
                    </div>
                  </div>

                  {/* Matched Skills */}
                  <div>
                    <h5 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1 mb-2">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Matched Skills ({matched.length})
                    </h5>
                    <div className="flex flex-wrap gap-1">
                      {matched.map(s => (
                        <span key={s} className="px-2 py-0.5 text-[11px] font-medium bg-emerald-500/15 text-emerald-200 border border-emerald-500/30 rounded">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Missing Skills */}
                  <div>
                    <h5 className="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1 mb-2">
                      <XCircle className="w-3.5 h-3.5" /> Missing Requirements ({missing.length})
                    </h5>
                    <div className="flex flex-wrap gap-1">
                      {missing.length > 0 ? (
                        missing.map(s => (
                          <span key={s} className="px-2 py-0.5 text-[11px] font-medium bg-rose-500/15 text-rose-200 border border-rose-500/30 rounded">
                            {s}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-slate-500 italic">None (Full Coverage)</span>
                      )}
                    </div>
                  </div>

                  {/* Strengths */}
                  {strengths.length > 0 && (
                    <div>
                      <h5 className="text-xs font-bold uppercase tracking-wider text-indigo-300 flex items-center gap-1 mb-1.5">
                        <ThumbsUp className="w-3.5 h-3.5" /> Key Strengths
                      </h5>
                      <ul className="text-xs text-slate-300 space-y-1">
                        {strengths.slice(0, 2).map((st, i) => (
                          <li key={i} className="line-clamp-2">• {st}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                    <button
                      onClick={() => onStatusChange(c.id || c.candidate_id, 'Shortlisted')}
                      className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg transition"
                    >
                      ★ Shortlist
                    </button>
                    <button
                      onClick={() => onSelectCandidate(c)}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg transition"
                    >
                      Full Profile
                    </button>
                  </div>

                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
