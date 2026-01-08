const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const twilio = require('twilio');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const db = require('./database/db');
const orderRoutes = require('./routes/orders');
const twilioRoutes = require('./routes/twilio');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// Routes - IMPORTANT: Mount API routes BEFORE static files
app.use('/api/orders', orderRoutes);
app.use('/twilio', twilioRoutes);

// Serve static files from public directory (after API routes)
app.use(express.static(path.join(__dirname, 'public')));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Test endpoint to verify routes are working
app.get('/test-routes', (req, res) => {
  res.json({ 
    message: 'Routes are working',
    routes: {
      health: '/health',
      twilioVoice: '/twilio/voice',
      twilioTranscription: '/twilio/transcription',
      orders: '/api/orders'
    }
  });
});

// Initialize database and start server
db.init().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/health`);
  });
}).catch(err => {
  console.error('Failed to initialize database:', err);
  process.exit(1);
});

module.exports = app;

