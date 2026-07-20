import express from 'express';
import {
  createSheet,
  getSheets,
  getSheet,
  updateSheet,
  deleteSheet,
  duplicateSheet,
  addResource,
  updateResource,
  deleteResource,
  getSheetQrCode,
  exportSheetPdf,
  exportSheetHtml,
} from '../controllers/resourceController.js';
import { protect, optionalProtect } from '../middleware/auth.js';

const router = express.Router();

// Collection routes
router.post('/sheets', protect, createSheet);
router.get('/sheets', protect, getSheets);
router.get('/sheets/:id', optionalProtect, getSheet);
router.put('/sheets/:id', protect, updateSheet);
router.delete('/sheets/:id', protect, deleteSheet);
router.post('/sheets/:id/duplicate', protect, duplicateSheet);

// Resource routes inside collections
router.post('/sheets/:id/resources', protect, addResource);
router.put('/resources/:id', protect, updateResource);
router.delete('/resources/:id', protect, deleteResource);

// Export & Sharing endpoints
router.get('/sheets/:id/qr', optionalProtect, getSheetQrCode);
router.get('/sheets/:id/pdf', optionalProtect, exportSheetPdf);
router.get('/sheets/:id/html', optionalProtect, exportSheetHtml);

export default router;
