function SkeletonCard({ lines = 3, hasImage = false, className = "" }) {
  return (
    <div className={`bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden ${className}`}>
      {hasImage && <div className="skeleton-shimmer h-48 w-full" />}
      <div className="p-5 space-y-3">
        <div className="skeleton-shimmer h-5 rounded w-3/4" />
        {Array.from({ length: lines - 1 }, (_, i) => (
          <div
            key={i}
            className="skeleton-shimmer h-4 rounded"
            style={{ width: `${62 - i * 12}%` }}
          />
        ))}
        <div className="skeleton-shimmer h-4 rounded w-1/3" />
      </div>
    </div>
  );
}

export default SkeletonCard;
