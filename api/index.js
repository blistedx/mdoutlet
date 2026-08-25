import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';

const app = express();

app.use(cors());
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// In-Memory Global Datasets for Serverless Runtime
const PRODUCTS = [
  { _id: 1, id: 1, name: 'Mother Dairy Full Cream Milk (1L)', category: 'milk', unit: 'litre', unitPrice: 68, costPrice: 54, qrCode: 'MD-MILK-FC-1L', description: 'Pasteurized homogenized full cream milk with 6.0% FAT & 9.0% SNF.', shelfLifeDays: 2, reorderThreshold: 25, currentQuantity: 80, isLowStock: false, isActive: true },
  { _id: 2, id: 2, name: 'Mother Dairy Toned Milk (500ml)', category: 'milk', unit: 'packet', unitPrice: 28, costPrice: 22, qrCode: 'MD-MILK-TONED-500M', description: 'Fresh toned milk with 3.0% FAT & 8.5% SNF.', shelfLifeDays: 2, reorderThreshold: 30, currentQuantity: 120, isLowStock: false, isActive: true },
  { _id: 3, id: 3, name: 'Mother Dairy Live Cow Milk (1L)', category: 'milk', unit: 'litre', unitPrice: 58, costPrice: 46, qrCode: 'MD-MILK-COW-1L', description: '100% natural, easily digestible cow milk rich in Calcium.', shelfLifeDays: 2, reorderThreshold: 20, currentQuantity: 60, isLowStock: false, isActive: true },
  { _id: 4, id: 4, name: 'Fresh Chilled Raw Cow Milk (Bulk)', category: 'raw-milk', unit: 'litre', unitPrice: 48, costPrice: 40, qrCode: 'MD-RAW-COW-BULK', description: 'Direct farm milk collected from local dairy farmers for processing.', shelfLifeDays: 1, reorderThreshold: 50, currentQuantity: 200, isLowStock: false, isActive: true },
  { _id: 5, id: 5, name: 'Mother Dairy Classic Dahi / Curd (400g)', category: 'curd', unit: 'pack', unitPrice: 45, costPrice: 34, qrCode: 'MD-DAHI-CLASSIC-400G', description: 'Thick, creamy, naturally fermented curd.', shelfLifeDays: 6, reorderThreshold: 20, currentQuantity: 45, isLowStock: false, isActive: true },
  { _id: 6, id: 6, name: 'Mother Dairy Probiotic Dahi (200g)', category: 'curd', unit: 'tub', unitPrice: 30, costPrice: 22, qrCode: 'MD-DAHI-PROBIOTIC-200G', description: 'Probiotic dahi enriched with BB-12 gut-friendly bacteria.', shelfLifeDays: 7, reorderThreshold: 15, currentQuantity: 30, isLowStock: false, isActive: true },
  { _id: 7, id: 7, name: 'Mother Dairy Authentic Mishti Doi (100g)', category: 'curd', unit: 'cup', unitPrice: 25, costPrice: 18, qrCode: 'MD-DOI-MISHTI-100G', description: 'Traditional caramelized sweet curd in terracotta style cup.', shelfLifeDays: 7, reorderThreshold: 15, currentQuantity: 35, isLowStock: false, isActive: true },
  { _id: 8, id: 8, name: 'Mother Dairy Malai Paneer (200g)', category: 'paneer', unit: 'packet', unitPrice: 95, costPrice: 75, qrCode: 'MD-PANEER-MALAI-200G', description: 'Ultra-soft malai paneer with rich texture and pure milk goodness.', shelfLifeDays: 15, reorderThreshold: 20, currentQuantity: 65, isLowStock: false, isActive: true },
  { _id: 9, id: 9, name: 'Mother Dairy Fresh Paneer Block (1kg)', category: 'paneer', unit: 'block', unitPrice: 420, costPrice: 330, qrCode: 'MD-PANEER-1KG', description: 'Bulk restaurant & home size soft malai paneer.', shelfLifeDays: 12, reorderThreshold: 10, currentQuantity: 25, isLowStock: false, isActive: true },
  { _id: 10, id: 10, name: 'Mother Dairy Pure Cow Ghee (1L Tin)', category: 'ghee', unit: 'tin', unitPrice: 650, costPrice: 510, qrCode: 'MD-GHEE-COW-1L', description: 'Golden, granular and aromatic pure cow ghee made with traditional bilona process.', shelfLifeDays: 270, reorderThreshold: 10, currentQuantity: 35, isLowStock: false, isActive: true },
  { _id: 11, id: 11, name: 'Mother Dairy Salted Butter (500g)', category: 'butter', unit: 'pack', unitPrice: 275, costPrice: 220, qrCode: 'MD-BUTTER-SALT-500G', description: 'Rich pasteurized cream table butter.', shelfLifeDays: 180, reorderThreshold: 15, currentQuantity: 40, isLowStock: false, isActive: true },
  { _id: 12, id: 12, name: 'Mother Dairy Masala Chaach (200ml)', category: 'buttermilk', unit: 'pouch', unitPrice: 15, costPrice: 10, qrCode: 'MD-CHAACH-MASALA-200M', description: 'Refreshing spiced buttermilk with roasted jeera & rock salt.', shelfLifeDays: 8, reorderThreshold: 40, currentQuantity: 90, isLowStock: false, isActive: true }
];

