import express from 'express';
import {
  generatePaper,
  getPapers,
  getPaperById,
  deletePaper,
  generateSolutions,
  evaluateAnswers,
  chatbot,
} from '../controllers/paperController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// All paper routes require authentication
router.post('/', protect, generatePaper);
router.get('/', protect, getPapers);
router.get('/:id', protect, getPaperById);
router.delete('/:id', protect, deletePaper);
router.post('/:id/solutions', protect, generateSolutions);
router.post('/:id/evaluate', protect, evaluateAnswers);

// Chatbot route (separate path, mounted at /api/chat in server.js)
export const chatRouter = express.Router();
chatRouter.post('/', protect, chatbot);

export default router;
