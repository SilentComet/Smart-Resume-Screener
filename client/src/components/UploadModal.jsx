import React, { useState } from 'react';
import { X, Upload, FileText, CheckCircle2, Loader2, Zap, FolderUp } from 'lucide-react';
import { uploadResumes, parseResumeText } from '../api/client.js';

export default function UploadModal({ onClose, onSuccess }) {
  const [tab, setTab] = useState('files');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [resumeText, setResumeText] = useState('');
  const [candidateName, setCandidateName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFiles(Array.from(e.target.files));
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
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
      setSuccessMsg(res.message || 'Resumes uploaded & parsed!');
      setTimeout(() => { onSuccess(); onClose(); }, 1200);
    } catch (err) {
      setError(err.message || 'Upload failed');
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
      setSuccessMsg('Resume parsed and saved!');
      setTimeout(() => { onSuccess(); onClose(); }, 1200);
    } catch (err) {
      setError(err.message || 'Parse failed');
    } finally {
      setIsLoading(false);
    }
  };

  const TAB_ACTIVE = {
    fontFamily: 'IBM Plex Mono, monospace', fontWeight: 800, fontSize: 11, textTransform: 'uppercase',
    letterSpacing: '0.06em', border: '2.5px solid #0a0a0a', borderBottom: 'none', padding: '10px 20px',
    background: '#FFE500', color: '#0a0a0a', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6
  };
  const TAB_INACTIVE = {
    ...TAB_ACTIVE, background: '#fafaf5', opacity: 0.6, borderColor: 'transparent', borderBottom: '2.5px solid #0a0a0a'
  };

  return (
    <div className="nb-overlay">
      <div className="nb-card-static" style={{ width: '100%', maxWidth: 640, overflow: 'hidden' }}>

        {/* Header */}
        <div style={{ background: '#0a0a0a', borderBottom: '2.5px solid #0a0a0a', padding: '18px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 40, height: 40, background: '#FFE500', border: '2px solid #FFE500', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FolderUp style={{ width: 22, height: 22, color: '#0a0a0a' }} />
            </div>
            <div>
              <h2 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 800, fontSize: 18, color: '#fafaf5', margin: 0 }}>Upload Resumes</h2>
              <p style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 10, color: '#fafaf5', opacity: 0.55, margin: '2px 0 0' }}>PDF, TXT, DOCX supported · Batch upload OK</p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ background: '#FFE500', border: '2.5px solid #FFE500', color: '#0a0a0a', padding: 8, cursor: 'pointer' }}
          >
            <X style={{ width: 18, height: 18 }} />
          </button>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: '2.5px solid #0a0a0a', background: '#fafaf5' }}>
          <button onClick={() => setTab('files')} style={tab === 'files' ? TAB_ACTIVE : TAB_INACTIVE}>
            <Upload style={{ width: 12, height: 12 }} /> File Upload
          </button>
          <button onClick={() => setTab('paste')} style={tab === 'paste' ? TAB_ACTIVE : TAB_INACTIVE}>
            <FileText style={{ width: 12, height: 12 }} /> Paste Text
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: 24, background: '#fafaf5', display: 'flex', flexDirection: 'column', gap: 16 }}>

          {error && (
            <div style={{ background: '#FF0099', border: '2.5px solid #0a0a0a', padding: '10px 14px', boxShadow: '3px 3px 0 #0a0a0a' }}>
              <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontWeight: 700, fontSize: 12, color: '#fff' }}>⚠ {error}</span>
            </div>
          )}

          {successMsg && (
            <div style={{ background: '#00CC44', border: '2.5px solid #0a0a0a', padding: '10px 14px', boxShadow: '3px 3px 0 #0a0a0a', display: 'flex', alignItems: 'center', gap: 8 }}>
              <CheckCircle2 style={{ width: 16, height: 16, color: '#0a0a0a' }} />
              <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontWeight: 700, fontSize: 12, color: '#0a0a0a' }}>{successMsg}</span>
            </div>
          )}

          {/* File Upload Tab */}
          {tab === 'files' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Dropzone */}
              <div
                onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={handleDrop}
                onClick={() => document.getElementById('resumeFileInput').click()}
                style={{
                  border: `3px dashed ${isDragOver ? '#0066FF' : '#0a0a0a'}`,
                  background: isDragOver ? '#e8f0fe' : '#fff',
                  padding: '40px 24px', textAlign: 'center', cursor: 'pointer',
                  transition: 'all 0.15s',
                  boxShadow: isDragOver ? '4px 4px 0 #0066FF' : '4px 4px 0 #0a0a0a'
                }}
              >
                <input id="resumeFileInput" type="file" multiple accept=".pdf,.txt,.docx,.doc" onChange={handleFileChange} style={{ display: 'none' }} />
                <div style={{ width: 60, height: 60, background: '#FFE500', border: '2.5px solid #0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', boxShadow: '3px 3px 0 #0a0a0a' }}>
                  <Upload style={{ width: 28, height: 28, color: '#0a0a0a' }} />
                </div>
                <h4 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 800, fontSize: 16, color: '#0a0a0a', margin: '0 0 6px' }}>
                  Drop resumes here or click to browse
                </h4>
                <p style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 11, color: '#0a0a0a', opacity: 0.55, margin: 0 }}>
                  PDF · TXT · DOCX · DOC — Batch upload supported
                </p>
              </div>

              {/* File List */}
              {selectedFiles.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontWeight: 700, fontSize: 11, textTransform: 'uppercase', color: '#0a0a0a', opacity: 0.6 }}>
                    Selected ({selectedFiles.length} files):
                  </span>
                  <div style={{ maxHeight: 140, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {selectedFiles.map((f, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', border: '1.5px solid #0a0a0a', background: '#fff' }}>
                        <span style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 13, color: '#0a0a0a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '70%' }}>{f.name}</span>
                        <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 10, color: '#0a0a0a', opacity: 0.5 }}>{(f.size / 1024).toFixed(1)} KB</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                <button className="nb-btn nb-btn-white" onClick={onClose} style={{ padding: '10px 18px', fontSize: 13 }}>Cancel</button>
                <button
                  className="nb-btn nb-btn-primary"
                  onClick={handleUploadFiles}
                  disabled={selectedFiles.length === 0 || isLoading}
                  style={{ padding: '10px 18px', fontSize: 13 }}
                >
                  {isLoading ? <Loader2 style={{ width: 15, height: 15, animation: 'nb-spin 0.8s linear infinite' }} /> : <Zap style={{ width: 15, height: 15 }} />}
                  {isLoading ? 'Parsing...' : `Upload & Parse (${selectedFiles.length})`}
                </button>
              </div>
            </div>
          )}

          {/* Paste Text Tab */}
          {tab === 'paste' && (
            <form onSubmit={handleParseText} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ fontFamily: 'IBM Plex Mono, monospace', fontWeight: 700, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#0a0a0a', display: 'block', marginBottom: 6 }}>
                  Candidate Name (Optional)
                </label>
                <input
                  type="text"
                  className="nb-input"
                  placeholder="e.g. Jordan Smith"
                  value={candidateName}
                  onChange={e => setCandidateName(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', fontSize: 14, boxShadow: '3px 3px 0 #0a0a0a' }}
                />
              </div>

              <div>
                <label style={{ fontFamily: 'IBM Plex Mono, monospace', fontWeight: 700, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#0a0a0a', display: 'block', marginBottom: 6 }}>
                  Resume Text *
                </label>
                <textarea
                  rows={8}
                  required
                  className="nb-input"
                  placeholder="Paste full resume content including skills, work history, education..."
                  value={resumeText}
                  onChange={e => setResumeText(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', fontSize: 13, fontFamily: 'IBM Plex Mono, monospace', resize: 'vertical', boxShadow: '3px 3px 0 #0a0a0a' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                <button type="button" className="nb-btn nb-btn-white" onClick={onClose} style={{ padding: '10px 18px', fontSize: 13 }}>Cancel</button>
                <button
                  type="submit"
                  className="nb-btn nb-btn-primary"
                  disabled={!resumeText.trim() || isLoading}
                  style={{ padding: '10px 18px', fontSize: 13 }}
                >
                  {isLoading ? <Loader2 style={{ width: 15, height: 15, animation: 'nb-spin 0.8s linear infinite' }} /> : <Zap style={{ width: 15, height: 15 }} />}
                  {isLoading ? 'Extracting...' : 'Extract Structured Data'}
                </button>
              </div>
            </form>
          )}

        </div>
      </div>
    </div>
  );
}
