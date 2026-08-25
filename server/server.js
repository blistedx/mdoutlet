import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB, sequelize, activeDatabaseType } from './config/database.js';
import { User } from './models/index.js';
import { initializeDefaultUsers, seedDatabase } from './utils/seedData.js';
import { initCronJobs } from './services/cronService.js';

import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import productRoutes from './routes/productRoutes.js';
import stockRoutes from './routes/stockRoutes.js';
import purchaseRoutes from './routes/purchaseRoutes.js';
import saleRoutes from './routes/saleRoutes.js';
import productionRoutes from './routes/productionRoutes.js';
import expiryRoutes from './routes/expiryRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import auditLogRoutes from './routes/auditLogRoutes.js';
import feedbackRoutes from './routes/feedbackRoutes.js';


dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Health Check API
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    database: activeDatabaseType.toUpperCase(),
    service: 'Dairy Inventory Management Engine',
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


// Manual Admin Re-seed & Demo Endpoints
app.post('/api/admin/seed-demo', async (req, res) => {
  try {
    const result = await seedDatabase();
    res.status(200).json({ success: true, message: 'Successfully seeded 27 Mother Dairy demo products and initial stock!', count: result?.count || 27 });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.post('/api/admin/clear-demo', async (req, res) => {
  try {
    const result = await clearAllDemoData();
    res.status(200).json({ success: true, message: 'All demo products, stock, and transactions removed successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.post('/api/admin/reseed', async (req, res) => {
  try {
    await seedDatabase();
    res.status(200).json({ success: true, message: 'Database successfully initialized!' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});


// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

// Initialize MySQL DB, Sync Tables, Cron, and Start Server
const startServer = async () => {
  try {
    await connectDB();

    // Sync all Sequelize models with database tables
    await sequelize.sync();
    console.log(`[Database] All database tables synced successfully.`);


    // Ensure default admin & staff credentials exist
    await initializeDefaultUsers();

    const userCount = await User.count();
    console.log(`[MySQL] Database ready with ${userCount} registered accounts.`);

    // Start Expiry Auto-Flagging Cron Job
    initCronJobs();

    app.listen(PORT, () => {
      console.log(`=======================================================`);
      console.log(` 🥛 Mother Dairy MySQL Inventory Backend running on Port ${PORT}`);
      console.log(` Database: MySQL (dairy_inventory)`);
      console.log(` Health Check: http://localhost:${PORT}/api/health`);
      console.log(` Default Admin: admin@dairy.com / admin123`);
      console.log(` Default Staff: staff@dairy.com / staff123`);
      console.log(`=======================================================`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    // Even if MySQL connection failed, start HTTP server with 503 so frontend displays connection guidance
    app.listen(PORT, () => {
      console.log(`[Server Started on ${PORT} with DB Warning] Please verify your MySQL server connection.`);
    });
  }
};

startServer();
