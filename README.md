# Smart Resume Screener

[![License: MIT](https://img.shields.io/badge/License-MIT-indigo.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-v20%2B-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18.3-blue.svg)](https://react.dev/)
[![SQLite](https://img.shields.io/badge/Database-SQLite3-skyblue.svg)](https://www.sqlite.org/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-38bdf8.svg)](https://tailwindcss.com/)

> **Smart Resume Screener** is a production-grade, AI-powered Talent Intelligence & ATS Screening Platform. It intelligently parses multi-format resumes (PDF, DOCX, TXT), extracts structured candidate data (skills, timeline, education, contact info), and executes semantic matching and multi-dimensional scoring (1–10 scale) against job descriptions using LLMs with recruiter-grade justification.

---

## 📑 Table of Contents
1. [Key Features](#-key-features)
2. [Market Research & Architecture Pattern](#-market-research--architecture-pattern)
3. [System Architecture](#-system-architecture)
4. [LLM Prompt Engineering & Scoring Strategy](#-llm-prompt-engineering--scoring-strategy)
5. [Database Schema (SQLite)](#-database-schema-sqlite)
6. [API Reference](#-api-reference)
7. [Installation & Quick Start](#-installation--quick-start)
8. [Sample Datasets & Evaluation Flow](#-sample-datasets--evaluation-flow)
9. [UI/UX Design System (UI/UX Pro Max)](#-uiux-design-system-uiux-pro-max)

---

## 🌟 Key Features

- **Multi-Format Resume Parser**: Ingests raw `.pdf`, `.txt`, and `.docx` resumes using `pdf-parse` and heuristic entity extractors.
- **Structured Data Extraction**:
  - Full contact info (Name, Email, Phone, Location, LinkedIn, GitHub).
  - Categorized skill mapping across **8 domains & 300+ technologies** (Languages, Frontend, Backend, AI/ML, Cloud/DevOps, Databases, Architecture, Soft Skills).
  - Multi-role work history timeline, total experience calculation, and education credential matching.
- **Semantic LLM Matching Engine (1–10 Fit Scale)**:
  - Supports **Google Gemini 1.5 Flash**, **OpenAI GPT-4o-mini**, **Groq LLaMA 3.3 70B**, and **Built-in Local Semantic Engine** (zero API keys needed).
  - Multi-dimensional breakdown: Skill Fit %, Experience & Seniority Fit %, Education Match %.
  - Verified matched skills (emerald tags) vs. missing requirement gaps (rose tags).
  - Actionable Recruiter Justifications & Strengths / Risk flags analysis.
  - Recommended AI-tailored candidate interview questions.
- **Recruiter Workflow & ATS Dashboard**:
  - **1-Click AI Batch Screening**: Rank and score all candidates against an active job opening in seconds.
  - **Status Management Pipeline**: `Shortlisted`, `Under Review`, `Interview Scheduled`, `Rejected` with celebration confetti.
  - **Side-by-Side Candidate Comparison Matrix**: Compare top candidates head-to-head.
  - **Dual View Modes**: Bento Grid Cards and High-Density ATS Table View.
  - **Export Center**: 1-click export of candidate screening results to CSV and JSON reports.

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
    subgraph Client [Frontend - React + Tailwind CSS + Lucide]
        UI[Recruiter Dashboard]
        UploadUI[Multi-Resume Dropzone]
        JobUI[Job Position Manager]
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
        Gemini[Google Gemini 1.5 Flash]
        OpenAI[OpenAI GPT-4o]
        Groq[Groq LLaMA 3.3 70B]
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
| `GET` | `/api/jobs` | Retrieve all active job openings |
| `POST` | `/api/jobs` | Create a new job description with required skills tags |
| `POST` | `/api/screen/match` | Evaluate a single candidate against a target job via LLM |
| `POST` | `/api/screen/batch-screen` | 1-Click evaluate all candidates against target job |
| `GET` | `/api/screen/job/:jobId` | Get all candidate rankings and justifications for a job |
| `PATCH` | `/api/screen/:id/status` | Update candidate pipeline status (`Shortlisted`, `Rejected`, etc.) |
| `GET` | `/api/stats?job_id=:id` | Aggregate metrics (Avg score, shortlisted count, top skill gaps) |
| `GET` | `/api/export/csv?job_id=:id`| Export screening matrix to CSV |
| `GET` | `/api/export/json?job_id=:id`| Export comprehensive JSON report |
| `POST` | `/api/settings/test` | Test connectivity with Gemini, OpenAI, or Groq |

---

## 💻 Installation & Quick Start

### Prerequisites
- **Node.js**: v18.0 or higher (`node -v`)
- **npm**: v9.0 or higher (`npm -v`)

### 1. Clone & Install Dependencies
```bash
git clone <repo-url>
cd asgnmt

# Install root, server, and client packages
npm install
npm --prefix server install
npm --prefix client install
```

### 2. (Optional) Configure Environment Variables
Create a `.env` file in `server/` (or configure via the UI Settings modal):
```env
PORT=5000
# Optional external LLM API Keys (Built-in engine works out of the box without keys)
GEMINI_API_KEY=your_gemini_key_here
OPENAI_API_KEY=your_openai_key_here
GROQ_API_KEY=your_groq_key_here
```

### 3. Build & Run Application
```bash
# Start backend server & frontend client concurrently
npm start
```
Open your browser and navigate to **`http://localhost:5000`** (or `http://localhost:5173` in Vite dev mode).

---

## 📊 Sample Datasets & Evaluation Flow

The application comes pre-seeded with 4 diverse Job Descriptions and 6 realistic candidates:

1. **Alex Chen** *(Senior Full Stack Engineer - 7 Yrs Exp)*: React, TypeScript, Node.js, Next.js, AWS, Docker, PostgreSQL.
   - **Fit for Senior Full Stack**: **9.7 / 10 (Exceptional Match)**
2. **Dr. Sophia Martinez** *(Ph.D. AI / ML Researcher - 5 Yrs Exp)*: Python, PyTorch, Transformers, LLMs, LangChain, RAG, FastAPIs.
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

## 🎨 UI/UX Design System (UI/UX Pro Max)

- **Color Palette**: Dark Slate background (`#0B0F19`), Glassmorphism surface cards (`rgba(17, 24, 39, 0.75)`), Electric Indigo accents (`#6366F1`), Emerald for top fit (`#10B981`), Amber for review (`#F59E0B`), and Rose for skill gaps (`#F43F5E`).
- **Typography**: Clean hierarchy with `Plus Jakarta Sans` for headers and `JetBrains Mono` for tabular metrics and scores.
- **Micro-Interactions**: Animated score radials, hover states, live progress indicators, interactive comparison matrix, and celebratory confetti upon shortlisting.

---

## 📄 License
This project is licensed under the MIT License.
