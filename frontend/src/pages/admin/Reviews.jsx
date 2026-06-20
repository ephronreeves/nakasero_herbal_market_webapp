import { useState, useEffect } from 'react';
import api from '../../lib/api';
import toast from 'react-hot-toast';

export default function AdminReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/reviews')
      .then(({ data }) => setReviews(data.reviews || []))
      .catch(() => toast.error('Failed to load reviews'))
      .finally(() => setLoading(false));
  }, []);

  const updateVisibility = async (reviewId, hidden) => {
    try {
      await api.patch(`/admin/reviews/${reviewId}`, { hidden });
      setReviews((prev) => prev.map((r) => r.id === reviewId ? { ...r, hidden } : r));
      toast.success(`Review ${hidden ? 'hidden' : 'shown'}`);
    } catch {
      toast.error('Failed to update review');
    }
  };

  const handleDelete = async (reviewId) => {
    if (!confirm('Delete this review permanently?')) return;
    try {
      await api.delete(`/admin/reviews/${reviewId}`);
      setReviews((prev) => prev.filter((r) => r.id !== reviewId));
      toast.success('Review deleted');
    } catch {
      toast.error('Failed to delete review');
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div></div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Review Moderation</h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="card p-4">
          <p className="text-sm text-gray-500">Total Reviews</p>
          <p className="text-2xl font-bold text-gray-900">{reviews.length}</p>
        </div>
        <div className="card p-4">
          <p className="text-sm text-gray-500">Visible</p>
          <p className="text-2xl font-bold text-green-700">{reviews.filter((r) => !r.hidden).length}</p>
        </div>
        <div className="card p-4">
          <p className="text-sm text-gray-500">Hidden</p>
          <p className="text-2xl font-bold text-red-700">{reviews.filter((r) => r.hidden).length}</p>
        </div>
      </div>

      {reviews.length === 0 ? (
        <div className="card p-12 text-center text-gray-500">
          <span className="text-6xl mb-4 block">⭐</span>
          <p>No reviews yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className={`card p-4 ${review.hidden ? 'opacity-60' : ''}`}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-gray-900">{review.user?.name || 'Anonymous'}</span>
                    <span className="text-yellow-400">{'★'.repeat(review.rating)}</span>
                    <span className="text-xs text-gray-400">{new Date(review.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p className="text-sm text-gray-500 mb-1">on <span className="font-medium text-gray-700">{review.product?.name}</span></p>
                  <p className="text-gray-600">{review.text}</p>
                </div>
                <div className="flex gap-2 ml-4 shrink-0">
                  <button onClick={() => updateVisibility(review.id, !review.hidden)}
                    className={`text-sm ${review.hidden ? 'text-green-600 hover:text-green-800' : 'text-yellow-600 hover:text-yellow-800'}`}>
                    {review.hidden ? 'Show' : 'Hide'}
                  </button>
                  <button onClick={() => handleDelete(review.id)} className="text-sm text-red-600 hover:text-red-800">Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
