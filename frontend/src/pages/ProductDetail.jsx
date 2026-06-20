import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../lib/api';
import toast from 'react-hot-toast';

export default function ProductDetail() {
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [reviewText, setReviewText] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    setLoading(true);
    api.get(`/products/${slug}`)
      .then(({ data }) => {
        setProduct(data.product);
        setRelated(data.related || []);
      })
      .catch(() => toast.error('Failed to load product'))
      .finally(() => setLoading(false));
  }, [slug]);

  const handleAddToCart = async () => {
    setAdding(true);
    try {
      await api.post('/cart', { productId: product.id, quantity });
      toast.success('Added to cart');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to add to cart');
    } finally {
      setAdding(false);
    }
  };

  const handleReview = async (e) => {
    e.preventDefault();
    setSubmittingReview(true);
    try {
      const { data } = await api.post(`/products/${product.id}/reviews`, { rating: reviewRating, text: reviewText });
      setProduct((prev) => ({
        ...prev,
        reviews: [data.review, ...prev.reviews],
        _count: { ...prev._count, reviews: (prev._count?.reviews || 0) + 1 },
        averageRating: data.averageRating,
      }));
      setReviewText('');
      setReviewRating(5);
      toast.success('Review submitted');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-[60vh]"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div></div>;
  }

  if (!product) {
    return <div className="max-w-7xl mx-auto px-4 py-16 text-center text-gray-500">Product not found.</div>;
  }

  const images = product.images?.length ? product.images : [{ url: null }];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <nav className="text-sm text-gray-500 mb-6">
        <Link to="/" className="hover:text-primary-600">Home</Link>
        <span className="mx-2">/</span>
        <Link to="/products" className="hover:text-primary-600">Products</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-900">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        <div>
          <div className="aspect-square bg-gray-100 rounded-xl overflow-hidden mb-4">
            {images[selectedImage]?.url ? (
              <img src={images[selectedImage].url} alt={product.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-6xl text-gray-300">🌿</div>
            )}
          </div>
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {images.map((img, i) => (
                <button key={i} onClick={() => setSelectedImage(i)}
                  className={`w-20 h-20 shrink-0 rounded-lg overflow-hidden border-2 ${i === selectedImage ? 'border-primary-500' : 'border-transparent'}`}>
                  {img.url ? <img src={img.url} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full bg-gray-100 flex items-center justify-center text-xl text-gray-300">🌿</div>}
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <p className="text-sm text-gray-500 uppercase mb-1">{product.category?.name}</p>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">{product.name}</h1>

          <div className="flex items-center gap-4 mb-4">
            <span className="text-3xl font-bold text-primary-600">UGX {product.discountPrice || product.price}</span>
            {product.discountPrice && <span className="text-lg text-gray-400 line-through">UGX {product.price}</span>}
          </div>

          {product.averageRating > 0 && (
            <p className="text-sm text-gray-600 mb-4">{'⭐'.repeat(Math.round(product.averageRating))} {product.averageRating.toFixed(1)} ({product._count?.reviews || 0} reviews)</p>
          )}

          <p className="text-gray-600 mb-6 leading-relaxed">{product.description}</p>

          {product.ingredients && (
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-gray-900">Ingredients</h3>
              <p className="text-gray-600">{product.ingredients}</p>
            </div>
          )}

          {product.usageInstructions && (
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-gray-900">Usage Instructions</h3>
              <p className="text-gray-600">{product.usageInstructions}</p>
            </div>
          )}

          {product.dosage && (
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-gray-900">Dosage</h3>
              <p className="text-gray-600">{product.dosage}</p>
            </div>
          )}

          {product.warnings && (
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h3 className="text-sm font-semibold text-yellow-800">⚠ Warnings</h3>
              <p className="text-sm text-yellow-700">{product.warnings}</p>
            </div>
          )}

          {product.expiryDate && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-900">Expiry Date</h3>
              <p className="text-gray-600">{new Date(product.expiryDate).toLocaleDateString()}</p>
            </div>
          )}

          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center border rounded-lg">
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-3 py-2 text-gray-600 hover:bg-gray-100">-</button>
              <span className="px-4 py-2 font-medium">{quantity}</span>
              <button onClick={() => setQuantity(quantity + 1)} className="px-3 py-2 text-gray-600 hover:bg-gray-100">+</button>
            </div>
            <button onClick={handleAddToCart} disabled={adding} className="btn-primary flex-1">
              {adding ? 'Adding...' : 'Add to Cart'}
            </button>
          </div>

          {product.vendor && (
            <Link to={`/vendor/${product.vendor.storeSlug}`} className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center text-xl">
                {product.vendor.storeLogo ? <img src={product.vendor.storeLogo} className="w-full h-full rounded-full object-cover" /> : '🏪'}
              </div>
              <div>
                <p className="text-sm text-gray-500">Sold by</p>
                <p className="font-medium text-gray-900">{product.vendor.storeName}</p>
              </div>
            </Link>
          )}
        </div>
      </div>

      <div className="mb-12">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Reviews ({product._count?.reviews || 0})</h2>

        <form onSubmit={handleReview} className="card p-6 mb-6">
          <h3 className="font-medium text-gray-900 mb-3">Write a Review</h3>
          <div className="flex items-center gap-1 mb-3">
            {[1, 2, 3, 4, 5].map((star) => (
              <button key={star} type="button" onClick={() => setReviewRating(star)}
                className={`text-2xl ${star <= reviewRating ? 'text-yellow-400' : 'text-gray-300'}`}>★</button>
            ))}
          </div>
          <textarea value={reviewText} onChange={(e) => setReviewText(e.target.value)} placeholder="Share your experience..." className="input-field mb-3" rows={3} required />
          <button type="submit" disabled={submittingReview} className="btn-primary">
            {submittingReview ? 'Submitting...' : 'Submit Review'}
          </button>
        </form>

        <div className="space-y-4">
          {product.reviews?.length > 0 ? product.reviews.map((review) => (
            <div key={review.id} className="card p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-900">{review.user?.name || 'Anonymous'}</span>
                  <span className="text-yellow-400">{'★'.repeat(review.rating)}</span>
                </div>
                <span className="text-sm text-gray-400">{new Date(review.createdAt).toLocaleDateString()}</span>
              </div>
              <p className="text-gray-600">{review.text}</p>
            </div>
          )) : <p className="text-gray-500 text-center py-8">No reviews yet.</p>}
        </div>
      </div>

      {related.length > 0 && (
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-6">Related Products</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {related.map((p) => (
              <Link key={p.id} to={`/product/${p.slug}`} className="card group">
                <div className="aspect-square bg-gray-100 flex items-center justify-center overflow-hidden">
                  {p.images?.[0] ? (
                    <img src={p.images[0].url} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  ) : (
                    <span className="text-4xl text-gray-300">🌿</span>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-medium text-gray-900 group-hover:text-primary-600">{p.name}</h3>
                  <span className="text-lg font-bold text-primary-600">UGX {p.discountPrice || p.price}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
