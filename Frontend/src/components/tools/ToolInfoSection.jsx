import { toPersianDigits, formatRating } from "../../utils/format";

export default function ToolInfoSection({ tool, reviewsCount }) {
  const { name, address, category, views_count, owner, description, specs } = tool;

  return (
    <div>
      <h1 className="mb-1.5 break-words text-xl font-medium text-gray-900 sm:text-2xl">{name}</h1>

      <div className="mb-3.5 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1 text-xs text-gray-500">
          <i className="fa-solid fa-location-dot" />
          {address}
        </div>
        <div className="flex items-center gap-1 text-xs text-gray-500">
          <i className="fa-solid fa-layer-group" />
          {category.name}
        </div>
        {typeof views_count === "number" && (
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <i className="fa-regular fa-eye" />
            {toPersianDigits(views_count)} بازدید
          </div>
        )}
        <div className="flex items-center gap-1.5 text-sm text-gray-900">
          <span className="text-amber-500">★★★★★</span>
          <strong>{formatRating(owner.rating)}</strong>
          {typeof reviewsCount === "number" && (
            <span className="text-gray-500">({toPersianDigits(reviewsCount)} نظر)</span>
          )}
        </div>
      </div>

      {description && (
        <>
          <h2 className="mb-2.5 mt-5 text-lg font-medium text-gray-900">توضیحات</h2>
          <p className="whitespace-pre-line break-words text-base leading-7 text-gray-500">{description}</p>
        </>
      )}

      {specs?.length > 0 && (
        <>
          <h2 className="mb-2.5 mt-5 text-lg font-medium text-gray-900">مشخصات فنی</h2>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {specs.map((spec) => (
              <div key={spec.label} className="rounded-md bg-gray-50 px-3 py-2.5">
                <div className="mb-0.5 text-xs text-gray-500">{spec.label}</div>
                <div className="break-words text-base font-medium text-gray-900">{spec.value}</div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
