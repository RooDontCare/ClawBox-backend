const express = require('express');
const axios = require('axios');
const router = express.Router();
const config = require('../config/config');

// Rate limiting (simple in-memory implementation)
const requestCounts = new Map();
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const RATE_LIMIT_MAX = 30; // max requests per minute per IP

function checkRateLimit(ip) {
  const now = Date.now();
  const record = requestCounts.get(ip);

  if (!record) {
    requestCounts.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }

  if (now > record.resetTime) {
    requestCounts.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }

  if (record.count >= RATE_LIMIT_MAX) {
    return false;
  }

  record.count++;
  return true;
}

// POST /api/llm - LLM proxy endpoint
router.post('/api/llm', async (req, res) => {
  try {
    const { prompt, history = [], model } = req.body;
    const clientIp = req.ip || req.connection.remoteAddress;

    // Rate limiting
    if (!checkRateLimit(clientIp)) {
      return res.status(429).json({
        error: 'Too many requests. Please wait a moment.',
        content: '',
        finishReason: 'rate_limited'
      });
    }

    // Validate input
    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({
        error: 'Invalid prompt',
        content: '',
        finishReason: 'error'
      });
    }

    if (!config.llm.apiKey) {
      return res.status(500).json({
        error: 'LLM API key not configured',
        content: '',
        finishReason: 'error'
      });
    }

    // Build messages array with history
    const messages = [
      ...history,
      { role: 'user', content: prompt }
    ];

    // Call LLM API
    const response = await axios.post(
      config.llm.apiUrl,
      {
        model: model || config.llm.model,
        messages: messages,
        max_tokens: config.llm.maxTokens,
        temperature: config.llm.temperature
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.llm.apiKey}`
        },
        timeout: 30000 // 30 second timeout
      }
    );

    const choice = response.data.choices?.[0];
    if (!choice) {
      throw new Error('Invalid LLM response');
    }

    res.json({
      content: choice.message?.content || '',
      finishReason: choice.finish_reason || 'unknown'
    });

  } catch (error) {
    console.error('LLM API Error:', error.response?.data || error.message);

    if (error.code === 'ECONNABORTED') {
      return res.status(504).json({
        error: 'Request timeout',
        content: '',
        finishReason: 'error'
      });
    }

    res.status(500).json({
      error: error.response?.data?.error?.message || 'Failed to call LLM API',
      content: '',
      finishReason: 'error'
    });
  }
});

module.exports = router;
