import React from 'react';
import { MapPin, CheckCircle2, XCircle, ChevronRight, Zap, ArrowUpRight } from 'lucide-react';

// Shared markdown stripper — removes **bold**, *italic*, __bold__, _italic_, # headings, `code`
const stripMd = (text) =>
  (text || '')
    .replace(/\*\*/g, '')
    .replace(/\*/g, '')
    .replace(/__/g, '')
    .replace(/_/g, '')
    .replace(/#+\s/g, '')
    .replace(/`/g, '')
    .trim();

function getScoreTheme(score) {
  if (score >= 8.5) return { bg: '#00CC44', text: '#0a0a0a', label: 'Exceptional Fit', cls: 'score-exceptional' };
  if (score >= 7.0) return { bg: '#0066FF', text: '#fff',    label: 'Strong Fit',      cls: 'score-strong' };
  if (score >= 5.0) return { bg: '#FF5500', text: '#fff',    label: 'Moderate Fit',    cls: 'score-moderate' };
  return             { bg: '#FF0099', text: '#fff',    label: 'Low Fit',         cls: 'score-low' };
}

function getStatusStyle(status) {
  switch (status) {
    case 'Shortlisted':         return { bg: '#00CC44', color: '#0a0a0a' };
    case 'Interview Scheduled': return { bg: '#0066FF', color: '#fff' };
    case 'Rejected':            return { bg: '#FF0099', color: '#fff' };
    case 'Unscreened':          return { bg: '#fafaf5', color: '#0a0a0a' };
    default:                    return { bg: '#FFE500', color: '#0a0a0a' };
  }
}

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

  const theme = getScoreTheme(fit_score || 0);
  const statusStyle = getStatusStyle(status);
  const displayName = candidate_name || candidate.name || 'Candidate';
  const skillsCount = candidate_skills.length || candidate.skills?.length || 0;

  return (
    <div
      className="nb-card"
      style={{
        padding: 0,
        display: 'flex',
        flexDirection: 'column',
        outline: isSelectedForCompare ? '3px solid #0066FF' : 'none',
        outlineOffset: 2,
      }}
    >
      {/* Score banner at top */}
      {fit_score !== undefined && fit_score !== null ? (
        <div style={{
          background: theme.bg,
          borderBottom: '2.5px solid #0a0a0a',
          padding: '10px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
            <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontWeight: 800, fontSize: 28, color: theme.text, lineHeight: 1 }}>
              {fit_score}
            </span>
            <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 12, fontWeight: 600, color: theme.text, opacity: 0.7 }}>/10</span>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontWeight: 800, fontSize: 11, color: theme.text, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{theme.label}</div>
            <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 10, color: theme.text, opacity: 0.75 }}>{match_percentage}% match</div>
          </div>
        </div>
      ) : (
        <div style={{ background: '#fafaf5', borderBottom: '2.5px solid #0a0a0a', padding: '10px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 12, color: '#0a0a0a', opacity: 0.5 }}>Not screened yet</span>
          <button
            className="nb-btn nb-btn-primary"
            onClick={() => onScreenSingle(candidate)}
            disabled={isScreening}
            style={{ padding: '5px 12px', fontSize: 11 }}
          >
            <Zap style={{ width: 12, height: 12 }} />
            Screen Now
          </button>
        </div>
      )}

      {/* Card body */}
      <div style={{ padding: 16, flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>

        {/* Header: compare check + name + status */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, flex: 1, minWidth: 0 }}>
            <input
              type="checkbox"
              checked={isSelectedForCompare}
              onChange={() => onToggleCompare(candidate)}
              title="Select for comparison"
              style={{ width: 18, height: 18, border: '2.5px solid #0a0a0a', borderRadius: 0, marginTop: 3, cursor: 'pointer', flexShrink: 0, accentColor: '#FFE500' }}
            />
            <div style={{ minWidth: 0, flex: 1 }}>
              <button
                onClick={() => onSelect(candidate)}
                style={{
                  fontFamily: 'Space Grotesk, sans-serif', fontWeight: 800, fontSize: 16,
                  color: '#0a0a0a', background: 'none', border: 'none', padding: 0, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 4, textAlign: 'left',
                  textDecoration: 'none', transition: 'color 0.1s'
                }}
                onMouseEnter={e => e.currentTarget.style.color = '#0066FF'}
                onMouseLeave={e => e.currentTarget.style.color = '#0a0a0a'}
              >
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 160 }}>{displayName}</span>
                <ArrowUpRight style={{ width: 14, height: 14, flexShrink: 0 }} />
              </button>
              <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 11, color: '#0a0a0a', opacity: 0.55, marginTop: 2, display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap' }}>
                {candidate_email || candidate.email || ''}
                {candidate_location && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    · <MapPin style={{ width: 10, height: 10 }} /> {candidate_location}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Status select */}
          <select
            value={status}
            onChange={(e) => onStatusChange(candidate.id || candidate.candidate_id, e.target.value)}
            onClick={(e) => e.stopPropagation()}
            style={{
              fontFamily: 'IBM Plex Mono, monospace', fontWeight: 700, fontSize: 10,
              background: statusStyle.bg, color: statusStyle.color,
              border: '2px solid #0a0a0a', padding: '4px 8px',
              cursor: 'pointer', outline: 'none', boxShadow: '2px 2px 0 #0a0a0a',
              appearance: 'none', flexShrink: 0, textTransform: 'uppercase',
              letterSpacing: '0.04em'
            }}
          >
            <option value="Under Review">Under Review</option>
            <option value="Shortlisted">★ Shortlisted</option>
            <option value="Interview Scheduled">Interview Sched.</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>

        {/* Experience */}
        {(total_years_experience || candidate.total_years_experience) && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span className="nb-badge nb-badge-black" style={{ fontSize: 10 }}>
              {total_years_experience || candidate.total_years_experience} YRS EXP
            </span>
            <span className="nb-badge nb-badge-cream" style={{ fontSize: 10 }}>
              {skillsCount} skills
            </span>
          </div>
        )}

        {/* Matched & Missing Skills */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {matched_skills.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, alignItems: 'center' }}>
              <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 10, fontWeight: 700, color: '#00CC44', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 3, marginRight: 2 }}>
                <CheckCircle2 style={{ width: 11, height: 11 }} /> Match:
              </span>
              {matched_skills.slice(0, 4).map(skill => (
                <span key={skill} className="skill-chip-match">{skill}</span>
              ))}
              {matched_skills.length > 4 && (
                <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 10, color: '#00CC44', fontWeight: 700 }}>+{matched_skills.length - 4}</span>
              )}
            </div>
          )}

          {missing_skills.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, alignItems: 'center' }}>
              <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 10, fontWeight: 700, color: '#FF0099', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 3, marginRight: 2 }}>
                <XCircle style={{ width: 11, height: 11 }} /> Gaps:
              </span>
              {missing_skills.slice(0, 3).map(skill => (
                <span key={skill} className="skill-chip-miss">{skill}</span>
              ))}
            </div>
          )}
        </div>

        {/* Justification */}
        {justification && (
          <p style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 11, color: '#0a0a0a', opacity: 0.6, lineHeight: 1.6, margin: 0, background: '#fafaf5', border: '1.5px solid #0a0a0a', padding: '8px 10px', fontStyle: 'italic' }}>
            "{stripMd(justification).slice(0, 120)}{stripMd(justification).length > 120 ? '…' : ''}"
          </p>
        )}
      </div>

      {/* Footer */}
      <div style={{ borderTop: '2.5px solid #0a0a0a', padding: '10px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#fafaf5' }}>
        <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 10, color: '#0a0a0a', opacity: 0.45 }}>
          {skillsCount} skills indexed
        </span>
        <button
          onClick={() => onSelect(candidate)}
          style={{ fontFamily: 'IBM Plex Mono, monospace', fontWeight: 700, fontSize: 11, color: '#0066FF', background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, textTransform: 'uppercase', letterSpacing: '0.04em' }}
        >
          Full Breakdown <ChevronRight style={{ width: 13, height: 13 }} />
        </button>
      </div>
    </div>
  );
}
