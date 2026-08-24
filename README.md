# Smart Resume Screener

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-v20%2B-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18.3-blue.svg)](https://react.dev/)
[![SQLite](https://img.shields.io/badge/Database-SQLite3-skyblue.svg)](https://www.sqlite.org/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-38bdf8.svg)](https://tailwindcss.com/)
[![Design System](https://img.shields.io/badge/Design%20System-Neo--Brutalism-black.svg)](https://github.com/SilentComet/Smart-Resume-Screener)

> **Smart Resume Screener** is a production-grade, AI-powered Talent Intelligence & ATS Screening Platform. It intelligently parses multi-format resumes (PDF, DOCX, TXT), extracts structured candidate data (skills, timeline, education, contact info), and executes semantic matching and multi-dimensional scoring (1–10 scale) against job descriptions using LLMs with recruiter-grade justification.

---

## 📸 Application Preview

![Smart Resume Screener Main Dashboard](screenshots/01_dashboard_overview.png)
*Recruiter Dashboard: Real-time candidate scoring, bento metrics, active job profiles, and pipeline management in Neo-Brutalism design.*

---

## 📑 Table of Contents
1. [Key Features](#-key-features)
2. [UI Walkthrough & Visual Previews](#-ui-walkthrough--visual-previews)
3. [Market Research & Architecture Pattern](#-market-research--architecture-pattern)
4. [System Architecture](#-system-architecture)
5. [LLM Prompt Engineering & Scoring Strategy](#-llm-prompt-engineering--scoring-strategy)
6. [Database Schema (SQLite)](#-database-schema-sqlite)
7. [API Reference](#-api-reference)
8. [Installation & Quick Start](#-installation--quick-start)
9. [Sample Datasets & Evaluation Flow](#-sample-datasets--evaluation-flow)
10. [Neo-Brutalist Design System](#-neo-brutalist-design-system)
11. [License](#-license)

---

## 🌟 Key Features

- **Multi-Format Resume Parser**: Ingests raw `.pdf`, `.txt`, and `.docx` resumes using `pdf-parse` and heuristic entity extractors.
- **Structured Data Extraction**:
  - Full contact info (Name, Email, Phone, Location, LinkedIn, GitHub).
  - Categorized skill mapping across **8 domains & 300+ technologies** (Languages, Frontend, Backend, AI/ML, Cloud/DevOps, Databases, Architecture, Soft Skills).
  - Multi-role work history timeline, total experience calculation, and education credential matching.
- **Semantic LLM Matching Engine (1–10 Fit Scale)**:
  - Supports **Google Gemini** (dynamic model discovery), **OpenAI GPT-4o**, **Groq** (dynamic high-throughput model discovery), and **Built-in Local Semantic Engine** (zero API keys required).
  - Multi-dimensional breakdown: Skill Fit %, Experience & Seniority Fit %, Education Match %.
  - Verified matched skills (green tags) vs. missing requirement gaps (pink tags).
  - Actionable Recruiter Justifications & Strengths / Risk flags analysis.
  - Recommended AI-tailored candidate interview questions.
- **Recruiter Workflow & ATS Dashboard**:
  - **1-Click AI Batch Screening**: Rank and score all candidates against an active job opening in seconds.
  - **Custom Neo-Brutalist Job Selector**: Interactive dropdown with department tags, experience levels, and direct management.
  - **Profile Deletion**: Delete Job Positions and Candidate Profiles with cascade cleanup in SQLite.
  - **Status Management Pipeline**: `Shortlisted`, `Under Review`, `Interview Scheduled`, `Rejected` with celebration confetti.
  - **Side-by-Side Candidate Comparison Matrix**: Compare top candidates head-to-head.
  - **Dual View Modes**: Bento Grid Cards and High-Density ATS Table View.
  - **Export Center**: 1-click export of candidate screening results to CSV and JSON reports.

---

## 🖼️ UI Walkthrough & Visual Previews

### 1. AI Recruiter Reasoning & Candidate Deep-Dive
Clicking **Full Breakdown** on any candidate opens the detailed evaluation modal containing the 1–10 fit score, 4-tier sub-scores, verified skill chips, missing gaps, actionable recruiter reasoning, and interview questions.

![Candidate AI Deep-Dive Modal](screenshots/03_candidate_ai_evaluation.png)

---

### 2. Side-by-Side Candidate Comparison Matrix
Select multiple candidate checkboxes and open the comparison matrix to evaluate candidates head-to-head across fit scores, semantic match percentage, verified skills, and strengths.

![Side-by-Side Candidate Comparison Matrix](screenshots/04_candidate_comparison_matrix.png)

---

### 3. Custom Neo-Brutalist Job Position Selector
Switch target job profiles instantly using the custom Neo-Brutalist dropdown menu featuring department badges, experience benchmarks, active indicators, and deletion options.

![Neo-Brutalist Job Selector Dropdown](screenshots/02_job_selector_dropdown.png)

---

### 4. High-Density ATS Table View
Toggle from card grid to high-density table mode for bulk candidate screening, instant status transitions (`Shortlisted`, `Under Review`, `Interview Scheduled`, `Rejected`), and quick profile inspection.

![High-Density Candidate Table View](screenshots/05_high_density_table_view.png)

---

### 5. Multi-Resume Upload & Text Ingestion
Drag and drop batch PDF/DOCX/TXT resume files or paste raw plain text resumes for real-time parsing and skill extraction.

![Multi-Resume Upload Modal](screenshots/07_multi_resume_upload.png)

---

### 6. Job Position Creation & Customization
Define custom job titles, departments, required skills (weighted for 1–10 score), bonus skills, minimum experience thresholds, and role descriptions.

![Create Job Position Modal](screenshots/06_create_job_modal.png)

---

### 7. Multi-Provider LLM Settings & Dynamic API Testing
Switch seamlessly between **Google Gemini Flash**, **OpenAI GPT-4o**, **Groq LLaMA**, and the **Built-in Local Semantic Engine** with live connection testing.

![LLM Settings & Connection Test](screenshots/08_llm_provider_settings.png)

---

## 🔍 Market Research & Architecture Pattern

In analyzing modern ATS platforms (*Ashby, Eightfold AI, Greenhouse, Resume-Matcher*), we identified four essential industry pillars:

1. **Context-Aware Semantic Matching over Keywords**: Keyword counts fail when evaluating transferable skills (e.g., PyTorch ↔ Deep Learning, React ↔ Next.js). Our screener combines ontology-based taxonomy with LLM semantic reasoning.
2. **Transparent, Explainable AI ("The Why")**: Modern recruiters reject opaque "black box" scores. Our system generates structured justifications, clear strengths, and concrete skill gaps.
3. **Human-in-the-Loop Workflow**: AI provides scoring and recommendations, while recruiters retain full authority over status decisions (`Shortlisted`, `Interview Scheduled`, `Rejected`).
4. **Resilient Local Execution**: Embedded heuristic & semantic matching fallback guarantees 100% functionality even during network outages or without external LLM API keys.

---

## 🏛 System Architecture

```mermaid
graph TD
    subgraph Client [Frontend - React + Tailwind CSS + Lucide Icons]
        UI[Recruiter Dashboard]
        UploadUI[Multi-Resume Dropzone]
        JobUI[Job Position Manager & Selector]
        CompareUI[Candidate Comparison Matrix]
        ModalUI[Candidate Deep-Dive Modal]
    end

    subgraph Server [Backend - Express.js REST API]
        Router[API Gateway / Router]
        Parser[Parser & Entity Extractor (pdf-parse / regex)]
        LLM[LLM Semantic Scoring Dispatcher]
        DBService[SQLite Query Engine]
    end

    subgraph LLMEngine [Multi-Provider LLM Integration]
        Gemini[Google Gemini Flash API]
        OpenAI[OpenAI GPT-4o]
        Groq[Groq LLaMA / GPT-OSS]
        LocalEngine[Built-in Semantic Engine (Local AI)]
    end

    subgraph Storage [Database]
        SQLite[(screener.sqlite)]
    end

    UploadUI -->|PDF / Text Upload| Router
    Router --> Parser
    Parser --> DBService
    Router --> LLM
    LLM --> Gemini
    LLM --> OpenAI
    LLM --> Groq
    LLM --> LocalEngine
    LLM --> DBService
    DBService --> SQLite
    SQLite --> DBService
    DBService --> UI
    DBService --> CompareUI
    DBService --> ModalUI
```

---

## 🧠 LLM Prompt Engineering & Scoring Strategy

The LLM prompt follows the assignment specification:
> *"Compare the following resume with this job description and rate fit on 1–10 with justification."*

### System Prompt & Schema Specification:

```text
You are an expert technical recruiter and AI talent assessment specialist.
Compare the following resume with this job description and rate fit on 1–10 with justification.

### JOB DESCRIPTION:
Title: {job.title}
Department: {job.department}
Experience Level: {job.experience_level} (Minimum {job.min_years_experience} years)
Required Skills: {job.required_skills}
Nice to Have Skills: {job.nice_to_have_skills}
Responsibilities: {job.description}

### CANDIDATE RESUME:
Name: {candidate.name}
Total Experience: {candidate.total_years_experience} years
Extracted Skills: {candidate.skills}
Education: {candidate.education}
Work History: {candidate.experience}
Full Resume Text:
"""
{candidate.raw_text}
"""

### INSTRUCTIONS:
Evaluate candidate fit and return a valid JSON object matching this schema:
{
  "fit_score": <number between 1.0 and 10.0, e.g. 8.5>,
  "match_percentage": <integer between 0 and 100>,
  "skill_score": <integer between 0 and 100>,
  "experience_score": <integer between 0 and 100>,
  "education_score": <integer between 0 and 100>,
  "justification": "<comprehensive 2-3 paragraph recruiter analysis detailing exact fit, contextual reasoning, and decision rationale>",
  "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "weaknesses": ["<weakness/gap 1>", "<weakness/gap 2>"],
  "matched_skills": ["<skill1>", "<skill2>"],
  "missing_skills": ["<missing skill1>", "<missing skill2>"],
  "interview_questions": ["<tailored question 1>", "<tailored question 2>", "<tailored question 3>"]
}
```

### Composite Scoring Formula:
$$\text{Score}_{100} = (\text{Skill Match} \times 0.55) + (\text{Experience Level} \times 0.30) + (\text{Education Domain} \times 0.15)$$
$$\text{Fit Score}_{10} = \frac{\text{Score}_{100}}{10} \quad (\text{Scale: } 1.0 \text{ to } 10.0)$$

---

## 🗄 Database Schema (SQLite)

The system stores persistent data in `server/data/screener.sqlite`:

```sql
-- Jobs Table
CREATE TABLE jobs (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  department TEXT,
  experience_level TEXT,
  min_years_experience REAL DEFAULT 0,
  required_skills TEXT, -- JSON Array
  nice_to_have_skills TEXT, -- JSON Array
  responsibilities TEXT,
  education_requirement TEXT,
  description TEXT NOT NULL,
  status TEXT DEFAULT 'active',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Candidates Table
CREATE TABLE candidates (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  location TEXT,
  linkedin TEXT,
  github TEXT,
  summary TEXT,
  total_years_experience REAL DEFAULT 0,
  skills TEXT, -- JSON Array
  skills_by_category TEXT, -- JSON Object
  experience TEXT, -- JSON Array
  education TEXT, -- JSON Array
  certifications TEXT, -- JSON Array
  raw_text TEXT,
  file_name TEXT,
  file_path TEXT,
  file_type TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Screenings Table (Evaluation History)
CREATE TABLE screenings (
  id TEXT PRIMARY KEY,
  candidate_id TEXT NOT NULL,
  job_id TEXT NOT NULL,
  fit_score REAL NOT NULL, -- 1.0 to 10.0 scale
  match_percentage REAL NOT NULL, -- 0 to 100%
  skill_score REAL,
  experience_score REAL,
  education_score REAL,
  justification TEXT NOT NULL,
  strengths TEXT, -- JSON Array
  weaknesses TEXT, -- JSON Array
  matched_skills TEXT, -- JSON Array
  missing_skills TEXT, -- JSON Array
  interview_questions TEXT, -- JSON Array
  status TEXT DEFAULT 'Under Review', -- 'Shortlisted', 'Interview Scheduled', 'Under Review', 'Rejected'
  screening_model TEXT DEFAULT 'Built-in Semantic Engine',
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (candidate_id) REFERENCES candidates(id) ON DELETE CASCADE,
  FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
  UNIQUE(candidate_id, job_id)
);
```

---

## 🚀 API Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/resumes/upload` | Upload multiple PDF / TXT resumes and extract structured entities |
| `POST` | `/api/resumes/parse-text` | Parse raw resume text directly |
| `GET` | `/api/resumes` | Retrieve all parsed candidate profiles |
| `GET` | `/api/resumes/:id` | Retrieve single candidate with full skill taxonomy |
| `DELETE`| `/api/resumes/:id` | Permanently delete candidate profile & screening history |
| `GET` | `/api/jobs` | Retrieve all active job openings |
| `POST` | `/api/jobs` | Create a new job description with required skills tags |
| `DELETE`| `/api/jobs/:id` | Delete job profile and associated candidate screenings |
| `POST` | `/api/screen/match` | Evaluate a single candidate against a target job via LLM |
| `POST` | `/api/screen/batch-screen` | 1-Click evaluate all candidates against target job |
| `GET` | `/api/screen/job/:jobId` | Get all candidate rankings and justifications for a job |
| `PATCH` | `/api/screen/:id/status` | Update candidate pipeline status (`Shortlisted`, `Rejected`, etc.) |
| `GET` | `/api/stats?job_id=:id` | Aggregate metrics (Avg score, shortlisted count, top skill gaps) |
| `GET` | `/api/export/csv?job_id=:id`| Export screening matrix to CSV |
| `GET` | `/api/export/json?job_id=:id`| Export comprehensive JSON report |
| `GET` | `/api/settings` | Retrieve active LLM configuration and keys |
| `POST` | `/api/settings` | Save active LLM provider and API keys |
| `POST` | `/api/settings/test` | Test connectivity with Gemini, OpenAI, or Groq |

---

## 💻 Installation & Quick Start

### Prerequisites
- **Node.js**: v18.0 or higher (`node -v`)
- **npm**: v9.0 or higher (`npm -v`)

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/SilentComet/Smart-Resume-Screener.git
cd Smart-Resume-Screener

# Install root, server, and client packages
npm install
npm --prefix server install
npm --prefix client install
```

### 2. (Optional) Configure Environment Variables
Create a `.env` file in `server/` (or configure directly in the UI Settings modal):
```env
PORT=5000
# Optional external LLM API Keys (Built-in engine works out of the box without keys)
GEMINI_API_KEY=your_gemini_key_here
OPENAI_API_KEY=your_openai_key_here
GROQ_API_KEY=your_groq_key_here
```

### 3. Build & Run Application
```bash
# Start backend server & frontend client
npm start
```
Open your browser and navigate to **`http://localhost:5000`** (or `http://localhost:5173` in Vite dev mode).

---

## 📊 Sample Datasets & Evaluation Flow

The application comes pre-seeded with 4 diverse Job Descriptions and 6 realistic candidates:

1. **Alex Chen** *(Senior Full Stack Engineer - 7 Yrs Exp)*: React, TypeScript, Node.js, Next.js, AWS, Docker, PostgreSQL.
   - **Fit for Senior Full Stack**: **9.7 / 10 (Exceptional Match)**
2. **Dr. Sophia Martinez** *(Ph.D. AI / ML Researcher - 5 Yrs Exp)*: Python, PyTorch, Transformers, LLMs, LangChain, RAG, FastAPI.
   - **Fit for AI/ML Specialist**: **9.8 / 10 (Exceptional Match)**
3. **Marcus Reynolds** *(Lead DevOps Engineer - 8 Yrs Exp)*: Kubernetes, Terraform, AWS, Docker, CI/CD, Prometheus.
   - **Fit for Lead DevOps**: **9.6 / 10 (Exceptional Match)**
4. **Elena Rostova** *(Frontend Web Developer - 3 Yrs Exp)*: React, Tailwind, HTML5, CSS3, UI/UX.
   - **Fit for Senior Full Stack**: **6.8 / 10 (Moderate Fit - Strong frontend, lacks distributed backend)**
5. **David Kim** *(Junior Web Developer - 1 Yr Exp)*: JavaScript, React basics, HTML/CSS.
   - **Fit for Senior Roles**: **3.5 / 10 (Low Fit - Junior experience gap)**
6. **Rachel Vance** *(Senior Technical Product Manager - 6 Yrs Exp)*: Product Strategy, Agile, Scrum, SQL, Stakeholder Management.
   - **Fit for Product Manager**: **9.4 / 10 (Exceptional Match)**

---

## 🎨 Neo-Brutalist Design System

- **Visual Aesthetic**: High-contrast Neo-Brutalism with bold black borders (`2.5px - 3px solid #0a0a0a`) and hard offset shadows (`3px 3px 0 #0a0a0a`, `4px 4px 0 #0a0a0a`, `5px 5px 0 #0a0a0a`).
- **Curated Color Palette**:
  - Warm Canvas: Cream `#fafaf5`
  - Accent Primary: Cyber Yellow `#FFE500`
  - Status Indicators: Emerald Green `#00CC44` (Shortlisted/High Fit), Electric Blue `#0066FF` (Interview/Strong Fit), Vivid Orange `#FF5500` (Review/Moderate Fit), Hot Pink `#FF0099` (Reject/Risk Gaps)
  - Contrast Core: Deep Black `#0a0a0a`
- **Typography**: Space Grotesk (headings and display) paired with IBM Plex Mono (metrics, score chips, badges, and technical tags).
- **Micro-Interactions**: Neo-Brutalist custom dropdown menus, tactile button click translations, score badges, candidate comparison matrix, and celebratory confetti upon shortlisting.

---

## 📄 License
This project is licensed under the MIT License.
