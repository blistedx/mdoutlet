import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Star, 
  Sparkles, 
  CheckCircle2, 
  MessageSquareHeart, 
  Trash2, 
  QrCode, 
  Printer, 
  Download, 
  Filter, 
  RefreshCw, 
  ExternalLink,
  Award,
  ShieldCheck,
  Search
} from 'lucide-react';
import { 
  getAllFeedbackApi, 
  updateFeedbackStatusApi, 
  deleteFeedbackApi 
} from '../services/api';
import { useToast } from '../context/ToastContext';
import Modal from '../components/common/Modal';

const FeedbackManagement = () => {
  const { addToast } = useToast();
  const [feedbacks, setFeedbacks] = useState([]);
  const [stats, setStats] = useState({ avgRating: 5.0, totalReviews: 0, ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 } });
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [ratingFilter, setRatingFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Counter QR Modal
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);

  useEffect(() => {
    fetchFeedbacks();
  }, [statusFilter]);

  const fetchFeedbacks = async () => {
    try {
      setLoading(true);
      const params = {};
      if (statusFilter !== 'all') params.status = statusFilter;

      const res = await getAllFeedbackApi(params);
      if (res.data.success) {
        setFeedbacks(res.data.feedbacks || []);
        if (res.data.stats) {
          setStats(res.data.stats);
        }
      }
    } catch (err) {
      addToast('Failed to load customer reviews', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      const res = await updateFeedbackStatusApi(id, { status: newStatus });
      if (res.data.success) {
        addToast(`Review marked as ${newStatus}`, 'success');
        fetchFeedbacks();
      }
    } catch (err) {
      addToast('Failed to update status', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this customer feedback record?')) return;
    try {
      const res = await deleteFeedbackApi(id);
      if (res.data.success) {
        addToast('Review deleted', 'info');
        fetchFeedbacks();
      }
    } catch (err) {
      addToast('Failed to delete review', 'error');
    }
  };

  const filteredFeedbacks = feedbacks.filter((f) => {
    const matchesRating = ratingFilter === 'all' || f.rating === Number(ratingFilter);
    const matchesSearch = 
      (f.customerName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (f.comment || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (f.category || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesRating && matchesSearch;
  });

  const ratingUrl = `${window.location.origin}/rate`;
  const qrCodeImgUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(ratingUrl)}&color=1e3a1e&bgcolor=ffffff&margin=10`;

  return (
    <div className="space-y-7 pb-12 font-sans">
      {/* 1. Header Banner */}
      <div className="bg-white p-6 sm:p-7 rounded-3xl border border-[#a0c396]/30 shadow-soft flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#ebf5eb] text-[#1e3a1e] rounded-full text-[11px] font-bold tracking-wider uppercase border border-[#a0c396]/40 mb-2">
            <Star className="w-3.5 h-3.5 fill-[#1e3a1e]" />
            <span>Customer Purity & Quality Index</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#1e3a1e] tracking-tight">
            Customer Ratings & Reviews
          </h1>
          <p className="text-xs text-[#3f5a3f] mt-1 max-w-xl">
            Live customer ratings collected via counter QR code scanning, product feedback, and outlet service reviews.
          </p>
        </div>

        {/* Counter QR Flyer Button */}
        <div className="flex items-center gap-2.5 flex-shrink-0">
          <button
            onClick={() => setIsQrModalOpen(true)}
            className="px-4 py-2.5 bg-[#1e3a1e] hover:bg-[#2d4a2d] text-white rounded-2xl text-xs font-bold transition-all shadow-md shadow-[#1e3a1e]/15 flex items-center gap-2 cursor-pointer"
          >
            <QrCode className="w-4 h-4 text-[#9bc09b]" />
            <span>Counter QR Standee / Flyer</span>
          </button>

          <button
            onClick={fetchFeedbacks}
            className="p-2.5 bg-[#f4f8f2] hover:bg-[#ebf5eb] text-[#1e3a1e] border border-[#a0c396]/40 rounded-xl transition-colors cursor-pointer"
            title="Refresh reviews"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* 2. Top Rating Statistics Strip */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Overall Score Card */}
        <div className="bg-white p-6 rounded-3xl border border-[#a0c396]/30 shadow-soft flex items-center gap-5">
          <div className="w-20 h-20 rounded-3xl bg-[#ebf5eb] border border-[#a0c396]/40 flex flex-col items-center justify-center flex-shrink-0">
            <span className="text-3xl font-black text-[#1e3a1e] font-serif leading-none">
              {stats.avgRating}
            </span>
            <div className="flex items-center gap-0.5 mt-1 text-amber-500">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
              ))}
            </div>
          </div>

          <div>
            <span className="text-xs font-bold text-[#3f5a3f] uppercase tracking-wider block">
              Overall Satisfaction
            </span>
            <div className="font-serif font-bold text-lg text-[#1e3a1e] mt-0.5">
              Outstanding Outlet Score
            </div>
            <p className="text-xs text-[#3f5a3f] mt-0.5">
              Based on <strong>{stats.totalReviews} verified customer reviews</strong>
            </p>
          </div>
        </div>

        {/* 5-Star Distribution Breakdown */}
        <div className="md:col-span-2 bg-white p-6 rounded-3xl border border-[#a0c396]/30 shadow-soft flex flex-col justify-center space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-[#1e3a1e] mb-1">
            <span>Star Rating Breakdown</span>
            <span className="text-[#3f5a3f] font-medium">{stats.totalReviews} Total Submissions</span>
          </div>

          {[5, 4, 3, 2, 1].map((s) => {
            const count = stats.ratingDistribution?.[s] || 0;
            const pct = stats.totalReviews > 0 ? Math.round((count / stats.totalReviews) * 100) : 0;
            return (
              <div key={s} className="flex items-center gap-3 text-xs">
                <div className="flex items-center gap-1 w-12 font-bold text-[#1e3a1e]">
                  <span>{s}</span>
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                </div>
                <div className="flex-1 h-2.5 bg-[#f4f8f2] rounded-full overflow-hidden border border-[#a0c396]/20">
                  <div
                    className="h-full bg-[#1e3a1e] rounded-full transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="w-16 text-right text-[11px] font-bold text-[#3f5a3f]">
                  {count} ({pct}%)
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Search & Status Filter Controls */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-[#a0c396]/30 shadow-soft flex flex-wrap items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[220px] max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search customer name, comment, category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#f4f8f2] border border-[#a0c396]/40 rounded-xl text-xs text-[#1e3a1e] focus:outline-none focus:ring-2 focus:ring-[#1e3a1e]"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          <span className="text-xs font-bold text-[#3f5a3f]">Status:</span>
          {['all', 'featured', 'reviewed', 'new'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                statusFilter === st
                  ? 'bg-[#1e3a1e] text-white shadow-xs'
                  : 'bg-[#f4f8f2] text-[#3f5a3f] hover:bg-[#ebf5eb]'
              }`}
            >
              {st}
            </button>
          ))}

          <span className="text-xs font-bold text-[#3f5a3f] ml-2">Rating:</span>
          <select
            value={ratingFilter}
            onChange={(e) => setRatingFilter(e.target.value)}
            className="px-3 py-1.5 bg-[#f4f8f2] border border-[#a0c396]/40 rounded-xl text-xs font-bold text-[#1e3a1e] focus:outline-none"
          >
            <option value="all">All Stars</option>
            <option value="5">5 Stars Only</option>
            <option value="4">4 Stars Only</option>
            <option value="3">3 Stars Only</option>
          </select>
        </div>
      </div>

      {/* 4. Customer Reviews Grid */}
      {loading ? (
        <div className="bg-white rounded-3xl p-12 text-center text-[#3f5a3f] animate-pulse">
          Loading customer reviews...
        </div>
      ) : filteredFeedbacks.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-[#a0c396]/30 shadow-soft space-y-2">
          <MessageSquareHeart className="w-12 h-12 text-[#a0c396] mx-auto" />
          <h3 className="font-serif text-base font-bold text-[#1e3a1e]">No Customer Reviews Found</h3>
          <p className="text-xs text-[#3f5a3f]">Customer ratings submitted via QR code will appear here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
          {filteredFeedbacks.map((item) => (
            <div
              key={item.id}
              className="bg-white p-5 rounded-3xl border border-[#a0c396]/30 shadow-soft hover:shadow-md transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2.5">
                {/* Review Top Meta */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-[#1e3a1e]">
                        {item.customerName}
                      </h4>
                      {item.status === 'featured' && (
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1 uppercase tracking-wider">
                          <Award className="w-2.5 h-2.5 text-amber-700" />
                          <span>Featured</span>
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-[#3f5a3f] font-mono mt-0.5">
                      {item.phone ? item.phone : 'Verified Walk-in'} • {new Date(item.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                  </div>

                  {/* Stars Badge */}
                  <div className="flex items-center gap-1 px-2.5 py-1 bg-amber-50 rounded-xl border border-amber-200">
                    <span className="font-black text-xs text-amber-900">{item.rating}.0</span>
                    <div className="flex items-center text-amber-400">
                      {[...Array(item.rating)].map((_, i) => (
                        <Star key={i} className="w-3 h-3 fill-amber-400" />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Category Pill */}
                <div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#ebf5eb] text-[#2d4a2d] border border-[#a0c396]/30">
                    {item.category}
                  </span>
                </div>

                {/* Comment */}
                <p className="text-xs text-[#2d4a2d] leading-relaxed italic bg-[#f4f8f2] p-3 rounded-2xl border border-[#a0c396]/20">
                  "{item.comment}"
                </p>
              </div>

              {/* Admin Actions */}
              <div className="pt-3 border-t border-[#a0c396]/20 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-[#3f5a3f] font-bold uppercase">Status:</span>
                  <select
                    value={item.status}
                    onChange={(e) => handleStatusChange(item.id, e.target.value)}
                    className="text-[11px] font-bold bg-[#f4f8f2] border border-[#a0c396]/40 rounded-lg px-2 py-0.5 text-[#1e3a1e] focus:outline-none cursor-pointer"
                  >
                    <option value="new">New</option>
                    <option value="reviewed">Reviewed</option>
                    <option value="featured">Featured ⭐</option>
                  </select>
                </div>

                <button
                  onClick={() => handleDelete(item.id)}
                  className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                  title="Delete review"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ========================================================================= */}
      {/* COUNTER QR MODAL */}
      {/* ========================================================================= */}
      <Modal
        isOpen={isQrModalOpen}
        onClose={() => setIsQrModalOpen(false)}
        title="Store Counter 'Rate Us' QR Standee"
        maxWidth="max-w-md"
      >
        <div className="text-center space-y-5 p-2">
          <div className="bg-[#f4f8f2] p-6 rounded-3xl border-2 border-[#1e3a1e]/20 space-y-4">
            <div className="flex items-center justify-center gap-2">
              <span className="text-xl">🥛</span>
              <span className="font-serif font-bold text-base text-[#1e3a1e]">
                Mother Dairy Store Feedback
              </span>
            </div>

            {/* QR Image */}
            <div className="bg-white p-4 rounded-2xl shadow-sm inline-block border border-[#a0c396]/40">
              <img
                src={qrCodeImgUrl}
                alt="Mother Dairy Rating QR Code"
                className="w-48 h-48 mx-auto"
              />
            </div>

            <div className="space-y-1">
              <div className="font-bold text-sm text-[#1e3a1e]">
                Scan with Camera to Rate Us ⭐
              </div>
              <p className="text-xs text-[#3f5a3f]">
                Point mobile camera or Google Lens to leave instant product & service feedback.
              </p>
            </div>

            <div className="text-[10px] font-mono text-[#3f5a3f] bg-white p-2 rounded-xl border border-slate-200 break-all">
              {ratingUrl}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => window.open(ratingUrl, '_blank')}
              className="flex-1 py-2.5 px-4 bg-[#1e3a1e] hover:bg-[#2d4a2d] text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
            >
              <ExternalLink className="w-4 h-4 text-[#9bc09b]" />
              <span>Open Rating Page</span>
            </button>

            <button
              onClick={() => window.print()}
              className="py-2.5 px-4 bg-[#f4f8f2] hover:bg-[#ebf5eb] text-[#1e3a1e] border border-[#a0c396]/40 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print Flyer</span>
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default FeedbackManagement;
