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
import { protect, optionalProtect } from '../middleware/auth.js';
import { aiLimiter } from '../middleware/rateLimit.js';

const router = express.Router();

// Paper routes supporting both guests and authenticated users
router.post('/', optionalProtect, aiLimiter, generatePaper);
router.get('/', optionalProtect, getPapers);
router.get('/:id', optionalProtect, getPaperById);
router.delete('/:id', optionalProtect, deletePaper);
router.post('/:id/solutions', optionalProtect, aiLimiter, generateSolutions);
router.post('/:id/evaluate', optionalProtect, aiLimiter, evaluateAnswers);

// Chatbot route (separate path, mounted at /api/chat in server.js)
export const chatRouter = express.Router();
chatRouter.post('/', optionalProtect, chatbot);

export default router;
