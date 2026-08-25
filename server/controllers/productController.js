import QRCode from 'qrcode';
import { Op } from 'sequelize';
import { Product, Stock } from '../models/index.js';
import { logAudit } from '../middleware/auditLogger.js';

// @route   GET /api/products
// @desc    Get all products with category and search filtering
// @access  Private
export const getProducts = async (req, res) => {
  try {
    const { category, search, activeOnly } = req.query;
    const where = {};

    if (category && category !== 'All' && category !== 'all') {
      where.category = category;
    }

    if (search && search.trim()) {
      const s = `%${search.trim()}%`;
      where[Op.or] = [
        { name: { [Op.like]: s } },
        { qrCode: { [Op.like]: s } },
        { category: { [Op.like]: s } }
      ];
    }

    if (activeOnly === 'true') {
      where.isActive = true;
    }

    const products = await Product.findAll({
      where,
      include: [{ model: Stock, as: 'stock' }],
      order: [['name', 'ASC']]
    });

    const productsWithStock = products.map((p) => {
      const pJson = p.toJSON();
      const stock = pJson.stock;
      return {
        ...pJson,
        _id: pJson.id,
        currentQuantity: stock ? Number(stock.currentQuantity) : 0,
        reorderThreshold: stock ? Number(stock.reorderThreshold) : Number(pJson.reorderThreshold || 20),
        isLowStock: stock ? Number(stock.currentQuantity) <= Number(stock.reorderThreshold || 20) : true
      };
    });

    res.status(200).json({ success: true, count: productsWithStock.length, products: productsWithStock });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   GET /api/products/:id
// @desc    Get single product by ID or QR Code
// @access  Private
export const getProductById = async (req, res) => {
  try {
    let product;
    const idParam = req.params.id;

    if (!isNaN(idParam)) {
      product = await Product.findByPk(idParam, {
        include: [{ model: Stock, as: 'stock' }]
      });
    }

    if (!product) {
      product = await Product.findOne({
        where: { qrCode: idParam },
        include: [{ model: Stock, as: 'stock' }]
      });
    }

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found with this ID or QR code' });
    }

    const pJson = product.toJSON();
    const stock = pJson.stock;

    res.status(200).json({
      success: true,
      product: {
        ...pJson,
        _id: pJson.id,
        currentQuantity: stock ? Number(stock.currentQuantity) : 0,
        reorderThreshold: stock ? Number(stock.reorderThreshold) : Number(pJson.reorderThreshold || 20)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   POST /api/products
// @desc    Create new product + create associated stock document
// @access  Private/Admin
export const createProduct = async (req, res) => {
  try {
    const { name, category, unit, unitPrice, costPrice, qrCode, description, imageUrl, shelfLifeDays, reorderThreshold } = req.body;

    if (!name || !category || !unit || unitPrice === undefined) {
      return res.status(400).json({ success: false, message: 'Name, category, unit, and unit price are required' });
    }

    // Generate unique QR code identifier if not explicitly provided
    const generatedQr = qrCode && qrCode.trim() 
      ? qrCode.trim().toUpperCase() 
      : `DAIRY-${category.toUpperCase().slice(0, 3)}-${Date.now().toString().slice(-6)}`;

    // Check duplicate QR
    const existingQr = await Product.findOne({ where: { qrCode: generatedQr } });
    if (existingQr) {
      return res.status(400).json({ success: false, message: `A product with QR code "${generatedQr}" already exists` });
    }

    const product = await Product.create({
      name,
      category,
      unit,
      unitPrice: Number(unitPrice),
      costPrice: costPrice ? Number(costPrice) : Math.round(Number(unitPrice) * 0.8),
      qrCode: generatedQr,
      description: description || '',
      imageUrl: imageUrl || '',
      shelfLifeDays: shelfLifeDays ? Number(shelfLifeDays) : 3,
      reorderThreshold: reorderThreshold ? Number(reorderThreshold) : 20
    });

    // Create corresponding Stock record
    await Stock.create({
      productId: product.id,
      currentQuantity: 0,
      reorderThreshold: product.reorderThreshold,
      lastUpdated: new Date()
    });

    await logAudit({
      req,
      action: 'CREATE',
      entityType: 'Product',
      entityId: product.id,
      details: `Created product "${product.name}" (${product.category}) with QR "${product.qrCode}"`
    });

    const pJson = product.toJSON();
    pJson._id = pJson.id;

    res.status(201).json({ success: true, message: `Product "${product.name}" created successfully`, product: pJson });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   PUT /api/products/:id
// @desc    Update product details
// @access  Private/Admin
export const updateProduct = async (req, res) => {
  try {
    const { name, category, unit, unitPrice, costPrice, qrCode, description, imageUrl, shelfLifeDays, reorderThreshold, isActive } = req.body;
    const product = await Product.findByPk(req.params.id);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    if (qrCode && qrCode !== product.qrCode) {
      const duplicate = await Product.findOne({
        where: {
          qrCode: qrCode.trim().toUpperCase(),
          id: { [Op.ne]: product.id }
        }
      });
      if (duplicate) {
        return res.status(400).json({ success: false, message: `QR Code "${qrCode}" is already in use by another product` });
      }
      product.qrCode = qrCode.trim().toUpperCase();
    }

    if (name) product.name = name;
    if (category) product.category = category;
    if (unit) product.unit = unit;
    if (unitPrice !== undefined) product.unitPrice = Number(unitPrice);
    if (costPrice !== undefined) product.costPrice = Number(costPrice);
    if (description !== undefined) product.description = description;
    if (imageUrl !== undefined) product.imageUrl = imageUrl;
    if (shelfLifeDays !== undefined) product.shelfLifeDays = Number(shelfLifeDays);
    if (isActive !== undefined) product.isActive = isActive;

    if (reorderThreshold !== undefined) {
      product.reorderThreshold = Number(reorderThreshold);
      await Stock.update(
        { reorderThreshold: Number(reorderThreshold) },
        { where: { productId: product.id } }
      );
    }

    await product.save();

    await logAudit({
      req,
      action: 'UPDATE',
      entityType: 'Product',
      entityId: product.id,
      details: `Updated product "${product.name}" details`
    });

    const pJson = product.toJSON();
    pJson._id = pJson.id;

    res.status(200).json({ success: true, message: `Product "${product.name}" updated successfully`, product: pJson });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   DELETE /api/products/:id
// @desc    Delete product and associated stock
// @access  Private/Admin
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const prodName = product.name;
    await product.destroy();

    await logAudit({
      req,
      action: 'DELETE',
      entityType: 'Product',
      entityId: req.params.id,
      details: `Admin deleted product "${prodName}"`
    });

    res.status(200).json({ success: true, message: `Product "${prodName}" deleted successfully` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   GET /api/products/:id/qr
// @desc    Generate printable QR Code image (Data URL / PNG)
// @access  Private
export const generateQrCodeImage = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const qrPayload = JSON.stringify({
      id: product.id,
      qrCode: product.qrCode,
      name: product.name,
      category: product.category,
      unit: product.unit,
      price: product.unitPrice
    });

    const qrDataUrl = await QRCode.toDataURL(product.qrCode, {
      errorCorrectionLevel: 'H',
      margin: 2,
      width: 320,
      color: {
        dark: '#1e3a1e',
        light: '#FFFFFF'
      }
    });

    res.status(200).json({
      success: true,
      qrCode: product.qrCode,
      productName: product.name,
      qrDataUrl,
      qrPayload
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
