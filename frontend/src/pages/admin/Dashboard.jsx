import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../lib/api';

const statusColors = {
  DELIVERED: 'bg-green-100 text-green-800',
  SHIPPED: 'bg-blue-100 text-blue-800',
  PROCESSING: 'bg-yellow-100 text-yellow-800',
  PENDING: 'bg-gray-100 text-gray-800',
  CANCELLED: 'bg-red-100 text-red-800',
  PAID: 'bg-teal-100 text-teal-800',
};

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/dashboard')
      .then(({ data }) => setData(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div></div>;
  }

  const s = data?.stats || {};

  const statCards = [
    { label: 'Total Customers', value: s.totalCustomers || 0, icon: '👥', color: 'bg-blue-50' },
    { label: 'Total Vendors', value: s.totalVendors || 0, icon: '🏪', color: 'bg-purple-50' },
    { label: 'Active Vendors', value: s.activeVendors || 0, icon: '✅', color: 'bg-green-50' },
    { label: 'Total Products', value: s.totalProducts || 0, icon: '🌿', color: 'bg-emerald-50' },
    { label: 'Total Orders', value: s.totalOrders || 0, icon: '📦', color: 'bg-orange-50' },
    { label: 'Total Revenue', value: `UGX ${(s.totalRevenue || 0).toLocaleString()}`, icon: '💰', color: 'bg-yellow-50' },
    { label: 'Total Commission', value: `UGX ${(s.totalCommission || 0).toLocaleString()}`, icon: '📊', color: 'bg-indigo-50' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Admin Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((card, i) => (
          <div key={i} className={`${card.color} rounded-xl p-5 border`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">{card.label}</p>
                <p className="text-xl font-bold text-gray-900 mt-1">{card.value}</p>
              </div>
              <span className="text-2xl">{card.icon}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">Top Products</h2>
            <Link to="/admin/products" className="text-sm text-primary-600 hover:text-primary-700">View All</Link>
          </div>
          {data?.topProducts?.length > 0 ? (
            <div className="space-y-3">
              {data.topProducts.map((p, i) => (
                <div key={p.id} className="flex items-center gap-3">
                  <span className="text-sm font-bold text-gray-400 w-6">{i + 1}</span>
                  <div className="w-10 h-10 bg-gray-100 rounded-lg overflow-hidden shrink-0 flex items-center justify-center text-sm">
                    {p.images?.[0] ? (
                      <img src={p.images[0].url} alt={p.name} className="w-full h-full object-cover" />
                    ) : '🌿'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 truncate">{p.name}</p>
                    <p className="text-xs text-gray-500">{p.vendor?.storeName}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-semibold text-gray-900">{p.totalSales} sold</p>
                    <p className="text-xs text-gray-500">UGX {(p.price * p.totalSales).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm py-8 text-center">No product data yet.</p>
          )}
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">Top Vendors</h2>
            <Link to="/admin/vendors" className="text-sm text-primary-600 hover:text-primary-700">Manage</Link>
          </div>
          {data?.topVendors?.length > 0 ? (
            <div className="space-y-3">
              {data.topVendors.map((v, i) => (
                <div key={v.id} className="flex items-center gap-3">
                  <span className="text-sm font-bold text-gray-400 w-6">{i + 1}</span>
                  <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center text-lg shrink-0">
                    🏪
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 truncate">{v.storeName}</p>
                    <p className="text-xs text-gray-500">{v._count?.products || 0} products · {v._count?.orders || 0} orders</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-semibold text-gray-900">UGX {(v.totalEarnings || 0).toLocaleString()}</p>
                    <p className="text-xs text-gray-500">{v.totalSales || 0} sales</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm py-8 text-center">No vendor data yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
