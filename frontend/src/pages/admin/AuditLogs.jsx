import { useState, useEffect } from 'react';
import api from '../../lib/api';
import toast from 'react-hot-toast';

export default function AdminAuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [actionFilter, setActionFilter] = useState('');

  useEffect(() => {
    loadLogs();
  }, [page, actionFilter]);

  const loadLogs = () => {
    setLoading(true);
    const params = { page, limit: 50 };
    if (actionFilter) params.action = actionFilter;

    api.get('/admin/audit-logs', { params })
      .then(({ data }) => {
        setLogs(data.logs || []);
        setPagination(data.pagination);
      })
      .catch(() => toast.error('Failed to load audit logs'))
      .finally(() => setLoading(false));
  };

  const actionColors = {
    USER_REGISTERED: 'bg-blue-100 text-blue-800',
    USER_LOGIN: 'bg-green-100 text-green-800',
    USER_LOGOUT: 'bg-gray-100 text-gray-800',
    ORDER_CREATED: 'bg-purple-100 text-purple-800',
    ORDER_STATUS_CHANGED: 'bg-indigo-100 text-indigo-800',
    VENDOR_STATUS_UPDATED: 'bg-orange-100 text-orange-800',
    SETTINGS_UPDATED: 'bg-yellow-100 text-yellow-800',
    REVIEW_DELETED: 'bg-red-100 text-red-800',
  };

  const uniqueActions = [...new Set(logs.map(l => l.action))];

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Audit Logs</h1>
        <select value={actionFilter} onChange={(e) => { setActionFilter(e.target.value); setPage(1); }}
          className="input-field text-sm max-w-xs">
          <option value="">All Actions</option>
          <option value="USER_REGISTERED">Registration</option>
          <option value="USER_LOGIN">Login</option>
          <option value="USER_LOGOUT">Logout</option>
          <option value="ORDER_CREATED">Order Created</option>
          <option value="ORDER_STATUS_CHANGED">Order Status</option>
          <option value="VENDOR_STATUS_UPDATED">Vendor Status</option>
          <option value="SETTINGS_UPDATED">Settings</option>
          <option value="REVIEW_DELETED">Review Deleted</option>
        </select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div></div>
      ) : logs.length === 0 ? (
        <div className="card p-12 text-center text-gray-500">
          <span className="text-6xl mb-4 block">📋</span>
          <p className="text-lg font-medium mb-2">No audit logs found</p>
          <p className="text-sm">Logs will appear here as users interact with the platform.</p>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {logs.map((log) => (
              <div key={log.id} className="card p-4 sm:p-5">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${actionColors[log.action] || 'bg-gray-100 text-gray-800'}`}>
                        {log.action.replace(/_/g, ' ')}
                      </span>
                      <span className="text-xs text-gray-400">{new Date(log.createdAt).toLocaleString()}</span>
                    </div>
                    <p className="text-sm text-gray-600 break-words">
                      {log.description || `${log.action} on ${log.entity}${log.entityId ? ` (${log.entityId.slice(0, 8)}...)` : ''}`}
                    </p>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-xs text-gray-400">
                      {log.user && <span>By: {log.user.firstName} {log.user.lastName} ({log.user.email})</span>}
                      {log.vendor && <span>Vendor: {log.vendor.storeName}</span>}
                      <span>Entity: {log.entity}</span>
                      {log.ipAddress && <span>IP: {log.ipAddress}</span>}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {pagination && pagination.pages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="btn-secondary text-sm px-3 py-1.5 disabled:opacity-40">Previous</button>
              <span className="text-sm text-gray-500">Page {pagination.page} of {pagination.pages}</span>
              <button onClick={() => setPage(p => Math.min(pagination.pages, p + 1))} disabled={page === pagination.pages}
                className="btn-secondary text-sm px-3 py-1.5 disabled:opacity-40">Next</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}