import React, { useState } from 'react';
import { X, Upload, FileText, CheckCircle2, Loader2, Sparkles, FolderUp } from 'lucide-react';
import { uploadResumes, parseResumeText } from '../api/client.js';

export default function UploadModal({ onClose, onSuccess }) {
  const [tab, setTab] = useState('files'); // 'files' | 'paste'
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [resumeText, setResumeText] = useState('');
  const [candidateName, setCandidateName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFiles(Array.from(e.target.files));
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setSelectedFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleUploadFiles = async () => {
    if (selectedFiles.length === 0) return;
    setIsLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      selectedFiles.forEach(file => formData.append('resumes', file));

      const res = await uploadResumes(formData);
      setSuccessMsg(res.message || 'Resumes uploaded & parsed successfully!');
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1200);
    } catch (err) {
      setError(err.message || 'Failed to upload resumes');
    } finally {
      setIsLoading(false);
    }
  };

  const handleParseText = async (e) => {
    e.preventDefault();
    if (!resumeText.trim()) return;
    setIsLoading(true);
    setError(null);
    try {
      await parseResumeText(resumeText, candidateName);
      setSuccessMsg('Candidate resume parsed and saved to database!');
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1200);
    } catch (err) {
      setError(err.message || 'Failed to parse text resume');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-750 rounded-2xl shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <FolderUp className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Upload Candidate Resumes</h2>
              <p className="text-xs text-slate-400">Supported formats: PDF, TXT, DOCX</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-slate-800 px-6 bg-slate-950/50">
          <button
            onClick={() => setTab('files')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition flex items-center gap-2 ${
              tab === 'files' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            File Upload (PDF / TXT)
          </button>
          <button
            onClick={() => setTab('paste')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition flex items-center gap-2 ${
              tab === 'paste' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            Paste Resume Text
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          
          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-300">
              ⚠️ {error}
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              {successMsg}
            </div>
          )}

          {/* Tab 1: File Dropzone */}
          {tab === 'files' && (
            <div className="space-y-4">
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                className="border-2 border-dashed border-slate-700 hover:border-indigo-500/60 rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer bg-slate-950/40 transition duration-200 group"
                onClick={() => document.getElementById('resumeFileInput').click()}
              >
                <input
                  id="resumeFileInput"
                  type="file"
                  multiple
                  accept=".pdf,.txt,.docx,.doc"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <div className="w-14 h-14 rounded-2xl bg-indigo-600/10 group-hover:bg-indigo-600/20 text-indigo-400 flex items-center justify-center mb-3 transition">
                  <Upload className="w-7 h-7" />
                </div>
                <h4 className="text-sm font-bold text-white mb-1">
                  Drag & Drop PDF or Text resumes here
                </h4>
                <p className="text-xs text-slate-400">
                  Or click to browse from your computer (batch upload supported)
                </p>
              </div>

              {selectedFiles.length > 0 && (
                <div className="space-y-1.5 max-h-36 overflow-y-auto">
                  <span className="text-xs font-semibold text-slate-400">Selected files ({selectedFiles.length}):</span>
                  {selectedFiles.map((f, i) => (
                    <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-slate-800 text-xs text-slate-200">
                      <span className="truncate max-w-sm">{f.name}</span>
                      <span className="text-slate-400 font-mono">{(f.size / 1024).toFixed(1)} KB</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleUploadFiles}
                  disabled={selectedFiles.length === 0 || isLoading}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white text-xs font-semibold rounded-xl flex items-center gap-2 transition"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Parsing & Indexing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      Upload & Parse ({selectedFiles.length})
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Tab 2: Paste Raw Text */}
          {tab === 'paste' && (
            <form onSubmit={handleParseText} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Candidate Name (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Jordan Smith"
                  value={candidateName}
                  onChange={(e) => setCandidateName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-750 text-slate-100 text-xs rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Resume Plain Text *</label>
                <textarea
                  rows={8}
                  required
                  placeholder="Paste resume content here including skills, work history, education..."
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-750 text-slate-100 font-mono text-xs rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!resumeText.trim() || isLoading}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white text-xs font-semibold rounded-xl flex items-center gap-2 transition"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Parsing Resume...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      Extract Structured Data
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

        </div>

      </div>
    </div>
  );
}
