import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../lib/api';

export default function Products() {
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, total: 0, pages: 1 });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    minPrice: '',
    maxPrice: '',
    sort: 'sales',
    page: 1,
  });

  useEffect(() => {
    api.get('/categories').then(({ data }) => setCategories(data)).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filters.category) params.set('category', filters.category);
    if (filters.minPrice) params.set('minPrice', filters.minPrice);
    if (filters.maxPrice) params.set('maxPrice', filters.maxPrice);
    if (filters.sort) params.set('sort', filters.sort);
    params.set('page', filters.page);
    params.set('limit', '20');

    api.get(`/products?${params.toString()}`)
      .then(({ data }) => {
        setProducts(data.products);
        setPagination(data.pagination);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [filters]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Products</h1>

      <div className="flex flex-col lg:flex-row gap-8">
        <aside className="lg:w-64 shrink-0">
          <div className="card p-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select value={filters.category} onChange={(e) => setFilters({ ...filters, category: e.target.value, page: 1 })} className="input-field">
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price Range</label>
              <div className="flex gap-2">
                <input type="number" placeholder="Min" value={filters.minPrice} onChange={(e) => setFilters({ ...filters, minPrice: e.target.value, page: 1 })} className="input-field" />
                <input type="number" placeholder="Max" value={filters.maxPrice} onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value, page: 1 })} className="input-field" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
              <select value={filters.sort} onChange={(e) => setFilters({ ...filters, sort: e.target.value })} className="input-field">
                <option value="sales">Best Selling</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="name_asc">Name: A-Z</option>
                <option value="rating">Highest Rated</option>
                <option value="newest">Newest</option>
              </select>
            </div>
          </div>
        </aside>

        <div className="flex-1">
          {loading ? (
            <div className="flex items-center justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div></div>
          ) : products.length === 0 ? (
            <div className="text-center py-20 text-gray-500">No products found.</div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
                      {product._count?.reviews > 0 && (
                        <p className="text-sm text-gray-500 mt-1">{product.averageRating} ⭐ ({product._count.reviews})</p>
                      )}
                    </div>
                  </Link>
                ))}
              </div>

              {pagination.pages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-8">
                  <button onClick={() => setFilters({ ...filters, page: filters.page - 1 })} disabled={filters.page <= 1} className="btn-secondary text-sm">Previous</button>
                  {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((p) => (
                    <button key={p} onClick={() => setFilters({ ...filters, page: p })}
                      className={`px-3 py-1.5 text-sm rounded-lg ${filters.page === p ? 'bg-primary-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>{p}</button>
                  ))}
                  <button onClick={() => setFilters({ ...filters, page: filters.page + 1 })} disabled={filters.page >= pagination.pages} className="btn-secondary text-sm">Next</button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
