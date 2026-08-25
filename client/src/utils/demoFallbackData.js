export const FALLBACK_PRODUCTS = [
  {
    _id: 1,
    id: 1,
    name: 'Mother Dairy Full Cream Milk (1L)',
    category: 'milk',
    unit: 'litre',
    unitPrice: 68,
    costPrice: 54,
    qrCode: 'MD-MILK-FC-1L',
    description: 'Pasteurized homogenized full cream milk with 6.0% FAT & 9.0% SNF.',
    shelfLifeDays: 2,
    reorderThreshold: 25,
    quantity: 80,
    currentStock: 80
  },
  {
    _id: 2,
    id: 2,
    name: 'Mother Dairy Toned Milk (500ml)',
    category: 'milk',
    unit: 'packet',
    unitPrice: 28,
    costPrice: 22,
    qrCode: 'MD-MILK-TONED-500M',
    description: 'Fresh toned milk with 3.0% FAT & 8.5% SNF.',
    shelfLifeDays: 2,
    reorderThreshold: 30,
    quantity: 120,
    currentStock: 120
  },
  {
    _id: 3,
    id: 3,
    name: 'Mother Dairy Live Cow Milk (1L)',
    category: 'milk',
    unit: 'litre',
    unitPrice: 58,
    costPrice: 46,
    qrCode: 'MD-MILK-COW-1L',
    description: '100% natural, easily digestible cow milk rich in Calcium.',
    shelfLifeDays: 2,
    reorderThreshold: 20,
    quantity: 60,
    currentStock: 60
  },
  {
    _id: 4,
    id: 4,
    name: 'Fresh Chilled Raw Cow Milk (Bulk)',
    category: 'raw-milk',
    unit: 'litre',
    unitPrice: 48,
    costPrice: 40,
    qrCode: 'MD-RAW-COW-BULK',
    description: 'Direct farm milk collected from local dairy farmers for processing.',
    shelfLifeDays: 1,
    reorderThreshold: 50,
    quantity: 200,
    currentStock: 200
  },
  {
    _id: 5,
    id: 5,
    name: 'Mother Dairy Classic Dahi / Curd (400g)',
    category: 'curd',
    unit: 'pack',
    unitPrice: 45,
    costPrice: 34,
    qrCode: 'MD-DAHI-CLASSIC-400G',
    description: 'Thick, creamy, naturally fermented curd.',
    shelfLifeDays: 6,
    reorderThreshold: 20,
    quantity: 45,
    currentStock: 45
  },
  {
    _id: 6,
    id: 6,
    name: 'Mother Dairy Malai Paneer (200g)',
    category: 'paneer',
    unit: 'packet',
    unitPrice: 95,
    costPrice: 75,
    qrCode: 'MD-PANEER-MALAI-200G',
    description: 'Ultra-soft malai paneer with rich texture and pure milk goodness.',
    shelfLifeDays: 15,
    reorderThreshold: 20,
    quantity: 65,
    currentStock: 65
  },
  {
    _id: 7,
    id: 7,
    name: 'Mother Dairy Pure Cow Ghee (1L Tin)',
    category: 'ghee',
    unit: 'tin',
    unitPrice: 650,
    costPrice: 510,
    qrCode: 'MD-GHEE-COW-1L',
    description: 'Golden, granular and aromatic pure cow ghee made with traditional bilona process.',
    shelfLifeDays: 270,
    reorderThreshold: 10,
    quantity: 35,
    currentStock: 35
  },
  {
    _id: 8,
    id: 8,
    name: 'Mother Dairy Salted Butter (500g)',
    category: 'butter',
    unit: 'pack',
    unitPrice: 275,
    costPrice: 220,
    qrCode: 'MD-BUTTER-SALT-500G',
    description: 'Rich pasteurized cream table butter.',
    shelfLifeDays: 180,
    reorderThreshold: 15,
    quantity: 40,
    currentStock: 40
  },
  {
    _id: 9,
    id: 9,
    name: 'Mother Dairy Fresh Paneer Block (1kg)',
    category: 'paneer',
    unit: 'block',
    unitPrice: 420,
    costPrice: 330,
    qrCode: 'MD-PANEER-1KG',
    description: 'Bulk restaurant & home size soft malai paneer.',
    shelfLifeDays: 12,
    reorderThreshold: 10,
    quantity: 25,
    currentStock: 25
  },
  {
    _id: 10,
    id: 10,
    name: 'Mother Dairy Masala Chaach (200ml)',
    category: 'buttermilk',
    unit: 'pouch',
    unitPrice: 15,
    costPrice: 10,
    qrCode: 'MD-CHAACH-MASALA-200M',
    description: 'Refreshing spiced buttermilk with roasted jeera & rock salt.',
    shelfLifeDays: 8,
    reorderThreshold: 40,
    quantity: 90,
    currentStock: 90
  }
];

