import React from 'react';
import { Target, Layers, Clock, GraduationCap, Play, Loader2, GitCompare, Sparkles } from 'lucide-react';

export default function ActiveJobCard({
  job,
  onBatchScreen,
  isScreening,
  selectedForCompare,
  onOpenCompare
}) {
  if (!job) return null;

  const requiredSkills = Array.isArray(job.required_skills) ? job.required_skills : [];
  const niceSkills = Array.isArray(job.nice_to_have_skills) ? job.nice_to_have_skills : [];

  return (
    <div className="glass-panel rounded-2xl p-6 mb-6 border-indigo-500/20 relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute -right-20 -top-20 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
        
        {/* Left info */}
        <div className="flex-1 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-1 text-xs font-semibold uppercase tracking-wider rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5" />
              Active Job Profile
            </span>
            <span className="px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-800 text-slate-300 border border-slate-700">
              {job.department}
            </span>
            <span className="px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-800 text-slate-300 border border-slate-700 flex items-center gap-1">
              <Clock className="w-3 h-3 text-slate-400" />
              Min. {job.min_years_experience || 3}+ Years Exp
            </span>
            <span className="px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-800 text-slate-300 border border-slate-700 flex items-center gap-1">
              <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
              {job.education_requirement ? job.education_requirement.slice(0, 32) + '...' : 'Degree Required'}
            </span>
          </div>

          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {job.title}
            </h2>
            <p className="text-sm text-slate-300 mt-1 line-clamp-2 leading-relaxed">
              {job.description}
            </p>
          </div>

          {/* Required Skills & Nice to have */}
          <div className="flex flex-wrap items-center gap-y-2 gap-x-4 pt-1">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-xs font-semibold text-indigo-300 mr-1">Required:</span>
              {requiredSkills.map(skill => (
                <span
                  key={skill}
                  className="px-2 py-0.5 text-xs font-medium bg-indigo-500/15 text-indigo-200 border border-indigo-500/30 rounded-md"
                >
                  {skill}
                </span>
              ))}
            </div>

            {niceSkills.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-xs font-semibold text-slate-400 mr-1">Bonus:</span>
                {niceSkills.map(skill => (
                  <span
                    key={skill}
                    className="px-2 py-0.5 text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700/60 rounded-md"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Action Buttons */}
        <div className="flex flex-row lg:flex-col items-center sm:items-end justify-between gap-3 shrink-0">
          
          <button
            onClick={() => onBatchScreen(job.id)}
            disabled={isScreening}
            className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 active:scale-95 disabled:opacity-50 text-white font-semibold text-sm rounded-xl shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-2.5 transition-all"
          >
            {isScreening ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Screening All Candidates...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-emerald-300" />
                <span>1-Click AI Batch Screen</span>
              </>
            )}
          </button>

          {selectedForCompare.length >= 2 && (
            <button
              onClick={onOpenCompare}
              className="px-4 py-2 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 text-xs font-semibold rounded-xl flex items-center gap-2 transition animate-pulse"
            >
              <GitCompare className="w-4 h-4" />
              Compare Selected ({selectedForCompare.length})
            </button>
          )}

        </div>

      </div>
    </div>
  );
}
