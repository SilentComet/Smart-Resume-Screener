import React from 'react';
import { X, CheckCircle2, XCircle, ThumbsUp } from 'lucide-react';

function getScoreStyle(score) {
  if (score >= 8.5) return { bg: '#00CC44', color: '#0a0a0a' };
  if (score >= 7.0) return { bg: '#0066FF', color: '#fff' };
  if (score >= 5.0) return { bg: '#FF5500', color: '#fff' };
  return { bg: '#FF0099', color: '#fff' };
}

export default function CandidateComparisonModal({
  candidates,
  selectedJob,
  onClose,
  onStatusChange,
  onSelectCandidate
}) {
  if (!candidates || candidates.length < 2) return null;

  return (
    <div className="nb-overlay" style={{ alignItems: 'flex-start', paddingTop: 20 }}>
      <div className="nb-card-static" style={{ width: '100%', maxWidth: 1100, maxHeight: '92vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* Header */}
        <div style={{ background: '#0a0a0a', borderBottom: '2.5px solid #0a0a0a', padding: '18px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <span className="nb-badge nb-badge-yellow" style={{ marginBottom: 8, display: 'inline-flex' }}>Side-by-Side Matrix</span>
            <h2 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 800, fontSize: 22, color: '#fafaf5', margin: 0 }}>
              Comparing {candidates.length} Candidates · {selectedJob?.title}
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{ background: '#FFE500', border: '2.5px solid #FFE500', color: '#0a0a0a', padding: 10, cursor: 'pointer', boxShadow: '3px 3px 0 #FFE500', transition: 'all 0.1s' }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translate(2px,2px)'; e.currentTarget.style.boxShadow = '1px 1px 0 #FFE500'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '3px 3px 0 #FFE500'; }}
          >
            <X style={{ width: 18, height: 18 }} />
          </button>
        </div>

        {/* Comparison Columns */}
        <div style={{ flex: 1, overflowX: 'auto', overflowY: 'auto', padding: 24, background: '#fafaf5' }}>
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${candidates.length}, minmax(300px, 1fr))`, gap: 16, minWidth: `${candidates.length * 316}px` }}>
            {candidates.map((c) => {
              const name = c.candidate_name || c.name;
              const fit = c.fit_score || 0;
              const matched = c.matched_skills || [];
              const missing = c.missing_skills || [];
              const strengths = c.strengths || [];
              const scoreStyle = getScoreStyle(fit);

              return (
                <div key={c.id || c.candidate_id} className="nb-card-static" style={{ display: 'flex', flexDirection: 'column', gap: 0, overflow: 'hidden' }}>

                  {/* Score banner */}
                  <div style={{ background: scoreStyle.bg, borderBottom: '2.5px solid #0a0a0a', padding: '16px 18px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                      <h3 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 800, fontSize: 17, color: scoreStyle.color, margin: 0 }}>{name}</h3>
                      <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontWeight: 800, fontSize: 22, color: scoreStyle.color }}>{fit}/10</span>
                    </div>
                    <p style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 10, color: scoreStyle.color, opacity: 0.75, margin: 0 }}>{c.candidate_email || c.email}</p>

                    {/* Match bar */}
                    <div style={{ marginTop: 10 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'IBM Plex Mono, monospace', fontSize: 10, fontWeight: 700, color: scoreStyle.color, marginBottom: 4 }}>
                        <span>Semantic Match</span>
                        <span>{c.match_percentage || 0}%</span>
                      </div>
                      <div style={{ height: 8, background: 'rgba(0,0,0,0.2)', border: '1.5px solid rgba(0,0,0,0.3)' }}>
                        <div style={{ height: '100%', width: `${c.match_percentage || 0}%`, background: '#0a0a0a', transition: 'width 0.5s' }} />
                      </div>
                    </div>
                  </div>

                  <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 14, flex: 1 }}>

                    {/* Meta */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, borderBottom: '2px solid #0a0a0a', paddingBottom: 12 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 11, color: '#0a0a0a', opacity: 0.55 }}>Experience:</span>
                        <span className="nb-badge nb-badge-black" style={{ fontSize: 10 }}>{c.total_years_experience || 2} yrs</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 11, color: '#0a0a0a', opacity: 0.55 }}>Status:</span>
                        <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 10, fontWeight: 800, color: c.status === 'Shortlisted' ? '#00CC44' : '#0a0a0a' }}>
                          {c.status || 'Under Review'}
                        </span>
                      </div>
                    </div>

                    {/* Matched Skills */}
                    <div>
                      <h5 style={{ fontFamily: 'IBM Plex Mono, monospace', fontWeight: 800, fontSize: 10, color: '#00CC44', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 4, marginBottom: 8 }}>
                        <CheckCircle2 style={{ width: 12, height: 12 }} /> Matched ({matched.length})
                      </h5>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                        {matched.slice(0, 6).map(s => <span key={s} className="skill-chip-match" style={{ fontSize: 10 }}>{s}</span>)}
                        {matched.length > 6 && <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 10, color: '#00CC44', fontWeight: 700 }}>+{matched.length - 6}</span>}
                      </div>
                    </div>

                    {/* Missing Skills */}
                    <div>
                      <h5 style={{ fontFamily: 'IBM Plex Mono, monospace', fontWeight: 800, fontSize: 10, color: '#FF0099', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 4, marginBottom: 8 }}>
                        <XCircle style={{ width: 12, height: 12 }} /> Gaps ({missing.length})
                      </h5>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                        {missing.length > 0
                          ? missing.slice(0, 4).map(s => <span key={s} className="skill-chip-miss" style={{ fontSize: 10 }}>{s}</span>)
                          : <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 10, color: '#00CC44', fontWeight: 700 }}>Full Coverage!</span>
                        }
                      </div>
                    </div>

                    {/* Strengths */}
                    {strengths.length > 0 && (
                      <div>
                        <h5 style={{ fontFamily: 'IBM Plex Mono, monospace', fontWeight: 800, fontSize: 10, color: '#0066FF', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 4, marginBottom: 8 }}>
                          <ThumbsUp style={{ width: 12, height: 12 }} /> Strengths
                        </h5>
                        <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
                          {strengths.slice(0, 2).map((st, i) => (
                            <li key={i} style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 12, color: '#0a0a0a', lineHeight: 1.6 }}>→ {st}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                  </div>

                  {/* Actions */}
                  <div style={{ borderTop: '2.5px solid #0a0a0a', padding: '12px 16px', display: 'flex', gap: 8, background: '#fafaf5' }}>
                    <button
                      className="nb-btn nb-btn-green"
                      onClick={() => onStatusChange(c.id || c.candidate_id, 'Shortlisted')}
                      style={{ flex: 1, padding: '8px 12px', fontSize: 12, justifyContent: 'center' }}
                    >★ Shortlist</button>
                    <button
                      className="nb-btn nb-btn-black"
                      onClick={() => onSelectCandidate(c)}
                      style={{ padding: '8px 14px', fontSize: 12 }}
                    >Profile →</button>
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
