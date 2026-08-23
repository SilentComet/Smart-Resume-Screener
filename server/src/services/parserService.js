import pdfParse from 'pdf-parse';
import fs from 'fs';

// Comprehensive dictionary of technical and soft skills grouped by category
export const SKILL_CATEGORIES = {
  'Languages': [
    'javascript', 'typescript', 'python', 'java', 'c++', 'c#', 'c', 'golang', 'go', 'rust',
    'ruby', 'php', 'swift', 'kotlin', 'scala', 'r', 'dart', 'shell', 'bash', 'sql', 'html', 'css'
  ],
  'Frontend': [
    'react', 'react.js', 'vue', 'vue.js', 'angular', 'next.js', 'nextjs', 'nuxt.js', 'svelte',
    'redux', 'zustand', 'tailwind css', 'tailwind', 'bootstrap', 'material ui', 'chakra ui',
    'sass', 'less', 'webpack', 'vite', 'graphql', 'rest api', 'responsive design', 'webgl', 'three.js'
  ],
  'Backend': [
    'node.js', 'nodejs', 'express', 'express.js', 'fastapi', 'flask', 'django', 'spring boot',
    'nest.js', 'nestjs', 'ruby on rails', 'asp.net', 'laravel', 'microservices', 'grpc', 'kafka',
    'rabbitmq', 'websockets', 'restful apis', 'serverless'
  ],
  'AI & Machine Learning': [
    'machine learning', 'deep learning', 'nlp', 'natural language processing', 'computer vision',
    'pytorch', 'tensorflow', 'keras', 'scikit-learn', 'transformers', 'hugging face', 'llm',
    'large language models', 'langchain', 'llamaindex', 'rag', 'vector databases', 'pinecone',
    'weaviate', 'chromadb', 'milvus', 'genai', 'generative ai', 'openai api', 'gemini api', 'prompt engineering', 'fine-tuning', 'rlhf'
  ],
  'Cloud & DevOps': [
    'aws', 'amazon web services', 'azure', 'google cloud', 'gcp', 'docker', 'kubernetes', 'k8s',
    'terraform', 'ansible', 'ci/cd', 'github actions', 'jenkins', 'gitlab ci', 'helm', 'prometheus',
    'grafana', 'linux', 'cloudformation', 'serverless framework', 'nginx', 'apache'
  ],
  'Databases & Storage': [
    'postgresql', 'postgres', 'mysql', 'mongodb', 'redis', 'elasticsearch', 'dynamodb',
    'sqlite', 'cassandra', 'neo4j', 'snowflake', 'bigquery', 'oracle', 'prisma', 'typeorm', 'sqlalchemy'
  ],
  'Architecture & Methods': [
    'system design', 'agile', 'scrum', 'kanban', 'tdd', 'test driven development', 'object oriented programming',
    'oop', 'distributed systems', 'design patterns', 'event-driven architecture', 'unit testing', 'integration testing', 'jest', 'cypress'
  ],
  'Soft Skills': [
    'leadership', 'team management', 'communication', 'problem solving', 'critical thinking',
    'collaboration', 'mentorship', 'stakeholder management', 'cross-functional leadership', 'agile project management'
  ]
};

// Flattened list for fast lookup
const ALL_SKILLS = Object.values(SKILL_CATEGORIES).flat();

/**
 * Extracts plain text from a PDF buffer or file path
 */
export async function extractTextFromPDF(pdfBufferOrPath) {
  let buffer;
  if (typeof pdfBufferOrPath === 'string') {
    buffer = fs.readFileSync(pdfBufferOrPath);
  } else {
    buffer = pdfBufferOrPath;
  }
  const data = await pdfParse(buffer);
  return data.text;
}

/**
 * Clean and normalize text
 */
export function normalizeText(text) {
  if (!text) return '';
  return text
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/\t/g, ' ')
    .replace(/\u00A0/g, ' ')
    .trim();
}

/**
 * Extract Contact Information
 */
