import React, { useState } from 'react';
import { X, Briefcase, Plus, Loader2, Zap } from 'lucide-react';
import { createJob } from '../api/client.js';

const LABEL_STYLE = {
  fontFamily: 'IBM Plex Mono, monospace', fontWeight: 700, fontSize: 11,
  textTransform: 'uppercase', letterSpacing: '0.06em', color: '#0a0a0a',
  display: 'block', marginBottom: 6
};

export default function JobModal({ onClose, onSuccess }) {
  const [title, setTitle] = useState('');
  const [department, setDepartment] = useState('Engineering');
  const [experienceLevel, setExperienceLevel] = useState('Senior Level (5+ Yrs)');
  const [minYears, setMinYears] = useState(4);
  const [reqSkillInput, setReqSkillInput] = useState('');
  const [reqSkills, setReqSkills] = useState(['React', 'TypeScript', 'Node.js', 'PostgreSQL']);
  const [niceSkillInput, setNiceSkillInput] = useState('');
  const [niceSkills, setNiceSkills] = useState(['AWS', 'Docker', 'GraphQL']);
  const [educationReq, setEducationReq] = useState("Bachelor's in Computer Science or related");
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const addSkill = (list, setList, input, setInput) => {
    if (input.trim() && !list.includes(input.trim())) {
      setList([...list, input.trim()]);
      setInput('');
    }
  };

  const removeSkill = (list, setList, skill) => setList(list.filter(s => s !== skill));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) { setError('Job title and description are required'); return; }
    setIsLoading(true); setError(null);
    try {
      const created = await createJob({
        title: title.trim(), department,
        experience_level: experienceLevel,
        min_years_experience: Number(minYears),
        required_skills: reqSkills, nice_to_have_skills: niceSkills,
        education_requirement: educationReq,
        description: description.trim()
      });
      onSuccess(created); onClose();
    } catch (err) {
      setError(err.message || 'Failed to create job');
    } finally {
      setIsLoading(false);
    }
  };

  // Validation: enable submit only when both required fields are non-empty
  const canSubmit = title.trim().length > 0 && description.trim().length > 0;

  const SkillTagInput = ({ label, accent, list, setList, input, setInput, placeholder }) => (
    <div>
      <label style={{ ...LABEL_STYLE, color: accent }}>{label}</label>
      <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
        <input
          type="text"
          className="nb-input"
          placeholder={placeholder}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSkill(list, setList, input, setInput); } }}
          style={{ flex: 1, padding: '8px 12px', fontSize: 13, boxShadow: '2px 2px 0 #0a0a0a' }}
        />
        <button type="button" className="nb-btn nb-btn-black" onClick={() => addSkill(list, setList, input, setInput)} style={{ padding: '8px 14px', fontSize: 12 }}>
          <Plus style={{ width: 14, height: 14 }} /> Add
        </button>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, maxHeight: 88, overflowY: 'auto' }}>
        {list.map(s => (
          <span key={s} style={{ fontFamily: 'IBM Plex Mono, monospace', fontWeight: 700, fontSize: 11, border: `2px solid ${accent}`, padding: '3px 10px', display: 'flex', alignItems: 'center', gap: 6, background: accent === '#0066FF' ? '#e8f0fe' : '#f5fff0', color: '#0a0a0a' }}>
            {s}
            <button type="button" onClick={() => removeSkill(list, setList, s)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: 800, color: '#0a0a0a', lineHeight: 1, padding: 0 }}>×</button>
          </span>
        ))}
      </div>
    </div>
  );

  return (
    <div className="nb-overlay" style={{ alignItems: 'flex-start', paddingTop: 20, paddingBottom: 20 }}>
      <div style={{
        width: '100%', maxWidth: 680,
        maxHeight: 'calc(100vh - 40px)',
        display: 'flex', flexDirection: 'column',
        background: '#fafaf5',
        border: '2.5px solid #0a0a0a',
        boxShadow: '6px 6px 0 #0a0a0a',
        overflow: 'hidden',
      }}>

        {/* Header */}
        <div style={{ background: '#0a0a0a', borderBottom: '2.5px solid #0a0a0a', padding: '18px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 40, height: 40, background: '#FFE500', border: '2px solid #FFE500', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Briefcase style={{ width: 22, height: 22, color: '#0a0a0a' }} />
            </div>
            <div>
              <h2 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 800, fontSize: 18, color: '#fafaf5', margin: 0 }}>Create Job Position</h2>
              <p style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 10, color: '#fafaf5', opacity: 0.55, margin: '2px 0 0' }}>Configure role, skills & scoring criteria</p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: '#FFE500', border: '2.5px solid #FFE500', color: '#0a0a0a', padding: 8, cursor: 'pointer' }}>
            <X style={{ width: 18, height: 18 }} />
          </button>
        </div>

        {/* Scrollable form body */}
        <form onSubmit={handleSubmit} style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minHeight: 0 }}>
          <div style={{ flex: 1, overflowY: 'auto', padding: 24, display: 'flex', flexDirection: 'column', gap: 18, background: '#fafaf5', minHeight: 0 }}>

          {error && (
            <div style={{ background: '#FF0099', border: '2.5px solid #0a0a0a', padding: '10px 14px', boxShadow: '3px 3px 0 #0a0a0a' }}>
              <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontWeight: 700, fontSize: 12, color: '#fff' }}>⚠ {error}</span>
            </div>
          )}

          {/* Row 1: Title + Department */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <label style={LABEL_STYLE}>Job Title *</label>
              <input type="text" required className="nb-input" placeholder="e.g. Lead Backend Engineer" value={title} onChange={e => setTitle(e.target.value)} style={{ width: '100%', padding: '10px 14px', fontSize: 14, boxShadow: '3px 3px 0 #0a0a0a' }} />
            </div>
            <div>
              <label style={LABEL_STYLE}>Department</label>
              <input type="text" className="nb-input" placeholder="e.g. Engineering" value={department} onChange={e => setDepartment(e.target.value)} style={{ width: '100%', padding: '10px 14px', fontSize: 14, boxShadow: '3px 3px 0 #0a0a0a' }} />
            </div>
          </div>

          {/* Row 2: Level + Min Years */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <label style={LABEL_STYLE}>Experience Level</label>
              <select className="nb-select" value={experienceLevel} onChange={e => setExperienceLevel(e.target.value)} style={{ width: '100%', padding: '10px 14px', fontSize: 13, boxShadow: '3px 3px 0 #0a0a0a' }}>
                <option>Entry Level (0-2 Yrs)</option>
                <option>Mid Level (2-4 Yrs)</option>
                <option>Senior Level (5+ Yrs)</option>
                <option>Lead / Staff Level (7+ Yrs)</option>
              </select>
            </div>
            <div>
              <label style={LABEL_STYLE}>Min Years Exp</label>
              <input type="number" min={0} max={25} className="nb-input" value={minYears} onChange={e => setMinYears(e.target.value)} style={{ width: '100%', padding: '10px 14px', fontSize: 14, boxShadow: '3px 3px 0 #0a0a0a' }} />
            </div>
          </div>

          {/* Required Skills */}
          <SkillTagInput
            label="Required Skills (Critical for 1-10 score)"
            accent="#0066FF"
            list={reqSkills} setList={setReqSkills}
            input={reqSkillInput} setInput={setReqSkillInput}
            placeholder="Type skill + Enter (e.g. Python, Docker)"
          />

          {/* Nice to Have Skills */}
          <SkillTagInput
            label="Nice-to-Have Skills (Bonus points)"
            accent="#00CC44"
            list={niceSkills} setList={setNiceSkills}
            input={niceSkillInput} setInput={setNiceSkillInput}
            placeholder="e.g. Kubernetes, Redis, AWS"
          />

          {/* Education */}
          <div>
            <label style={LABEL_STYLE}>Education Requirement</label>
            <input type="text" className="nb-input" value={educationReq} onChange={e => setEducationReq(e.target.value)} style={{ width: '100%', padding: '10px 14px', fontSize: 13, boxShadow: '3px 3px 0 #0a0a0a' }} />
          </div>

          {/* Description */}
          <div>
            <label style={LABEL_STYLE}>Job Description & Context *</label>
            <textarea rows={4} required className="nb-input" placeholder="Detail the position scope, daily responsibilities, team expectations..." value={description} onChange={e => setDescription(e.target.value)} style={{ width: '100%', padding: '10px 14px', fontSize: 13, resize: 'vertical', boxShadow: '3px 3px 0 #0a0a0a' }} />
          </div>

          </div>{/* end scrollable area */}

          {/* Sticky action footer — always visible outside scroll */}
          <div style={{ flexShrink: 0, display: 'flex', justifyContent: 'flex-end', gap: 10, padding: '14px 24px', borderTop: '2.5px solid #0a0a0a', background: '#fafaf5' }}>
            <button type="button" className="nb-btn nb-btn-white" onClick={onClose} style={{ padding: '10px 20px', fontSize: 13 }}>Cancel</button>
            <button type="submit" disabled={isLoading || !canSubmit} className="nb-btn nb-btn-primary" style={{ padding: '10px 20px', fontSize: 13 }}>
              {isLoading ? <Loader2 style={{ width: 15, height: 15, animation: 'nb-spin 0.8s linear infinite' }} /> : <Zap style={{ width: 15, height: 15 }} />}
              {isLoading ? 'Creating...' : 'Create & Activate Job'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
