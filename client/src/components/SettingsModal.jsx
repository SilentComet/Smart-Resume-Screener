import React, { useState, useEffect } from 'react';
import { X, Settings, Key, Cpu, CheckCircle2, AlertCircle, Loader2, Sparkles } from 'lucide-react';
import { fetchSettings, saveSettings, testLLMConnection } from '../api/client.js';

export default function SettingsModal({ onClose, onProviderChanged }) {
  const [provider, setProvider] = useState('fallback');
  const [geminiKey, setGeminiKey] = useState('');
  const [openaiKey, setOpenaiKey] = useState('');
  const [groqKey, setGroqKey] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [isTesting, setIsTesting] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    fetchSettings().then(data => {
      if (data.activeProvider) setProvider(data.activeProvider);
    }).catch(console.error);
  }, []);

  const handleTest = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      let keyToTest = '';
      if (provider === 'gemini') keyToTest = geminiKey;
      if (provider === 'openai') keyToTest = openaiKey;
      if (provider === 'groq') keyToTest = groqKey;

      const res = await testLLMConnection(provider, keyToTest);
      setTestResult(res);
    } catch (err) {
      setTestResult({ success: false, error: err.message });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await saveSettings({
        provider,
        geminiApiKey: geminiKey || undefined,
        openaiApiKey: openaiKey || undefined,
        groqApiKey: groqKey || undefined
      });
      setSaveSuccess(true);
      if (onProviderChanged) onProviderChanged(provider);
      setTimeout(() => {
        setSaveSuccess(false);
        onClose();
      }, 1000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-750 rounded-2xl shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">LLM Provider & Screening Engine</h2>
              <p className="text-xs text-slate-400">Configure foundation models for semantic evaluation</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSave} className="p-6 space-y-5">
          
          {/* Provider Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">Active LLM Engine</label>
            <div className="grid grid-cols-2 gap-2.5">
              {[
                { id: 'fallback', name: 'Built-in Local AI', desc: 'Zero config, Instant TF-IDF + Heuristic' },
                { id: 'gemini', name: 'Google Gemini', desc: 'Gemini 1.5 Flash' },
                { id: 'openai', name: 'OpenAI', desc: 'GPT-4o-mini' },
                { id: 'groq', name: 'Groq LLaMA 3', desc: 'Ultra-fast LLaMA 3.3 70B' }
              ].map(item => (
                <div
                  key={item.id}
                  onClick={() => setProvider(item.id)}
                  className={`p-3 rounded-xl border cursor-pointer transition flex flex-col justify-between ${
                    provider === item.id
                      ? 'bg-indigo-600/15 border-indigo-500 text-white'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold">{item.name}</span>
                    <Cpu className={`w-3.5 h-3.5 ${provider === item.id ? 'text-indigo-400' : 'text-slate-600'}`} />
                  </div>
                  <span className="text-[11px] text-slate-400 mt-1">{item.desc}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Conditional API Key Input */}
          {provider === 'gemini' && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Google Gemini API Key</label>
              <input
                type="password"
                placeholder="AIzaSy..."
                value={geminiKey}
                onChange={(e) => setGeminiKey(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-750 text-slate-100 font-mono text-xs rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              />
            </div>
          )}

          {provider === 'openai' && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">OpenAI API Key</label>
              <input
                type="password"
                placeholder="sk-..."
                value={openaiKey}
                onChange={(e) => setOpenaiKey(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-750 text-slate-100 font-mono text-xs rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              />
            </div>
          )}

          {provider === 'groq' && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Groq API Key</label>
              <input
                type="password"
                placeholder="gsk_..."
                value={groqKey}
                onChange={(e) => setGroqKey(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-750 text-slate-100 font-mono text-xs rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              />
            </div>
          )}

          {/* Test Connection Button & Result */}
          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={handleTest}
              disabled={isTesting}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition"
            >
              {isTesting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5 text-indigo-400" />}
              Test Connection
            </button>

            {testResult && (
              <span className={`text-xs flex items-center gap-1 ${testResult.success ? 'text-emerald-400' : 'text-rose-400'}`}>
                {testResult.success ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                {testResult.message || testResult.error}
              </span>
            )}
          </div>

          {/* Prompt Information Note */}
          <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl text-[11px] text-slate-400 space-y-1">
            <p className="font-semibold text-slate-300">LLM Prompt Guidance (Assignment Compliant):</p>
            <p className="italic">"Compare the following resume with this job description and rate fit on 1–10 with justification."</p>
            <p>Computes multi-dimensional fit score (1-10), gap analysis, strengths, risks, and custom interview questions.</p>
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
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl flex items-center gap-2 transition"
            >
              {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
              {saveSuccess ? 'Saved!' : 'Save Configuration'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
