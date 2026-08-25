import express from 'express';
import {
  submitFeedback,
  getAllFeedback,
  updateFeedbackStatus,
  deleteFeedback
} from '../controllers/feedbackController.js';
import { protect, requireAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public feedback submission (from Home QR code / mobile scan)
router.post('/', submitFeedback);

// Admin / Staff feedback viewer & management
router.get('/', protect, getAllFeedback);
router.patch('/:id/status', protect, requireAdmin, updateFeedbackStatus);
router.delete('/:id', protect, requireAdmin, deleteFeedback);

export default router;
