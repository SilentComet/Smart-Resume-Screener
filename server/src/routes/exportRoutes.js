import express from 'express';
import { query } from '../db/database.js';

const router = express.Router();

// Export candidates & screenings as CSV
router.get('/csv', async (req, res) => {
  try {
    const { job_id } = req.query;
    let sql = `
      SELECT 
        c.name, c.email, c.phone, c.location, c.total_years_experience,
        j.title as job_title,
        s.fit_score, s.match_percentage, s.skill_score, s.experience_score, s.education_score,
        s.status, s.justification, s.matched_skills, s.missing_skills, s.screening_model
      FROM screenings s
      JOIN candidates c ON s.candidate_id = c.id
      JOIN jobs j ON s.job_id = j.id
    `;
    const params = [];
    if (job_id) {
      sql += ' WHERE s.job_id = ?';
      params.push(job_id);
    }
    sql += ' ORDER BY s.fit_score DESC';

    const rows = await query.all(sql, params);

    // Build CSV string
    const headers = [
      'Candidate Name', 'Email', 'Phone', 'Location', 'Years of Experience',
      'Job Title', 'Fit Score (1-10)', 'Match %', 'Skill Score', 'Experience Score',
      'Education Score', 'Status', 'Screening Model', 'Matched Skills', 'Missing Skills', 'Justification'
    ];

    const escapeCsv = (val) => {
      if (val === null || val === undefined) return '""';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    };

    const csvRows = [headers.join(',')];
    for (const r of rows) {
      const matched = JSON.parse(r.matched_skills || '[]').join('; ');
      const missing = JSON.parse(r.missing_skills || '[]').join('; ');

      csvRows.push([
        escapeCsv(r.name),
        escapeCsv(r.email),
        escapeCsv(r.phone),
        escapeCsv(r.location),
        escapeCsv(r.total_years_experience),
        escapeCsv(r.job_title),
        escapeCsv(r.fit_score),
        escapeCsv(r.match_percentage + '%'),
        escapeCsv(r.skill_score),
        escapeCsv(r.experience_score),
        escapeCsv(r.education_score),
        escapeCsv(r.status),
        escapeCsv(r.screening_model),
        escapeCsv(matched),
        escapeCsv(missing),
        escapeCsv(r.justification)
      ].join(','));
    }

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="smart_resume_screenings_${Date.now()}.csv"`);
    res.send(csvRows.join('\n'));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Export as JSON report
router.get('/json', async (req, res) => {
  try {
    const { job_id } = req.query;
    let sql = `
      SELECT 
        c.*,
        j.title as job_title,
        s.fit_score, s.match_percentage, s.skill_score, s.experience_score, s.education_score,
        s.status as candidate_status, s.justification, s.strengths, s.weaknesses,
        s.matched_skills, s.missing_skills, s.interview_questions, s.screening_model
      FROM screenings s
      JOIN candidates c ON s.candidate_id = c.id
      JOIN jobs j ON s.job_id = j.id
    `;
    const params = [];
    if (job_id) {
      sql += ' WHERE s.job_id = ?';
      params.push(job_id);
    }
    sql += ' ORDER BY s.fit_score DESC';

    const rows = await query.all(sql, params);
    const report = rows.map(r => ({
      candidate: {
        id: r.id,
        name: r.name,
        email: r.email,
        phone: r.phone,
        location: r.location,
        total_years_experience: r.total_years_experience,
        skills: JSON.parse(r.skills || '[]'),
        experience: JSON.parse(r.experience || '[]'),
        education: JSON.parse(r.education || '[]')
      },
      evaluation: {
        job_title: r.job_title,
        fit_score: r.fit_score,
        match_percentage: r.match_percentage,
        skill_score: r.skill_score,
        experience_score: r.experience_score,
        education_score: r.education_score,
        status: r.candidate_status,
        screening_model: r.screening_model,
        justification: r.justification,
        strengths: JSON.parse(r.strengths || '[]'),
        weaknesses: JSON.parse(r.weaknesses || '[]'),
        matched_skills: JSON.parse(r.matched_skills || '[]'),
        missing_skills: JSON.parse(r.missing_skills || '[]'),
        interview_questions: JSON.parse(r.interview_questions || '[]')
      }
    }));

    res.json({
      generated_at: new Date().toISOString(),
      total_candidates: report.length,
      candidates: report
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
