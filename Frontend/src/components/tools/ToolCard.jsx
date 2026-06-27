import { formatPrice, formatDistance, formatRating } from "../../utils/format";

export default function ToolCard({ tool, isActive, onHover, onSelect }) {
  const { name, category, daily_price, deposit_amount, is_available, distance_km, owner, thumbnail } =
    tool;

  return (
    <div
      onMouseEnter={() => onHover?.(tool.id)}
      onMouseLeave={() => onHover?.(null)}
      onClick={() => onSelect?.(tool)}
      className={`mb-3 cursor-pointer overflow-hidden rounded-lg border bg-white transition ${
        is_available ? "" : "opacity-70"
      } ${
        isActive
          ? "border-primary-100 shadow-md -translate-y-px"
          : "border-gray-200 hover:border-primary-100 hover:shadow-md hover:-translate-y-px"
      }`}
    >
      {/* تصویر */}
      <div className="relative flex h-[168px] items-center justify-center overflow-hidden bg-gray-100">
        {thumbnail ? (
          <img src={thumbnail} alt={name} className="h-full w-full object-cover" />
        ) : (
          <i className="fa-solid fa-toolbox text-[52px] text-gray-300 opacity-40" />
        )}

        <div className="absolute right-2.5 top-2.5">
          {is_available ? (
            <span className="flex items-center gap-1 rounded-full bg-primary-50 px-2 py-0.5 text-xs font-medium text-primary-600">
              <i className="fa-solid fa-circle text-[6px]" /> موجود
            </span>
          ) : (
            <span className="flex items-center gap-1 rounded-full bg-danger-50 px-2 py-0.5 text-xs font-medium text-danger-600">
              <i className="fa-solid fa-circle text-[6px]" /> رزرو شده
            </span>
          )}
        </div>

        <button
          onClick={(e) => e.stopPropagation()}
          className="absolute left-2.5 top-2.5 flex h-[30px] w-[30px] items-center justify-center rounded-full border border-gray-200 bg-white text-sm text-gray-500 transition hover:border-red-400 hover:text-red-500"
          aria-label="افزودن به علاقه‌مندی‌ها"
        >
          <i className="fa-regular fa-heart" />
        </button>
      </div>

      {/* بدنه */}
      <div className="px-4 py-3">
        <div className="mb-1 flex items-start justify-between">
          <span className="flex-1 text-md font-medium leading-tight text-gray-900">{name}</span>
          <div className="mr-2 flex items-center gap-1 whitespace-nowrap text-sm text-gray-900">
            <i className="fa-solid fa-star text-[12px] text-amber-500" />
            <strong>{formatRating(owner.rating)}</strong>
          </div>
        </div>

        <div className="mb-2 flex items-center gap-1 text-xs text-gray-500">{category.name}</div>

        <div className="mb-3 flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <i className="fa-solid fa-location-dot text-[12px]" />
            {formatDistance(distance_km)}
          </div>
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <i className="fa-regular fa-user text-[12px]" />
            {owner.full_name}
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-gray-100 pt-3">
          <div>
            <div className="text-[15px] font-semibold text-gray-900">
              {formatPrice(daily_price)} <span className="text-xs font-normal text-gray-500">/ روز</span>
            </div>
            <div className="mt-0.5 text-xs text-gray-500">ودیعه: {formatPrice(deposit_amount)}</div>
          </div>
          {is_available ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSelect?.(tool);
              }}
              className="whitespace-nowrap rounded-md bg-primary-600 px-3.5 py-1.5 text-sm font-medium text-white transition hover:bg-primary-700"
            >
              رزرو کن
            </button>
          ) : (
            <button
              onClick={(e) => e.stopPropagation()}
              className="whitespace-nowrap rounded-md bg-gray-100 px-3.5 py-1.5 text-sm font-medium text-gray-500 transition hover:bg-gray-200"
            >
              اطلاع‌رسانی
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
