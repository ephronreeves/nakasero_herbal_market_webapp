import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import SafeImage from '../components/SafeImage';

export default function Cart() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    api.get('/cart')
      .then(({ data }) => setItems(data || []))
      .catch(() => toast.error('Failed to load cart'))
      .finally(() => setLoading(false));
  }, [user]);

  const updateQuantity = async (itemId, quantity) => {
    if (quantity < 1) return;
    setUpdating(itemId);
    try {
      await api.patch(`/cart/${itemId}`, { quantity });
      setItems((prev) => prev.map((item) => item.id === itemId ? { ...item, quantity } : item));
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update');
    } finally {
      setUpdating(null);
    }
  };

  const removeItem = async (itemId) => {
    setUpdating(itemId);
    try {
      await api.delete(`/cart/${itemId}`);
      setItems((prev) => prev.filter((item) => item.id !== itemId));
      toast.success('Item removed');
    } catch {
      toast.error('Failed to remove item');
    } finally {
      setUpdating(null);
    }
  };

  const subtotal = items.reduce((sum, item) => sum + (item.product.discountPrice || item.product.price) * item.quantity, 0);

  if (loading) {
    return <div className="flex items-center justify-center min-h-[60vh]"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div></div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Shopping Cart</h1>

      {items.length === 0 ? (
        <div className="text-center py-20">
          <span className="text-6xl mb-4 block">🛒</span>
          <p className="text-gray-500 text-lg mb-4">Your cart is empty</p>
          <Link to="/products" className="btn-primary">Browse Products</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => {
              const price = item.product.discountPrice || item.product.price;
              return (
                <div key={item.id} className="card p-4 flex gap-4">
                  <Link to={`/product/${item.product.slug}`} className="w-24 h-24 shrink-0 bg-gray-100 rounded-lg overflow-hidden">
                  <SafeImage src={item.product.images?.[0]?.url} alt={item.product.name}
                    className="w-full h-full object-cover" fallbackClass="text-2xl" />
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link to={`/product/${item.product.slug}`} className="font-medium text-gray-900 hover:text-primary-600">{item.product.name}</Link>
                    <p className="text-sm text-gray-500 mt-1">UGX {price}</p>
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center border rounded-lg">
                        <button onClick={() => updateQuantity(item.id, item.quantity - 1)} disabled={updating === item.id || item.quantity <= 1}
                          className="px-3 py-1 text-gray-600 hover:bg-gray-100 disabled:opacity-50">-</button>
                        <span className="px-4 py-1 font-medium">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, item.quantity + 1)} disabled={updating === item.id}
                          className="px-3 py-1 text-gray-600 hover:bg-gray-100 disabled:opacity-50">+</button>
                      </div>
                      <button onClick={() => removeItem(item.id)} disabled={updating === item.id}
                        className="text-sm text-red-500 hover:text-red-700 disabled:opacity-50">Remove</button>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-bold text-gray-900">UGX {price * item.quantity}</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="card p-6 h-fit">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Order Summary</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal ({items.length} items)</span>
                <span>UGX {subtotal}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span>Calculated at checkout</span>
              </div>
              <hr className="my-2" />
              <div className="flex justify-between font-bold text-gray-900 text-base">
                <span>Total</span>
                <span>UGX {subtotal}</span>
              </div>
            </div>
            <Link to="/checkout" className="btn-primary w-full mt-6 text-center block">Proceed to Checkout</Link>
            <Link to="/products" className="btn-secondary w-full mt-2 text-center block">Continue Shopping</Link>
          </div>
        </div>
      )}
    </div>
  );
}
