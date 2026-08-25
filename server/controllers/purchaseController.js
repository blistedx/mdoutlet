import { Op } from 'sequelize';
import { Purchase, Product, ExpiryBatch, User } from '../models/index.js';
import { addStock, subtractStock } from '../services/stockSyncService.js';
import { logAudit } from '../middleware/auditLogger.js';

// @route   GET /api/purchases
// @desc    Get all purchase inward transactions
// @access  Private
export const getPurchases = async (req, res) => {
  try {
    const { startDate, endDate, productId, supplier } = req.query;
    const where = {};

    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date[Op.gte] = new Date(startDate);
      if (endDate) where.date[Op.lte] = new Date(endDate);
    }

    if (productId) {
      where.productId = productId;
    }

    if (supplier) {
      where.supplierName = { [Op.like]: `%${supplier}%` };
    }

    const purchases = await Purchase.findAll({
      where,
      include: [
        { model: Product, as: 'product', attributes: ['id', 'name', 'category', 'unit', 'qrCode'] },
        { model: User, as: 'user', attributes: ['id', 'name', 'email', 'role'] }
      ],
      order: [['date', 'DESC']]
    });

    const formattedPurchases = purchases.map((p) => {
      const pJson = p.toJSON();
      pJson._id = pJson.id;
      if (pJson.product) {
        pJson.product._id = pJson.product.id;
        pJson.productId = pJson.product;
      }
      if (pJson.user) {
        pJson.user._id = pJson.user.id;
        pJson.addedBy = pJson.user;
      }
      pJson.quantity = Number(pJson.quantity);
      pJson.costPrice = Number(pJson.costPrice);
      pJson.totalAmount = Number(pJson.totalAmount);
      return pJson;
    });

    const totalSpent = formattedPurchases.reduce((sum, p) => sum + Number(p.totalAmount || 0), 0);
    const totalQuantity = formattedPurchases.reduce((sum, p) => sum + Number(p.quantity || 0), 0);

    res.status(200).json({
      success: true,
      count: formattedPurchases.length,
      totalSpent,
      totalQuantity,
      purchases: formattedPurchases
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   POST /api/purchases
// @desc    Record new purchase + AUTO STOCK ADD + AUTO EXPIRY BATCH CREATE
// @access  Private
export const createPurchase = async (req, res) => {
  try {
    const {
      productId,
      quantity,
      costPrice,
      supplierName,
      invoiceNumber,
      date,
      expiryDate,
      batchNumber,
      notes
    } = req.body;

    if (!productId || !quantity || costPrice === undefined || !supplierName) {
      return res.status(400).json({
        success: false,
        message: 'Product, quantity, cost price, and supplier name are required'
      });
    }

    const product = await Product.findByPk(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const numQty = Number(quantity);
    const numCost = Number(costPrice);
    const totalAmount = Number((numQty * numCost).toFixed(2));
    const purchaseDate = date ? new Date(date) : new Date();
    const userId = req.user.id || req.user._id;

    // 1. Create Purchase record
    const purchase = await Purchase.create({
      productId: product.id,
      quantity: numQty,
      costPrice: numCost,
      totalAmount,
      supplierName,
      invoiceNumber: invoiceNumber || `INV-${Date.now().toString().slice(-6)}`,
      date: purchaseDate,
      addedBy: userId,
      notes: notes || ''
    });

    // 2. AUTO STOCK SYNC: Add to Stock
    await addStock(product.id, numQty);

    // 3. Create Expiry Batch
    const calculatedExpiry = expiryDate
      ? new Date(expiryDate)
      : new Date(purchaseDate.getTime() + (product.shelfLifeDays || 3) * 24 * 60 * 60 * 1000);

    const generatedBatchNo = batchNumber && batchNumber.trim()
      ? batchNumber.trim()
      : `BCH-${product.category.toUpperCase().slice(0, 3)}-${Date.now().toString().slice(-5)}`;

    const expiryBatch = await ExpiryBatch.create({
      productId: product.id,
      batchNumber: generatedBatchNo,
      manufactureDate: purchaseDate,
      expiryDate: calculatedExpiry,
      quantity: numQty,
      status: calculatedExpiry > new Date() ? 'fresh' : 'expired',
      addedBy: userId,
      notes: `Auto-created from Purchase #${purchase.id}`
    });

    // 4. Audit Log
    await logAudit({
      req,
      action: 'CREATE',
      entityType: 'Purchase',
      entityId: purchase.id,
      details: `Purchased ${numQty} ${product.unit} of "${product.name}" from ${supplierName} for ₹${totalAmount}. Stock synced and batch ${generatedBatchNo} logged.`
    });

    const populated = await Purchase.findByPk(purchase.id, {
      include: [
        { model: Product, as: 'product', attributes: ['id', 'name', 'category', 'unit', 'qrCode'] },
        { model: User, as: 'user', attributes: ['id', 'name', 'email'] }
      ]
    });

    const pJson = populated.toJSON();
    pJson._id = pJson.id;
    if (pJson.product) {
      pJson.product._id = pJson.product.id;
      pJson.productId = pJson.product;
    }
    if (pJson.user) {
      pJson.user._id = pJson.user.id;
      pJson.addedBy = pJson.user;
    }

    const expJson = expiryBatch.toJSON();
    expJson._id = expJson.id;

    res.status(201).json({
      success: true,
      message: `Purchase of ${numQty} ${product.unit} ${product.name} recorded & stock updated!`,
      purchase: pJson,
      expiryBatch: expJson
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   DELETE /api/purchases/:id
// @desc    Delete purchase + REVERSE STOCK DEDUCTION (Admin only)
// @access  Private/Admin
export const deletePurchase = async (req, res) => {
  try {
    const purchase = await Purchase.findByPk(req.params.id, {
      include: [{ model: Product, as: 'product' }]
    });

    if (!purchase) {
      return res.status(404).json({ success: false, message: 'Purchase record not found' });
    }

    // Reverse stock addition
    await subtractStock(purchase.productId, purchase.quantity);

    const prodName = purchase.product?.name || 'Item';
    const qty = purchase.quantity;

    await purchase.destroy();

    await logAudit({
      req,
      action: 'DELETE',
      entityType: 'Purchase',
      entityId: req.params.id,
      details: `Admin deleted purchase of ${qty} ${prodName}. Stock reversed by ${qty}.`
    });

    res.status(200).json({
      success: true,
      message: `Purchase deleted and ${qty} units reversed from stock successfully`
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
