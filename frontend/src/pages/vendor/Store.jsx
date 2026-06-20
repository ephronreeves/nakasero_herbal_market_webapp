import { useState, useEffect } from 'react';
import api from '../../lib/api';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';

export default function VendorStore() {
  const { user } = useAuth();
  const [form, setForm] = useState({
    storeName: '', storeSlug: '', storeLogo: '', storeBanner: '',
    description: '', phone: '', email: '', address: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get('/vendor/store')
      .then(({ data }) => {
        const store = data.store || data;
        setForm({
          storeName: store.storeName || user?.storeName || '',
          storeSlug: store.storeSlug || '',
          storeLogo: store.storeLogo || '',
          storeBanner: store.storeBanner || '',
          description: store.description || '',
          phone: store.phone || '',
          email: store.email || '',
          address: store.address || '',
        });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put('/vendor/store', form);
      toast.success('Store settings updated');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update store');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div></div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Store Settings</h1>

      <form onSubmit={handleSubmit} className="card p-6 space-y-6 max-w-2xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Store Name *</label>
            <input type="text" name="storeName" value={form.storeName} onChange={handleChange} className="input-field" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Store Slug</label>
            <input type="text" name="storeSlug" value={form.storeSlug} onChange={handleChange} className="input-field" />
            <p className="text-xs text-gray-400 mt-1">URL: /vendor/{form.storeSlug || 'your-slug'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Store Logo URL</label>
            <input type="url" name="storeLogo" value={form.storeLogo} onChange={handleChange} className="input-field" />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Store Banner URL</label>
            <input type="url" name="storeBanner" value={form.storeBanner} onChange={handleChange} className="input-field" />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea name="description" value={form.description} onChange={handleChange} className="input-field" rows={4} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input type="tel" name="phone" value={form.phone} onChange={handleChange} className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input type="email" name="email" value={form.email} onChange={handleChange} className="input-field" />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
            <input type="text" name="address" value={form.address} onChange={handleChange} className="input-field" />
          </div>
        </div>

        <div className="flex justify-end">
          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
