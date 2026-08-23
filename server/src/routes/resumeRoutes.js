import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { randomUUID } from 'crypto';
import { query } from '../db/database.js';
import { parseResume } from '../services/parserService.js';

const router = express.Router();

const uploadsDir = path.resolve('uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext === '.pdf' || ext === '.txt' || ext === '.md' || ext === '.doc' || ext === '.docx') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF and Text resume files are supported.'));
    }
  }
});

// Helper for generating UUID
function generateId() {
  return 'cand_' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
}

// Upload & Parse Multiple Resumes
router.post('/upload', upload.array('resumes', 20), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No resume files uploaded' });
    }

    const results = [];
    for (const file of req.files) {
      try {
        const parsed = await parseResume(file.path, {
          originalName: file.originalname,
          path: file.path,
          mimetype: file.mimetype
        });

        const id = generateId();
        await query.run(`
          INSERT INTO candidates (
            id, name, email, phone, location, linkedin, github, summary,
            total_years_experience, skills, skills_by_category, experience,
            education, certifications, raw_text, file_name, file_path, file_type
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          id,
          parsed.name,
          parsed.email,
          parsed.phone,
          parsed.location,
          parsed.linkedin,
          parsed.github,
          parsed.summary,
          parsed.totalYearsExperience,
          JSON.stringify(parsed.skills),
          JSON.stringify(parsed.skillsByCategory),
          JSON.stringify(parsed.experience),
          JSON.stringify(parsed.education),
          JSON.stringify(parsed.certifications),
          parsed.rawText,
          parsed.fileName,
          parsed.filePath,
          parsed.fileType
        ]);

        results.push({ id, ...parsed });
      } catch (err) {
        console.error(`Error parsing file ${file.originalname}:`, err);
        results.push({
          fileName: file.originalname,
          error: `Failed to parse: ${err.message}`
        });
      }
    }

    res.json({
      message: `Successfully processed ${results.filter(r => !r.error).length} resumes`,
      candidates: results
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Direct Text Resume Parsing
router.post('/parse-text', async (req, res) => {
  try {
    const { text, candidateName } = req.body;
    if (!text || text.trim().length === 0) {
      return res.status(400).json({ error: 'Resume text is required' });
    }

    const parsed = await parseResume(text, {
      originalName: (candidateName || 'Pasted_Resume') + '.txt',
      mimetype: 'text/plain'
    });

    if (candidateName) parsed.name = candidateName;

    const id = generateId();
    await query.run(`
      INSERT INTO candidates (
        id, name, email, phone, location, linkedin, github, summary,
        total_years_experience, skills, skills_by_category, experience,
        education, certifications, raw_text, file_name, file_type
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      id,
      parsed.name,
      parsed.email,
      parsed.phone,
      parsed.location,
      parsed.linkedin,
      parsed.github,
      parsed.summary,
      parsed.totalYearsExperience,
      JSON.stringify(parsed.skills),
      JSON.stringify(parsed.skillsByCategory),
      JSON.stringify(parsed.experience),
      JSON.stringify(parsed.education),
      JSON.stringify(parsed.certifications),
      parsed.rawText,
      parsed.fileName,
      'text/plain'
    ]);

    res.json({ id, ...parsed });
  } catch (error) {
    console.error('Parse text error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get all candidates
router.get('/', async (req, res) => {
  try {
    const rows = await query.all('SELECT * FROM candidates ORDER BY created_at DESC');
    const candidates = rows.map(r => ({
      ...r,
      skills: JSON.parse(r.skills || '[]'),
      skills_by_category: JSON.parse(r.skills_by_category || '{}'),
      experience: JSON.parse(r.experience || '[]'),
      education: JSON.parse(r.education || '[]'),
      certifications: JSON.parse(r.certifications || '[]')
    }));
    res.json(candidates);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single candidate by ID
router.get('/:id', async (req, res) => {
  try {
    const r = await query.get('SELECT * FROM candidates WHERE id = ?', [req.params.id]);
    if (!r) return res.status(404).json({ error: 'Candidate not found' });

    res.json({
      ...r,
      skills: JSON.parse(r.skills || '[]'),
      skills_by_category: JSON.parse(r.skills_by_category || '{}'),
      experience: JSON.parse(r.experience || '[]'),
      education: JSON.parse(r.education || '[]'),
      certifications: JSON.parse(r.certifications || '[]')
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete candidate
router.delete('/:id', async (req, res) => {
  try {
    await query.run('DELETE FROM candidates WHERE id = ?', [req.params.id]);
    res.json({ message: 'Candidate deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
