import React, { useState } from 'react';
import { X, Zap, CheckCircle2, XCircle, Briefcase, GraduationCap, HelpCircle, FileText, Code2, MapPin, Mail, ThumbsUp, AlertTriangle, Loader2 } from 'lucide-react';
import confetti from 'canvas-confetti';

function getScoreStyle(score) {
  if (score >= 8.5) return { bg: '#00CC44', color: '#0a0a0a', label: 'EXCEPTIONAL FIT' };
  if (score >= 7.0) return { bg: '#0066FF', color: '#fff',    label: 'STRONG FIT' };
  if (score >= 5.0) return { bg: '#FF5500', color: '#fff',    label: 'MODERATE FIT' };
  return             { bg: '#FF0099', color: '#fff',    label: 'LOW FIT / GAPS' };
}

const TAB_STYLE_ACTIVE = {
  fontFamily: 'IBM Plex Mono, monospace', fontWeight: 800, fontSize: 11, textTransform: 'uppercase',
  letterSpacing: '0.06em',
  border: 'none',
  borderBottom: '4px solid #0a0a0a',
  padding: '10px 16px',
  background: '#FFE500', color: '#0a0a0a', cursor: 'pointer',
  flexShrink: 0, whiteSpace: 'nowrap',
};
const TAB_STYLE_INACTIVE = {
  ...TAB_STYLE_ACTIVE,
  background: '#fafaf5', color: '#0a0a0a', opacity: 0.55,
  borderBottom: '4px solid transparent',
};

const STATUS_BUTTONS = [
  { value: 'Shortlisted',         label: '★ Shortlist',   bg: '#00CC44', color: '#0a0a0a' },
  { value: 'Interview Scheduled', label: '📅 Interview',  bg: '#0066FF', color: '#fff' },
  { value: 'Under Review',        label: '🔍 Review',     bg: '#FFE500', color: '#0a0a0a' },
  { value: 'Rejected',            label: '✕ Reject',      bg: '#FF0099', color: '#fff' },
];

