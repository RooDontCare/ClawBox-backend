require('dotenv').config();

module.exports = {
  // Server config
  port: process.env.PORT || 3000,

  // LLM API config
  llm: {
    apiKey: process.env.LLM_API_KEY || '',
    apiUrl: process.env.LLM_API_URL || 'https://api.openai.com/v1/chat/completions',
    model: process.env.LLM_MODEL || 'gpt-3.5-turbo',
    maxTokens: parseInt(process.env.LLM_MAX_TOKENS) || 500,
    temperature: parseFloat(process.env.LLM_TEMPERATURE) || 0.7
  },

  // CORS config
  cors: {
    origin: process.env.CORS_ORIGIN || '*'
  }
};
