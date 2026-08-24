import React from 'react';
import { ArrowUpDown, ChevronRight, Trash2 } from 'lucide-react';

function getScoreStyle(score) {
  if (score >= 8.5) return { background: '#00CC44', color: '#0a0a0a' };
  if (score >= 7.0) return { background: '#0066FF', color: '#fff' };
  if (score >= 5.0) return { background: '#FF5500', color: '#fff' };
  return { background: '#FF0099', color: '#fff' };
}

function getStatusStyle(status) {
  switch (status) {
    case 'Shortlisted':         return { background: '#00CC44', color: '#0a0a0a' };
    case 'Interview Scheduled': return { background: '#0066FF', color: '#fff' };
    case 'Rejected':            return { background: '#FF0099', color: '#fff' };
    default:                    return { background: '#FFE500', color: '#0a0a0a' };
  }
}

const TH_STYLE = {
  fontFamily: 'IBM Plex Mono, monospace',
  fontWeight: 800,
  fontSize: 10,
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  color: '#0a0a0a',
  padding: '12px 16px',
  background: '#FFE500',
  borderBottom: '2.5px solid #0a0a0a',
  whiteSpace: 'nowrap',
  cursor: 'pointer',
  userSelect: 'none',
};

const TD_STYLE = {
  padding: '12px 16px',
  borderBottom: '1.5px solid #0a0a0a',
  verticalAlign: 'middle',
};

