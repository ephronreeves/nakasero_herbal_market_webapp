import { useState, useEffect } from 'react';
import api from '../../lib/api';
import toast from 'react-hot-toast';

const methodIcons = {
  MTN_MOBILE_MONEY: { icon: '📱', label: 'MTN MoMo', logo: '/api/uploads/logos/mtn-momo-mobile-money.png' },
  AIRTEL_MONEY: { icon: '📱', label: 'Airtel Money', logo: '/api/uploads/logos/airtel-money.jpg' },
  VISA: { icon: '💳', label: 'Visa', logo: null },
  APPLE_PAY: { icon: '🍎', label: 'Apple Pay', logo: null },
  mtn_momo: { icon: '📱', label: 'MTN MoMo', logo: '/api/uploads/logos/mtn-momo-mobile-money.png' },
};

export default function AdminPayments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/payments')
      .then(({ data }) => {
        const list = data.payments || data || [];
        setPayments(Array.isArray(list) ? list : []);
      })
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
      PAID: 'bg-green-100 text-green-800',
    };
    return styles[status] || 'bg-gray-100 text-gray-800';
  };

  const getMethodInfo = (method) => {
    return methodIcons[method] || { icon: '💳', label: method || '-' };
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
          <>
            <div className="hidden sm:block overflow-x-auto">
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
                  {payments.map((payment) => {
                    const methodInfo = getMethodInfo(payment.method || payment.paymentMethod || payment.provider);
                    return (
                      <tr key={payment.id} className="text-sm">
                        <td className="py-4 px-6 font-mono text-gray-600">{payment.reference || '-'}</td>
                        <td className="py-4 px-6 font-medium text-gray-900">#{payment.order?.orderNumber || payment.orderNumber || '-'}</td>
                        <td className="py-4 px-6 text-gray-600">{payment.user?.name || payment.order?.user?.name || payment.order?.user?.firstName || '-'}</td>
                        <td className="py-4 px-6 font-medium whitespace-nowrap">UGX {(payment.amount || 0).toLocaleString()}</td>
                        <td className="py-4 px-6">
                          <span className="flex items-center gap-1.5">
                            {methodInfo.logo ? (
                              <img src={methodInfo.logo} alt={methodInfo.label} className="w-10 h-6 object-contain rounded" />
                            ) : (
                              <span>{methodInfo.icon}</span>
                            )}
                            <span className="text-gray-600">{methodInfo.label}</span>
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusBadge(payment.status)}`}>{payment.status}</span>
                        </td>
                        <td className="py-4 px-6 text-gray-500 whitespace-nowrap">{payment.createdAt ? new Date(payment.createdAt).toLocaleDateString() : '-'}</td>
                        <td className="py-4 px-6">
                          {payment.status === 'PENDING' && (
                            <div className="flex gap-2">
                              <button onClick={() => updatePaymentStatus(payment.id, 'COMPLETED')}
                                className="text-green-600 hover:text-green-800 text-sm font-medium">Confirm</button>
                              <button onClick={() => updatePaymentStatus(payment.id, 'FAILED')}
                                className="text-red-600 hover:text-red-800 text-sm font-medium">Fail</button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="sm:hidden divide-y">
              {payments.map((payment) => {
                const methodInfo = getMethodInfo(payment.method || payment.paymentMethod || payment.provider);
                return (
                  <div key={payment.id} className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-900">#{payment.order?.orderNumber || payment.orderNumber || '-'}</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusBadge(payment.status)}`}>{payment.status}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-gray-500 text-xs">Customer</span>
                        <p className="text-gray-700">{payment.user?.name || payment.order?.user?.firstName || '-'}</p>
                      </div>
                      <div>
                        <span className="text-gray-500 text-xs">Amount</span>
                        <p className="font-medium">UGX {(payment.amount || 0).toLocaleString()}</p>
                      </div>
                      <div>
                        <span className="text-gray-500 text-xs">Method</span>
                        <p className="flex items-center gap-1">
                          {methodInfo.logo ? (
                            <img src={methodInfo.logo} alt={methodInfo.label} className="w-8 h-5 object-contain" />
                          ) : (
                            <span>{methodInfo.icon}</span>
                          )}
                          {methodInfo.label}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-500 text-xs">Date</span>
                        <p>{payment.createdAt ? new Date(payment.createdAt).toLocaleDateString() : '-'}</p>
                      </div>
                    </div>
                    {payment.reference && (
                      <div className="text-xs font-mono text-gray-400">Ref: {payment.reference}</div>
                    )}
                    {payment.status === 'PENDING' && (
                      <div className="flex gap-2 pt-1">
                        <button onClick={() => updatePaymentStatus(payment.id, 'COMPLETED')}
                          className="flex-1 text-center text-green-600 border border-green-200 rounded-lg py-2 text-sm font-medium hover:bg-green-50">Confirm</button>
                        <button onClick={() => updatePaymentStatus(payment.id, 'FAILED')}
                          className="flex-1 text-center text-red-600 border border-red-200 rounded-lg py-2 text-sm font-medium hover:bg-red-50">Fail</button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
