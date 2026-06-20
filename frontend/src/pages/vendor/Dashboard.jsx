import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';

export default function VendorDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/dashboard/vendor')
      .then(({ data }) => setStats(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div></div>;
  }

  const statCards = [
    { label: 'Total Products', value: stats?.totalProducts || 0, icon: '🌿', link: '/vendor/products' },
    { label: 'Active Orders', value: stats?.activeOrders || 0, icon: '📦', link: '/vendor/orders' },
    { label: 'Total Revenue', value: `UGX ${(stats?.totalRevenue || 0).toLocaleString()}`, icon: '💰' },
    { label: 'Average Rating', value: stats?.averageRating?.toFixed(1) || '0.0', icon: '⭐' },
    { label: 'Total Sales', value: stats?.totalSales || 0, icon: '📈' },
    { label: 'Low Stock Items', value: stats?.lowStockItems || 0, icon: '⚠️', link: '/vendor/inventory' },
  ];

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
