import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';

const app = express();

app.use(cors());
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// In-Memory Global Datasets for Serverless Runtime
const PRODUCTS = [
  { _id: 1, id: 1, name: 'Mother Dairy Full Cream Milk (1L)', category: 'milk', unit: 'litre', unitPrice: 68, costPrice: 54, qrCode: 'MD-MILK-FC-1L', barcode: '8901648001018', description: 'Pasteurized homogenized full cream milk with 6.0% FAT & 9.0% SNF.', shelfLifeDays: 2, reorderThreshold: 25, currentQuantity: 0, isLowStock: false, isActive: true },
  { _id: 2, id: 2, name: 'Mother Dairy Toned Milk (500ml)', category: 'milk', unit: 'packet', unitPrice: 28, costPrice: 22, qrCode: 'MD-MILK-TONED-500M', barcode: '8901648001025', description: 'Fresh toned milk with 3.0% FAT & 8.5% SNF.', shelfLifeDays: 2, reorderThreshold: 30, currentQuantity: 0, isLowStock: false, isActive: true },
  { _id: 3, id: 3, name: 'Mother Dairy Live Cow Milk (1L)', category: 'milk', unit: 'litre', unitPrice: 58, costPrice: 46, qrCode: 'MD-MILK-COW-1L', barcode: '8901648001032', description: '100% natural, easily digestible cow milk rich in Calcium.', shelfLifeDays: 2, reorderThreshold: 20, currentQuantity: 0, isLowStock: false, isActive: true },
  { _id: 4, id: 4, name: 'Fresh Chilled Raw Cow Milk (Bulk)', category: 'raw-milk', unit: 'litre', unitPrice: 48, costPrice: 40, qrCode: 'MD-RAW-COW-BULK', barcode: '8901648001049', description: 'Direct farm milk collected from local dairy farmers for processing.', shelfLifeDays: 1, reorderThreshold: 50, currentQuantity: 0, isLowStock: false, isActive: true },
  { _id: 5, id: 5, name: 'Mother Dairy Classic Dahi / Curd (400g)', category: 'curd', unit: 'pack', unitPrice: 45, costPrice: 34, qrCode: 'MD-DAHI-CLASSIC-400G', barcode: '8901648002015', description: 'Thick, creamy, naturally fermented curd.', shelfLifeDays: 6, reorderThreshold: 20, currentQuantity: 0, isLowStock: false, isActive: true },
  { _id: 6, id: 6, name: 'Mother Dairy Probiotic Dahi (200g)', category: 'curd', unit: 'tub', unitPrice: 30, costPrice: 22, qrCode: 'MD-DAHI-PROBIOTIC-200G', barcode: '8901648002022', description: 'Probiotic dahi enriched with BB-12 gut-friendly bacteria.', shelfLifeDays: 7, reorderThreshold: 15, currentQuantity: 0, isLowStock: false, isActive: true },
  { _id: 7, id: 7, name: 'Mother Dairy Authentic Mishti Doi (100g)', category: 'curd', unit: 'cup', unitPrice: 25, costPrice: 18, qrCode: 'MD-DOI-MISHTI-100G', barcode: '8901648002039', description: 'Traditional caramelized sweet curd in terracotta style cup.', shelfLifeDays: 7, reorderThreshold: 15, currentQuantity: 0, isLowStock: false, isActive: true },
  { _id: 8, id: 8, name: 'Mother Dairy Malai Paneer (200g)', category: 'paneer', unit: 'packet', unitPrice: 95, costPrice: 75, qrCode: 'MD-PANEER-MALAI-200G', barcode: '8901648003012', description: 'Ultra-soft malai paneer with rich texture and pure milk goodness.', shelfLifeDays: 15, reorderThreshold: 20, currentQuantity: 0, isLowStock: false, isActive: true },
  { _id: 9, id: 9, name: 'Mother Dairy Fresh Paneer Block (1kg)', category: 'paneer', unit: 'block', unitPrice: 420, costPrice: 330, qrCode: 'MD-PANEER-1KG', barcode: '8901648003029', description: 'Bulk restaurant & home size soft malai paneer.', shelfLifeDays: 12, reorderThreshold: 10, currentQuantity: 0, isLowStock: false, isActive: true },
  { _id: 10, id: 10, name: 'Mother Dairy Pure Cow Ghee (1L Tin)', category: 'ghee', unit: 'tin', unitPrice: 650, costPrice: 510, qrCode: 'MD-GHEE-COW-1L', barcode: '8901648004019', description: 'Golden, granular and aromatic pure cow ghee made with traditional bilona process.', shelfLifeDays: 270, reorderThreshold: 10, currentQuantity: 0, isLowStock: false, isActive: true },
  { _id: 11, id: 11, name: 'Mother Dairy Salted Butter (500g)', category: 'butter', unit: 'pack', unitPrice: 275, costPrice: 220, qrCode: 'MD-BUTTER-SALT-500G', barcode: '8901648005016', description: 'Rich pasteurized cream table butter.', shelfLifeDays: 180, reorderThreshold: 15, currentQuantity: 0, isLowStock: false, isActive: true },
  { _id: 12, id: 12, name: 'Mother Dairy Masala Chaach (200ml)', category: 'buttermilk', unit: 'pouch', unitPrice: 15, costPrice: 10, qrCode: 'MD-CHAACH-MASALA-200M', barcode: '8901648006013', description: 'Refreshing spiced buttermilk with roasted jeera & rock salt.', shelfLifeDays: 8, reorderThreshold: 40, currentQuantity: 0, isLowStock: false, isActive: true }
];