export default function CandidateTable({
  candidates,
  onSelect,
  onStatusChange,
  selectedForCompare,
  onToggleCompare,
  sortField,
  sortOrder,
  onSort,
  onDeleteCandidate
}) {
  return (
    <div className="nb-card-static" style={{ overflow: 'hidden' }}>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'Space Grotesk, sans-serif' }}>
          <thead>
            <tr>
              <th style={{ ...TH_STYLE, width: 40, cursor: 'default' }}></th>
              <th style={TH_STYLE} onClick={() => onSort('name')}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  Candidate {sortField === 'name' && <ArrowUpDown style={{ width: 11, height: 11 }} />}
                </span>
              </th>
              <th style={TH_STYLE} onClick={() => onSort('fit_score')}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  Fit Score {sortField === 'fit_score' && <ArrowUpDown style={{ width: 11, height: 11 }} />}
                </span>
              </th>
              <th style={TH_STYLE} onClick={() => onSort('experience')}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  Experience {sortField === 'experience' && <ArrowUpDown style={{ width: 11, height: 11 }} />}
                </span>
              </th>
              <th style={{ ...TH_STYLE, cursor: 'default' }}>Matched Skills</th>
              <th style={{ ...TH_STYLE, cursor: 'default' }}>Status</th>
              <th style={{ ...TH_STYLE, cursor: 'default', textAlign: 'right' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {candidates.map((c, i) => {
              const isSelected = selectedForCompare.some(item => (item.id || item.candidate_id) === (c.id || c.candidate_id));
              const scoreStyle = c.fit_score !== null && c.fit_score !== undefined ? getScoreStyle(c.fit_score) : null;
              const statusStyle = getStatusStyle(c.status || 'Under Review');
              const rowBg = isSelected ? '#fffbe0' : i % 2 === 0 ? '#fafaf5' : '#fff';

              return (
                <tr
                  key={c.id || c.candidate_id}
                  style={{ background: rowBg, cursor: 'pointer', transition: 'background 0.1s' }}
                  onClick={() => onSelect(c)}
                  onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = '#f0edff'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = isSelected ? '#fffbe0' : rowBg; }}
                >
                  {/* Checkbox */}
                  <td style={TD_STYLE} onClick={e => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => onToggleCompare(c)}
                      style={{ width: 16, height: 16, border: '2px solid #0a0a0a', borderRadius: 0, cursor: 'pointer', accentColor: '#FFE500' }}
                    />
                  </td>

                  {/* Name */}
                  <td style={TD_STYLE}>
                    <div style={{ fontWeight: 700, fontSize: 14, color: '#0a0a0a' }}>{c.candidate_name || c.name}</div>
                    <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 10, color: '#0a0a0a', opacity: 0.5, marginTop: 2 }}>
                      {c.candidate_email || c.email || ''}
                    </div>
                  </td>

                  {/* Fit Score */}
                  <td style={TD_STYLE}>
                    {c.fit_score !== undefined && c.fit_score !== null ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ ...scoreStyle, fontFamily: 'IBM Plex Mono, monospace', fontWeight: 800, fontSize: 13, border: '2px solid #0a0a0a', padding: '3px 8px', display: 'inline-block' }}>
                          {c.fit_score}/10
                        </span>
                        <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 10, color: '#0a0a0a', opacity: 0.5 }}>
                          {c.match_percentage}%
                        </span>
                      </div>
                    ) : (
                      <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 10, color: '#0a0a0a', opacity: 0.4, fontStyle: 'italic' }}>Unscreened</span>
                    )}
                  </td>

                  {/* Experience */}
                  <td style={TD_STYLE}>
                    <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontWeight: 700, fontSize: 13, color: '#0a0a0a' }}>
                      {c.total_years_experience || c.totalYearsExperience || '—'}{c.total_years_experience ? ' yrs' : ''}
                    </span>
                  </td>

                  {/* Matched Skills */}
                  <td style={TD_STYLE}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, maxWidth: 260 }}>
                      {(c.matched_skills || []).slice(0, 3).map(skill => (
                        <span key={skill} className="skill-chip-match" style={{ fontSize: 10 }}>{skill}</span>
                      ))}
                      {(c.matched_skills || []).length > 3 && (
                        <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 10, color: '#00CC44', fontWeight: 700 }}>+{(c.matched_skills || []).length - 3}</span>
                      )}
                    </div>
                  </td>

                  {/* Status */}
                  <td style={TD_STYLE} onClick={e => e.stopPropagation()}>
                    <select
                      value={c.status || 'Under Review'}
                      onChange={e => onStatusChange(c.id || c.candidate_id, e.target.value)}
                      style={{
                        ...statusStyle,
                        fontFamily: 'IBM Plex Mono, monospace', fontWeight: 700, fontSize: 10,
                        border: '2px solid #0a0a0a', padding: '4px 8px',
                        cursor: 'pointer', outline: 'none', appearance: 'none',
                        textTransform: 'uppercase', letterSpacing: '0.04em',
                        boxShadow: '2px 2px 0 #0a0a0a'
                      }}
                    >
                      <option value="Under Review">Under Review</option>
                      <option value="Shortlisted">★ Shortlisted</option>
                      <option value="Interview Scheduled">Interview Scheduled</option>
                      <option value="Rejected">Rejected</option>
                    </select>
                  </td>

                  {/* Action */}
                  <td style={{ ...TD_STYLE, textAlign: 'right' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 6 }}>
                      {onDeleteCandidate && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteCandidate(c);
                          }}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#FF0099',
                            cursor: 'pointer',
                            padding: '4px',
                            display: 'flex',
                            alignItems: 'center',
                            opacity: 0.6,
                            transition: 'opacity 0.1s'
                          }}
                          onMouseEnter={e => e.currentTarget.style.opacity = '1'}
                          onMouseLeave={e => e.currentTarget.style.opacity = '0.6'}
                          title="Delete Candidate Profile"
                        >
                          <Trash2 style={{ width: 14, height: 14 }} />
                        </button>
                      )}
                      <button
                        onClick={() => onSelect(c)}
                        style={{ background: '#0a0a0a', border: '2px solid #0a0a0a', color: '#FFE500', padding: '5px 8px', cursor: 'pointer', boxShadow: '2px 2px 0 #FFE500', transition: 'all 0.1s' }}
                      >
                        <ChevronRight style={{ width: 14, height: 14 }} />
                      </button>
                    </div>
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
