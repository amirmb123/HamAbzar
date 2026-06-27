import { CATEGORY_ICONS, DEFAULT_CATEGORY_ICON } from "../../utils/categoryIcons";

export default function CategorySelectGrid({ categories, selectedId, onSelect }) {
  return (
    <div className="grid grid-cols-4 gap-2 sm:grid-cols-3">
      {categories.map((cat) => {
        const isSelected = selectedId === cat.id;
        return (
          <button
            key={cat.id}
            type="button"
            onClick={() => onSelect(cat.id)}
            className={`flex flex-col items-center gap-1.5 rounded-md border-[1.5px] p-3 text-center text-xs transition ${
              isSelected
                ? "border-primary-600 bg-primary-50 font-medium text-primary-600"
                : "border-gray-200 text-gray-500 hover:border-primary-100"
            }`}
          >
            <i className={`${CATEGORY_ICONS[cat.id] || DEFAULT_CATEGORY_ICON} text-xl`} />
            {cat.name}
          </button>
        );
      })}
    </div>
  );
}
