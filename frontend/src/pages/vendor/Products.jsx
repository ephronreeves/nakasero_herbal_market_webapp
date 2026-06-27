import { useState, useEffect, useMemo } from 'react';
import api from '../../lib/api';
import SafeImage from '../../components/SafeImage';
import toast from 'react-hot-toast';

const mockProducts = [
  { id: '1', name: 'Moringa Powder', price: 15000, discountPrice: 12000, stock: 45, isApproved: true, category: { name: 'Supplements' }, images: [] },
  { id: '2', name: 'Ginger Tea Bags', price: 8000, stock: 3, isApproved: true, category: { name: 'Teas' }, images: [] },
  { id: '3', name: 'Turmeric Capsules', price: 25000, stock: 8, isApproved: false, category: { name: 'Supplements' }, images: [] },
  { id: '4', name: 'Neem Oil - 100ml', price: 18000, stock: 20, isApproved: true, category: { name: 'Oils' }, images: [] },
  { id: '5', name: 'Shea Butter Pure', price: 22000, stock: 0, isApproved: true, category: { name: 'Skincare' }, images: [] },
  { id: '6', name: 'Hibiscus Flower Tea', price: 10000, discountPrice: 8500, stock: 30, isApproved: true, category: { name: 'Teas' }, images: [] },
  { id: '7', name: 'Black Seed Oil', price: 28000, stock: 12, isApproved: false, category: { name: 'Oils' }, images: [] },
  { id: '8', name: 'Aloe Vera Gel', price: 16000, stock: 25, isApproved: true, category: { name: 'Skincare' }, images: [] },
];

const sortOptions = [
  { value: 'newest', label: 'Newest' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'name_asc', label: 'Name: A to Z' },
  { value: 'name_desc', label: 'Name: Z to A' },
];