let PURCHASES = [];
let SALES = [];
let FEEDBACKS = [];

// Health Check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    platform: 'Vercel Serverless (Ultra Fast)',
    productsCount: PRODUCTS.length,
    timestamp: new Date().toISOString()
  });
});

// Auth Routes
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body || {};
  const isStaff = email?.toLowerCase()?.includes('staff');
  const user = {
    id: isStaff ? 2 : 1,
    _id: isStaff ? 2 : 1,
    name: isStaff ? 'Store Staff Counter' : 'Mother Dairy Admin',
    email: email || 'admin@dairy.com',
    role: isStaff ? 'staff' : 'admin'
  };
  const token = 'demo-admin-jwt-token-2026';
  res.status(200).json({ success: true, message: `Welcome ${user.name}!`, user, token });
});

app.get('/api/auth/me', (req, res) => {
  res.status(200).json({
    success: true,
    user: { id: 1, _id: 1, name: 'Mother Dairy Admin', email: 'admin@dairy.com', role: 'admin' }
  });
});

// Products Routes
app.get('/api/products', (req, res) => {
  const { category, search } = req.query || {};
  let list = PRODUCTS;
  if (category && category !== 'All' && category !== 'all') {
    list = list.filter(p => p.category === category);
  }
  if (search) {
    const s = search.toLowerCase();
    list = list.filter(p => 
      p.name.toLowerCase().includes(s) || 
      p.qrCode.toLowerCase().includes(s) || 
      (p.barcode && p.barcode.toLowerCase().includes(s))
    );
  }
  res.status(200).json({ success: true, count: list.length, products: list });
});

app.get('/api/products/:id', (req, res) => {
  const { id } = req.params;
  const upper = (id || '').trim().toUpperCase();
  const prod = PRODUCTS.find(p => 
    String(p.id) === id || 
    String(p._id) === id || 
    (p.barcode && p.barcode.toUpperCase() === upper) ||
    p.qrCode.toUpperCase() === upper
  );
  if (!prod) {
    return res.status(404).json({ success: false, message: 'Product not found with this code' });
  }
  res.status(200).json({ success: true, product: { ...prod, currentQuantity: prod.currentQuantity || 0 } });
});

app.post('/api/products', (req, res) => {
  const newP = { ...req.body, id: PRODUCTS.length + 1, _id: PRODUCTS.length + 1, currentQuantity: Number(req.body.currentQuantity) || 0, isLowStock: false, isActive: true };
  PRODUCTS.unshift(newP);
  res.status(201).json({ success: true, message: 'Product added successfully!', product: newP });
});

