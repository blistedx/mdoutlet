import express from 'express';
import { getSales, createSale, deleteSale } from '../controllers/saleController.js';
import { protect, requireAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/', getSales);
router.post('/', createSale); // Staff and Admin can record sales
router.delete('/:id', requireAdmin, deleteSale); // Only Admin can delete/reverse

export default router;
