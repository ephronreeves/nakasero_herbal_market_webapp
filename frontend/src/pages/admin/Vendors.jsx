import { useState, useEffect } from 'react';
import api from '../../lib/api';
import toast from 'react-hot-toast';

export default function AdminVendors() {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingCommission, setEditingCommission] = useState(null);
  const [commissionValue, setCommissionValue] = useState('');

  useEffect(() => {
    api.get('/admin/vendors')
      .then(({ data }) => setVendors(data.vendors || []))
      .catch(() => toast.error('Failed to load vendors'))
      .finally(() => setLoading(false));
  }, []);

  const toggleApproval = async (vendorId, currentStatus) => {
    try {
      await api.patch(`/admin/vendors/${vendorId}`, { isApproved: !currentStatus });
      setVendors((prev) => prev.map((v) => v.id === vendorId ? { ...v, isApproved: !currentStatus } : v));
      toast.success(`Vendor ${currentStatus ? 'suspended' : 'approved'}`);
    } catch {
      toast.error('Failed to update vendor');
    }
  };

  const updateCommission = async (vendorId) => {
    try {
      await api.patch(`/admin/vendors/${vendorId}`, { commission: Number(commissionValue) });
      setVendors((prev) => prev.map((v) => v.id === vendorId ? { ...v, commission: Number(commissionValue) } : v));
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

      <div className="card overflow-hidden">
        {vendors.length === 0 ? (
          <div className="p-12 text-center text-gray-500">No vendors found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b text-left text-sm text-gray-500 bg-gray-50">
                  <th className="pb-3 px-6 pt-3 font-medium">Store</th>
                  <th className="pb-3 px-6 pt-3 font-medium">Email</th>
                  <th className="pb-3 px-6 pt-3 font-medium">Products</th>
                  <th className="pb-3 px-6 pt-3 font-medium">Commission</th>
                  <th className="pb-3 px-6 pt-3 font-medium">Status</th>
                  <th className="pb-3 px-6 pt-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {vendors.map((vendor) => (
                  <tr key={vendor.id} className="text-sm">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center text-lg overflow-hidden shrink-0">
                          {vendor.storeLogo ? <img src={vendor.storeLogo} className="w-full h-full object-cover" /> : '🏪'}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{vendor.storeName}</p>
                          <p className="text-xs text-gray-400">{vendor.user?.name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-gray-600">{vendor.user?.email || '-'}</td>
                    <td className="py-4 px-6 text-gray-600">{vendor._count?.products || 0}</td>
                    <td className="py-4 px-6">
                      {editingCommission === vendor.id ? (
                        <div className="flex items-center gap-2">
                          <input type="number" value={commissionValue} onChange={(e) => setCommissionValue(e.target.value)} className="input-field w-20 text-sm" autoFocus />
                          <button onClick={() => updateCommission(vendor.id)} className="text-primary-600 text-sm">Save</button>
                          <button onClick={() => setEditingCommission(null)} className="text-gray-400 text-sm">Cancel</button>
                        </div>
                      ) : (
                        <button onClick={() => { setEditingCommission(vendor.id); setCommissionValue(vendor.commission || ''); }}
                          className="text-primary-600 hover:text-primary-800">
                          {vendor.commission ? `${vendor.commission}%` : 'Set'}
                        </button>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${vendor.isApproved ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {vendor.isApproved ? 'Approved' : 'Suspended'}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex gap-2">
                        <button onClick={() => toggleApproval(vendor.id, vendor.isApproved)}
                          className={`text-sm ${vendor.isApproved ? 'text-red-600 hover:text-red-800' : 'text-green-600 hover:text-green-800'}`}>
                          {vendor.isApproved ? 'Suspend' : 'Approve'}
                        </button>
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
