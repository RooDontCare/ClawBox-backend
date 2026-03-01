const express = require('express');
const cors = require('cors');
const config = require('./config/config');
const llmRoutes = require('./routes/llm');
const saveRoutes = require('./routes/save');

const app = express();

// Middleware
app.use(cors({
  origin: config.cors.origin
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Routes
app.use(llmRoutes);
app.use(saveRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'LLM Game Backend API',
    version: '1.0.0',
    endpoints: {
      llm: 'POST /api/llm',
      save: 'POST /api/save',
      load: 'GET /api/load?playerId=xxx',
      health: 'GET /health'
    }
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not found',
    path: req.path
  });
});

// Start server
const PORT = config.port;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(`CORS origin: ${config.cors.origin}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});
