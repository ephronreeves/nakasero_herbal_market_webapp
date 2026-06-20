import { useState, useEffect } from 'react';
import api from '../../lib/api';
import toast from 'react-hot-toast';

export default function AdminPayments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/payments')
      .then(({ data }) => setPayments(data.payments || []))
      .catch(() => toast.error('Failed to load payments'))
      .finally(() => setLoading(false));
  }, []);

  const updatePaymentStatus = async (paymentId, status) => {
    try {
      await api.patch(`/admin/payments/${paymentId}`, { status });
      setPayments((prev) => prev.map((p) => p.id === paymentId ? { ...p, status } : p));
      toast.success(`Payment ${status.toLowerCase()}`);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update');
    }
  };

  const statusBadge = (status) => {
    const styles = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      COMPLETED: 'bg-green-100 text-green-800',
      FAILED: 'bg-red-100 text-red-800',
      REFUNDED: 'bg-gray-100 text-gray-800',
    };
    return styles[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return <div className="flex items-center justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div></div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Payments</h1>

      <div className="card overflow-hidden">
        {payments.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <span className="text-6xl mb-4 block">💳</span>
            <p>No payments yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b text-left text-sm text-gray-500 bg-gray-50">
                  <th className="pb-3 px-6 pt-3 font-medium">Reference</th>
                  <th className="pb-3 px-6 pt-3 font-medium">Order</th>
                  <th className="pb-3 px-6 pt-3 font-medium">Customer</th>
                  <th className="pb-3 px-6 pt-3 font-medium">Amount</th>
                  <th className="pb-3 px-6 pt-3 font-medium">Method</th>
                  <th className="pb-3 px-6 pt-3 font-medium">Status</th>
                  <th className="pb-3 px-6 pt-3 font-medium">Date</th>
                  <th className="pb-3 px-6 pt-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {payments.map((payment) => (
                  <tr key={payment.id} className="text-sm">
                    <td className="py-4 px-6 font-mono text-gray-600">{payment.reference || '-'}</td>
                    <td className="py-4 px-6 font-medium text-gray-900">#{payment.order?.orderNumber || '-'}</td>
                    <td className="py-4 px-6 text-gray-600">{payment.user?.name || payment.order?.user?.name || '-'}</td>
                    <td className="py-4 px-6 font-medium">UGX {(payment.amount || 0).toLocaleString()}</td>
                    <td className="py-4 px-6 text-gray-600">{payment.method || payment.paymentMethod || '-'}</td>
                    <td className="py-4 px-6">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusBadge(payment.status)}`}>{payment.status}</span>
                    </td>
                    <td className="py-4 px-6 text-gray-500">{new Date(payment.createdAt).toLocaleDateString()}</td>
                    <td className="py-4 px-6">
                      {payment.status === 'PENDING' && (
                        <div className="flex gap-2">
                          <button onClick={() => updatePaymentStatus(payment.id, 'COMPLETED')} className="text-green-600 hover:text-green-800 text-sm">Confirm</button>
                          <button onClick={() => updatePaymentStatus(payment.id, 'FAILED')} className="text-red-600 hover:text-red-800 text-sm">Fail</button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
