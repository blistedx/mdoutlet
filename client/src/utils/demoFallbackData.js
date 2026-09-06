export const FALLBACK_PRODUCTS = [];

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


