import { useState, useEffect, useMemo } from 'react';
import api from '../../lib/api';
import SafeImage from '../../components/SafeImage';
import toast from 'react-hot-toast';

const mockInventory = [
  { id: '1', name: 'Moringa Powder', price: 15000, discountPrice: 12000, stock: 45, expiryDate: '2027-06-01', images: [{ url: '' }] },
  { id: '2', name: 'Ginger Tea Bags', price: 8000, stock: 3, expiryDate: '2026-08-15', images: [{ url: '' }] },
  { id: '3', name: 'Turmeric Capsules', price: 25000, stock: 8, expiryDate: '2027-03-10', images: [{ url: '' }] },
  { id: '4', name: 'Neem Oil - 100ml', price: 18000, stock: 20, expiryDate: '2027-01-20', images: [{ url: '' }] },
  { id: '5', name: 'Shea Butter Pure', price: 22000, stock: 0, expiryDate: null, images: [{ url: '' }] },
  { id: '6', name: 'Hibiscus Flower Tea', price: 10000, discountPrice: 8500, stock: 30, expiryDate: '2026-12-05', images: [{ url: '' }] },
  { id: '7', name: 'Black Seed Oil', price: 28000, stock: 12, expiryDate: '2026-07-10', images: [{ url: '' }] },
  { id: '8', name: 'Aloe Vera Gel', price: 16000, stock: 25, expiryDate: '2026-09-18', images: [{ url: '' }] },
  { id: '9', name: 'Raw Honey - 500g', price: 35000, stock: 0, expiryDate: '2028-01-01', images: [{ url: '' }] },
  { id: '10', name: 'Eucalyptus Oil', price: 20000, stock: 4, expiryDate: '2026-07-25', images: [{ url: '' }] },
];

export default function VendorInventory() {
  const [products, setProducts] = useState(mockInventory);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [editingStock, setEditingStock] = useState(null);
  const [stockValue, setStockValue] = useState('');

  useEffect(() => {
    api.get('/vendor/inventory')
      .then(({ data }) => {
        const items = data.products || data.inventory || [];
        if (items.length) setProducts(items);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    let result = [...products];

    if (search) {
      const q = search.toLowerCase();
      result = result.filter((p) => p.name.toLowerCase().includes(q));
    }

    result = result.filter((p) => {
      if (filter === 'low') return p.stock > 0 && p.stock <= 5;
      if (filter === 'expiring') return p.expiryDate && new Date(p.expiryDate) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      if (filter === 'out') return p.stock === 0;
      return true;
    });

    return result;
  }, [products, search, filter]);

  const updateStock = async (productId) => {
    try {
      await api.patch(`/vendor/products/${productId}`, { stock: Number(stockValue) });
      setProducts((prev) => prev.map((p) => p.id === productId ? { ...p, stock: Number(stockValue) } : p));
      toast.success('Stock updated');
      setEditingStock(null);
    } catch {
      toast.error('Failed to update stock');
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div></div>;
  }

  const lowStock = products.filter((p) => p.stock > 0 && p.stock <= 5).length;
  const outOfStock = products.filter((p) => p.stock === 0).length;
  const expiring = products.filter((p) => p.expiryDate && new Date(p.expiryDate) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)).length;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Inventory</h1>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
        <div className="card p-4">
          <p className="text-sm text-gray-500">Total Products</p>
          <p className="text-2xl font-bold text-gray-900">{products.length}</p>
        </div>
        <div className="card p-4 border-yellow-200">
          <p className="text-sm text-yellow-600">Low Stock (≤5)</p>
          <p className="text-2xl font-bold text-yellow-700">{lowStock}</p>
        </div>
        <div className="card p-4 border-red-200">
          <p className="text-sm text-red-600">Out of Stock</p>
          <p className="text-2xl font-bold text-red-700">{outOfStock}</p>
        </div>
        <div className="card p-4 border-orange-200">
          <p className="text-sm text-orange-600">Expiring Soon</p>
          <p className="text-2xl font-bold text-orange-700">{expiring}</p>
        </div>
      </div>

      <div className="card">
        <div className="p-4 border-b flex flex-wrap items-center gap-3">
          <div className="flex-1 min-w-[200px]">
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products by name..." className="input-field w-full" />
          </div>
          <div className="flex items-center gap-2 overflow-x-auto">
            {['all', 'low', 'out', 'expiring'].map((f) => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap ${filter === f ? 'bg-primary-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
                {f === 'all' ? 'All' : f === 'low' ? 'Low Stock' : f === 'out' ? 'Out of Stock' : 'Expiring Soon'}
              </button>
            ))}
          </div>
          {(search || filter !== 'all') && (
            <button onClick={() => { setSearch(''); setFilter('all'); }}
              className="text-sm text-gray-500 hover:text-gray-700">Clear</button>
          )}
        </div>

        {filtered.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <span className="text-4xl mb-3 block">🔍</span>
            <p>No products match your search or filter.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b text-left text-sm text-gray-500">
                  <th className="pb-3 px-6 font-medium">Product</th>
                  <th className="pb-3 px-6 font-medium">Stock</th>
                  <th className="pb-3 px-6 font-medium">Price</th>
                  <th className="pb-3 px-6 font-medium">Expiry</th>
                  <th className="pb-3 px-6 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filtered.map((product) => (
                  <tr key={product.id} className="text-sm">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                          {product.images?.[0]?.url ? <SafeImage src={product.images[0].url} alt={product.name} className="w-full h-full object-cover" fallbackClass="text-lg" /> : <div className="w-full h-full flex items-center justify-center text-lg text-gray-300">🌿</div>}
                        </div>
                        <span className="font-medium text-gray-900">{product.name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      {editingStock === product.id ? (
                        <div className="flex items-center gap-2">
                          <input type="number" value={stockValue} onChange={(e) => setStockValue(e.target.value)} className="input-field w-20 text-sm" autoFocus />
                          <button onClick={() => updateStock(product.id)} className="text-primary-600 text-sm">Save</button>
                          <button onClick={() => setEditingStock(null)} className="text-gray-400 text-sm">Cancel</button>
                        </div>
                      ) : (
                        <span className={`font-medium ${product.stock === 0 ? 'text-red-600' : product.stock <= 5 ? 'text-yellow-600' : 'text-gray-900'}`}>
                          {product.stock}
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-gray-600">UGX {product.discountPrice || product.price}</td>
                    <td className="py-4 px-6">
                      {product.expiryDate ? (
                        <span className={new Date(product.expiryDate) <= new Date() ? 'text-red-600' : new Date(product.expiryDate) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) ? 'text-orange-600' : 'text-gray-600'}>
                          {new Date(product.expiryDate).toLocaleDateString()}
                        </span>
                      ) : '-'}
                    </td>
                    <td className="py-4 px-6">
                      <button onClick={() => { setEditingStock(product.id); setStockValue(product.stock); }} className="text-primary-600 hover:text-primary-800 text-sm">Update Stock</button>
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
