import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import api from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';

const mockData = {
  totalProducts: 24,
  activeOrders: 8,
  totalRevenue: 8450000,
  averageRating: 4.3,
  totalSales: 312,
  lowStockItems: 3,
  recentOrders: [
    { id: 'ORD-001', customer: 'Nakato Grace', items: 3, total: 85000, status: 'pending', date: '2026-06-25' },
    { id: 'ORD-002', customer: 'Okello James', items: 1, total: 25000, status: 'processing', date: '2026-06-24' },
    { id: 'ORD-003', customer: 'Achieng Brenda', items: 5, total: 142000, status: 'shipped', date: '2026-06-23' },
    { id: 'ORD-004', customer: 'Mukasa David', items: 2, total: 45000, status: 'pending', date: '2026-06-23' },
    { id: 'ORD-005', customer: 'Nambi Sarah', items: 4, total: 98000, status: 'delivered', date: '2026-06-22' },
  ],
  lowStockAlerts: [
    { product: 'Moringa Powder', stock: 5, threshold: 10 },
    { product: 'Ginger Tea Bags', stock: 3, threshold: 15 },
    { product: 'Turmeric Capsules', stock: 8, threshold: 10 },
  ],
  monthlyRevenue: [
    { month: 'Jan', revenue: 620000 },
    { month: 'Feb', revenue: 780000 },
    { month: 'Mar', revenue: 910000 },
    { month: 'Apr', revenue: 740000 },
    { month: 'May', revenue: 1050000 },
    { month: 'Jun', revenue: 1200000 },
  ],
};

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  processing: 'bg-blue-100 text-blue-800',
  shipped: 'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

export default function VendorDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(mockData);
  const [loading, setLoading] = useState(true);
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');

  useEffect(() => {
    api.get('/dashboard/vendor')
      .then(({ data }) => setStats(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div></div>;
  }

  const s = stats?.stats || stats;
  const statCards = [
    { label: 'Total Products', value: s?.totalProducts || 0, icon: '🌿', link: '/vendor/products' },
    { label: 'Active Orders', value: s?.activeOrders ?? s?.totalOrders ?? 0, icon: '📦', link: '/vendor/orders' },
    { label: 'Total Revenue', value: `UGX ${(s?.totalRevenue || 0).toLocaleString()}`, icon: '💰' },
    { label: 'Average Rating', value: s?.averageRating ? s.averageRating.toFixed(1) : '0.0', icon: '⭐' },
    { label: 'Total Sales', value: s?.totalSales || 0, icon: '📈' },
    { label: 'Low Stock Items', value: s?.lowStockItems ?? s?.lowStockCount ?? 0, icon: '⚠️', link: '/vendor/inventory' },
  ];

  const allOrders = (stats?.recentOrders || mockData.recentOrders).map(o => ({
    id: o.id,
    customer: o.customer || (o.user ? `${o.user.firstName} ${o.user.lastName}` : 'Unknown'),
    items: Array.isArray(o.items) ? o.items.length : o.items,
    total: o.total || o.vendorAmount || 0,
    status: (o.status || '').toLowerCase(),
  }));

  const filteredOrders = useMemo(() => {
    let result = [...allOrders];
    if (orderSearch) {
      const q = orderSearch.toLowerCase();
      result = result.filter(o =>
        o.id.toLowerCase().includes(q) || o.customer.toLowerCase().includes(q)
      );
    }
    if (orderStatusFilter !== 'all') {
      result = result.filter(o => o.status === orderStatusFilter);
    }
    return result;
  }, [allOrders, orderSearch, orderStatusFilter]);

  const alerts = (stats?.lowStockAlerts || stats?.lowStockProducts || mockData.lowStockAlerts).map(a => ({
    product: a.productName || a.product?.name || a.name || a.product,
    stock: a.stockQuantity ?? a.stock ?? 0,
    threshold: a.lowStockThreshold ?? a.threshold ?? 10,
  }));

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">{user?.storeName || 'Vendor Dashboard'}</h1>
      <p className="text-gray-500 mb-8">Here's an overview of your store</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {statCards.map((card, i) => (
          <div key={i} className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{card.label}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{card.value}</p>
              </div>
              <span className="text-3xl">{card.icon}</span>
            </div>
            {card.link && (
              <Link to={card.link} className="text-sm text-primary-600 hover:text-primary-700 mt-3 inline-block">View Details →</Link>
            )}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">Recent Orders</h2>
            <Link to="/vendor/orders" className="text-sm text-primary-600 hover:text-primary-700">View All →</Link>
          </div>
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <input type="text" value={orderSearch} onChange={(e) => setOrderSearch(e.target.value)}
              placeholder="Search orders..." className="input-field text-sm flex-1 min-w-[140px]" />
            <select value={orderStatusFilter} onChange={(e) => setOrderStatusFilter(e.target.value)} className="input-field text-sm w-auto">
              <option value="all">All</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
            </select>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b">
                  <th className="pb-2 font-medium">Order</th>
                  <th className="pb-2 font-medium">Customer</th>
                  <th className="pb-2 font-medium">Items</th>
                  <th className="pb-2 font-medium">Total</th>
                  <th className="pb-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.length === 0 ? (
                  <tr><td colSpan={5} className="py-6 text-center text-gray-400 text-sm">No orders match your search</td></tr>
                ) : (
                  filteredOrders.map((order) => (
                    <tr key={order.id} className="border-b last:border-0">
                      <td className="py-2 text-gray-900 font-medium">{order.id}</td>
                      <td className="py-2 text-gray-600">{order.customer}</td>
                      <td className="py-2 text-gray-600">{order.items}</td>
                      <td className="py-2 text-gray-900">UGX {order.total.toLocaleString()}</td>
                      <td className="py-2">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[order.status]}`}>
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">Low Stock Alerts</h2>
            <Link to="/vendor/inventory" className="text-sm text-primary-600 hover:text-primary-700">Manage →</Link>
          </div>
          {alerts.length === 0 ? (
            <p className="text-gray-500 text-sm">No low stock items</p>
          ) : (
            <div className="space-y-3">
              {alerts.map((alert, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-100">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{alert.product}</p>
                    <p className="text-xs text-gray-500">Stock: {alert.stock} / Min: {alert.threshold}</p>
                  </div>
                  <span className="text-sm font-semibold text-red-600">{Math.round((1 - alert.stock / alert.threshold) * 100)}% below</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="card p-6 mb-8">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Monthly Revenue (2026)</h2>
        <div className="flex items-end gap-3 h-40">
          {(stats?.monthlyRevenue || mockData.monthlyRevenue).map((item, i) => {
            const maxRevenue = Math.max(...(stats?.monthlyRevenue || mockData.monthlyRevenue).map(r => r.revenue));
            const height = (item.revenue / maxRevenue) * 100;
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-xs text-gray-500">UGK {(item.revenue / 1000).toFixed(0)}k</span>
                <div className="w-full bg-primary-100 rounded-t" style={{ height: `${height}%` }} />
                <span className="text-xs text-gray-500">{item.month}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="card p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-2">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <Link to="/vendor/products" className="btn-primary">Manage Products</Link>
          <Link to="/vendor/inventory" className="btn-secondary">Check Inventory</Link>
          <Link to="/vendor/orders" className="btn-secondary">View Orders</Link>
          <Link to="/vendor/store" className="btn-secondary">Edit Store</Link>
        </div>
      </div>
    </div>
  );
}