export function extractContactInfo(text) {
  const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/i;
  const emailMatch = text.match(emailRegex);
  const email = emailMatch ? emailMatch[1] : null;

  const phoneRegex = /(?:(?:\+?1\s*(?:[.-]\s*)?)?(?:\(\s*([2-9]1[02-9]|[2-9][02-8]1|[2-9][02-8][02-9])\s*\)|([2-9]1[02-9]|[2-9][02-8]1|[2-9][02-8][02-9]))\s*(?:[.-]\s*)?)?([2-9]1[02-9]|[2-9][02-9]1|[2-9][02-9]{2})\s*(?:[.-]\s*)?([0-9]{4})(?:\s*(?:#|x\.?|ext\.?|extension)\s*(\d+))?|(\+?\d{1,3}[-.\s]?\(?\d{1,4}\)?[-.\s]?\d{1,4}[-.\s]?\d{1,9})/g;
  const phoneMatch = text.match(phoneRegex);
  const phone = phoneMatch ? phoneMatch[0].trim() : null;

  const linkedinRegex = /(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/([a-zA-Z0-9_-]+)/i;
  const linkedinMatch = text.match(linkedinRegex);
  const linkedin = linkedinMatch ? `https://linkedin.com/in/${linkedinMatch[1]}` : null;

  const githubRegex = /(?:https?:\/\/)?(?:www\.)?github\.com\/([a-zA-Z0-9_-]+)/i;
  const githubMatch = text.match(githubRegex);
  const github = githubMatch ? `https://github.com/${githubMatch[1]}` : null;

  // Extract Name (Heuristic: First 1-3 lines usually contain candidate name)
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  let name = 'Candidate';
  for (let i = 0; i < Math.min(5, lines.length); i++) {
    const line = lines[i];
    // Ignore lines that look like contact info or titles
    if (!line.includes('@') && !line.includes('http') && !line.match(/\d{3}/) && line.length < 40 && line.length > 2) {
      if (/^[A-Za-z\s.'-]+$/.test(line)) {
        name = line;
        break;
      }
    }
  }

  // Location heuristic
  const locationRegex = /(?:Location|Address|Living in|Based in)?:?\s*([A-Z][a-zA-Z\s]+,\s*[A-Z]{2}|[A-Z][a-zA-Z\s]+,\s*[A-Z][a-zA-Z\s]+)/i;
  const locationMatch = text.match(locationRegex);
  const location = locationMatch ? locationMatch[1].trim() : 'Not Specified';

  return { name, email, phone, linkedin, github, location };
}

/**
 * Extract Skills from text using skill dictionary & regex matching
 */
export function extractSkills(text) {
  const lowerText = ' ' + text.toLowerCase() + ' ';
  const detectedSkills = new Set();
  const skillsByCategory = {};

  for (const [category, skills] of Object.entries(SKILL_CATEGORIES)) {
    skillsByCategory[category] = [];
    for (const skill of skills) {
      // Escape special characters in skill for regex
      const escapedSkill = skill.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
      // Word boundary or symbol boundary match
      const regex = new RegExp(`(?:^|[^a-zA-Z0-9#+])${escapedSkill}(?=[^a-zA-Z0-9#+]|$)`, 'i');
      if (regex.test(lowerText)) {
        // Format skill title case nicely
        const formattedSkill = skill.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
        detectedSkills.add(formattedSkill);
        skillsByCategory[category].push(formattedSkill);
      }
    }
  }

  return {
    allSkills: Array.from(detectedSkills),
    skillsByCategory
  };
}

/**
 * Extract Experience & Timeline
 */
export function extractExperience(text) {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  const experienceEntries = [];
  let totalYears = 0;

  // Search for year ranges e.g., 2018 - 2023, 2020 - Present, 2019-current
  const yearRangeRegex = /(20\d{2}|19\d{2})\s*(?:-|–|to)\s*(20\d{2}|19\d{2}|present|current|now)/gi;
  const currentYear = new Date().getFullYear();
  let matchedRanges = [];
  let match;

  while ((match = yearRangeRegex.exec(text)) !== null) {
    const startYear = parseInt(match[1], 10);
    const endStr = match[2].toLowerCase();
    const endYear = (endStr === 'present' || endStr === 'current' || endStr === 'now') ? currentYear : parseInt(match[2], 10);
    if (endYear >= startYear && (endYear - startYear) <= 40) {
      matchedRanges.push({ start: startYear, end: endYear, duration: Math.max(1, endYear - startYear) });
    }
  }

  // Deduplicate and estimate total years
  if (matchedRanges.length > 0) {
    const minStart = Math.min(...matchedRanges.map(r => r.start));
    const maxEnd = Math.max(...matchedRanges.map(r => r.end));
    totalYears = Math.min(30, maxEnd - minStart);
  }

  // If explicit "X years of experience" is mentioned in text, use it
  const expMatch = text.match(/(\d+)\+?\s*(?:years|yrs)(?:\s*of)?\s*experience/i);
  if (expMatch) {
    totalYears = Math.max(totalYears, parseInt(expMatch[1], 10));
  }

  // Extract structured role entries
  const roleKeywords = ['engineer', 'developer', 'architect', 'lead', 'manager', 'scientist', 'consultant', 'analyst', 'intern', 'specialist', 'designer'];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const isRoleLine = roleKeywords.some(kw => line.toLowerCase().includes(kw));
    const hasYear = /(20\d{2}|19\d{2})/.test(line);

    if (isRoleLine || (hasYear && line.length < 80)) {
      experienceEntries.push({
        title: line,
        company: lines[i + 1] && lines[i + 1].length < 60 ? lines[i + 1] : '',
        duration: hasYear ? (line.match(/(20\d{2}.*?(?:20\d{2}|present|current|now))/i)?.[0] || 'N/A') : 'N/A',
        description: lines.slice(i + 1, i + 4).join(' ')
      });
      i += 2; // skip a few lines
    }
  }

  return {
    totalYears: totalYears || 2, // default reasonable minimum if unstated
    entries: experienceEntries.slice(0, 5)
  };
}

/**
 * Extract Education credentials
 */
export function extractEducation(text) {
  const educationEntries = [];
  const degrees = [
    { name: 'Ph.D.', regex: /(?:Ph\.D|PhD|Doctor of Philosophy)/i },
    { name: 'Master of Science (M.S.)', regex: /(?:M\.S\.|MS|Master of Science|Master's|M\.Tech|MTech|MCA)/i },
    { name: 'Bachelor of Science (B.S.)', regex: /(?:B\.S\.|BS|Bachelor of Science|Bachelor's|B\.Tech|BTech|B\.E\.|BE|BCA)/i },
    { name: 'Master of Business Administration (MBA)', regex: /(?:MBA|Master of Business Administration)/i },
    { name: 'Bachelor of Arts (B.A.)', regex: /(?:B\.A\.|Bachelor of Arts)/i },
    { name: 'Associate Degree', regex: /(?:Associate Degree|Associate of Science)/i }
  ];

  const majors = [
    'Computer Science', 'Software Engineering', 'Information Technology', 'Data Science',
    'Artificial Intelligence', 'Electrical Engineering', 'Mechanical Engineering',
    'Mathematics', 'Physics', 'Business Administration', 'Economics'
  ];

  for (const deg of degrees) {
    if (deg.regex.test(text)) {
      let matchedMajor = 'Computer Science / Related Field';
      for (const major of majors) {
        if (new RegExp(major, 'i').test(text)) {
          matchedMajor = major;
          break;
        }
      }

      // Look for graduation year
      const yearMatch = text.match(/(?:Graduated|Completed|Class of|Degree\s*-\s*)?\s*(20\d{2}|19\d{2})/i);
      const year = yearMatch ? yearMatch[1] : 'N/A';

      // Look for University / College
      const uniMatch = text.match(/([A-Z][a-zA-Z\s]+(?:University|Institute|College|Academy|School of Technology))/);
      const institution = uniMatch ? uniMatch[1].trim() : 'Accredited University';

      educationEntries.push({
        degree: deg.name,
        field: matchedMajor,
        institution,
        year
      });
      break; // keep highest degree
    }
  }

  if (educationEntries.length === 0) {
    educationEntries.push({
      degree: 'Bachelor of Science (or Equivalent Experience)',
      field: 'Computer Science / Engineering',
      institution: 'University Graduate',
      year: 'Completed'
    });
  }

  return educationEntries;
}

/**
 * Complete Structured Parsing of a Resume
 */
export async function parseResume(input, fileMeta = {}) {
  let rawText = '';
  if (Buffer.isBuffer(input) || (typeof input === 'object' && input.buffer)) {
    const buffer = Buffer.isBuffer(input) ? input : input.buffer;
    rawText = await extractTextFromPDF(buffer);
  } else if (typeof input === 'string') {
    if (input.endsWith('.pdf') && fs.existsSync(input)) {
      rawText = await extractTextFromPDF(input);
    } else {
      rawText = input; // Plain text
    }
  }

  const normalized = normalizeText(rawText);
  const contact = extractContactInfo(normalized);
  const skills = extractSkills(normalized);
  const experience = extractExperience(normalized);
  const education = extractEducation(normalized);

  // Generate a summary if none exists
  const summarySnippet = normalized.split('\n').filter(l => l.length > 30).slice(0, 3).join(' ').slice(0, 300);

  return {
    name: contact.name || fileMeta.originalName?.replace(/\.[^/.]+$/, '') || 'Candidate',
    email: contact.email,
    phone: contact.phone,
    location: contact.location,
    linkedin: contact.linkedin,
    github: contact.github,
    summary: summarySnippet || `${contact.name} is a software professional with experience in ${skills.allSkills.slice(0, 5).join(', ')}.`,
    totalYearsExperience: experience.totalYears,
    skills: skills.allSkills,
    skillsByCategory: skills.skillsByCategory,
    experience: experience.entries,
    education: education,
    certifications: [],
    rawText: normalized,
    fileName: fileMeta.originalName || 'resume.txt',
    filePath: fileMeta.path || null,
    fileType: fileMeta.mimetype || 'text/plain'
  };
}
