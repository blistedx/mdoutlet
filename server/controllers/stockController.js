import { Stock, Product } from '../models/index.js';
import { logAudit } from '../middleware/auditLogger.js';

// @route   GET /api/stock
// @desc    Get real-time stock levels for all products
// @access  Private
export const getStockLevels = async (req, res) => {
  try {
    const { lowStockOnly } = req.query;

    const stocks = await Stock.findAll({
      include: [
        {
          model: Product,
          as: 'product',
          attributes: ['id', 'name', 'category', 'unit', 'unitPrice', 'costPrice', 'qrCode', 'imageUrl', 'isActive', 'shelfLifeDays']
        }
      ],
      order: [['currentQuantity', 'ASC']]
    });

    let filtered = stocks
      .map((s) => {
        const sJson = s.toJSON();
        const p = sJson.product;
        if (!p || !p.isActive) return null;
        p._id = p.id;
        return {
          ...sJson,
          _id: sJson.id,
          productId: p
        };
      })
      .filter(Boolean);

    if (lowStockOnly === 'true') {
      filtered = filtered.filter((s) => Number(s.currentQuantity) <= Number(s.reorderThreshold));
    }

    const summary = {
      totalProducts: filtered.length,
      totalQuantity: filtered.reduce((sum, s) => sum + Number(s.currentQuantity || 0), 0),
      totalValue: filtered.reduce((sum, s) => sum + (Number(s.currentQuantity || 0) * Number(s.productId?.unitPrice || 0)), 0),
      totalCostValue: filtered.reduce((sum, s) => sum + (Number(s.currentQuantity || 0) * Number(s.productId?.costPrice || 0)), 0),
      lowStockCount: filtered.filter((s) => Number(s.currentQuantity) <= Number(s.reorderThreshold)).length,
      outOfStockCount: filtered.filter((s) => Number(s.currentQuantity) === 0).length
    };

    res.status(200).json({
      success: true,
      summary,
      stocks: filtered
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   PUT /api/stock/:productId/threshold
// @desc    Update reorder threshold for a product (Admin only)
// @access  Private/Admin
export const updateReorderThreshold = async (req, res) => {
  try {
    const { reorderThreshold } = req.body;
    const { productId } = req.params;

    if (reorderThreshold === undefined || Number(reorderThreshold) < 0) {
      return res.status(400).json({ success: false, message: 'Valid non-negative reorder threshold is required' });
    }

    const stock = await Stock.findOne({
      where: { productId },
      include: [{ model: Product, as: 'product' }]
    });

    if (!stock) {
      return res.status(404).json({ success: false, message: 'Stock record not found for product' });
    }

    stock.reorderThreshold = Number(reorderThreshold);
    stock.lastUpdated = new Date();
    await stock.save();

    await logAudit({
      req,
      action: 'UPDATE',
      entityType: 'Stock',
      entityId: stock.id,
      details: `Admin changed reorder threshold to ${reorderThreshold} for ${stock.product?.name}`
    });

    const sJson = stock.toJSON();
    sJson._id = sJson.id;
    if (sJson.product) {
      sJson.product._id = sJson.product.id;
      sJson.productId = sJson.product;
    }

    res.status(200).json({
      success: true,
      message: `Reorder threshold updated to ${reorderThreshold}`,
      stock: sJson
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
