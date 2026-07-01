import { Link } from "react-router-dom";

export default function DetailHeader({ categoryName, toolName }) {
  return (
    <header className="flex h-14 items-center justify-between gap-3 border-b border-gray-200 bg-white px-4 sm:px-6">
      <Link to="/" className="flex shrink-0 items-center gap-2 text-[15px] font-medium text-gray-900">
        <div className="flex h-7 w-7 items-center justify-center rounded-[7px] bg-primary-600">
          <i className="fa-solid fa-screwdriver-wrench text-[13px] text-white" />
        </div>
        <span className="hidden sm:inline">هم‌ابزار</span>
      </Link>

      <div className="hidden min-w-0 flex-1 items-center gap-1.5 truncate text-xs text-gray-500 md:flex">
        <Link to="/" className="shrink-0 hover:text-gray-900">
          خانه
        </Link>
        <i className="fa-solid fa-chevron-left shrink-0 text-[10px]" />
        <span className="shrink-0">{categoryName}</span>
        <i className="fa-solid fa-chevron-left shrink-0 text-[10px]" />
        <span className="truncate text-gray-900">{toolName}</span>
      </div>

      <Link
        to="/"
        className="flex shrink-0 items-center gap-1.5 rounded-md border border-gray-200 px-2.5 py-1.5 text-sm text-gray-500 hover:text-gray-900 sm:px-3"
      >
        <i className="fa-solid fa-arrow-right" />
        <span className="hidden sm:inline">بازگشت به لیست</span>
      </Link>
    </header>
  );
}
