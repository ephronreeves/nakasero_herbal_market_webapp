import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../lib/api';

export default function Search() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query) return;
    setLoading(true);
    api.get(`/products?search=${encodeURIComponent(query)}`)
      .then(({ data }) => setProducts(data.products || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [query]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Search Results</h1>
      <p className="text-gray-500 mb-8">
        {query ? `Showing results for "${query}"` : 'Enter a search term to find products'}
      </p>

      {!query ? (
        <div className="text-center py-20 text-gray-400">
          <span className="text-6xl mb-4 block">🔍</span>
          <p>Search for herbal products, ingredients, or vendors</p>
        </div>
      ) : loading ? (
        <div className="flex items-center justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div></div>
      ) : products.length === 0 ? (
        <div className="text-center py-20">
          <span className="text-6xl mb-4 block">🔍</span>
          <p className="text-gray-500 text-lg">No products found for "{query}"</p>
          <p className="text-gray-400 mt-2">Try a different search term</p>
        </div>
      ) : (
        <>
          <p className="text-sm text-gray-500 mb-4">{products.length} result{products.length !== 1 ? 's' : ''} found</p>
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
                  <p className="text-xs text-gray-500 uppercase mb-1">{product.vendor?.storeName}</p>
                  <h3 className="font-medium text-gray-900 group-hover:text-primary-600">{product.name}</h3>
                  <div className="flex items-center mt-2">
                    <span className="text-lg font-bold text-primary-600">UGX {product.discountPrice || product.price}</span>
                    {product.discountPrice && <span className="ml-2 text-sm text-gray-400 line-through">UGX {product.price}</span>}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
