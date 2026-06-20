import { useState, useEffect } from 'react';
import api from '../../lib/api';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function VendorAnalytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/vendor/analytics')
      .then(({ data }) => setData(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div></div>;
  }

  const summaryCards = [
    { label: 'Total Revenue', value: `UGX ${(data?.totalRevenue || 0).toLocaleString()}`, change: data?.revenueChange, icon: '💰' },
    { label: 'Total Orders', value: data?.totalOrders || 0, change: data?.ordersChange, icon: '📦' },
    { label: 'Total Products Sold', value: data?.totalProductsSold || 0, icon: '🌿' },
    { label: 'Average Order Value', value: `UGX ${(data?.averageOrderValue || 0).toLocaleString()}`, icon: '📊' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Analytics</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {summaryCards.map((card, i) => (
          <div key={i} className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{card.label}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{card.value}</p>
                {card.change !== undefined && (
                  <p className={`text-sm mt-1 ${card.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {card.change >= 0 ? '↑' : '↓'} {Math.abs(card.change).toFixed(1)}%
                  </p>
                )}
              </div>
              <span className="text-3xl">{card.icon}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="card p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Revenue (Last 7 Days)</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data?.revenueOverTime || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Line type="monotone" dataKey="revenue" stroke="#059669" strokeWidth={2} dot={{ fill: '#059669' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Orders (Last 7 Days)</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.ordersOverTime || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="orders" fill="#059669" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="card p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Top Selling Products</h2>
        {data?.topProducts?.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b text-left text-sm text-gray-500">
                  <th className="pb-3 font-medium">Product</th>
                  <th className="pb-3 font-medium">Sold</th>
                  <th className="pb-3 font-medium">Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {data.topProducts.map((product, i) => (
                  <tr key={i} className="text-sm">
                    <td className="py-3 font-medium text-gray-900">{product.name}</td>
                    <td className="py-3">{product.sold}</td>
                    <td className="py-3">UGX {product.revenue?.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">No data yet</p>
        )}
      </div>
    </div>
  );
}
