import React, { useState, useEffect } from 'react';
import { 
  Sparkles, LayoutGrid, Table, Search, Filter, SlidersHorizontal, 
  UserCheck, RefreshCw, AlertCircle, Plus, FileUp, Download 
} from 'lucide-react';
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

  // UI View & Filter State
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'
  const [statusFilter, setStatusFilter] = useState('All'); // 'All' | 'Shortlisted' | 'Under Review' | 'Interview Scheduled' | 'Rejected'
  const [minScoreFilter, setMinScoreFilter] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState('fit_score');
  const [sortOrder, setSortOrder] = useState('desc');

  // Modals & Selection
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [selectedForCompare, setSelectedForCompare] = useState([]);
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isJobModalOpen, setIsJobModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isScreening, setIsScreening] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Show Toast
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Initial Load
  const loadInitialData = async () => {
    try {
      const [jobsData, candidatesData, settingsData] = await Promise.all([
        fetchJobs(),
        fetchCandidates(),
        fetchSettings()
      ]);

      setJobs(jobsData);
      setCandidates(candidatesData);
      if (settingsData?.activeProvider) {
        setActiveProvider(settingsData.activeProvider);
      }

      if (jobsData.length > 0) {
        const defaultJob = selectedJob ? jobsData.find(j => j.id === selectedJob.id) || jobsData[0] : jobsData[0];
        setSelectedJob(defaultJob);
        await loadJobData(defaultJob.id);
      }
    } catch (err) {
      console.error('Initial data load error:', err);
    }
  };

  const loadJobData = async (jobId) => {
    try {
      const [screeningsData, statsData] = await Promise.all([
        fetchScreeningsForJob(jobId),
        fetchStats(jobId)
      ]);
      setScreenings(screeningsData);
      setStats(statsData);
    } catch (err) {
      console.error('Job data load error:', err);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  // When selected job changes
  const handleSelectJob = async (job) => {
    setSelectedJob(job);
    setSelectedForCompare([]);
    await loadJobData(job.id);
  };

  // 1-Click AI Batch Screening
  const handleBatchScreen = async (jobId) => {
    setIsScreening(true);
    try {
      const res = await batchScreenCandidates(jobId);
      showToast(`🎯 ${res.message}`);
      await loadJobData(jobId);
      confetti({ particleCount: 50, spread: 70, origin: { y: 0.5 } });
    } catch (err) {
      showToast(`❌ Screening error: ${err.message}`);
    } finally {
      setIsScreening(false);
    }
  };

  // Single Candidate Screen
  const handleScreenSingle = async (candidate) => {
    if (!selectedJob) return;
    setIsScreening(true);
    try {
      const candId = candidate.id || candidate.candidate_id;
      const res = await screenSingleCandidate(candId, selectedJob.id);
      showToast(`Evaluated ${candidate.name || candidate.candidate_name}: Fit Score ${res.fit_score}/10`);
      await loadJobData(selectedJob.id);
      if (selectedCandidate && (selectedCandidate.id === candId || selectedCandidate.candidate_id === candId)) {
        setSelectedCandidate(res);
      }
    } catch (err) {
      showToast(`❌ Error: ${err.message}`);
    } finally {
      setIsScreening(false);
    }
  };

  // Status Change
  const handleStatusChange = async (candidateIdOrScreeningId, newStatus) => {
    try {
      // Look up screening record
      const screening = screenings.find(s => s.id === candidateIdOrScreeningId || s.candidate_id === candidateIdOrScreeningId);
      if (screening) {
        await updateCandidateStatus(screening.id, newStatus);
        setScreenings(prev => prev.map(s => s.id === screening.id ? { ...s, status: newStatus } : s));
        if (selectedCandidate && (selectedCandidate.id === screening.id || selectedCandidate.candidate_id === screening.candidate_id)) {
          setSelectedCandidate(prev => ({ ...prev, status: newStatus }));
        }
        showToast(`Updated status to "${newStatus}"`);
        const statsData = await fetchStats(selectedJob?.id);
        setStats(statsData);
      }
    } catch (err) {
      showToast(`❌ Status update failed: ${err.message}`);
    }
  };

  // Comparison toggle
  const handleToggleCompare = (candidate) => {
    const candId = candidate.id || candidate.candidate_id;
    const exists = selectedForCompare.some(c => (c.id || c.candidate_id) === candId);
    if (exists) {
      setSelectedForCompare(prev => prev.filter(c => (c.id || c.candidate_id) !== candId));
    } else {
      if (selectedForCompare.length >= 4) {
        showToast('You can compare a maximum of 4 candidates at once.');
        return;
      }
      setSelectedForCompare(prev => [...prev, candidate]);
    }
  };

  // Merge candidate pool with screenings for active job
  const combinedCandidates = candidates.map(cand => {
    const screening = screenings.find(s => s.candidate_id === cand.id);
    if (screening) {
      return {
        ...screening,
        name: cand.name,
        email: cand.email,
        phone: cand.phone,
        location: cand.location,
        total_years_experience: cand.total_years_experience,
        skills: cand.skills,
        skills_by_category: cand.skills_by_category,
        experience: cand.experience,
        education: cand.education,
        raw_text: cand.raw_text
      };
    }
    return {
      ...cand,
      candidate_id: cand.id,
      candidate_name: cand.name,
      candidate_email: cand.email,
      candidate_location: cand.location,
      status: 'Unscreened',
      fit_score: null,
      match_percentage: 0,
      matched_skills: [],
      missing_skills: []
    };
  });

  // Filter & Search Candidates
  const filteredCandidates = combinedCandidates.filter(c => {
    // Status Filter
    if (statusFilter !== 'All') {
      if (statusFilter === 'Shortlisted' && c.status !== 'Shortlisted') return false;
      if (statusFilter === 'Under Review' && c.status !== 'Under Review') return false;
      if (statusFilter === 'Interview Scheduled' && c.status !== 'Interview Scheduled') return false;
      if (statusFilter === 'Rejected' && c.status !== 'Rejected') return false;
    }

    // Min Score Filter
    if (minScoreFilter > 0) {
      if (c.fit_score === null || c.fit_score < minScoreFilter) return false;
    }

    // Search Query (Candidate Name or Skills)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const nameMatch = (c.candidate_name || c.name || '').toLowerCase().includes(q);
      const skillMatch = (c.skills || c.candidate_skills || []).some(s => s.toLowerCase().includes(q));
      const textMatch = (c.raw_text || '').toLowerCase().includes(q);
      if (!nameMatch && !skillMatch && !textMatch) return false;
    }

    return true;
  });

  // Sort
  const sortedCandidates = [...filteredCandidates].sort((a, b) => {
    let valA = a[sortField];
    let valB = b[sortField];

    if (sortField === 'fit_score') {
      valA = a.fit_score !== null ? a.fit_score : -1;
      valB = b.fit_score !== null ? b.fit_score : -1;
    } else if (sortField === 'experience') {
      valA = a.total_years_experience || 0;
      valB = b.total_years_experience || 0;
    } else if (sortField === 'name') {
      valA = (a.candidate_name || a.name || '').toLowerCase();
      valB = (b.candidate_name || b.name || '').toLowerCase();
    }

    if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
    if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0B0F19] text-slate-100 selection:bg-indigo-500 selection:text-white">
      
      {/* Navigation Header */}
      <Navbar
        jobs={jobs}
        selectedJob={selectedJob}
        onSelectJob={handleSelectJob}
        onOpenUpload={() => setIsUploadOpen(true)}
        onOpenNewJob={() => setIsJobModalOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        candidateCount={candidates.length}
        activeProvider={activeProvider}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Toast Alert */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 p-4 bg-slate-900 border border-indigo-500/50 rounded-2xl shadow-2xl text-xs font-semibold text-indigo-200 flex items-center gap-2 animate-in slide-in-from-bottom duration-200">
            <Sparkles className="w-4 h-4 text-indigo-400 animate-pulse" />
            {toastMessage}
          </div>
        )}

        {/* Top Analytics Bento */}
        <StatBento stats={stats} selectedJob={selectedJob} />

        {/* Active Job Profile Banner & Screening CTA */}
        <ActiveJobCard
          job={selectedJob}
          onBatchScreen={handleBatchScreen}
          isScreening={isScreening}
          selectedForCompare={selectedForCompare}
          onOpenCompare={() => setIsCompareOpen(true)}
        />

        {/* Search, Filter & View Controls */}
        <div className="glass-panel rounded-2xl p-4 mb-6 border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Left: Search input */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by candidate name, skill, or keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-750 text-xs rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            />
          </div>

          {/* Center: Status Tabs */}
          <div className="flex flex-wrap items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800/80">
            {['All', 'Shortlisted', 'Under Review', 'Interview Scheduled', 'Rejected'].map(st => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                  statusFilter === st
                    ? 'bg-indigo-600 text-white shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {st === 'Shortlisted' ? '★ ' + st : st}
              </button>
            ))}
          </div>

          {/* Right: Min Score slider & View Switcher */}
          <div className="flex items-center gap-4">
            
            {/* Min Score filter */}
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span>Min Fit:</span>
              <input
                type="range"
                min="0"
                max="9"
                step="0.5"
                value={minScoreFilter}
                onChange={(e) => setMinScoreFilter(parseFloat(e.target.value))}
                className="w-20 accent-indigo-500 cursor-pointer"
              />
              <span className="font-mono font-bold text-indigo-300 w-8">{minScoreFilter}+</span>
            </div>

            {/* View switcher */}
            <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition ${viewMode === 'grid' ? 'bg-slate-800 text-indigo-400' : 'text-slate-500 hover:text-slate-300'}`}
                title="Bento Grid View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg transition ${viewMode === 'table' ? 'bg-slate-800 text-indigo-400' : 'text-slate-500 hover:text-slate-300'}`}
                title="Dense ATS Table View"
              >
                <Table className="w-4 h-4" />
              </button>
            </div>

          </div>

        </div>

        {/* Candidate Pool Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <span>Candidates</span>
            <span className="px-2 py-0.5 text-xs bg-indigo-500/20 text-indigo-300 rounded-full font-mono font-normal border border-indigo-500/30">
              {sortedCandidates.length} matches
            </span>
          </h3>

          <div className="text-xs text-slate-400 flex items-center gap-2">
            <span>Sort by:</span>
            <button
              onClick={() => handleSort('fit_score')}
              className={`font-semibold transition ${sortField === 'fit_score' ? 'text-indigo-400 underline' : 'hover:text-slate-200'}`}
            >
              Fit Score
            </button>
            <span>•</span>
            <button
              onClick={() => handleSort('experience')}
              className={`font-semibold transition ${sortField === 'experience' ? 'text-indigo-400 underline' : 'hover:text-slate-200'}`}
            >
              Experience
            </button>
            <span>•</span>
            <button
              onClick={() => handleSort('name')}
              className={`font-semibold transition ${sortField === 'name' ? 'text-indigo-400 underline' : 'hover:text-slate-200'}`}
            >
              Name
            </button>
          </div>
        </div>

        {/* Candidate List / Grid */}
        {sortedCandidates.length > 0 ? (
          viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
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
          <div className="glass-panel rounded-2xl p-12 text-center border-dashed border-slate-800 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mx-auto">
              <UserCheck className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-white">No candidates match your current filter</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Try adjusting your min score slider, resetting status filters, or uploading more applicant resumes.
            </p>
            <button
              onClick={() => { setStatusFilter('All'); setMinScoreFilter(0); setSearchQuery(''); }}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-semibold rounded-xl text-indigo-300 transition inline-block"
            >
              Reset Filters
            </button>
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-6 mt-12 bg-slate-950/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>TalentPulse AI Smart Screener Engine • 100% Privacy Preserved (Local SQLite DB)</span>
          </div>
          <div className="flex items-center gap-4">
            <a href="/api/export/json" target="_blank" className="hover:text-slate-300 transition">JSON API Export</a>
            <a href="/api/export/csv" download className="hover:text-slate-300 transition">CSV Download</a>
          </div>
        </div>
      </footer>

      {/* Modals */}
      {selectedCandidate && (
        <CandidateDetailModal
          candidate={selectedCandidate}
          selectedJob={selectedJob}
          onClose={() => setSelectedCandidate(null)}
          onStatusChange={handleStatusChange}
          onReScreen={handleScreenSingle}
          isScreening={isScreening}
        />
      )}

      {isCompareOpen && (
        <CandidateComparisonModal
          candidates={selectedForCompare}
          selectedJob={selectedJob}
          onClose={() => setIsCompareOpen(false)}
          onStatusChange={handleStatusChange}
          onSelectCandidate={(c) => {
            setIsCompareOpen(false);
            setSelectedCandidate(c);
          }}
        />
      )}

      {isUploadOpen && (
        <UploadModal
          onClose={() => setIsUploadOpen(false)}
          onSuccess={() => {
            loadInitialData();
            showToast('New resumes uploaded and indexed successfully!');
          }}
        />
      )}

      {isJobModalOpen && (
        <JobModal
          onClose={() => setIsJobModalOpen(false)}
          onSuccess={(created) => {
            loadInitialData();
            setSelectedJob(created);
            showToast(`Created job position: ${created.title}`);
          }}
        />
      )}

      {isSettingsOpen && (
        <SettingsModal
          onClose={() => setIsSettingsOpen(false)}
          onProviderChanged={(p) => {
            setActiveProvider(p);
            showToast(`LLM Engine set to ${p}`);
          }}
        />
      )}

    </div>
  );
}
