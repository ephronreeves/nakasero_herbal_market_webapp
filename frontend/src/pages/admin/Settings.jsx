import { useState, useEffect } from 'react';
import api from '../../lib/api';
import toast from 'react-hot-toast';

export default function AdminSettings() {
  const [form, setForm] = useState({
    platformName: '', supportEmail: '', supportPhone: '', defaultCommission: '',
    currency: 'UGX', featuredCategories: '', aboutUs: '', termsAndConditions: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get('/admin/settings')
      .then(({ data }) => {
        const s = data.settings || data;
        setForm({
          platformName: s.platformName || 'Emiti Dagala',
          supportEmail: s.supportEmail || '',
          supportPhone: s.supportPhone || '',
          defaultCommission: s.defaultCommission || '',
          currency: s.currency || 'UGX',
          featuredCategories: s.featuredCategories?.join(', ') || '',
          aboutUs: s.aboutUs || '',
          termsAndConditions: s.termsAndConditions || '',
        });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        defaultCommission: form.defaultCommission ? Number(form.defaultCommission) : null,
        featuredCategories: form.featuredCategories.split(',').map((s) => s.trim()).filter(Boolean),
      };
      await api.put('/admin/settings', payload);
      toast.success('Settings updated');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div></div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Platform Settings</h1>

      <form onSubmit={handleSubmit} className="card p-6 space-y-6 max-w-2xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Platform Name</label>
            <input type="text" name="platformName" value={form.platformName} onChange={handleChange} className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
            <input type="text" name="currency" value={form.currency} onChange={handleChange} className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Support Email</label>
            <input type="email" name="supportEmail" value={form.supportEmail} onChange={handleChange} className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Support Phone</label>
            <input type="tel" name="supportPhone" value={form.supportPhone} onChange={handleChange} className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Default Commission (%)</label>
            <input type="number" name="defaultCommission" value={form.defaultCommission} onChange={handleChange} className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Featured Categories (IDs, comma)</label>
            <input type="text" name="featuredCategories" value={form.featuredCategories} onChange={handleChange} className="input-field" />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">About Us</label>
            <textarea name="aboutUs" value={form.aboutUs} onChange={handleChange} className="input-field" rows={4} />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Terms & Conditions</label>
            <textarea name="termsAndConditions" value={form.termsAndConditions} onChange={handleChange} className="input-field" rows={4} />
          </div>
        </div>

        <div className="flex justify-end">
          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </form>
    </div>
  );
}
