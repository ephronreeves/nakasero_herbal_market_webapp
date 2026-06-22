import { useState } from 'react';

export default function SafeImage({ src, alt, className, fallback = '🌿', fallbackClass = '' }) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div className={`flex items-center justify-center bg-gray-100/70 ${className || ''}`}>
        <span className={`text-gray-300 ${fallbackClass || 'text-4xl'}`}>{fallback}</span>
      </div>
    );
  }

  return (
    <img src={src} alt={alt} className={className} onError={() => setFailed(true)} />
  );
}
