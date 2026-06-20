import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../lib/api';

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/categories')
      .then(({ data }) => setCategories(data.categories || data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center min-h-[60vh]"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div></div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Categories</h1>
      <p className="text-gray-500 mb-8">Browse herbal products by category</p>

      {categories.length === 0 ? (
        <div className="text-center py-20 text-gray-500">No categories found.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {categories.map((cat) => (
            <Link key={cat.id} to={`/products?category=${cat.id}`}
              className="card p-8 text-center hover:shadow-md transition-shadow group">
              <div className="text-4xl mb-4">🌿</div>
              <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary-600">{cat.name}</h3>
              {cat.description && <p className="text-sm text-gray-500 mt-2">{cat.description}</p>}
              <p className="text-sm text-gray-400 mt-3">{cat._count?.products || 0} products</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
