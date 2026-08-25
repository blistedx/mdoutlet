import express from 'express';
import { getAuditLogs } from '../controllers/auditLogController.js';
import { protect, requireAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Audit logs are visible to Administrator only
router.use(protect);
router.use(requireAdmin);

router.get('/', getAuditLogs);

export default router;
