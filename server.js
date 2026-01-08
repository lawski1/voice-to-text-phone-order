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

// Trust proxy (important for Railway/Heroku/etc)
app.set('trust proxy', true);

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Rate limiting - configured for proxy environments (Railway)
// Disable X-Forwarded-For validation since we trust the proxy
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  // Custom key generator that works with proxies
  keyGenerator: (req) => {
    // Use the IP from the request, which Express will resolve from proxy headers
    // since we set trust proxy
    return req.ip || req.connection.remoteAddress || 'unknown';
  },
  // Skip validation of X-Forwarded-For header (we trust Railway's proxy)
  validate: {
    trustProxy: true
  },
  // Skip rate limiting for health checks and Twilio webhooks
  skip: (req) => {
    return req.path === '/health' || req.path.startsWith('/twilio');
  }
});
app.use('/api/', limiter);

// Routes - IMPORTANT: Mount API routes BEFORE static files
app.use('/api/orders', orderRoutes);
app.use('/twilio', twilioRoutes);

// Debug: Log all incoming requests
app.use((req, res, next) => {
  console.log(`[${req.method}] ${req.path}`, {
    url: req.url,
    originalUrl: req.originalUrl,
    baseUrl: req.baseUrl
  });
  next();
});

// Serve static files from public directory (after API routes)
app.use(express.static(path.join(__dirname, 'public')));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Direct test endpoint for Twilio webhook (for debugging)
app.get('/test-twilio-voice', (req, res) => {
  // Import and use the same handler
  const twilioRoutes = require('./routes/twilio');
  const handleVoiceWebhook = twilioRoutes._handleVoiceWebhook || ((req, res) => {
    const twilio = require('twilio');
    const twiml = new twilio.twiml.VoiceResponse();
    twiml.say({ voice: 'alice', language: 'en-US' }, 'Test: Park Slope Perk webhook is working!');
    res.type('text/xml');
    res.send(twiml.toString());
  });
  handleVoiceWebhook(req, res);
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
    },
    timestamp: new Date().toISOString()
  });
});

// 404 handler for debugging
app.use((req, res) => {
  console.log(`[404] Route not found: ${req.method} ${req.path}`);
  res.status(404).json({ 
    error: 'Route not found',
    method: req.method,
    path: req.path,
    url: req.url,
    availableRoutes: [
      'GET /health',
      'GET /test-routes',
      'GET|POST /twilio/voice',
      'POST /twilio/transcription',
      'GET /api/orders'
    ]
  });
});

// Initialize database and start server
db.init().then(() => {
  // Log all registered routes for debugging
  console.log('=== REGISTERED ROUTES ===');
  app._router.stack.forEach((middleware) => {
    if (middleware.route) {
      console.log(`${Object.keys(middleware.route.methods).join(', ').toUpperCase()} ${middleware.route.path}`);
    } else if (middleware.name === 'router') {
      console.log(`Router mounted at: ${middleware.regexp}`);
      // Log routes in the router
      if (middleware.handle && middleware.handle.stack) {
        middleware.handle.stack.forEach((route) => {
          if (route.route) {
            const methods = Object.keys(route.route.methods).join(', ').toUpperCase();
            console.log(`  ${methods} ${middleware.regexp.source.replace('\\', '')}${route.route.path}`);
          }
        });
      }
    }
  });
  console.log('========================');
  
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ Server running on port ${PORT}`);
    console.log(`✅ Health check: http://localhost:${PORT}/health`);
    console.log(`✅ Twilio webhook: http://localhost:${PORT}/twilio/voice`);
    console.log(`✅ All routes registered and ready!`);
  });
}).catch(err => {
  console.error('❌ Failed to initialize database:', err);
  process.exit(1);
});

module.exports = app;

