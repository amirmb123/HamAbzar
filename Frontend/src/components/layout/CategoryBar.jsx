import { CATEGORY_ICONS, DEFAULT_CATEGORY_ICON } from "../../utils/categoryIcons";

export default function CategoryBar({ categories, activeCategoryId, onSelect }) {
  return (
    <div className="no-scrollbar flex gap-2 overflow-x-auto border-b border-gray-200 bg-white px-6 py-2.5">
      <button
        onClick={() => onSelect(null)}
        className={`flex min-w-[70px] shrink-0 flex-col items-center gap-1 whitespace-nowrap rounded-xl border px-3.5 py-2 text-xs transition ${
          activeCategoryId === null
            ? "border-primary-600 bg-primary-50 font-medium text-primary-600"
            : "border-gray-100 bg-white text-gray-500 hover:border-primary-100 hover:text-primary-600"
        }`}
      >
        <i className="fa-solid fa-border-all text-[20px]" />
        همه
      </button>

      {categories.map((cat) => (
        <button
          key={cat.id}
          onClick={() => onSelect(cat.id)}
          className={`flex min-w-[70px] shrink-0 flex-col items-center gap-1 whitespace-nowrap rounded-xl border px-3.5 py-2 text-xs transition ${
            activeCategoryId === cat.id
              ? "border-primary-600 bg-primary-50 font-medium text-primary-600"
              : "border-gray-100 bg-white text-gray-500 hover:border-primary-100 hover:text-primary-600"
          }`}
        >
          <i className={`${CATEGORY_ICONS[cat.id] || DEFAULT_CATEGORY_ICON} text-[20px]`} />
          {cat.name}
        </button>
      ))}
    </div>
  );
}
