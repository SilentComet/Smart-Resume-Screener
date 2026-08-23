import React, { useState } from 'react';
import { X, Briefcase, Plus, Tag, Loader2, Sparkles } from 'lucide-react';
import { createJob } from '../api/client.js';

export default function JobModal({ onClose, onSuccess }) {
  const [title, setTitle] = useState('');
  const [department, setDepartment] = useState('Engineering');
  const [experienceLevel, setExperienceLevel] = useState('Senior Level');
  const [minYears, setMinYears] = useState(4);
  const [reqSkillInput, setReqSkillInput] = useState('');
  const [reqSkills, setReqSkills] = useState(['React', 'TypeScript', 'Node.js', 'PostgreSQL']);
  const [niceSkillInput, setNiceSkillInput] = useState('');
  const [niceSkills, setNiceSkills] = useState(['AWS', 'Docker', 'GraphQL']);
  const [responsibilities, setResponsibilities] = useState('');
  const [educationReq, setEducationReq] = useState("Bachelor's degree in Computer Science or related field");
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const addReqSkill = () => {
    if (reqSkillInput.trim() && !reqSkills.includes(reqSkillInput.trim())) {
      setReqSkills([...reqSkills, reqSkillInput.trim()]);
      setReqSkillInput('');
    }
  };

  const removeReqSkill = (skill) => {
    setReqSkills(reqSkills.filter(s => s !== skill));
  };

  const addNiceSkill = () => {
    if (niceSkillInput.trim() && !niceSkills.includes(niceSkillInput.trim())) {
      setNiceSkills([...niceSkills, niceSkillInput.trim()]);
      setNiceSkillInput('');
    }
  };

  const removeNiceSkill = (skill) => {
    setNiceSkills(niceSkills.filter(s => s !== skill));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      setError('Job title and description are required');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const created = await createJob({
        title: title.trim(),
        department,
        experience_level: experienceLevel,
        min_years_experience: Number(minYears),
        required_skills: reqSkills,
        nice_to_have_skills: niceSkills,
        responsibilities,
        education_requirement: educationReq,
        description: description.trim()
      });
      onSuccess(created);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to create job');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-750 rounded-2xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Create New Job Description</h2>
              <p className="text-xs text-slate-400">Configure target role, skills, and scoring criteria</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
          
          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-300">
              ⚠️ {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Job Title *</label>
              <input
                type="text"
                required
                placeholder="e.g. Lead Backend Engineer"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-750 text-slate-100 text-xs rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Department</label>
              <input
                type="text"
                placeholder="e.g. Infrastructure / Product"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-750 text-slate-100 text-xs rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Experience Level</label>
              <select
                value={experienceLevel}
                onChange={(e) => setExperienceLevel(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-750 text-slate-100 text-xs rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              >
                <option value="Entry Level (0-2 Yrs)">Entry Level (0-2 Yrs)</option>
                <option value="Mid Level (2-4 Yrs)">Mid Level (2-4 Yrs)</option>
                <option value="Senior Level (5+ Yrs)">Senior Level (5+ Yrs)</option>
                <option value="Lead / Staff Level (7+ Yrs)">Lead / Staff Level (7+ Yrs)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Minimum Years of Experience</label>
              <input
                type="number"
                min={0}
                max={25}
                value={minYears}
                onChange={(e) => setMinYears(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-750 text-slate-100 text-xs rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              />
            </div>
          </div>

          {/* Required Skills Tag Input */}
          <div>
            <label className="block text-xs font-semibold text-indigo-300 mb-1">
              Required Skills (Crucial for 1-10 match score)
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                placeholder="Type skill & press Add (e.g. Python, Docker)"
                value={reqSkillInput}
                onChange={(e) => setReqSkillInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addReqSkill(); } }}
                className="flex-1 px-3 py-1.5 bg-slate-950 border border-slate-750 text-slate-100 text-xs rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              />
              <button
                type="button"
                onClick={addReqSkill}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
              {reqSkills.map(s => (
                <span
                  key={s}
                  className="px-2.5 py-1 text-xs font-medium bg-indigo-500/20 text-indigo-200 border border-indigo-500/30 rounded-lg flex items-center gap-1.5"
                >
                  {s}
                  <button type="button" onClick={() => removeReqSkill(s)} className="text-indigo-400 hover:text-white">
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Nice to Have Skills */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Nice-to-Have Skills (Bonus points)
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                placeholder="e.g. Kubernetes, Redis, AWS"
                value={niceSkillInput}
                onChange={(e) => setNiceSkillInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addNiceSkill(); } }}
                className="flex-1 px-3 py-1.5 bg-slate-950 border border-slate-750 text-slate-100 text-xs rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              />
              <button
                type="button"
                onClick={addNiceSkill}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {niceSkills.map(s => (
                <span
                  key={s}
                  className="px-2.5 py-1 text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700 rounded-lg flex items-center gap-1.5"
                >
                  {s}
                  <button type="button" onClick={() => removeNiceSkill(s)} className="text-slate-400 hover:text-white">
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Job Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Job Description & Context *</label>
            <textarea
              rows={4}
              required
              placeholder="Detail the position scope, daily responsibilities, and team expectations..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-750 text-slate-100 text-xs rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold rounded-xl flex items-center gap-2 transition"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Creating Position...
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  Create & Activate Job
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
