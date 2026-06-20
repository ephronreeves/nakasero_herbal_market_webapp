import { useState, useEffect } from 'react';
import api from '../../lib/api';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/dashboard')
      .then(({ data }) => setStats(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div></div>;
  }

  const statCards = [
    { label: 'Total Users', value: stats?.totalUsers || 0, icon: '👥' },
    { label: 'Total Vendors', value: stats?.totalVendors || 0, icon: '🏪' },
    { label: 'Total Products', value: stats?.totalProducts || 0, icon: '🌿' },
    { label: 'Total Orders', value: stats?.totalOrders || 0, icon: '📦' },
    { label: 'Total Revenue', value: `UGX ${(stats?.totalRevenue || 0).toLocaleString()}`, icon: '💰' },
    { label: 'Pending Approvals', value: stats?.pendingApprovals || 0, icon: '⏳' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Admin Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((card, i) => (
          <div key={i} className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{card.label}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{card.value}</p>
              </div>
              <span className="text-3xl">{card.icon}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