export const FALLBACK_PURCHASES = [
  {
    _id: 1,
    id: 1,
    productId: FALLBACK_PRODUCTS[0],
    product: FALLBACK_PRODUCTS[0],
    quantity: 100,
    costPrice: 54,
    totalAmount: 5400,
    supplierName: 'Karnal Dairy Cooperative Federation',
    invoiceNumber: 'INV-2026-0891',
    batchNumber: 'BCH-MIL-0001',
    date: new Date().toISOString().split('T')[0],
    notes: 'Morning fresh milk tank inflow'
  },
  {
    _id: 2,
    id: 2,
    productId: FALLBACK_PRODUCTS[1],
    product: FALLBACK_PRODUCTS[1],
    quantity: 150,
    costPrice: 22,
    totalAmount: 3300,
    supplierName: 'Anand Dairy Procurement Hub',
    invoiceNumber: 'INV-2026-0892',
    batchNumber: 'BCH-MIL-0002',
    date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
    notes: 'Evening procurement delivery'
  },
  {
    _id: 3,
    id: 3,
    productId: FALLBACK_PRODUCTS[5],
    product: FALLBACK_PRODUCTS[5],
    quantity: 60,
    costPrice: 75,
    totalAmount: 4500,
    supplierName: 'Mother Dairy Central Processing Unit',
    invoiceNumber: 'INV-2026-0895',
    batchNumber: 'BCH-PAN-0003',
    date: new Date(Date.now() - 172800000).toISOString().split('T')[0],
    notes: 'Vacuum packed fresh malai paneer'
  },
  {
    _id: 4,
    id: 4,
    productId: FALLBACK_PRODUCTS[6],
    product: FALLBACK_PRODUCTS[6],
    quantity: 25,
    costPrice: 510,
    totalAmount: 12750,
    supplierName: 'Mother Dairy Ghee Works Pilkhuwa',
    invoiceNumber: 'INV-2026-0898',
    batchNumber: 'BCH-GHE-0004',
    date: new Date(Date.now() - 259200000).toISOString().split('T')[0],
    notes: 'Pure cow ghee dispatch'
  }
];

export const FALLBACK_SALES = [
  {
    _id: 1,
    id: 1,
    productId: FALLBACK_PRODUCTS[0],
    product: FALLBACK_PRODUCTS[0],
    quantity: 12,
    sellingPrice: 68,
    totalAmount: 816,
    customerName: 'Aarav Sharma (Daily Milk Subscriber)',
    customerPhone: '+91 98112 34567',
    paymentMode: 'upi',
    date: new Date().toISOString().split('T')[0]
  },
  {
    _id: 2,
    id: 2,
    productId: FALLBACK_PRODUCTS[5],
    product: FALLBACK_PRODUCTS[5],
    quantity: 4,
    sellingPrice: 95,
    totalAmount: 380,
    customerName: 'Priya Sweets & Catering',
    customerPhone: '+91 98765 43210',
    paymentMode: 'cash',
    date: new Date().toISOString().split('T')[0]
  },
  {
    _id: 3,
    id: 3,
    productId: FALLBACK_PRODUCTS[6],
    product: FALLBACK_PRODUCTS[6],
    quantity: 2,
    sellingPrice: 650,
    totalAmount: 1300,
    customerName: 'Hotel Royal Residency',
    customerPhone: '+91 99887 76655',
    paymentMode: 'card',
    date: new Date(Date.now() - 86400000).toISOString().split('T')[0]
  }
];

export const FALLBACK_STOCKS = FALLBACK_PRODUCTS.map((p, idx) => ({
  _id: p._id,
  id: p.id,
  productId: p,
  product: p,
  quantity: p.quantity,
  reorderThreshold: p.reorderThreshold,
  status: p.quantity <= p.reorderThreshold ? 'low' : 'optimal',
  batches: [
    {
      _id: idx + 1,
      batchNumber: `BCH-${p.category.slice(0, 3).toUpperCase()}-00${idx + 1}`,
      quantity: p.quantity,
      expiryDate: new Date(Date.now() + p.shelfLifeDays * 86400000).toISOString().split('T')[0],
      daysLeft: p.shelfLifeDays,
      status: 'fresh'
    }
  ]
}));

export const FALLBACK_DASHBOARD_KPI = {
  kpis: {
    totalRevenue: 528698,
    totalPurchasesCost: 433752,
    grossProfit: 94946,
    profitMargin: 18.0,
    totalStockUnits: 1256,
    totalProductsCount: 28,
    lowStockCount: 3,
    expiringBatchesCount: 2,
    todaySales: 24850,
    todayPurchases: 18600
  },
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
  ],
  recentPurchases: FALLBACK_PURCHASES,
  recentSales: FALLBACK_SALES
};
