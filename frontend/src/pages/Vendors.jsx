import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../lib/api';

export default function Vendors() {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/vendors')
      .then(({ data }) => setVendors(data.vendors || data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center min-h-[60vh]"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div></div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Our Vendors</h1>
      <p className="text-gray-500 mb-8">Discover trusted herbal medicine providers</p>

      {vendors.length === 0 ? (
        <div className="text-center py-20 text-gray-500">No vendors found.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {vendors.map((vendor) => (
            <Link key={vendor.id} to={`/vendor/${vendor.storeSlug}`} className="card p-6 text-center hover:shadow-md transition-shadow group">
              <div className="w-20 h-20 mx-auto bg-primary-100 rounded-full flex items-center justify-center text-3xl mb-4 overflow-hidden">
                {vendor.storeLogo ? (
                  <img src={vendor.storeLogo} alt={vendor.storeName} className="w-full h-full object-cover" />
                ) : '🏪'}
              </div>
              <h3 className="font-semibold text-gray-900 group-hover:text-primary-600">{vendor.storeName}</h3>
              {vendor.description && <p className="text-sm text-gray-500 mt-2 line-clamp-2">{vendor.description}</p>}
              <div className="flex items-center justify-center gap-2 mt-3 text-sm text-gray-500">
                <span>🌿 {vendor._count?.products || 0} products</span>
                {vendor.averageRating > 0 && <span>⭐ {vendor.averageRating.toFixed(1)}</span>}
              </div>
              {vendor.verificationBadge && vendor.verificationBadge !== 'NONE' && (
                <span className={`mt-3 inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                  vendor.verificationBadge === 'PREMIUM' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                }`}>
                  {vendor.verificationBadge === 'PREMIUM' ? '⭐ Premium' : '✓ Verified'}
                </span>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
