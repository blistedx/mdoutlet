import express from 'express';
import { getStockLevels, updateReorderThreshold } from '../controllers/stockController.js';
import { protect, requireAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/', getStockLevels);
router.put('/:productId/threshold', requireAdmin, updateReorderThreshold);

export default router;
