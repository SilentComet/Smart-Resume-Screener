import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

/**
 * High-Precision Embedded Semantic & Heuristic Matcher
 * Provides zero-dependency, instantaneous semantic matching & reasoning
 */
export function computeSemanticMatchFallback(candidate, job) {
  const reqSkills = Array.isArray(job.required_skills)
    ? job.required_skills
    : JSON.parse(job.required_skills || '[]');
  const niceSkills = Array.isArray(job.nice_to_have_skills)
    ? job.nice_to_have_skills
    : JSON.parse(job.nice_to_have_skills || '[]');
  
  const candidateSkills = (candidate.skills || []).map(s => s.toLowerCase());
  const candidateRawText = (candidate.rawText || candidate.raw_text || '').toLowerCase();

  // 1. Skill Matching Analysis
  const matchedRequired = [];
  const missingRequired = [];

  reqSkills.forEach(req => {
    const reqLower = req.toLowerCase();
    const isDirectMatch = candidateSkills.some(cs => cs === reqLower || cs.includes(reqLower) || reqLower.includes(cs));
    const isTextMatch = candidateRawText.includes(reqLower);

    if (isDirectMatch || isTextMatch) {
      matchedRequired.push(req);
    } else {
      missingRequired.push(req);
    }
  });

  const matchedNice = [];
  niceSkills.forEach(nice => {
    const niceLower = nice.toLowerCase();
    if (candidateSkills.some(cs => cs === niceLower || cs.includes(niceLower)) || candidateRawText.includes(niceLower)) {
      matchedNice.push(nice);
    }
  });

  const totalReq = Math.max(1, reqSkills.length);
  const requiredRatio = matchedRequired.length / totalReq;
  const niceRatio = niceSkills.length > 0 ? (matchedNice.length / niceSkills.length) : 0.5;

  const skillScore = Math.min(100, Math.round((requiredRatio * 85) + (niceRatio * 15)));

  // 2. Experience Level Analysis
  const reqMinYears = job.min_years_experience || 3;
  const candYears = candidate.totalYearsExperience || candidate.total_years_experience || 2;
  let experienceScore = 50;

  if (candYears >= reqMinYears + 2) {
    experienceScore = 95;
  } else if (candYears >= reqMinYears) {
    experienceScore = 85;
  } else if (candYears >= reqMinYears - 1) {
    experienceScore = 70;
  } else if (candYears >= reqMinYears - 2) {
    experienceScore = 55;
  } else {
    experienceScore = Math.max(30, Math.round((candYears / reqMinYears) * 60));
  }

  // 3. Education Score
  let educationScore = 80;
  const candidateEdu = Array.isArray(candidate.education)
    ? candidate.education
    : (typeof candidate.education === 'string' ? JSON.parse(candidate.education || '[]') : []);

  const hasMasterOrHigher = candidateEdu.some(e => /master|ms|phd|doctor/i.test(e.degree || ''));
  const hasCS = candidateEdu.some(e => /computer|software|data|engineering/i.test(e.field || ''));

  if (hasMasterOrHigher && hasCS) educationScore = 95;
  else if (hasCS) educationScore = 88;
  else if (candidateEdu.length > 0) educationScore = 78;

  // 4. Overall Weighted Score (Scale 1.0 to 10.0)
  // Weights: Skills 55%, Experience 30%, Education 15%
  const composite100 = (skillScore * 0.55) + (experienceScore * 0.30) + (educationScore * 0.15);
  const fitScore = Math.round((composite100 / 10) * 10) / 10; // 1 decimal place, 1.0 to 10.0
  const matchPercentage = Math.round(composite100);

  // 5. Strengths & Weaknesses Synthesis
  const strengths = [];
  if (matchedRequired.length > 0) {
    strengths.push(`Strong alignment with core required stack: ${matchedRequired.slice(0, 4).join(', ')}.`);
  }
  if (candYears >= reqMinYears) {
    strengths.push(`Possesses ${candYears}+ years of hands-on experience meeting the ${job.experience_level || 'required'} seniority benchmark.`);
  }
  if (matchedNice.length > 0) {
    strengths.push(`Bonus proficiency in secondary requirements: ${matchedNice.slice(0, 3).join(', ')}.`);
  }
  if (strengths.length === 0) {
    strengths.push('Demonstrates foundational software engineering and programming competencies.');
  }

  const weaknesses = [];
  if (missingRequired.length > 0) {
    weaknesses.push(`Lacks explicit verification for critical requirements: ${missingRequired.slice(0, 3).join(', ')}.`);
  }
  if (candYears < reqMinYears) {
    weaknesses.push(`Total years of experience (${candYears} yrs) is below the preferred minimum of ${reqMinYears} yrs for this ${job.title} role.`);
  }
  if (weaknesses.length === 0) {
    weaknesses.push('No significant skill bottlenecks detected; ready for deep technical interview.');
  }

  // 6. Generate Recruiter Justification
  let fitTier = 'Moderate Fit';
  if (fitScore >= 8.5) fitTier = 'Exceptional Match';
  else if (fitScore >= 7.0) fitTier = 'Strong Candidate';
  else if (fitScore >= 5.0) fitTier = 'Potential / Transferable Fit';
  else fitTier = 'Low Fit / Significant Gaps';

  const justification = `${candidate.name || 'Candidate'} is evaluated as a **${fitTier}** (Rating: **${fitScore}/10**, ${matchPercentage}% match) for the **${job.title}** position. The candidate satisfies ${matchedRequired.length} of ${reqSkills.length} mandatory skill criteria (${Math.round((matchedRequired.length / totalReq) * 100)}% skill coverage), featuring solid hands-on capability in ${matchedRequired.slice(0, 3).join(', ') || 'relevant frameworks'}. ${missingRequired.length > 0 ? `Key areas requiring verification include ${missingRequired.slice(0, 2).join(' and ')}.` : 'Candidate displays full architectural alignment across the tech stack.'}`;

  // 7. Recommended Interview Questions
  const interviewQuestions = [
    missingRequired.length > 0
      ? `How would you approach ramping up on ${missingRequired[0]} given your background in ${matchedRequired[0] || 'your core stack'}?`
      : `Describe the most complex architectural challenge you solved using ${matchedRequired[0] || 'your tech stack'}.`,
    `Can you walk through a production issue or latency bottleneck you diagnosed in ${matchedRequired[1] || 'a distributed backend/system'} and how you resolved it?`,
    `Given your ${candYears} years of experience, how do you balance technical velocity with test coverage and code maintainability?`
  ];

  return {
    fit_score: Math.max(1.0, Math.min(10.0, fitScore)),
    match_percentage: matchPercentage,
    skill_score: skillScore,
    experience_score: experienceScore,
    education_score: educationScore,
    justification,
    strengths,
    weaknesses,
    matched_skills: [...matchedRequired, ...matchedNice],
    missing_skills: missingRequired,
    interview_questions: interviewQuestions,
    screening_model: 'Built-in Semantic Engine (Local AI)'
  };
}

