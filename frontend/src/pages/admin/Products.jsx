import { useState, useEffect } from 'react';
import api from '../../lib/api';
import SafeImage from '../../components/SafeImage';
import toast from 'react-hot-toast';

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/products')
      .then(({ data }) => setProducts(data.products || []))
      .catch(() => toast.error('Failed to load products'))
      .finally(() => setLoading(false));
  }, []);

  const toggleApproval = async (productId, approve) => {
    try {
      await api.patch(`/admin/products/${productId}`, { isApproved: approve });
      setProducts((prev) => prev.map((p) => p.id === productId ? { ...p, isApproved: approve } : p));
      toast.success(`Product ${approve ? 'approved' : 'rejected'}`);
    } catch {
      toast.error('Failed to update product');
    }
  };

  const handleDelete = async (productId) => {
    if (!confirm('Delete this product permanently?')) return;
    try {
      await api.delete(`/admin/products/${productId}`);
      setProducts((prev) => prev.filter((p) => p.id !== productId));
      toast.success('Product deleted');
    } catch {
      toast.error('Failed to delete product');
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div></div>;
  }

  const pending = products.filter((p) => !p.isApproved);
  const approved = products.filter((p) => p.isApproved);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Product Moderation</h1>

      {pending.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Pending Approval ({pending.length})</h2>
          <div className="space-y-3">
            {pending.map((product) => (
              <div key={product.id} className="card p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                    {product.images?.[0] ? <SafeImage src={product.images[0].url} alt={product.name} className="w-full h-full object-cover" fallbackClass="text-xl" /> : <div className="w-full h-full flex items-center justify-center text-xl text-gray-300">🌿</div>}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{product.name}</p>
                    <p className="text-sm text-gray-500">{product.vendor?.storeName} · UGX {product.discountPrice || product.price}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => toggleApproval(product.id, true)} className="btn-primary text-sm">Approve</button>
                  <button onClick={() => toggleApproval(product.id, false)} className="btn-secondary text-sm text-red-600">Reject</button>
                  <button onClick={() => handleDelete(product.id)} className="btn-secondary text-sm text-red-600">Delete</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <h2 className="text-lg font-bold text-gray-900 mb-4">All Products ({products.length})</h2>
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b text-left text-sm text-gray-500 bg-gray-50">
                  <th className="pb-3 px-6 pt-3 font-medium">Product</th>
                  <th className="pb-3 px-6 pt-3 font-medium">Vendor</th>
                  <th className="pb-3 px-6 pt-3 font-medium">Price</th>
                  <th className="pb-3 px-6 pt-3 font-medium">Status</th>
                  <th className="pb-3 px-6 pt-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {approved.map((product) => (
                  <tr key={product.id} className="text-sm">
                    <td className="py-4 px-6">{product.name}</td>
                    <td className="py-4 px-6 text-gray-600">{product.vendor?.storeName}</td>
                    <td className="py-4 px-6">UGX {product.discountPrice || product.price}</td>
                    <td className="py-4 px-6">
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Approved</span>
                    </td>
                    <td className="py-4 px-6">
                      <button onClick={() => toggleApproval(product.id, false)} className="text-red-600 hover:text-red-800 text-sm">Reject</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
