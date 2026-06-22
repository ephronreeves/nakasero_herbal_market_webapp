import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../lib/api';
import ProductQuickView from '../components/ProductQuickView';

export default function Home() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    Promise.all([
      api.get('/products?limit=8&sort=sales'),
      api.get('/categories'),
      api.get('/vendors'),
    ]).then(([productsRes, categoriesRes, vendorsRes]) => {
      setProducts(productsRes.data.products);
      setCategories(categoriesRes.data);
      setVendors(vendorsRes.data);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center min-h-[60vh]"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div></div>;
  }

  return (
    <div>
      <section className="bg-gradient-to-br from-primary-50 via-white to-herbal-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              Your Trusted{' '}
              <span className="text-primary-600">Herbal Marketplace</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Discover authentic herbal products from verified vendors. Natural health, trusted vendors.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/products" className="btn-primary text-lg px-8 py-3">Browse Products</Link>
              <Link to="/vendors" className="btn-secondary text-lg px-8 py-3">Explore Vendors</Link>
            </div>
          </div>
        </div>
      </section>

      {categories.length > 0 && (
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">Shop by Category</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {categories.map((cat) => (
                <Link key={cat.id} to={`/products?category=${cat.id}`}
                  className="card p-6 text-center hover:shadow-md transition-shadow group">
                  <div className="text-3xl mb-2">🌿</div>
                  <h3 className="font-medium text-gray-900 group-hover:text-primary-600">{cat.name}</h3>
                  <p className="text-sm text-gray-500 mt-1">{cat._count?.products || 0} products</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Popular Products</h2>
            <Link to="/products" className="text-primary-600 hover:text-primary-700 font-medium">View All</Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <div key={product.id} onClick={() => setSelectedProduct(product)} className="card group cursor-pointer">
                <div className="aspect-square bg-gray-100/70 flex items-center justify-center overflow-hidden">
                  {product.images?.[0] ? (
                    <img src={product.images[0].url} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  ) : (
                    <span className="text-4xl text-gray-300">🌿</span>
                  )}
                </div>
                <div className="p-4">
                  <p className="text-xs text-gray-500 uppercase">{product.vendor?.storeName}</p>
                  <h3 className="font-medium text-gray-900 mt-1 group-hover:text-primary-600">{product.name}</h3>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-lg font-bold text-primary-600">
                      UGX {product.discountPrice || product.price}
                    </span>
                    {product.discountPrice && (
                      <span className="text-sm text-gray-400 line-through">UGX {product.price}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {vendors.length > 0 && (
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-gray-900">Trusted Vendors</h2>
              <Link to="/vendors" className="text-primary-600 hover:text-primary-700 font-medium">All Vendors</Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {vendors.map((vendor) => (
                <Link key={vendor.id} to={`/vendor/${vendor.storeSlug}`} className="card p-6 text-center hover:shadow-md transition-shadow">
                  <div className="w-16 h-16 mx-auto bg-primary-100 rounded-full flex items-center justify-center text-2xl mb-3">
                    {vendor.storeLogo ? <img src={vendor.storeLogo} className="w-full h-full rounded-full object-cover" /> : '🏪'}
                  </div>
                  <h3 className="font-medium text-gray-900">{vendor.storeName}</h3>
                  <p className="text-sm text-gray-500 mt-1">{vendor._count?.products || 0} products</p>
                  {vendor.verificationBadge !== 'NONE' && (
                    <span className="badge-success mt-2 inline-block">{vendor.verificationBadge === 'PREMIUM' ? '⭐ Premium' : '✓ Verified'}</span>
                  )}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Become a Vendor</h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Join Emiti Dagala and reach customers looking for authentic herbal medicine products.
          </p>
          <Link to="/register" className="btn-primary text-lg px-8 py-3">Register as Vendor</Link>
        </div>
      </section>

      {selectedProduct && (
        <ProductQuickView product={selectedProduct} onClose={() => setSelectedProduct(null)} />
      )}
    </div>
  );
}
