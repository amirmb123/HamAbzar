const FILTER_CHIPS = [
  { key: "city", icon: "fa-solid fa-location-dot", label: "تهران", hasChevron: true },
  { key: "category", icon: "fa-solid fa-layer-group", label: "همه دسته‌ها", hasChevron: true },
  { key: "price", icon: "fa-solid fa-coins", label: "قیمت روزانه", hasChevron: true },
  { key: "date", icon: "fa-regular fa-calendar-check", label: "تاریخ دسترسی", hasChevron: true },
];

const TOGGLE_CHIPS = [
  { key: "top_rated", icon: "fa-solid fa-star", label: "امتیاز بالا" },
  { key: "fast_delivery", icon: "fa-solid fa-bolt", label: "تحویل سریع" },
  { key: "guaranteed", icon: "fa-solid fa-shield-halved", label: "تضمین‌دار" },
  { key: "recent", icon: "fa-regular fa-clock", label: "تازه‌ثبت" },
];

export default function FilterBar({ activeFilters, onToggle }) {
  return (
    <div className="no-scrollbar flex h-[52px] items-center gap-2 overflow-x-auto border-b border-gray-200 bg-white px-6">
      {FILTER_CHIPS.map((chip) => (
        <button
          key={chip.key}
          onClick={() => onToggle(chip.key)}
          className={`flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-md border px-3 py-1.5 text-sm transition ${
            activeFilters[chip.key]
              ? "border-primary-600 bg-primary-50 font-medium text-primary-600"
              : "border-gray-200 bg-white text-gray-900 hover:border-primary-600 hover:text-primary-600"
          }`}
        >
          <i className={chip.icon} />
          {chip.label}
          {chip.hasChevron && <i className="fa-solid fa-chevron-down text-[11px] text-gray-400" />}
        </button>
      ))}

      <div className="h-6 w-px shrink-0 bg-gray-200" />

      {TOGGLE_CHIPS.map((chip) => (
        <button
          key={chip.key}
          onClick={() => onToggle(chip.key)}
          className={`flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-md border px-3 py-1.5 text-sm transition ${
            activeFilters[chip.key]
              ? "border-primary-600 bg-primary-50 font-medium text-primary-600"
              : "border-gray-200 bg-white text-gray-900 hover:border-primary-600 hover:text-primary-600"
          }`}
        >
          <i className={chip.icon} />
          {chip.label}
        </button>
      ))}
    </div>
  );
}