let PURCHASES = [
  { _id: 1, id: 1, productId: PRODUCTS[0], product: PRODUCTS[0], quantity: 100, costPrice: 54, totalAmount: 5400, supplierName: 'Karnal Dairy Cooperative Federation', invoiceNumber: 'INV-2026-0891', batchNumber: 'BCH-MIL-0001', date: '2026-08-25', notes: 'Morning fresh milk tank inflow' },
  { _id: 2, id: 2, productId: PRODUCTS[1], product: PRODUCTS[1], quantity: 150, costPrice: 22, totalAmount: 3300, supplierName: 'Anand Dairy Procurement Hub', invoiceNumber: 'INV-2026-0892', batchNumber: 'BCH-MIL-0002', date: '2026-08-24', notes: 'Evening procurement delivery' },
  { _id: 3, id: 3, productId: PRODUCTS[7], product: PRODUCTS[7], quantity: 60, costPrice: 75, totalAmount: 4500, supplierName: 'Mother Dairy Central Processing Unit', invoiceNumber: 'INV-2026-0895', batchNumber: 'BCH-PAN-0003', date: '2026-08-23', notes: 'Vacuum packed fresh malai paneer' },
  { _id: 4, id: 4, productId: PRODUCTS[9], product: PRODUCTS[9], quantity: 25, costPrice: 510, totalAmount: 12750, supplierName: 'Mother Dairy Ghee Works Pilkhuwa', invoiceNumber: 'INV-2026-0898', batchNumber: 'BCH-GHE-0004', date: '2026-08-22', notes: 'Pure cow ghee dispatch' }
];

let SALES = [
  { _id: 1, id: 1, productId: PRODUCTS[0], product: PRODUCTS[0], quantity: 12, sellingPrice: 68, totalAmount: 816, customerName: 'Aarav Sharma (Daily Subscriber)', customerPhone: '+91 98112 34567', paymentMode: 'upi', date: '2026-08-25' },
  { _id: 2, id: 2, productId: PRODUCTS[7], product: PRODUCTS[7], quantity: 4, sellingPrice: 95, totalAmount: 380, customerName: 'Priya Sweets & Catering', customerPhone: '+91 98765 43210', paymentMode: 'cash', date: '2026-08-25' },
  { _id: 3, id: 3, productId: PRODUCTS[9], product: PRODUCTS[9], quantity: 2, sellingPrice: 650, totalAmount: 1300, customerName: 'Hotel Royal Residency', customerPhone: '+91 99887 76655', paymentMode: 'card', date: '2026-08-24' }
];

