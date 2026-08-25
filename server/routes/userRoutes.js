import express from 'express';
import { getAllUsers, updateUser, deleteUser } from '../controllers/userController.js';
import { protect, requireAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// All user management routes are restricted to Admin
router.use(protect);
router.use(requireAdmin);

router.get('/', getAllUsers);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

export default router;