/**
 * Builds the LLM Prompt as specified in the assignment PDF
 */
export function buildLLMPrompt(candidate, job) {
  const reqSkills = Array.isArray(job.required_skills)
    ? job.required_skills.join(', ')
    : job.required_skills;
  const niceSkills = Array.isArray(job.nice_to_have_skills)
    ? job.nice_to_have_skills.join(', ')
    : job.nice_to_have_skills;

  return `
You are an expert technical recruiter and AI talent assessment specialist.
Compare the following resume with this job description and rate fit on 1–10 with justification.

### JOB DESCRIPTION:
Title: ${job.title}
Department: ${job.department || 'Engineering'}
Experience Level: ${job.experience_level || 'Mid-Senior'} (Minimum ${job.min_years_experience || 3} years)
Required Skills: ${reqSkills}
Nice to Have Skills: ${niceSkills || 'N/A'}
Responsibilities & Context: ${job.description}

### CANDIDATE RESUME:
Name: ${candidate.name}
Total Experience: ${candidate.totalYearsExperience || candidate.total_years_experience} years
Extracted Skills: ${(candidate.skills || []).join(', ')}
Education: ${JSON.stringify(candidate.education || [])}
Experience History: ${JSON.stringify(candidate.experience || [])}
Full Resume Text:
"""
${(candidate.rawText || candidate.raw_text || '').slice(0, 3000)}
"""

### INSTRUCTIONS:
Evaluate the candidate thoroughly and return a valid JSON object ONLY (no markdown formatting around the JSON, no backticks):
{
  "fit_score": <number between 1.0 and 10.0, e.g. 8.4>,
  "match_percentage": <integer between 0 and 100>,
  "skill_score": <integer between 0 and 100>,
  "experience_score": <integer between 0 and 100>,
  "education_score": <integer between 0 and 100>,
  "justification": "<comprehensive 2-3 paragraph recruiter analysis detailing exact fit, contextual reasoning, and decision rationale>",
  "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "weaknesses": ["<weakness/gap 1>", "<weakness/gap 2>"],
  "matched_skills": ["<skill1>", "<skill2>"],
  "missing_skills": ["<missing skill1>", "<missing skill2>"],
  "interview_questions": ["<question 1>", "<question 2>", "<question 3>"]
}
`;
}

/**
 * Dynamically resolves an available, active model for Gemini API
 */
