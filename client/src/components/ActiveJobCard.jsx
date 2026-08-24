import React from 'react';
import { Target, Clock, GraduationCap, Zap, Loader2, GitCompare, Trash2 } from 'lucide-react';

export default function ActiveJobCard({
  job,
  onBatchScreen,
  isScreening,
  selectedForCompare,
  onOpenCompare,
  onDeleteJob
}) {
  if (!job) return null;

  const requiredSkills = Array.isArray(job.required_skills) ? job.required_skills : [];
  const niceSkills = Array.isArray(job.nice_to_have_skills) ? job.nice_to_have_skills : [];

  return (
    <div className="nb-card-static" style={{ padding: 24, marginBottom: 24, position: 'relative', overflow: 'hidden' }}>
      {/* Yellow top stripe */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 6, background: '#FFE500' }} />

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, alignItems: 'flex-start', marginTop: 6 }}>

        {/* Left: Job Info */}
        <div style={{ flex: 1, minWidth: 280 }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12, alignItems: 'center' }}>
            <span className="nb-badge nb-badge-black">
              <Target style={{ width: 10, height: 10 }} />
              Active Job Profile
            </span>
            <span className="nb-badge nb-badge-cream">{job.department}</span>
            <span className="nb-badge nb-badge-cream" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <Clock style={{ width: 10, height: 10 }} />
              {job.min_years_experience || 3}+ yrs exp
            </span>
            <span className="nb-badge nb-badge-cream" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <GraduationCap style={{ width: 10, height: 10 }} />
              {job.education_requirement ? job.education_requirement.slice(0, 28) : 'Degree Req.'}
            </span>
            {onDeleteJob && (
              <button
                type="button"
                onClick={() => onDeleteJob(job)}
                style={{
                  background: '#fafaf5',
                  border: '2px solid #0a0a0a',
                  color: '#FF0099',
                  boxShadow: '2px 2px 0 #0a0a0a',
                  fontFamily: 'IBM Plex Mono, monospace',
                  fontWeight: 800,
                  fontSize: 10,
                  textTransform: 'uppercase',
                  padding: '3px 8px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  marginLeft: 'auto'
                }}
                title="Delete this Job Profile"
              >
                <Trash2 style={{ width: 11, height: 11 }} />
                Delete Profile
              </button>
            )}
          </div>

          <h2 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 800, fontSize: 28, color: '#0a0a0a', margin: '0 0 8px', lineHeight: 1.1 }}>
            {job.title}
          </h2>
          <p style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 14, color: '#0a0a0a', opacity: 0.65, margin: '0 0 16px', lineHeight: 1.5 }}>
            {job.description}
          </p>

          {/* Skills */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'flex-start' }}>
            {requiredSkills.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>
                <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 11, fontWeight: 700, color: '#0066FF', textTransform: 'uppercase' }}>Required:</span>
                {requiredSkills.map(skill => (
                  <span key={skill} className="skill-chip-required">{skill}</span>
                ))}
              </div>
            )}

            {niceSkills.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>
                <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 11, fontWeight: 700, color: '#0a0a0a', opacity: 0.5, textTransform: 'uppercase' }}>Bonus:</span>
                {niceSkills.map(skill => (
                  <span key={skill} className="skill-chip-bonus">{skill}</span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: Action Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, minWidth: 220 }}>
          <button
            className="nb-btn nb-btn-primary"
            onClick={() => onBatchScreen(job.id)}
            disabled={isScreening}
            style={{ padding: '14px 22px', fontSize: 15, justifyContent: 'center', width: '100%' }}
          >
            {isScreening ? (
              <>
                <Loader2 style={{ width: 18, height: 18, animation: 'nb-spin 0.8s linear infinite' }} />
                Screening All...
              </>
            ) : (
              <>
                <Zap style={{ width: 18, height: 18 }} />
                1-Click AI Batch Screen
              </>
            )}
          </button>

          {selectedForCompare.length >= 2 && (
            <button
              className="nb-btn nb-btn-blue"
              onClick={onOpenCompare}
              style={{ padding: '10px 16px', fontSize: 13, justifyContent: 'center', width: '100%' }}
            >
              <GitCompare style={{ width: 16, height: 16 }} />
              Compare Selected ({selectedForCompare.length})
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
