const BASE_URL = '/api';

export async function fetchJobs() {
  const res = await fetch(`${BASE_URL}/jobs`);
  if (!res.ok) throw new Error('Failed to fetch jobs');
  return res.json();
}

export async function createJob(jobData) {
  const res = await fetch(`${BASE_URL}/jobs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(jobData)
  });
  if (!res.ok) throw new Error('Failed to create job');
  return res.json();
}

export async function fetchCandidates() {
  const res = await fetch(`${BASE_URL}/resumes`);
  if (!res.ok) throw new Error('Failed to fetch candidates');
  return res.json();
}

export async function uploadResumes(formData) {
  const res = await fetch(`${BASE_URL}/resumes/upload`, {
    method: 'POST',
    body: formData
  });
  if (!res.ok) throw new Error('Failed to upload resumes');
  return res.json();
}

export async function parseResumeText(text, candidateName) {
  const res = await fetch(`${BASE_URL}/resumes/parse-text`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, candidateName })
  });
  if (!res.ok) throw new Error('Failed to parse text resume');
  return res.json();
}

export async function deleteCandidate(id) {
  const res = await fetch(`${BASE_URL}/resumes/${id}`, {
    method: 'DELETE'
  });
  if (!res.ok) throw new Error('Failed to delete candidate');
  return res.json();
}

export async function fetchScreeningsForJob(jobId) {
  const res = await fetch(`${BASE_URL}/screen/job/${jobId}`);
  if (!res.ok) throw new Error('Failed to fetch screenings');
  return res.json();
}

export async function screenSingleCandidate(candidateId, jobId, customSettings = {}) {
  const res = await fetch(`${BASE_URL}/screen/match`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ candidate_id: candidateId, job_id: jobId, customSettings })
  });
  if (!res.ok) throw new Error('Failed to screen candidate');
  return res.json();
}

export async function batchScreenCandidates(jobId, customSettings = {}) {
  const res = await fetch(`${BASE_URL}/screen/batch-screen`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ job_id: jobId, customSettings })
  });
  if (!res.ok) throw new Error('Failed to batch screen candidates');
  return res.json();
}

export async function updateCandidateStatus(screeningId, status, notes = '') {
  const res = await fetch(`${BASE_URL}/screen/${screeningId}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status, notes })
  });
  if (!res.ok) throw new Error('Failed to update status');
  return res.json();
}

export async function fetchStats(jobId = '') {
  const url = jobId ? `${BASE_URL}/stats?job_id=${jobId}` : `${BASE_URL}/stats`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch stats');
  return res.json();
}

export async function fetchSettings() {
  const res = await fetch(`${BASE_URL}/settings`);
  if (!res.ok) throw new Error('Failed to fetch settings');
  return res.json();
}

export async function saveSettings(settings) {
  const res = await fetch(`${BASE_URL}/settings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(settings)
  });
  if (!res.ok) throw new Error('Failed to save settings');
  return res.json();
}

export async function testLLMConnection(provider, apiKey) {
  const res = await fetch(`${BASE_URL}/settings/test`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ provider, apiKey })
  });
  return res.json();
}
