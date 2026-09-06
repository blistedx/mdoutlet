import express from 'express';
import { getStockLevels, updateReorderThreshold, quickStockInward } from '../controllers/stockController.js';
import { protect, requireAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/', getStockLevels);
router.post('/inward', quickStockInward);
router.put('/:productId/threshold', requireAdmin, updateReorderThreshold);

export default router;
