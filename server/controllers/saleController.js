import { Op } from 'sequelize';
import { Sale, Product, User } from '../models/index.js';
import { subtractStock, addStock } from '../services/stockSyncService.js';
import { logAudit } from '../middleware/auditLogger.js';

// @route   GET /api/sales
// @desc    Get all sales transactions
// @access  Private
export const getSales = async (req, res) => {
  try {
    const { startDate, endDate, productId, customer } = req.query;
    const where = {};

    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date[Op.gte] = new Date(startDate);
      if (endDate) where.date[Op.lte] = new Date(endDate);
    }

    if (productId) {
      where.productId = productId;
    }

    if (customer) {
      where.customerName = { [Op.like]: `%${customer}%` };
    }

    const sales = await Sale.findAll({
      where,
      include: [
        { model: Product, as: 'product', attributes: ['id', 'name', 'category', 'unit', 'qrCode'] },
        { model: User, as: 'user', attributes: ['id', 'name', 'email', 'role'] }
      ],
      order: [['date', 'DESC']]
    });

    const formattedSales = sales.map((s) => {
      const sJson = s.toJSON();
      sJson._id = sJson.id;
      if (sJson.product) {
        sJson.product._id = sJson.product.id;
        sJson.productId = sJson.product;
      }
      if (sJson.user) {
        sJson.user._id = sJson.user.id;
        sJson.addedBy = sJson.user;
      }
      sJson.quantity = Number(sJson.quantity);
      sJson.sellingPrice = Number(sJson.sellingPrice);
      sJson.costPriceSnapshot = Number(sJson.costPriceSnapshot || 0);
      sJson.totalAmount = Number(sJson.totalAmount);
      return sJson;
    });

    const totalRevenue = formattedSales.reduce((sum, s) => sum + Number(s.totalAmount || 0), 0);
    const totalCOGS = formattedSales.reduce((sum, s) => sum + (Number(s.costPriceSnapshot || 0) * Number(s.quantity || 0)), 0);
    const grossProfit = totalRevenue - totalCOGS;
    const totalQuantity = formattedSales.reduce((sum, s) => sum + Number(s.quantity || 0), 0);

    res.status(200).json({
      success: true,
      count: formattedSales.length,
      totalRevenue,
      totalCOGS,
      grossProfit,
      totalQuantity,
      sales: formattedSales
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   POST /api/sales
// @desc    Record sale + AUTO STOCK DEDUCT + RECORD PROFIT SNAPSHOT
// @access  Private
export const createSale = async (req, res) => {
  try {
    const {
      productId,
      quantity,
      sellingPrice,
      customerName,
      outletOrRoute,
      paymentMode,
      date,
      notes
    } = req.body;

    if (!productId || !quantity || sellingPrice === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Product, quantity, and selling price are required'
      });
    }

    const product = await Product.findByPk(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const numQty = Number(quantity);
    const numPrice = Number(sellingPrice);
    const totalAmount = Number((numQty * numPrice).toFixed(2));
    const costPriceSnapshot = Number(product.costPrice) || Math.round(numPrice * 0.8);
    const userId = req.user.id || req.user._id;

    // 1. AUTO STOCK SYNC: Subtract from Stock (throws error if insufficient)
    await subtractStock(product.id, numQty);

    // 2. Create Sale Record
    const sale = await Sale.create({
      productId: product.id,
      quantity: numQty,
      sellingPrice: numPrice,
      costPriceSnapshot,
      totalAmount,
      customerName: customerName || 'Counter Customer',
      outletOrRoute: outletOrRoute || 'Main Dairy Counter',
      paymentMode: paymentMode || 'Cash',
      date: date ? new Date(date) : new Date(),
      addedBy: userId,
      notes: notes || ''
    });

    // 3. Audit Log
    const profit = totalAmount - (costPriceSnapshot * numQty);
    await logAudit({
      req,
      action: 'CREATE',
      entityType: 'Sale',
      entityId: sale.id,
      details: `Sold ${numQty} ${product.unit} of "${product.name}" for ₹${totalAmount} (${paymentMode}). Estimated profit: +₹${profit}. Stock deducted.`
    });

    const populated = await Sale.findByPk(sale.id, {
      include: [
        { model: Product, as: 'product', attributes: ['id', 'name', 'category', 'unit', 'qrCode'] },
        { model: User, as: 'user', attributes: ['id', 'name', 'email'] }
      ]
    });

    const sJson = populated.toJSON();
    sJson._id = sJson.id;
    if (sJson.product) {
      sJson.product._id = sJson.product.id;
      sJson.productId = sJson.product;
    }
    if (sJson.user) {
      sJson.user._id = sJson.user.id;
      sJson.addedBy = sJson.user;
    }

    res.status(201).json({
      success: true,
      message: `Sale of ${numQty} ${product.unit} ${product.name} recorded & stock updated!`,
      sale: sJson
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @route   DELETE /api/sales/:id
// @desc    Delete sale + RESTOCK REVERSED QUANTITY (Admin only)
// @access  Private/Admin
export const deleteSale = async (req, res) => {
  try {
    const sale = await Sale.findByPk(req.params.id, {
      include: [{ model: Product, as: 'product' }]
    });

    if (!sale) {
      return res.status(404).json({ success: false, message: 'Sale record not found' });
    }

    // Reverse stock deduction by adding it back
    await addStock(sale.productId, sale.quantity);

    const prodName = sale.product?.name || 'Item';
    const qty = sale.quantity;

    await sale.destroy();

    await logAudit({
      req,
      action: 'DELETE',
      entityType: 'Sale',
      entityId: req.params.id,
      details: `Admin deleted sale of ${qty} ${prodName}. Restocked ${qty} units.`
    });

    res.status(200).json({
      success: true,
      message: `Sale deleted and ${qty} units restocked successfully`
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
