import React from 'react';
import { Sparkles, FileUp, PlusCircle, Download, Settings, Briefcase, CheckCircle2, ChevronDown } from 'lucide-react';

export default function Navbar({
  jobs,
  selectedJob,
  onSelectJob,
  onOpenUpload,
  onOpenNewJob,
  onOpenSettings,
  candidateCount,
  activeProvider
}) {
  const getProviderName = (p) => {
    switch (p) {
      case 'gemini': return 'Gemini 1.5 Flash';
      case 'openai': return 'OpenAI GPT-4o';
      case 'groq': return 'Groq LLaMA 3.3';
      default: return 'Built-in Local AI';
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-[#0B0F19]/90 backdrop-blur-xl transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-emerald-400 p-[1px] flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <div className="w-full h-full bg-[#0B0F19] rounded-[11px] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-indigo-400 animate-pulse" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg bg-gradient-to-r from-white via-slate-100 to-indigo-200 bg-clip-text text-transparent">
                TalentPulse AI
              </span>
              <span className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                Screener 2.0
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">Intelligent Resume Parser & Matcher</p>
          </div>
        </div>

        {/* Job Selector Dropdown */}
        <div className="flex-1 max-w-md mx-2">
          <div className="relative">
            <select
              value={selectedJob?.id || ''}
              onChange={(e) => {
                const job = jobs.find(j => j.id === e.target.value);
                if (job) onSelectJob(job);
              }}
              className="w-full pl-9 pr-8 py-2 bg-slate-900/90 border border-slate-800 text-sm font-medium text-slate-200 rounded-xl appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 cursor-pointer transition shadow-inner"
            >
              {jobs.map(job => (
                <option key={job.id} value={job.id} className="bg-slate-900 text-slate-100 py-1">
                  🎯 {job.title} ({job.department})
                </option>
              ))}
            </select>
            <Briefcase className="w-4 h-4 text-indigo-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Upload Resumes Button */}
          <button
            onClick={onOpenUpload}
            className="flex items-center gap-2 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white text-sm font-semibold rounded-xl shadow-lg shadow-indigo-600/25 transition-all duration-200"
          >
            <FileUp className="w-4 h-4" />
            <span className="hidden md:inline">Upload Resumes</span>
            <span className="px-1.5 py-0.2 text-xs bg-indigo-700/80 rounded-full font-mono font-normal">
              {candidateCount}
            </span>
          </button>

          {/* New Job Button */}
          <button
            onClick={onOpenNewJob}
            className="hidden sm:flex items-center gap-2 px-3 py-2 bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 hover:text-white text-sm font-medium rounded-xl border border-slate-700/50 transition-all"
            title="Create New Job Posting"
          >
            <PlusCircle className="w-4 h-4 text-emerald-400" />
            <span className="hidden lg:inline">New Job</span>
          </button>

          {/* Export Report */}
          <a
            href={selectedJob ? `/api/export/csv?job_id=${selectedJob.id}` : '/api/export/csv'}
            download
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 hover:text-white text-sm font-medium rounded-xl border border-slate-700/50 transition-all"
            title="Export Screened Candidates to CSV"
          >
            <Download className="w-4 h-4 text-slate-400" />
            <span className="hidden xl:inline">Export CSV</span>
          </a>

          {/* Settings Trigger */}
          <button
            onClick={onOpenSettings}
            className="flex items-center gap-2 p-2 sm:px-3 sm:py-2 bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 hover:text-white text-sm font-medium rounded-xl border border-slate-700/50 transition-all"
            title="LLM Settings & API Keys"
          >
            <Settings className="w-4 h-4 text-indigo-400" />
            <div className="hidden lg:flex items-center gap-1.5 text-xs text-slate-400 font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              {getProviderName(activeProvider)}
            </div>
          </button>

        </div>

      </div>
    </header>
  );
}
