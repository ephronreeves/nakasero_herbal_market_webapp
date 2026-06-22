import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../lib/api';
import SafeImage from '../../components/SafeImage';
import toast from 'react-hot-toast';

export default function AdminVendors() {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingCommission, setEditingCommission] = useState(null);
  const [commissionValue, setCommissionValue] = useState('');

  useEffect(() => {
    api.get('/admin/vendors')
      .then(({ data }) => setVendors(data || []))
      .catch(() => toast.error('Failed to load vendors'))
      .finally(() => setLoading(false));
  }, []);

  const toggleApproval = async (vendorId, currentStatus) => {
    const newStatus = currentStatus === 'APPROVED' ? 'SUSPENDED' : 'APPROVED';
    try {
      await api.patch(`/admin/vendors/${vendorId}`, { status: newStatus });
      setVendors((prev) => prev.map((v) => v.id === vendorId ? { ...v, status: newStatus } : v));
      toast.success(`Vendor ${newStatus === 'APPROVED' ? 'approved' : 'suspended'}`);
    } catch {
      toast.error('Failed to update vendor');
    }
  };

  const updateCommission = async (vendorId) => {
    try {
      await api.patch(`/admin/vendors/${vendorId}`, { commissionRate: Number(commissionValue) });
      setVendors((prev) => prev.map((v) => v.id === vendorId ? { ...v, commissionRate: Number(commissionValue) } : v));
      toast.success('Commission updated');
      setEditingCommission(null);
    } catch {
      toast.error('Failed to update commission');
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div></div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Manage Vendors</h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="card p-4 text-center">
          <p className="text-2xl font-bold text-gray-900">{vendors.length}</p>
          <p className="text-sm text-gray-500">Total Vendors</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-2xl font-bold text-green-600">{vendors.filter(v => v.status === 'APPROVED').length}</p>
          <p className="text-sm text-gray-500">Approved</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-2xl font-bold text-yellow-600">{vendors.filter(v => v.status === 'PENDING').length}</p>
          <p className="text-sm text-gray-500">Pending</p>
        </div>
      </div>

      <div className="card overflow-hidden">
        {vendors.length === 0 ? (
          <div className="p-12 text-center text-gray-500">No vendors found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b text-left text-sm text-gray-500 bg-gray-50">
                  <th className="pb-3 px-6 pt-3 font-medium">Store</th>
                  <th className="pb-3 px-6 pt-3 font-medium">Contact</th>
                  <th className="pb-3 px-6 pt-3 font-medium">Products</th>
                  <th className="pb-3 px-6 pt-3 font-medium">Orders</th>
                  <th className="pb-3 px-6 pt-3 font-medium">Commission</th>
                  <th className="pb-3 px-6 pt-3 font-medium">Status</th>
                  <th className="pb-3 px-6 pt-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {vendors.map((vendor) => (
                  <tr key={vendor.id} className="text-sm hover:bg-gray-50">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full overflow-hidden shrink-0">
                          <SafeImage src={vendor.storeLogo} alt={vendor.storeName}
                            className="w-full h-full rounded-full object-cover" fallbackClass="text-lg bg-primary-100" />
                        </div>
                        <div>
                          <Link to={`/vendor/${vendor.storeSlug}`} className="font-medium text-gray-900 hover:text-primary-600">{vendor.storeName}</Link>
                          <p className="text-xs text-gray-400">{vendor.user?.firstName} {vendor.user?.lastName}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-gray-600">
                      <p className="text-xs">{vendor.user?.email || '-'}</p>
                      <p className="text-xs text-gray-400">{vendor.contactPhone || vendor.user?.phone || ''}</p>
                    </td>
                    <td className="py-4 px-6 text-gray-600">{vendor._count?.products || 0}</td>
                    <td className="py-4 px-6 text-gray-600">{vendor._count?.orders || 0}</td>
                    <td className="py-4 px-6">
                      {editingCommission === vendor.id ? (
                        <div className="flex items-center gap-1">
                          <input type="number" value={commissionValue} onChange={(e) => setCommissionValue(e.target.value)} className="input-field w-16 text-sm" autoFocus />
                          <span className="text-gray-400">%</span>
                          <button onClick={() => updateCommission(vendor.id)} className="text-primary-600 text-xs font-medium">Save</button>
                          <button onClick={() => setEditingCommission(null)} className="text-gray-400 text-xs">Cancel</button>
                        </div>
                      ) : (
                        <button onClick={() => { setEditingCommission(vendor.id); setCommissionValue(vendor.commissionRate || ''); }}
                          className="text-primary-600 hover:text-primary-800 font-medium">
                          {vendor.commissionRate ? `${vendor.commissionRate}%` : 'Set'}
                        </button>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        vendor.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                        vendor.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {vendor.status === 'APPROVED' ? 'Approved' : vendor.status === 'PENDING' ? 'Pending' : 'Suspended'}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex gap-2">
                        {vendor.status !== 'APPROVED' ? (
                          <button onClick={() => toggleApproval(vendor.id, vendor.status)}
                            className="text-sm text-green-600 hover:text-green-800 font-medium">
                            Approve
                          </button>
                        ) : (
                          <button onClick={() => toggleApproval(vendor.id, vendor.status)}
                            className="text-sm text-red-600 hover:text-red-800 font-medium">
                            Suspend
                          </button>
                        )}
                      </div>
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
