import React from 'react';
import { Users, UserCheck, Award, AlertTriangle, TrendingUp, Sparkles } from 'lucide-react';

export default function StatBento({ stats, selectedJob }) {
  const {
    totalCandidates = 0,
    totalScreened = 0,
    shortlistedCount = 0,
    avgFitScore = '0.0',
    avgMatchPct = 0,
    topMissingSkills = []
  } = stats || {};

  const shortlistRatio = totalScreened > 0 ? Math.round((shortlistedCount / totalScreened) * 100) : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      
      {/* 1. Total Candidates */}
      <div className="glass-panel rounded-2xl p-5 relative overflow-hidden transition-all duration-200 hover:border-slate-700">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Applicants</p>
            <h3 className="text-3xl font-extrabold text-white mt-1 font-mono">{totalCandidates}</h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <Users className="w-6 h-6" />
          </div>
        </div>
        <div className="mt-3 flex items-center gap-2 text-xs text-slate-400">
          <span className="text-emerald-400 font-medium font-mono">{totalScreened} Screened</span>
          <span>•</span>
          <span>{totalCandidates - totalScreened} Unscreened</span>
        </div>
      </div>

      {/* 2. Shortlisted Candidates */}
      <div className="glass-panel rounded-2xl p-5 relative overflow-hidden transition-all duration-200 hover:border-emerald-500/30">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-emerald-400">Shortlisted</p>
            <h3 className="text-3xl font-extrabold text-emerald-300 mt-1 font-mono">{shortlistedCount}</h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <UserCheck className="w-6 h-6" />
          </div>
        </div>
        <div className="mt-3 flex items-center gap-2 text-xs text-slate-400">
          <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-mono font-medium">
            {shortlistRatio}% of pool
          </span>
          <span className="text-slate-400">Top Tier Fit</span>
        </div>
      </div>

      {/* 3. Average Fit Score */}
      <div className="glass-panel rounded-2xl p-5 relative overflow-hidden transition-all duration-200 hover:border-indigo-500/30">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Avg Candidate Fit</p>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-3xl font-extrabold text-indigo-300 font-mono">{avgFitScore}</span>
              <span className="text-slate-500 font-medium text-sm">/ 10</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <Award className="w-6 h-6" />
          </div>
        </div>
        <div className="mt-3 w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
          <div
            className="bg-gradient-to-r from-indigo-500 to-emerald-400 h-full rounded-full transition-all duration-500"
            style={{ width: `${Math.min(100, Math.max(0, avgMatchPct))}%` }}
          />
        </div>
      </div>

      {/* 4. Top Skill Gaps */}
      <div className="glass-panel rounded-2xl p-5 relative overflow-hidden transition-all duration-200 hover:border-rose-500/30">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-rose-400">Top Skill Gaps</p>
          <AlertTriangle className="w-4 h-4 text-rose-400" />
        </div>
        <div className="flex flex-wrap gap-1.5 mt-1">
          {topMissingSkills.length > 0 ? (
            topMissingSkills.slice(0, 3).map(({ skill, count }) => (
              <span
                key={skill}
                className="px-2 py-0.5 text-[11px] font-medium bg-rose-500/10 text-rose-300 border border-rose-500/20 rounded-md"
              >
                {skill} <span className="opacity-60">({count})</span>
              </span>
            ))
          ) : (
            <span className="text-xs text-slate-500 italic">No significant gaps detected</span>
          )}
        </div>
      </div>

    </div>
  );
}
