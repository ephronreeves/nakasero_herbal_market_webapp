import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../lib/api';

function parseStoreDescription(text) {
  if (!text) return { about: '', specialties: '', hours: '' };
  const parts = text.split('\n\n');
  return {
    about: parts[1] || parts[0] || '',
    specialties: (parts.find(p => p.startsWith('Specialties:')) || '').replace('Specialties:', '').trim(),
    hours: (parts.find(p => p.startsWith('Hours:')) || '').replace('Hours:', '').trim(),
  };
}

const banners = {
  'nakasero-spice-house': 'from-amber-50 via-orange-50 to-yellow-50',
  'kampala-grain-seed-co': 'from-green-50 via-emerald-50 to-teal-50',
  'jinja-herbal-remedies': 'from-sky-50 via-blue-50 to-indigo-50',
};

export default function VendorDetail() {
  const { slug } = useParams();
  const [vendor, setVendor] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/vendors/${slug}`)
      .then(({ data }) => {
        setVendor(data);
        setProducts(data.products || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return <div className="flex items-center justify-center min-h-[60vh]"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div></div>;
  }

  if (!vendor) {
    return <div className="max-w-7xl mx-auto px-4 py-16 text-center text-gray-500">Vendor not found.</div>;
  }

  const info = parseStoreDescription(vendor.storeDescription);
  const gradient = banners[vendor.storeSlug] || 'from-gray-50 to-white';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <nav className="text-sm text-gray-500 mb-6">
        <Link to="/" className="hover:text-primary-600">Home</Link>
        <span className="mx-2">/</span>
        <Link to="/vendors" className="hover:text-primary-600">Vendors</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-900">{vendor.storeName}</span>
      </nav>

      <div className={`bg-gradient-to-br ${gradient} rounded-xl p-8 sm:p-12 mb-8 border`}>
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="w-28 h-28 shrink-0 bg-white shadow-md rounded-full flex items-center justify-center text-5xl overflow-hidden ring-4 ring-white">
            {vendor.storeLogo ? (
              <img src={vendor.storeLogo} alt={vendor.storeName} className="w-full h-full object-cover" />
            ) : (
              vendor.storeSlug === 'nakasero-spice-house' ? '🌶️' :
              vendor.storeSlug === 'kampala-grain-seed-co' ? '🌾' :
              vendor.storeSlug === 'jinja-herbal-remedies' ? '🌿' : '🏪'
            )}
          </div>
          <div className="text-center sm:text-left">
            <h1 className="text-3xl font-bold text-gray-900">{vendor.storeName}</h1>
            <p className="text-gray-600 mt-2 max-w-2xl text-lg">
              {vendor.storeDescription?.split('\n')[0] || 'Trusted vendor on Emiti Dagala'}
            </p>
            <div className="flex flex-wrap items-center gap-4 mt-4 text-sm justify-center sm:justify-start">
              <span className="flex items-center gap-1 text-gray-500">🌿 {products.length} products</span>
              {vendor.verificationBadge !== 'NONE' && (
                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${
                  vendor.verificationBadge === 'PREMIUM' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                }`}>
                  {vendor.verificationBadge === 'PREMIUM' ? '⭐ Premium Vendor' : '✓ Verified Vendor'}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="card p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span>📖</span> About {vendor.storeName}
            </h2>
            <p className="text-gray-600 leading-relaxed">{info.about}</p>
          </div>

          {info.specialties && (
            <div className="card p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span>⭐</span> Specialties
              </h2>
              <div className="flex flex-wrap gap-2">
                {info.specialties.split(',').map((s, i) => (
                  <span key={i} className="px-3 py-1.5 bg-primary-50 text-primary-700 rounded-full text-sm font-medium">
                    {s.trim()}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="card p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span>📞</span> Contact
            </h2>
            <div className="space-y-3 text-sm">
              {vendor.contactPhone && (
                <div className="flex items-start gap-3">
                  <span className="text-gray-400 mt-0.5">📱</span>
                  <div>
                    <p className="font-medium text-gray-700">Phone</p>
                    <a href={`tel:${vendor.contactPhone}`} className="text-primary-600 hover:underline">{vendor.contactPhone}</a>
                  </div>
                </div>
              )}
              {vendor.contactEmail && (
                <div className="flex items-start gap-3">
                  <span className="text-gray-400 mt-0.5">✉️</span>
                  <div>
                    <p className="font-medium text-gray-700">Email</p>
                    <a href={`mailto:${vendor.contactEmail}`} className="text-primary-600 hover:underline">{vendor.contactEmail}</a>
                  </div>
                </div>
              )}
              {(vendor.address || vendor.city) && (
                <div className="flex items-start gap-3">
                  <span className="text-gray-400 mt-0.5">📍</span>
                  <div>
                    <p className="font-medium text-gray-700">Address</p>
                    <p className="text-gray-600">{vendor.address}{vendor.city ? `, ${vendor.city}` : ''}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {info.hours && (
            <div className="card p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span>🕐</span> Hours
              </h2>
              <p className="text-gray-600 text-sm">{info.hours}</p>
            </div>
          )}
        </div>
      </div>

      <div className="mt-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <span>🛍️</span> Products by {vendor.storeName}
        </h2>

        {products.length === 0 ? (
          <p className="text-gray-500 text-center py-12">No products yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <Link key={product.id} to={`/product/${product.slug}`} className="card group hover:shadow-lg transition-shadow">
                <div className="aspect-square bg-gray-100 flex items-center justify-center overflow-hidden">
                  {product.images?.[0] ? (
                    <img src={product.images[0].url} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  ) : (
                    <span className="text-4xl text-gray-300">🌿</span>
                  )}
                </div>
                <div className="p-4">
                  <p className="text-xs text-gray-500 uppercase tracking-wide">{product.category?.name}</p>
                  <h3 className="font-medium text-gray-900 group-hover:text-primary-600 mt-1">{product.name}</h3>
                  <div className="flex items-center mt-2">
                    <span className="text-lg font-bold text-primary-600">UGX {(product.discountPrice || product.price).toLocaleString()}</span>
                    {product.discountPrice && <span className="ml-2 text-sm text-gray-400 line-through">UGX {product.price.toLocaleString()}</span>}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
