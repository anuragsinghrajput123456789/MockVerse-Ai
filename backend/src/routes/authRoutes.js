import express from 'express';
import { signup, login, getProfile, saveApiKey, getApiKey, deleteApiKey } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.post('/signup', signup);
router.post('/login', login);

// Protected routes
router.get('/profile', protect, getProfile);

// API Key management
router.put('/api-key', protect, saveApiKey);
router.get('/api-key', protect, getApiKey);
router.delete('/api-key', protect, deleteApiKey);

export default router;
