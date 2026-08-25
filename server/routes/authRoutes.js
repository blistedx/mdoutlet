import express from 'express';
import { login, registerStaff, getMe, updateProfile } from '../controllers/authController.js';
import { protect, requireAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/login', login);
router.post('/register', protect, requireAdmin, registerStaff); // Only Admin can register staff
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);

export default router;
