import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../lib/api';
import SafeImage from '../../components/SafeImage';

export default function CustomerWishlist() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/wishlist')
      .then(({ data }) => setItems(data.items || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const removeFromWishlist = async (productId) => {
    try {
      await api.delete(`/wishlist/${productId}`);
      setItems((prev) => prev.filter((item) => (item.product?.id || item.id) !== productId));
      toast.success('Removed from wishlist');
    } catch {
      toast.error('Failed to remove');
    }
  };

  const addToCart = async (product) => {
    try {
      await api.post('/cart', { productId: product.id, quantity: 1 });
      toast.success('Added to cart');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to add to cart');
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div></div>;
  }

  const products = items.map((item) => item.product || item);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">My Wishlist</h1>

      {products.length === 0 ? (
        <div className="card p-12 text-center">
          <span className="text-6xl mb-4 block">❤️</span>
          <p className="text-gray-500 text-lg mb-4">Your wishlist is empty</p>
          <Link to="/products" className="btn-primary">Browse Products</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <div key={product.id} className="card group">
              <Link to={`/product/${product.slug}`}>
                <div className="aspect-square bg-gray-100/70 flex items-center justify-center overflow-hidden">
                  <SafeImage src={product.images?.[0]?.url} alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                </div>
              </Link>
              <div className="p-4">
                <Link to={`/product/${product.slug}`} className="font-medium text-gray-900 hover:text-primary-600">{product.name}</Link>
                <div className="flex items-center mt-1">
                  <span className="text-lg font-bold text-primary-600">UGX {product.discountPrice || product.price}</span>
                  {product.discountPrice && <span className="ml-2 text-sm text-gray-400 line-through">UGX {product.price}</span>}
                </div>
                <div className="flex gap-2 mt-4">
                  <button onClick={() => addToCart(product)} className="btn-primary flex-1 text-sm">Add to Cart</button>
                  <button onClick={() => removeFromWishlist(product.id)} className="btn-secondary text-sm">Remove</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
