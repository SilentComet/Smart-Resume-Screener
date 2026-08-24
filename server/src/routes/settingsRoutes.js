import express from 'express';
import axios from 'axios';
import { query } from '../db/database.js';
import { resolveGroqModel, resolveGeminiModel } from '../services/llmService.js';

const router = express.Router();

// Get configured settings
router.get('/', async (req, res) => {
  try {
    const rows = await query.all('SELECT * FROM settings');
    const settings = {};
    rows.forEach(r => {
      // Obfuscate secret keys for security in UI
      if (r.key.includes('Key') && r.value) {
        settings[r.key] = r.value.slice(0, 4) + '...' + r.value.slice(-4);
      } else {
        settings[r.key] = r.value;
      }
    });

    res.json({
      provider: settings.provider || 'fallback',
      hasGeminiKey: !!(process.env.GEMINI_API_KEY || (rows.find(r => r.key === 'geminiApiKey')?.value)),
      hasOpenAIKey: !!(process.env.OPENAI_API_KEY || (rows.find(r => r.key === 'openaiApiKey')?.value)),
      hasGroqKey: !!(process.env.GROQ_API_KEY || (rows.find(r => r.key === 'groqApiKey')?.value)),
      activeProvider: settings.provider || 'fallback'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update settings / API keys
router.post('/', async (req, res) => {
  try {
    const { provider, geminiApiKey, openaiApiKey, groqApiKey } = req.body;

    if (provider) {
      await query.run('INSERT OR REPLACE INTO settings (key, value, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)', ['provider', provider]);
    }
    if (geminiApiKey) {
      await query.run('INSERT OR REPLACE INTO settings (key, value, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)', ['geminiApiKey', geminiApiKey]);
    }
    if (openaiApiKey) {
      await query.run('INSERT OR REPLACE INTO settings (key, value, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)', ['openaiApiKey', openaiApiKey]);
    }
    if (groqApiKey) {
      await query.run('INSERT OR REPLACE INTO settings (key, value, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)', ['groqApiKey', groqApiKey]);
    }

    res.json({ message: 'Settings saved successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Test connection to selected LLM provider
router.post('/test', async (req, res) => {
  const { provider, apiKey } = req.body;
  try {
    if (provider === 'gemini') {
      const key = apiKey || process.env.GEMINI_API_KEY;
      if (!key) return res.status(400).json({ error: 'Gemini API key is required' });
      
      const model = await resolveGeminiModel(key);
      await axios.post(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`, {
        contents: [{ parts: [{ text: 'Ping' }] }]
      }, { timeout: 10000 });

      return res.json({ success: true, message: `Google Gemini API connected successfully using model ${model}!` });
    }

    if (provider === 'openai') {
      const key = apiKey || process.env.OPENAI_API_KEY;
      if (!key) return res.status(400).json({ error: 'OpenAI API key is required' });
      await axios.post('https://api.openai.com/v1/chat/completions', {
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: 'Ping' }],
        max_tokens: 5
      }, {
        headers: { Authorization: `Bearer ${key}` },
        timeout: 10000
      });
      return res.json({ success: true, message: 'OpenAI API connected successfully!' });
    }

    if (provider === 'groq') {
      const key = apiKey || process.env.GROQ_API_KEY;
      if (!key) return res.status(400).json({ error: 'Groq API key is required' });
      const model = await resolveGroqModel(key);
      await axios.post('https://api.groq.com/openai/v1/chat/completions', {
        model,
        messages: [{ role: 'user', content: 'Ping' }],
        max_tokens: 5
      }, {
        headers: { Authorization: `Bearer ${key}` },
        timeout: 10000
      });
      return res.json({ success: true, message: `Groq API connected successfully using model ${model}!` });
    }

    return res.json({ success: true, message: 'Built-in Local Semantic Engine is active and running.' });
  } catch (error) {
    return res.status(400).json({ success: false, error: `Connection failed: ${error.response?.data?.error?.message || error.message}` });
  }
});

export default router;