// Stock Routes
app.get('/api/stock', (req, res) => {
  const stocks = PRODUCTS.map(p => {
    const pBatches = EXPIRY_BATCHES.filter(b => 
      b.productId?._id == p._id || b.productId?.id == p.id || b.productId == p.id || b.productId == p._id
    );
    return {
      _id: p._id,
      id: p.id,
      productId: p,
      product: p,
      quantity: Number(p.currentQuantity || 0),
      reorderThreshold: p.reorderThreshold || 20,
      status: (p.currentQuantity || 0) <= (p.reorderThreshold || 20) ? 'low' : 'optimal',
      batches: pBatches
    };
  });

  const summary = {
    totalProducts: stocks.length,
    totalQuantity: stocks.reduce((sum, s) => sum + s.quantity, 0),
    lowStockCount: stocks.filter(s => s.quantity <= s.reorderThreshold).length,
    expiringBatchesCount: EXPIRY_BATCHES.filter(b => b.status === 'near-expiry' || b.daysLeft <= 3).length
  };

  res.status(200).json({ success: true, summary, stocks });
});

app.post('/api/stock/inward', (req, res) => {
  const { productId, barcode, quantity, costPrice, expiryDate, batchNumber, supplierName, notes } = req.body;
  const numQty = Number(quantity) || 1;
  const cleanCode = (barcode || '').toString().trim().toUpperCase();

  const prod = PRODUCTS.find(p => 
    (productId && (String(p.id) === String(productId) || String(p._id) === String(productId))) ||
    (cleanCode && ((p.barcode && p.barcode.toUpperCase() === cleanCode) || p.qrCode.toUpperCase() === cleanCode))
  );

  if (!prod) {
    return res.status(404).json({ success: false, message: 'Product not found for barcode: ' + (barcode || productId) });
  }

  const cost = Number(costPrice) || (prod.costPrice || 30);
  prod.currentQuantity = Number(prod.currentQuantity || 0) + numQty;
  prod.isLowStock = prod.currentQuantity <= (prod.reorderThreshold || 20);

  const batch = batchNumber || `BCH-${prod.category.slice(0, 3).toUpperCase()}-${Date.now().toString().slice(-5)}`;
  const calcExpiry = expiryDate || new Date(Date.now() + (prod.shelfLifeDays || 3) * 86400000).toISOString().split('T')[0];

  const purchaseItem = {
    id: PURCHASES.length + 1,
    _id: PURCHASES.length + 1,
    productId: prod._id,
    product: { ...prod },
    quantity: numQty,
    costPrice: cost,
    totalAmount: Number((numQty * cost).toFixed(2)),
    supplierName: supplierName || 'Mother Dairy Barcode Inward',
    invoiceNumber: `BAR-${Date.now().toString().slice(-6)}`,
    batchNumber: batch,
    date: new Date().toISOString(),
    notes: notes || 'Quick Barcode Stock Inward'
  };
  PURCHASES.unshift(purchaseItem);

  const expiryBatch = {
    id: EXPIRY_BATCHES.length + 1,
    _id: EXPIRY_BATCHES.length + 1,
    productId: prod,
    product: prod,
    batchNumber: batch,
    manufactureDate: new Date().toISOString().split('T')[0],
    expiryDate: calcExpiry,
    quantity: numQty,
    status: 'fresh',
    daysLeft: prod.shelfLifeDays || 5,
    notes: notes || 'Barcode Inward'
  };
  EXPIRY_BATCHES.unshift(expiryBatch);

  res.status(201).json({
    success: true,
    message: `Successfully added ${numQty} ${prod.unit} of "${prod.name}" to stock!`,
    currentQuantity: prod.currentQuantity,
    product: { ...prod },
    batch: { batchNumber: batch, expiryDate: calcExpiry },
    purchaseId: purchaseItem.id
  });
});

// Purchases Routes
app.get('/api/purchases', (req, res) => {
  const totalSpent = PURCHASES.reduce((sum, p) => sum + (p.totalAmount || 0), 0);
  const totalQuantity = PURCHASES.reduce((sum, p) => sum + (p.quantity || 0), 0);
  res.status(200).json({ success: true, count: PURCHASES.length, totalSpent, totalQuantity, purchases: PURCHASES });
});

