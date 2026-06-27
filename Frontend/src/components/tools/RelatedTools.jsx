import { Link } from "react-router-dom";
import { formatPrice } from "../../utils/format";

export default function RelatedTools({ tools, status }) {
  if (status === "loading") {
    return (
      <div className="grid grid-cols-3 gap-2.5">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="skeleton-shimmer h-32 rounded-lg" />
        ))}
      </div>
    );
  }
  if (status === "error" || !tools?.length) return null;

  return (
    <div>
      <h2 className="mb-2.5 mt-5 text-lg font-medium text-gray-900">ابزارهای مشابه</h2>
      <div className="grid grid-cols-3 gap-2.5">
        {tools.map((tool) => (
          <Link
            key={tool.id}
            to={`/tools/${tool.id}`}
            className="overflow-hidden rounded-lg border border-gray-200 bg-white transition hover:border-primary-100"
          >
            <div className="flex h-[90px] items-center justify-center bg-gray-50 text-[28px] text-gray-500 opacity-60">
              <i className="fa-solid fa-toolbox" />
            </div>
            <div className="px-2.5 py-2">
              <div className="mb-0.5 truncate text-xs font-medium text-gray-900">{tool.name}</div>
              <div className="text-[11px] text-primary-600">{formatPrice(tool.daily_price)}/روز</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
