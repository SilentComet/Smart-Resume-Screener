import React from 'react';
import { 
  User, Briefcase, GraduationCap, MapPin, CheckCircle2, 
  XCircle, ChevronRight, Sparkles, AlertCircle, ArrowUpRight 
} from 'lucide-react';

export default function CandidateCard({
  candidate,
  onSelect,
  onStatusChange,
  isSelectedForCompare,
  onToggleCompare,
  onScreenSingle,
  isScreening
}) {
  const {
    candidate_name,
    candidate_email,
    candidate_location,
    total_years_experience,
    fit_score,
    match_percentage,
    status = 'Under Review',
    justification,
    matched_skills = [],
    missing_skills = [],
    candidate_skills = []
  } = candidate;

  // Determine score color theme
  const getScoreTheme = (score) => {
    if (score >= 8.5) return { text: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', glow: 'glow-emerald', label: 'Exceptional Fit' };
    if (score >= 7.0) return { text: 'text-indigo-400', bg: 'bg-indigo-500/10', border: 'border-indigo-500/30', glow: 'glow-indigo', label: 'Strong Fit' };
    if (score >= 5.0) return { text: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30', glow: 'glow-amber', label: 'Moderate Fit' };
    return { text: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/30', glow: 'glow-rose', label: 'Low Fit / Gaps' };
  };

  const theme = getScoreTheme(fit_score || 0);

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
    <div className={`glass-panel glass-panel-hover rounded-2xl p-5 relative flex flex-col justify-between transition-all duration-200 ${isSelectedForCompare ? 'ring-2 ring-emerald-500/80 border-emerald-500/50' : ''}`}>
      
      {/* Top row: Checkbox, Name, Status */}
      <div>
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            {/* Compare Checkbox */}
            <input
              type="checkbox"
              checked={isSelectedForCompare}
              onChange={() => onToggleCompare(candidate)}
              className="w-4 h-4 rounded text-indigo-600 bg-slate-800 border-slate-700 focus:ring-indigo-500/50 cursor-pointer"
              title="Select for head-to-head comparison"
            />
            <div>
              <h3 
                onClick={() => onSelect(candidate)}
                className="font-bold text-lg text-white hover:text-indigo-400 transition cursor-pointer flex items-center gap-1.5"
              >
                {candidate_name || candidate.name || 'Candidate'}
                <ArrowUpRight className="w-3.5 h-3.5 text-slate-500" />
              </h3>
              <p className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                <span>{candidate_email || candidate.email || 'Email provided'}</span>
                {candidate_location && (
                  <>
                    <span>•</span>
                    <span className="flex items-center gap-0.5 text-slate-400">
                      <MapPin className="w-3 h-3 text-slate-500" />
                      {candidate_location}
                    </span>
                  </>
                )}
              </p>
            </div>
          </div>

          {/* Status Dropdown */}
          <select
            value={status}
            onChange={(e) => onStatusChange(candidate.id || candidate.candidate_id, e.target.value)}
            onClick={(e) => e.stopPropagation()}
            className={`text-xs font-semibold px-2.5 py-1 rounded-lg border appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500/50 ${getStatusBadge(status)}`}
          >
            <option value="Under Review" className="bg-slate-900 text-slate-100">Under Review</option>
            <option value="Shortlisted" className="bg-slate-900 text-emerald-400">★ Shortlisted</option>
            <option value="Interview Scheduled" className="bg-slate-900 text-purple-400">Interview Scheduled</option>
            <option value="Rejected" className="bg-slate-900 text-rose-400">Rejected</option>
          </select>
        </div>

        {/* Score & Match Highlight Bento */}
        {fit_score !== undefined && fit_score !== null ? (
          <div className={`my-3 p-3 rounded-xl border ${theme.border} ${theme.bg} flex items-center justify-between`}>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-slate-900/80 border border-white/10 flex flex-col items-center justify-center">
                <span className={`text-base font-extrabold font-mono ${theme.text}`}>
                  {fit_score}
                </span>
                <span className="text-[9px] text-slate-500 font-bold uppercase tracking-tighter">/ 10</span>
              </div>
              <div>
                <span className={`text-xs font-bold uppercase tracking-wide ${theme.text}`}>
                  {theme.label}
                </span>
                <p className="text-xs text-slate-300 font-mono">
                  {match_percentage}% Semantic Match
                </p>
              </div>
            </div>

            <div className="text-right">
              <span className="text-xs text-slate-400 font-medium">Experience</span>
              <p className="text-sm font-bold text-white font-mono">
                {total_years_experience || candidate.total_years_experience || 2}+ Yrs
              </p>
            </div>
          </div>
        ) : (
          <div className="my-3 p-3 rounded-xl border border-slate-800 bg-slate-900/50 flex items-center justify-between">
            <span className="text-xs text-slate-400">Not screened for this job yet</span>
            <button
              onClick={() => onScreenSingle(candidate)}
              disabled={isScreening}
              className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg flex items-center gap-1 transition"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Screen Candidate
            </button>
          </div>
        )}

        {/* Matched vs Missing Skills */}
        <div className="space-y-2 my-3">
          {matched_skills.length > 0 && (
            <div className="flex flex-wrap gap-1 items-center">
              <span className="text-[11px] font-semibold text-emerald-400 flex items-center gap-1 mr-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Matched:
              </span>
              {matched_skills.slice(0, 4).map(skill => (
                <span
                  key={skill}
                  className="px-2 py-0.5 text-[11px] font-medium bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 rounded-md"
                >
                  {skill}
                </span>
              ))}
              {matched_skills.length > 4 && (
                <span className="text-[10px] text-emerald-400 font-mono">+{matched_skills.length - 4} more</span>
              )}
            </div>
          )}

          {missing_skills.length > 0 && (
            <div className="flex flex-wrap gap-1 items-center">
              <span className="text-[11px] font-semibold text-rose-400 flex items-center gap-1 mr-1">
                <XCircle className="w-3 h-3 text-rose-400" /> Gaps:
              </span>
              {missing_skills.slice(0, 3).map(skill => (
                <span
                  key={skill}
                  className="px-2 py-0.5 text-[11px] font-medium bg-rose-500/10 text-rose-300 border border-rose-500/20 rounded-md"
                >
                  {skill}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Justification snippet */}
        {justification && (
          <p className="text-xs text-slate-400 line-clamp-2 mt-2 leading-relaxed bg-slate-900/40 p-2.5 rounded-lg border border-slate-800/60 italic">
            "{justification.replace(/\*\*/g, '')}"
          </p>
        )}
      </div>

      {/* Footer / CTA */}
      <div className="pt-3 mt-3 border-t border-slate-800/80 flex items-center justify-between">
        <span className="text-xs text-slate-500 font-mono">
          {candidate_skills.length || candidate.skills?.length || 0} skills indexed
        </span>
        <button
          onClick={() => onSelect(candidate)}
          className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition"
        >
          View Full Breakdown
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

    </div>
  );
}