app.post('/api/purchases', (req, res) => {
  const prodId = req.body.productId?.id || req.body.productId?._id || req.body.productId;
  const prod = PRODUCTS.find(p => String(p.id) === String(prodId) || String(p._id) === String(prodId));
  const qty = Number(req.body.quantity) || 1;
  const cost = Number(req.body.costPrice) || (prod ? prod.costPrice : 30);

  if (prod) {
    prod.currentQuantity = Number(prod.currentQuantity || 0) + qty;
    prod.isLowStock = prod.currentQuantity <= (prod.reorderThreshold || 20);
  }

  const item = {
    ...req.body,
    id: PURCHASES.length + 1,
    _id: PURCHASES.length + 1,
    productId: prod ? prod._id : prodId,
    product: prod ? { ...prod } : { name: 'Item', costPrice: cost },
    quantity: qty,
    costPrice: cost,
    totalAmount: Number((qty * cost).toFixed(2)),
    date: req.body.date ? new Date(req.body.date).toISOString() : new Date().toISOString()
  };
  PURCHASES.unshift(item);
  res.status(201).json({ success: true, message: 'Purchase registered & stock updated successfully!', purchase: item });
});

app.delete('/api/purchases/:id', (req, res) => {
  const { id } = req.params;
  const idx = PURCHASES.findIndex(p => String(p.id) === String(id) || String(p._id) === String(id));
  if (idx === -1) {
    return res.status(404).json({ success: false, message: 'Purchase record not found' });
  }
  const purchase = PURCHASES[idx];
  const prodId = purchase.productId?.id || purchase.productId?._id || purchase.productId || purchase.product?.id || purchase.product?._id;
  const prod = PRODUCTS.find(p => String(p.id) === String(prodId) || String(p._id) === String(prodId));
  if (prod) {
    prod.currentQuantity = Math.max(0, Number(prod.currentQuantity || 0) - Number(purchase.quantity || 0));
    prod.isLowStock = prod.currentQuantity <= (prod.reorderThreshold || 20);
  }
  PURCHASES.splice(idx, 1);
  res.status(200).json({ success: true, message: 'Purchase deleted and stock adjusted successfully!' });
});

// Sales Routes
app.get('/api/sales', (req, res) => {
  const totalRevenue = SALES.reduce((sum, s) => sum + (s.totalAmount || 0), 0);
  res.status(200).json({ success: true, count: SALES.length, totalRevenue, sales: SALES });
});

app.post('/api/sales', (req, res) => {
  const prodId = req.body.productId?.id || req.body.productId?._id || req.body.productId;
  const prod = PRODUCTS.find(p => String(p.id) === String(prodId) || String(p._id) === String(prodId));
  const qty = Number(req.body.quantity) || 1;
  const price = Number(req.body.sellingPrice) || (prod ? prod.unitPrice : 40);
  const cost = Number(prod ? prod.costPrice : Math.round(price * 0.8));

  if (prod) {
    prod.currentQuantity = Math.max(0, Number(prod.currentQuantity || 0) - qty);
    prod.isLowStock = prod.currentQuantity <= (prod.reorderThreshold || 20);
  }

  const item = {
    ...req.body,
    id: SALES.length + 1,
    _id: SALES.length + 1,
    productId: prod ? prod._id : prodId,
    product: prod ? { ...prod } : { name: 'Item', unitPrice: price },
    quantity: qty,
    sellingPrice: price,
    costPriceSnapshot: cost,
    totalAmount: Number((qty * price).toFixed(2)),
    date: req.body.date ? new Date(req.body.date).toISOString() : new Date().toISOString()
  };
  SALES.unshift(item);
  res.status(201).json({
    success: true,
    message: `Sale of ${qty} ${prod?.unit || 'units'} ${prod?.name || 'Item'} recorded & stock updated!`,
    sale: item
  });
});

app.delete('/api/sales/:id', (req, res) => {
  const { id } = req.params;
  const saleIndex = SALES.findIndex(s => String(s.id) === String(id) || String(s._id) === String(id));
  if (saleIndex === -1) {
    return res.status(404).json({ success: false, message: 'Sale record not found' });
  }
  const sale = SALES[saleIndex];
  const prodId = sale.productId?.id || sale.productId?._id || sale.productId || sale.product?.id || sale.product?._id;
  const prod = PRODUCTS.find(p => String(p.id) === String(prodId) || String(p._id) === String(prodId));
  if (prod) {
    prod.currentQuantity = Number(prod.currentQuantity || 0) + Number(sale.quantity || 0);
    prod.isLowStock = prod.currentQuantity <= (prod.reorderThreshold || 20);
  }
  SALES.splice(saleIndex, 1);
  res.status(200).json({ success: true, message: 'Sale deleted and restocked successfully!' });
});

