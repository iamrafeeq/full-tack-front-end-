function SkeletonRow({ cols = 4 }) {
  return (
    <tr>
      {Array.from({ length: cols }, (_, i) => (
        <td key={i} className="px-4 py-3">
          <div
            className="skeleton-shimmer h-4 rounded"
            style={{ width: i === 0 ? "75%" : i % 3 === 0 ? "50%" : "65%" }}
          />
        </td>
      ))}
    </tr>
  );
}

export default SkeletonRow;
