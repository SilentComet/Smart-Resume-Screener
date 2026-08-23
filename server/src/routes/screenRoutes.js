import express from 'express';
import { query } from '../db/database.js';
import { screenCandidate } from '../services/llmService.js';

const router = express.Router();

function generateScreeningId() {
  return 'scr_' + Math.random().toString(36).substring(2, 9);
}

// Screen Candidate against a Job Description
router.post('/match', async (req, res) => {
  try {
    const { candidate_id, job_id, customSettings } = req.body;
    if (!candidate_id || !job_id) {
      return res.status(400).json({ error: 'candidate_id and job_id are required' });
    }

    const candidate = await query.get('SELECT * FROM candidates WHERE id = ?', [candidate_id]);
    if (!candidate) return res.status(404).json({ error: 'Candidate not found' });

    const job = await query.get('SELECT * FROM jobs WHERE id = ?', [job_id]);
    if (!job) return res.status(404).json({ error: 'Job not found' });

    candidate.skills = JSON.parse(candidate.skills || '[]');
    candidate.experience = JSON.parse(candidate.experience || '[]');
    candidate.education = JSON.parse(candidate.education || '[]');

    // Perform LLM Scoring
    const evaluation = await screenCandidate(candidate, job, customSettings || {});

    // Determine initial auto-status based on score
    const defaultStatus = evaluation.fit_score >= 8.0 ? 'Shortlisted' : (evaluation.fit_score >= 5.5 ? 'Under Review' : 'Rejected');

    // Save or update in database
    const existing = await query.get('SELECT id, status FROM screenings WHERE candidate_id = ? AND job_id = ?', [candidate_id, job_id]);
    
    let screeningId;
    const finalStatus = existing ? existing.status : defaultStatus;

    if (existing) {
      screeningId = existing.id;
      await query.run(`
        UPDATE screenings SET
          fit_score = ?,
          match_percentage = ?,
          skill_score = ?,
          experience_score = ?,
          education_score = ?,
          justification = ?,
          strengths = ?,
          weaknesses = ?,
          matched_skills = ?,
          missing_skills = ?,
          interview_questions = ?,
          screening_model = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `, [
        evaluation.fit_score,
        evaluation.match_percentage,
        evaluation.skill_score,
        evaluation.experience_score,
        evaluation.education_score,
        evaluation.justification,
        JSON.stringify(evaluation.strengths || []),
        JSON.stringify(evaluation.weaknesses || []),
        JSON.stringify(evaluation.matched_skills || []),
        JSON.stringify(evaluation.missing_skills || []),
        JSON.stringify(evaluation.interview_questions || []),
        evaluation.screening_model || 'Built-in Semantic Engine',
        screeningId
      ]);
    } else {
      screeningId = generateScreeningId();
      await query.run(`
        INSERT INTO screenings (
          id, candidate_id, job_id, fit_score, match_percentage,
          skill_score, experience_score, education_score, justification,
          strengths, weaknesses, matched_skills, missing_skills,
          interview_questions, status, screening_model
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        screeningId,
        candidate_id,
        job_id,
        evaluation.fit_score,
        evaluation.match_percentage,
        evaluation.skill_score,
        evaluation.experience_score,
        evaluation.education_score,
        evaluation.justification,
        JSON.stringify(evaluation.strengths || []),
        JSON.stringify(evaluation.weaknesses || []),
        JSON.stringify(evaluation.matched_skills || []),
        JSON.stringify(evaluation.missing_skills || []),
        JSON.stringify(evaluation.interview_questions || []),
        finalStatus,
        evaluation.screening_model || 'Built-in Semantic Engine'
      ]);
    }

    const savedScreening = await query.get('SELECT * FROM screenings WHERE id = ?', [screeningId]);
    res.json({
      ...savedScreening,
      strengths: JSON.parse(savedScreening.strengths || '[]'),
      weaknesses: JSON.parse(savedScreening.weaknesses || '[]'),
      matched_skills: JSON.parse(savedScreening.matched_skills || '[]'),
      missing_skills: JSON.parse(savedScreening.missing_skills || '[]'),
      interview_questions: JSON.parse(savedScreening.interview_questions || '[]'),
      candidate
    });
  } catch (error) {
    console.error('Screening error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Batch Screen All Candidates against a Job
router.post('/batch-screen', async (req, res) => {
  try {
    const { job_id, customSettings } = req.body;
    if (!job_id) return res.status(400).json({ error: 'job_id is required' });

    const job = await query.get('SELECT * FROM jobs WHERE id = ?', [job_id]);
    if (!job) return res.status(404).json({ error: 'Job not found' });

    const candidates = await query.all('SELECT * FROM candidates');
    const screenedResults = [];

    for (const rawCand of candidates) {
      const candidate = {
        ...rawCand,
        skills: JSON.parse(rawCand.skills || '[]'),
        experience: JSON.parse(rawCand.experience || '[]'),
        education: JSON.parse(rawCand.education || '[]')
      };

      const evaluation = await screenCandidate(candidate, job, customSettings || {});
      const defaultStatus = evaluation.fit_score >= 8.0 ? 'Shortlisted' : (evaluation.fit_score >= 5.5 ? 'Under Review' : 'Rejected');

      const existing = await query.get('SELECT id, status FROM screenings WHERE candidate_id = ? AND job_id = ?', [candidate.id, job_id]);
      let screeningId;
      const finalStatus = existing ? existing.status : defaultStatus;

      if (existing) {
        screeningId = existing.id;
        await query.run(`
          UPDATE screenings SET
            fit_score = ?,
            match_percentage = ?,
            skill_score = ?,
            experience_score = ?,
            education_score = ?,
            justification = ?,
            strengths = ?,
            weaknesses = ?,
            matched_skills = ?,
            missing_skills = ?,
            interview_questions = ?,
            screening_model = ?,
            updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `, [
          evaluation.fit_score,
          evaluation.match_percentage,
          evaluation.skill_score,
          evaluation.experience_score,
          evaluation.education_score,
          evaluation.justification,
          JSON.stringify(evaluation.strengths || []),
          JSON.stringify(evaluation.weaknesses || []),
          JSON.stringify(evaluation.matched_skills || []),
          JSON.stringify(evaluation.missing_skills || []),
          JSON.stringify(evaluation.interview_questions || []),
          evaluation.screening_model || 'Built-in Semantic Engine',
          screeningId
        ]);
      } else {
        screeningId = generateScreeningId();
        await query.run(`
          INSERT INTO screenings (
            id, candidate_id, job_id, fit_score, match_percentage,
            skill_score, experience_score, education_score, justification,
            strengths, weaknesses, matched_skills, missing_skills,
            interview_questions, status, screening_model
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          screeningId,
          candidate.id,
          job_id,
          evaluation.fit_score,
          evaluation.match_percentage,
          evaluation.skill_score,
          evaluation.experience_score,
          evaluation.education_score,
          evaluation.justification,
          JSON.stringify(evaluation.strengths || []),
          JSON.stringify(evaluation.weaknesses || []),
          JSON.stringify(evaluation.matched_skills || []),
          JSON.stringify(evaluation.missing_skills || []),
          JSON.stringify(evaluation.interview_questions || []),
          finalStatus,
          evaluation.screening_model || 'Built-in Semantic Engine'
        ]);
      }

      screenedResults.push({ candidate_id: candidate.id, fit_score: evaluation.fit_score, status: finalStatus });
    }

    res.json({
      message: `Successfully screened ${candidates.length} candidates`,
      screenings: screenedResults
    });
  } catch (error) {
    console.error('Batch screening error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get all screenings for a specific job (Ranked by fit_score DESC)
router.get('/job/:jobId', async (req, res) => {
  try {
    const rows = await query.all(`
      SELECT 
        s.*,
        c.name as candidate_name,
        c.email as candidate_email,
        c.phone as candidate_phone,
        c.location as candidate_location,
        c.linkedin as candidate_linkedin,
        c.github as candidate_github,
        c.summary as candidate_summary,
        c.total_years_experience,
        c.skills as candidate_skills,
        c.skills_by_category,
        c.experience as candidate_experience,
        c.education as candidate_education,
        c.file_name,
        c.raw_text
      FROM screenings s
      JOIN candidates c ON s.candidate_id = c.id
      WHERE s.job_id = ?
      ORDER BY s.fit_score DESC, s.created_at DESC
    `, [req.params.jobId]);

    const results = rows.map(r => ({
      ...r,
      strengths: JSON.parse(r.strengths || '[]'),
      weaknesses: JSON.parse(r.weaknesses || '[]'),
      matched_skills: JSON.parse(r.matched_skills || '[]'),
      missing_skills: JSON.parse(r.missing_skills || '[]'),
      interview_questions: JSON.parse(r.interview_questions || '[]'),
      candidate_skills: JSON.parse(r.candidate_skills || '[]'),
      skills_by_category: JSON.parse(r.skills_by_category || '{}'),
      candidate_experience: JSON.parse(r.candidate_experience || '[]'),
      candidate_education: JSON.parse(r.candidate_education || '[]')
    }));

    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update Candidate Status (Shortlisted, Under Review, Interview Scheduled, Rejected)
router.patch('/:id/status', async (req, res) => {
  try {
    const { status, notes } = req.body;
    if (!status) return res.status(400).json({ error: 'Status is required' });

    await query.run(`
      UPDATE screenings SET
        status = ?,
        notes = COALESCE(?, notes),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [status, notes, req.params.id]);

    res.json({ message: 'Status updated successfully', status });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