// Dynamic Dashboard & Reports Calculator
function computeDynamicDashboardStats() {
  const totalStockUnits = PRODUCTS.reduce((sum, p) => sum + (Number(p.currentQuantity) || 0), 0);
  const totalInventoryValue = PRODUCTS.reduce((sum, p) => sum + ((Number(p.currentQuantity) || 0) * (Number(p.unitPrice) || 0)), 0);
  const totalInventoryCost = PRODUCTS.reduce((sum, p) => sum + ((Number(p.currentQuantity) || 0) * (Number(p.costPrice) || 0)), 0);

  const lowStockItems = PRODUCTS.filter(p => (Number(p.currentQuantity) || 0) <= (Number(p.reorderThreshold) || 20)).map(p => ({
    id: p.id,
    _id: p._id,
    name: p.name,
    category: p.category,
    unit: p.unit,
    currentQuantity: Number(p.currentQuantity || 0),
    reorderThreshold: Number(p.reorderThreshold || 20),
    unitPrice: Number(p.unitPrice || 0)
  }));

  const todayStr = new Date().toISOString().split('T')[0];
  const todaySales = SALES.filter(s => (s.date && String(s.date).startsWith(todayStr)));
  const todayPurchases = PURCHASES.filter(p => (p.date && String(p.date).startsWith(todayStr)));

  const effectiveSales = todaySales;
  const effectivePurchases = todayPurchases;

  const todaySalesTotal = effectiveSales.reduce((sum, s) => sum + Number(s.totalAmount || 0), 0);
  const todaySalesQty = effectiveSales.reduce((sum, s) => sum + Number(s.quantity || 0), 0);
  const todayCOGS = effectiveSales.reduce((sum, s) => sum + ((Number(s.costPriceSnapshot) || Number(s.product?.costPrice) || 30) * Number(s.quantity || 0)), 0);
  const todayGrossProfit = todaySalesTotal - todayCOGS;

  const todayPurchasesTotal = effectivePurchases.reduce((sum, p) => sum + Number(p.totalAmount || 0), 0);
  const todayPurchasesQty = effectivePurchases.reduce((sum, p) => sum + Number(p.quantity || 0), 0);

  const batches = typeof EXPIRY_BATCHES !== 'undefined' ? EXPIRY_BATCHES : [];
  const nearBatches = batches.filter(b => b.status === 'near-expiry' || (b.daysLeft && b.daysLeft <= 3));
  const expiredBatches = batches.filter(b => b.status === 'expired' || (b.daysLeft && b.daysLeft <= 0));

  const totalRevenueAll = SALES.reduce((sum, s) => sum + Number(s.totalAmount || 0), 0);
  const totalPurchasesCostAll = PURCHASES.reduce((sum, p) => sum + Number(p.totalAmount || 0), 0);
  const grossProfitAll = totalRevenueAll - totalPurchasesCostAll * 0.85;

  return {
    totalRevenue: Math.round(totalRevenueAll),
    totalPurchasesCost: Math.round(totalPurchasesCostAll),
    grossProfit: Math.round(grossProfitAll),
    profitMargin: totalRevenueAll > 0 ? Number(((grossProfitAll / totalRevenueAll) * 100).toFixed(1)) : 0,
    totalProducts: PRODUCTS.length,
    totalProductsCount: PRODUCTS.length,
    totalStockUnits,
    totalInventoryValue: Math.round(totalInventoryValue),
    totalInventoryCost: Math.round(totalInventoryCost),
    lowStockCount: lowStockItems.length,
    lowStockItems: lowStockItems.slice(0, 8),
    nearExpiryCount: nearBatches.length,
    nearExpiryBatches: nearBatches.slice(0, 6).map(b => ({
      id: b.id,
      _id: b._id,
      batchNumber: b.batchNumber,
      productName: b.product?.name || b.productName || 'Batch Product',
      unit: b.product?.unit || 'unit',
      quantity: Number(b.quantity || 0),
      expiryDate: b.expiryDate
    })),
    expiredCount: expiredBatches.length,
    todaySales: todaySalesTotal,
    todayPurchases: todayPurchasesTotal,
    today: {
      salesAmount: todaySalesTotal,
      salesQuantity: todaySalesQty,
      grossProfit: todayGrossProfit,
      purchasesAmount: todayPurchasesTotal,
      purchasesQuantity: todayPurchasesQty
    },
    recentActivity: {
      sales: SALES.slice(0, 5),
      purchases: PURCHASES.slice(0, 5)
    }
  };
}

