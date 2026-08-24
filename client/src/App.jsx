import React, { useState, useEffect } from 'react';
import { Zap, LayoutGrid, Table, Search, UserCheck } from 'lucide-react';
import confetti from 'canvas-confetti';

import Navbar from './components/Navbar.jsx';
import StatBento from './components/StatBento.jsx';
import ActiveJobCard from './components/ActiveJobCard.jsx';
import CandidateCard from './components/CandidateCard.jsx';
import CandidateTable from './components/CandidateTable.jsx';
import CandidateDetailModal from './components/CandidateDetailModal.jsx';
import CandidateComparisonModal from './components/CandidateComparisonModal.jsx';
import UploadModal from './components/UploadModal.jsx';
import JobModal from './components/JobModal.jsx';
import SettingsModal from './components/SettingsModal.jsx';

import {
  fetchJobs, fetchCandidates, fetchScreeningsForJob,
  batchScreenCandidates, screenSingleCandidate, updateCandidateStatus,
  fetchStats, fetchSettings
} from './api/client.js';

export default function App() {
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [screenings, setScreenings] = useState([]);
  const [stats, setStats] = useState({});
  const [activeProvider, setActiveProvider] = useState('fallback');

  const [viewMode, setViewMode] = useState('grid');
  const [statusFilter, setStatusFilter] = useState('All');
  const [minScoreFilter, setMinScoreFilter] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState('fit_score');
  const [sortOrder, setSortOrder] = useState('desc');

  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [selectedForCompare, setSelectedForCompare] = useState([]);
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isJobModalOpen, setIsJobModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isScreening, setIsScreening] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => { setToastMessage(msg); setTimeout(() => setToastMessage(null), 3500); };

  const loadInitialData = async () => {
    try {
      const [jobsData, candidatesData, settingsData] = await Promise.all([fetchJobs(), fetchCandidates(), fetchSettings()]);
      setJobs(jobsData);
      setCandidates(candidatesData);
      if (settingsData?.activeProvider) setActiveProvider(settingsData.activeProvider);
      if (jobsData.length > 0) {
        const defaultJob = selectedJob ? jobsData.find(j => j.id === selectedJob.id) || jobsData[0] : jobsData[0];
        setSelectedJob(defaultJob);
        await loadJobData(defaultJob.id);
      }
    } catch (err) { console.error('Initial data load error:', err); }
  };

  const loadJobData = async (jobId) => {
    try {
      const [screeningsData, statsData] = await Promise.all([fetchScreeningsForJob(jobId), fetchStats(jobId)]);
      setScreenings(screeningsData);
      setStats(statsData);
    } catch (err) { console.error('Job data load error:', err); }
  };

  useEffect(() => { loadInitialData(); }, []);

  const handleSelectJob = async (job) => { setSelectedJob(job); setSelectedForCompare([]); await loadJobData(job.id); };

  const handleBatchScreen = async (jobId) => {
    setIsScreening(true);
    try {
      const res = await batchScreenCandidates(jobId);
      showToast(`🎯 ${res.message}`);
      await loadJobData(jobId);
      confetti({ particleCount: 50, spread: 70, origin: { y: 0.5 } });
    } catch (err) { showToast(`❌ Screening error: ${err.message}`); }
    finally { setIsScreening(false); }
  };

  const handleScreenSingle = async (candidate) => {
    if (!selectedJob) return;
    setIsScreening(true);
    try {
      const candId = candidate.id || candidate.candidate_id;
      const res = await screenSingleCandidate(candId, selectedJob.id);
      showToast(`Evaluated ${candidate.name || candidate.candidate_name}: Fit Score ${res.fit_score}/10`);
      await loadJobData(selectedJob.id);
      if (selectedCandidate && (selectedCandidate.id === candId || selectedCandidate.candidate_id === candId)) setSelectedCandidate(res);
    } catch (err) { showToast(`❌ Error: ${err.message}`); }
    finally { setIsScreening(false); }
  };

  const handleStatusChange = async (candidateIdOrScreeningId, newStatus) => {
    try {
      const screening = screenings.find(s => s.id === candidateIdOrScreeningId || s.candidate_id === candidateIdOrScreeningId);
      if (screening) {
        await updateCandidateStatus(screening.id, newStatus);
        setScreenings(prev => prev.map(s => s.id === screening.id ? { ...s, status: newStatus } : s));
        if (selectedCandidate && (selectedCandidate.id === screening.id || selectedCandidate.candidate_id === screening.candidate_id)) {
          setSelectedCandidate(prev => ({ ...prev, status: newStatus }));
        }
        showToast(`Status → "${newStatus}"`);
        const statsData = await fetchStats(selectedJob?.id);
        setStats(statsData);
      }
    } catch (err) { showToast(`❌ Status update failed: ${err.message}`); }
  };

  const handleToggleCompare = (candidate) => {
    const candId = candidate.id || candidate.candidate_id;
    const exists = selectedForCompare.some(c => (c.id || c.candidate_id) === candId);
    if (exists) {
      setSelectedForCompare(prev => prev.filter(c => (c.id || c.candidate_id) !== candId));
    } else {
      if (selectedForCompare.length >= 4) { showToast('Max 4 candidates for comparison.'); return; }
      setSelectedForCompare(prev => [...prev, candidate]);
    }
  };

  const combinedCandidates = candidates.map(cand => {
    const screening = screenings.find(s => s.candidate_id === cand.id);
    if (screening) {
      return { ...screening, name: cand.name, email: cand.email, phone: cand.phone, location: cand.location, total_years_experience: cand.total_years_experience, skills: cand.skills, skills_by_category: cand.skills_by_category, experience: cand.experience, education: cand.education, raw_text: cand.raw_text };
    }
    return { ...cand, candidate_id: cand.id, candidate_name: cand.name, candidate_email: cand.email, candidate_location: cand.location, status: 'Unscreened', fit_score: null, match_percentage: 0, matched_skills: [], missing_skills: [] };
  });

  const filteredCandidates = combinedCandidates.filter(c => {
    if (statusFilter !== 'All') {
      if (statusFilter === 'Shortlisted' && c.status !== 'Shortlisted') return false;
      if (statusFilter === 'Under Review' && c.status !== 'Under Review') return false;
      if (statusFilter === 'Interview Scheduled' && c.status !== 'Interview Scheduled') return false;
      if (statusFilter === 'Rejected' && c.status !== 'Rejected') return false;
    }
    if (minScoreFilter > 0) {
      if (c.fit_score === null || c.fit_score < minScoreFilter) return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const nameMatch = (c.candidate_name || c.name || '').toLowerCase().includes(q);
      const skillMatch = (c.skills || c.candidate_skills || []).some(s => s.toLowerCase().includes(q));
      const textMatch = (c.raw_text || '').toLowerCase().includes(q);
      if (!nameMatch && !skillMatch && !textMatch) return false;
    }
    return true;
  });

  const sortedCandidates = [...filteredCandidates].sort((a, b) => {
    let valA = a[sortField], valB = b[sortField];
    if (sortField === 'fit_score') { valA = a.fit_score !== null ? a.fit_score : -1; valB = b.fit_score !== null ? b.fit_score : -1; }
    else if (sortField === 'experience') { valA = a.total_years_experience || 0; valB = b.total_years_experience || 0; }
    else if (sortField === 'name') { valA = (a.candidate_name || a.name || '').toLowerCase(); valB = (b.candidate_name || b.name || '').toLowerCase(); }
    if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
    if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  const handleSort = (field) => {
    if (sortField === field) setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortOrder('desc'); }
  };

  const STATUS_FILTERS = ['All', 'Shortlisted', 'Under Review', 'Interview Scheduled', 'Rejected'];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--cream)' }}>

      <Navbar
        jobs={jobs} selectedJob={selectedJob} onSelectJob={handleSelectJob}
        onOpenUpload={() => setIsUploadOpen(true)} onOpenNewJob={() => setIsJobModalOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        candidateCount={candidates.length} activeProvider={activeProvider}
      />

      <main style={{ flex: 1, maxWidth: 1280, width: '100%', margin: '0 auto', padding: '24px 24px 48px' }}>

        {/* Toast */}
        {toastMessage && (
          <div className="nb-toast">
            <Zap style={{ width: 16, height: 16, display: 'inline', marginRight: 8 }} />
            {toastMessage}
          </div>
        )}

        <StatBento stats={stats} selectedJob={selectedJob} />
        <ActiveJobCard job={selectedJob} onBatchScreen={handleBatchScreen} isScreening={isScreening} selectedForCompare={selectedForCompare} onOpenCompare={() => setIsCompareOpen(true)} />

        {/* Search, Filter & View Controls */}
        <div className="nb-card-static" style={{ padding: 16, marginBottom: 20 }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center', justifyContent: 'space-between' }}>

            {/* Search */}
            <div style={{ position: 'relative', flex: 1, minWidth: 200, maxWidth: 360 }}>
              <Search style={{ width: 14, height: 14, position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#0a0a0a', opacity: 0.4 }} />
              <input
                type="text"
                className="nb-input"
                placeholder="Search by name, skill, keyword..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{ width: '100%', paddingLeft: 32, paddingRight: 12, paddingTop: 9, paddingBottom: 9, fontSize: 13, boxShadow: '2px 2px 0 #0a0a0a' }}
              />
            </div>

            {/* Status Filters */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>
              {STATUS_FILTERS.map(st => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  style={{
                    fontFamily: 'IBM Plex Mono, monospace', fontWeight: 800, fontSize: 10, textTransform: 'uppercase',
                    letterSpacing: '0.05em', padding: '5px 12px',
                    background: statusFilter === st ? '#0a0a0a' : '#fff',
                    color: statusFilter === st ? '#FFE500' : '#0a0a0a',
                    border: '2px solid #0a0a0a',
                    boxShadow: statusFilter === st ? '2px 2px 0 #FFE500' : '2px 2px 0 #0a0a0a',
                    cursor: 'pointer', transition: 'all 0.1s'
                  }}
                >
                  {st === 'Shortlisted' ? '★ ' + st : st}
                </button>
              ))}
            </div>

            {/* Right Controls */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              {/* Min Score */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 11, fontWeight: 700, color: '#0a0a0a', opacity: 0.6, whiteSpace: 'nowrap' }}>Min Fit:</span>
                <input type="range" min="0" max="9" step="0.5" value={minScoreFilter} onChange={e => setMinScoreFilter(parseFloat(e.target.value))} style={{ width: 80, accentColor: '#0a0a0a', cursor: 'pointer' }} />
                <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontWeight: 800, fontSize: 13, color: '#0a0a0a', background: '#FFE500', border: '2px solid #0a0a0a', padding: '2px 8px', minWidth: 36, textAlign: 'center' }}>{minScoreFilter}+</span>
              </div>

              {/* View Toggle */}
              <div style={{ display: 'flex', border: '2.5px solid #0a0a0a', overflow: 'hidden', boxShadow: '3px 3px 0 #0a0a0a' }}>
                <button
                  onClick={() => setViewMode('grid')}
                  style={{ padding: '7px 12px', background: viewMode === 'grid' ? '#0a0a0a' : '#fff', color: viewMode === 'grid' ? '#FFE500' : '#0a0a0a', border: 'none', cursor: 'pointer', borderRight: '2px solid #0a0a0a' }}
                  title="Grid View"
                >
                  <LayoutGrid style={{ width: 15, height: 15 }} />
                </button>
                <button
                  onClick={() => setViewMode('table')}
                  style={{ padding: '7px 12px', background: viewMode === 'table' ? '#0a0a0a' : '#fff', color: viewMode === 'table' ? '#FFE500' : '#0a0a0a', border: 'none', cursor: 'pointer' }}
                  title="Table View"
                >
                  <Table style={{ width: 15, height: 15 }} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Candidates Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <h3 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 800, fontSize: 20, color: '#0a0a0a', margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
            Candidates
            <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontWeight: 800, fontSize: 12, background: '#0a0a0a', color: '#FFE500', border: '2px solid #0a0a0a', padding: '2px 10px', boxShadow: '2px 2px 0 #FFE500' }}>
              {sortedCandidates.length} results
            </span>
          </h3>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 11, color: '#0a0a0a', opacity: 0.5 }}>Sort by:</span>
            {['fit_score', 'experience', 'name'].map(field => (
              <button
                key={field}
                onClick={() => handleSort(field)}
                style={{
                  fontFamily: 'IBM Plex Mono, monospace', fontWeight: 700, fontSize: 11, textTransform: 'uppercase',
                  background: sortField === field ? '#FFE500' : '#fff',
                  color: '#0a0a0a', border: '2px solid #0a0a0a',
                  boxShadow: sortField === field ? '2px 2px 0 #0a0a0a' : '2px 2px 0 #0a0a0a',
                  padding: '4px 10px', cursor: 'pointer', transition: 'all 0.1s',
                  opacity: sortField === field ? 1 : 0.6
                }}
              >
                {field === 'fit_score' ? 'Score' : field === 'experience' ? 'Exp' : 'Name'}
                {sortField === field && (sortOrder === 'asc' ? ' ↑' : ' ↓')}
              </button>
            ))}
          </div>
        </div>

        {/* Candidate List */}
        {sortedCandidates.length > 0 ? (
          viewMode === 'grid' ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
              {sortedCandidates.map(candidate => (
                <CandidateCard
                  key={candidate.id || candidate.candidate_id}
                  candidate={candidate}
                  onSelect={setSelectedCandidate}
                  onStatusChange={handleStatusChange}
                  isSelectedForCompare={selectedForCompare.some(c => (c.id || c.candidate_id) === (candidate.id || candidate.candidate_id))}
                  onToggleCompare={handleToggleCompare}
                  onScreenSingle={handleScreenSingle}
                  isScreening={isScreening}
                />
              ))}
            </div>
          ) : (
            <CandidateTable
              candidates={sortedCandidates}
              onSelect={setSelectedCandidate}
              onStatusChange={handleStatusChange}
              selectedForCompare={selectedForCompare}
              onToggleCompare={handleToggleCompare}
              sortField={sortField}
              sortOrder={sortOrder}
              onSort={handleSort}
            />
          )
        ) : (
          <div className="nb-card-static" style={{ padding: 48, textAlign: 'center' }}>
            <div style={{ width: 60, height: 60, background: '#FFE500', border: '3px solid #0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', boxShadow: '4px 4px 0 #0a0a0a' }}>
              <UserCheck style={{ width: 30, height: 30, color: '#0a0a0a' }} />
            </div>
            <h4 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 800, fontSize: 18, color: '#0a0a0a', margin: '0 0 8px' }}>No candidates match your filter</h4>
            <p style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 12, color: '#0a0a0a', opacity: 0.55, margin: '0 0 20px' }}>Try adjusting your score filter, resetting status, or uploading more resumes.</p>
            <button
              className="nb-btn nb-btn-primary"
              onClick={() => { setStatusFilter('All'); setMinScoreFilter(0); setSearchQuery(''); }}
              style={{ padding: '10px 24px', fontSize: 13 }}
            >
              Reset All Filters
            </button>
          </div>
        )}

      </main>

      {/* Footer */}
      <footer style={{ borderTop: '3px solid #0a0a0a', padding: '16px 24px', background: '#0a0a0a' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 8, height: 8, background: '#00CC44', border: '1.5px solid #00CC44', display: 'inline-block' }} />
            <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 11, color: '#fafaf5', opacity: 0.7 }}>
              TalentPulse AI Smart Screener · Privacy Preserved · Local SQLite DB
            </span>
          </div>
          <div style={{ display: 'flex', gap: 16 }}>
            <a href="/api/export/json" target="_blank" style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 11, color: '#FFE500', fontWeight: 700, textDecoration: 'none' }}>JSON API →</a>
            <a href="/api/export/csv" download style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 11, color: '#FFE500', fontWeight: 700, textDecoration: 'none' }}>CSV Export →</a>
          </div>
        </div>
      </footer>

      {/* Modals */}
      {selectedCandidate && (
        <CandidateDetailModal candidate={selectedCandidate} selectedJob={selectedJob} onClose={() => setSelectedCandidate(null)} onStatusChange={handleStatusChange} onReScreen={handleScreenSingle} isScreening={isScreening} />
      )}
      {isCompareOpen && (
        <CandidateComparisonModal candidates={selectedForCompare} selectedJob={selectedJob} onClose={() => setIsCompareOpen(false)} onStatusChange={handleStatusChange} onSelectCandidate={c => { setIsCompareOpen(false); setSelectedCandidate(c); }} />
      )}
      {isUploadOpen && (
        <UploadModal onClose={() => setIsUploadOpen(false)} onSuccess={() => { loadInitialData(); showToast('Resumes uploaded and indexed!'); }} />
      )}
      {isJobModalOpen && (
        <JobModal onClose={() => setIsJobModalOpen(false)} onSuccess={created => { loadInitialData(); setSelectedJob(created); showToast(`Created: ${created.title}`); }} />
      )}
      {isSettingsOpen && (
        <SettingsModal onClose={() => setIsSettingsOpen(false)} onProviderChanged={p => { setActiveProvider(p); showToast(`LLM Engine: ${p}`); }} />
      )}

    </div>
  );
}
