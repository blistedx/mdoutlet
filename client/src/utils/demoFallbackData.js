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
    barcode: '8901648001018',
    description: 'Pasteurized homogenized full cream milk with 6.0% FAT & 9.0% SNF.',
    shelfLifeDays: 2,
    reorderThreshold: 25,
    quantity: 0,
    currentStock: 0
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
    barcode: '8901648001025',
    description: 'Fresh toned milk with 3.0% FAT & 8.5% SNF.',
    shelfLifeDays: 2,
    reorderThreshold: 30,
    quantity: 0,
    currentStock: 0
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
    barcode: '8901648001032',
    description: '100% natural, easily digestible cow milk rich in Calcium.',
    shelfLifeDays: 2,
    reorderThreshold: 20,
    quantity: 0,
    currentStock: 0
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
    barcode: '8901648001049',
    description: 'Direct farm milk collected from local dairy farmers for processing.',
    shelfLifeDays: 1,
    reorderThreshold: 50,
    quantity: 0,
    currentStock: 0
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
    barcode: '8901648002015',
    description: 'Thick, creamy, naturally fermented curd.',
    shelfLifeDays: 6,
    reorderThreshold: 20,
    quantity: 0,
    currentStock: 0
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
    barcode: '8901648003012',
    description: 'Ultra-soft malai paneer with rich texture and pure milk goodness.',
    shelfLifeDays: 15,
    reorderThreshold: 20,
    quantity: 0,
    currentStock: 0
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
    barcode: '8901648004019',
    description: 'Golden, granular and aromatic pure cow ghee made with traditional bilona process.',
    shelfLifeDays: 270,
    reorderThreshold: 10,
    quantity: 0,
    currentStock: 0
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
    barcode: '8901648005016',
    description: 'Rich pasteurized cream table butter.',
    shelfLifeDays: 180,
    reorderThreshold: 15,
    quantity: 0,
    currentStock: 0
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
    barcode: '8901648003029',
    description: 'Bulk restaurant & home size soft malai paneer.',
    shelfLifeDays: 12,
    reorderThreshold: 10,
    quantity: 0,
    currentStock: 0
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
    barcode: '8901648006013',
    description: 'Refreshing spiced buttermilk with roasted jeera & rock salt.',
    shelfLifeDays: 8,
    reorderThreshold: 40,
    quantity: 0,
    currentStock: 0
  },
  {
    _id: 11,
    id: 11,
    name: "Haldiram's Soan Papdi (250g)",
    category: 'sweets',
    unit: 'box',
    unitPrice: 90,
    costPrice: 72,
    qrCode: 'HR-SOAN-PAPDI-250G',
    barcode: '8904063251077',
    description: 'Flaky melt-in-the-mouth sweet pieces garnished with almonds & pistachios.',
    shelfLifeDays: 150,
    reorderThreshold: 15,
    quantity: 0,
    currentStock: 0
  }
];

export const FALLBACK_PURCHASES = [];

export const FALLBACK_SALES = [];

export const FALLBACK_STOCKS = FALLBACK_PRODUCTS.map((p, idx) => ({
  _id: p._id,
  id: p.id,
  productId: p,
  product: p,
  quantity: 0,
  reorderThreshold: p.reorderThreshold,
  status: 'optimal',
  batches: []
}));

export const FALLBACK_DASHBOARD_KPI = {
  kpis: {
    totalRevenue: 0,
    totalPurchasesCost: 0,
    grossProfit: 0,
    profitMargin: 0,
    totalStockUnits: 0,
    totalProductsCount: FALLBACK_PRODUCTS.length,
    lowStockCount: 0,
    expiringBatchesCount: 0,
    todaySales: 0,
    todayPurchases: 0
  },
  salesTrend: [],
  categoryBreakdown: [],
  recentPurchases: [],
  recentSales: []
};

export const FALLBACK_EXPIRY_BATCHES = [];

export const FALLBACK_EXPIRY_SUMMARY = {
  totalBatches: 0,
  freshCount: 0,
  nearExpiryCount: 0,
  nearExpiryRiskUnits: 0,
  expiredCount: 0,
  expiredWastageUnits: 0,
  discardedCount: 0
};

export const FALLBACK_ANALYTICS_REPORT = {
  success: true,
  summary: {
    totalSalesAmount: 0,
    totalSalesQuantity: 0,
    totalPurchasesAmount: 0,
    totalPurchasesQuantity: 0,
    totalCOGS: 0,
    grossProfit: 0,
    batchWastageLoss: 0,
    totalWastageUnits: 0,
    netProfit: 0,
    profitMarginPct: 0
  },
  timeSeries: [],
  categoryBreakdown: [],
  topSelling: []
};