// Dashboard & Reports Routes
app.get('/api/reports/dashboard', (req, res) => {
  res.status(200).json({
    success: true,
    stats: computeDynamicDashboardStats()
  });
});

app.get('/api/reports/analytics', (req, res) => {
  const totalSalesAmount = SALES.reduce((sum, s) => sum + Number(s.totalAmount || 0), 0);
  const totalSalesQuantity = SALES.reduce((sum, s) => sum + Number(s.quantity || 0), 0);
  const totalPurchasesAmount = PURCHASES.reduce((sum, p) => sum + Number(p.totalAmount || 0), 0);
  const totalPurchasesQuantity = PURCHASES.reduce((sum, p) => sum + Number(p.quantity || 0), 0);
  const totalCOGS = SALES.reduce((sum, s) => sum + ((Number(s.costPriceSnapshot) || Number(s.product?.costPrice) || 30) * Number(s.quantity || 0)), 0);
  const grossProfit = totalSalesAmount - totalCOGS;
  const netProfit = grossProfit;
  const profitMarginPct = totalSalesAmount > 0 ? Number(((grossProfit / totalSalesAmount) * 100).toFixed(1)) : 0;

  const salesByProduct = {};
  SALES.forEach(s => {
    const pName = s.product?.name || s.productName || 'Product';
    const pId = s.productId?.id || s.productId || s.product?.id || 1;
    const cat = s.product?.category || s.category || 'dairy';
    if (!salesByProduct[pId]) {
      salesByProduct[pId] = { productId: pId, name: pName, category: cat, quantitySold: 0, totalRevenue: 0 };
    }
    salesByProduct[pId].quantitySold += Number(s.quantity || 0);
    salesByProduct[pId].totalRevenue += Number(s.totalAmount || 0);
  });
  const topSelling = Object.values(salesByProduct).sort((a, b) => b.quantitySold - a.quantitySold).slice(0, 5);

  res.status(200).json({
    success: true,
    summary: {
      totalSalesAmount: Math.round(totalSalesAmount),
      totalSalesQuantity,
      totalPurchasesAmount: Math.round(totalPurchasesAmount),
      totalPurchasesQuantity,
      totalCOGS: Math.round(totalCOGS),
      grossProfit: Math.round(grossProfit),
      batchWastageLoss: 0,
      totalWastageUnits: 0,
      netProfit: Math.round(netProfit),
      profitMarginPct
    },
    timeSeries: [],
    categoryBreakdown: [],
    topSelling
  });
});

