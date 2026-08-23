import sqlite3 from 'sqlite3';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataDir = path.resolve(__dirname, '../../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'screener.sqlite');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Failed to connect to SQLite database:', err.message);
  } else {
    console.log('✅ Connected to SQLite database at:', dbPath);
  }
});

// Helper for promise-based queries
export const query = {
  run(sql, params = []) {
    return new Promise((resolve, reject) => {
      db.run(sql, params, function (err) {
        if (err) reject(err);
        else resolve({ lastID: this.lastID, changes: this.changes });
      });
    });
  },
  get(sql, params = []) {
    return new Promise((resolve, reject) => {
      db.get(sql, params, (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  },
  all(sql, params = []) {
    return new Promise((resolve, reject) => {
      db.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
  }
};

export async function initDatabase() {
  // Jobs Table
  await query.run(`
    CREATE TABLE IF NOT EXISTS jobs (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      department TEXT,
      experience_level TEXT,
      min_years_experience REAL DEFAULT 0,
      required_skills TEXT, -- JSON array
      nice_to_have_skills TEXT, -- JSON array
      responsibilities TEXT,
      education_requirement TEXT,
      description TEXT NOT NULL,
      status TEXT DEFAULT 'active',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Candidates Table
  await query.run(`
    CREATE TABLE IF NOT EXISTS candidates (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT,
      phone TEXT,
      location TEXT,
      linkedin TEXT,
      github TEXT,
      summary TEXT,
      total_years_experience REAL DEFAULT 0,
      skills TEXT, -- JSON array
      skills_by_category TEXT, -- JSON object
      experience TEXT, -- JSON array of {title, company, duration, description}
      education TEXT, -- JSON array of {degree, field, institution, year}
      certifications TEXT, -- JSON array
      raw_text TEXT,
      file_name TEXT,
      file_path TEXT,
      file_type TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Screenings Table (Evaluation & Scoring against a specific Job)
  await query.run(`
    CREATE TABLE IF NOT EXISTS screenings (
      id TEXT PRIMARY KEY,
      candidate_id TEXT NOT NULL,
      job_id TEXT NOT NULL,
      fit_score REAL NOT NULL, -- 1.0 to 10.0 scale
      match_percentage REAL NOT NULL, -- 0 to 100%
      skill_score REAL,
      experience_score REAL,
      education_score REAL,
      justification TEXT NOT NULL,
      strengths TEXT, -- JSON array
      weaknesses TEXT, -- JSON array
      matched_skills TEXT, -- JSON array
      missing_skills TEXT, -- JSON array
      interview_questions TEXT, -- JSON array
      status TEXT DEFAULT 'Under Review', -- 'Shortlisted', 'Under Review', 'Interview Scheduled', 'Rejected'
      screening_model TEXT DEFAULT 'Built-in Semantic Engine',
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (candidate_id) REFERENCES candidates(id) ON DELETE CASCADE,
      FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
      UNIQUE(candidate_id, job_id)
    )
  `);

  // Settings Table
  await query.run(`
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  console.log('✅ Database tables initialized successfully.');
}

export default db;
