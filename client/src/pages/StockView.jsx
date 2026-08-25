import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { 
  getStockLevelsApi, 
  updateReorderThresholdApi 
} from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Badge from '../components/common/Badge';
import Modal from '../components/common/Modal';
import { 
  Boxes, 
  Search, 
  AlertTriangle, 
  Plus, 
  ShoppingCart, 
  Edit3, 
  RefreshCw, 
  Filter, 
  TrendingDown, 
  PackageCheck,
  QrCode
} from 'lucide-react';
import { DAIRY_CATEGORIES, getCategoryMeta } from '../utils/categories';

const StockView = () => {
  const [searchParams] = useSearchParams();
  const { isAdmin } = useAuth();
  const { addToast } = useToast();

  const [stocks, setStocks] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [lowStockFilter, setLowStockFilter] = useState(searchParams.get('lowStock') === 'true');

  // Edit threshold modal
  const [selectedStockForThreshold, setSelectedStockForThreshold] = useState(null);
  const [newThreshold, setNewThreshold] = useState(20);
  const [savingThreshold, setSavingThreshold] = useState(false);

  useEffect(() => {
    fetchStockLevels();
  }, [lowStockFilter]);

  const fetchStockLevels = async () => {
    try {
      setLoading(true);
      const res = await getStockLevelsApi({ lowStockOnly: lowStockFilter });
      if (res.data.success) {
        setStocks(res.data.stocks);
        setSummary(res.data.summary);
      }
    } catch (error) {
      addToast('Failed to load stock records', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenThresholdModal = (stock) => {
    setSelectedStockForThreshold(stock);
    setNewThreshold(stock.reorderThreshold || 20);
  };

  const handleSaveThreshold = async (e) => {
    e.preventDefault();
    if (!selectedStockForThreshold) return;

    try {
      setSavingThreshold(true);
      const prodId = selectedStockForThreshold.productId?._id || selectedStockForThreshold.productId?.id || selectedStockForThreshold.productId;
      const res = await updateReorderThresholdApi(
        prodId,
        { reorderThreshold: Number(newThreshold) }
      );
      if (res.data.success) {
        addToast(`Reorder threshold set to ${newThreshold} for ${selectedStockForThreshold.productId?.name || 'Product'}`, 'success');
        setSelectedStockForThreshold(null);
        fetchStockLevels();
      }
    } catch (error) {
      addToast(error.response?.data?.message || 'Failed to update threshold', 'error');
    } finally {
      setSavingThreshold(false);
    }
  };

  // Filtered in-memory for immediate UI search
  const filteredStocks = (stocks || []).filter((s) => {
    const product = s?.productId || s?.product;
    if (!product) return false;

    const matchesCategory = categoryFilter === 'All' || product.category === categoryFilter;
    const matchesSearch = 
      (product.name || '').toLowerCase().includes((searchQuery || '').toLowerCase()) ||
      (product.qrCode || '').toLowerCase().includes((searchQuery || '').toLowerCase()) ||
      (product.category || '').toLowerCase().includes((searchQuery || '').toLowerCase());

    return matchesCategory && matchesSearch;
  });


  return (
    <div className="space-y-6">
      {/* 1. Header with Stats & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Boxes className="w-6 h-6 text-[#0B4F9C]" />
            <span>Live Stock Inventory</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Current on-hand inventory balances auto-updated via Purchases, Sales, and Production.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/purchases"
            className="px-4 py-2 bg-[#0B4F9C] hover:bg-[#083D7A] text-white rounded-xl text-xs font-bold shadow-sm transition-all hover:scale-105 active:scale-95 flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Procure Stock</span>
          </Link>

          <button
            onClick={fetchStockLevels}
            className="p-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl transition-colors"
            title="Refresh stocks"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. Top Summary KPI Strip */}
      {summary && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Quantity</span>
            <div className="text-xl font-black text-[#0B4F9C] mt-0.5">{summary.totalQuantity} Units</div>
            <span className="text-[10px] text-slate-500">{summary.totalProducts} Catalog Products</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Stock Valuation</span>
            <div className="text-xl font-black text-emerald-700 mt-0.5">₹{summary.totalValue?.toLocaleString()}</div>
            <span className="text-[10px] text-slate-500">Cost: ₹{summary.totalCostValue?.toLocaleString()}</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Low Stock Alert</span>
            <div className="text-xl font-black text-amber-600 mt-0.5">{summary.lowStockCount} Items</div>
            <span className="text-[10px] text-amber-700 font-bold">Below Threshold</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Out of Stock</span>
            <div className="text-xl font-black text-rose-600 mt-0.5">{summary.outOfStockCount} Items</div>
            <span className="text-[10px] text-rose-700 font-bold">0 Units Available</span>
          </div>
        </div>
      )}

      {/* 3. Filter & Search Controls */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-sm space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1 min-w-[240px] max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search product name, category or QR code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-[#FAF8F5] border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0B4F9C]"
            />
          </div>

          {/* Low Stock Toggle Switch */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setLowStockFilter(!lowStockFilter)}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 ${
                lowStockFilter
                  ? 'bg-amber-500 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Low Stock Alerts Only</span>
            </button>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1 pb-1">
          {DAIRY_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategoryFilter(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-[11px] font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                categoryFilter === cat.id
                  ? 'bg-[#0B4F9C] text-white shadow-xs font-black'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.id === 'All' ? 'All' : cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 4. Live Stock Table */}
      {loading ? (
        <div className="bg-white rounded-3xl p-12 text-center text-slate-400 animate-pulse">
          Loading live stock records...
        </div>
      ) : filteredStocks.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm space-y-2">
          <Boxes className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="font-extrabold text-sm text-slate-700">No Matching Stock Items</h3>
          <p className="text-xs text-slate-400">Try adjusting your search filter or category selection.</p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-soft overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF8F5] text-slate-500 uppercase text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4 font-black">Product Details</th>
                  <th className="py-3.5 px-4 font-black">Category</th>
                  <th className="py-3.5 px-4 font-black">QR Code</th>
                  <th className="py-3.5 px-4 font-black">Price / Unit</th>
                  <th className="py-3.5 px-4 font-black">Current Stock</th>
                  <th className="py-3.5 px-4 font-black">Status</th>
                  <th className="py-3.5 px-4 font-black">Reorder Level</th>
                  <th className="py-3.5 px-4 font-black text-right">Quick Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredStocks.map((stock) => {
                  const product = stock.productId;
                  const catMeta = getCategoryMeta(product.category);
                  const isLow = stock.currentQuantity <= stock.reorderThreshold;
                  const isOut = stock.currentQuantity === 0;
                  const percent = Math.min(100, Math.round((stock.currentQuantity / (stock.reorderThreshold * 2 || 40)) * 100));

                  return (
                    <tr key={stock._id} className="hover:bg-blue-50/30 transition-colors">
                      {/* Product Name */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 text-xs sm:text-sm">{product.name}</div>
                        <div className="text-[10px] text-slate-400">Shelf life: {product.shelfLifeDays || 3} days</div>
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md text-[10px] inline-flex items-center gap-1">
                          <span>{catMeta.icon}</span>
                          <span>{catMeta.label || product.category}</span>
                        </span>
                      </td>


                      {/* QR Code */}
                      <td className="py-3.5 px-4 font-mono font-bold text-dairy-blue text-[11px]">
                        {product.qrCode}
                      </td>

                      {/* Pricing */}
                      <td className="py-3.5 px-4">
                        <span className="font-black text-slate-900">₹{product.unitPrice}</span>
                        <span className="text-[10px] text-slate-400 block">Cost: ₹{product.costPrice || 0}</span>
                      </td>

                      {/* Current Quantity with progress indicator */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <span className={`text-sm font-black ${isOut ? 'text-rose-600' : isLow ? 'text-amber-600' : 'text-emerald-700'}`}>
                            {stock.currentQuantity} {product.unit}
                          </span>
                        </div>
                        {/* Mini visual stock bar */}
                        <div className="w-24 h-1.5 bg-slate-100 rounded-full mt-1 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${isOut ? 'bg-rose-500' : isLow ? 'bg-amber-500' : 'bg-emerald-500'}`}
                            style={{ width: `${percent}%` }}
                          ></div>
                        </div>
                      </td>

                      {/* Stock Status Badge */}
                      <td className="py-3.5 px-4">
                        {isOut ? (
                          <Badge variant="danger">Out of Stock</Badge>
                        ) : isLow ? (
                          <Badge variant="warning">Low Stock</Badge>
                        ) : (
                          <Badge variant="success">Healthy</Badge>
                        )}
                      </td>

                      {/* Reorder Threshold */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-slate-700">{stock.reorderThreshold} {product.unit}</span>
                          {isAdmin && (
                            <button
                              onClick={() => handleOpenThresholdModal(stock)}
                              className="p-1 text-slate-400 hover:text-[#0B4F9C] transition-colors"
                              title="Edit reorder threshold"
                            >
                              <Edit3 className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            to={`/purchases?product=${product._id}`}
                            className="p-1.5 bg-blue-50 hover:bg-blue-100 text-[#0B4F9C] rounded-lg transition-colors font-bold text-[11px] flex items-center gap-1"
                            title="Procure item"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Procure</span>
                          </Link>

                          <Link
                            to={`/sales?product=${product._id}`}
                            className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg transition-colors font-bold text-[11px] flex items-center gap-1"
                            title="Sell item"
                          >
                            <ShoppingCart className="w-3.5 h-3.5" />
                            <span>Sell</span>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. Edit Reorder Threshold Modal (Admin Only) */}
      <Modal
        isOpen={!!selectedStockForThreshold}
        onClose={() => setSelectedStockForThreshold(null)}
        title="Set Stock Reorder Threshold"
        subtitle={`Configure the minimum safe buffer for ${selectedStockForThreshold?.productId?.name}`}
        icon={<AlertTriangle className="w-5 h-5 text-amber-500" />}
      >
        <form onSubmit={handleSaveThreshold} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Minimum Quantity Alert Trigger
            </label>
            <input
              type="number"
              min="1"
              required
              value={newThreshold}
              onChange={(e) => setNewThreshold(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0B4F9C]"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              When current quantity drops to or below this count, a warning flag appears across dashboards and reports.
            </p>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={() => setSelectedStockForThreshold(null)}
              className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={savingThreshold}
              className="flex-1 py-2.5 bg-[#0B4F9C] hover:bg-[#083D7A] text-white rounded-xl text-xs font-black shadow-md transition-colors"
            >
              {savingThreshold ? 'Updating...' : 'Save Threshold'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default StockView;