export default function VendorProducts() {
  const [products, setProducts] = useState(mockProducts);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({
    name: '', description: '', price: '', discountPrice: '', categoryId: '',
    ingredients: '', usageInstructions: '', dosage: '', warnings: '', expiryDate: '',
    stock: '0', images: [],
  });
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [sort, setSort] = useState('newest');

  useEffect(() => {
    Promise.all([
      api.get('/vendor/products').catch(() => ({ data: { products: mockProducts } })),
      api.get('/categories').catch(() => ({ data: { categories: [] } })),
    ]).then(([productsRes, categoriesRes]) => {
      setProducts(productsRes.data.products || []);
      setCategories(categoriesRes.data.categories || categoriesRes.data || []);
    }).catch(() => {})
    .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    let result = [...products];

    if (search) {
      const q = search.toLowerCase();
      result = result.filter((p) => p.name.toLowerCase().includes(q));
    }

    if (categoryFilter) {
      result = result.filter((p) => p.category?.id === categoryFilter || p.category?.name === categoryFilter);
    }

    switch (sort) {
      case 'price_asc': result.sort((a, b) => (a.discountPrice || a.price) - (b.discountPrice || b.price)); break;
      case 'price_desc': result.sort((a, b) => (b.discountPrice || b.price) - (a.discountPrice || a.price)); break;
      case 'name_asc': result.sort((a, b) => a.name.localeCompare(b.name)); break;
      case 'name_desc': result.sort((a, b) => b.name.localeCompare(a.name)); break;
      default: break;
    }

    return result;
  }, [products, search, categoryFilter, sort]);

  const resetForm = () => {
    setForm({ name: '', description: '', price: '', discountPrice: '', categoryId: '', ingredients: '', usageInstructions: '', dosage: '', warnings: '', expiryDate: '', stock: '0', images: [] });
    setEditing(null);
    setShowForm(false);
  };

  const handleEdit = (product) => {
    setForm({
      name: product.name, description: product.description || '', price: product.price, discountPrice: product.discountPrice || '',
      categoryId: product.categoryId || '', ingredients: product.ingredients || '', usageInstructions: product.usageInstructions || '',
      dosage: product.dosage || '', warnings: product.warnings || '', expiryDate: product.expiryDate ? product.expiryDate.split('T')[0] : '',
      stock: product.stock, images: product.images?.map((i) => i.url) || [],
    });
    setEditing(product.id);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form, price: Number(form.price), discountPrice: form.discountPrice ? Number(form.discountPrice) : null, stock: Number(form.stock) };
      if (editing) {
        await api.put(`/vendor/products/${editing}`, payload);
        toast.success('Product updated');
      } else {
        await api.post('/vendor/products', payload);
        toast.success('Product created');
      }
      resetForm();
      const { data } = await api.get('/vendor/products');
      setProducts(data.products || []);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      await api.delete(`/vendor/products/${id}`);
      setProducts((prev) => prev.filter((p) => p.id !== id));
      toast.success('Product deleted');
    } catch {
      toast.error('Failed to delete product');
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div></div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Products</h1>
        <button onClick={() => { resetForm(); setShowForm(true); }} className="btn-primary">Add Product</button>
      </div>

      <div className="card p-4 mb-6">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex-1 min-w-[200px]">
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products by name..." className="input-field w-full" />
          </div>
          <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="input-field w-auto">
            <option value="">All Categories</option>
            {categories.map((cat) => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
          </select>
          <select value={sort} onChange={(e) => setSort(e.target.value)} className="input-field w-auto">
            {sortOptions.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </select>
          {(search || categoryFilter || sort !== 'newest') && (
            <button onClick={() => { setSearch(''); setCategoryFilter(''); setSort('newest'); }}
              className="text-sm text-gray-500 hover:text-gray-700">Clear</button>
          )}
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center overflow-y-auto py-8" onClick={(e) => e.target === e.currentTarget && resetForm()}>
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl mx-4 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold">{editing ? 'Edit Product' : 'New Product'}</h2>
              <button onClick={resetForm} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Product Name *</label>
                  <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-field" required />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input-field" rows={3} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price (UGX) *</label>
                  <input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="input-field" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Discount Price</label>
                  <input type="number" value={form.discountPrice} onChange={(e) => setForm({ ...form, discountPrice: e.target.value })} className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                  <select value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })} className="input-field" required>
                    <option value="">Select category</option>
                    {categories.map((cat) => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stock *</label>
                  <input type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} className="input-field" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ingredients</label>
                  <textarea value={form.ingredients} onChange={(e) => setForm({ ...form, ingredients: e.target.value })} className="input-field" rows={2} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Usage Instructions</label>
                  <textarea value={form.usageInstructions} onChange={(e) => setForm({ ...form, usageInstructions: e.target.value })} className="input-field" rows={2} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Dosage</label>
                  <input type="text" value={form.dosage} onChange={(e) => setForm({ ...form, dosage: e.target.value })} className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Warnings</label>
                  <textarea value={form.warnings} onChange={(e) => setForm({ ...form, warnings: e.target.value })} className="input-field" rows={2} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                  <input type="date" value={form.expiryDate} onChange={(e) => setForm({ ...form, expiryDate: e.target.value })} className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Image URLs (comma separated)</label>
                  <input type="text" value={form.images.join(', ')} onChange={(e) => setForm({ ...form, images: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) })} className="input-field" />
                </div>
              </div>
              <div className="flex gap-3 justify-end pt-4">
                <button type="button" onClick={resetForm} className="btn-secondary">Cancel</button>
                <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Saving...' : editing ? 'Update Product' : 'Create Product'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="card p-12 text-center text-gray-500">
          <span className="text-6xl mb-4 block">🔍</span>
          <p className="text-lg mb-2">No products found</p>
          <p className="text-sm text-gray-400 mb-4">Try adjusting your search or filter</p>
          <button onClick={() => { setSearch(''); setCategoryFilter(''); setSort('newest'); }} className="btn-secondary">Clear Filters</button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b text-left text-sm text-gray-500">
                <th className="pb-3 font-medium">Product</th>
                <th className="pb-3 font-medium">Price</th>
                <th className="pb-3 font-medium">Stock</th>
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map((product) => (
                <tr key={product.id} className="text-sm">
                  <td className="py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                        {product.images?.[0] ? <SafeImage src={product.images[0].url} alt={product.name} className="w-full h-full object-cover" fallbackClass="text-lg" /> : <div className="w-full h-full flex items-center justify-center text-lg text-gray-300">🌿</div>}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{product.name}</p>
                        <p className="text-gray-400 text-xs">{product.category?.name}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 text-gray-900 font-medium">UGX {product.discountPrice || product.price}</td>
                  <td className="py-4">
                    <span className={product.stock <= 5 ? 'text-red-600 font-medium' : 'text-gray-600'}>{product.stock}</span>
                  </td>
                  <td className="py-4">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${product.isApproved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                      {product.isApproved ? 'Approved' : 'Pending'}
                    </span>
                  </td>
                  <td className="py-4">
                    <div className="flex gap-2">
                      <button onClick={() => handleEdit(product)} className="text-primary-600 hover:text-primary-800 text-sm">Edit</button>
                      <button onClick={() => handleDelete(product.id)} className="text-red-500 hover:text-red-700 text-sm">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
