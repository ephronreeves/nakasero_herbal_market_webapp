import { useState, useEffect, useMemo } from 'react';
import api from '../../lib/api';
import toast from 'react-hot-toast';

const mockOrders = [
  { id: '1', orderNumber: 'ORD-001', createdAt: '2026-06-25T10:30:00Z', status: 'PENDING', total: 85000, user: { firstName: 'Grace', lastName: 'Nakato' }, items: [{ id: 'i1', quantity: 2, product: { name: 'Moringa Powder', price: 15000, vendorId: 'v1' } }, { id: 'i2', quantity: 1, product: { name: 'Ginger Tea', price: 8000, vendorId: 'v1' } }] },
  { id: '2', orderNumber: 'ORD-002', createdAt: '2026-06-24T14:00:00Z', status: 'PROCESSING', total: 25000, user: { firstName: 'James', lastName: 'Okello' }, items: [{ id: 'i3', quantity: 1, product: { name: 'Neem Oil', price: 18000, vendorId: 'v1' } }, { id: 'i4', quantity: 1, product: { name: 'Shea Butter', price: 7000, vendorId: 'v1' } }] },
  { id: '3', orderNumber: 'ORD-003', createdAt: '2026-06-23T09:15:00Z', status: 'SHIPPED', total: 142000, user: { firstName: 'Brenda', lastName: 'Achieng' }, items: [{ id: 'i5', quantity: 3, product: { name: 'Turmeric Capsules', price: 25000, vendorId: 'v1' } }, { id: 'i6', quantity: 2, product: { name: 'Hibiscus Tea', price: 10000, vendorId: 'v1' } }] },
  { id: '4', orderNumber: 'ORD-004', createdAt: '2026-06-23T16:45:00Z', status: 'PENDING', total: 45000, user: { firstName: 'David', lastName: 'Mukasa' }, items: [{ id: 'i7', quantity: 1, product: { name: 'Black Seed Oil', price: 28000, vendorId: 'v1' } }, { id: 'i8', quantity: 2, product: { name: 'Aloe Vera Gel', price: 8500, vendorId: 'v1' } }] },
  { id: '5', orderNumber: 'ORD-005', createdAt: '2026-06-22T11:20:00Z', status: 'DELIVERED', total: 98000, user: { firstName: 'Sarah', lastName: 'Nambi' }, items: [{ id: 'i9', quantity: 4, product: { name: 'Moringa Powder', price: 15000, vendorId: 'v1' } }] },
  { id: '6', orderNumber: 'ORD-006', createdAt: '2026-06-21T08:00:00Z', status: 'CANCELLED', total: 32000, user: { firstName: 'Peter', lastName: 'Ssebuliba' }, items: [{ id: 'i10', quantity: 1, product: { name: 'Ginger Tea', price: 8000, vendorId: 'v1' } }] },
];

const statusList = ['ALL', 'PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

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

export default function VendorOrders() {
  const [orders, setOrders] = useState(mockOrders);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  useEffect(() => {
    api.get('/vendor/orders')
      .then(({ data }) => setOrders(data.orders || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    let result = [...orders];

    if (search) {
      const q = search.toLowerCase();
      result = result.filter((o) =>
        o.orderNumber?.toLowerCase().includes(q) ||
        o.user?.firstName?.toLowerCase().includes(q) ||
        o.user?.lastName?.toLowerCase().includes(q) ||
        `${o.user?.firstName} ${o.user?.lastName}`.toLowerCase().includes(q)
      );
    }

    if (statusFilter !== 'ALL') {
      result = result.filter((o) => o.status === statusFilter);
    }

    return result;
  }, [orders, search, statusFilter]);

  const updateStatus = async (orderId, status) => {
    try {
      await api.patch(`/vendor/orders/${orderId}`, { status });
      setOrders((prev) => prev.map((o) => o.id === orderId ? { ...o, status } : o));
      toast.success(`Order ${status.toLowerCase()}`);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update');
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div></div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Orders</h1>

      <div className="card p-4 mb-6">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex-1 min-w-[200px]">
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by order number or customer..." className="input-field w-full" />
          </div>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="input-field w-auto">
            {statusList.map((s) => (
              <option key={s} value={s}>{s === 'ALL' ? 'All Statuses' : s.charAt(0) + s.slice(1).toLowerCase()}</option>
            ))}
          </select>
          {(search || statusFilter !== 'ALL') && (
            <button onClick={() => { setSearch(''); setStatusFilter('ALL'); }}
              className="text-sm text-gray-500 hover:text-gray-700">Clear</button>
          )}
          <span className="text-sm text-gray-400 ml-auto">{filtered.length} order{filtered.length !== 1 ? 's' : ''}</span>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="card p-12 text-center text-gray-500">
          <span className="text-6xl mb-4 block">🔍</span>
          <p className="text-lg mb-2">No orders found</p>
          <p className="text-sm text-gray-400">Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((order) => (
            <div key={order.id} className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="font-bold text-gray-900">Order #{order.orderNumber}</p>
                  <p className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString()} · {order.user?.firstName ? `${order.user.firstName} ${order.user.lastName}` : 'Customer'}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusBadge(order.status)}`}>{order.status}</span>
                </div>
              </div>
              <div className="space-y-2 mb-4">
                {(order.items || []).filter((i) => i.product?.vendorId).map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-gray-600">{item.product?.name} × {item.quantity}</span>
                    <span className="font-medium">UGX {(item.product?.discountPrice || item.product?.price) * item.quantity}</span>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between pt-4 border-t">
                <span className="font-bold">Total: UGX {order.total}</span>
                <div className="flex gap-2">
                  {order.status === 'PENDING' && (
                    <>
                      <button onClick={() => updateStatus(order.id, 'CONFIRMED')} className="btn-primary text-sm">Confirm</button>
                      <button onClick={() => updateStatus(order.id, 'CANCELLED')} className="btn-secondary text-sm text-red-600">Cancel</button>
                    </>
                  )}
                  {order.status === 'CONFIRMED' && (
                    <button onClick={() => updateStatus(order.id, 'PROCESSING')} className="btn-primary text-sm">Start Processing</button>
                  )}
                  {order.status === 'PROCESSING' && (
                    <button onClick={() => updateStatus(order.id, 'SHIPPED')} className="btn-primary text-sm">Mark Shipped</button>
                  )}
                  {order.status === 'SHIPPED' && (
                    <button onClick={() => updateStatus(order.id, 'DELIVERED')} className="btn-primary text-sm">Mark Delivered</button>
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
