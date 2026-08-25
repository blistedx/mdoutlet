import cron from 'node-cron';
import { Op } from 'sequelize';
import { ExpiryBatch } from '../models/index.js';

export const updateExpiryStatuses = async () => {
  try {
    const now = new Date();
    const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

    // 1. Mark expired batches
    await ExpiryBatch.update(
      { status: 'expired' },
      {
        where: {
          expiryDate: { [Op.lte]: now },
          status: { [Op.in]: ['fresh', 'near-expiry'] }
        }
      }
    );

    // 2. Mark near-expiry batches (between now and 3 days)
    await ExpiryBatch.update(
      { status: 'near-expiry' },
      {
        where: {
          expiryDate: { [Op.gt]: now, [Op.lte]: threeDaysFromNow },
          status: 'fresh'
        }
      }
    );
  } catch (error) {
    console.error('[Expiry Cron Error]:', error.message);
  }
};

export const initCronJobs = () => {
  // Run daily at midnight: 0 0 * * *
  cron.schedule('0 0 * * *', () => {
    console.log('[Cron] Running scheduled daily expiry check...');
    updateExpiryStatuses();
  });

  // Also run every 6 hours for proactive freshness checking
  cron.schedule('0 */6 * * *', () => {
    updateExpiryStatuses();
  });

  console.log('Cron scheduler initialized for automatic expiry tracking.');
};
