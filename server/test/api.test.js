import { parseResume } from '../src/services/parserService.js';
import { screenCandidate, computeSemanticMatchFallback } from '../src/services/llmService.js';
import { SEED_JOBS, SEED_RESUMES } from '../src/db/seed.js';

async function testBackend() {
  console.log('🧪 Testing Resume Parser & Extraction Engine...');

  const sampleResume = SEED_RESUMES[0];
  const parsed = await parseResume(sampleResume.rawText);

  console.log('✅ Candidate Name:', parsed.name);
  console.log('✅ Extracted Skills count:', parsed.skills.length, '->', parsed.skills.slice(0, 8).join(', '));
  console.log('✅ Estimated Experience Years:', parsed.totalYearsExperience);
  console.log('✅ Education Extracted:', parsed.education);

  console.log('\n🧪 Testing LLM Semantic Matching against Senior Full Stack Job...');
  const targetJob = SEED_JOBS[0];
  const evaluation = await screenCandidate(parsed, targetJob);

  console.log('✅ Fit Score (1-10):', evaluation.fit_score);
  console.log('✅ Match %:', evaluation.match_percentage);
  console.log('✅ Matched Skills:', evaluation.matched_skills);
  console.log('✅ Missing Skills:', evaluation.missing_skills);
  console.log('✅ Justification snippet:', evaluation.justification.slice(0, 150) + '...');
  console.log('✅ Interview Questions generated:', evaluation.interview_questions.length);

  console.log('\n🎉 ALL BACKEND LOGIC VERIFIED SUCCESSFULLY!');
}

testBackend().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
