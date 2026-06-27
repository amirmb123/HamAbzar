export default function AdminTopbar({ title }) {
  return (
    <div className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b border-gray-200 bg-white px-6">
      <span className="text-lg font-semibold text-gray-900">{title}</span>

      <div className="relative max-w-[320px] flex-1">
        <i className="fa-solid fa-magnifying-glass absolute left-[12px] top-1/2 -translate-y-1/2 text-[13px] text-gray-400" />
        <input
          type="text"
          placeholder="جستجوی کاربر، ابزار یا رزرو..."
          className="w-full rounded-md border border-gray-200 bg-gray-50 py-2 pl-[34px] pr-3.5 text-sm outline-none transition focus:border-primary-600"
        />
      </div>

      <div className="mr-auto flex items-center gap-3">
        <button className="relative flex h-9 w-9 items-center justify-center rounded-md text-gray-500 hover:bg-gray-100">
          <i className="fa-regular fa-bell" />
          <div className="absolute right-[6px] top-[6px] h-[7px] w-[7px] rounded-full bg-danger-600" />
        </button>
        <button className="flex h-9 w-9 items-center justify-center rounded-md text-gray-500 hover:bg-gray-100">
          <i className="fa-regular fa-envelope" />
        </button>
      </div>
    </div>
  );
}
