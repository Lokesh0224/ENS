const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const challengeRoutes = require('./routes/challenge');
const verifyRoutes = require('./routes/verify');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/challenge', challengeRoutes);
app.use('/verify', verifyRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    service: 'Cross-Chain Identity Hub Backend'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: err.message 
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`🚀 Cross-Chain Identity Hub Backend running on port ${PORT}`);
  console.log(`📋 Health check: http://localhost:${PORT}/health`);
  console.log(`🔗 Challenge endpoint: http://localhost:${PORT}/challenge`);
  console.log(`✅ Verify endpoint: http://localhost:${PORT}/verify`);
});

module.exports = app;
