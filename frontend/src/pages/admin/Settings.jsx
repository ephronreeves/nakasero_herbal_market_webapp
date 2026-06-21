import { useState, useEffect } from 'react';
import api from '../../lib/api';
import toast from 'react-hot-toast';

const defaultPaymentMethods = [
  { id: 'MTN_MOBILE_MONEY', name: 'MTN Mobile Money', icon: '📱', logo: '/api/uploads/logos/mtn-momo-mobile-money.png' },
  { id: 'AIRTEL_MONEY', name: 'Airtel Money', icon: '📱', logo: '/api/uploads/logos/airtel-money.jpg' },
  { id: 'VISA', name: 'Visa Card', icon: '💳', logo: null },
  { id: 'APPLE_PAY', name: 'Apple Pay', icon: '🍎', logo: null },
];

export default function AdminSettings() {
  const [form, setForm] = useState({
    platformName: '', supportEmail: '', supportPhone: '', defaultCommission: '',
    currency: 'UGX', featuredCategories: '', aboutUs: '', termsAndConditions: '',
    maintenanceMode: false,
    facebookUrl: '', twitterUrl: '', instagramUrl: '',
    deliveryFee: '', freeDeliveryThreshold: '',
    metaTitle: '', metaDescription: '',
    enabledPaymentMethods: ['MTN_MOBILE_MONEY', 'AIRTEL_MONEY', 'VISA', 'APPLE_PAY'],
  });
  const [activeTab, setActiveTab] = useState('general');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get('/admin/settings')
      .then(({ data }) => {
        const s = data.settings || data;
        setForm({
          platformName: s.platformName || s.platform_name || 'Emiti Dagala',
          supportEmail: s.supportEmail || s.support_email || '',
          supportPhone: s.supportPhone || s.support_phone || '',
          defaultCommission: s.defaultCommission ?? s.default_commission_rate ?? '',
          currency: s.currency || 'UGX',
          featuredCategories: Array.isArray(s.featuredCategories || s.featured_categories) ? (s.featuredCategories || s.featured_categories).join(', ') : '',
          aboutUs: s.aboutUs || s.about_us || '',
          termsAndConditions: s.termsAndConditions || s.terms_and_conditions || '',
          maintenanceMode: s.maintenanceMode || s.maintenance_mode || false,
          facebookUrl: s.facebookUrl || s.facebook_url || '',
          twitterUrl: s.twitterUrl || s.twitter_url || '',
          instagramUrl: s.instagramUrl || s.instagram_url || '',
          deliveryFee: s.deliveryFee ?? s.delivery_fee ?? '',
          freeDeliveryThreshold: s.freeDeliveryThreshold ?? s.free_delivery_threshold ?? '',
          metaTitle: s.metaTitle || s.meta_title || '',
          metaDescription: s.metaDescription || s.meta_description || '',
          enabledPaymentMethods: s.enabledPaymentMethods || s.enabled_payment_methods || ['MTN_MOBILE_MONEY', 'AIRTEL_MONEY', 'VISA', 'APPLE_PAY'],
        });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm({ ...form, [e.target.name]: value });
  };

  const togglePaymentMethod = (methodId) => {
    setForm((prev) => ({
      ...prev,
      enabledPaymentMethods: prev.enabledPaymentMethods.includes(methodId)
        ? prev.enabledPaymentMethods.filter((m) => m !== methodId)
        : [...prev.enabledPaymentMethods, methodId],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        platform_name: form.platformName,
        support_email: form.supportEmail,
        support_phone: form.supportPhone,
        default_commission_rate: form.defaultCommission ? Number(form.defaultCommission) : null,
        currency: form.currency,
        featured_categories: form.featuredCategories.split(',').map((s) => s.trim()).filter(Boolean),
        about_us: form.aboutUs,
        terms_and_conditions: form.termsAndConditions,
        maintenance_mode: form.maintenanceMode,
        facebook_url: form.facebookUrl,
        twitter_url: form.twitterUrl,
        instagram_url: form.instagramUrl,
        delivery_fee: form.deliveryFee ? Number(form.deliveryFee) : null,
        free_delivery_threshold: form.freeDeliveryThreshold ? Number(form.freeDeliveryThreshold) : null,
        meta_title: form.metaTitle,
        meta_description: form.metaDescription,
        enabled_payment_methods: form.enabledPaymentMethods,
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

  const tabs = [
    { id: 'general', label: 'General' },
    { id: 'payments', label: 'Payments' },
    { id: 'delivery', label: 'Delivery' },
    { id: 'social', label: 'Social' },
    { id: 'seo', label: 'SEO' },
    { id: 'advanced', label: 'Advanced' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Platform Settings</h1>

      <div className="mb-6 border-b border-gray-200">
        <nav className="flex space-x-4 overflow-x-auto -mb-px">
          {tabs.map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`whitespace-nowrap py-3 px-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-primary-600 text-primary-700'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      <form onSubmit={handleSubmit} className="card p-6 space-y-6 max-w-2xl">
        {activeTab === 'general' && (
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
        )}

        {activeTab === 'payments' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Payment Methods</h3>
            <p className="text-sm text-gray-500">Enable or disable payment methods available at checkout.</p>
            <div className="space-y-3">
              {defaultPaymentMethods.map((method) => (
                <label key={method.id} className="flex items-center justify-between p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3">
                    {method.logo ? (
                      <img src={method.logo} alt={method.name} className="w-10 h-7 object-contain rounded" />
                    ) : (
                      <span className="text-xl">{method.icon}</span>
                    )}
                    <div>
                      <span className="font-medium text-gray-900">{method.name}</span>
                    </div>
                  </div>
                  <div className="relative">
                    <input type="checkbox" checked={form.enabledPaymentMethods.includes(method.id)}
                      onChange={() => togglePaymentMethod(method.id)} className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-primary-600 after:content-[''] after:absolute after:top-0.5 after:start-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full" />
                  </div>
                </label>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'delivery' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <h3 className="sm:col-span-2 text-lg font-semibold text-gray-900">Delivery Settings</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Fee (UGX)</label>
              <input type="number" name="deliveryFee" value={form.deliveryFee} onChange={handleChange} placeholder="e.g. 5000" className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Free Delivery Threshold (UGX)</label>
              <input type="number" name="freeDeliveryThreshold" value={form.freeDeliveryThreshold} onChange={handleChange} placeholder="e.g. 100000" className="input-field" />
            </div>
          </div>
        )}

        {activeTab === 'social' && (
          <div className="grid grid-cols-1 gap-4">
            <h3 className="text-lg font-semibold text-gray-900">Social Media Links</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Facebook URL</label>
              <input type="url" name="facebookUrl" value={form.facebookUrl} onChange={handleChange} placeholder="https://facebook.com/emitidagala" className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Twitter / X URL</label>
              <input type="url" name="twitterUrl" value={form.twitterUrl} onChange={handleChange} placeholder="https://twitter.com/emitidagala" className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Instagram URL</label>
              <input type="url" name="instagramUrl" value={form.instagramUrl} onChange={handleChange} placeholder="https://instagram.com/emitidagala" className="input-field" />
            </div>
          </div>
        )}

        {activeTab === 'seo' && (
          <div className="grid grid-cols-1 gap-4">
            <h3 className="text-lg font-semibold text-gray-900">SEO Settings</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Meta Title</label>
              <input type="text" name="metaTitle" value={form.metaTitle} onChange={handleChange} placeholder="Emiti Dagala - Trusted Herbal Marketplace" className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Meta Description</label>
              <textarea name="metaDescription" value={form.metaDescription} onChange={handleChange} placeholder="Discover authentic herbal products..." className="input-field" rows={3} />
            </div>
          </div>
        )}

        {activeTab === 'advanced' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Advanced Settings</h3>
            <label className="flex items-center justify-between p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
              <div>
                <span className="font-medium text-gray-900">Maintenance Mode</span>
                <p className="text-sm text-gray-500">When enabled, only admins can access the platform.</p>
              </div>
              <div className="relative">
                <input type="checkbox" name="maintenanceMode" checked={form.maintenanceMode} onChange={handleChange} className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-primary-600 after:content-[''] after:absolute after:top-0.5 after:start-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full" />
              </div>
            </label>
          </div>
        )}

        <div className="flex justify-end pt-4 border-t">
          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </form>
    </div>
  );
}
