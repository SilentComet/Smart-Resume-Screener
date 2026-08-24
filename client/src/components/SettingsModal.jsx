import React, { useState, useEffect } from 'react';
import { X, Settings, Cpu, CheckCircle2, AlertCircle, Loader2, Zap } from 'lucide-react';
import { fetchSettings, saveSettings, testLLMConnection } from '../api/client.js';

const PROVIDERS = [
  { id: 'fallback', name: 'Built-in Local AI',  desc: 'Zero config · TF-IDF + Heuristics',  color: '#FFE500', textColor: '#0a0a0a' },
  { id: 'gemini',   name: 'Google Gemini',       desc: 'Gemini 1.5 Flash · Best quality',     color: '#0066FF', textColor: '#fff' },
  { id: 'openai',   name: 'OpenAI GPT-4o',       desc: 'GPT-4o-mini · Balanced',              color: '#00CC44', textColor: '#0a0a0a' },
  { id: 'groq',     name: 'Groq LLaMA 3',        desc: 'LLaMA 3.3 70B · Ultra-fast',          color: '#FF5500', textColor: '#fff' },
];

const KEY_FIELDS = {
  gemini: { label: 'Gemini API Key', placeholder: 'AIzaSy...' },
  openai: { label: 'OpenAI API Key', placeholder: 'sk-...' },
  groq:   { label: 'Groq API Key',   placeholder: 'gsk_...' },
};

const LABEL_STYLE = {
  fontFamily: 'IBM Plex Mono, monospace', fontWeight: 700, fontSize: 11,
  textTransform: 'uppercase', letterSpacing: '0.06em', color: '#0a0a0a', display: 'block', marginBottom: 6
};

