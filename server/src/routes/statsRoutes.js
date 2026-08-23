import express from 'express';
import { query } from '../db/database.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { job_id } = req.query;

    const totalCandidatesRow = await query.get('SELECT COUNT(*) as count FROM candidates');
    const totalJobsRow = await query.get('SELECT COUNT(*) as count FROM jobs');

    let screeningsQuery = 'SELECT * FROM screenings';
    let params = [];
    if (job_id) {
      screeningsQuery += ' WHERE job_id = ?';
      params.push(job_id);
    }
    const screenings = await query.all(screeningsQuery, params);

    const totalScreened = screenings.length;
    const shortlistedCount = screenings.filter(s => s.status === 'Shortlisted').length;
    const interviewCount = screenings.filter(s => s.status === 'Interview Scheduled').length;
    const reviewCount = screenings.filter(s => s.status === 'Under Review').length;
    const rejectedCount = screenings.filter(s => s.status === 'Rejected').length;

    const avgFitScore = totalScreened > 0
      ? (screenings.reduce((acc, s) => acc + (s.fit_score || 0), 0) / totalScreened).toFixed(1)
      : '0.0';

    const avgMatchPct = totalScreened > 0
      ? Math.round(screenings.reduce((acc, s) => acc + (s.match_percentage || 0), 0) / totalScreened)
      : 0;

    // Aggregate Top Missing Skills
    const missingSkillFreq = {};
    screenings.forEach(s => {
      const missing = JSON.parse(s.missing_skills || '[]');
      missing.forEach(skill => {
        missingSkillFreq[skill] = (missingSkillFreq[skill] || 0) + 1;
      });
    });

    const topMissingSkills = Object.entries(missingSkillFreq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([skill, count]) => ({ skill, count }));

    res.json({
      totalCandidates: totalCandidatesRow.count,
      totalJobs: totalJobsRow.count,
      totalScreened,
      shortlistedCount,
      interviewCount,
      reviewCount,
      rejectedCount,
      avgFitScore,
      avgMatchPct,
      topMissingSkills
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
