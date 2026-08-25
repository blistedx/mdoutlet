import express from 'express';
import {
  getDashboardStats,
  getAnalyticsReport,
  exportReportCsv,
  bulkImportData
} from '../controllers/reportController.js';
import { protect, requireAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/dashboard-stats', getDashboardStats);
router.get('/analytics', getAnalyticsReport);
router.get('/export-csv', exportReportCsv);
router.post('/bulk-import', requireAdmin, bulkImportData);

export default router;

