import { Op } from 'sequelize';
import { Production, ProductionOutput, Product, User } from '../models/index.js';
import { addStock, subtractStock } from '../services/stockSyncService.js';
import { logAudit } from '../middleware/auditLogger.js';

// @route   GET /api/production
// @desc    Get all daily production processing batches
// @access  Private
export const getProductions = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const where = {};

    if (startDate || endDate) {
      where.batchDate = {};
      if (startDate) where.batchDate[Op.gte] = new Date(startDate);
      if (endDate) where.batchDate[Op.lte] = new Date(endDate);
    }

    const productions = await Production.findAll({
      where,
      include: [
        { model: Product, as: 'rawMilkProduct', attributes: ['id', 'name', 'unit', 'qrCode'] },
        {
          model: ProductionOutput,
          as: 'outputProducts',
          include: [{ model: Product, as: 'product', attributes: ['id', 'name', 'category', 'unit', 'unitPrice'] }]
        },
        { model: User, as: 'user', attributes: ['id', 'name', 'email', 'role'] }
      ],
      order: [['batchDate', 'DESC']]
    });

    const formatted = productions.map((p) => {
      const pJson = p.toJSON();
      pJson._id = pJson.id;
      if (pJson.rawMilkProduct) {
        pJson.rawMilkProduct._id = pJson.rawMilkProduct.id;
        pJson.rawMilkProductId = pJson.rawMilkProduct;
      }
      if (pJson.user) {
        pJson.user._id = pJson.user.id;
        pJson.addedBy = pJson.user;
      }
      if (Array.isArray(pJson.outputProducts)) {
        pJson.outputProducts = pJson.outputProducts.map((op) => ({
          _id: op.id,
          id: op.id,
          quantity: Number(op.quantity),
          productId: op.product ? { ...op.product, _id: op.product.id } : op.productId
        }));
      }
      pJson.inputQuantity = Number(pJson.inputQuantity);
      pJson.wastage = Number(pJson.wastage || 0);
      return pJson;
    });

    const totalRawMilkProcessed = formatted.reduce((sum, p) => sum + Number(p.inputQuantity || 0), 0);
    const totalWastage = formatted.reduce((sum, p) => sum + Number(p.wastage || 0), 0);

    res.status(200).json({
      success: true,
      count: formatted.length,
      totalRawMilkProcessed,
      totalWastage,
      productions: formatted
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   POST /api/production
// @desc    Log production batch + DEDUCT RAW MILK + ADD OUTPUT DAIRY PRODUCTS TO STOCK
// @access  Private
export const createProduction = async (req, res) => {
  try {
    const {
      batchDate,
      rawMilkProductId,
      inputQuantity,
      outputProducts,
      wastage,
      notes
    } = req.body;

    if (!inputQuantity || !outputProducts || !Array.isArray(outputProducts) || outputProducts.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Raw milk input quantity and at least one output product are required'
      });
    }

    const numInput = Number(inputQuantity);
    const numWastage = wastage ? Number(wastage) : 0;
    const userId = req.user.id || req.user._id;

    // 1. Identify raw milk product
    let rawProduct = null;
    if (rawMilkProductId) {
      rawProduct = await Product.findByPk(rawMilkProductId);
    }
    if (!rawProduct) {
      rawProduct = await Product.findOne({
        where: {
          [Op.or]: [
            { category: 'raw-milk' },
            { name: { [Op.like]: '%raw milk%' } },
            { category: 'milk' }
          ]
        }
      });
    }

    if (!rawProduct) {
      return res.status(400).json({ success: false, message: 'No valid raw milk product found in catalog' });
    }

    // 2. AUTO STOCK DEDUCT: Deduct Raw Milk
    await subtractStock(rawProduct.id, numInput);

    // 3. AUTO STOCK ADD: Add each output product
    for (const item of outputProducts) {
      if (item.productId && Number(item.quantity) > 0) {
        await addStock(item.productId, Number(item.quantity));
      }
    }

    // 4. Create Production Record
    const production = await Production.create({
      batchDate: batchDate ? new Date(batchDate) : new Date(),
      rawMilkProductId: rawProduct.id,
      inputQuantity: numInput,
      wastage: numWastage,
      addedBy: userId,
      notes: notes || ''
    });

    // 5. Create Production Outputs
    for (const item of outputProducts) {
      if (item.productId && Number(item.quantity) > 0) {
        await ProductionOutput.create({
          productionId: production.id,
          productId: item.productId,
          quantity: Number(item.quantity)
        });
      }
    }

    await logAudit({
      req,
      action: 'PRODUCTION_LOG',
      entityType: 'Production',
      entityId: production.id,
      details: `Processed ${numInput}L raw milk into ${outputProducts.length} dairy products. Wastage: ${numWastage}L. Stocks automatically updated.`
    });

    const populated = await Production.findByPk(production.id, {
      include: [
        { model: Product, as: 'rawMilkProduct', attributes: ['id', 'name', 'unit'] },
        {
          model: ProductionOutput,
          as: 'outputProducts',
          include: [{ model: Product, as: 'product', attributes: ['id', 'name', 'category', 'unit', 'unitPrice'] }]
        },
        { model: User, as: 'user', attributes: ['id', 'name', 'email'] }
      ]
    });

    const pJson = populated.toJSON();
    pJson._id = pJson.id;
    if (pJson.rawMilkProduct) {
      pJson.rawMilkProduct._id = pJson.rawMilkProduct.id;
      pJson.rawMilkProductId = pJson.rawMilkProduct;
    }
    if (pJson.user) {
      pJson.user._id = pJson.user.id;
      pJson.addedBy = pJson.user;
    }
    if (Array.isArray(pJson.outputProducts)) {
      pJson.outputProducts = pJson.outputProducts.map((op) => ({
        _id: op.id,
        id: op.id,
        quantity: Number(op.quantity),
        productId: op.product ? { ...op.product, _id: op.product.id } : op.productId
      }));
    }

    res.status(201).json({
      success: true,
      message: `Production batch logged! Raw milk deducted and output products added to stock.`,
      production: pJson
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @route   DELETE /api/production/:id
// @desc    Delete production batch and reverse stock sync (Admin only)
// @access  Private/Admin
export const deleteProduction = async (req, res) => {
  try {
    const production = await Production.findByPk(req.params.id, {
      include: [{ model: ProductionOutput, as: 'outputProducts' }]
    });

    if (!production) {
      return res.status(404).json({ success: false, message: 'Production record not found' });
    }

    // 1. Add back the raw milk
    if (production.rawMilkProductId) {
      await addStock(production.rawMilkProductId, production.inputQuantity);
    }

    // 2. Subtract the outputs produced
    for (const item of production.outputProducts || []) {
      if (item.productId && Number(item.quantity) > 0) {
        await subtractStock(item.productId, Number(item.quantity));
      }
    }

    await production.destroy();

    await logAudit({
      req,
      action: 'DELETE',
      entityType: 'Production',
      entityId: req.params.id,
      details: `Admin deleted production batch #${req.params.id}. Re-added ${production.inputQuantity}L raw milk and deducted outputs.`
    });

    res.status(200).json({
      success: true,
      message: 'Production record deleted and stocks reversed successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
