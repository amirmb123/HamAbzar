export default function ToolCardSkeleton() {
  return (
    <div className="mb-3 overflow-hidden rounded-lg border border-gray-200 bg-white pb-3">
      <div className="skeleton-shimmer h-[140px] w-full" />
      <div className="skeleton-shimmer mx-4 mt-3 h-3.5 w-4/5 rounded-md" />
      <div className="skeleton-shimmer mx-4 mt-3 h-3.5 w-3/5 rounded-md" />
      <div className="skeleton-shimmer mx-4 mt-3 h-3.5 w-4/5 rounded-md" />
    </div>
  );
}
