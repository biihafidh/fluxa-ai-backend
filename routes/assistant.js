const express = require('express');
const axios = require('axios');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();
const MAX_MESSAGES = 20;
const MAX_MESSAGE_LENGTH = 8000;
const MAX_PROMPT_LENGTH = 4000;
const MAX_AUDIO_BYTES = 10 * 1024 * 1024;

const getConfig = () => {
  const apiKey = process.env.AI_API_KEY;
  if (!apiKey) {
    const error = new Error('AI service is not configured');
    error.status = 503;
    throw error;
  }

  return {
    apiKey,
    baseURL: (process.env.AI_BASE_URL || 'https://api.openai.com/v1').replace(/\/$/, '')
  };
};

const aiRequest = async (path, data, options = {}) => {
  const { apiKey, baseURL } = getConfig();
  return axios.post(`${baseURL}${path}`, data, {
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    timeout: 60000,
    maxContentLength: MAX_AUDIO_BYTES,
    maxBodyLength: MAX_AUDIO_BYTES,
    ...options
  });
};

const handleError = (res, error, fallbackMessage) => {
  if (error.status) {
    return res.status(error.status).json({ message: error.message });
  }

  const status = error.response?.status;
  // Avoid returning provider response bodies: they can contain sensitive data.
  console.error('AI provider request failed:', status || error.code || error.message);
  return res.status(status === 429 ? 429 : 502).json({
    message: status === 429 ? 'AI service rate limit reached. Try again shortly.' : fallbackMessage
  });
};

// All assistant endpoints require a valid user JWT.
router.use(authMiddleware);

// POST /api/assistant/chat
router.post('/chat', async (req, res) => {
  const { messages } = req.body || {};
  if (!Array.isArray(messages) || messages.length < 1 || messages.length > MAX_MESSAGES) {
    return res.status(400).json({ message: `messages must contain between 1 and ${MAX_MESSAGES} items` });
  }

  const validMessages = messages.every(message =>
    message && ['user', 'assistant'].includes(message.role) &&
    typeof message.content === 'string' && message.content.trim().length > 0 &&
    message.content.length <= MAX_MESSAGE_LENGTH
  );
  if (!validMessages) {
    return res.status(400).json({ message: 'Each message needs a user/assistant role and non-empty content up to 8000 characters' });
  }

  try {
    const response = await aiRequest('/chat/completions', {
      model: process.env.AI_CHAT_MODEL || 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are Halal AI, a helpful assistant. Be clear and honest. Do not present religious, legal, medical, or financial information as authoritative; encourage consulting a qualified professional when appropriate.' },
        ...messages.map(({ role, content }) => ({ role, content: content.trim() }))
      ],
      temperature: 0.7
    });

    const choice = response.data?.choices?.[0];
    if (!choice?.message?.content) {
      return res.status(502).json({ message: 'AI service returned an empty response' });
    }
    return res.json({ reply: choice.message.content, usage: response.data.usage || null });
  } catch (error) {
    return handleError(res, error, 'Could not get a response from the AI service');
  }
});

// POST /api/assistant/summarize
router.post('/summarize', async (req, res) => {
  const { text, style = 'concise' } = req.body || {};
  if (typeof text !== 'string' || !text.trim() || text.length > MAX_MESSAGE_LENGTH) {
    return res.status(400).json({ message: 'text is required and must be no more than 8000 characters' });
  }
  if (typeof style !== 'string' || style.length > 40) {
    return res.status(400).json({ message: 'style must be a short string' });
  }

  try {
    const response = await aiRequest('/chat/completions', {
      model: process.env.AI_CHAT_MODEL || 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'Summarize the supplied text faithfully. Do not add facts that are not present.' },
        { role: 'user', content: `Summarize this text in a ${style} style:\n\n${text.trim()}` }
      ],
      temperature: 0.3
    });
    const summary = response.data?.choices?.[0]?.message?.content;
    if (!summary) return res.status(502).json({ message: 'AI service returned an empty summary' });
    return res.json({ summary, usage: response.data.usage || null });
  } catch (error) {
    return handleError(res, error, 'Could not summarize the text');
  }
});

// POST /api/assistant/voice - returns an audio/mpeg response for browser playback.
router.post('/voice', async (req, res) => {
  const { text, voice = process.env.AI_TTS_VOICE || 'alloy' } = req.body || {};
  if (typeof text !== 'string' || !text.trim() || text.length > MAX_PROMPT_LENGTH) {
    return res.status(400).json({ message: 'text is required and must be no more than 4000 characters' });
  }
  if (typeof voice !== 'string' || !/^[a-zA-Z0-9_-]{1,40}$/.test(voice)) {
    return res.status(400).json({ message: 'voice must be a valid voice identifier' });
  }

  try {
    const response = await aiRequest('/audio/speech', {
      model: process.env.AI_TTS_MODEL || 'tts-1',
      voice,
      input: text.trim(),
      response_format: 'mp3'
    }, { responseType: 'arraybuffer' });
    res.set({ 'Content-Type': 'audio/mpeg', 'Content-Length': response.data.byteLength, 'Cache-Control': 'no-store' });
    return res.status(200).send(Buffer.from(response.data));
  } catch (error) {
    return handleError(res, error, 'Could not generate voice audio');
  }
});

// POST /api/assistant/image - returns provider image URL(s); keep API keys server-side.
router.post('/image', async (req, res) => {
  const { prompt, size = '1024x1024' } = req.body || {};
  if (typeof prompt !== 'string' || !prompt.trim() || prompt.length > MAX_PROMPT_LENGTH) {
    return res.status(400).json({ message: 'prompt is required and must be no more than 4000 characters' });
  }
  if (!['1024x1024', '1024x1536', '1536x1024'].includes(size)) {
    return res.status(400).json({ message: 'size must be 1024x1024, 1024x1536, or 1536x1024' });
  }

  try {
    const response = await aiRequest('/images/generations', {
      model: process.env.AI_IMAGE_MODEL || 'gpt-image-1',
      prompt: prompt.trim(),
      size,
      n: 1
    });
    const image = response.data?.data?.[0];
    if (!image || (!image.url && !image.b64_json)) {
      return res.status(502).json({ message: 'AI service returned no image' });
    }
    return res.json({ image: image.url ? { url: image.url } : { base64: image.b64_json }, revisedPrompt: image.revised_prompt || null });
  } catch (error) {
    return handleError(res, error, 'Could not generate the image');
  }
});

module.exports = router;
