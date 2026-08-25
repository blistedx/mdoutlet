import express from 'express';
import { getProductions, createProduction, deleteProduction } from '../controllers/productionController.js';
import { protect, requireAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/', getProductions);
router.post('/', createProduction); // Staff and Admin can record production
router.delete('/:id', requireAdmin, deleteProduction); // Only Admin can delete/reverse

export default router;
