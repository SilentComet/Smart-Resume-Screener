import React, { useState, useRef, useEffect } from 'react';
import { Zap, FileUp, PlusCircle, Download, Settings, Briefcase, ChevronDown, Check, Trash2 } from 'lucide-react';

export default function Navbar({
  jobs,
  selectedJob,
  onSelectJob,
  onOpenUpload,
  onOpenNewJob,
  onOpenSettings,
  onDeleteJob,
  candidateCount,
  activeProvider
}) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const getProviderName = (p) => {
    switch (p) {
      case 'gemini': return 'Gemini Flash';
      case 'openai': return 'GPT-4o';
      case 'groq': return 'Groq LLaMA';
      default: return 'Local AI';
    }
  };

  // Close dropdown on click outside or Escape key
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    function handleKeyDown(event) {
      if (event.key === 'Escape') setDropdownOpen(false);
    }
    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [dropdownOpen]);

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
                Smart Resume Screener
              </span>
            </div>
            <p style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 10, color: '#0a0a0a', margin: 0, opacity: 0.7 }}>AI-Powered ATS & Talent Matcher</p>
          </div>
        </div>

        {/* Custom Neo-Brutalist Job Selector */}
        <div ref={dropdownRef} style={{ flex: 1, maxWidth: 460, position: 'relative' }}>
          <button
            type="button"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            style={{
              width: '100%',
              background: '#fafaf5',
              border: '2.5px solid #0a0a0a',
              boxShadow: dropdownOpen ? '1px 1px 0 #0a0a0a' : '3px 3px 0 #0a0a0a',
              transform: dropdownOpen ? 'translate(2px, 2px)' : 'none',
              padding: '8px 14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 10,
              cursor: 'pointer',
              transition: 'all 0.1s ease',
              textAlign: 'left'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, overflow: 'hidden' }}>
              <div style={{ width: 26, height: 26, background: '#FFE500', border: '2px solid #0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Briefcase style={{ width: 14, height: 14, color: '#0a0a0a' }} />
              </div>
              <div style={{ overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                <span style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 800, fontSize: 13, color: '#0a0a0a', marginRight: 8 }}>
                  {selectedJob?.title || 'Select a Job Profile'}
                </span>
                {selectedJob?.department && (
                  <span className="nb-badge nb-badge-black" style={{ fontSize: 9, padding: '1px 6px' }}>
                    {selectedJob.department}
                  </span>
                )}
              </div>
            </div>
            <ChevronDown style={{ width: 16, height: 16, color: '#0a0a0a', flexShrink: 0, transform: dropdownOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s ease' }} />
          </button>

          {/* Neo-Brutalist Dropdown Popup Menu */}
          {dropdownOpen && (
            <div
              style={{
                position: 'absolute',
                top: 'calc(100% + 6px)',
                left: 0,
                right: 0,
                background: '#fafaf5',
                border: '3px solid #0a0a0a',
                boxShadow: '5px 5px 0 #0a0a0a',
                zIndex: 60,
                maxHeight: 340,
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              {/* Dropdown Header */}
              <div style={{ background: '#0a0a0a', padding: '8px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 10, fontWeight: 800, color: '#FFE500', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  Select Active Job Profile ({jobs.length})
                </span>
                <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 9, color: '#fafaf5', opacity: 0.6 }}>
                  Target for AI match
                </span>
              </div>

              {/* Jobs List */}
              {jobs.map((job, idx) => {
                const isSelected = selectedJob?.id === job.id;
                return (
                  <div
                    key={job.id}
                    onClick={() => {
                      onSelectJob(job);
                      setDropdownOpen(false);
                    }}
                    style={{
                      padding: '10px 14px',
                      background: isSelected ? '#FFE500' : '#fafaf5',
                      borderBottom: idx === jobs.length - 1 ? 'none' : '2px solid #0a0a0a',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 12,
                      transition: 'background 0.1s ease'
                    }}
                    onMouseEnter={e => {
                      if (!isSelected) e.currentTarget.style.background = '#fff8bd';
                    }}
                    onMouseLeave={e => {
                      if (!isSelected) e.currentTarget.style.background = '#fafaf5';
                    }}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <span style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 800, fontSize: 13, color: '#0a0a0a' }}>
                        {job.title}
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 10, color: '#0a0a0a', opacity: 0.7 }}>
                          {job.department}
                        </span>
                        <span style={{ color: '#0a0a0a', opacity: 0.4, fontSize: 10 }}>•</span>
                        <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 10, color: '#0a0a0a', opacity: 0.7 }}>
                          {job.experience_level || 'Mid-Senior'}
                        </span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                      {isSelected && (
                        <div style={{ width: 22, height: 22, background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Check style={{ width: 14, height: 14, color: '#FFE500', strokeWidth: 3 }} />
                        </div>
                      )}
                      {onDeleteJob && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteJob(job);
                          }}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#FF0099',
                            cursor: 'pointer',
                            padding: '4px',
                            display: 'flex',
                            alignItems: 'center',
                            opacity: 0.5,
                            transition: 'opacity 0.1s'
                          }}
                          onMouseEnter={e => e.currentTarget.style.opacity = '1'}
                          onMouseLeave={e => e.currentTarget.style.opacity = '0.5'}
                          title="Delete this Job Profile"
                        >
                          <Trash2 style={{ width: 14, height: 14 }} />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
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
