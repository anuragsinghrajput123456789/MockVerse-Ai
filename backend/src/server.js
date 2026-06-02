import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
dotenv.config();

// Connect Database
import connectDB from './config/db.js';
connectDB();

// Controllers & Middlewares
import { signup, login, getProfile } from './controllers/authController.js';
import { protect } from './middleware/auth.js';
import {
  generatePaper,
  getPapers,
  getPaperById,
  deletePaper,
  generateSolutions,
  evaluateAnswers,
  chatbot,
} from './controllers/paperController.js';

const app = express();

// Middlewares
const allowedOrigins = [
  'http://localhost:8080',
  'http://127.0.0.1:8080',
  'http://localhost:5173',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV !== 'production') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(express.json());

// Routes
// Auth endpoints
app.post('/api/auth/signup', signup);
app.post('/api/auth/login', login);
app.get('/api/auth/profile', protect, getProfile);

// Question Paper & AI endpoints
app.post('/api/papers', protect, generatePaper);
app.get('/api/papers', protect, getPapers);
app.get('/api/papers/:id', protect, getPaperById);
app.delete('/api/papers/:id', protect, deletePaper);
app.post('/api/papers/:id/solutions', protect, generateSolutions);
app.post('/api/papers/:id/evaluate', protect, evaluateAnswers);
app.post('/api/chat', protect, chatbot);

// Serve frontend static build files in production
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

if (process.env.NODE_ENV === 'production') {
  const distPath = path.join(__dirname, '../../frontend/dist');
  app.use(express.static(distPath));

  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: err.message || 'Something went wrong on the server' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

