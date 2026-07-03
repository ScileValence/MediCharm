// src/components/ui/Skeleton.jsx

// Content-shaped loading placeholders — calmer and more informative
// than a center-page spinner, since the shape previews what's about
// to appear. Spinners are kept for short indeterminate actions
// (button submits); page/list loads use these instead.

export function SkeletonLine({ width = "100%", height = "0.9rem", className = "" }) {
  return (
    <div
      className={`skeleton ${className}`}
      style={{ width, height }}
    />
  );
}

export function SkeletonCard() {
  return (
    <div className="card p-3 mb-3">
      <div className="d-flex align-items-center gap-3">
        <div className="skeleton" style={{ width: 48, height: 48, borderRadius: "50%", flexShrink: 0 }} />
        <div className="flex-grow-1">
          <SkeletonLine width="40%" height="1rem" className="mb-2" />
          <SkeletonLine width="65%" height="0.8rem" />
        </div>
      </div>
    </div>
  );
}

export function SkeletonCardList({ count = 3 }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </>
  );
}

export function SkeletonTableRows({ columns = 4, rows = 4 }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, r) => (
        <tr key={r}>
          {Array.from({ length: columns }).map((_, c) => (
            <td key={c}>
              <SkeletonLine width={c === 0 ? "30%" : "70%"} />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}
