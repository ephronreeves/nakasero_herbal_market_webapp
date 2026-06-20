import { useState, useEffect } from 'react';
import api from '../../lib/api';

export default function VendorPayouts() {
  const [payouts, setPayouts] = useState([]);
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/vendor/payouts'),
      api.get('/vendor/balance'),
    ]).then(([payoutsRes, balanceRes]) => {
      setPayouts(payoutsRes.data.payouts || []);
      setBalance(balanceRes.data);
    }).catch(() => {})
    .finally(() => setLoading(false));
  }, []);

  const statusBadge = (status) => {
    const styles = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      PROCESSING: 'bg-blue-100 text-blue-800',
      COMPLETED: 'bg-green-100 text-green-800',
      FAILED: 'bg-red-100 text-red-800',
      CANCELLED: 'bg-gray-100 text-gray-800',
    };
    return styles[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return <div className="flex items-center justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div></div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Payouts</h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        <div className="card p-6">
          <p className="text-sm text-gray-500">Available Balance</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">UGX {(balance?.available || 0).toLocaleString()}</p>
        </div>
        <div className="card p-6">
          <p className="text-sm text-gray-500">Pending Clearance</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">UGX {(balance?.pending || 0).toLocaleString()}</p>
        </div>
        <div className="card p-6">
          <p className="text-sm text-gray-500">Total Withdrawn</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">UGX {(balance?.withdrawn || 0).toLocaleString()}</p>
        </div>
      </div>

      <div className="card">
        <div className="p-6 border-b">
          <h2 className="text-lg font-bold text-gray-900">Payout History</h2>
        </div>
        {payouts.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <span className="text-6xl mb-4 block">💰</span>
            <p>No payouts yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b text-left text-sm text-gray-500">
                  <th className="pb-3 px-6 font-medium">Date</th>
                  <th className="pb-3 px-6 font-medium">Amount</th>
                  <th className="pb-3 px-6 font-medium">Method</th>
                  <th className="pb-3 px-6 font-medium">Status</th>
                  <th className="pb-3 px-6 font-medium">Reference</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {payouts.map((payout) => (
                  <tr key={payout.id} className="text-sm">
                    <td className="py-4 px-6 text-gray-900">{new Date(payout.createdAt).toLocaleDateString()}</td>
                    <td className="py-4 px-6 font-medium text-gray-900">UGX {payout.amount.toLocaleString()}</td>
                    <td className="py-4 px-6 text-gray-600">{payout.method || 'Bank Transfer'}</td>
                    <td className="py-4 px-6">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusBadge(payout.status)}`}>{payout.status}</span>
                    </td>
                    <td className="py-4 px-6 text-gray-500">{payout.reference || '-'}</td>
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
