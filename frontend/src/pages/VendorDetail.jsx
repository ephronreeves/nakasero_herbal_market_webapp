import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../lib/api';

export default function VendorDetail() {
  const { slug } = useParams();
  const [vendor, setVendor] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/vendors/${slug}`)
      .then(({ data }) => {
        setVendor(data.vendor);
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <nav className="text-sm text-gray-500 mb-6">
        <Link to="/" className="hover:text-primary-600">Home</Link>
        <span className="mx-2">/</span>
        <Link to="/vendors" className="hover:text-primary-600">Vendors</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-900">{vendor.storeName}</span>
      </nav>

      <div className="card p-8 mb-8">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="w-24 h-24 shrink-0 bg-primary-100 rounded-full flex items-center justify-center text-4xl overflow-hidden">
            {vendor.storeLogo ? (
              <img src={vendor.storeLogo} alt={vendor.storeName} className="w-full h-full object-cover" />
            ) : '🏪'}
          </div>
          <div className="text-center sm:text-left">
            <h1 className="text-2xl font-bold text-gray-900">{vendor.storeName}</h1>
            {vendor.description && <p className="text-gray-600 mt-2 max-w-2xl">{vendor.description}</p>}
            <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-gray-500 justify-center sm:justify-start">
              <span>🌿 {products.length} products</span>
              {vendor.averageRating > 0 && <span>⭐ {vendor.averageRating.toFixed(1)}</span>}
              {vendor.verificationBadge && vendor.verificationBadge !== 'NONE' && (
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                  vendor.verificationBadge === 'PREMIUM' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                }`}>
                  {vendor.verificationBadge === 'PREMIUM' ? '⭐ Premium' : '✓ Verified'}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <h2 className="text-xl font-bold text-gray-900 mb-6">Products by {vendor.storeName}</h2>

      {products.length === 0 ? (
        <p className="text-gray-500 text-center py-12">No products yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <Link key={product.id} to={`/product/${product.slug}`} className="card group">
              <div className="aspect-square bg-gray-100 flex items-center justify-center overflow-hidden">
                {product.images?.[0] ? (
                  <img src={product.images[0].url} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                ) : (
                  <span className="text-4xl text-gray-300">🌿</span>
                )}
              </div>
              <div className="p-4">
                <p className="text-xs text-gray-500 uppercase">{product.category?.name}</p>
                <h3 className="font-medium text-gray-900 group-hover:text-primary-600 mt-1">{product.name}</h3>
                <div className="flex items-center mt-2">
                  <span className="text-lg font-bold text-primary-600">UGX {product.discountPrice || product.price}</span>
                  {product.discountPrice && <span className="ml-2 text-sm text-gray-400 line-through">UGX {product.price}</span>}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
