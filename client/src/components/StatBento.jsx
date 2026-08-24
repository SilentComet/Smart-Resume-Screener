import React from 'react';
import { Users, UserCheck, Award, AlertTriangle } from 'lucide-react';

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

  const cards = [
    {
      label: 'Total Applicants',
      value: totalCandidates,
      unit: null,
      sub: `${totalScreened} screened · ${totalCandidates - totalScreened} pending`,
      icon: <Users style={{ width: 24, height: 24 }} />,
      accent: '#0066FF',
      textColor: '#fff',
    },
    {
      label: 'Shortlisted',
      value: shortlistedCount,
      unit: null,
      sub: `${shortlistRatio}% of screened pool`,
      icon: <UserCheck style={{ width: 24, height: 24 }} />,
      accent: '#00CC44',
      textColor: '#0a0a0a',
    },
    {
      label: 'Avg Fit Score',
      value: avgFitScore,
      unit: '/ 10',
      sub: `${avgMatchPct}% avg semantic match`,
      icon: <Award style={{ width: 24, height: 24 }} />,
      accent: '#FFE500',
      textColor: '#0a0a0a',
      hasBar: true,
      barPct: Math.min(100, Math.max(0, avgMatchPct)),
    },
    {
      label: 'Top Skill Gaps',
      value: null,
      sub: null,
      icon: <AlertTriangle style={{ width: 24, height: 24 }} />,
      accent: '#FF0099',
      textColor: '#fff',
      isGaps: true,
    },
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 24 }}>
      {cards.map((card, i) => (
        <div
          key={i}
          className="nb-card-static"
          style={{ padding: 20, position: 'relative', overflow: 'hidden' }}
        >
          {/* Accent strip */}
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: card.accent }} />

          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginTop: 6 }}>
            <div style={{ flex: 1 }}>
              <p style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#0a0a0a', opacity: 0.6, margin: 0 }}>
                {card.label}
              </p>

              {card.isGaps ? (
                <div style={{ marginTop: 10, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {topMissingSkills.length > 0 ? (
                    topMissingSkills.slice(0, 3).map(({ skill, count }) => (
                      <span key={skill} className="nb-badge nb-badge-pink">
                        {skill} ({count})
                      </span>
                    ))
                  ) : (
                    <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 11, color: '#0a0a0a', opacity: 0.5 }}>No major gaps</span>
                  )}
                </div>
              ) : (
                <>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginTop: 4 }}>
                    <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontWeight: 800, fontSize: 36, color: '#0a0a0a', lineHeight: 1 }}>
                      {card.value}
                    </span>
                    {card.unit && (
                      <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 14, fontWeight: 600, color: '#0a0a0a', opacity: 0.5 }}>{card.unit}</span>
                    )}
                  </div>

                  {card.hasBar && (
                    <div className="nb-progress" style={{ marginTop: 8, marginBottom: 4 }}>
                      <div className="nb-progress-fill" style={{ width: `${card.barPct}%`, background: '#0066FF' }} />
                    </div>
                  )}

                  <p style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 10, color: '#0a0a0a', opacity: 0.55, margin: '6px 0 0' }}>
                    {card.sub}
                  </p>
                </>
              )}
            </div>

            <div style={{ width: 44, height: 44, background: card.accent, border: '2px solid #0a0a0a', boxShadow: '3px 3px 0 #0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center', color: card.textColor, flexShrink: 0 }}>
              {card.icon}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
