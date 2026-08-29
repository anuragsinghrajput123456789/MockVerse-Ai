import 'dotenv/config'; // Load environment variables first (hoisted)
import express from 'express';
import cors from 'cors';
import compression from 'compression';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import helmet from 'helmet';
import morgan from 'morgan';
import { generalLimiter, authLimiter, aiLimiter } from './middleware/rateLimit.js';

// Environment Variables Startup Validation
const isProduction = process.env.NODE_ENV === 'production';
if (isProduction && !process.env.JWT_SECRET) {
  console.warn('⚠️ WARNING: JWT_SECRET environment variable is not defined! Using default secret in production is unsafe.');
}
if (!process.env.MONGODB_URI) {
  console.warn('⚠️ WARNING: MONGODB_URI is not defined in environment variables. Falling back to local MongoDB connection.');
}
if (!process.env.GEMINI_API_KEY) {
  console.warn('ℹ️ INFO: GEMINI_API_KEY is not defined on server. Users must supply custom API key in settings.');
}

// Connect Database
import connectDB from './config/db.js';
import { mongoose } from './config/db.js';
connectDB();

// Route modules
import authRoutes from './routes/authRoutes.js';
import paperRoutes, { chatRouter } from './routes/paperRoutes.js';
import resourceRoutes from './routes/resourceRoutes.js';

const app = express();

// Trust first proxy (required for Render / Vercel rate limiting and secure headers)
app.set('trust proxy', 1);

// Gzip response compression
app.use(compression());

// ─── Security Middleware ──────────────────────────────────────────────────────

// Helmet — sets secure HTTP headers (XSS protection, content-type sniffing, etc.)
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: false, // Disable CSP for API-only server (frontend handles its own)
}));

// ─── Request Logging ──────────────────────────────────────────────────────────

// Morgan — HTTP request logger
if (isProduction) {
  app.use(morgan('combined'));
} else {
  app.use(morgan('dev'));
}

// ─── CORS ─────────────────────────────────────────────────────────────────────

const baseAllowedOrigins = [
  'http://localhost:8080',
  'http://127.0.0.1:8080',
  'http://localhost:5173',
  'http://localhost:3000',
];

const rawClientUrl = process.env.CLIENT_URL || process.env.FRONTEND_URL;
if (rawClientUrl) {
  // Support comma-separated URLs and strip trailing slashes
  const envOrigins = rawClientUrl.split(',').map(url => url.trim().replace(/\/$/, ''));
  baseAllowedOrigins.push(...envOrigins);
}

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, server-to-server, health checks)
    if (!origin) return callback(null, true);
    
    const normalizedOrigin = origin.replace(/\/$/, '');
    const isAllowed = baseAllowedOrigins.includes(normalizedOrigin) || 
                      normalizedOrigin.endsWith('.vercel.app') || 
                      !isProduction;

    if (isAllowed) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key'],
  credentials: true,
}));

// ─── Body Parsing with Size Limit ─────────────────────────────────────────────

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: false, limit: '1mb' }));

// Rate limiting configuration is imported from middleware/rateLimit.js

// ─── Health Check Endpoints ───────────────────────────────────────────────────

// Root health check endpoint for Render / load balancers (Phase 7 requirement)
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    status: 'ok',
    service: 'mockverse-backend',
  });
});

// Diagnostic health check with detailed database status
app.get('/api/health', (req, res) => {
  const dbState = mongoose.connection.readyState;
  const dbStates = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };

  res.status(dbState === 1 ? 200 : 503).json({
    success: dbState === 1,
    status: dbState === 1 ? 'healthy' : 'degraded',
    service: 'mockverse-backend',
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

// Paper routes (AI endpoints are internally limited in paperRoutes.js)
app.use('/api/papers', generalLimiter, paperRoutes);

// Chat route (AI rate limiting)
app.use('/api/chat', aiLimiter, chatRouter);

// Resource Manager routes
app.use('/api/resources', generalLimiter, resourceRoutes);

// ─── 404 Handler for Unknown API Routes ───────────────────────────────────────

app.all('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
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
  // Guard against double-response (headers already sent, e.g. PDF streaming errors)
  if (res.headersSent) {
    console.error('Error after headers sent:', err.message);
    return next(err);
  }

  // CORS errors
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({ success: false, message: 'Cross-origin request blocked by CORS policy.' });
  }

  // JSON parse errors
  if (err.type === 'entity.too.large') {
    return res.status(413).json({ success: false, message: 'Request payload is too large. Maximum allowed size is 1MB.' });
  }

  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ success: false, message: 'Invalid JSON in request body.' });
  }

  // ─── Mongoose-specific Errors ────────────────────────────────────────────────
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ success: false, message: messages.join('. ') });
  }

  if (err.name === 'CastError') {
    return res.status(400).json({ success: false, message: `Invalid value for ${err.path}: ${err.value}` });
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern || {}).join(', ') || 'field';
    return res.status(409).json({ success: false, message: `Duplicate value for ${field}. This entry already exists.` });
  }

  console.error('Unhandled error:', err.stack || err.message);
  
  const statusCode = err.statusCode || 500;
  
  // Show actual error message if it's a client/AI-quota error (4xx) OR if not in production
  const isClientError = statusCode >= 400 && statusCode < 500;
  const showDetailedMessage = isClientError || process.env.NODE_ENV !== 'production';

  res.status(statusCode).json({
    success: false,
    message: showDetailedMessage ? err.message : 'Something went wrong on the server.',
    errorCode: err.errorCode || null,
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
