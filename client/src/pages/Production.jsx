import React, { useState, useEffect } from 'react';
import { 
  getProductionsApi, 
  createProductionApi, 
  deleteProductionApi, 
  getProductsApi 
} from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Modal from '../components/common/Modal';
import Badge from '../components/common/Badge';
import { 
  Factory, 
  Plus, 
  Trash2, 
  Calendar, 
  Layers, 
  ArrowRight, 
  RefreshCw, 
  AlertTriangle,
  Beaker,
  CheckCircle2
} from 'lucide-react';

const Production = () => {
  const { isAdmin } = useAuth();
  const { addToast } = useToast();

  const [productions, setProductions] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    batchDate: new Date().toISOString().split('T')[0],
    rawMilkProductId: '',
    inputQuantity: 100,
    outputProducts: [
      { productId: '', quantity: 20 }
    ],
    wastage: 2,
    notes: 'Morning processing shift'
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [prodRes, productsRes] = await Promise.all([
        getProductionsApi(),
        getProductsApi({ activeOnly: true })
      ]);

      if (prodRes.data.success) {
        setProductions(prodRes.data.productions);
      }
      if (productsRes.data.success) {
        setProducts(productsRes.data.products);
        // Default raw milk product
        const raw = productsRes.data.products.find(
          (p) => p.category === 'raw-milk' || p.name.toLowerCase().includes('raw')
        );
        if (raw) {
          setFormData((prev) => ({ ...prev, rawMilkProductId: raw._id }));
        }
      }
    } catch (error) {
      addToast('Failed to load production batches', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAddOutputRow = () => {
    setFormData({
      ...formData,
      outputProducts: [...formData.outputProducts, { productId: '', quantity: 10 }]
    });
  };

  const handleRemoveOutputRow = (index) => {
    if (formData.outputProducts.length === 1) return;
    const updated = [...formData.outputProducts];
    updated.splice(index, 1);
    setFormData({ ...formData, outputProducts: updated });
  };

  const handleOutputChange = (index, field, value) => {
    const updated = [...formData.outputProducts];
    updated[index][field] = value;
    setFormData({ ...formData, outputProducts: updated });
  };

  const handleSubmitProduction = async (e) => {
    e.preventDefault();

    // Validate that each output row has a selected product
    const invalidRow = formData.outputProducts.find((row) => !row.productId || Number(row.quantity) <= 0);
    if (invalidRow) {
      addToast('Please select a product and enter a valid quantity for all output rows', 'warning');
      return;
    }

    try {
      setSubmitting(true);
      const res = await createProductionApi(formData);
      if (res.data.success) {
        addToast(res.data.message, 'success');
        setIsModalOpen(false);
        setFormData({
          batchDate: new Date().toISOString().split('T')[0],
          rawMilkProductId: formData.rawMilkProductId,
          inputQuantity: 100,
          outputProducts: [{ productId: '', quantity: 20 }],
          wastage: 2,
          notes: ''
        });
        fetchData();
      }
    } catch (error) {
      addToast(error.response?.data?.message || 'Failed to log production batch', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteProduction = async (prodId) => {
    if (!window.confirm('Delete this production batch? Raw milk will be restored and output products subtracted from stock.')) {
      return;
    }

    try {
      const res = await deleteProductionApi(prodId);
      if (res.data.success) {
        addToast(res.data.message, 'info');
        fetchData();
      }
    } catch (error) {
      addToast(error.response?.data?.message || 'Failed to delete production batch', 'error');
    }
  };

  const rawMilkOptions = products.filter((p) => p.category === 'raw-milk' || p.category === 'milk');
  const finishedProductOptions = products.filter((p) => p.category !== 'raw-milk');

  return (
    <div className="space-y-6">
      {/* 1. Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Factory className="w-6 h-6 text-amber-600" />
            <span>Milk Production & Processing</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Convert raw milk into finished dairy derivatives (Paneer, Curd, Ghee, Butter) with automated inventory balance sync.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-black shadow-md shadow-amber-500/20 transition-all hover:scale-105 active:scale-95 flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>+ Log Production Batch</span>
          </button>

          <button
            onClick={fetchData}
            className="p-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl transition-colors"
            title="Refresh data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. Production History List */}
      {loading ? (
        <div className="bg-white rounded-3xl p-12 text-center text-slate-400 animate-pulse">
          Loading production batches...
        </div>
      ) : productions.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm space-y-2">
          <Factory className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="font-extrabold text-sm text-slate-700">No Production Batches Logged</h3>
          <p className="text-xs text-slate-400">Click "+ Log Production Batch" to record raw milk conversion runs.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {productions.map((batch) => (
            <div
              key={batch._id}
              className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-soft space-y-4 hover:border-amber-200 transition-colors"
            >
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center font-black">
                    <Beaker className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-extrabold text-sm text-slate-900">
                      Processing Batch #{batch._id.slice(-6).toUpperCase()}
                    </div>
                    <div className="text-[11px] text-slate-400 flex items-center gap-2">
                      <span>Date: {new Date(batch.batchDate).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      <span>•</span>
                      <span>Operator: {batch.addedBy?.name || 'Staff'}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Badge variant="warning">
                    Input: -{batch.inputQuantity} Litres Raw Milk
                  </Badge>
                  {batch.wastage > 0 && (
                    <Badge variant="danger">
                      Wastage: {batch.wastage}L
                    </Badge>
                  )}
                  {isAdmin && (
                    <button
                      onClick={() => handleDeleteProduction(batch._id)}
                      className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 transition-colors ml-2"
                      title="Delete batch and reverse stocks"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Output Products List */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                  Dairy Outputs Produced & Added to Stock:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                  {batch.outputProducts.map((item, idx) => (
                    <div
                      key={idx}
                      className="bg-[#FAF8F5] p-3 rounded-2xl border border-amber-100 flex items-center justify-between text-xs"
                    >
                      <div className="font-bold text-slate-800 truncate">
                        {item.productId?.name || 'Unknown Product'}
                      </div>
                      <Badge variant="success">
                        +{item.quantity} {item.productId?.unit || 'Units'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>

              {batch.notes && (
                <div className="text-[11px] text-slate-500 italic bg-slate-50 p-2.5 rounded-xl">
                  Note: {batch.notes}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* 3. Log Production Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Log Milk Processing & Conversion"
        subtitle="Deducts raw milk stock and adds the resulting output products to active inventory."
        icon={<Factory className="w-5 h-5 text-amber-600" />}
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSubmitProduction} className="space-y-4">
          {/* Batch Date & Raw Milk Input */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Batch Date
              </label>
              <input
                type="date"
                required
                value={formData.batchDate}
                onChange={(e) => setFormData({ ...formData, batchDate: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Raw Milk Source
              </label>
              <select
                value={formData.rawMilkProductId}
                onChange={(e) => setFormData({ ...formData, rawMilkProductId: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                {rawMilkOptions.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.name} (Stock: {p.currentQuantity}L)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Raw Milk Input (Litres)
              </label>
              <input
                type="number"
                step="any"
                min="1"
                required
                value={formData.inputQuantity}
                onChange={(e) => setFormData({ ...formData, inputQuantity: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          {/* Dynamic Output Products Section */}
          <div className="bg-[#FAF8F5] p-4 rounded-2xl border border-amber-100 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-amber-900 uppercase tracking-wide">
                Produced Dairy Derivatives (Outputs)
              </span>
              <button
                type="button"
                onClick={handleAddOutputRow}
                className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-[10px] font-bold flex items-center gap-1 transition-colors"
              >
                <Plus className="w-3 h-3" />
                <span>Add Derivative</span>
              </button>
            </div>

            {formData.outputProducts.map((row, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <select
                  required
                  value={row.productId}
                  onChange={(e) => handleOutputChange(idx, 'productId', e.target.value)}
                  className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="">-- Choose Derivative (Curd, Ghee, Paneer, etc.) --</option>
                  {finishedProductOptions.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.name} ({p.unit})
                    </option>
                  ))}
                </select>

                <div className="w-28">
                  <input
                    type="number"
                    step="any"
                    min="0.1"
                    required
                    placeholder="Qty"
                    value={row.quantity}
                    onChange={(e) => handleOutputChange(idx, 'quantity', e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                {formData.outputProducts.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveOutputRow(idx)}
                    className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Wastage Loss & Notes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Process Wastage / Shrinkage (Litres)
              </label>
              <input
                type="number"
                step="any"
                min="0"
                value={formData.wastage}
                onChange={(e) => setFormData({ ...formData, wastage: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Batch Notes & Operator Info
              </label>
              <input
                type="text"
                placeholder="e.g. Standard morning shift pasteurization"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          {/* Submit Actions */}
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 py-2.5 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white rounded-xl text-xs font-black shadow-md transition-colors"
            >
              {submitting ? 'Converting & Syncing...' : 'Log Batch & Sync Stocks'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Production;