app.get('/api/reports/export-csv', (req, res) => {
  const type = req.query.type || 'sales';
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename=mother_dairy_${type}_report.csv`);
  if (type === 'purchases') {
    let csv = 'Date,Invoice,Supplier,Product,Quantity,CostPrice,TotalAmount\n';
    PURCHASES.forEach(p => {
      csv += `${(p.date || '').slice(0, 10)},${p.invoiceNumber || ''},"${p.supplierName || ''}","${p.product?.name || ''}",${p.quantity || 0},${p.costPrice || 0},${p.totalAmount || 0}\n`;
    });
    return res.status(200).send(csv);
  } else {
    let csv = 'Date,Receipt,Customer,Product,Quantity,UnitPrice,TotalAmount\n';
    SALES.forEach(s => {
      csv += `${(s.date || '').slice(0, 10)},${s.receiptNumber || ''},"${s.customerName || 'Walk-in'}","${s.product?.name || ''}",${s.quantity || 0},${s.unitPrice || 0},${s.totalAmount || 0}\n`;
    });
    return res.status(200).send(csv);
  }
});

// Reviews & Feedback
app.get('/api/feedback', (req, res) => {
  const avg = FEEDBACKS.length > 0 
    ? Number((FEEDBACKS.reduce((sum, f) => sum + Number(f.rating || 5), 0) / FEEDBACKS.length).toFixed(1)) 
    : 5.0;
  res.status(200).json({ success: true, count: FEEDBACKS.length, averageRating: avg, feedbacks: FEEDBACKS });
});

app.post('/api/feedback', (req, res) => {
  const fb = { ...req.body, id: FEEDBACKS.length + 1, _id: FEEDBACKS.length + 1, date: new Date().toISOString().split('T')[0] };
  FEEDBACKS.unshift(fb);
  res.status(201).json({ success: true, message: 'Review submitted successfully!', feedback: fb });
});

let EXPIRY_BATCHES = [];

// Expiry Batches Routes
app.get('/api/expiry', (req, res) => {
  const { status, nearExpiryOnly } = req.query || {};
  let list = EXPIRY_BATCHES;
  if (status && status !== 'all') {
    list = list.filter(b => b.status === status);
  }
  if (nearExpiryOnly === 'true') {
    list = list.filter(b => b.status === 'near-expiry' || b.daysLeft <= 3);
  }

  const summary = {
    totalBatches: EXPIRY_BATCHES.length,
    freshCount: EXPIRY_BATCHES.filter(b => b.status === 'fresh').length,
    nearExpiryCount: EXPIRY_BATCHES.filter(b => b.status === 'near-expiry').length,
    nearExpiryRiskUnits: EXPIRY_BATCHES.filter(b => b.status === 'near-expiry').reduce((sum, b) => sum + b.quantity, 0),
    expiredCount: EXPIRY_BATCHES.filter(b => b.status === 'expired').length,
    expiredWastageUnits: EXPIRY_BATCHES.filter(b => b.status === 'expired').reduce((sum, b) => sum + b.quantity, 0),
    discardedCount: EXPIRY_BATCHES.filter(b => b.status === 'discarded').length
  };

  res.status(200).json({ success: true, count: list.length, summary, batches: list });
});

app.get('/api/expiry/batches', (req, res) => {
  res.status(200).json({ success: true, count: EXPIRY_BATCHES.length, batches: EXPIRY_BATCHES });
});

app.post('/api/expiry', (req, res) => {
  const matchedProd = PRODUCTS.find(p => p._id == req.body.productId || p.id == req.body.productId) || PRODUCTS[0];
  const newBatch = {
    ...req.body,
    id: EXPIRY_BATCHES.length + 1,
    _id: EXPIRY_BATCHES.length + 1,
    productId: matchedProd,
    product: matchedProd,
    status: 'fresh',
    daysLeft: 3
  };
  EXPIRY_BATCHES.unshift(newBatch);
  res.status(201).json({ success: true, message: 'Batch logged successfully!', batch: newBatch });
});

app.patch('/api/expiry/:id/discard', (req, res) => {
  const { id } = req.params;
  const batch = EXPIRY_BATCHES.find(b => b.id == id || b._id == id);
  if (batch) {
    batch.status = 'discarded';
    batch.discardReason = req.body?.discardReason || 'Spoiled/Damaged';
  }
  res.status(200).json({ success: true, message: 'Batch discarded and written off!', batch });
});

app.delete('/api/expiry/:id', (req, res) => {
  const { id } = req.params;
  EXPIRY_BATCHES = EXPIRY_BATCHES.filter(b => b.id != id && b._id != id);
  res.status(200).json({ success: true, message: 'Batch removed successfully!' });
});

// Dashboard Stats endpoint alias
app.get('/api/reports/dashboard-stats', (req, res) => {
  res.status(200).json({
    success: true,
    stats: computeDynamicDashboardStats()
  });
});

// Production & Batches
let PRODUCTIONS = [];

app.get('/api/production', (req, res) => {
  res.status(200).json({ success: true, count: PRODUCTIONS.length, batches: PRODUCTIONS });
});

app.post('/api/production', (req, res) => {
  const item = { ...req.body, id: PRODUCTIONS.length + 1, _id: PRODUCTIONS.length + 1, date: new Date().toISOString().split('T')[0], status: 'completed' };
  PRODUCTIONS.unshift(item);
  res.status(201).json({ success: true, message: 'Production batch recorded successfully!', batch: item });
});

app.get('/api/users', (req, res) => {
  res.status(200).json({
    success: true,
    users: [
      { id: 1, _id: 1, name: 'Mother Dairy Admin', email: 'admin@dairy.com', role: 'admin' },
      { id: 2, _id: 2, name: 'Store Staff Counter', email: 'staff@dairy.com', role: 'staff' }
    ]
  });
});

app.get('/api/audit-logs', (req, res) => {
  res.status(200).json({ success: true, count: 0, logs: [] });
});

export default function handler(req, res) {
  return app(req, res);
}
