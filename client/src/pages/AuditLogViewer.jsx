import React, { useState, useEffect } from 'react';
import { getAuditLogsApi } from '../services/api';
import { useToast } from '../context/ToastContext';
import Badge from '../components/common/Badge';
import { 
  History, 
  Search, 
  Filter, 
  RefreshCw, 
  ShieldCheck, 
  User, 
  Clock, 
  Activity,
  Layers
} from 'lucide-react';

const AuditLogViewer = () => {
  const { addToast } = useToast();
  const [logs, setLogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  // Filters
  const [actionFilter, setActionFilter] = useState('all');
  const [entityFilter, setEntityFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const actions = ['all', 'CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'STOCK_SYNC', 'WASTAGE_LOG', 'PRODUCTION_LOG'];
  const entities = ['all', 'Product', 'Stock', 'Purchase', 'Sale', 'Production', 'ExpiryBatch', 'User', 'Auth'];

  useEffect(() => {
    fetchLogs();
  }, [actionFilter, entityFilter]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const params = {};
      if (actionFilter !== 'all') params.action = actionFilter;
      if (entityFilter !== 'all') params.entityType = entityFilter;
      if (searchQuery) params.search = searchQuery;

      const res = await getAuditLogsApi(params);
      if (res.data?.success) {
        setLogs(res.data.logs || []);
        setTotal(res.data.total || 0);
      }
    } catch (error) {
      console.warn('Audit logs load notice:', error?.message);
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchLogs();
  };

  const getActionBadgeVariant = (act) => {
    switch (act) {
      case 'CREATE':
      case 'PRODUCTION_LOG':
        return 'success';
      case 'UPDATE':
      case 'STOCK_SYNC':
        return 'primary';
      case 'DELETE':
      case 'WASTAGE_LOG':
        return 'danger';
      case 'LOGIN':
        return 'cyan';
      default:
        return 'default';
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <History className="w-6 h-6 text-[#0B4F9C]" />
            <span>Audit Trail & Activity Log</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Immutable timeline of all transactions, inventory adjustments, and user modifications.
          </p>
        </div>

        <button
          onClick={fetchLogs}
          className="p-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl transition-colors self-start"
          title="Refresh audit log"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* 2. Filter Controls */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-sm space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <form onSubmit={handleSearchSubmit} className="relative flex-1 min-w-[220px] max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search user name or activity details..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-[#FAF8F5] border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0B4F9C]"
            />
          </form>

          {/* Action Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500">Action:</span>
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="px-3 py-1.5 bg-[#FAF8F5] border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none"
            >
              {actions.map((act) => (
                <option key={act} value={act}>
                  {act}
                </option>
              ))}
            </select>
          </div>

          {/* Entity Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500">Entity:</span>
            <select
              value={entityFilter}
              onChange={(e) => setEntityFilter(e.target.value)}
              className="px-3 py-1.5 bg-[#FAF8F5] border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none"
            >
              {entities.map((ent) => (
                <option key={ent} value={ent}>
                  {ent}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 3. Audit Timeline List */}
      {loading ? (
        <div className="bg-white rounded-3xl p-12 text-center text-slate-400 animate-pulse">
          Loading audit logs...
        </div>
      ) : logs.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm space-y-2">
          <History className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="font-extrabold text-sm text-slate-700">No Audit Logs Found</h3>
          <p className="text-xs text-slate-400">Activity entries are recorded automatically on every mutation.</p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-soft overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF8F5] text-slate-500 uppercase text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4 font-black">Timestamp</th>
                  <th className="py-3.5 px-4 font-black">Action</th>
                  <th className="py-3.5 px-4 font-black">Entity</th>
                  <th className="py-3.5 px-4 font-black">User / Role</th>
                  <th className="py-3.5 px-4 font-black">Event Details</th>
                  <th className="py-3.5 px-4 font-black text-right">IP Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {logs.map((log) => (
                  <tr key={log._id} className="hover:bg-blue-50/30 transition-colors">
                    <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString([], {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit'
                      })}
                    </td>

                    <td className="py-3.5 px-4">
                      <Badge variant={getActionBadgeVariant(log.action)}>
                        {log.action}
                      </Badge>
                    </td>

                    <td className="py-3.5 px-4 font-bold text-slate-700">
                      {log.entityType}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{log.userName}</div>
                      <span className="text-[10px] text-slate-400 capitalize">{log.userRole}</span>
                    </td>

                    <td className="py-3.5 px-4 text-slate-700 leading-relaxed max-w-md">
                      {log.details}
                    </td>

                    <td className="py-3.5 px-4 text-right text-slate-400 font-mono text-[10px]">
                      {log.ipAddress || '127.0.0.1'}
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

export default AuditLogViewer;
