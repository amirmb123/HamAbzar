const TYPE_STYLES = {
  new_listing: "bg-primary-50 text-primary-600",
  listing_edit: "bg-primary-50 text-primary-600",
  report: "bg-[#FDE8E8] text-[#B91C1C]",
  support_ticket: "bg-info-50 text-info-600",
};

export default function PendingApprovalsList({ items }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5">
      <div className="mb-2 flex items-center justify-between text-md font-semibold text-gray-900">
        در انتظار بررسی
        <a href="#" className="text-xs font-normal text-primary-600">
          مشاهده همه
        </a>
      </div>

      {items.map((item, idx) => (
        <div
          key={item.id}
          className={`flex items-center gap-3 py-3 ${idx < items.length - 1 ? "border-b border-gray-100" : ""}`}
        >
          <div
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-sm ${
              TYPE_STYLES[item.type] || "bg-gray-100 text-gray-500"
            }`}
          >
            <i className={item.icon} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-medium text-gray-900">{item.title}</div>
            <div className="text-xs text-gray-500">{item.subtitle}</div>
          </div>
          <button className="mr-auto shrink-0 rounded-md border border-gray-200 px-3 py-1.5 text-sm text-gray-900 transition hover:bg-gray-50">
            بررسی
          </button>
        </div>
      ))}
    </div>
  );
}
