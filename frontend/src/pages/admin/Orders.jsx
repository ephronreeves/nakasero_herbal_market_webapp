import { useState, useEffect } from 'react';
import api from '../../lib/api';
import toast from 'react-hot-toast';

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    api.get('/admin/orders')
      .then(({ data }) => setOrders(data.orders || []))
      .catch(() => toast.error('Failed to load orders'))
      .finally(() => setLoading(false));
  }, []);

  const updateStatus = async (orderId, status) => {
    try {
      await api.patch(`/admin/orders/${orderId}`, { status });
      setOrders((prev) => prev.map((o) => o.id === orderId ? { ...o, status } : o));
      toast.success(`Order ${status.toLowerCase()}`);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update');
    }
  };

  const statusBadge = (status) => {
    const styles = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      CONFIRMED: 'bg-blue-100 text-blue-800',
      PROCESSING: 'bg-indigo-100 text-indigo-800',
      SHIPPED: 'bg-purple-100 text-purple-800',
      DELIVERED: 'bg-green-100 text-green-800',
      CANCELLED: 'bg-red-100 text-red-800',
    };
    return styles[status] || 'bg-gray-100 text-gray-800';
  };

  const filtered = filter === 'all' ? orders : orders.filter((o) => o.status === filter);

  if (loading) {
    return <div className="flex items-center justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div></div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">All Orders</h1>

      <div className="flex gap-2 mb-6 overflow-x-auto">
        {['all', 'PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'].map((s) => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap ${filter === s ? 'bg-primary-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
            {s === 'all' ? 'All' : s.charAt(0) + s.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="card p-12 text-center text-gray-500">
          <span className="text-6xl mb-4 block">📦</span>
          <p>No orders found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((order) => (
            <div key={order.id} className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="font-bold text-gray-900">Order #{order.orderNumber}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(order.createdAt).toLocaleDateString()} · {order.user?.name || 'Customer'} · {order.user?.email}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusBadge(order.status)}`}>{order.status}</span>
              </div>
              <div className="space-y-1 mb-4">
                {order.items?.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-gray-600">{item.product?.name} × {item.quantity}</span>
                    <span className="font-medium">UGX {(item.product?.discountPrice || item.product?.price) * item.quantity}</span>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between pt-4 border-t">
                <div className="text-sm text-gray-500">
                  {order.paymentMethod} · {order.paymentStatus} · UGX {order.total}
                </div>
                <div className="flex gap-2">
                  {order.status === 'PENDING' && (
                    <>
                      <button onClick={() => updateStatus(order.id, 'CONFIRMED')} className="btn-primary text-sm">Confirm</button>
                      <button onClick={() => updateStatus(order.id, 'CANCELLED')} className="btn-secondary text-sm text-red-600">Cancel</button>
                    </>
                  )}
                  {order.status === 'CONFIRMED' && (
                    <button onClick={() => updateStatus(order.id, 'PROCESSING')} className="btn-primary text-sm">Process</button>
                  )}
                  {order.status === 'PROCESSING' && (
                    <button onClick={() => updateStatus(order.id, 'SHIPPED')} className="btn-primary text-sm">Ship</button>
                  )}
                  {order.status === 'SHIPPED' && (
                    <button onClick={() => updateStatus(order.id, 'DELIVERED')} className="btn-primary text-sm">Deliver</button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
