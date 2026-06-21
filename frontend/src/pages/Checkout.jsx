import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../lib/api';
import toast from 'react-hot-toast';

const paymentMethods = [
  { id: 'MTN_MOBILE_MONEY', name: 'MTN Mobile Money', type: 'mobile_money', logo: '/api/uploads/logos/mtn-momo-mobile-money.png', icon: '📱', description: 'Pay using MTN MoMo' },
  { id: 'AIRTEL_MONEY', name: 'Airtel Money', type: 'mobile_money', logo: '/api/uploads/logos/airtel-money.jpg', icon: '📱', description: 'Pay using Airtel Money' },
  { id: 'VISA', name: 'Visa Card', type: 'card', logo: null, icon: '💳', description: 'Pay with Visa credit/debit card' },
  { id: 'APPLE_PAY', name: 'Apple Pay', type: 'wallet', logo: null, icon: '🍎', description: 'Pay using Apple Pay' },
];

export default function Checkout() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('MTN_MOBILE_MONEY');
  const [phone, setPhone] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
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
  const isMobileMoney = paymentMethod === 'MTN_MOBILE_MONEY' || paymentMethod === 'AIRTEL_MONEY';
  const isCard = paymentMethod === 'VISA';

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (isMobileMoney && !phone) {
      toast.error('Please enter your phone number');
      return;
    }
    if (isCard && (!cardNumber || !cardName || !cardExpiry || !cardCvv)) {
      toast.error('Please fill in all card details');
      return;
    }
    setPlacing(true);
    try {
      const payload = {
        paymentMethod,
        items: items.map((item) => ({ productId: item.product.id, quantity: item.quantity })),
      };
      if (isMobileMoney) payload.phone = phone;
      if (isCard) {
        payload.cardDetails = {
          lastFour: cardNumber.slice(-4),
          name: cardName,
        };
      }

      const { data } = await api.post('/orders', payload);
      setOrderPlaced(data.order);
      toast.success('Order placed successfully!');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to place order');
    } finally {
      setPlacing(false);
    }
  };

  const paymentInstructions = {
    MTN_MOBILE_MONEY: (
      <div className="bg-gray-50 p-3 rounded-lg text-sm space-y-1">
        <p>1. Dial <strong>*165#</strong> on your phone</p>
        <p>2. Select <strong>Send Money</strong></p>
        <p>3. Enter <strong>the merchant number</strong> provided</p>
        <p>4. Enter amount: <strong>UGX {orderPlaced?.total?.toLocaleString()}</strong></p>
        <p>5. Enter your PIN to confirm</p>
      </div>
    ),
    AIRTEL_MONEY: (
      <div className="bg-gray-50 p-3 rounded-lg text-sm space-y-1">
        <p>1. Dial <strong>*185#</strong> on your phone</p>
        <p>2. Select <strong>Send Money</strong></p>
        <p>3. Enter <strong>the merchant number</strong> provided</p>
        <p>4. Enter amount: <strong>UGX {orderPlaced?.total?.toLocaleString()}</strong></p>
        <p>5. Enter your PIN to confirm</p>
      </div>
    ),
    VISA: (
      <div className="bg-gray-50 p-3 rounded-lg text-sm space-y-1">
        <p>Your Visa card ending in <strong>{orderPlaced?.paymentReference?.slice(-4) || '****'}</strong> will be charged.</p>
        <p>Amount: <strong>UGX {orderPlaced?.total?.toLocaleString()}</strong></p>
      </div>
    ),
    APPLE_PAY: (
      <div className="bg-gray-50 p-3 rounded-lg text-sm space-y-1">
        <p>Complete payment using <strong>Apple Pay</strong> on your device.</p>
        <p>Amount: <strong>UGX {orderPlaced?.total?.toLocaleString()}</strong></p>
        <p>Double-click the side button to confirm.</p>
      </div>
    ),
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-[60vh]"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div></div>;
  }

  if (orderPlaced) {
    const method = paymentMethods.find(m => m.id === orderPlaced.paymentMethod || m.id === paymentMethod);
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <span className="text-6xl mb-4 block">✅</span>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Order Placed!</h1>
        <p className="text-gray-600 mb-6">Your order #{orderPlaced.orderNumber} has been placed successfully.</p>
        <div className="card p-6 mb-6 text-left">
          <h3 className="font-medium text-gray-900 mb-2">Payment Instructions</h3>
          <p className="text-gray-600 text-sm mb-2">
            Please complete payment using <strong>{method?.name || paymentMethod}</strong> to confirm your order.
          </p>
          {paymentInstructions[paymentMethod] || paymentInstructions['MTN_MOBILE_MONEY']}
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
                {paymentMethods.map((method) => (
                  <label key={method.id} className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${paymentMethod === method.id ? 'border-primary-500 bg-primary-50 ring-2 ring-primary-200' : 'hover:bg-gray-50'}`}>
                    <input type="radio" name="payment" value={method.id} checked={paymentMethod === method.id}
                      onChange={(e) => setPaymentMethod(e.target.value)} className="mr-3 accent-primary-600" />
                    {method.logo ? (
                      <img src={method.logo} alt={method.name} className="w-12 h-8 object-contain mr-2 rounded" />
                    ) : (
                      <span className="text-xl mr-2">{method.icon}</span>
                    )}
                    <div>
                      <span className="font-medium text-gray-900">{method.name}</span>
                      <p className="text-sm text-gray-500">{method.description}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {isMobileMoney && (
              <div className="card p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">{paymentMethod === 'MTN_MOBILE_MONEY' ? 'MTN' : 'Airtel'} Mobile Money</h2>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                  <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="e.g. 0772123456" className="input-field" required={isMobileMoney} />
                </div>
              </div>
            )}

            {isCard && (
              <div className="card p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Visa Card Details</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Card Number</label>
                    <input type="text" value={cardNumber} onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim())} placeholder="4111 1111 1111 1111" className="input-field" maxLength={19} required={isCard} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Cardholder Name</label>
                    <input type="text" value={cardName} onChange={(e) => setCardName(e.target.value)} placeholder="John Doe" className="input-field" required={isCard} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                      <input type="text" value={cardExpiry} onChange={(e) => {
                        let val = e.target.value.replace(/\D/g, '');
                        if (val.length >= 2) val = val.slice(0, 2) + '/' + val.slice(2);
                        setCardExpiry(val);
                      }} placeholder="MM/YY" className="input-field" maxLength={5} required={isCard} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">CVV</label>
                      <input type="text" value={cardCvv} onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, ''))} placeholder="123" className="input-field" maxLength={4} required={isCard} />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {paymentMethod === 'APPLE_PAY' && (
              <div className="card p-6 text-center">
                <span className="text-5xl mb-3 block">🍎</span>
                <h2 className="text-lg font-bold text-gray-900 mb-2">Apple Pay</h2>
                <p className="text-sm text-gray-500 mb-4">Pay securely with Apple Pay on your iPhone, iPad, or Mac.</p>
                <div className="bg-gray-50 p-4 rounded-lg text-sm text-gray-600">
                  <p>After placing your order, confirm payment using Face ID, Touch ID, or your device passcode.</p>
                </div>
              </div>
            )}
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
                      <span className="font-medium text-gray-900">UGX {(price * item.quantity).toLocaleString()}</span>
                    </div>
                  );
                })}
              </div>
              <hr className="mb-4" />
              <div className="space-y-2 text-sm mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>UGX {subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-bold text-gray-900 text-base">
                  <span>Total</span>
                  <span>UGX {subtotal.toLocaleString()}</span>
                </div>
              </div>
              <button type="submit" disabled={placing} className="btn-primary w-full flex items-center justify-center gap-2">
                {placing ? 'Placing Order...' : (
                  <>{paymentMethods.find(m => m.id === paymentMethod)?.icon} Pay UGX {subtotal.toLocaleString()}</>
                )}
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
