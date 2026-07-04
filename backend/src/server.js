import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';

// Load environment variables
dotenv.config();

// Connect Database
import connectDB from './config/db.js';
import { mongoose } from './config/db.js';
connectDB();

// Route modules
import authRoutes from './routes/authRoutes.js';
import paperRoutes, { chatRouter } from './routes/paperRoutes.js';

const app = express();

// ─── Security Middleware ──────────────────────────────────────────────────────

// Helmet — sets secure HTTP headers (XSS protection, content-type sniffing, etc.)
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: false, // Disable CSP for API-only server (frontend handles its own)
}));

// ─── Request Logging ──────────────────────────────────────────────────────────

// Morgan — HTTP request logger
if (process.env.NODE_ENV === 'production') {
  app.use(morgan('combined'));
} else {
  app.use(morgan('dev'));
}

// ─── CORS ─────────────────────────────────────────────────────────────────────

const allowedOrigins = [
  'http://localhost:8080',
  'http://127.0.0.1:8080',
  'http://localhost:5173',
  'http://localhost:3000',
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, server-to-server, health checks)
    if (!origin || allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV !== 'production') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

// ─── Body Parsing with Size Limit ─────────────────────────────────────────────

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: false, limit: '1mb' }));

// ─── Rate Limiting ────────────────────────────────────────────────────────────

// General API rate limit: 100 requests per 15 minutes per IP
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests from this IP, please try again after 15 minutes.' },
});

// Stricter rate limit for auth endpoints: 10 requests per 15 minutes per IP
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many authentication attempts, please try again after 15 minutes.' },
});

// AI generation endpoints: 20 requests per 15 minutes per IP (Gemini quota protection)
const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many AI generation requests, please try again after 15 minutes.' },
});

// ─── Health Check Endpoint ────────────────────────────────────────────────────

app.get('/api/health', (req, res) => {
  const dbState = mongoose.connection.readyState;
  const dbStates = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };

  res.status(dbState === 1 ? 200 : 503).json({
    status: dbState === 1 ? 'healthy' : 'degraded',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: dbStates[dbState] || 'unknown',
    environment: process.env.NODE_ENV || 'development',
    version: process.env.npm_package_version || '1.0.0',
  });
});

// ─── API Routes ───────────────────────────────────────────────────────────────

// Auth routes (with stricter rate limiting on login/signup)
app.use('/api/auth', authLimiter, authRoutes);

// Paper routes (with AI rate limiting for generation endpoints)
app.post('/api/papers', aiLimiter); // AI generation — stricter limit (passes through to router)
app.use('/api/papers', generalLimiter, paperRoutes);

// Chat route (AI rate limiting)
app.use('/api/chat', aiLimiter, chatRouter);

// ─── 404 Handler for Unknown API Routes ───────────────────────────────────────

app.all('/api/*', (req, res) => {
  res.status(404).json({
    message: `API endpoint not found: ${req.method} ${req.originalUrl}`,
  });
});

// ─── Serve Frontend Static Build Files in Production ──────────────────────────

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

if (process.env.NODE_ENV === 'production') {
  const distPath = path.join(__dirname, '../../frontend/dist');
  if (fs.existsSync(distPath)) {
    console.log(`Serving frontend static files from: ${distPath}`);
    app.use(express.static(distPath));

    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  } else {
    console.log(`Frontend static path not found at: ${distPath}. Running in standalone API mode.`);
    app.get('*', (req, res) => {
      res.status(200).json({ message: 'MockVerse AI Backend API is running successfully.' });
    });
  }
}

// ─── Global Error Handler ─────────────────────────────────────────────────────

app.use((err, req, res, next) => {
  // CORS errors
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({ message: 'Cross-origin request blocked by CORS policy.' });
  }

  // JSON parse errors
  if (err.type === 'entity.too.large') {
    return res.status(413).json({ message: 'Request payload is too large. Maximum allowed size is 1MB.' });
  }

  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ message: 'Invalid JSON in request body.' });
  }

  console.error('Unhandled error:', err.stack || err.message);
  res.status(err.statusCode || 500).json({
    message: process.env.NODE_ENV === 'production'
      ? 'Something went wrong on the server.'
      : (err.message || 'Something went wrong on the server.'),
  });
});

// ─── Start Server ─────────────────────────────────────────────────────────────

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

// ─── Graceful Shutdown ────────────────────────────────────────────────────────

const gracefulShutdown = async (signal) => {
  console.log(`\n${signal} received. Starting graceful shutdown...`);

  server.close(async () => {
    console.log('HTTP server closed.');

    try {
      await mongoose.connection.close();
      console.log('MongoDB connection closed.');
    } catch (err) {
      console.error('Error closing MongoDB connection:', err);
    }

    console.log('Graceful shutdown complete.');
    process.exit(0);
  });

  // Force shutdown after 10 seconds if graceful shutdown hangs
  setTimeout(() => {
    console.error('Forced shutdown after timeout.');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  gracefulShutdown('uncaughtException');
});