let FEEDBACKS = [
  { _id: 1, id: 1, customerName: 'Vikas Gupta', rating: 5, comment: 'Always fresh milk and authentic malai paneer. Fast billing!', date: '2026-08-25' },
  { _id: 2, id: 2, customerName: 'Sneha Verma', rating: 5, comment: 'Best Mishti Doi and Curd in town. Clean outlet!', date: '2026-08-24' }
];

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
    list = list.filter(p => p.name.toLowerCase().includes(s) || p.qrCode.toLowerCase().includes(s));
  }
  res.status(200).json({ success: true, count: list.length, products: list });
});

app.post('/api/products', (req, res) => {
  const newP = { ...req.body, id: PRODUCTS.length + 1, _id: PRODUCTS.length + 1, currentQuantity: 50, isLowStock: false, isActive: true };
  PRODUCTS.unshift(newP);
  res.status(201).json({ success: true, message: 'Product added successfully!', product: newP });
});

// Stock Routes
app.get('/api/stock', (req, res) => {
  const stocks = PRODUCTS.map(p => ({
    _id: p._id,
    id: p.id,
    productId: p,
    product: p,
    quantity: p.currentQuantity || 50,
    reorderThreshold: p.reorderThreshold || 20,
    status: (p.currentQuantity || 50) <= (p.reorderThreshold || 20) ? 'low' : 'optimal',
    batches: [
      {
        _id: p._id,
        batchNumber: `BCH-${p.category.slice(0, 3).toUpperCase()}-00${p._id}`,
        quantity: p.currentQuantity || 50,
        expiryDate: '2026-08-30',
        daysLeft: p.shelfLifeDays || 5,
        status: 'fresh'
      }
    ]
  }));

  const summary = {
    totalProducts: stocks.length,
    totalQuantity: stocks.reduce((sum, s) => sum + s.quantity, 0),
    lowStockCount: 2,
    expiringBatchesCount: 1
  };

  res.status(200).json({ success: true, summary, stocks });
});

// Purchases Routes
app.get('/api/purchases', (req, res) => {
  const totalSpent = PURCHASES.reduce((sum, p) => sum + (p.totalAmount || 0), 0);
  const totalQuantity = PURCHASES.reduce((sum, p) => sum + (p.quantity || 0), 0);
  res.status(200).json({ success: true, count: PURCHASES.length, totalSpent, totalQuantity, purchases: PURCHASES });
});

app.post('/api/purchases', (req, res) => {
  const item = {
    ...req.body,
    id: PURCHASES.length + 1,
    _id: PURCHASES.length + 1,
    totalAmount: (Number(req.body.quantity) || 0) * (Number(req.body.costPrice) || 0)
  };
  PURCHASES.unshift(item);
  res.status(201).json({ success: true, message: 'Purchase registered successfully!', purchase: item });
});

// Sales Routes
app.get('/api/sales', (req, res) => {
  const totalRevenue = SALES.reduce((sum, s) => sum + (s.totalAmount || 0), 0);
  res.status(200).json({ success: true, count: SALES.length, totalRevenue, sales: SALES });
});

app.post('/api/sales', (req, res) => {
  const item = {
    ...req.body,
    id: SALES.length + 1,
    _id: SALES.length + 1,
    totalAmount: (Number(req.body.quantity) || 0) * (Number(req.body.sellingPrice) || 0)
  };
  SALES.unshift(item);
  res.status(201).json({ success: true, message: 'Sale invoice recorded successfully!', sale: item });
});

// Dashboard & Reports Routes
app.get('/api/reports/dashboard', (req, res) => {
  res.status(200).json({
    success: true,
    stats: {
      totalRevenue: 528698,
      totalPurchasesCost: 433752,
      grossProfit: 94946,
      profitMargin: 18.0,
      totalStockUnits: 1256,
      totalProductsCount: PRODUCTS.length,
      lowStockCount: 3,
      expiringBatchesCount: 2,
      todaySales: 24850,
      todayPurchases: 18600
    }
  });
});

