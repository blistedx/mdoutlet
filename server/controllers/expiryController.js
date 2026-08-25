import { Op } from 'sequelize';
import { ExpiryBatch, Product, User } from '../models/index.js';
import { subtractStock } from '../services/stockSyncService.js';
import { updateExpiryStatuses } from '../services/cronService.js';
import { logAudit } from '../middleware/auditLogger.js';

// @route   GET /api/expiry
// @desc    Get all expiry batches with status and product filtering
// @access  Private
export const getExpiryBatches = async (req, res) => {
  try {
    const { status, productId, nearExpiryOnly } = req.query;
    const where = {};

    if (status && status !== 'all') {
      where.status = status;
    }

    if (productId) {
      where.productId = productId;
    }

    if (nearExpiryOnly === 'true') {
      where.status = { [Op.in]: ['near-expiry', 'expired'] };
    }

    // Refresh statuses before returning
    await updateExpiryStatuses();

    const batches = await ExpiryBatch.findAll({
      where,
      include: [
        { model: Product, as: 'product', attributes: ['id', 'name', 'category', 'unit', 'unitPrice', 'qrCode'] },
        { model: User, as: 'user', attributes: ['id', 'name', 'email', 'role'] }
      ],
      order: [['expiryDate', 'ASC']]
    });

    const formattedBatches = batches.map((b) => {
      const bJson = b.toJSON();
      bJson._id = bJson.id;
      if (bJson.product) {
        bJson.product._id = bJson.product.id;
        bJson.productId = bJson.product;
      }
      if (bJson.user) {
        bJson.user._id = bJson.user.id;
        bJson.addedBy = bJson.user;
      }
      bJson.quantity = Number(bJson.quantity);
      return bJson;
    });

    const summary = {
      totalBatches: formattedBatches.length,
      freshCount: formattedBatches.filter((b) => b.status === 'fresh').length,
      nearExpiryCount: formattedBatches.filter((b) => b.status === 'near-expiry').length,
      expiredCount: formattedBatches.filter((b) => b.status === 'expired').length,
      discardedCount: formattedBatches.filter((b) => b.status === 'discarded').length,
      nearExpiryRiskUnits: formattedBatches
        .filter((b) => b.status === 'near-expiry')
        .reduce((sum, b) => sum + Number(b.quantity || 0), 0),
      expiredWastageUnits: formattedBatches
        .filter((b) => b.status === 'expired')
        .reduce((sum, b) => sum + Number(b.quantity || 0), 0)
    };

    res.status(200).json({
      success: true,
      summary,
      batches: formattedBatches
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   POST /api/expiry
// @desc    Create manual expiry tracking batch
// @access  Private
export const createExpiryBatch = async (req, res) => {
  try {
    const { productId, batchNumber, manufactureDate, expiryDate, quantity, notes } = req.body;

    if (!productId || !batchNumber || !expiryDate || !quantity) {
      return res.status(400).json({
        success: false,
        message: 'Product, batch number, expiry date, and quantity are required'
      });
    }

    const product = await Product.findByPk(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const mfg = manufactureDate ? new Date(manufactureDate) : new Date();
    const exp = new Date(expiryDate);
    const now = new Date();
    const threeDays = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
    const userId = req.user.id || req.user._id;

    let initialStatus = 'fresh';
    if (exp <= now) initialStatus = 'expired';
    else if (exp <= threeDays) initialStatus = 'near-expiry';

    const batch = await ExpiryBatch.create({
      productId: product.id,
      batchNumber: batchNumber.trim(),
      manufactureDate: mfg,
      expiryDate: exp,
      quantity: Number(quantity),
      status: initialStatus,
      addedBy: userId,
      notes: notes || ''
    });

    await logAudit({
      req,
      action: 'CREATE',
      entityType: 'ExpiryBatch',
      entityId: batch.id,
      details: `Logged expiry batch "${batch.batchNumber}" for "${product.name}" (${quantity} ${product.unit}, exp: ${exp.toISOString().split('T')[0]})`
    });

    const populated = await ExpiryBatch.findByPk(batch.id, {
      include: [
        { model: Product, as: 'product', attributes: ['id', 'name', 'category', 'unit', 'qrCode'] },
        { model: User, as: 'user', attributes: ['id', 'name', 'email'] }
      ]
    });

    const bJson = populated.toJSON();
    bJson._id = bJson.id;
    if (bJson.product) {
      bJson.product._id = bJson.product.id;
      bJson.productId = bJson.product;
    }
    if (bJson.user) {
      bJson.user._id = bJson.user.id;
      bJson.addedBy = bJson.user;
    }

    res.status(201).json({
      success: true,
      message: `Batch ${batch.batchNumber} created with status: ${initialStatus}`,
      batch: bJson
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   PATCH /api/expiry/:id/discard
// @desc    Mark batch as discarded / write-off expired stock + DEDUCT FROM INVENTORY
// @access  Private
export const discardBatch = async (req, res) => {
  try {
    const { discardReason } = req.body;
    const batch = await ExpiryBatch.findByPk(req.params.id, {
      include: [{ model: Product, as: 'product' }]
    });

    if (!batch) {
      return res.status(404).json({ success: false, message: 'Expiry batch not found' });
    }

    if (batch.status === 'discarded') {
      return res.status(400).json({ success: false, message: 'This batch has already been marked as discarded' });
    }

    // Deduct damaged / spoiled units from active stock
    try {
      await subtractStock(batch.productId, batch.quantity);
    } catch (e) {
      console.warn('Stock was already zero or lower during batch discard:', e.message);
    }

    batch.status = 'discarded';
    batch.notes = (batch.notes ? batch.notes + ' | ' : '') + (discardReason || 'Expired / spoiled batch written off');
    await batch.save();

    await logAudit({
      req,
      action: 'WASTAGE_LOG',
      entityType: 'ExpiryBatch',
      entityId: batch.id,
      details: `Marked batch ${batch.batchNumber} of ${batch.product?.name} (${batch.quantity} units) as discarded. Stock deducted.`
    });

    const bJson = batch.toJSON();
    bJson._id = bJson.id;
    if (bJson.product) {
      bJson.product._id = bJson.product.id;
      bJson.productId = bJson.product;
    }

    res.status(200).json({
      success: true,
      message: `Batch ${batch.batchNumber} marked as discarded and ${batch.quantity} units written off from stock`,
      batch: bJson
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   DELETE /api/expiry/:id
// @desc    Delete expiry batch record (Admin only)
// @access  Private/Admin
export const deleteExpiryBatch = async (req, res) => {
  try {
    const batch = await ExpiryBatch.findByPk(req.params.id);
    if (!batch) {
      return res.status(404).json({ success: false, message: 'Batch not found' });
    }

    const bNo = batch.batchNumber;
    await batch.destroy();

    await logAudit({
      req,
      action: 'DELETE',
      entityType: 'ExpiryBatch',
      entityId: req.params.id,
      details: `Admin deleted batch record ${bNo}`
    });

    res.status(200).json({ success: true, message: `Batch ${bNo} deleted successfully` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
