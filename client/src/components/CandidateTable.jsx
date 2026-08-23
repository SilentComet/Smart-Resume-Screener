import React from 'react';
import { ArrowUpDown, CheckCircle2, XCircle, ChevronRight, Sparkles } from 'lucide-react';

export default function CandidateTable({
  candidates,
  onSelect,
  onStatusChange,
  selectedForCompare,
  onToggleCompare,
  sortField,
  sortOrder,
  onSort
}) {
  const getScoreBadge = (score) => {
    if (score >= 8.5) return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
    if (score >= 7.0) return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30';
    if (score >= 5.0) return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
    return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
  };

  const getStatusBadge = (st) => {
    switch (st) {
      case 'Shortlisted':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
      case 'Interview Scheduled':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/40';
      case 'Rejected':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
      default:
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
    }
  };

  return (
    <div className="glass-panel rounded-2xl overflow-hidden border-slate-800">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-300">
          <thead className="bg-slate-900/90 text-xs uppercase tracking-wider text-slate-400 border-b border-slate-800 font-semibold">
            <tr>
              <th scope="col" className="p-4 w-4">
                <span className="sr-only">Select</span>
              </th>
              <th scope="col" className="px-6 py-3 cursor-pointer hover:text-white" onClick={() => onSort('name')}>
                <div className="flex items-center gap-1.5">
                  Candidate
                  <ArrowUpDown className="w-3.5 h-3.5" />
                </div>
              </th>
              <th scope="col" className="px-6 py-3 cursor-pointer hover:text-white" onClick={() => onSort('fit_score')}>
                <div className="flex items-center gap-1.5">
                  Fit Score (1-10)
                  <ArrowUpDown className="w-3.5 h-3.5" />
                </div>
              </th>
              <th scope="col" className="px-6 py-3 cursor-pointer hover:text-white" onClick={() => onSort('experience')}>
                <div className="flex items-center gap-1.5">
                  Experience
                  <ArrowUpDown className="w-3.5 h-3.5" />
                </div>
              </th>
              <th scope="col" className="px-6 py-3">
                Key Matched Skills
              </th>
              <th scope="col" className="px-6 py-3">
                Status Pipeline
              </th>
              <th scope="col" className="px-6 py-3 text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {candidates.map((c) => {
              const isSelected = selectedForCompare.some(item => (item.id || item.candidate_id) === (c.id || c.candidate_id));
              return (
                <tr
                  key={c.id || c.candidate_id}
                  className={`hover:bg-slate-800/40 transition duration-150 cursor-pointer ${isSelected ? 'bg-indigo-950/20' : ''}`}
                  onClick={() => onSelect(c)}
                >
                  <td className="p-4" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => onToggleCompare(c)}
                      className="w-4 h-4 rounded text-indigo-600 bg-slate-800 border-slate-700 focus:ring-indigo-500/50 cursor-pointer"
                    />
                  </td>

                  <td className="px-6 py-4">
                    <div className="font-bold text-white text-sm hover:text-indigo-400 transition">
                      {c.candidate_name || c.name}
                    </div>
                    <div className="text-xs text-slate-400 font-mono mt-0.5">
                      {c.candidate_email || c.email || 'Email provided'}
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    {c.fit_score !== undefined && c.fit_score !== null ? (
                      <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-1 rounded-lg border text-sm font-extrabold font-mono ${getScoreBadge(c.fit_score)}`}>
                          {c.fit_score} / 10
                        </span>
                        <span className="text-xs text-slate-400 font-mono font-medium">
                          ({c.match_percentage}%)
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-500 italic">Unscreened</span>
                    )}
                  </td>

                  <td className="px-6 py-4 font-mono text-sm text-slate-200">
                    {c.total_years_experience || c.totalYearsExperience || 2}+ Yrs
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1 max-w-xs">
                      {(c.matched_skills || []).slice(0, 3).map(skill => (
                        <span
                          key={skill}
                          className="px-2 py-0.5 text-[11px] font-medium bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 rounded-md"
                        >
                          {skill}
                        </span>
                      ))}
                      {(c.matched_skills || []).length > 3 && (
                        <span className="text-[10px] text-slate-400 font-mono">
                          +{(c.matched_skills || []).length - 3}
                        </span>
                      )}
                    </div>
                  </td>

                  <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                    <select
                      value={c.status || 'Under Review'}
                      onChange={(e) => onStatusChange(c.id || c.candidate_id, e.target.value)}
                      className={`text-xs font-semibold px-2.5 py-1 rounded-lg border appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500/50 ${getStatusBadge(c.status || 'Under Review')}`}
                    >
                      <option value="Under Review" className="bg-slate-900 text-slate-100">Under Review</option>
                      <option value="Shortlisted" className="bg-slate-900 text-emerald-400">★ Shortlisted</option>
                      <option value="Interview Scheduled" className="bg-slate-900 text-purple-400">Interview Scheduled</option>
                      <option value="Rejected" className="bg-slate-900 text-rose-400">Rejected</option>
                    </select>
                  </td>

                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => onSelect(c)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-indigo-400 hover:text-white transition"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
