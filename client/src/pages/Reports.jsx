import React, { useState, useEffect } from 'react';
import { 
  getAnalyticsReportApi, 
  getProductsApi, 
  getExportCsvUrl 
} from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Badge from '../components/common/Badge';
import { 
  FileText, 
  Download, 
  TrendingUp, 
  DollarSign, 
  Calendar, 
  Filter, 
  PieChart as PieChartIcon, 
  ShoppingBag, 
  ShoppingCart, 
  Flame, 
  RefreshCw 
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  Legend 
} from 'recharts';

const Reports = () => {
  const { isAdmin } = useAuth();
  const { addToast } = useToast();

  const [analytics, setAnalytics] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [range, setRange] = useState('month'); // today, week, month, year, custom
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedProduct, setSelectedProduct] = useState('all');

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    fetchAnalytics();
  }, [range, startDate, endDate, selectedProduct]);

  const fetchProducts = async () => {
    try {
      const res = await getProductsApi({ activeOnly: true });
      if (res.data.success) {
        setProducts(res.data.products);
      }
    } catch (e) {
      console.warn('Failed to load products for report:', e);
    }
  };

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const params = { range };
      if (range === 'custom') {
        if (startDate) params.startDate = startDate;
        if (endDate) params.endDate = endDate;
      }
      if (selectedProduct !== 'all') {
        params.productId = selectedProduct;
      }

      const res = await getAnalyticsReportApi(params);
      if (res.data.success) {
        setAnalytics(res.data);
      }
    } catch (error) {
      addToast('Failed to load financial reports', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadCsv = (type) => {
    const url = getExportCsvUrl(type);
    window.open(url, '_blank');
    addToast(`Exporting ${type} CSV report...`, 'info');
  };

  const summary = analytics?.summary || {
    totalSalesAmount: 0,
    totalSalesQuantity: 0,
    totalPurchasesAmount: 0,
    totalPurchasesQuantity: 0,
    totalCOGS: 0,
    grossProfit: 0,
    batchWastageLoss: 0,
    netProfit: 0,
    profitMarginPct: 0
  };

  return (
    <div className="space-y-7 pb-12 font-sans">
      {/* 1. Header & CSV Export Actions */}
      <div className="bg-white p-6 sm:p-7 rounded-3xl border border-[#a0c396]/30 shadow-soft flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#ebf5eb] text-[#1e3a1e] rounded-full text-[11px] font-bold tracking-wider uppercase border border-[#a0c396]/40 mb-2">
            <FileText className="w-3.5 h-3.5" />
            <span>Financial & P&L Intelligence</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#1e3a1e] tracking-tight">
            Financial Reports & Analytics
          </h1>
          <p className="text-xs text-[#3f5a3f] mt-1 max-w-xl">
            Revenue velocity, procurement expenditure, gross margin analysis, and downloadable audit ledgers.
          </p>
        </div>

        {/* CSV Export Dropdown / Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => handleDownloadCsv('sales')}
            className="px-3.5 py-2 bg-[#f4f8f2] hover:bg-[#ebf5eb] text-[#1e3a1e] border border-[#a0c396]/40 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <Download className="w-3.5 h-3.5 text-[#3d6b3d]" />
            <span>Sales Invoices (CSV)</span>
          </button>

          <button
            onClick={() => handleDownloadCsv('purchases')}
            className="px-3.5 py-2 bg-[#f4f8f2] hover:bg-[#ebf5eb] text-[#1e3a1e] border border-[#a0c396]/40 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <Download className="w-3.5 h-3.5 text-[#1e3a1e]" />
            <span>Purchases Log (CSV)</span>
          </button>

          <button
            onClick={() => handleDownloadCsv('stock')}
            className="px-3.5 py-2 bg-[#1e3a1e] hover:bg-[#2d4a2d] text-white rounded-xl text-xs font-bold shadow-md shadow-[#1e3a1e]/15 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-[#9bc09b]" />
            <span>Stock Valuation (CSV)</span>
          </button>
        </div>
      </div>

      {/* 2. Filter Controls */}
      <div className="bg-white p-5 rounded-3xl border border-[#a0c396]/30 shadow-soft space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Time Range Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {[
              { id: 'today', label: 'Today' },
              { id: 'week', label: 'Last 7 Days' },
              { id: 'month', label: 'Last 30 Days' },
              { id: 'year', label: 'This Year' },
              { id: 'custom', label: 'Custom Range' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setRange(tab.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  range === tab.id
                    ? 'bg-[#1e3a1e] text-[#f8f5f0] shadow-sm font-bold'
                    : 'bg-[#f4f8f2] text-[#3f5a3f] hover:bg-[#ebf5eb] hover:text-[#1e3a1e]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Product Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#3f5a3f]">Product Filter:</span>
            <select
              value={selectedProduct}
              onChange={(e) => setSelectedProduct(e.target.value)}
              className="px-3.5 py-2 bg-[#f4f8f2] border border-[#a0c396]/40 rounded-xl text-xs font-bold text-[#1e3a1e] focus:outline-none focus:ring-2 focus:ring-[#1e3a1e]"
            >
              <option value="all">All 28 Products</option>
              {products.map((p) => (
                <option key={p._id || p.id} value={p._id || p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Custom Date Inputs if Custom selected */}
        {range === 'custom' && (
          <div className="flex items-center gap-2 pt-2 border-t border-[#a0c396]/20 text-xs">
            <span className="font-bold text-[#1e3a1e]">Date Range:</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-[#f4f8f2] border border-[#a0c396]/40 rounded-xl px-2.5 py-1 text-xs text-[#1e3a1e]"
            />
            <span className="text-[#3f5a3f]">to</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-[#f4f8f2] border border-[#a0c396]/40 rounded-xl px-2.5 py-1 text-xs text-[#1e3a1e]"
            />
          </div>
        )}
      </div>

      {/* 3. High-Level Financial KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Sales */}
        <div className="bg-white p-5 rounded-3xl border border-[#a0c396]/30 shadow-soft">
          <div className="flex items-center justify-between text-xs text-[#3f5a3f] font-bold uppercase tracking-wider mb-1">
            <span>Gross Revenue</span>
            <ShoppingCart className="w-4 h-4 text-[#3d6b3d]" />
          </div>
          <div className="text-2xl font-bold text-[#1e3a1e] font-serif">
            ₹{Number(summary.totalSalesAmount || 0).toLocaleString()}
          </div>
          <span className="text-[11px] text-[#3f5a3f] font-medium">
            {summary.totalSalesQuantity || 0} units sold in period
          </span>
        </div>

        {/* Total Purchases */}
        <div className="bg-white p-5 rounded-3xl border border-[#a0c396]/30 shadow-soft">
          <div className="flex items-center justify-between text-xs text-[#3f5a3f] font-bold uppercase tracking-wider mb-1">
            <span>Procurement Expenses</span>
            <ShoppingBag className="w-4 h-4 text-[#2d4a2d]" />
          </div>
          <div className="text-2xl font-bold text-[#2d4a2d] font-serif">
            ₹{Number(summary.totalPurchasesAmount || 0).toLocaleString()}
          </div>
          <span className="text-[11px] text-[#3f5a3f] font-medium">
            {summary.totalPurchasesQuantity || 0} units procured
          </span>
        </div>

        {/* Wastage Loss */}
        <div className="bg-white p-5 rounded-3xl border border-[#a0c396]/30 shadow-soft">
          <div className="flex items-center justify-between text-xs text-[#3f5a3f] font-bold uppercase tracking-wider mb-1">
            <span>Batch Wastage & Spoilage</span>
            <Flame className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-bold text-rose-700 font-serif">
            ₹{Number(summary.batchWastageLoss || 0).toLocaleString()}
          </div>
          <span className="text-[11px] text-rose-600 font-bold">
            {summary.totalWastageUnits || 0} expired units written off
          </span>
        </div>

        {/* Net Profit & Margin */}
        <div className="bg-white p-5 rounded-3xl border border-[#a0c396]/30 shadow-soft">
          <div className="flex items-center justify-between text-xs text-[#3f5a3f] font-bold uppercase tracking-wider mb-1">
            <span>Estimated Gross Profit</span>
            <TrendingUp className="w-4 h-4 text-[#6a9c6a]" />
          </div>
          <div className={`text-2xl font-bold font-serif ${summary.netProfit >= 0 ? 'text-[#1e3a1e]' : 'text-rose-700'}`}>
            ₹{Number(summary.netProfit || 0).toLocaleString()}
          </div>
          <span className="text-[11px] text-[#3d6b3d] font-bold">
            {summary.profitMarginPct || 0}% Profit Margin
          </span>
        </div>
      </div>

      {/* 4. Interactive Trend & Distribution Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Profit & Inflow Time Series */}
        <div className="bg-white p-6 rounded-3xl border border-[#a0c396]/30 shadow-soft">
          <div className="mb-4">
            <h3 className="font-serif text-base font-bold text-[#1e3a1e]">
              Daily Revenue vs Procurement Inflow
            </h3>
            <p className="text-xs text-[#3f5a3f]">Comparing outgoing sales vs raw dairy procurement</p>
          </div>

          <div className="h-64 w-full">
            {analytics?.timeSeries && analytics.timeSeries.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={analytics.timeSeries} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="repSales" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#1e3a1e" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#1e3a1e" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="date" tickFormatter={(s) => String(s || '').slice(5)} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                  <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} />
                  <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderRadius: '16px', fontSize: '11px', borderColor: '#a0c396' }} />
                  <Legend />
                  <Area type="monotone" dataKey="sales" stroke="#1e3a1e" strokeWidth={2.5} fillOpacity={1} fill="url(#repSales)" name="Sales (₹)" />
                  <Area type="monotone" dataKey="purchases" stroke="#6a9c6a" strokeWidth={2} fillOpacity={0.15} fill="#6a9c6a" name="Purchases (₹)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No transaction records found for the selected period.
              </div>
            )}
          </div>
        </div>

        {/* Category Revenue Bar Chart */}
        <div className="bg-white p-6 rounded-3xl border border-[#a0c396]/30 shadow-soft">
          <div className="mb-4">
            <h3 className="font-serif text-base font-bold text-[#1e3a1e]">
              Turnover by Dairy Category
            </h3>
            <p className="text-xs text-[#3f5a3f]">Gross sales volume across product families</p>
          </div>

          <div className="h-64 w-full">
            {analytics?.categoryBreakdown && analytics.categoryBreakdown.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.categoryBreakdown} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="category" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                  <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} />
                  <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderRadius: '16px', fontSize: '11px', borderColor: '#a0c396' }} formatter={(v) => `₹${v.toLocaleString()}`} />
                  <Bar dataKey="amount" fill="#3d6b3d" radius={[8, 8, 0, 0]} name="Sales (₹)" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No category sales records found.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 5. Top Bestselling Dairy Products Table */}
      {analytics?.topSelling && analytics.topSelling.length > 0 && (
        <div className="bg-white p-6 rounded-3xl border border-[#a0c396]/30 shadow-soft space-y-4">
          <div className="flex items-center justify-between border-b border-[#a0c396]/20 pb-3">
            <div>
              <h3 className="font-serif text-base font-bold text-[#1e3a1e]">
                🏆 Top Bestselling Products Leaderboard
              </h3>
              <p className="text-xs text-[#3f5a3f]">Highest grossing items sorted by turnover</p>
            </div>
            <span className="text-xs font-bold text-[#1e3a1e] px-3 py-1 bg-[#ebf5eb] rounded-full border border-[#a0c396]/40">
              Top {analytics.topSelling.length} Products
            </span>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-100">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#f4f8f2] text-[#1e3a1e] font-bold border-b border-[#a0c396]/30">
                <tr>
                  <th className="p-3 w-12 text-center">Rank</th>
                  <th className="p-3">Product Name</th>
                  <th className="p-3">Category</th>
                  <th className="p-3 text-right">Units Sold</th>
                  <th className="p-3 text-right">Total Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {analytics.topSelling.map((prod, idx) => (
                  <tr key={idx} className="hover:bg-[#f4f8f2]/50 transition-colors">
                    <td className="p-3 text-center font-bold text-[#1e3a1e]">
                      #{idx + 1}
                    </td>
                    <td className="p-3 font-bold text-[#1e3a1e]">
                      {prod.name}
                    </td>
                    <td className="p-3">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#ebf5eb] text-[#2d4a2d] border border-[#a0c396]/30 uppercase">
                        {prod.category}
                      </span>
                    </td>
                    <td className="p-3 text-right font-medium text-slate-700">
                      {prod.totalQty} {prod.unit}
                    </td>
                    <td className="p-3 text-right font-bold text-[#1e3a1e]">
                      ₹{prod.totalAmount?.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;

