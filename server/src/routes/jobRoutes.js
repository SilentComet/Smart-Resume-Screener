import express from 'express';
import { query } from '../db/database.js';

const router = express.Router();

function generateJobId() {
  return 'job_' + Math.random().toString(36).substring(2, 8);
}

// Get all jobs
router.get('/', async (req, res) => {
  try {
    const rows = await query.all('SELECT * FROM jobs ORDER BY created_at DESC');
    const jobs = rows.map(j => ({
      ...j,
      required_skills: JSON.parse(j.required_skills || '[]'),
      nice_to_have_skills: JSON.parse(j.nice_to_have_skills || '[]')
    }));
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get job by ID
router.get('/:id', async (req, res) => {
  try {
    const j = await query.get('SELECT * FROM jobs WHERE id = ?', [req.params.id]);
    if (!j) return res.status(404).json({ error: 'Job not found' });
    res.json({
      ...j,
      required_skills: JSON.parse(j.required_skills || '[]'),
      nice_to_have_skills: JSON.parse(j.nice_to_have_skills || '[]')
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new job
router.post('/', async (req, res) => {
  try {
    const {
      title,
      department,
      experience_level,
      min_years_experience,
      required_skills,
      nice_to_have_skills,
      responsibilities,
      education_requirement,
      description
    } = req.body;

    if (!title || !description) {
      return res.status(400).json({ error: 'Job title and description are required' });
    }

    const id = generateJobId();
    const reqSkillsArr = Array.isArray(required_skills)
      ? required_skills
      : (typeof required_skills === 'string' ? required_skills.split(',').map(s => s.trim()).filter(Boolean) : []);
    
    const niceSkillsArr = Array.isArray(nice_to_have_skills)
      ? nice_to_have_skills
      : (typeof nice_to_have_skills === 'string' ? nice_to_have_skills.split(',').map(s => s.trim()).filter(Boolean) : []);

    await query.run(`
      INSERT INTO jobs (
        id, title, department, experience_level, min_years_experience,
        required_skills, nice_to_have_skills, responsibilities,
        education_requirement, description, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')
    `, [
      id,
      title,
      department || 'Engineering',
      experience_level || 'Mid-Senior Level',
      min_years_experience || 3,
      JSON.stringify(reqSkillsArr),
      JSON.stringify(niceSkillsArr),
      responsibilities || '',
      education_requirement || "Bachelor's degree in Computer Science or equivalent",
      description
    ]);

    const created = await query.get('SELECT * FROM jobs WHERE id = ?', [id]);
    res.status(201).json({
      ...created,
      required_skills: reqSkillsArr,
      nice_to_have_skills: niceSkillsArr
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update Job
router.put('/:id', async (req, res) => {
  try {
    const {
      title, department, experience_level, min_years_experience,
      required_skills, nice_to_have_skills, responsibilities,
      education_requirement, description, status
    } = req.body;

    const reqSkillsArr = Array.isArray(required_skills) ? required_skills : (typeof required_skills === 'string' ? required_skills.split(',').map(s => s.trim()) : []);
    const niceSkillsArr = Array.isArray(nice_to_have_skills) ? nice_to_have_skills : (typeof nice_to_have_skills === 'string' ? nice_to_have_skills.split(',').map(s => s.trim()) : []);

    await query.run(`
      UPDATE jobs SET
        title = COALESCE(?, title),
        department = COALESCE(?, department),
        experience_level = COALESCE(?, experience_level),
        min_years_experience = COALESCE(?, min_years_experience),
        required_skills = COALESCE(?, required_skills),
        nice_to_have_skills = COALESCE(?, nice_to_have_skills),
        responsibilities = COALESCE(?, responsibilities),
        education_requirement = COALESCE(?, education_requirement),
        description = COALESCE(?, description),
        status = COALESCE(?, status),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [
      title, department, experience_level, min_years_experience,
      JSON.stringify(reqSkillsArr), JSON.stringify(niceSkillsArr),
      responsibilities, education_requirement, description, status,
      req.params.id
    ]);

    res.json({ message: 'Job updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete job
router.delete('/:id', async (req, res) => {
  try {
    await query.run('DELETE FROM jobs WHERE id = ?', [req.params.id]);
    res.json({ message: 'Job deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