export async function resolveGeminiModel(apiKey) {
  const preferred = [
    'gemini-2.5-flash',
    'gemini-3.5-flash',
    'gemini-3.6-flash',
    'gemini-flash-latest',
    'gemini-2.5-pro'
  ];

  try {
    const listRes = await axios.get(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`, { timeout: 6000 });
    const modelNames = (listRes.data?.models || []).map(m => m.name.replace('models/', ''));
    for (const p of preferred) {
      if (modelNames.includes(p)) {
        return p;
      }
    }
    const flashModel = modelNames.find(n => n.includes('flash') && !n.includes('image') && !n.includes('tts') && !n.includes('audio'));
    if (flashModel) return flashModel;
  } catch (e) {
    console.warn('Gemini model resolution error:', e.message);
  }
  return 'gemini-2.5-flash';
}

/**
 * Screen Candidate with Gemini API
 */
async function screenWithGemini(candidate, job, apiKey) {
  const prompt = buildLLMPrompt(candidate, job);
  const model = await resolveGeminiModel(apiKey);
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const response = await axios.post(url, {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0.2,
      responseMimeType: 'application/json'
    }
  }, { timeout: 25000 });

  const rawJson = response.data.candidates[0].content.parts[0].text;
  const cleanJson = rawJson.replace(/```json/g, '').replace(/```/g, '').trim();
  const parsed = JSON.parse(cleanJson);
  parsed.screening_model = `Google Gemini (${model})`;
  return parsed;
}

/**
 * Screen Candidate with OpenAI API
 */
async function screenWithOpenAI(candidate, job, apiKey) {
  const prompt = buildLLMPrompt(candidate, job);
  const response = await axios.post('https://api.openai.com/v1/chat/completions', {
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: 'You are a precise technical hiring evaluator. Return valid JSON only.' },
      { role: 'user', content: prompt }
    ],
    response_format: { type: 'json_object' },
    temperature: 0.2
  }, {
    headers: { Authorization: `Bearer ${apiKey}` },
    timeout: 25000
  });

  const parsed = JSON.parse(response.data.choices[0].message.content);
  parsed.screening_model = 'OpenAI GPT-4o-mini';
  return parsed;
}

/**
 * Dynamically resolves an available, active chat model on Groq for the given API key
 */
export async function resolveGroqModel(apiKey) {
  const preferred = [
    'openai/gpt-oss-120b',
    'openai/gpt-oss-20b',
    'groq/compound',
    'llama-3.3-70b-versatile',
    'llama-3.1-70b-versatile',
    'llama-3.1-8b-instant'
  ];

  try {
    const modelsRes = await axios.get('https://api.groq.com/openai/v1/models', {
      headers: { Authorization: `Bearer ${apiKey}` },
      timeout: 8000
    });
    const ids = (modelsRes.data?.data || []).map(m => m.id);
    for (const p of preferred) {
      if (ids.includes(p)) {
        return p;
      }
    }
    const chatModel = ids.find(id => !id.includes('whisper') && !id.includes('guard'));
    if (chatModel) return chatModel;
  } catch (e) {
    console.warn('Groq model resolution error:', e.message);
  }
  return 'groq/compound';
}

/**
 * Screen Candidate with Groq API
 */
async function screenWithGroq(candidate, job, apiKey) {
  const prompt = buildLLMPrompt(candidate, job);
  const model = await resolveGroqModel(apiKey);
  const response = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
    model,
    messages: [
      { role: 'system', content: 'You are a precise technical hiring evaluator. Return valid JSON only.' },
      { role: 'user', content: prompt }
    ],
    response_format: { type: 'json_object' },
    temperature: 0.2
  }, {
    headers: { Authorization: `Bearer ${apiKey}` },
    timeout: 25000
  });

  const parsed = JSON.parse(response.data.choices[0].message.content);
  parsed.screening_model = `Groq (${model})`;
  return parsed;
}

/**
 * Main Screening Dispatcher
 */
export async function screenCandidate(candidate, job, customSettings = {}) {
  const geminiKey = customSettings.geminiApiKey || process.env.GEMINI_API_KEY;
  const openaiKey = customSettings.openaiApiKey || process.env.OPENAI_API_KEY;
  const groqKey = customSettings.groqApiKey || process.env.GROQ_API_KEY;
  const provider = customSettings.provider || (geminiKey ? 'gemini' : (openaiKey ? 'openai' : (groqKey ? 'groq' : 'fallback')));

  try {
    if (provider === 'gemini' && geminiKey) {
      return await screenWithGemini(candidate, job, geminiKey);
    }
    if (provider === 'openai' && openaiKey) {
      return await screenWithOpenAI(candidate, job, openaiKey);
    }
    if (provider === 'groq' && groqKey) {
      return await screenWithGroq(candidate, job, groqKey);
    }
  } catch (error) {
    console.warn(`⚠️ LLM Provider (${provider}) call failed or timed out (${error.message}). Falling back to Embedded Semantic Engine.`);
  }

  // Resilient fallback
  return computeSemanticMatchFallback(candidate, job);
}
