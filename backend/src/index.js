require('dotenv').config();

const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const eventsRouter = require('./routes/events');
const authRouter = require('./routes/auth');
const sitesRouter = require('./routes/sites');

const app = express();
const PORT = process.env.PORT || 3001;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/user-analytics';

// ─── Middleware ───────────────────────────────────────────

app.use(helmet({ crossOriginResourcePolicy: false, xFrameOptions: false, contentSecurityPolicy: false }));
app.use(cors());
app.use(morgan('dev'));
app.use(express.json({ limit: '1mb' }));

// Serve the tracker SDK script
app.use(express.static(path.join(__dirname, '../../tracker-sdk/dist')));

// Serve the demo directory for testing over HTTP
app.use('/demo', express.static(path.join(__dirname, '../../tracker-sdk/demo')));

// ─── Routes ──────────────────────────────────────────────

app.use('/api/auth', authRouter);
app.use('/api/sites', sitesRouter);
app.use('/api', eventsRouter);

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    mongo: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Error handler
app.use((err, req, res, _next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// ─── Start Server ────────────────────────────────────────

async function start() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('✅ MongoDB connected');

    app.listen(PORT, () => {
      console.log(`🚀 Backend running at http://localhost:${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/health`);
    });
  } catch (err) {
    console.error('❌ Failed to start:', err);
    process.exit(1);
  }
}

start();
