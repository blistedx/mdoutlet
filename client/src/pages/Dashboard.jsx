import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  getDashboardStatsApi, 
  getAnalyticsReportApi 
} from '../services/api';
import { useAuth } from '../context/AuthContext';
import StatCard from '../components/common/StatCard';
import Badge from '../components/common/Badge';
import { 
  Boxes, 
  ShoppingCart, 
  ShoppingBag, 
  AlertTriangle, 
  Clock, 
  TrendingUp, 
  ArrowRight, 
  Plus, 
  Camera, 
  Factory, 
  RefreshCw, 
  CheckCircle2, 
  Calendar,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  PieChart, 
  Pie, 
  Cell, 
  Legend 
} from 'recharts';

const COLORS = ['#1e3a1e', '#3d6b3d', '#6a9c6a', '#9bc09b', '#d97706', '#be123c', '#4c7a4c'];

const Dashboard = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, analyticsRes] = await Promise.all([
        getDashboardStatsApi(),
        getAnalyticsReportApi({ range: 'week' })
      ]);

      if (statsRes.data.success) {
        setStats(statsRes.data.stats);
      }
      if (analyticsRes.data.success) {
        setAnalytics(analyticsRes.data);
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !stats) {
    return (
      <div className="space-y-6 animate-pulse p-4">
        <div className="h-10 bg-[#ebf5eb] rounded-2xl w-1/3"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="h-32 bg-[#ebf5eb] rounded-3xl"></div>
          ))}
        </div>
      </div>
    );
  }

  const statData = stats || {
    totalStockUnits: 0,
    totalInventoryValue: 0,
    lowStockCount: 0,
    lowStockItems: [],
    nearExpiryCount: 0,
    nearExpiryBatches: [],
    today: { salesAmount: 0, salesQuantity: 0, purchasesAmount: 0, grossProfit: 0 }
  };

  const formattedStockUnits = Number(statData.totalStockUnits || 0).toLocaleString();
  const formattedInventoryVal = Number(statData.totalInventoryValue || 0).toLocaleString();
  const formattedTodaySales = Number(statData.today?.salesAmount || 0).toLocaleString();
  const formattedTodayProfit = Number(statData.today?.grossProfit || 0).toLocaleString();

  return (
    <div className="space-y-7 pb-10">
      {/* 1. Header with Welcome & Quick Action Shortcuts */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-[#a0c396]/30">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#1e3a1e] tracking-tight">
              Outlet Dashboard
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#ebf5eb] text-[#1e3a1e] border border-[#a0c396]/40 uppercase">
              {user?.role === 'admin' ? 'Outlet Admin' : 'Staff Mode'}
            </span>
          </div>
          <p className="text-xs text-[#3f5a3f] mt-1">
            Real-time Mother Dairy stock monitoring, auto-reconciliation, and 3-day expiry alerts.
          </p>
        </div>

        {/* Quick Action Button Group */}
        <div className="flex flex-wrap items-center gap-2">
          <Link
            to="/sales"
            className="px-3.5 py-2 bg-[#1e3a1e] hover:bg-[#2d4a2d] text-white rounded-xl text-xs font-bold shadow-sm transition-all hover:scale-105 active:scale-95 flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Record Sale</span>
          </Link>

          <Link
            to="/purchases"
            className="px-3.5 py-2 bg-[#2d4a2d] hover:bg-[#3d6b3d] text-white rounded-xl text-xs font-bold shadow-sm transition-all hover:scale-105 active:scale-95 flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Record Purchase</span>
          </Link>

          <Link
            to="/production"
            className="px-3.5 py-2 bg-[#6a9c6a] hover:bg-[#4c7a4c] text-white rounded-xl text-xs font-bold shadow-sm transition-all hover:scale-105 active:scale-95 flex items-center gap-1.5"
          >
            <Factory className="w-3.5 h-3.5" />
            <span>Log Milk Batch</span>
          </Link>

          <button
            onClick={fetchDashboardData}
            className="p-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl transition-colors cursor-pointer"
            title="Refresh dashboard"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. Top Metric Counter Cards (Framer Motion Animated) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Total Stock Units */}
        <StatCard
          title="Total Stock on Hand"
          value={`${formattedStockUnits} Units`}
          subtitle={`Valued at ₹${formattedInventoryVal}`}
          icon={<Boxes className="w-6 h-6" />}
          color="blue"
          onClick={() => navigate('/stock')}
        />

        {/* Today's Sales */}
        <StatCard
          title="Today's Sales Revenue"
          value={`₹${formattedTodaySales}`}
          subtitle={`${statData.today?.salesQuantity || 0} units sold today`}
          icon={<ShoppingCart className="w-6 h-6" />}
          color="emerald"
          trend={{ isPositive: true, text: `+₹${formattedTodayProfit} Est. Profit` }}
          onClick={() => navigate('/sales')}
        />

        {/* Low Stock Warning */}
        <StatCard
          title="Low Stock Items"
          value={`${statData.lowStockCount || 0} Products`}
          subtitle="Below reorder threshold trigger"
          icon={<AlertTriangle className="w-6 h-6" />}
          color={Number(statData.lowStockCount || 0) > 0 ? 'amber' : 'blue'}
          trend={Number(statData.lowStockCount || 0) > 0 ? { isPositive: false, text: 'Needs Restock' } : undefined}
          onClick={() => navigate('/stock?lowStock=true')}
        />

        {/* Near Expiry Risk */}
        <StatCard
          title="Near Expiry (< 3 Days)"
          value={`${statData.nearExpiryCount || 0} Batches`}
          subtitle={`${statData.expiredCount || 0} batches already expired`}
          icon={<Clock className="w-6 h-6" />}
          color={Number(statData.nearExpiryCount || 0) > 0 ? 'rose' : 'emerald'}
          trend={Number(statData.nearExpiryCount || 0) > 0 ? { isPositive: false, text: 'Action Required' } : undefined}
          onClick={() => navigate('/expiry?nearExpiryOnly=true')}
        />
      </div>


      {/* 3. Urgent Attention Section (Low Stock & Near Expiry Lists) */}
      {(statData.lowStockCount > 0 || statData.nearExpiryCount > 0) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Low Stock Warning Box */}
          {statData.lowStockCount > 0 && (
            <div className="bg-amber-50/70 rounded-3xl p-5 border border-amber-200 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-amber-900 font-extrabold text-xs uppercase tracking-wide">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span>Low Stock Reorder Alerts ({statData.lowStockCount})</span>
                </div>
                <Link to="/purchases" className="text-xs font-black text-amber-800 hover:underline flex items-center gap-1">
                  <span>Procure More</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {(statData.lowStockItems || []).map((item, idx) => (
                  <div key={item.id || item._id || idx} className="bg-white p-3 rounded-2xl border border-amber-100 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-slate-900 truncate max-w-[140px]">{item.name}</div>
                      <div className="text-[10px] text-slate-400">Reorder Threshold: {item.reorderThreshold}</div>
                    </div>
                    <Badge variant="warning">{item.currentQuantity} {item.unit}</Badge>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Near Expiry Risk Box */}
          {statData.nearExpiryCount > 0 && (
            <div className="bg-rose-50/70 rounded-3xl p-5 border border-rose-200 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-rose-900 font-extrabold text-xs uppercase tracking-wide">
                  <Clock className="w-4 h-4 text-rose-600" />
                  <span>Batches Expiring in &lt; 3 Days ({statData.nearExpiryCount})</span>
                </div>
                <Link to="/expiry" className="text-xs font-black text-rose-800 hover:underline flex items-center gap-1">
                  <span>Manage Batches</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {(statData.nearExpiryBatches || []).map((batch, idx) => (
                  <div key={batch.id || batch._id || idx} className="bg-white p-3 rounded-2xl border border-rose-100 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-slate-900 truncate max-w-[130px]">{batch.productName}</div>
                      <div className="text-[10px] text-rose-600 font-mono">
                        Exp: {new Date(batch.expiryDate).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                      </div>
                    </div>
                    <Badge variant="danger">{batch.quantity} {batch.unit}</Badge>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      )}

      {/* 4. Interactive Recharts: Weekly Trend & Category Sales */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Sales vs Purchases Area Chart */}
        <div className="lg:col-span-2 bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-soft">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-black text-sm text-slate-900">Weekly Revenue & Purchase Inflow</h3>
              <p className="text-[11px] text-slate-400">Comparing outgoing sales vs inward procurement</p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5 font-bold text-emerald-600">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Sales (₹)
              </span>
              <span className="flex items-center gap-1.5 font-bold text-[#0B4F9C]">
                <span className="w-2.5 h-2.5 rounded-full bg-[#0B4F9C]"></span> Purchases (₹)
              </span>
            </div>
          </div>

          <div className="h-64 w-full">
            {analytics?.timeSeries && analytics.timeSeries.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={analytics.timeSeries} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorPurchases" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0B4F9C" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#0B4F9C" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(str) => String(str || '').slice(5)} 
                    tick={{ fill: '#94a3b8', fontSize: 10 }} 
                  />
                  <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '16px', fontSize: '11px' }} 
                  />
                  <Area type="monotone" dataKey="sales" stroke="#10B981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorSales)" name="Sales (₹)" />
                  <Area type="monotone" dataKey="purchases" stroke="#0B4F9C" strokeWidth={2} fillOpacity={1} fill="url(#colorPurchases)" name="Purchases (₹)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No recent transaction history recorded yet.
              </div>
            )}
          </div>
        </div>

        {/* Category Share Distribution */}
        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-soft flex flex-col justify-between">
          <div>
            <h3 className="font-black text-sm text-slate-900 mb-1">Sales by Dairy Category</h3>
            <p className="text-[11px] text-slate-400 mb-4">Volume distribution across product families</p>
          </div>

          <div className="h-56 w-full flex items-center justify-center">
            {analytics?.categoryBreakdown && analytics.categoryBreakdown.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analytics.categoryBreakdown}
                    dataKey="amount"
                    nameKey="category"
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={75}
                    paddingAngle={3}
                  >
                    {analytics.categoryBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', fontSize: '11px' }}
                    formatter={(val) => `₹${val}`}
                  />
                  <Legend 
                    formatter={(val) => <span className="text-[10px] capitalize text-slate-600 font-bold">{val}</span>} 
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-xs text-slate-400">No category sales recorded yet.</div>
            )}
          </div>

          <div className="pt-2 text-center">
            <Link to="/reports" className="text-xs font-black text-[#0B4F9C] hover:underline flex items-center justify-center gap-1">
              <span>View Full Financial Breakdown</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
