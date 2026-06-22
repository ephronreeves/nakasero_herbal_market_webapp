import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';

export default function ProductQuickView({ product, onClose }) {
  const [imgIndex, setImgIndex] = useState(0);

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  if (!product) return null;

  const images = product.images || [];
  const currentImg = images[imgIndex];
  const hasDiscount = product.discountPrice && product.discountPrice < product.price;
  const savings = hasDiscount ? Math.round((1 - product.discountPrice / product.price) * 100) : 0;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto glass-strong rounded-2xl p-0" style={{ animation: 'fadeScaleIn 0.2s ease-out' }}>
        <button onClick={onClose} className="absolute top-3 right-3 z-10 w-8 h-8 flex items-center justify-center glass rounded-full text-gray-500 hover:text-gray-800">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="flex flex-col md:flex-row">
          <div className="md:w-1/2 bg-gray-100/50 flex items-center justify-center relative">
            {currentImg ? (
              <img src={currentImg.url} alt={product.name} className="w-full h-64 md:h-80 object-cover" />
            ) : (
              <span className="text-6xl text-gray-300">🌿</span>
            )}
            {images.length > 1 && (
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                {images.map((_, i) => (
                  <button key={i} onClick={() => setImgIndex(i)}
                    className={`w-2 h-2 rounded-full transition-all ${i === imgIndex ? 'bg-primary-600 w-4' : 'bg-white/60'}`} />
                ))}
              </div>
            )}
            {hasDiscount && (
              <span className="absolute top-3 left-3 bg-red-500/80 backdrop-blur-sm text-white text-xs font-bold px-2.5 py-1 rounded-full">
                -{savings}%
              </span>
            )}
          </div>

          <div className="md:w-1/2 p-5 flex flex-col gap-3">
            <p className="text-xs text-gray-500 uppercase tracking-wider">{product.vendor?.storeName}</p>
            <h2 className="text-lg font-bold text-gray-900 leading-snug">{product.name}</h2>

            <div className="flex items-center gap-3">
              <span className="text-2xl font-bold text-primary-600">UGX {product.discountPrice || product.price}</span>
              {hasDiscount && (
                <span className="text-sm text-gray-400 line-through">UGX {product.price}</span>
              )}
            </div>

            {product.averageRating > 0 && (
              <p className="text-sm text-gray-500">
                {product.averageRating.toFixed(1)} ⭐
                {product._count?.reviews > 0 && <span className="ml-1">({product._count.reviews} reviews)</span>}
              </p>
            )}

            <div className="flex items-center gap-2 text-xs">
              <span className={`px-2 py-0.5 rounded-full font-medium ${
                product.availabilityStatus === 'IN_STOCK' ? 'bg-green-100/80 text-green-700' :
                product.availabilityStatus === 'OUT_OF_STOCK' ? 'bg-red-100/80 text-red-700' :
                'bg-gray-100/80 text-gray-600'
              }`}>
                {product.availabilityStatus === 'IN_STOCK' ? 'In Stock' :
                 product.availabilityStatus === 'OUT_OF_STOCK' ? 'Out of Stock' : 'Discontinued'}
              </span>
              {product.stockQuantity > 0 && product.availabilityStatus === 'IN_STOCK' && (
                <span className="text-gray-400">{product.stockQuantity} units</span>
              )}
            </div>

            {product.shortDescription && (
              <p className="text-sm text-gray-600 leading-relaxed">{product.shortDescription}</p>
            )}

            {product.ingredients && (
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-0.5">Ingredients</p>
                <p className="text-sm text-gray-600">{product.ingredients}</p>
              </div>
            )}

            {product.weight && (
              <p className="text-xs text-gray-400">Weight: {product.weight}{product.weightUnit || 'g'}</p>
            )}

            <div className="mt-auto pt-2 flex gap-2">
              <Link to={`/product/${product.slug}`} onClick={onClose}
                className="flex-1 btn-primary text-sm text-center">
                View Full Details
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
