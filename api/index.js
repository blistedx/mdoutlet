import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB, sequelize, activeDatabaseType } from '../server/config/database.js';
import { initializeDefaultUsers, seedDatabase } from '../server/utils/seedData.js';

import authRoutes from '../server/routes/authRoutes.js';
import userRoutes from '../server/routes/userRoutes.js';
import productRoutes from '../server/routes/productRoutes.js';
import stockRoutes from '../server/routes/stockRoutes.js';
import purchaseRoutes from '../server/routes/purchaseRoutes.js';
import saleRoutes from '../server/routes/saleRoutes.js';
import productionRoutes from '../server/routes/productionRoutes.js';
import expiryRoutes from '../server/routes/expiryRoutes.js';
import reportRoutes from '../server/routes/reportRoutes.js';
import auditLogRoutes from '../server/routes/auditLogRoutes.js';
import feedbackRoutes from '../server/routes/feedbackRoutes.js';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Lazy DB Initializer for Serverless Invocations
let isDbInitialized = false;
const ensureDbReady = async () => {
  if (!isDbInitialized) {
    try {
      await connectDB();
      await sequelize.sync();
      await seedDatabase();
      isDbInitialized = true;
    } catch (e) {
      console.error('[Serverless DB Init]:', e.message);
    }
  }
};


app.use(async (req, res, next) => {
  await ensureDbReady();
  next();
});

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    platform: 'Vercel Serverless',
    database: activeDatabaseType.toUpperCase(),
    timestamp: new Date().toISOString()
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/stock', stockRoutes);
app.use('/api/purchases', purchaseRoutes);
app.use('/api/sales', saleRoutes);
app.use('/api/production', productionRoutes);
app.use('/api/expiry', expiryRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/audit-logs', auditLogRoutes);
app.use('/api/feedback', feedbackRoutes);

// Admin seed endpoints
app.post('/api/admin/seed-demo', async (req, res) => {
  try {
    const result = await seedDatabase();
    res.status(200).json({ success: true, message: 'Seeded demo products successfully!', count: result?.count || 28 });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Error handling
app.use((err, req, res, next) => {
  console.error('API Error:', err);
  res.status(500).json({ success: false, message: err.message || 'Internal Server Error' });
});

export default app;