export default function CandidateDetailModal({
  candidate,
  selectedJob,
  onClose,
  onStatusChange,
  onReScreen,
  isScreening
}) {
  const [activeTab, setActiveTab] = useState('overview');

  if (!candidate) return null;

  const {
    candidate_name, candidate_email, candidate_phone, candidate_location,
    total_years_experience, fit_score = 0, match_percentage = 0,
    skill_score = 0, experience_score = 0, education_score = 0,
    status = 'Under Review', screening_model = 'Built-in Engine',
    justification, strengths = [], weaknesses = [],
    matched_skills = [], missing_skills = [], interview_questions = [],
    candidate_skills = [], skills_by_category = {},
    candidate_experience = [], candidate_education = [], raw_text = ''
  } = candidate;

  const scoreStyle = getScoreStyle(fit_score);

  // Strip all markdown bold/italic: **word**, *word*, __word__, _word_
  const stripMd = (text) =>
    (text || '')
      .replace(/\*\*/g, '')   // bold **
      .replace(/\*/g, '')     // italic *
      .replace(/__/g, '')     // bold __
      .replace(/_/g, '')      // italic _
      .replace(/#+\s/g, '')   // headings # ## ###
      .replace(/`/g, '')      // inline code
      .trim();

  const handleStatusClick = (newStatus) => {
    onStatusChange(candidate.id || candidate.candidate_id, newStatus);
    if (newStatus === 'Shortlisted') {
      confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
    }
  };

  const TABS = [
    { id: 'overview',    label: 'AI Analysis',                 icon: Zap },
    { id: 'experience',  label: 'Work & Education',             icon: Briefcase },
    { id: 'skills',      label: `Skills (${candidate_skills.length || 0})`, icon: Code2 },
    { id: 'raw',         label: 'Raw Resume',                   icon: FileText },
    { id: 'json',        label: 'JSON Data',                    icon: Code2 },
  ];

  const SubScoreCard = ({ label, value, color }) => (
    <div className="nb-card-static" style={{ padding: 16 }}>
      <p style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', color: '#0a0a0a', opacity: 0.6, margin: '0 0 4px' }}>{label}</p>
      <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontWeight: 800, fontSize: 28, color: '#0a0a0a', lineHeight: 1 }}>{value}%</div>
      <div className="nb-progress" style={{ marginTop: 10 }}>
        <div className="nb-progress-fill" style={{ width: `${value}%`, background: color }} />
      </div>
    </div>
  );

  return (
    <div className="nb-overlay" style={{ alignItems: 'flex-start', paddingTop: 20, paddingBottom: 20 }}>
      <div className="nb-card-static" style={{ width: '100%', maxWidth: 900, maxHeight: '92vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* ── Header ── */}
        <div style={{ background: scoreStyle.bg, borderBottom: '2.5px solid #0a0a0a', padding: '20px 24px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <span className="nb-badge nb-badge-black" style={{ background: '#0a0a0a', color: scoreStyle.bg }}>Evaluation Report</span>
              <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 10, fontWeight: 700, color: '#0a0a0a', opacity: 0.6 }}>via {screening_model}</span>
            </div>
            <h2 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 800, fontSize: 28, color: scoreStyle.color === '#fff' ? '#fff' : '#0a0a0a', margin: '0 0 6px', lineHeight: 1 }}>
              {candidate_name || candidate.name}
            </h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, fontFamily: 'IBM Plex Mono, monospace', fontSize: 11, color: scoreStyle.color === '#fff' ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.65)' }}>
              {candidate_email && <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Mail style={{ width: 12, height: 12 }} /> {candidate_email}</span>}
              {candidate_location && <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><MapPin style={{ width: 12, height: 12 }} /> {candidate_location}</span>}
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Briefcase style={{ width: 12, height: 12 }} /> {total_years_experience || 2}+ yrs exp</span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
            {/* Big Score */}
            <div style={{ background: '#0a0a0a', border: '3px solid #0a0a0a', padding: '12px 18px', textAlign: 'center', boxShadow: '4px 4px 0 rgba(0,0,0,0.3)' }}>
              <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontWeight: 800, fontSize: 40, color: scoreStyle.bg, lineHeight: 1 }}>{fit_score}</div>
              <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 10, color: '#fff', opacity: 0.7 }}>/ 10</div>
              <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 9, fontWeight: 800, color: scoreStyle.bg, textTransform: 'uppercase', marginTop: 2 }}>{scoreStyle.label}</div>
            </div>

            <button
              onClick={onClose}
              style={{ background: '#0a0a0a', border: '2.5px solid #0a0a0a', color: scoreStyle.bg, padding: 10, cursor: 'pointer', boxShadow: '3px 3px 0 rgba(0,0,0,0.2)', transition: 'all 0.1s' }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = '1px 1px 0 rgba(0,0,0,0.2)'; e.currentTarget.style.transform = 'translate(2px,2px)'; }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = '3px 3px 0 rgba(0,0,0,0.2)'; e.currentTarget.style.transform = ''; }}
            >
              <X style={{ width: 18, height: 18 }} />
            </button>
          </div>
        </div>

        {/* ── Status Action Bar ── */}
        <div style={{ background: '#fafaf5', borderBottom: '2.5px solid #0a0a0a', padding: '12px 24px', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 6 }}>
            <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontWeight: 700, fontSize: 10, textTransform: 'uppercase', color: '#0a0a0a', opacity: 0.5, marginRight: 4 }}>Recruiter Decision:</span>
            {STATUS_BUTTONS.map(btn => (
              <button
                key={btn.value}
                onClick={() => handleStatusClick(btn.value)}
                style={{
                  fontFamily: 'IBM Plex Mono, monospace', fontWeight: 800, fontSize: 11, textTransform: 'uppercase',
                  background: status === btn.value ? btn.bg : '#fafaf5',
                  color: status === btn.value ? btn.color : '#0a0a0a',
                  border: '2px solid #0a0a0a',
                  boxShadow: status === btn.value ? '3px 3px 0 #0a0a0a' : '2px 2px 0 #0a0a0a',
                  padding: '5px 12px', cursor: 'pointer', transition: 'all 0.1s',
                  opacity: status === btn.value ? 1 : 0.6,
                }}
                onMouseEnter={e => { e.currentTarget.style.opacity = '1'; }}
                onMouseLeave={e => { e.currentTarget.style.opacity = status === btn.value ? '1' : '0.6'; }}
              >
                {btn.label}
              </button>
            ))}
          </div>

          <button
            className="nb-btn nb-btn-blue"
            onClick={() => onReScreen(candidate)}
            disabled={isScreening}
            style={{ padding: '6px 14px', fontSize: 12 }}
          >
            {isScreening ? <Loader2 style={{ width: 14, height: 14, animation: 'nb-spin 0.8s linear infinite' }} /> : <Zap style={{ width: 14, height: 14 }} />}
            Re-Evaluate LLM
          </button>
        </div>

        {/* ── Tabs ── */}
        <div style={{ display: 'flex', borderBottom: '2.5px solid #0a0a0a', background: '#fafaf5', overflowX: 'auto', flexShrink: 0 }}>
          {TABS.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={isActive ? TAB_STYLE_ACTIVE : TAB_STYLE_INACTIVE}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <Icon style={{ width: 12, height: 12 }} />
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* ── Body ── */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 24, background: '#fafaf5', display: 'flex', flexDirection: 'column', gap: 20, minHeight: 0 }}>

          {/* TAB: Overview */}
          {activeTab === 'overview' && (
            <>
              {/* Sub-scores */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12 }}>
                <SubScoreCard label="Skill Alignment" value={skill_score || match_percentage} color="#00CC44" />
                <SubScoreCard label="Exp & Seniority" value={experience_score || 85} color="#0066FF" />
                <SubScoreCard label="Education" value={education_score || 80} color="#FF5500" />
                <div className="nb-card-static" style={{ padding: 16 }}>
                  <p style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', color: '#0a0a0a', opacity: 0.6, margin: '0 0 4px' }}>Semantic Match</p>
                  <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontWeight: 800, fontSize: 28, color: '#0a0a0a', lineHeight: 1 }}>{match_percentage}%</div>
                  <div className="nb-progress" style={{ marginTop: 10 }}>
                    <div className="nb-progress-fill" style={{ width: `${match_percentage}%`, background: '#FF0099' }} />
                  </div>
                </div>
              </div>

              {/* Matched vs Missing */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="nb-card-static" style={{ padding: 16 }}>
                  <h4 style={{ fontFamily: 'IBM Plex Mono, monospace', fontWeight: 800, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#00CC44', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
                    <CheckCircle2 style={{ width: 14, height: 14 }} /> Matched Skills ({matched_skills.length})
                  </h4>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {matched_skills.length > 0 ? matched_skills.map(skill => (
                      <span key={skill} className="skill-chip-match">✓ {skill}</span>
                    )) : <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 11, opacity: 0.5 }}>None detected</span>}
                  </div>
                </div>

                <div className="nb-card-static" style={{ padding: 16 }}>
                  <h4 style={{ fontFamily: 'IBM Plex Mono, monospace', fontWeight: 800, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#FF0099', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
                    <XCircle style={{ width: 14, height: 14 }} /> Skill Gaps ({missing_skills.length})
                  </h4>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {missing_skills.length > 0 ? missing_skills.map(skill => (
                      <span key={skill} className="skill-chip-miss">✕ {skill}</span>
                    )) : <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 11, color: '#00CC44', fontWeight: 700 }}>All core requirements met!</span>}
                  </div>
                </div>
              </div>

              {/* AI Justification */}
              <div className="nb-card-static" style={{ padding: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, borderBottom: '2px solid #0a0a0a', paddingBottom: 10 }}>
                  <div style={{ width: 32, height: 32, background: '#FFE500', border: '2px solid #0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Zap style={{ width: 16, height: 16 }} />
                  </div>
                  <h4 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 800, fontSize: 14, textTransform: 'uppercase', letterSpacing: '0.04em', margin: 0 }}>AI Recruiter Reasoning</h4>
                </div>
                <p style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 14, lineHeight: 1.7, color: '#0a0a0a', margin: 0 }}>
                  {stripMd(justification) || 'No justification provided.'}
                </p>
              </div>

              {/* Strengths & Weaknesses */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="nb-card-static" style={{ padding: 16 }}>
                  <h4 style={{ fontFamily: 'IBM Plex Mono, monospace', fontWeight: 800, fontSize: 11, color: '#00CC44', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                    <ThumbsUp style={{ width: 14, height: 14 }} /> Strengths
                  </h4>
                  <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {strengths.map((str, i) => (
                      <li key={i} style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 13, color: '#0a0a0a', lineHeight: 1.5, display: 'flex', gap: 8 }}>
                        <span style={{ color: '#00CC44', fontWeight: 800 }}>→</span> {str}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="nb-card-static" style={{ padding: 16 }}>
                  <h4 style={{ fontFamily: 'IBM Plex Mono, monospace', fontWeight: 800, fontSize: 11, color: '#FF5500', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                    <AlertTriangle style={{ width: 14, height: 14 }} /> Risk Flags
                  </h4>
                  <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {weaknesses.map((wk, i) => (
                      <li key={i} style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 13, color: '#0a0a0a', lineHeight: 1.5, display: 'flex', gap: 8 }}>
                        <span style={{ color: '#FF5500', fontWeight: 800 }}>!</span> {wk}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Interview Questions */}
              {interview_questions.length > 0 && (
                <div className="nb-card-static" style={{ padding: 20 }}>
                  <h4 style={{ fontFamily: 'IBM Plex Mono, monospace', fontWeight: 800, fontSize: 11, color: '#0066FF', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 14 }}>
                    <HelpCircle style={{ width: 14, height: 14 }} /> AI-Tailored Interview Questions
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {interview_questions.map((q, i) => (
                      <div key={i} className="nb-card-static" style={{ padding: '10px 14px', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                        <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontWeight: 800, fontSize: 12, background: '#0066FF', color: '#fff', border: '2px solid #0a0a0a', width: 26, height: 26, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{i + 1}</span>
                        <p style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 13, color: '#0a0a0a', lineHeight: 1.6, margin: 0 }}>{q}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {/* TAB: Experience & Education */}
          {activeTab === 'experience' && (
            <>
              <div>
                <h4 style={{ fontFamily: 'IBM Plex Mono, monospace', fontWeight: 800, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.06em', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 14, borderBottom: '2px solid #0a0a0a', paddingBottom: 8 }}>
                  <Briefcase style={{ width: 14, height: 14 }} /> Work History
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {candidate_experience.length > 0 ? candidate_experience.map((exp, i) => (
                    <div key={i} className="nb-card-static" style={{ padding: 16 }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                        <h5 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 800, fontSize: 15, margin: 0 }}>{exp.title}</h5>
                        <span className="nb-badge nb-badge-black" style={{ fontSize: 10, flexShrink: 0 }}>{exp.duration}</span>
                      </div>
                      {exp.company && <p style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 11, color: '#0a0a0a', opacity: 0.6, margin: '4px 0' }}>{exp.company}</p>}
                      {exp.description && <p style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 13, lineHeight: 1.6, margin: '8px 0 0', color: '#0a0a0a', opacity: 0.8, whiteSpace: 'pre-line' }}>{exp.description}</p>}
                    </div>
                  )) : <p style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 12, opacity: 0.5, fontStyle: 'italic' }}>No structured work entries detected.</p>}
                </div>
              </div>

              <div>
                <h4 style={{ fontFamily: 'IBM Plex Mono, monospace', fontWeight: 800, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.06em', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 14, borderBottom: '2px solid #0a0a0a', paddingBottom: 8 }}>
                  <GraduationCap style={{ width: 14, height: 14 }} /> Education
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {candidate_education.length > 0 ? candidate_education.map((edu, i) => (
                    <div key={i} className="nb-card-static" style={{ padding: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div>
                        <h5 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 800, fontSize: 14, margin: 0 }}>{edu.degree} in {edu.field}</h5>
                        <p style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 11, color: '#0a0a0a', opacity: 0.6, margin: '4px 0 0' }}>{edu.institution}</p>
                      </div>
                      <span className="nb-badge nb-badge-blue" style={{ fontSize: 11 }}>{edu.year}</span>
                    </div>
                  )) : <p style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 12, opacity: 0.5, fontStyle: 'italic' }}>No structured education entries found.</p>}
                </div>
              </div>
            </>
          )}

          {/* TAB: Skills */}
          {activeTab === 'skills' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {Object.keys(skills_by_category).length > 0 ? (
                Object.entries(skills_by_category).map(([category, skills]) => {
                  if (!skills || skills.length === 0) return null;
                  return (
                    <div key={category} className="nb-card-static" style={{ padding: 16 }}>
                      <h5 style={{ fontFamily: 'IBM Plex Mono, monospace', fontWeight: 800, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ background: '#FFE500', border: '2px solid #0a0a0a', padding: '1px 8px', fontSize: 10 }}>{skills.length}</span>
                        {category}
                      </h5>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                        {skills.map(s => (
                          <span key={s} className="skill-chip-bonus">{s}</span>
                        ))}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {candidate_skills.map(s => <span key={s} className="skill-chip-bonus">{s}</span>)}
                </div>
              )}
            </div>
          )}

          {/* TAB: Raw Resume */}
          {activeTab === 'raw' && (
            <pre style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 12, lineHeight: 1.7, color: '#0a0a0a', background: '#fff', border: '2.5px solid #0a0a0a', padding: 20, whiteSpace: 'pre-wrap', wordBreak: 'break-word', margin: 0 }}>
              {raw_text || 'No raw text available.'}
            </pre>
          )}

          {/* TAB: JSON */}
          {activeTab === 'json' && (
            <pre style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 11, lineHeight: 1.6, color: '#0066FF', background: '#0a0a0a', border: '2.5px solid #0a0a0a', padding: 20, whiteSpace: 'pre-wrap', wordBreak: 'break-word', margin: 0 }}>
              {JSON.stringify(candidate, null, 2)}
            </pre>
          )}

        </div>
      </div>
    </div>
  );
}
