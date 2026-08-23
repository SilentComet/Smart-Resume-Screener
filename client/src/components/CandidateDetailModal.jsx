import React, { useState } from 'react';
import { 
  X, Sparkles, CheckCircle2, XCircle, Award, Briefcase, GraduationCap, 
  HelpCircle, FileText, Code2, MapPin, Mail, Phone, ExternalLink, ThumbsUp, AlertTriangle, Play 
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function CandidateDetailModal({
  candidate,
  selectedJob,
  onClose,
  onStatusChange,
  onReScreen,
  isScreening
}) {
  if (!candidate) return null;

  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'experience' | 'skills' | 'raw' | 'json'

  const {
    candidate_name,
    candidate_email,
    candidate_phone,
    candidate_location,
    candidate_linkedin,
    candidate_github,
    total_years_experience,
    fit_score = 0,
    match_percentage = 0,
    skill_score = 0,
    experience_score = 0,
    education_score = 0,
    status = 'Under Review',
    screening_model = 'Built-in Semantic Engine',
    justification,
    strengths = [],
    weaknesses = [],
    matched_skills = [],
    missing_skills = [],
    interview_questions = [],
    candidate_skills = [],
    skills_by_category = {},
    candidate_experience = [],
    candidate_education = [],
    raw_text = ''
  } = candidate;

  const handleStatusClick = (newStatus) => {
    onStatusChange(candidate.id || candidate.candidate_id, newStatus);
    if (newStatus === 'Shortlisted') {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 }
      });
    }
  };

  const getScoreColor = (s) => {
    if (s >= 8.5) return 'text-emerald-400 border-emerald-500/50 bg-emerald-500/10';
    if (s >= 7.0) return 'text-indigo-400 border-indigo-500/50 bg-indigo-500/10';
    if (s >= 5.0) return 'text-amber-400 border-amber-500/50 bg-amber-500/10';
    return 'text-rose-400 border-rose-500/50 bg-rose-500/10';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl shadow-black/80 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-800 bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 text-xs font-semibold uppercase tracking-wider rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Evaluation Report
              </span>
              <span className="text-xs text-slate-400 font-mono">
                Model: {screening_model}
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
              {candidate_name || candidate.name}
            </h2>
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300 mt-1">
              {candidate_email && (
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-slate-400" /> {candidate_email}
                </span>
              )}
              {candidate_location && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" /> {candidate_location}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Briefcase className="w-3.5 h-3.5 text-slate-400" /> {total_years_experience || 2}+ Years Experience
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action / Shortlist Bar */}
        <div className="px-6 py-3 bg-slate-950/60 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-400">Recruiter Decision:</span>
            <div className="flex items-center gap-1.5">
              {['Shortlisted', 'Interview Scheduled', 'Under Review', 'Rejected'].map(st => (
                <button
                  key={st}
                  onClick={() => handleStatusClick(st)}
                  className={`px-3 py-1 text-xs font-semibold rounded-lg border transition ${
                    status === st
                      ? (st === 'Shortlisted' ? 'bg-emerald-600 text-white border-emerald-500 shadow-md shadow-emerald-600/30' :
                         st === 'Interview Scheduled' ? 'bg-purple-600 text-white border-purple-500' :
                         st === 'Rejected' ? 'bg-rose-600 text-white border-rose-500' : 'bg-indigo-600 text-white border-indigo-500')
                      : 'bg-slate-800/70 text-slate-300 border-slate-700/60 hover:bg-slate-700/70'
                  }`}
                >
                  {st === 'Shortlisted' ? '★ ' + st : st}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={() => onReScreen(candidate)}
            disabled={isScreening}
            className="flex items-center gap-1.5 px-3 py-1 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 text-xs font-semibold rounded-lg transition"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Re-Evaluate with LLM
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800 px-6 bg-slate-900/50">
          {[
            { id: 'overview', label: 'AI Match Analysis', icon: Sparkles },
            { id: 'experience', label: 'Work & Education', icon: Briefcase },
            { id: 'skills', label: `Skills (${candidate_skills.length || 0})`, icon: Code2 },
            { id: 'raw', label: 'Raw Resume', icon: FileText },
            { id: 'json', label: 'Structured JSON', icon: Code2 }
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-3 px-4 text-xs font-semibold border-b-2 transition ${
                  activeTab === tab.id
                    ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          
          {/* Tab 1: Overview */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              
              {/* Score Dashboard Bento */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                
                {/* Main Fit Score */}
                <div className={`rounded-2xl p-5 border flex flex-col items-center justify-center text-center ${getScoreColor(fit_score)}`}>
                  <p className="text-xs uppercase font-bold tracking-wider">Overall Fit Score</p>
                  <div className="flex items-baseline gap-1 my-2">
                    <span className="text-5xl font-extrabold font-mono">{fit_score}</span>
                    <span className="text-slate-400 text-base font-bold">/ 10</span>
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-black/30 font-mono">
                    {match_percentage}% Semantic Match
                  </span>
                </div>

                {/* Sub Scores */}
                <div className="md:col-span-3 grid grid-cols-3 gap-3">
                  
                  <div className="bg-slate-800/60 border border-slate-750 p-4 rounded-xl flex flex-col justify-between">
                    <div>
                      <p className="text-xs font-medium text-slate-400">Skill Alignment</p>
                      <h4 className="text-2xl font-bold text-white font-mono mt-1">{skill_score || match_percentage}%</h4>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-1.5 mt-3">
                      <div className="bg-emerald-400 h-full rounded-full" style={{ width: `${skill_score || match_percentage}%` }} />
                    </div>
                  </div>

                  <div className="bg-slate-800/60 border border-slate-750 p-4 rounded-xl flex flex-col justify-between">
                    <div>
                      <p className="text-xs font-medium text-slate-400">Experience & Seniority</p>
                      <h4 className="text-2xl font-bold text-white font-mono mt-1">{experience_score || 85}%</h4>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-1.5 mt-3">
                      <div className="bg-indigo-400 h-full rounded-full" style={{ width: `${experience_score || 85}%` }} />
                    </div>
                  </div>

                  <div className="bg-slate-800/60 border border-slate-750 p-4 rounded-xl flex flex-col justify-between">
                    <div>
                      <p className="text-xs font-medium text-slate-400">Education & Domain</p>
                      <h4 className="text-2xl font-bold text-white font-mono mt-1">{education_score || 80}%</h4>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-1.5 mt-3">
                      <div className="bg-purple-400 h-full rounded-full" style={{ width: `${education_score || 80}%` }} />
                    </div>
                  </div>

                </div>

              </div>

              {/* Matched vs Missing Skills Matrix */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Matched Skills */}
                <div className="bg-emerald-950/20 border border-emerald-500/30 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <h4 className="text-sm font-bold text-emerald-300 uppercase tracking-wide">
                      Verified Matching Skills ({matched_skills.length})
                    </h4>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {matched_skills.length > 0 ? (
                      matched_skills.map(skill => (
                        <span
                          key={skill}
                          className="px-2.5 py-1 text-xs font-semibold bg-emerald-500/20 text-emerald-200 border border-emerald-500/40 rounded-lg"
                        >
                          ✓ {skill}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-slate-400 italic">No direct keyword matches detected.</span>
                    )}
                  </div>
                </div>

                {/* Missing Skills */}
                <div className="bg-rose-950/20 border border-rose-500/30 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <XCircle className="w-4 h-4 text-rose-400" />
                    <h4 className="text-sm font-bold text-rose-300 uppercase tracking-wide">
                      Missing / Gap Skills ({missing_skills.length})
                    </h4>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {missing_skills.length > 0 ? (
                      missing_skills.map(skill => (
                        <span
                          key={skill}
                          className="px-2.5 py-1 text-xs font-semibold bg-rose-500/20 text-rose-200 border border-rose-500/40 rounded-lg"
                        >
                          ✕ {skill}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-emerald-400 italic">All core job requirements are satisfied!</span>
                    )}
                  </div>
                </div>

              </div>

              {/* AI Justification */}
              <div className="bg-slate-800/40 border border-slate-700/60 rounded-xl p-5 space-y-2">
                <div className="flex items-center gap-2 text-indigo-400">
                  <Sparkles className="w-4 h-4" />
                  <h4 className="text-sm font-bold uppercase tracking-wider text-slate-200">
                    Recruiter Justification & Reasoning
                  </h4>
                </div>
                <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">
                  {justification || 'No justification provided.'}
                </p>
              </div>

              {/* Strengths & Weaknesses */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-800/40 border border-slate-700/60 rounded-xl p-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5 mb-2">
                    <ThumbsUp className="w-4 h-4" /> Key Candidate Strengths
                  </h4>
                  <ul className="space-y-1.5 text-xs text-slate-300">
                    {strengths.map((str, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-emerald-400 mt-0.5">•</span>
                        <span>{str}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-slate-800/40 border border-slate-700/60 rounded-xl p-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5 mb-2">
                    <AlertTriangle className="w-4 h-4" /> Risk Flags & Gaps
                  </h4>
                  <ul className="space-y-1.5 text-xs text-slate-300">
                    {weaknesses.map((wk, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-amber-400 mt-0.5">•</span>
                        <span>{wk}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Tailored Interview Questions */}
              {interview_questions.length > 0 && (
                <div className="bg-indigo-950/30 border border-indigo-500/30 rounded-xl p-5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-300 flex items-center gap-2 mb-3">
                    <HelpCircle className="w-4 h-4 text-indigo-400" />
                    Recommended AI-Tailored Interview Questions
                  </h4>
                  <div className="space-y-2.5">
                    {interview_questions.map((q, idx) => (
                      <div key={idx} className="flex items-start gap-3 bg-slate-900/80 p-3 rounded-lg border border-slate-800">
                        <span className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 text-xs font-mono font-bold flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <p className="text-xs text-slate-200 leading-relaxed">{q}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          )}

          {/* Tab 2: Experience & Education */}
          {activeTab === 'experience' && (
            <div className="space-y-6">
              {/* Work Experience */}
              <div>
                <h4 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2 mb-3">
                  <Briefcase className="w-4 h-4 text-indigo-400" /> Work History
                </h4>
                <div className="space-y-4">
                  {candidate_experience.length > 0 ? (
                    candidate_experience.map((exp, idx) => (
                      <div key={idx} className="bg-slate-800/40 border border-slate-700/60 p-4 rounded-xl">
                        <div className="flex items-start justify-between gap-2">
                          <h5 className="font-bold text-white text-sm">{exp.title}</h5>
                          <span className="text-xs font-mono text-indigo-300 bg-indigo-500/10 px-2 py-0.5 rounded">
                            {exp.duration}
                          </span>
                        </div>
                        {exp.company && (
                          <p className="text-xs font-semibold text-slate-400 mt-0.5">{exp.company}</p>
                        )}
                        {exp.description && (
                          <p className="text-xs text-slate-300 mt-2 leading-relaxed whitespace-pre-line">
                            {exp.description}
                          </p>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-400 italic">No structured work entries detected.</p>
                  )}
                </div>
              </div>

              {/* Education */}
              <div>
                <h4 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2 mb-3">
                  <GraduationCap className="w-4 h-4 text-indigo-400" /> Education Credentials
                </h4>
                <div className="space-y-3">
                  {candidate_education.length > 0 ? (
                    candidate_education.map((edu, idx) => (
                      <div key={idx} className="bg-slate-800/40 border border-slate-700/60 p-4 rounded-xl flex items-center justify-between">
                        <div>
                          <h5 className="font-bold text-white text-sm">{edu.degree} in {edu.field}</h5>
                          <p className="text-xs text-slate-400 mt-0.5">{edu.institution}</p>
                        </div>
                        <span className="text-xs font-mono text-slate-300 bg-slate-700 px-2 py-1 rounded">
                          {edu.year}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-400 italic">No structured education entries found.</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: Categorized Skills */}
          {activeTab === 'skills' && (
            <div className="space-y-4">
              {Object.keys(skills_by_category).length > 0 ? (
                Object.entries(skills_by_category).map(([category, skills]) => {
                  if (!skills || skills.length === 0) return null;
                  return (
                    <div key={category} className="bg-slate-800/40 border border-slate-700/60 p-4 rounded-xl">
                      <h5 className="text-xs font-bold uppercase tracking-wider text-indigo-300 mb-2">
                        {category} ({skills.length})
                      </h5>
                      <div className="flex flex-wrap gap-1.5">
                        {skills.map(s => (
                          <span
                            key={s}
                            className="px-2.5 py-1 text-xs font-medium bg-slate-900 text-slate-200 border border-slate-700 rounded-md"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {candidate_skills.map(s => (
                    <span
                      key={s}
                      className="px-2.5 py-1 text-xs font-medium bg-slate-800 text-slate-200 border border-slate-700 rounded-md"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab 4: Raw Resume */}
          {activeTab === 'raw' && (
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs text-slate-300 whitespace-pre-wrap leading-relaxed max-h-[60vh] overflow-y-auto">
              {raw_text || 'No raw text available.'}
            </div>
          )}

          {/* Tab 5: Structured JSON */}
          {activeTab === 'json' && (
            <pre className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs text-emerald-400 max-h-[60vh] overflow-y-auto">
              {JSON.stringify(candidate, null, 2)}
            </pre>
          )}

        </div>

      </div>
    </div>
  );
}
