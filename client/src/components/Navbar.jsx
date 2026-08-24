import React from 'react';
import { Zap, FileUp, PlusCircle, Download, Settings, Briefcase, ChevronDown } from 'lucide-react';

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
      case 'gemini': return 'Gemini Flash';
      case 'openai': return 'GPT-4o';
      case 'groq': return 'Groq LLaMA';
      default: return 'Local AI';
    }
  };

  return (
    <header style={{ borderBottom: '3px solid #0a0a0a', background: '#FFE500', position: 'sticky', top: 0, zIndex: 40 }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>

        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
          <div style={{ width: 40, height: 40, background: '#0a0a0a', border: '2.5px solid #0a0a0a', boxShadow: '3px 3px 0 #0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Zap style={{ width: 22, height: 22, color: '#FFE500' }} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 800, fontSize: 20, color: '#0a0a0a', letterSpacing: '-0.5px' }}>
                TalentPulse
              </span>
              <span className="nb-badge nb-badge-black" style={{ fontSize: 9 }}>AI v2.0</span>
            </div>
            <p style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 10, color: '#0a0a0a', margin: 0, opacity: 0.7 }}>Smart Resume Screener</p>
          </div>
        </div>

        {/* Job Selector */}
        <div style={{ flex: 1, maxWidth: 420, position: 'relative' }}>
          <Briefcase style={{ width: 14, height: 14, position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#0a0a0a', zIndex: 1 }} />
          <select
            className="nb-select"
            value={selectedJob?.id || ''}
            onChange={(e) => {
              const job = jobs.find(j => j.id === e.target.value);
              if (job) onSelectJob(job);
            }}
            style={{ width: '100%', paddingLeft: 32, paddingRight: 36, paddingTop: 9, paddingBottom: 9, fontSize: 13, boxShadow: '3px 3px 0 #0a0a0a' }}
          >
            {jobs.map(job => (
              <option key={job.id} value={job.id}>
                {job.title} — {job.department}
              </option>
            ))}
          </select>
          <ChevronDown style={{ width: 14, height: 14, position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#0a0a0a' }} />
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>

          {/* Upload */}
          <button
            className="nb-btn nb-btn-black"
            onClick={onOpenUpload}
            style={{ padding: '8px 14px', fontSize: 13 }}
          >
            <FileUp style={{ width: 15, height: 15 }} />
            <span className="hidden-mobile">Upload</span>
            <span className="nb-badge nb-badge-yellow" style={{ marginLeft: 2 }}>{candidateCount}</span>
          </button>

          {/* New Job */}
          <button
            className="nb-btn nb-btn-white"
            onClick={onOpenNewJob}
            style={{ padding: '8px 14px', fontSize: 13 }}
            title="Create New Job"
          >
            <PlusCircle style={{ width: 15, height: 15 }} />
            <span className="hidden-mobile">New Job</span>
          </button>

          {/* Export */}
          <a
            href={selectedJob ? `/api/export/csv?job_id=${selectedJob.id}` : '/api/export/csv'}
            download
            className="nb-btn nb-btn-white"
            style={{ padding: '8px 14px', fontSize: 13 }}
            title="Export CSV"
          >
            <Download style={{ width: 15, height: 15 }} />
            <span className="hidden-mobile">Export</span>
          </a>

          {/* Settings */}
          <button
            className="nb-btn nb-btn-blue"
            onClick={onOpenSettings}
            style={{ padding: '8px 14px', fontSize: 13 }}
            title="LLM Settings"
          >
            <Settings style={{ width: 15, height: 15 }} />
            <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 11 }} className="hidden-desktop">{getProviderName(activeProvider)}</span>
          </button>

        </div>
      </div>

      <style>{`
        @media (max-width: 640px) { .hidden-mobile { display: none; } }
        @media (max-width: 768px) { .hidden-desktop { display: none; } }
      `}</style>
    </header>
  );
}