export default function SettingsModal({ onClose, onProviderChanged }) {
  const [provider, setProvider] = useState('fallback');
  const [geminiKey, setGeminiKey] = useState('');
  const [openaiKey, setOpenaiKey] = useState('');
  const [groqKey, setGroqKey] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [isTesting, setIsTesting] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const keySetters = { gemini: setGeminiKey, openai: setOpenaiKey, groq: setGroqKey };
  const keyValues = { gemini: geminiKey, openai: openaiKey, groq: groqKey };

  useEffect(() => {
    fetchSettings().then(data => { if (data.activeProvider) setProvider(data.activeProvider); }).catch(console.error);
  }, []);

  const handleTest = async () => {
    setIsTesting(true); setTestResult(null);
    try {
      const res = await testLLMConnection(provider, keyValues[provider] || '');
      setTestResult(res);
    } catch (err) {
      setTestResult({ success: false, error: err.message });
    } finally { setIsTesting(false); }
  };

  const handleSave = async (e) => {
    e.preventDefault(); setIsLoading(true);
    try {
      await saveSettings({ provider, geminiApiKey: geminiKey || undefined, openaiApiKey: openaiKey || undefined, groqApiKey: groqKey || undefined });
      setSaveSuccess(true);
      if (onProviderChanged) onProviderChanged(provider);
      setTimeout(() => { setSaveSuccess(false); onClose(); }, 1000);
    } catch (err) { console.error(err); }
    finally { setIsLoading(false); }
  };

  return (
    <div className="nb-overlay">
      <div className="nb-card-static" style={{ width: '100%', maxWidth: 580, overflow: 'hidden' }}>

        {/* Header */}
        <div style={{ background: '#0a0a0a', borderBottom: '2.5px solid #0a0a0a', padding: '18px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 40, height: 40, background: '#FFE500', border: '2px solid #FFE500', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Settings style={{ width: 22, height: 22, color: '#0a0a0a' }} />
            </div>
            <div>
              <h2 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 800, fontSize: 18, color: '#fafaf5', margin: 0 }}>LLM Screening Engine</h2>
              <p style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 10, color: '#fafaf5', opacity: 0.55, margin: '2px 0 0' }}>Configure foundation model for semantic evaluation</p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: '#FFE500', border: '2.5px solid #FFE500', color: '#0a0a0a', padding: 8, cursor: 'pointer' }}>
            <X style={{ width: 18, height: 18 }} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', flex: 1 }}>
          <div style={{ flex: 1, overflowY: 'auto', padding: 24, display: 'flex', flexDirection: 'column', gap: 20, background: '#fafaf5' }}>

          {/* Provider Grid */}
          <div>
            <label style={LABEL_STYLE}>Active LLM Engine</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {PROVIDERS.map(p => (
                <div
                  key={p.id}
                  onClick={() => setProvider(p.id)}
                  style={{
                    border: provider === p.id ? `3px solid #0a0a0a` : '2.5px solid #0a0a0a',
                    background: provider === p.id ? p.color : '#fff',
                    color: provider === p.id ? p.textColor : '#0a0a0a',
                    boxShadow: provider === p.id ? '4px 4px 0 #0a0a0a' : '3px 3px 0 #0a0a0a',
                    padding: '12px 14px', cursor: 'pointer', transition: 'all 0.1s',
                    opacity: provider === p.id ? 1 : 0.7,
                  }}
                  onMouseEnter={e => { e.currentTarget.style.opacity = '1'; }}
                  onMouseLeave={e => { e.currentTarget.style.opacity = provider === p.id ? '1' : '0.7'; }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 800, fontSize: 13 }}>{p.name}</span>
                    <Cpu style={{ width: 14, height: 14 }} />
                  </div>
                  <p style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 10, margin: '4px 0 0', opacity: 0.75 }}>{p.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* API Key Input */}
          {KEY_FIELDS[provider] && (
            <div>
              <label style={LABEL_STYLE}>{KEY_FIELDS[provider].label}</label>
              <input
                type="password"
                className="nb-input"
                placeholder={KEY_FIELDS[provider].placeholder}
                value={keyValues[provider]}
                onChange={e => keySetters[provider](e.target.value)}
                style={{ width: '100%', padding: '10px 14px', fontSize: 14, fontFamily: 'IBM Plex Mono, monospace', boxShadow: '3px 3px 0 #0a0a0a' }}
              />
            </div>
          )}

          {/* Test Connection */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderTop: '2px solid #0a0a0a', borderBottom: '2px solid #0a0a0a' }}>
            <button type="button" className="nb-btn nb-btn-black" onClick={handleTest} disabled={isTesting} style={{ padding: '8px 16px', fontSize: 12 }}>
              {isTesting ? <Loader2 style={{ width: 14, height: 14, animation: 'nb-spin 0.8s linear infinite' }} /> : <Zap style={{ width: 14, height: 14 }} />}
              Test Connection
            </button>
            {testResult && (
              <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontWeight: 700, fontSize: 12, color: testResult.success ? '#00CC44' : '#FF0099', display: 'flex', alignItems: 'center', gap: 6 }}>
                {testResult.success ? <CheckCircle2 style={{ width: 14, height: 14 }} /> : <AlertCircle style={{ width: 14, height: 14 }} />}
                {testResult.message || testResult.error}
              </span>
            )}
          </div>

          {/* Prompt Note */}
          <div style={{ background: '#0a0a0a', border: '2.5px solid #0a0a0a', padding: '12px 16px', boxShadow: '3px 3px 0 #0a0a0a' }}>
            <p style={{ fontFamily: 'IBM Plex Mono, monospace', fontWeight: 700, fontSize: 11, color: '#FFE500', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 6px' }}>LLM Prompt (Assignment Compliant)</p>
            <p style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 11, color: '#fafaf5', opacity: 0.7, margin: '0 0 4px', fontStyle: 'italic' }}>"Compare resume with job description. Rate fit 1-10 with justification."</p>
            <p style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 10, color: '#fafaf5', opacity: 0.55, margin: 0 }}>Returns: fit score · skill gaps · strengths · risks · interview questions</p>
          </div>

          </div>{/* end scrollable content */}

          {/* Sticky footer */}
          <div style={{ flexShrink: 0, display: 'flex', justifyContent: 'flex-end', gap: 10, padding: '14px 24px', borderTop: '2.5px solid #0a0a0a', background: '#fafaf5' }}>
            <button type="button" className="nb-btn nb-btn-white" onClick={onClose} style={{ padding: '10px 20px', fontSize: 13 }}>Cancel</button>
            <button type="submit" disabled={isLoading} className="nb-btn nb-btn-primary" style={{ padding: '10px 20px', fontSize: 13 }}>
              {isLoading ? <Loader2 style={{ width: 15, height: 15, animation: 'nb-spin 0.8s linear infinite' }} /> : <CheckCircle2 style={{ width: 15, height: 15 }} />}
              {saveSuccess ? '✓ Saved!' : 'Save Configuration'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
