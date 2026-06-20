import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';

export default function CustomerDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ orders: 0, wishlist: 0, reviews: 0 });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/dashboard/customer'),
      api.get('/orders?limit=5'),
    ]).then(([statsRes, ordersRes]) => {
      setStats(statsRes.data);
      setRecentOrders(ordersRes.data.orders || []);
    }).catch(() => {})
    .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div></div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome, {user?.name}</h1>
      <p className="text-gray-500 mb-8">Here's an overview of your account</p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Orders</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{stats.orders}</p>
            </div>
            <span className="text-3xl">📦</span>
          </div>
          <Link to="/dashboard/orders" className="text-sm text-primary-600 hover:text-primary-700 mt-3 inline-block">View Orders →</Link>
        </div>
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Wishlist</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{stats.wishlist}</p>
            </div>
            <span className="text-3xl">❤️</span>
          </div>
          <Link to="/dashboard/wishlist" className="text-sm text-primary-600 hover:text-primary-700 mt-3 inline-block">View Wishlist →</Link>
        </div>
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Reviews</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{stats.reviews}</p>
            </div>
            <span className="text-3xl">⭐</span>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="p-6 border-b">
          <h2 className="text-lg font-bold text-gray-900">Recent Orders</h2>
        </div>
        {recentOrders.length === 0 ? (
          <div className="p-6 text-center text-gray-500">No orders yet.</div>
        ) : (
          <div className="divide-y">
            {recentOrders.map((order) => (
              <div key={order.id} className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">#{order.orderNumber}</p>
                  <p className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString()} · UGX {order.total}</p>
                </div>
                <span className={`badge-${order.status === 'DELIVERED' ? 'success' : order.status === 'CANCELLED' ? 'danger' : 'warning'} text-sm`}>
                  {order.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
