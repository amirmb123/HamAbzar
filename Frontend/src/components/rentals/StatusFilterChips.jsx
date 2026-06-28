const STATUS_FILTERS = [
  { value: null, label: "همه" },
  { value: "pending", label: "در انتظار تأیید" },
  { value: "confirmed", label: "تأیید شده" },
  { value: "active", label: "فعال" },
  { value: "returned", label: "تکمیل‌شده" },
  { value: "disputed", label: "در حال بررسی" },
  { value: "cancelled", label: "لغوشده" },
];

export default function StatusFilterChips({ activeFilter, onChange }) {
  return (
    <div className="mb-5 flex flex-wrap gap-2">
      {STATUS_FILTERS.map((filter) => (
        <button
          key={filter.label}
          onClick={() => onChange(filter.value)}
          className={`rounded-full border px-3.5 py-1.5 text-sm transition ${
            activeFilter === filter.value
              ? "border-gray-900 bg-gray-900 text-white"
              : "border-gray-200 bg-white text-gray-500 hover:border-gray-300"
          }`}
        >
          {filter.label}
        </button>
      ))}
    </div>
  );
}