app.get('/api/reports/analytics', (req, res) => {
  res.status(200).json({
    success: true,
    salesTrend: [
      { date: '2026-08-19', sales: 68400, purchases: 52000 },
      { date: '2026-08-20', sales: 74200, purchases: 58000 },
      { date: '2026-08-21', sales: 81000, purchases: 61000 },
      { date: '2026-08-22', sales: 69500, purchases: 54000 },
      { date: '2026-08-23', sales: 92400, purchases: 72000 },
      { date: '2026-08-24', sales: 88500, purchases: 67000 },
      { date: '2026-08-25', sales: 54698, purchases: 43752 }
    ],
    categoryBreakdown: [
      { name: 'Milk', value: 45 },
      { name: 'Paneer', value: 20 },
      { name: 'Ghee & Butter', value: 18 },
      { name: 'Curd & Chaach', value: 12 },
      { name: 'Sweets & Ice Cream', value: 5 }
    ]
  });
});

// Reviews & Feedback
app.get('/api/feedback', (req, res) => {
  res.status(200).json({ success: true, count: FEEDBACKS.length, averageRating: 4.9, feedbacks: FEEDBACKS });
});

app.post('/api/feedback', (req, res) => {
  const fb = { ...req.body, id: FEEDBACKS.length + 1, _id: FEEDBACKS.length + 1, date: new Date().toISOString().split('T')[0] };
  FEEDBACKS.unshift(fb);
  res.status(201).json({ success: true, message: 'Review submitted successfully!', feedback: fb });
});

let EXPIRY_BATCHES = [
  {
    _id: 1,
    id: 1,
    productId: PRODUCTS[0],
    product: PRODUCTS[0],
    batchNumber: 'BCH-MIL-00891',
    manufactureDate: '2026-08-24',
    expiryDate: '2026-08-26',
    quantity: 45,
    status: 'near-expiry',
    daysLeft: 1,
    notes: 'Morning pasteurized dispatch'
  },
  {
    _id: 2,
    id: 2,
    productId: PRODUCTS[1],
    product: PRODUCTS[1],
    batchNumber: 'BCH-MIL-00892',
    manufactureDate: '2026-08-25',
    expiryDate: '2026-08-27',
    quantity: 60,
    status: 'fresh',
    daysLeft: 2,
    notes: 'Fresh toned milk batch'
  },
  {
    _id: 3,
    id: 3,
    productId: PRODUCTS[4],
    product: PRODUCTS[4],
    batchNumber: 'BCH-CUR-00893',
    manufactureDate: '2026-08-22',
    expiryDate: '2026-08-28',
    quantity: 35,
    status: 'fresh',
    daysLeft: 3,
    notes: 'Natural Dahi batch'
  },
  {
    _id: 4,
    id: 4,
    productId: PRODUCTS[7],
    product: PRODUCTS[7],
    batchNumber: 'BCH-PAN-00894',
    manufactureDate: '2026-08-15',
    expiryDate: '2026-08-30',
    quantity: 25,
    status: 'fresh',
    daysLeft: 5,
    notes: 'Vacuum packed malai paneer'
  },
  {
    _id: 5,
    id: 5,
    productId: PRODUCTS[10],
    product: PRODUCTS[10],
    batchNumber: 'BCH-BUT-00870',
    manufactureDate: '2026-08-10',
    expiryDate: '2026-08-18',
    quantity: 10,
    status: 'expired',
    daysLeft: -7,
    notes: 'Marked for return/discard'
  }
];

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
    stats: {
      totalRevenue: 528698,
      totalPurchasesCost: 433752,
      grossProfit: 94946,
      profitMargin: 18.0,
      totalStockUnits: 1256,
      totalProductsCount: PRODUCTS.length,
      lowStockCount: 3,
      expiringBatchesCount: 2,
      todaySales: 24850,
      todayPurchases: 18600
    }
  });
});

// Production & Batches
let PRODUCTIONS = [
  { _id: 1, id: 1, batchNumber: 'PRD-DAHI-001', rawMaterialName: 'Raw Cow Milk', rawMaterialUsed: 50, outputProductName: 'Mother Dairy Classic Dahi (400g)', outputQuantity: 45, date: '2026-08-25', status: 'completed' }
];

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
