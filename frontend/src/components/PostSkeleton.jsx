export default function PostSkeleton({ alt = false }) {
  return (
    <div
      className={`flex gap-4 p-5 border-b border-base-300 ${alt ? "bg-base-200" : "bg-base-100"}`}
    >
      <div className="flex flex-col items-center gap-2 pt-1 shrink-0">
        <div className="skeleton w-8 h-8 rounded"></div>
        <div className="skeleton w-6 h-4 rounded"></div>
        <div className="skeleton w-8 h-8 rounded"></div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-3">
          <div className="skeleton w-9 h-9 rounded-full"></div>
          <div className="skeleton h-4 w-24 rounded"></div>
          <div className="skeleton h-4 w-16 rounded"></div>
        </div>
        <div className="skeleton h-4 w-full rounded mb-2"></div>
        <div className="skeleton h-4 w-2/3 rounded mb-4"></div>
        <div className="skeleton h-5 w-16 rounded"></div>
      </div>
    </div>
  );
}
