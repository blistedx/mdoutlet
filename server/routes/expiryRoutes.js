import express from 'express';
import {
  getExpiryBatches,
  createExpiryBatch,
  discardBatch,
  deleteExpiryBatch
} from '../controllers/expiryController.js';
import { protect, requireAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/', getExpiryBatches);
router.post('/', createExpiryBatch);
router.patch('/:id/discard', discardBatch); // Staff can mark batch as discarded
router.delete('/:id', requireAdmin, deleteExpiryBatch); // Only Admin can delete

export default router;
