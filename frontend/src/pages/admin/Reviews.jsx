import { useState, useEffect } from 'react';
import api from '../../lib/api';
import toast from 'react-hot-toast';

export default function AdminReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    loadReviews();
  }, []);

  const loadReviews = () => {
    setLoading(true);
    api.get('/admin/reviews')
      .then(({ data }) => setReviews(data.reviews || data || []))
      .catch(() => toast.error('Failed to load reviews'))
      .finally(() => setLoading(false));
  };

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

  const handleGenerateMock = async () => {
    if (!confirm('Generate mock reviews for all products? This will create sample reviews from existing customers.')) return;
    setGenerating(true);
    try {
      const { data } = await api.post('/admin/reviews/generate-mock');
      toast.success(data.message || `Generated ${data.count} mock reviews`);
      loadReviews();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to generate mock reviews');
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div></div>;
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Review Moderation</h1>
        <button onClick={handleGenerateMock} disabled={generating}
          className="btn-secondary text-sm flex items-center gap-2 self-start">
          <span>{generating ? '⏳' : '✨'}</span>
          {generating ? 'Generating...' : 'Generate Mock Reviews'}
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="card p-4">
          <p className="text-sm text-gray-500">Total Reviews</p>
          <p className="text-2xl font-bold text-gray-900">{reviews.length}</p>
        </div>
        <div className="card p-4">
          <p className="text-sm text-gray-500">Visible</p>
          <p className="text-2xl font-bold text-green-700">{reviews.filter((r) => !r.hidden && r.isApproved !== false).length}</p>
        </div>
        <div className="card p-4">
          <p className="text-sm text-gray-500">Hidden / Pending</p>
          <p className="text-2xl font-bold text-red-700">{reviews.filter((r) => r.hidden || r.isApproved === false).length}</p>
        </div>
      </div>

      {reviews.length === 0 ? (
        <div className="card p-12 text-center text-gray-500">
          <span className="text-6xl mb-4 block">⭐</span>
          <p className="text-lg font-medium mb-2">No reviews yet</p>
          <p className="text-sm">Click "Generate Mock Reviews" to add sample reviews.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => {
            const isHidden = review.hidden || review.isApproved === false;
            return (
              <div key={review.id} className={`card p-4 sm:p-5 ${isHidden ? 'opacity-60' : ''}`}>
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="font-medium text-gray-900">{review.user?.firstName ? `${review.user.firstName} ${review.user.lastName || ''}` : 'Anonymous'}</span>
                      <span className="text-yellow-400">{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</span>
                      <span className="text-xs text-gray-400">{new Date(review.createdAt).toLocaleDateString()}</span>
                      {isHidden && <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded">Hidden</span>}
                    </div>
                    <p className="text-sm text-gray-500 mb-1 truncate">on <span className="font-medium text-gray-700">{review.product?.name || 'Unknown Product'}</span></p>
                    <p className="text-gray-600 break-words">{review.comment || review.text || ''}</p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button onClick={() => updateVisibility(review.id, !isHidden)}
                      className={`text-sm px-3 py-1.5 rounded border transition-colors ${isHidden ? 'text-green-600 border-green-200 hover:bg-green-50' : 'text-yellow-600 border-yellow-200 hover:bg-yellow-50'}`}>
                      {isHidden ? 'Show' : 'Hide'}
                    </button>
                    <button onClick={() => handleDelete(review.id)}
                      className="text-sm px-3 py-1.5 rounded border border-red-200 text-red-600 hover:bg-red-50 transition-colors">Delete</button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
