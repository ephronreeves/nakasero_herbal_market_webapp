import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../lib/api';
import toast from 'react-hot-toast';

export default function Checkout() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('MTN_MOBILE_MONEY');
  const [phone, setPhone] = useState('');
  const [orderPlaced, setOrderPlaced] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/cart')
      .then(({ data }) => {
        if (!data.items?.length) {
          navigate('/cart');
          return;
        }
        setItems(data.items);
      })
      .catch(() => toast.error('Failed to load cart'))
      .finally(() => setLoading(false));
  }, [navigate]);

  const subtotal = items.reduce((sum, item) => sum + (item.product.discountPrice || item.product.price) * item.quantity, 0);

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!phone) {
      toast.error('Please enter your phone number');
      return;
    }
    setPlacing(true);
    try {
      const { data } = await api.post('/orders', {
        paymentMethod,
        phone,
        items: items.map((item) => ({ productId: item.product.id, quantity: item.quantity })),
      });
      setOrderPlaced(data.order);
      toast.success('Order placed successfully!');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to place order');
    } finally {
      setPlacing(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-[60vh]"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div></div>;
  }

  if (orderPlaced) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <span className="text-6xl mb-4 block">✅</span>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Order Placed!</h1>
        <p className="text-gray-600 mb-6">Your order #{orderPlaced.orderNumber} has been placed successfully.</p>
        <div className="card p-6 mb-6 text-left">
          <h3 className="font-medium text-gray-900 mb-2">Payment Instructions</h3>
          <p className="text-gray-600 text-sm mb-2">
            Please complete payment using <strong>MTN Mobile Money</strong> to confirm your order.
          </p>
          <div className="bg-gray-50 p-3 rounded-lg text-sm space-y-1">
            <p>1. Dial <strong>*165#</strong> on your phone</p>
            <p>2. Select <strong>Send Money</strong></p>
            <p>3. Enter <strong>the merchant number</strong> provided</p>
            <p>4. Enter amount: <strong>UGX {orderPlaced.total}</strong></p>
            <p>5. Enter your PIN to confirm</p>
          </div>
          {orderPlaced.paymentReference && (
            <p className="text-sm text-gray-500 mt-2">Reference: {orderPlaced.paymentReference}</p>
          )}
        </div>
        <div className="flex gap-3 justify-center">
          <Link to="/dashboard/orders" className="btn-primary">View My Orders</Link>
          <Link to="/products" className="btn-secondary">Continue Shopping</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Checkout</h1>

      <form onSubmit={handlePlaceOrder}>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-3 space-y-6">
            <div className="card p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Payment Method</h2>
              <div className="space-y-3">
                <label className={`flex items-center p-4 border rounded-lg cursor-pointer ${paymentMethod === 'MTN_MOBILE_MONEY' ? 'border-primary-500 bg-primary-50' : 'hover:bg-gray-50'}`}>
                  <input type="radio" name="payment" value="MTN_MOBILE_MONEY" checked={paymentMethod === 'MTN_MOBILE_MONEY'}
                    onChange={(e) => setPaymentMethod(e.target.value)} className="mr-3" />
                  <div>
                    <span className="font-medium text-gray-900">MTN Mobile Money</span>
                    <p className="text-sm text-gray-500">Pay using MTN MoMo</p>
                  </div>
                </label>
              </div>
            </div>

            <div className="card p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Phone Number</h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Money Phone Number</label>
                <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="e.g. 0772123456" className="input-field" required />
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="card p-6 sticky top-24">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Order Summary</h2>
              <div className="space-y-3 max-h-64 overflow-y-auto mb-4">
                {items.map((item) => {
                  const price = item.product.discountPrice || item.product.price;
                  return (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-gray-600 truncate mr-2">{item.product.name} × {item.quantity}</span>
                      <span className="font-medium text-gray-900">UGX {price * item.quantity}</span>
                    </div>
                  );
                })}
              </div>
              <hr className="mb-4" />
              <div className="space-y-2 text-sm mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>UGX {subtotal}</span>
                </div>
                <div className="flex justify-between font-bold text-gray-900 text-base">
                  <span>Total</span>
                  <span>UGX {subtotal}</span>
                </div>
              </div>
              <button type="submit" disabled={placing} className="btn-primary w-full">
                {placing ? 'Placing Order...' : `Pay UGX ${subtotal}`}
              </button>
              <p className="text-xs text-gray-400 text-center mt-3">
                By placing this order, you agree to our terms and conditions.
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
